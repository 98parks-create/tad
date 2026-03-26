import React from 'react';
import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="card" style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>서비스 이용약관</h1>
      <div style={{ lineHeight: '1.6', color: '#334155', whiteSpace: 'pre-wrap' }}>
        제 1조 (목적)
        본 약관은 TAD B2B(이하 "회사")가 제공하는 견적서 자동화 및 관련 서비스의 이용과 관련하여, 회사와 회원 간의 권리, 의무, 책임사항 및 기타 필요한 사항을 규정함을 목적으로 합니다.
        
        제 2조 (유료 서비스 및 환불 규정)
        1. 회사는 무료 요금제(FREE)와 유료 요금제(PRO)를 제공합니다.
        2. 유료 요금제는 정기결제 방식으로 제공되며, 결제 후 서비스 이용 내역이 없는 경우 결제일로부터 7일 이내 전액 환불이 가능합니다. 단, 결제 후 5건 이상의 견적서를 발행하였거나 서비스의 유료 기능을 일부라도 사용한 경우 환불이 제한될 수 있습니다.
        
        제 3조 (서비스 중단)
        1. 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.
        
        (추후 구체적인 약관 내용은 사업자 등록 후 보강하여 업데이트하시기 바랍니다.)
      </div>
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button className="btn btn-outline" onClick={() => window.history.back()}>뒤로 가기</button>
      </div>
    </div>
  );
}
