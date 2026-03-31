import React, { useState } from 'react';
import { MessageCircle, FileText, HelpCircle, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate();

  const faqs = [
    {
      q: '도장이 견적서에 안 나와요.',
      a: '좌측 메뉴의 [설정 (회사정보)] 메뉴에서 도장(직인) 이미지를 한 번만 등록하시면 모든 견적서에 자동 날인됩니다!'
    },
    {
      q: '현장 사진은 어떻게 넣나요?',
      a: '견적 작성 페이지 최하단의 [증빙 사진 첨부] 버튼을 눌러보세요. 현장에서 스마트폰으로 바로 찍어 올릴 수 있습니다.'
    },
    {
      q: '기기를 바꿨는데 데이터가 남아있나요?',
      a: '네, 계정 기반으로 안전하게 격리 저장되어 어디서든 로그인만 하시면 예전 데이터를 확인하실 수 있습니다.'
    }
  ];

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '180px', zIndex: 9999 }}>
      {isOpen ? (
        <div style={{ 
          position: 'absolute', 
          bottom: '60px', 
          right: '0', 
          width: '320px', 
          backgroundColor: '#fff', 
          borderRadius: '16px', 
          boxShadow: '0 10px 40px rgba(0, 8, 58, 0.15)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>고객지원 센터</h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', opacity: 0.9 }}>사장님 곁엔 항상 태드가 있습니다.</p>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0.2rem' }}>
              <X size={20} />
            </button>
          </div>

          <div style={{ padding: '1rem', flex: 1, overflowY: 'auto', maxHeight: '400px' }}>
            <h4 style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '0.8rem', paddingTop: '0.5rem' }}>자주 묻는 질문 (FAQ)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {faqs.map((faq, index) => (
                <div key={index} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <button 
                    style={{ width: '100%', padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: openFaq === index ? '#f8fafc' : '#fff', border: 'none', textAlign: 'left', cursor: 'pointer', fontWeight: 600, color: 'var(--text-dark)' }}
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span><span style={{color: 'var(--primary-color)', marginRight:'5px'}}>Q.</span>{faq.q}</span>
                    {openFaq === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openFaq === index && (
                    <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: '0.95rem', color: '#475569', lineHeight: 1.5 }}>
                      <span style={{color: 'var(--accent-color)', fontWeight: 'bold', marginRight:'5px'}}>A.</span>{faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <h4 style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '0.8rem' }}>바로가기 및 상담</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button 
                className="btn btn-outline" 
                style={{ justifyContent: 'flex-start', padding: '0.8rem 1rem', borderWidth: '1px', fontSize: '0.95rem', color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
                onClick={() => {
                  setIsOpen(false);
                  navigate('/guide');
                }}
              >
                <FileText size={18} /> 3분 완성 이용가이드
              </button>
              
              <a 
                href="https://open.kakao.com/me/tadparks" 
                target="_blank" 
                rel="noreferrer"
                className="btn" 
                style={{ justifyContent: 'flex-start', padding: '0.8rem 1rem', background: '#FEE500', color: '#3A1D1D', fontWeight: 600, fontSize: '0.95rem' }}
                onClick={() => setIsOpen(false)}
              >
                <MessageCircle size={18} /> 카카오톡 1:1 상담원 연결
              </a>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 8, 58, 0.3)',
            cursor: 'pointer',
            border: 'none',
            transition: 'transform 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <HelpCircle size={28} />
        </button>
      )}
    </div>
  );
}
