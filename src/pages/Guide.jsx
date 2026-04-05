import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, MousePointer2, Edit3, Send, ArrowRight } from 'lucide-react';

export default function Guide() {
  const navigate = useNavigate();

  const steps = [
    {
      title: "Step 1: 회사 정보 기입",
      description: "내 회사의 로고와 직인을 등록하세요. 한 번만 등록하면 모든 견적서에 자동으로 박힙니다.",
      icon: <Settings size={32} />,
      image: "/images/guide/step1.png",
      color: "var(--primary-color)",
      bg: "rgba(59, 130, 246, 0.1)"
    },
    {
      title: "Step 2: 항목 선택",
      description: "내 세트에서 1초 만에 소환! 필요한 자재들을 리스트에서 터치 한 번으로 불러오세요.",
      icon: <MousePointer2 size={32} />,
      image: "/images/guide/step2.png",
      color: "var(--accent-color)",
      bg: "rgba(16, 185, 129, 0.1)"
    },
    {
      title: "Step 3: 금액 수정",
      description: "현장 상황에 맞게 톡톡 수정! 수량과 단가를 자유롭게 조정하여 최종 금액을 확인하세요.",
      icon: <Edit3 size={32} />,
      image: "/images/guide/step3.png",
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.1)"
    },
    {
      title: "Step 4: PDF 전송",
      description: "버튼 눌러 저장 및 카톡 공유! 완성된 견적서를 PDF로 저장하고 고객에게 즉시 전달하세요.",
      icon: <Send size={32} />,
      image: "/images/guide/step4.png",
      color: "var(--success-color)",
      bg: "rgba(34, 197, 94, 0.1)"
    }
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '2.5rem', color: '#0f172a', marginBottom: '1.2rem', fontWeight: 800, letterSpacing: '-1px' }}>
          TAD 시작하기: <span style={{ color: 'var(--primary-color)' }}>딱 1분 완성 가이드</span>
        </h2>
        <p style={{ fontSize: '1.25rem', color: '#64748b', fontWeight: 500, lineHeight: 1.6 }}>
          현장의 노하우를 담은 가장 빠른 견적 솔루션,<br />
          아래 단계를 따라 스마트하게 시작해 보세요.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {steps.map((step, index) => (
          <div key={index} className="card" style={{ 
            display: 'flex', 
            flexDirection: window.innerWidth < 768 ? 'column' : (index % 2 === 0 ? 'row' : 'row-reverse'),
            gap: '2.5rem', 
            alignItems: 'center',
            padding: '2.5rem',
            borderRadius: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ 
                width: 64, 
                height: 64, 
                backgroundColor: step.bg, 
                color: step.color, 
                borderRadius: '16px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: '1.5rem' 
              }}>
                {step.icon}
              </div>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: '#1e293b', fontWeight: 800 }}>{step.title}</h3>
              <p style={{ fontSize: '1.15rem', color: '#475569', lineHeight: 1.7, margin: 0 }}>
                {step.description}
              </p>
            </div>
            <div style={{ flex: 1.2, width: '100%' }}>
              <img 
                src={step.image} 
                alt={step.title} 
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  display: 'block'
                }} 
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '5rem', padding: '4rem 2rem', backgroundColor: '#f8fafc', borderRadius: '32px' }}>
        <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>준비가 되셨나요?</h3>
        <button 
          onClick={() => navigate('/create')} 
          className="btn btn-primary btn-bounce" 
          style={{ 
            padding: '1.25rem 3rem', 
            fontSize: '1.25rem', 
            fontWeight: 700,
            borderRadius: '16px',
            boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.5)'
          }}
        >
          지금 바로 첫 견적 작성하기 <ArrowRight size={24} style={{ marginLeft: '0.5rem' }} />
        </button>
      </div>
    </div>
  );
}
