import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '안녕하세요! TAD 견적관리 AI 도우미입니다 😊\n궁금한 점을 편하게 물어보세요.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    const history = messages.slice(1);
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, history })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'API error');
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || '오류가 발생했습니다.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 데스크톱: 오른쪽 하단 원래 위치 유지
  // 모바일: 오른쪽 하단, ? 버튼(56px) 위에 쌓이도록
  const btnStyle = isMobile
    ? { bottom: 'calc(156px + env(safe-area-inset-bottom, 0px))', right: '1rem' }
    : { bottom: '5.5rem', right: '1.5rem' };

  const panelStyle = isMobile
    ? { bottom: 'calc(216px + env(safe-area-inset-bottom, 0px))', right: '0.5rem', width: 'calc(100vw - 1rem)', maxHeight: 'calc(100dvh - 260px - env(safe-area-inset-bottom, 0px))' }
    : { bottom: '8.5rem', right: '1.5rem', width: 'min(340px, calc(100vw - 3rem))' };

  return (
    <>
      <button
        onClick={() => setIsOpen(o => !o)}
        title="AI 도우미"
        style={{
          position: 'fixed', zIndex: 1000,
          ...btnStyle,
          width: '52px', height: '52px', borderRadius: '50%',
          backgroundColor: '#7c3aed', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(124,58,237,0.45)',
          transition: 'transform 0.15s'
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen ? <X size={22} color="white" /> : <MessageCircle size={22} color="white" />}
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', zIndex: 1000,
          ...panelStyle,
          height: isMobile ? undefined : '420px',
          minHeight: '300px',
          display: 'flex', flexDirection: 'column',
          backgroundColor: 'white', borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          border: '1px solid #e2e8f0', overflow: 'hidden'
        }}>
          <div style={{ padding: '0.9rem 1.2rem', backgroundColor: '#7c3aed', display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
            <Bot size={20} color="white" />
            <div>
              <div style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>TAD AI 도우미</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem' }}>견적관리 궁금증 해결</div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '82%', padding: '0.65rem 0.95rem',
                  borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  fontSize: '0.88rem', lineHeight: '1.55', whiteSpace: 'pre-wrap',
                  backgroundColor: m.role === 'user' ? '#7c3aed' : '#f1f5f9',
                  color: m.role === 'user' ? 'white' : '#1e293b'
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '0.65rem 0.95rem', backgroundColor: '#f1f5f9', borderRadius: '12px 12px 12px 2px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {[0,1,2].map(i => <span key={i} className={`ai-dot ai-dot-${i}`} style={{ backgroundColor: '#94a3b8' }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: '0.8rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              disabled={loading}
              style={{ flex: 1, padding: '0.6rem 0.85rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.88rem', outline: 'none' }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                padding: '0.6rem 0.85rem', backgroundColor: '#7c3aed', border: 'none', borderRadius: '8px',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !input.trim() ? 0.6 : 1,
                display: 'flex', alignItems: 'center'
              }}
            >
              <Send size={17} color="white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
