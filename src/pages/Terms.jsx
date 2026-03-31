import React from 'react';
import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="card" style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>서비스 이용약관</h1>
      <div style={{ lineHeight: '1.8', color: '#334155', fontSize: '0.95rem' }}>
        <section style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-dark)', marginBottom: '0.8rem' }}>제 1조 (목적)</h3>
          <p style={{ margin: 0 }}>
            본 약관은 TAD B2B(이하 "회사")가 제공하는 견적서 자동화 및 관련 서비스의 이용과 관련하여, 회사와 회원 간의 권리, 의무, 책임사항 및 기타 필요한 사항을 규정함을 목적으로 합니다.
          </p>
        </section>
        
        <section style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-dark)', marginBottom: '0.8rem' }}>제 2조 (유료 서비스 및 환불 규정)</h3>
          <ul style={{ paddingLeft: '1.5rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>회사는 무료 요금제(FREE)와 유료 요금제(PRO)를 제공합니다.</li>
            <li>유료 요금제는 정기결제 방식으로 제공되며, 결제 후 서비스 이용 내역이 없는 경우 결제일로부터 7일 이내 전액 환불이 가능합니다. 단, 결제 후 5건 이상의 견적서를 발행하였거나 서비스의 유료 기능을 일부라도 사용한 경우 환불이 제한될 수 있습니다.</li>
          </ul>
        </section>
        
        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-dark)', marginBottom: '0.8rem' }}>제 3조 (서비스 중단)</h3>
          <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
            <li>회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</li>
          </ul>
        </section>

        <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '8px', fontSize: '0.9rem', color: '#64748b', textAlign: 'center' }}>
          (추후 구체적인 약관 내용은 사업자 등록 후 보강하여 업데이트하시기 바랍니다.)
        </div>
      </div>
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button className="btn btn-outline" onClick={() => window.history.back()}>뒤로 가기</button>
      </div>
    </div>
  );
}
