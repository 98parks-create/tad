import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUpgradeRequests, approveUpgrade, cancelUpgrade, migrateLegacyProUsers } from '../services/adminService';
import { getProfile } from '../services/profileService';
import { CheckCircle } from 'lucide-react';

const ADMIN_EMAILS = ['inseopark7@naver.com', import.meta.env.VITE_ADMIN_EMAIL];

export default function Admin() {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const isAdmin = ADMIN_EMAILS.includes(currentUser?.email);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    
    const fetchRequests = async () => {
      try {
        const data = await getUpgradeRequests();
        setRequests(data);
      } catch (err) {
        console.error("Failed to fetch upgrade requests", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [isAdmin]);

  const handleApprove = async (request) => {
    if (window.confirm(`${request.depositorName} 님의 PRO 업그레이드 요청을 승인하시겠습니까?`)) {
      try {
        await approveUpgrade(request.id, request.uid);
        setRequests(requests.map(r => r.id === request.id ? { ...r, status: 'approved' } : r));
        alert("승인 완료! 사용자가 PRO 요금제로 변경되었습니다.");
      } catch (err) {
        console.error("Approval failed", err);
        alert("승인 중 오류가 발생했습니다.");
      }
    }
  };

  const handleViewDetails = async (uid, email, depositorName, requestId, status) => {
    setLoadingProfile(true);
    setSelectedUser({ uid, email, depositorName, requestId, status, loading: true });
    try {
      const profile = await getProfile(uid);
      setSelectedUser({ uid, email, depositorName, requestId, status, profile, loading: false });
    } catch (err) {
      console.error(err);
      alert("프로필 정보를 불러오지 못했습니다.");
      setSelectedUser(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleCancelMembership = async () => {
    if (!selectedUser || selectedUser.status !== 'approved') return;
    if (window.confirm(`${selectedUser.depositorName} 님의 PRO 멤버십을 즉시 해지하고 무료 요금제로 강등하시겠습니까?\n(환불 처리는 외부 채널을 통해 별도로 진행하셔야 합니다)`)) {
      try {
        await cancelUpgrade(selectedUser.requestId, selectedUser.uid);
        setRequests(requests.map(r => r.id === selectedUser.requestId ? { ...r, status: 'cancelled' } : r));
        alert("멤버십 해지가 완료되었습니다.");
        setSelectedUser(null);
      } catch (err) {
        console.error(err);
        alert("해지 처리 중 오류가 발생했습니다.");
      }
    }
  };

  const handleMigrate = async () => {
    if (window.confirm('기존의 무제한 승인 회원들에게 모두 일괄적으로 [오늘부터 30일 뒤]를 만료 기한으로 적용하시겠습니까?')) {
      try {
        const count = await migrateLegacyProUsers();
        alert(`성공! 총 ${count}명의 기존 회원에게 30일 만료 기한이 적용되었습니다.`);
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert('데이터 일괄 적용 중 오류가 발생했습니다.');
      }
    }
  };

  if (loading) return <div className="card">불러오는 중...</div>;

  if (!isAdmin) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>접근 권한이 없습니다.</h2>
        <p style={{ color: '#64748b' }}>이 페이지는 관리자만 접근할 수 있습니다.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>[관리자] 멤버십 업그레이드 요청 관리</h2>
        <button className="btn btn-outline" style={{ fontSize: '0.85rem', color: '#64748b', borderColor: '#cbd5e1' }} onClick={handleMigrate}>
          기존 승인회원 30일 만료 일괄 적용
        </button>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-light)' }}>
              <th style={{ padding: '1rem 0.5rem' }}>신청일시</th>
              <th style={{ padding: '1rem 0.5rem' }}>계정 이메일</th>
              <th style={{ padding: '1rem 0.5rem' }}>입금자명</th>
              <th style={{ padding: '1rem 0.5rem' }}>상태 및 기간</th>
              <th style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-light)' }}>접수된 신청 내역이 없습니다.</td>
              </tr>
            ) : (
              requests.map(req => {
                const reqDate = req.timestamp ? new Date(req.timestamp.seconds * 1000).toLocaleString() : '최근 신청됨';
                return (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 0.5rem', fontSize: '0.9rem' }}>
                      {reqDate}<br/>
                      {req.approvedAt && <span style={{fontSize: '0.8rem', color: '#059669'}}>(승인: {new Date(req.approvedAt).toLocaleDateString()})</span>}
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>{req.email || '-'}</td>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 'bold' }}>{req.depositorName}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div style={{ marginBottom: req.expiresAt ? '4px' : '0' }}>
                        <span style={{ 
                          padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', 
                          backgroundColor: req.status === 'approved' ? '#dcfce3' : (req.status === 'cancelled' ? '#fee2e2' : '#fef3c7'), 
                          color: req.status === 'approved' ? '#166534' : (req.status === 'cancelled' ? '#991b1b' : '#92400e') 
                        }}>
                          {req.status === 'approved' ? '승인완료' : (req.status === 'cancelled' ? '취소/해지됨' : '대기중')}
                        </span>
                      </div>
                      {req.expiresAt && req.status === 'approved' && (
                        <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 500 }}>
                          ~ {new Date(req.expiresAt).toLocaleDateString()} 까지
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                        {req.status === 'pending' && (
                          <button className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#059669', borderColor: '#059669', padding: '0.3rem 0.6rem', fontSize: '0.85rem' }} onClick={() => handleApprove(req)}>
                            <CheckCircle size={16} /> 승인하기
                          </button>
                        )}
                        <button className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }} onClick={() => handleViewDetails(req.uid, req.email, req.depositorName, req.id, req.status)}>
                          회원 정보
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={() => setSelectedUser(null)}>
          <div className="card" style={{ maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>회원 상세 정보</h3>
              <button className="btn-icon" onClick={() => setSelectedUser(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-light)' }}>✕</button>
            </div>
            
            {selectedUser.loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                {loadingProfile ? '정보를 불러오는 중...' : ''}
              </div>
            ) : selectedUser.profile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '1.2rem', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', color: '#0f172a' }}>기본 가입 정보</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0.5rem', fontSize: '0.95rem' }}>
                    <span style={{ color: 'var(--text-light)' }}>가입 이메일:</span>
                    <span style={{ fontWeight: 500 }}>{selectedUser.email || '-'}</span>
                    <span style={{ color: 'var(--text-light)' }}>입금자명:</span>
                    <span style={{ fontWeight: 500 }}>{selectedUser.depositorName || '-'}</span>
                    <span style={{ color: 'var(--text-light)' }}>현재 권한:</span>
                    <span style={{ fontWeight: 600, color: selectedUser.profile.subscriptionPlan === 'pro' ? '#059669' : '#475569' }}>
                      {selectedUser.profile.subscriptionPlan === 'pro' ? 'PRO 요금제' : '무료 요금제'}
                    </span>
                  </div>
                </div>

                <div style={{ border: '1px solid #e2e8f0', padding: '1.2rem', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', color: '#0f172a' }}>회사(사업자) 프로필 정보</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0.8rem', fontSize: '0.95rem' }}>
                    <span style={{ color: 'var(--text-light)' }}>회사명(상호):</span>
                    <span style={{ fontWeight: 500 }}>{selectedUser.profile.companyName || '-'}</span>
                    <span style={{ color: 'var(--text-light)' }}>대표자 성명:</span>
                    <span>{selectedUser.profile.ceoName || '-'}</span>
                    <span style={{ color: 'var(--text-light)' }}>사업자등록번호:</span>
                    <span>{selectedUser.profile.businessNumber || '-'}</span>
                    <span style={{ color: 'var(--text-light)' }}>연락처:</span>
                    <span>{selectedUser.profile.phone || '-'}</span>
                    <span style={{ color: 'var(--text-light)' }}>팩스번호:</span>
                    <span>{selectedUser.profile.fax || '-'}</span>
                    <span style={{ color: 'var(--text-light)' }}>이메일(세금):</span>
                    <span>{selectedUser.profile.email || '-'}</span>
                    <span style={{ color: 'var(--text-light)' }}>사업장 주소:</span>
                    <span style={{ lineHeight: '1.4' }}>{selectedUser.profile.address || '-'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
                해당 회원의 프로필 정보가 아직 등록되지 않았거나 찾을 수 없습니다.
              </div>
            )}
            
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setSelectedUser(null)} style={{ padding: '0.8rem 3rem' }}>닫기</button>
              {selectedUser.profile && selectedUser.profile.subscriptionPlan === 'pro' && selectedUser.status === 'approved' && (
                <button className="btn btn-primary" style={{ padding: '0.8rem 2rem', backgroundColor: '#ef4444', border: 'none' }} onClick={handleCancelMembership}>
                  멤버십 즉시 해지
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
