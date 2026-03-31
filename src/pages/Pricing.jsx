import React, { useState } from 'react';
import { CheckCircle, ShieldCheck, Zap } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';

export default function Pricing() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '1rem', fontWeight: 800 }}>
          복잡한 건 빼고, 혜택만 담았습니다
        </h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-light)', fontWeight: 500 }}>
          커피 4잔 값으로 한 달 내내 스마트해지세요.
        </p>
      </div>

      <div className="card" style={{ border: '2px solid var(--primary-color)', borderRadius: '16px', padding: '3rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'var(--primary-color)', color: 'white', padding: '0.5rem 2rem', borderBottomLeftRadius: '16px', fontWeight: 'bold' }}>
          가장 인기있는 플랜
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Pro 무제한 플랜</h3>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary-color)' }}>
            월 19,900<span style={{ fontSize: '1.5rem', fontWeight: 500, color: 'var(--text-light)' }}>원</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '3rem', maxWidth: '400px', margin: '0 auto 3rem auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>
            <CheckCircle color="var(--success-color)" size={24} />
            <span>무제한 견적서 발행 (개수 제한 없음)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>
            <CheckCircle color="var(--success-color)" size={24} />
            <span>현장 사진 무제한 첨부 (PDF 자동 합성)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>
            <CheckCircle color="var(--success-color)" size={24} />
            <span>내 도장/로고 등록 (전문가용 견적서 완성)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>
            <CheckCircle color="var(--success-color)" size={24} />
            <span>국세청 홈택스 엑셀 자동 생성 (세무업무 90% 단축)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>
            <CheckCircle color="var(--success-color)" size={24} />
            <span>고객 관리 DB 자동 저장 (재구매 유도)</span>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', maxWidth: '400px', padding: '1.2rem', fontSize: '1.2rem', fontWeight: 700, borderRadius: '12px' }}
            onClick={() => setShowPaymentModal(true)}
          >
            지금 바로 전문가의 도구 시작하기
          </button>
          <p style={{ marginTop: '1.5rem', color: 'var(--text-light)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={18} /> 약정 없음, 언제든 해지 가능합니다.
          </p>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal 
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false);
            alert("PRO 승인 요청이 접수되었습니다! 관리자가 입금 내역을 확인한 후 빠르게 승인 처리해 드릴 예정입니다.");
          }}
        />
      )}
    </div>
  );
}
