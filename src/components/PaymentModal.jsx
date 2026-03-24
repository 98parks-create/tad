import React, { useState } from 'react';
import { X, CreditCard, CheckCircle } from 'lucide-react';

export default function PaymentModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: input, 2: processing, 3: success
  const [formData, setFormData] = useState({
    depositorName: ''
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
              <h2 style={{ fontSize: '1.3rem', margin: '0 0 0.5rem 0', color: '#1e293b' }}>무통장 입금 / 간편송금</h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>PRO 요금제 (월 19,900원)</p>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #e2e8f0', fontSize: '0.9rem', lineHeight: '1.5' }}>
              <strong style={{ color: '#1e293b', display: 'block', marginBottom: '0.5rem' }}>입금 안내</strong>
              <div style={{ marginBottom: '0.8rem', paddingBottom: '0.8rem', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', display: 'inline-block', width: '60px' }}>은행: </span> <span style={{ color: '#0f172a', fontWeight: 500 }}>우리은행 1002-056-783054</span><br/>
                <span style={{ color: '#64748b', display: 'inline-block', width: '60px' }}>예금주: </span> <span style={{ color: '#0f172a', fontWeight: 500 }}>박XX</span>
              </div>
              <div>
                <span style={{ display: 'block', color: '#64748b', marginBottom: '0.3rem' }}>빠른 간편송금 (링크 복사):</span>
                <span style={{ color: '#4f46e5', fontWeight: 500, wordBreak: 'break-all' }}>https://toss.me/tossid</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.85rem' }}>입금자명 확인</label>
                <input
                  type="text"
                  placeholder="입금하신 분의 성함을 입력해주세요"
                  required
                  value={formData.depositorName}
                  onChange={(e) => setFormData({ ...formData, depositorName: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%', padding: '0.8rem', fontSize: '1.05rem', backgroundColor: '#4f46e5' }}>
                입금 확인 요청하기
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
            <h2 style={{ fontSize: '1.4rem', color: '#166534', margin: '0 0 1rem 0' }}>요청 완료!</h2>
            <p style={{ color: '#475569', lineHeight: '1.5', margin: 0 }}>
              관리자가 입금 내역을 확인하는 대로<br />즉시 PRO 요금제로 전환됩니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
