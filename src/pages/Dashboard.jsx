import React, { useEffect, useState } from 'react';
import { getQuotes } from '../services/quoteService';
import { getProfile } from '../services/profileService';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, monthlyRevenue: 0 });
  const [quotesData, setQuotesData] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getQuotes(currentUser.uid);
        setQuotesData(data);
        let total = data.length;
        let pending = data.filter(q => q.status === 'pending').length;

        // 상태값이 'completed', 'approved', 또는 한글 '승인완료'인 경우 모두 포함
        let completedQuotes = data.filter(q =>
          q.status === 'completed' || q.status === 'approved' || q.status === '승인완료'
        );
        let completed = completedQuotes.length;

        // 현재 년도와 월 계산
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        let monthlyRevenue = completedQuotes
          .filter(q => {
            if (!q.customerInfo?.date) return false;
            // 날짜 문자열의 점(.)을 하이픈(-)으로 바꿔서 Date 객체 인식률 향상
            const quoteDate = new Date(q.customerInfo.date.replace(/\./g, '-'));
            return (
              !isNaN(quoteDate) &&
              quoteDate.getFullYear() === currentYear &&
              quoteDate.getMonth() === currentMonth
            );
          })
          .reduce((sum, q) => {
            // grandTotal이 문자열일 경우 숫자로 변환 (콤마 제거 포함)
            const val = typeof q.grandTotal === 'string'
              ? Number(q.grandTotal.replace(/[^0-9.-]+/g, ""))
              : Number(q.grandTotal || 0);
            return sum + val;
          }, 0);

        setStats({ total, pending, completed, monthlyRevenue });

        try {
          const profileData = await getProfile(currentUser.uid);
          setProfile(profileData || { subscriptionPlan: 'free' });
        } catch (e) { console.error("Profile fetch error in dashboard", e); }

      } catch (err) {
        console.error("Failed to load dashboard stats", err);
        setError("Firebase 데이터베이스에 연결할 수 없습니다. 설정을 확인해주세요.");
      } finally {
        setLoading(false);
      }
    };
    if (currentUser?.uid) {
      fetchStats();
    }
  }, [currentUser?.uid]);

  const getRemainingDays = (dateString) => {
    if (!dateString) return null;
    const diff = new Date(dateString) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div>
      {profile && (
        <div className="card" style={{
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: profile.subscriptionPlan === 'pro' ? '#f0fdf4' : '#f8fafc',
          borderLeft: profile.subscriptionPlan === 'pro' ? '4px solid #16a34a' : '4px solid #94a3b8'
        }}>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.2rem' }}>
              현재 이용 중인 멤버십: <span style={{ color: profile.subscriptionPlan === 'pro' ? '#16a34a' : '#64748b' }}>{profile.subscriptionPlan === 'pro' ? '👑 PRO 요금제 (무제한)' : '무료 요금제 (월 3건 제한)'}</span>
            </h3>
            {profile.subscriptionPlan === 'pro' && profile.proExpiresAt ? (
              <p style={{ margin: 0, color: '#475569', fontSize: '1rem' }}>
                만료/재결제 예정일: <strong style={{ color: '#ef4444' }}>{new Date(profile.proExpiresAt).toLocaleDateString()}</strong>
                <span style={{ marginLeft: '0.5rem', fontWeight: 600, color: '#ef4444' }}>(D-{getRemainingDays(profile.proExpiresAt)})</span>
              </p>
            ) : profile.subscriptionPlan === 'pro' ? (
              <p style={{ margin: 0, color: '#475569', fontSize: '1rem' }}>기존 베타 혜택으로 <strong style={{ color: '#16a34a' }}>영구 무제한</strong> 이용 중입니다.</p>
            ) : (
              <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>월 9,900원으로 무제한 발급 기능을 맘껏 이용해 보세요!</p>
            )}
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
          <button 
            onClick={() => setActiveTab('home')}
            style={{ 
              background: 'none', border: 'none', fontSize: '1.2rem', fontWeight: activeTab === 'home' ? 800 : 500, 
              color: activeTab === 'home' ? '#1d4ed8' : '#64748b', cursor: 'pointer', padding: '0.5rem 1rem',
              borderBottom: activeTab === 'home' ? '3px solid #1d4ed8' : 'none'
            }}
          >
            {t('dashboard.tabs.home')}
          </button>
          <button 
            onClick={() => setActiveTab('collection')}
            style={{ 
              background: 'none', border: 'none', fontSize: '1.2rem', fontWeight: activeTab === 'collection' ? 800 : 500, 
              color: activeTab === 'collection' ? '#1d4ed8' : '#64748b', cursor: 'pointer', padding: '0.5rem 1rem',
              borderBottom: activeTab === 'collection' ? '3px solid #1d4ed8' : 'none'
            }}
          >
            {t('dashboard.tabs.collection')}
          </button>
        </div>

        {error && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>{error}</div>}

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>데이터를 가져오는 중입니다...</div>
        ) : activeTab === 'home' ? (
          <>
            <h2 style={{ marginBottom: '1rem' }}>대시보드</h2>
            <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>시스템 전체 견적 현황입니다.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1.5rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', borderLeft: '4px solid var(--accent-color)' }}>
                <h4 style={{ color: 'var(--accent-color)', margin: '0 0 0.5rem 0' }}>전체 발급 견적 건수</h4>
                <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>{stats.total} <span style={{ fontSize: '1rem', fontWeight: 500 }}>건</span></p>
              </div>

              <div style={{ padding: '1.5rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', borderLeft: '4px solid var(--success-color)' }}>
                <h4 style={{ color: 'var(--success-color)', margin: '0 0 0.5rem 0' }}>승인/계약 완료</h4>
                <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>{stats.completed} <span style={{ fontSize: '1rem', fontWeight: 500 }}>건</span></p>
              </div>

              <div style={{ padding: '1.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', borderLeft: '4px solid var(--danger-color)' }}>
                <h4 style={{ color: 'var(--danger-color)', margin: '0 0 0.5rem 0' }}>대기/보류 중</h4>
                <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>{stats.pending} <span style={{ fontSize: '1rem', fontWeight: 500 }}>건</span></p>
              </div>

              <div style={{ padding: '2rem 1.5rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', borderLeft: '4px solid #f59e0b', gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                <h4 style={{ color: '#d97706', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>이번 달 확정 매출 (승인 완료 기준)</h4>
                <p style={{ fontSize: '3rem', fontWeight: 800, margin: 0, color: 'var(--text-dark)' }}>{stats.monthlyRevenue.toLocaleString()} <span style={{ fontSize: '1.2rem', fontWeight: 500 }}>원</span></p>
              </div>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
              <h3 style={{ marginBottom: '1rem' }}>시스템 사용 안내</h3>
              <ul style={{ color: 'var(--text-light)', lineHeight: '1.8', paddingLeft: '1.5rem', marginBottom: '2rem' }}>
                <li>좌측 메뉴의 <strong>[새 견적 작성]</strong>을 통해 고객 정보 및 자재 규격을 입력하면 견적 금액이 자동 산출됩니다.</li>
                <li>입력된 견적은 PDF 파일로 즉시 출력하거나 인쇄할 수 있습니다.</li>
                <li>대기 중인 견적서에서 <strong>[입금/승인 완료]</strong> 버튼을 누르면 매출 통계에 즉시 반영됩니다.</li>
              </ul>
            </div>
          </>
        ) : (
          <CollectionTab quotesData={quotesData} getRemainingDays={getRemainingDays} t={t} />
        )}
      </div>
    </div>
  );
}

function CollectionTab({ quotesData, getRemainingDays, t }) {
  const unpaidQuotes = quotesData.filter(q => q.status !== 'completed' && q.status !== 'approved' && q.status !== '승인완료');
  
  const totalUnpaid = unpaidQuotes.reduce((sum, q) => {
    const val = typeof q.grandTotal === 'string' ? Number(q.grandTotal.replace(/[^0-9.-]+/g, "")) : Number(q.grandTotal || 0);
    return sum + val;
  }, 0);

  const handleRemindClick = (quoteId) => {
    alert(t('dashboard.collection.remindSuccess'));
    // 나중에 실제 API 호출 로직이 들어갈 곳
    // fetch('/api/send-alimtalk', { method: 'POST', body: JSON.stringify({ quoteId }) });
  };

  return (
    <div>
      <h2 style={{ marginBottom: '0.5rem' }}>{t('dashboard.collection.totalUnpaid')}</h2>
      <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>{t('dashboard.collection.unpaidSubtitle')}</p>
      
      <div style={{ padding: '2rem 1.5rem', backgroundColor: '#fef2f2', borderRadius: '8px', borderLeft: '4px solid #ef4444', marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '3rem', fontWeight: 800, margin: 0, color: '#991b1b' }}>{totalUnpaid.toLocaleString()} <span style={{ fontSize: '1.2rem', fontWeight: 500 }}>원</span></p>
      </div>

      {unpaidQuotes.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
          {t('dashboard.collection.noPending')}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', color: '#475569' }}>{t('dashboard.collection.name')}</th>
                <th style={{ padding: '1rem', color: '#475569' }}>{t('dashboard.collection.amount')}</th>
                <th style={{ padding: '1rem', color: '#475569' }}>{t('dashboard.collection.dueDate')}</th>
                <th style={{ padding: '1rem', color: '#475569' }}>{t('dashboard.collection.action')}</th>
              </tr>
            </thead>
            <tbody>
              {unpaidQuotes.map(q => {
                const dueDate = q.customerInfo?.paymentDueDate;
                let isOverdue = false;
                if (dueDate) {
                  const diff = new Date(dueDate) - new Date();
                  isOverdue = diff < 0;
                }
                
                return (
                  <tr key={q.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{q.customerInfo?.company || q.customerInfo?.name || '-'}</td>
                    <td style={{ padding: '1rem', color: '#0f172a', fontWeight: 700 }}>{typeof q.grandTotal === 'string' ? q.grandTotal : Number(q.grandTotal).toLocaleString()}원</td>
                    <td style={{ padding: '1rem' }}>
                      {dueDate ? (
                        <span style={{ color: isOverdue ? '#ef4444' : '#64748b', fontWeight: isOverdue ? 700 : 500 }}>
                          {dueDate} {isOverdue && <span style={{ backgroundColor: '#fee2e2', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', marginLeft: '0.5rem' }}>{t('dashboard.collection.overdue')}</span>}
                        </span>
                      ) : (
                        <span style={{ color: '#cbd5e1' }}>미설정</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button 
                        onClick={() => handleRemindClick(q.id)}
                        style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        {t('dashboard.collection.remind')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}