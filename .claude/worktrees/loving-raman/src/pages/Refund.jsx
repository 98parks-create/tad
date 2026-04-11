import React, { useEffect } from 'react';

export default function Refund() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>환불규정</h2>
      <div className="card" style={{ padding: '2rem', lineHeight: '1.8', color: '#334155' }}>
        <p><strong>제1조 (환불의 원칙)</strong><br />
        1. 태드스마트견적(TAD)은 사용자가 결제한 프리미엄 서비스(Pro 요금제 등)에 대해 관련 법령에 따른 환불 규정을 준수합니다.<br />
        2. 환불 금액은 결제 수수료 및 기 사용 기간에 비례한 금액을 공제한 후 산정됩니다. 단, 결제 수일 이내 미사용 상태에서의 환불은 전액 환불을 원칙으로 합니다.
        </p>

        <p style={{ marginTop: '1.5rem' }}><strong>제2조 (전액 환불)</strong><br />
        결제일로부터 7일 이내에 단 한 번도 프리미엄 기능(무제한 견적, 직인, 엑셀 다운로드 등)을 사용하지 않은 경우 고객센터를 통해 전액 환불을 요청하실 수 있습니다.
        </p>

        <p style={{ marginTop: '1.5rem' }}><strong>제3조 (부분 환불)</strong><br />
        1. 결제일로부터 7일이 경과하거나, 7일 이내라도 프리미엄 기능을 1회 이상 사용한 경우에는 월 결제액에서 서비스 이용일수 및 총 결제금액의 10%에 해당하는 위약금을 공제한 잔여 금액을 환불합니다.<br />
        2. 산식: [결제금액 - (이용일수 × 일일 요금) - (결제금액 × 10%)]
        </p>

        <p style={{ marginTop: '1.5rem' }}><strong>제4조 (환불 절차)</strong><br />
        환불은 카카오톡 고객센터(채널) 혹은 이메일(inseopark7@naver.com)을 통해 요청하실 수 있으며, 요청 접수 후 영업일 기준 3~5일 이내에 처리됩니다. 환불 완료 시까지 해당 계정의 프리미엄 권한은 유지되거나 즉시 회수될 수 있습니다.
        </p>
      </div>
    </div>
  );
}
