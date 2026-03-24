import React, { useState, useMemo, useRef } from 'react';
import { materialCategories } from '../data/materials';
import { Plus, Trash2, Save, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import PrintTemplate from '../components/PrintTemplate';
import { saveQuote } from '../services/quoteService';
import { useAuth } from '../contexts/AuthContext';

export default function CreateQuote() {
  const { currentUser } = useAuth();
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', project: '', date: new Date().toISOString().split('T')[0] });
  const [items, setItems] = useState([]);
  const [includeVat, setIncludeVat] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const addItem = () => {
    setItems([{ id: Date.now(), categoryId: '', itemId: '', specification: '', remarks: '', width: '', height: '', quantity: 1, name: '', unitPrice: '', type: '', total: 0 }, ...items]);
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        let newItem = { ...item, [field]: value };
        
        if (field === 'categoryId') {
          newItem.itemId = '';
          newItem.name = '';
          newItem.unitPrice = 0;
          newItem.basePrice = 0;
          newItem.type = '';
        } else if (field === 'itemId') {
          const category = materialCategories.find(c => c.id === newItem.categoryId);
          const selectedMat = category?.items.find(i => i.id === value);
          if (selectedMat) {
            newItem.name = selectedMat.name;
            newItem.type = selectedMat.type;
          }
        }

        // Final total is always strictly Unit Price * Quantity
        const q = parseInt(newItem.quantity) || 1;
        const price = parseFloat(newItem.unitPrice) || 0;
        newItem.total = price * q;

        return newItem;
      }
      return item;
    }));
  };

  const subTotal = useMemo(() => items.reduce((sum, item) => sum + item.total, 0), [items]);
  const vat = includeVat ? Math.round(subTotal * 0.1) : 0;
  const grandTotal = subTotal + vat;

  const printRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const handleSave = async () => {
    if (items.length === 0) {
      alert("항목을 하나 이상 추가해주세요.");
      return;
    }
    if (!customerInfo.name || !customerInfo.project) {
      alert("고객명과 현장명을 입력해주세요.");
      return;
    }
    
    setIsSaving(true);
    try {
      await saveQuote(currentUser.uid, { customerInfo, items, subTotal, vat, grandTotal, includeVat, status: 'pending' });
      alert("견서 데이터가 성공적으로 저장되었습니다.");
      // Optional: Redirect to list or reset form
    } catch (err) {
      alert("저장에 실패했습니다. Firebase 설정을 확인해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>새 견적 작성</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={handlePrint}><Printer size={18} /> 견적서 출력/PDF</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
            <Save size={18} /> {isSaving ? '저장 중...' : '데이터 저장'}
          </button>
        </div>
      </div>
      
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>고객 및 현장 정보</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label>고객명/상호</label>
            <input type="text" placeholder="예: 홍길동 / 미래상사" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>연락처</label>
            <input type="text" placeholder="예: 010-1234-5678" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} />
          </div>
          <div className="form-group">
            <label>현장명 (프로젝트)</label>
            <input type="text" placeholder="예: 강남역 디스플레이 시공" value={customerInfo.project} onChange={e => setCustomerInfo({...customerInfo, project: e.target.value})} />
          </div>
          <div className="form-group">
            <label>견적일자</label>
            <input type="date" value={customerInfo.date} onChange={e => setCustomerInfo({...customerInfo, date: e.target.value})} />
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>견적 항목 상세</h3>
          <button className="btn btn-outline" onClick={addItem}><Plus size={18} /> 항목 추가</button>
        </div>
        
        {items.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
            우측 상단의 '항목 추가' 버튼을 눌러 자재 및 시공비를 입력하세요.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map((item, index) => (
              <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '8px', position: 'relative' }}>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                  
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>카테고리</label>
                    <select value={item.categoryId} onChange={e => handleItemChange(item.id, 'categoryId', e.target.value)}>
                      <option value="">-- 선택 --</option>
                      {materialCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>기본 구분 (선택)</label>
                    <select value={item.itemId} onChange={e => handleItemChange(item.id, 'itemId', e.target.value)} disabled={!item.categoryId}>
                      <option value="">-- 자재/종류 선택 --</option>
                      {materialCategories.find(c => c.id === item.categoryId)?.items.map(mat => (
                        <option key={mat.id} value={mat.id}>{mat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>상세 품목명 (수정가능)</label>
                    <input type="text" placeholder="품목/자재명 입력" value={item.name} onChange={e => handleItemChange(item.id, 'name', e.target.value)} />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>규격/사양</label>
                    <input type="text" placeholder="예: 1200x2400" value={item.specification} onChange={e => handleItemChange(item.id, 'specification', e.target.value)} />
                  </div>

                  {item.type === 'area' && (
                    <>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>가로 (mm)</label>
                        <input type="number" placeholder="w" value={item.width} onChange={e => handleItemChange(item.id, 'width', e.target.value)} />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>세로 (mm)</label>
                        <input type="number" placeholder="h" value={item.height} onChange={e => handleItemChange(item.id, 'height', e.target.value)} />
                      </div>
                    </>
                  )}

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>수량</label>
                    <input type="number" min="1" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', e.target.value)} />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>단가 (수정가능)</label>
                    <input type="number" min="0" value={item.unitPrice} onChange={e => handleItemChange(item.id, 'unitPrice', e.target.value)} />
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                    <label>비고</label>
                    <input type="text" placeholder="특이사항이나 세부 요청사항을 입력하세요" value={item.remarks} onChange={e => handleItemChange(item.id, 'remarks', e.target.value)} />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-color)', padding: '0.5rem 1rem', borderRadius: '6px' }}>
                    <span style={{ fontWeight: 500, color: 'var(--text-light)' }}>항목 소계:</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-color)' }}>{item.total.toLocaleString()} 원</span>
                  </div>

                </div>
                <button className="btn-icon" style={{ color: 'var(--danger-color)', backgroundColor: 'rgba(239, 68, 68, 0.1)', cursor: 'pointer', border: 'none' }} onClick={() => removeItem(item.id)}>
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem',
        position: 'sticky', bottom: '1rem', zIndex: 10,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.15)', border: '1px solid var(--border-color)'
      }}>
        <div style={{ width: '100%', maxWidth: '400px', display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
          <span>공급가액 (소계):</span>
          <span style={{ fontWeight: 600 }}>{subTotal.toLocaleString()} 원</span>
        </div>
        <div style={{ width: '100%', maxWidth: '400px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, cursor: 'pointer' }}>
            <input type="checkbox" checked={includeVat} onChange={e => setIncludeVat(e.target.checked)} style={{ width: 'auto' }} />
            부가세 (10%) 적용
          </label>
          <span style={{ fontWeight: 600 }}>{vat.toLocaleString()} 원</span>
        </div>
        <div style={{ width: '100%', maxWidth: '400px', display: 'flex', justifyContent: 'space-between', padding: '1rem 0', fontSize: '1.25rem' }}>
          <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>총 견적 금액:</span>
          <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{grandTotal.toLocaleString()} 원</span>
        </div>
      </div>
      
      {/* Hidden layout for PDF Print */}
      <PrintTemplate ref={printRef} customerInfo={customerInfo} items={items} subTotal={subTotal} vat={vat} grandTotal={grandTotal} />
    </div>
  );
}
