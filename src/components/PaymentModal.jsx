import React, { useState } from 'react';
import { X, CreditCard, CheckCircle } from 'lucide-react';

export default function PaymentModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: input, 2: processing, 3: success
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setStep(2);
    // Simulate payment processing
    setTimeout(() => {
      setStep(3);
      if (onSuccess) {
        setTimeout(onSuccess, 2000); // Trigger success callback after showing checkmark
      }
    }, 1500);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '90%', position: 'relative', animation: 'fadeIn 0.3s ease-out' }}>
        {step !== 2 && step !== 3 && (
          <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="#64748b" />
          </button>
        )}

        {step === 1 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', backgroundColor: '#e0e7ff', borderRadius: '50%', marginBottom: '1rem' }}>
                <CreditCard size={24} color="#4f46e5" />
              </div>
              <h2 style={{ fontSize: '1.3rem', margin: '0 0 0.5rem 0', color: '#1e293b' }}>안전결제</h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>PRO 요금제 (월 19,900원)</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.85rem' }}>카드 번호</label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  required
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                  maxLength="19"
                  style={{ letterSpacing: '1px' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.85rem' }}>유효기간</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    required
                    value={formData.expiry}
                    onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                    maxLength="5"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.85rem' }}>CVC</label>
                  <input
                    type="text"
                    placeholder="123"
                    required
                    value={formData.cvc}
                    onChange={(e) => setFormData({ ...formData, cvc: e.target.value })}
                    maxLength="4"
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.85rem' }}>카드 소유자 이름 (선택)</label>
                <input
                  type="text"
                  placeholder="홍길동"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', padding: '0.8rem', fontSize: '1.05rem', backgroundColor: '#4f46e5' }}>
                19,900원 결제하기
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <h3 style={{ marginTop: '1.5rem', color: '#1e293b' }}>결제를 진행 중입니다...</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>화면을 닫거나 새로고침하지 마세요.</p>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', backgroundColor: '#dcfce3', borderRadius: '50%', marginBottom: '1.5rem' }}>
              <CheckCircle size={32} color="#16a34a" />
            </div>
            <h2 style={{ fontSize: '1.4rem', color: '#166534', margin: '0 0 1rem 0' }}>결제 완료!</h2>
            <p style={{ color: '#475569', lineHeight: '1.5', margin: 0 }}>
              성공적으로 PRO 요금제로 <br />업그레이드 되었습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
