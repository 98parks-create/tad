import React, { useState } from 'react';
import { BarChart2, Sparkles, X } from 'lucide-react';

export default function AiReport({ quotes = [] }) {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [report, setReport] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const now = new Date();
  const month = `${now.getFullYear()}년 ${now.getMonth() + 1}월`;

  const monthlyQuotes = quotes.filter(q => {
    if (!q.createdAt) return false;
    const d = q.createdAt.toDate ? q.createdAt.toDate() : new Date(q.createdAt);
    if (isNaN(d.getTime())) return false;
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  const handleGenerate = async () => {
    if (monthlyQuotes.length === 0) {
      setError('이번 달 견적 데이터가 없습니다.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai/report', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ quotes: monthlyQuotes, month })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReport(data.report);
      setStats(data.stats);
      setIsOpen(true);
    } catch (e) {
      setError(e.message || '리포트 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem' }}>
        <button
          className="btn btn-outline"
          onClick={handleGenerate}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: '#0891b2', color: '#0891b2' }}
        >
          <BarChart2 size={16} />
          {loading ? 'AI 분석 중...' : 'AI 월간 리포트'}
        </button>
        {error && (
          <span style={{ color: '#dc2626', fontSize: '0.82rem' }}>{error}</span>
        )}
      </div>

      {isOpen && report && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '90%', maxWidth: '640px', maxHeight: '88vh', overflowY: 'auto', padding: '2rem' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0891b2' }}>
                <Sparkles size={22} /> {month} AI 분석 리포트
              </h3>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}>
                <X size={24} />
              </button>
            </div>

            {stats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem', marginBottom: '1.5rem' }}>
                {[
                  { label: '총 견적', value: `${stats.total}건`, color: '#0891b2' },
                  { label: '완료', value: `${stats.completed}건`, color: '#059669' },
                  { label: '완료 매출', value: `${(stats.totalRevenue || 0).toLocaleString()}원`, color: '#7c3aed' },
                  { label: '견적 평균', value: `${(stats.avgTotal || 0).toLocaleString()}원`, color: '#d97706' },
                ].map(s => (
                  <div key={s.label} style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.78rem', color: s.color, fontWeight: 600, marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>{s.value}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ backgroundColor: '#f0f9ff', padding: '1.5rem', borderRadius: '8px', lineHeight: '1.85', whiteSpace: 'pre-wrap', fontSize: '0.93rem', color: '#1e293b', border: '1px solid #bae6fd' }}>
              {report}
            </div>

            {stats?.topProjects?.length > 0 && (
              <div style={{ marginTop: '1.2rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.7rem' }}>상위 프로젝트</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {stats.topProjects.map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.9rem', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '0.88rem' }}>
                      <span style={{ color: '#475569' }}>
                        <span style={{ fontWeight: 700, color: '#0891b2', marginRight: '0.4rem' }}>#{i + 1}</span>
                        {p.project} ({p.customer})
                      </span>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{(p.total || 0).toLocaleString()}원</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
