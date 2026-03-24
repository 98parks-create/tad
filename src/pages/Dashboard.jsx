import React, { useEffect, useState } from 'react';
import { getQuotes } from '../services/quoteService';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getQuotes(currentUser.uid);
        let total = data.length;
        let pending = data.filter(q => q.status === 'pending').length;
        let completed = data.filter(q => q.status === 'completed' || q.status === 'approved').length;
        setStats({ total, pending, completed });
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
        setError("Firebase 데이터베이스에 연결할 수 없습니다. 설정을 확인해주세요.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>대시보드</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>시스템 전체 견적 현황입니다.</p>
        
        {error && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>{error}</div>}

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>데이터를 통계 분석 중입니다...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1.5rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', borderLeft: '4px solid var(--accent-color)' }}>
              <h4 style={{ color: 'var(--accent-color)', margin: '0 0 0.5rem 0' }}>전체 발급 견적 건수</h4>
              <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>{stats.total} <span style={{fontSize: '1rem', fontWeight: 500}}>건</span></p>
            </div>
            
            <div style={{ padding: '1.5rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', borderLeft: '4px solid var(--success-color)' }}>
              <h4 style={{ color: 'var(--success-color)', margin: '0 0 0.5rem 0' }}>승인/계약 완료</h4>
              <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>{stats.completed} <span style={{fontSize: '1rem', fontWeight: 500}}>건</span></p>
            </div>
            
            <div style={{ padding: '1.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', borderLeft: '4px solid var(--danger-color)' }}>
              <h4 style={{ color: 'var(--danger-color)', margin: '0 0 0.5rem 0' }}>대기/보류 중</h4>
              <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>{stats.pending} <span style={{fontSize: '1rem', fontWeight: 500}}>건</span></p>
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>시스템 사용 안내</h3>
        <ul style={{ color: 'var(--text-light)', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
          <li>좌측 메뉴의 <strong>[새 견적 작성]</strong>을 통해 고객 정보 및 자재 규격을 입력하면 견적 금액이 자동 산출됩니다.</li>
          <li>입력된 견적은 PDF 파일로 즉시 출력하거나 인쇄할 수 있습니다.</li>
          <li>견적은 Firebase 연동을 통해 클라우드에 안전하게 보관됩니다. <code>src/firebase.js</code> 파일 내에서 본인의 Firebase 설정값을 입력 후 사용하세요.</li>
        </ul>
      </div>
    </div>
  );
}
