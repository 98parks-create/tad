import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calculator,
  FileText,
  MousePointer2,
  Send,
  ArrowRight,
  Clock,
  AlertCircle,
  Smartphone,
  Quote,
  CheckCircle2
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const steps = [
    { name: "회사정보 기입", icon: <Calculator size={18} /> },
    { name: "세트 선택", icon: <MousePointer2 size={18} /> },
    { name: "단가 수정", icon: <FileText size={18} /> },
    { name: "PDF 전송", icon: <Send size={18} /> },
  ];

  const painPoints = [
    {
      title: "저녁 먹다 말고 사무실로 복귀할 때",
      icon: "❌",
      desc: "급한 견적 요청 때문에 식사도 못 마치고 사무실로 향하시나요?"
    },
    {
      title: "엑셀 칸 밀려서 계산기 다시 두드릴 때",
      icon: "❌",
      desc: "수식 하나 틀려서 하나하나 다시 검산하는 번거로움, 지겨우시죠?"
    },
    {
      title: "고객이 \"견적서 언제 오냐\"고 재촉할 때",
      icon: "❌",
      desc: "현장에서 바로 답을 주지 못해 신뢰를 잃을까 걱정되진 않으신가요?"
    }
  ];

  const stats = [
    { label: "누적 견적 발행", value: "12,482건+" },
    { label: "절약된 사장님들의 시간", value: "4,500시간+" },
    { label: "전국 제휴 업체", value: "150개소 돌파" }
  ];

  const partnerLogos = ["AD Tech", "Sign Design", "Interior Pro", "TAD Partners", "Smart Build", "Global Sign", "Creative AD"];

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#1e293b' }}>

      {/* Navbar */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.25rem 2rem',
        backgroundColor: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, backgroundColor: '#1d4ed8', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 900, fontSize: '1.4rem' }}>T</span>
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-1px' }}>TAD</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login" style={{ textDecoration: 'none', color: '#475569', fontWeight: 600, padding: '0.5rem 1rem' }}>로그인</Link>
          <Link to="/signup" className="btn btn-primary" style={{ textDecoration: 'none', padding: '0.5rem 1.25rem' }}>무료 가입</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '6rem 2rem', maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: window.innerWidth < 992 ? '1fr' : '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
        <div style={{ textAlign: window.innerWidth < 992 ? 'center' : 'left' }}>
          <h1 style={{ fontSize: '3.8rem', fontWeight: 900, color: '#1d4ed8', marginBottom: '1.5rem', lineHeight: 1.1, letterSpacing: '-2px' }}>
            엑셀/수기로 <br />
            견적서 쓰던 시대는 <br />
            <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.8em' }}>끝났습니다.</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#475569', marginBottom: '2.5rem', lineHeight: 1.6, fontWeight: 500 }}>
            현장을 아는 사람이 만든 단 하나의 솔루션.<br />
            복잡한 계산은 태드가, 사장님은 비즈니스에만 집중하세요.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', backgroundColor: '#f1f5f9', padding: '1.5rem', borderRadius: '24px', marginBottom: '3rem', justifyContent: window.innerWidth < 992 ? 'center' : 'flex-start' }}>
            {steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#64748b', fontSize: '0.95rem' }}>
                <span style={{ color: '#1d4ed8' }}>{step.icon}</span> {step.name}
                {i < steps.length - 1 && <ArrowRight size={14} style={{ opacity: 0.3 }} />}
              </div>
            ))}
          </div>

          <button onClick={() => navigate('/signup')} className="btn-bounce" style={{
            backgroundColor: '#1d4ed8',
            color: 'white',
            border: 'none',
            padding: '1.5rem 3rem',
            fontSize: '1.4rem',
            fontWeight: 800,
            borderRadius: '20px',
            cursor: 'pointer',
            boxShadow: '0 20px 30px -10px rgba(29, 78, 216, 0.4)',
            transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            지금 무료로 견적 내기
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {/* iPhone Mockup Container */}
          <div style={{
            width: '320px',
            height: '650px',
            backgroundColor: '#000',
            borderRadius: '50px',
            padding: '12px',
            boxShadow: '0 50px 100px -20px rgba(0,0,0,0.3)',
            position: 'relative',
            border: '8px solid #1e293b'
          }}>
            <div style={{ position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)', width: '80px', height: '25px', backgroundColor: '#000', borderRadius: '0 0 15px 15px', zIndex: 10 }}></div>
            <div style={{ width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: '38px', overflow: 'hidden' }}>
              <video
                autoPlay
                loop
                muted
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              >
                <source src="/tadone.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section style={{ padding: '8rem 2rem', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '4rem', letterSpacing: '-1px' }}>
            사장님들, <span style={{ color: '#ef4444' }}>이런 상황 </span>겪어보셨죠?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr 1fr', gap: '2rem' }}>
            {painPoints.map((point, i) => (
              <div key={i} style={{ backgroundColor: 'white', padding: '3rem 2rem', borderRadius: '32px', boxShadow: '0 10px 20px -10px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>{point.icon}</div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.4 }}>{point.title}</h3>
                <p style={{ color: '#64748b', lineHeight: 1.6 }}>{point.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '5rem', backgroundColor: '#1d4ed8', color: 'white', padding: '2.5rem', borderRadius: '32px', display: 'inline-block' }}>
            <p style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
              "TAD라면 현장에서 카톡 전송까지 딱 <span style={{ color: '#fbbf24' }}>3번 클릭</span>이면 충분합니다."
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof (Data) Section */}
      <section style={{ backgroundColor: '#1e3a8a', padding: '10rem 2rem', color: 'white', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '5rem', opacity: 0.9 }}>이미 수많은 사장님이 TAD와 함께하고 있습니다</h2>

          <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr 1fr', gap: '4rem', marginBottom: '8rem' }}>
            {stats.map((stat, i) => (
              <div key={i}>
                <div style={{ fontSize: '4.5rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-2px' }}>{stat.value}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600, opacity: 0.7 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '3rem', opacity: 0.6 }}>협력 제휴사</p>
          {/* Ticker Animation Container */}
          <div style={{ display: 'flex', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' }}>
            <div style={{ display: 'flex', animation: 'ticker 20s linear infinite', gap: '4rem' }}>
              {[...partnerLogos, ...partnerLogos].map((logo, i) => (
                <div key={i} style={{ fontSize: '1.5rem', fontWeight: 800, opacity: 0.4, minWidth: '150px' }}>{logo}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Authority Section (Founder's Promise) */}
      <section style={{ padding: '10rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '400px 1fr', gap: '4rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '100%',
              height: '500px',
              borderRadius: '40px',
              backgroundImage: 'url(/images/founder.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '0 30px 60px -15px rgba(0,0,0,0.2)'
            }}></div>
            <div style={{ position: 'absolute', bottom: '-30px', right: '-30px', backgroundColor: '#1d4ed8', color: 'white', padding: '2rem', borderRadius: '30px', boxShadow: '0 20px 40px rgba(29, 78, 216, 0.3)' }}>
              <Quote size={40} />
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem', lineHeight: 1.2, letterSpacing: '-1px' }}>
              현장을 모르는 사람이 만든 <br />
              앱은 불편합니다.
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <p style={{ fontSize: '1.25rem', color: '#475569', lineHeight: 1.7 }}>
                "30년 간 간판과 광고물 제조업을 걸어왔습니다.
                차 안에서, 식당에서 고객의 독촉 전화를 받으며 엑셀을 켜야 하는 그 막막함을 누구보다 잘 알고 있습니다."
              </p>
              <p style={{ fontSize: '1.25rem', color: '#475569', lineHeight: 1.7, fontWeight: 600 }}>
                "현장에서 얻은 노하우를 이 앱 하나에 다 녹였습니다.
                복잡한 계산 대신 사장님의 소중한 삶과 비즈니스에만 몰입하시기 바랍니다."
              </p>
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>TAD 개발 자문, 박정우 사장</p>
                <p style={{ color: '#64748b', fontWeight: 600 }}>30년 광고/인테리어 외길 인생</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#0f172a', padding: '6rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h4 style={{ color: 'white', fontSize: '2rem', margin: '0 0 1rem 0', fontWeight: 800 }}>TAD Smart Quote</h4>
          <p style={{ color: '#cbd5e1', fontSize: '1.2rem', marginTop: 0, marginBottom: '3rem' }}>대한민국 자영업자를 위한 스마트 견적 자동화</p>

          <div style={{ marginBottom: '3rem', fontSize: '1rem', lineHeight: '1.8', color: '#64748b' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <Link to="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>이용약관</Link>
              <Link to="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>개인정보처리방침</Link>
              <Link to="/refund" style={{ color: 'inherit', textDecoration: 'none' }}>환불규정</Link>
            </div>
            상호명: 태드스마트견적(TAD) | 대표자명: 박인서 | 사업자등록번호: 387-14-02824<br />
            사업장 소재지: 성남시 수정구 산성대로 305<br />
            고객센터: 010-6456-1084 | 이메일: 98parks@gmail.com
          </div>
          <p style={{ fontSize: '0.9rem', opacity: 0.5 }}>&copy; {new Date().getFullYear()} 태드스마트견적(TAD). All rights reserved.</p>
        </div>
      </footer>

      {/* Sticky Bottom CTA */}
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '0 1rem',
        opacity: scrolled ? 1 : 0,
        pointerEvents: scrolled ? 'auto' : 'none',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        transform: scrolled ? 'translateY(0)' : 'translateY(100px)'
      }}>
        <button
          onClick={() => navigate('/signup')}
          style={{
            backgroundColor: '#1d4ed8',
            color: 'white',
            border: 'none',
            padding: '1.2rem 4rem',
            fontSize: '1.2rem',
            fontWeight: 800,
            borderRadius: '100px',
            boxShadow: '0 15px 30px rgba(29, 78, 216, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer'
          }}
        >
          무료 체험하기 <ArrowRight size={20} />
        </button>
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .btn-bounce:hover {
          transform: scale(1.05) translateY(-5px);
        }
        .btn-bounce:active {
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
}
