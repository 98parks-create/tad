import React from 'react';
import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="card" style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>개인정보처리방침</h1>
      <div style={{ lineHeight: '1.6', color: '#334155', whiteSpace: 'pre-wrap' }}>
        1. 수집하는 개인정보 항목
        - 필수항목: 이름, 이메일 주소, 비밀번호
        - 선택항목: 회사명(상호), 전화번호, 직인 이미지, 파트너사(고객사) 정보 및 견적 내역
        
        2. 개인정보의 수집 및 이용 목적
        - 회원 가입 및 서비스 제공
        - 견적서 작성 및 출력(PDF 생성) 보조
        - 구독 결제 정보 확인 및 청구
        
        3. 개인정보의 보유 및 해지 (파기 절차)
        - 원칙적으로 회원 탈퇴 시 지체 없이 파기합니다.
        - 단, 전자상거래법 등 관련 법령에 의하여 보존할 의무가 있는 경우 해당 기간 동안 보관합니다.
        
        4. 개인정보의 위탁
        - 원활한 서비스 제공을 위해 아래와 같이 개인정보 처리 업무를 위탁하고 있습니다.
        - 수탁자: Google Firebase (데이터베이스 및 인증 내역 저장)
        - 수탁자: Vercel / 기타 호스팅 사 (웹 서버 호스팅)
        
        (추후 구체적인 방침 내용은 사업자 등록 후 보강하여 업데이트하시기 바랍니다.)
      </div>
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button className="btn btn-outline" onClick={() => window.history.back()}>뒤로 가기</button>
      </div>
    </div>
  );
}
