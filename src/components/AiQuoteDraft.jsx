import React, { useState } from 'react';
import { Sparkles, X, Check } from 'lucide-react';
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

  const handleGenerate = async () => {
    if (!description.trim()) return;
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
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.75)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '90%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#7c3aed' }}>
                <Sparkles size={22} /> AI 견적 초안 생성
              </h3>
              <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}>
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
              <label>작업 내용을 자유롭게 입력하세요</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="예: 강남역 앞 카페 간판 교체. 가로 3m, 세로 1.2m 채널 간판 제작 및 설치. 크레인 필요."
                style={{ width: '100%', minHeight: '90px', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.95rem', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={loading || !description.trim()}
              style={{ width: '100%', marginBottom: loading ? '1rem' : '1.5rem', backgroundColor: '#7c3aed', borderColor: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: 'white', borderRadius: '50%',
                    display: 'inline-block', animation: 'spin 0.8s linear infinite', flexShrink: 0
                  }} />
                  AI가 견적을 분석하는 중...
                </>
              ) : '✨ 항목 추천받기'}
            </button>

            {loading && (
              <div style={{ padding: '1.2rem', backgroundColor: '#f5f3ff', borderRadius: '10px', marginBottom: '1.5rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '0.7rem' }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#7c3aed', display: 'inline-block',
                      animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
                    }} />
                  ))}
                </div>
                <p style={{ margin: 0, color: '#7c3aed', fontWeight: 600, fontSize: '0.9rem' }}>작업 내용을 분석하고 있습니다</p>
                <p style={{ margin: '0.3rem 0 0', color: '#a78bfa', fontSize: '0.8rem' }}>AI가 적합한 품목과 단가를 추천 중입니다. 10~20초 소요됩니다.</p>
              </div>
            )}

            <style>{`
              @keyframes spin { to { transform: rotate(360deg); } }
              @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-8px); } }
            `}</style>

            {error && (
              <div style={{ padding: '0.8rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            {result && editableItems.length > 0 && (
              <>
                <div style={{ padding: '0.7rem 1rem', backgroundColor: '#f5f3ff', borderRadius: '6px', marginBottom: '0.8rem', color: '#7c3aed', fontWeight: 600, fontSize: '0.9rem' }}>
                  ✨ {result.summary}
                </div>
                <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', color: '#92400e', lineHeight: '1.6' }}>
                  <strong>📝 AI 초안 안내</strong><br />
                  AI가 작업 내용을 분석해 항목과 단가를 자동 추천했습니다. <b>단가·수량·규격은 실제 현장에 맞게 직접 수정</b>하세요.<br />
                  불필요한 항목은 체크 해제로 제외할 수 있습니다.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.2rem' }}>
                  {editableItems.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        border: `2px solid ${selected.includes(i) ? '#7c3aed' : 'var(--border-color)'}`,
                        borderRadius: '10px',
                        backgroundColor: selected.includes(i) ? '#faf5ff' : 'white',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        onClick={() => toggleSelect(i)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem', cursor: 'pointer' }}
                      >
                        <div style={{
                          width: '22px', height: '22px', borderRadius: '4px', flexShrink: 0,
                          backgroundColor: selected.includes(i) ? '#7c3aed' : '#e2e8f0',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {selected.includes(i) && <Check size={14} color="white" />}
                        </div>
                        <div style={{ flex: 1, fontWeight: 700, fontSize: '0.95rem' }}>{item.name}</div>
                        <div style={{ fontWeight: 700, color: '#7c3aed', fontSize: '0.95rem', flexShrink: 0 }}>
                          {(item.total || 0).toLocaleString()}원
                        </div>
                      </div>

                      <div
                        style={{ padding: '0 1rem 0.9rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}
                        onClick={e => e.stopPropagation()}
                      >
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>규격</label>
                          <input type="text" value={item.specification || ''} onChange={e => updateItem(i, 'specification', e.target.value)}
                            style={{ width: '100%', padding: '0.35rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>수량</label>
                          <input type="number" min="0.1" step="0.1" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)}
                            style={{ width: '100%', padding: '0.35rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>단위</label>
                          <input type="text" value={item.unit || ''} onChange={e => updateItem(i, 'unit', e.target.value)}
                            style={{ width: '100%', padding: '0.35rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>단가 (수정가능)</label>
                          <input type="number" min="0" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', e.target.value)}
                            style={{ width: '100%', padding: '0.35rem 0.5rem', border: '2px solid #c4b5fd', borderRadius: '5px', fontSize: '0.85rem', boxSizing: 'border-box', fontWeight: 600 }} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>비고</label>
                          <input type="text" value={item.remarks || ''} onChange={e => updateItem(i, 'remarks', e.target.value)}
                            placeholder="특이사항 입력"
                            style={{ width: '100%', padding: '0.35rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontSize: '0.9rem' }}>선택 {selected.length}개 소계</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#7c3aed' }}>{selectedTotal.toLocaleString()}원</span>
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
