import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calculator, FileText, BarChart3, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Header / Navbar */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 36, height: 36, backgroundColor: 'var(--primary-color)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>T</span>
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-dark)' }}>TAD B2B</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login" className="btn btn-outline" style={{ textDecoration: 'none' }}>로그인</Link>
          <Link to="/signup" className="btn btn-primary" style={{ textDecoration: 'none' }}>무료 회원가입</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '6rem 2rem', textAlign: 'center', background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', lineHeight: 1.2 }}>
          비즈니스 성장의 시작, <br />
          <span style={{ color: 'var(--primary-color)' }}>스마트한 통합 견적 관리</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '700px', margin: '0 auto 3rem auto', lineHeight: 1.6 }}>
          복잡한 실사출력 및 간판/자재 견적 계산부터 발주서 다운로드까지. <br />
          TAD B2B 플랫폼에서 언제 어디서나 정확하고 빠른 견적을 고객에게 제시하세요.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            지금 바로 견적 시작하기 <ArrowRight size={20} />
          </button>
          <p style={{ fontSize: '1rem', color: '#475569', margin: 0 }}>
            <strong>원터치 견적관리</strong>와 <strong>견적내역 모두 관리</strong>가 가능합니다.
          </p>
        </div>
      </section>

      {/* Feature Section */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', flex: 1 }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '3rem', color: '#1e293b' }}>
          모든 B2B 기업을 위한 핵심 기능
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>

          <div style={{ padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: 48, height: 48, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Calculator size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: '#0f172a' }}>초정밀 자동 계산</h3>
            <p style={{ color: '#64748b', lineHeight: 1.6, margin: 0 }}>가로/세로 길이만 입력하면 자체 단가표에 기반하여 즉시 최소 수량과 헤베(제곱미터) 단위로 완벽하게 계산합니다.</p>
          </div>

          <div style={{ padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: 48, height: 48, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <FileText size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: '#0f172a' }}>원클릭 PDF 견적서</h3>
            <p style={{ color: '#64748b', lineHeight: 1.6, margin: 0 }}>번거로운 워드 작업 없이, 작성한 모든 견적 항목과 규격이 포함된 전문적인 견적서를 단 1초 만에 PDF로 렌더링합니다.</p>
          </div>

          <div style={{ padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: 48, height: 48, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <BarChart3 size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: '#0f172a' }}>견적 히스토리 관리</h3>
            <p style={{ color: '#64748b', lineHeight: 1.6, margin: 0 }}>클라이언트와 협의한 과거의 모든 견적 내역과 대시보드 통계를 중앙 시스템에서 한눈에 조회할 수 있습니다.</p>
          </div>

          <div style={{ padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: 48, height: 48, backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: '#0f172a' }}>안전한 데이터 보안</h3>
            <p style={{ color: '#64748b', lineHeight: 1.6, margin: 0 }}>Firebase 기반의 최고 수준 클라우드 보안 환경과 독립된 계정 시스템으로 귀사의 소중한 데이터를 보호합니다.</p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#0f172a', padding: '3rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
        <h4 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 700 }}>TAD B2B 솔루션</h4>
        <p style={{ marginBottom: '2rem' }}>광고 제작 비즈니스의 미래 모델. 더 빠르고 편리한 업무 인프라를 경험하세요.</p>
        <p style={{ fontSize: '0.85rem' }}>&copy; {new Date().getFullYear()} TAD B2B Inc. All rights reserved.</p>
      </footer>

    </div>
  );
}
