import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUpgradeRequests, approveUpgrade } from '../services/adminService';
import { CheckCircle } from 'lucide-react';

const ADMIN_EMAILS = ['inseopark7@naver.com', import.meta.env.VITE_ADMIN_EMAIL];

export default function Admin() {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>[관리자] 멤버십 업그레이드 요청 관리</h2>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-light)' }}>
              <th style={{ padding: '1rem 0.5rem' }}>신청일시</th>
              <th style={{ padding: '1rem 0.5rem' }}>계정 이메일</th>
              <th style={{ padding: '1rem 0.5rem' }}>입금자명</th>
              <th style={{ padding: '1rem 0.5rem' }}>상태</th>
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
                    <td style={{ padding: '1rem 0.5rem', fontSize: '0.9rem' }}>{reqDate}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>{req.email || '-'}</td>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 'bold' }}>{req.depositorName}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span style={{ 
                        padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', 
                        backgroundColor: req.status === 'approved' ? '#dcfce3' : '#fef3c7', 
                        color: req.status === 'approved' ? '#166534' : '#92400e' 
                      }}>
                        {req.status === 'approved' ? '승인완료' : '대기중'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                      {req.status === 'pending' && (
                        <button className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#059669', borderColor: '#059669', padding: '0.3rem 0.6rem', fontSize: '0.85rem' }} onClick={() => handleApprove(req)}>
                          <CheckCircle size={16} /> 승인하기
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
