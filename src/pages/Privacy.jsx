import React from 'react';
import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="card" style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>개인정보처리방침</h1>
      <div style={{ lineHeight: '1.8', color: '#334155', fontSize: '0.95rem' }}>
        <section style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-dark)', marginBottom: '0.8rem' }}>1. 수집하는 개인정보 항목</h3>
          <ul style={{ paddingLeft: '1.5rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><b>필수항목:</b> 이름, 이메일 주소, 비밀번호</li>
            <li><b>선택항목:</b> 회사명(상호), 전화번호, 직인 이미지, 파트너사(고객사) 정보 및 견적 내역</li>
          </ul>
        </section>
        
        <section style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-dark)', marginBottom: '0.8rem' }}>2. 개인정보의 수집 및 이용 목적</h3>
          <ul style={{ paddingLeft: '1.5rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>회원 가입 및 서비스 제공</li>
            <li>견적서 작성 및 출력(PDF 생성) 보조</li>
            <li>구독 결제 정보 확인 및 청구</li>
          </ul>
        </section>
        
        <section style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-dark)', marginBottom: '0.8rem' }}>3. 개인정보의 보유 및 해지 (파기 절차)</h3>
          <ul style={{ paddingLeft: '1.5rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>원칙적으로 회원 탈퇴 시 지체 없이 파기합니다.</li>
            <li>단, 전자상거래법 등 관련 법령에 의하여 보존할 의무가 있는 경우 해당 기간 동안 보관합니다.</li>
          </ul>
        </section>
        
        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-dark)', marginBottom: '0.8rem' }}>4. 개인정보의 위탁</h3>
          <p style={{ margin: '0 0 0.5rem 0' }}>원활한 서비스 제공을 위해 아래와 같이 개인정보 처리 업무를 위탁하고 있습니다.</p>
          <ul style={{ paddingLeft: '1.5rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '1rem 1rem 1rem 2.5rem', borderRadius: '8px' }}>
            <li><b>수탁자:</b> Google Firebase (데이터베이스 및 인증 내역 저장)</li>
            <li><b>수탁자:</b> Vercel / 기타 호스팅 사 (웹 서버 호스팅)</li>
          </ul>
        </section>

        <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '8px', fontSize: '0.9rem', color: '#64748b', textAlign: 'center', lineHeight: '1.6' }}>
          <strong>태드스마트견적(TAD) 개인정보 관리책임자</strong><br/>
          대표자명: 박인서 | 사업자등록번호: 387-14-02824<br/>
          이메일: inseopark7@naver.com<br/>
          <br/>본 방침은 2026년 최신 기준으로 적용됩니다.
        </div>
      </div>
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button className="btn btn-outline" onClick={() => window.history.back()}>뒤로 가기</button>
      </div>
    </div>
  );
}
