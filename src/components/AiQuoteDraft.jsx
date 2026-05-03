import React, { useState, useRef } from 'react';
import { Sparkles, X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { industries } from '../data/materials';

export default function AiQuoteDraft({ onApply }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState('sign');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [editableItems, setEditableItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  const [shakeTextarea, setShakeTextarea] = useState(false);
  const [expandedResults, setExpandedResults] = useState({});
  const textareaRef = useRef(null);
  const errorRef = useRef(null);

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
    setExpandedResults({});
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
      // 첫 번째 항목만 기본 펼치기
      setExpandedResults({ 0: true });
    } catch (e) {
      setError(e.message || 'AI 초안 생성에 실패했습니다.');
      setTimeout(() => errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
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
      categoryId: '',
      itemId: '',
      name: editableItems[i].name,
      specification: editableItems[i].specification || '',
      unit: editableItems[i].unit || '식',
      quantity: Number(editableItems[i].quantity) || 1,
      unitPrice: Number(editableItems[i].unitPrice) || 0,
      remarks: editableItems[i].remarks || '',
      width: '',
      height: '',
      type: 'general',
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
    setExpandedResults({});
  };

  const toggleSelect = (i) => {
    setSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const toggleExpand = (i) => {
    setExpandedResults(prev => ({ ...prev, [i]: !prev[i] }));
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
          backdropFilter: 'blur(4px)', overflowY: 'auto', padding: '1rem'
        }}>
          <div style={{
            width: '100%', maxWidth: '640px', backgroundColor: 'white',
            borderRadius: '12px', padding: '1.25rem', margin: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>

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
              <label>작업 내용을 자유롭게 입력하세요 <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>*필수</span></label>
              <style>{`
                @keyframes shake {
                  0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)}
                }
                .textarea-shake { animation: shake 0.5s ease-in-out; border-color: #ef4444 !important; box-shadow: 0 0 0 3px rgba(239,68,68,0.2) !important; }
              `}</style>
              <textarea
                ref={textareaRef}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className={shakeTextarea ? 'textarea-shake' : ''}
                placeholder="예: 강남역 앞 카페 간판 교체. 가로 3m, 세로 1.2m 채널 간판 제작 및 설치. 크레인 필요."
                style={{ width: '100%', minHeight: '80px', padding: '0.7rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.9rem', resize: 'vertical', transition: 'border-color 0.2s, box-shadow 0.2s' }}
              />
              {shakeTextarea && <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>작업 내용을 입력해주세요.</p>}
            </div>

            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={loading}
              style={{ width: '100%', marginBottom: '1rem', backgroundColor: '#7c3aed', borderColor: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: loading ? 0.85 : 1 }}
            >
              {loading ? (
                <>
                  <span className="ai-spinner" />
                  AI가 분석하는 중... (10~20초)
                </>
              ) : '✨ 항목 추천받기'}
            </button>

            {loading && (
              <div style={{ padding: '1rem', backgroundColor: '#f5f3ff', borderRadius: '10px', marginBottom: '1rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '0.6rem' }}>
                  {[0, 1, 2].map(i => (<span key={i} className={`ai-dot ai-dot-${i}`} />))}
                </div>
                <p style={{ margin: 0, color: '#7c3aed', fontWeight: 600, fontSize: '0.9rem' }}>작업 내용을 AI가 분석 중입니다</p>
                <p style={{ margin: '0.2rem 0 0', color: '#a78bfa', fontSize: '0.78rem' }}>품목·단가 추천까지 10~20초 소요됩니다. 잠시만 기다려주세요.</p>
              </div>
            )}

            {error && (
              <div ref={errorRef} style={{ padding: '0.85rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', marginBottom: '1rem', fontSize: '0.88rem', fontWeight: 500 }}>
                ⚠️ {error}
              </div>
            )}

            {result && editableItems.length > 0 && (
              <>
                <div style={{ padding: '0.6rem 0.9rem', backgroundColor: '#f5f3ff', borderRadius: '6px', marginBottom: '0.7rem', color: '#7c3aed', fontWeight: 600, fontSize: '0.88rem' }}>
                  ✨ {result.summary}
                </div>
                <div style={{ padding: '0.65rem 0.9rem', backgroundColor: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', marginBottom: '0.9rem', fontSize: '0.82rem', color: '#92400e', lineHeight: '1.55' }}>
                  <strong>📝 AI 초안 안내</strong><br />
                  단가·수량·규격은 실제 현장에 맞게 <b>직접 수정</b>하세요. 불필요한 항목은 체크 해제로 제외할 수 있습니다.
                </div>

                {/* 결과 항목 — compact 접기/펼치기 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
                  {editableItems.map((item, i) => {
                    const isExp = expandedResults[i] === true;
                    return (
                      <div
                        key={i}
                        style={{
                          border: `1.5px solid ${selected.includes(i) ? '#7c3aed' : 'var(--border-color)'}`,
                          borderRadius: '8px',
                          backgroundColor: selected.includes(i) ? '#faf5ff' : 'white',
                          overflow: 'hidden'
                        }}
                      >
                        {/* 요약 행 */}
                        <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr auto auto', gap: '0.4rem', alignItems: 'center', padding: '0.55rem 0.75rem', cursor: 'pointer' }}
                          onClick={() => toggleExpand(i)}>
                          <div
                            onClick={e => { e.stopPropagation(); toggleSelect(i); }}
                            style={{ width: '20px', height: '20px', borderRadius: '4px', flexShrink: 0, backgroundColor: selected.includes(i) ? '#7c3aed' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            {selected.includes(i) && <Check size={12} color="white" />}
                          </div>
                          <div style={{ overflow: 'hidden', minWidth: 0 }}>
                            <span style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                            {!isExp && (
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>
                                {[item.specification, `${item.quantity}${item.unit || ''}`].filter(Boolean).join(' · ')}
                              </span>
                            )}
                          </div>
                          <span style={{ fontWeight: 700, color: '#7c3aed', fontSize: '0.82rem', flexShrink: 0 }}>
                            {(item.total || 0).toLocaleString()}원
                          </span>
                          {isExp ? <ChevronUp size={14} color="#94a3b8" /> : <ChevronDown size={14} color="#94a3b8" />}
                        </div>

                        {/* 편집 필드 */}
                        {isExp && (
                          <div
                            style={{ padding: '0 0.75rem 0.75rem 0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', borderTop: '1px solid #e2e8f0' }}
                            onClick={e => e.stopPropagation()}
                          >
                            <div style={{ paddingTop: '0.4rem' }}>
                              <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '0.15rem' }}>규격</label>
                              <input type="text" value={item.specification || ''} onChange={e => updateItem(i, 'specification', e.target.value)}
                                style={{ width: '100%', padding: '0.3rem 0.45rem', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '0.82rem' }} />
                            </div>
                            <div style={{ paddingTop: '0.4rem' }}>
                              <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '0.15rem' }}>수량</label>
                              <input type="number" min="0.1" step="0.1" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)}
                                style={{ width: '100%', padding: '0.3rem 0.45rem', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '0.82rem' }} />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '0.15rem' }}>단위</label>
                              <input type="text" value={item.unit || ''} onChange={e => updateItem(i, 'unit', e.target.value)}
                                style={{ width: '100%', padding: '0.3rem 0.45rem', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '0.82rem' }} />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: 700, display: 'block', marginBottom: '0.15rem' }}>단가 ✏️</label>
                              <input type="number" min="0" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', e.target.value)}
                                style={{ width: '100%', padding: '0.3rem 0.45rem', border: '2px solid #c4b5fd', borderRadius: '5px', fontSize: '0.82rem', fontWeight: 600 }} />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                              <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '0.15rem' }}>비고</label>
                              <input type="text" value={item.remarks || ''} onChange={e => updateItem(i, 'remarks', e.target.value)}
                                placeholder="특이사항"
                                style={{ width: '100%', padding: '0.3rem 0.45rem', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '0.82rem' }} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontSize: '0.88rem' }}>선택 {selected.length}개 소계</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#7c3aed' }}>{selectedTotal.toLocaleString()}원</span>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={handleApply}
                  disabled={selected.length === 0}
                  style={{ width: '100%', backgroundColor: '#7c3aed', borderColor: '#7c3aed' }}
                >
                  선택한 항목 {selected.length}개 견적서에 추가
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
