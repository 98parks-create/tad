import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Check, RotateCcw } from 'lucide-react';
import { industries } from '../data/materials';

const LOADING_STYLES = `
  @keyframes ai-spin-lg { to { transform: rotate(360deg); } }
  @keyframes ai-pulse-icon { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.18);opacity:0.7} }
  @keyframes shake {
    0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-7px)} 40%,80%{transform:translateX(7px)}
  }
  .textarea-shake { animation: shake 0.5s ease-in-out; border-color:#ef4444!important; box-shadow:0 0 0 3px rgba(239,68,68,0.2)!important; }
`;

export default function AiQuoteDraft({ onApply }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState('sign');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState(null);
  const [editableItems, setEditableItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  const [shakeTextarea, setShakeTextarea] = useState(false);
  const textareaRef = useRef(null);

  // 로딩 중 경과시간 카운터
  useEffect(() => {
    if (!loading) { setElapsed(0); return; }
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [loading]);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setShakeTextarea(true);
      setTimeout(() => setShakeTextarea(false), 600);
      textareaRef.current?.focus();
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/ai/quote-draft', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ description, industry: selectedIndustry })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      setEditableItems(data.items.map(item => ({ ...item })));
      setSelected(data.items.map((_, i) => i));
    } catch (e) {
      setError(e.message || 'AI 초안 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (i, field, value) => {
    setEditableItems(prev => prev.map((item, idx) => {
      if (idx !== i) return item;
      const updated = { ...item, [field]: value };
      updated.total = (Number(updated.unitPrice) || 0) * (Number(updated.quantity) || 1);
      return updated;
    }));
  };

  const handleApply = () => {
    const newItems = selected.map(i => ({
      id: Date.now() + i,
      industry: selectedIndustry,
      categoryId: '', itemId: '',
      name: editableItems[i].name,
      specification: editableItems[i].specification || '',
      unit: editableItems[i].unit || '식',
      quantity: Number(editableItems[i].quantity) || 1,
      unitPrice: Number(editableItems[i].unitPrice) || 0,
      remarks: editableItems[i].remarks || '',
      width: '', height: '', type: 'general',
      total: (Number(editableItems[i].unitPrice) || 0) * (Number(editableItems[i].quantity) || 1)
    }));
    onApply({ items: newItems, customerInfo: result?.customerInfo, remarks: result?.remarks });
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    setDescription('');
    setResult(null);
    setEditableItems([]);
    setError('');
    setSelected([]);
  };

  const toggleSelect = (i) => {
    setSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const selectedTotal = selected.reduce((sum, i) => sum + (editableItems[i]?.total || 0), 0);

  return (
    <>
      <button
        className="btn btn-outline"
        onClick={() => setIsOpen(true)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: '#7c3aed', color: '#7c3aed' }}
      >
        <Sparkles size={18} /> AI 초안 생성
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.75)',
          zIndex: 9998, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          backdropFilter: 'blur(4px)', overflowY: 'auto', padding: '0.75rem'
        }}>
          <style>{LOADING_STYLES}</style>

          <div style={{
            width: '100%', maxWidth: '600px',
            backgroundColor: 'white', borderRadius: '14px',
            margin: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            minHeight: result ? 'calc(100dvh - 1.5rem)' : 'auto',
            maxHeight: 'calc(100dvh - 1.5rem)'
          }}>

            {/* ── 로딩 풀오버레이 ── */}
            {loading && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 20,
                backgroundColor: 'rgba(245,243,255,0.97)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '1.2rem', borderRadius: '14px'
              }}>
                {/* 큰 스피너 */}
                <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    border: '5px solid #ede9fe',
                    borderTopColor: '#7c3aed',
                    borderRadius: '50%',
                    animation: 'ai-spin-lg 0.9s linear infinite'
                  }} />
                  <div style={{
                    position: 'absolute', inset: '18px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'ai-pulse-icon 1.4s ease-in-out infinite'
                  }}>
                    <Sparkles size={26} color="#7c3aed" />
                  </div>
                </div>

                <div style={{ textAlign: 'center', padding: '0 2rem' }}>
                  <p style={{ fontWeight: 800, color: '#6d28d9', fontSize: '1.15rem', margin: '0 0 0.4rem' }}>
                    AI가 열심히 분석 중입니다
                  </p>
                  <p style={{ color: '#8b5cf6', fontSize: '0.88rem', margin: '0 0 0.6rem' }}>
                    작업 내용으로 품목과 단가를 추천하고 있어요
                  </p>
                  <p style={{ color: '#a78bfa', fontSize: '0.82rem', margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                    경과 시간: <strong>{elapsed}초</strong> / 보통 10~20초 소요
                  </p>
                </div>

                {/* 프로그레스 바 */}
                <div style={{ width: '200px', height: '6px', backgroundColor: '#ede9fe', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '99px',
                    backgroundColor: '#7c3aed',
                    width: `${Math.min(95, (elapsed / 20) * 100)}%`,
                    transition: 'width 1s ease'
                  }} />
                </div>

                {/* 바운스 닷 */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[0,1,2].map(i => (
                    <span key={i} className={`ai-dot ai-dot-${i}`} style={{ width: '10px', height: '10px', backgroundColor: '#7c3aed' }} />
                  ))}
                </div>
              </div>
            )}

            {/* ── 결과 화면 ── */}
            {result && !loading ? (
              <>
                {/* 결과 헤더 (sticky) */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.85rem 1rem', borderBottom: '1px solid #e2e8f0',
                  backgroundColor: '#faf5ff', flexShrink: 0
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#7c3aed', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Sparkles size={16} /> AI 생성 결과 ({editableItems.length}개 항목)
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#a78bfa', marginTop: '2px' }}>{result.summary}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    <button
                      onClick={() => { setResult(null); setError(''); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', padding: '0.35rem 0.6rem', backgroundColor: '#f3e8ff', border: '1px solid #c4b5fd', color: '#7c3aed', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <RotateCcw size={13} /> 다시 생성
                    </button>
                    <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.3rem' }}>
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* 안내 배너 */}
                <div style={{ padding: '0.5rem 1rem', backgroundColor: '#fffbeb', borderBottom: '1px solid #fde68a', fontSize: '0.75rem', color: '#92400e', flexShrink: 0 }}>
                  📝 <strong>단가·수량은 실제 현장에 맞게 수정</strong>하세요. 체크 해제로 항목 제외 가능.
                </div>

                {/* compact 테이블 헤더 */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '24px 1fr 52px 36px 32px 72px',
                  gap: '0.25rem', padding: '0.3rem 0.75rem',
                  backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0',
                  fontSize: '0.65rem', color: '#64748b', fontWeight: 600,
                  flexShrink: 0
                }}>
                  <span></span>
                  <span>품목명</span>
                  <span style={{ textAlign: 'center' }}>규격</span>
                  <span style={{ textAlign: 'center' }}>수량</span>
                  <span style={{ textAlign: 'center' }}>단위</span>
                  <span style={{ textAlign: 'right' }}>단가/합계</span>
                </div>

                {/* 항목 목록 — 스크롤 가능 */}
                <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  {editableItems.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '24px 1fr 52px 36px 32px 72px',
                        gap: '0.25rem',
                        alignItems: 'center',
                        padding: '0.45rem 0.75rem',
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: selected.includes(i) ? '#faf5ff' : 'white',
                        transition: 'background-color 0.15s'
                      }}
                    >
                      {/* 체크박스 */}
                      <div
                        onClick={() => toggleSelect(i)}
                        style={{
                          width: '18px', height: '18px', borderRadius: '4px', cursor: 'pointer', flexShrink: 0,
                          backgroundColor: selected.includes(i) ? '#7c3aed' : '#e2e8f0',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        {selected.includes(i) && <Check size={11} color="white" />}
                      </div>

                      {/* 품목명 */}
                      <input
                        type="text"
                        value={item.name}
                        onChange={e => updateItem(i, 'name', e.target.value)}
                        style={{
                          border: 'none', borderBottom: '1px solid #e2e8f0',
                          fontSize: '0.8rem', fontWeight: 600, padding: '0.15rem 0.2rem',
                          backgroundColor: 'transparent', width: '100%', minWidth: 0,
                          color: 'var(--text-dark)'
                        }}
                      />

                      {/* 규격 */}
                      <input
                        type="text"
                        value={item.specification || ''}
                        onChange={e => updateItem(i, 'specification', e.target.value)}
                        placeholder="-"
                        style={{
                          border: '1px solid #e2e8f0', borderRadius: '4px',
                          fontSize: '0.7rem', padding: '0.2rem 0.25rem',
                          textAlign: 'center', width: '100%', backgroundColor: '#fafafa'
                        }}
                      />

                      {/* 수량 */}
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={e => updateItem(i, 'quantity', e.target.value)}
                        style={{
                          border: '1px solid #e2e8f0', borderRadius: '4px',
                          fontSize: '0.7rem', padding: '0.2rem 0.15rem',
                          textAlign: 'center', width: '100%', backgroundColor: '#fafafa'
                        }}
                      />

                      {/* 단위 */}
                      <input
                        type="text"
                        value={item.unit || ''}
                        onChange={e => updateItem(i, 'unit', e.target.value)}
                        style={{
                          border: '1px solid #e2e8f0', borderRadius: '4px',
                          fontSize: '0.7rem', padding: '0.2rem 0.15rem',
                          textAlign: 'center', width: '100%', backgroundColor: '#fafafa'
                        }}
                      />

                      {/* 단가 + 합계 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', alignItems: 'flex-end' }}>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={e => updateItem(i, 'unitPrice', e.target.value)}
                          style={{
                            border: '1.5px solid #c4b5fd', borderRadius: '4px',
                            fontSize: '0.68rem', padding: '0.2rem 0.25rem',
                            textAlign: 'right', width: '100%', fontWeight: 600,
                            backgroundColor: '#fdf4ff', color: '#6d28d9'
                          }}
                        />
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-color)', whiteSpace: 'nowrap' }}>
                          {(item.total || 0).toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 하단 고정: 소계 + 적용 버튼 */}
                <div style={{
                  padding: '0.75rem 1rem', borderTop: '2px solid #e2e8f0',
                  backgroundColor: 'white', flexShrink: 0
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      선택 <strong style={{ color: '#7c3aed' }}>{selected.length}개</strong> 소계
                    </span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#7c3aed' }}>
                      {selectedTotal.toLocaleString()}원
                    </span>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={handleApply}
                    disabled={selected.length === 0}
                    style={{ width: '100%', backgroundColor: '#7c3aed', borderColor: '#7c3aed', fontSize: '0.95rem', padding: '0.7rem' }}
                  >
                    선택 {selected.length}개 → 견적서에 추가
                  </button>
                </div>
              </>
            ) : !loading && (
              /* ── 입력 폼 ── */
              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#7c3aed', fontSize: '1rem' }}>
                    <Sparkles size={20} /> AI 견적 초안 생성
                  </h3>
                  <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', padding: '0.25rem' }}>
                    <X size={24} />
                  </button>
                </div>

                <div className="form-group">
                  <label>업종 선택</label>
                  <select value={selectedIndustry} onChange={e => setSelectedIndustry(e.target.value)} style={{ width: '100%' }}>
                    {industries.filter(i => i.id !== 'other').map(ind => (
                      <option key={ind.id} value={ind.id}>{ind.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    작업 내용을 자유롭게 입력하세요
                    <span style={{ color: '#ef4444', fontSize: '0.78rem', marginLeft: '0.3rem' }}>* 필수</span>
                  </label>
                  <textarea
                    ref={textareaRef}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className={shakeTextarea ? 'textarea-shake' : ''}
                    placeholder="예: 강남역 앞 카페 간판 교체. 가로 3m, 세로 1.2m 채널 간판 제작 및 설치. 크레인 필요."
                    style={{ width: '100%', minHeight: '90px', padding: '0.7rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.9rem', resize: 'vertical' }}
                  />
                  {shakeTextarea && <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0.2rem 0 0' }}>작업 내용을 입력해주세요.</p>}
                </div>

                {error && (
                  <div style={{ padding: '0.85rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', marginBottom: '1rem', fontSize: '0.88rem', fontWeight: 500 }}>
                    ⚠️ {error}
                  </div>
                )}

                <button
                  className="btn btn-primary"
                  onClick={handleGenerate}
                  style={{ width: '100%', backgroundColor: '#7c3aed', borderColor: '#7c3aed', fontSize: '1rem', padding: '0.8rem' }}
                >
                  ✨ AI 항목 추천받기
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
