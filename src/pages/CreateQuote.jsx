import React, { useState, useMemo, useRef } from 'react';
import { industries, materialCategoriesByIndustry } from '../data/materials';
import { Plus, Trash2, Save, Printer, Copy, Lock, Image, MessageCircle } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import PrintTemplate from '../components/PrintTemplate';
import PaymentModal from '../components/PaymentModal';
import { saveQuote, getQuotes } from '../services/quoteService';
import { getProfile } from '../services/profileService';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

export default function CreateQuote() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const editQuote = location.state?.editQuote;

  const [customerInfo, setCustomerInfo] = useState(editQuote?.customerInfo || { name: '', company: '', phone: '', project: '', date: new Date().toISOString().split('T')[0] });
  const [items, setItems] = useState(editQuote?.items || []);
  const [includeVat, setIncludeVat] = useState(editQuote ? editQuote.includeVat : true);
  const [discount, setDiscount] = useState(editQuote?.discount || 0);
  const [discountReason, setDiscountReason] = useState(editQuote?.discountReason || '');
  const [remarks, setRemarks] = useState(editQuote?.remarks || '');
  const [isSaving, setIsSaving] = useState(false);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [editId] = useState(editQuote?.id || null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);

  React.useEffect(() => {
    if (currentUser) {
      getProfile(currentUser.uid).then(profile => {
        if (profile) {
          setCompanyProfile(profile);
          if (profile.defaultRemarks && !editQuote?.remarks && !remarks) {
            setRemarks(profile.defaultRemarks);
          }
        }
        
        if (!editQuote) {
          getQuotes(currentUser.uid, true).then(quotes => {
            if (quotes.length >= 3 && profile?.subscriptionPlan !== 'pro') {
              setShowPaywall(true);
            }
          }).catch(console.error);
        }

      }).catch(console.error);
    }
  }, [currentUser, editQuote, remarks]);

  const getCategoriesForIndustry = (industryId) => {
    let cats = materialCategoriesByIndustry[industryId] || [];
    if (companyProfile?.customMaterials && companyProfile.customMaterials.length > 0) {
      const customCategory = {
        id: 'custom_mats',
        name: '⭐ 나만의 자재 (단골목록)',
        items: companyProfile.customMaterials.map(m => ({
          id: m.id,
          name: m.name,
          specification: m.specification,
          unit: m.unit,
          unitPrice: m.unitPrice,
          type: 'general'
        }))
      };
      return [customCategory, ...cats];
    }
    return cats;
  };

  const addItem = () => {
    setItems([{ id: Date.now(), industry: 'sign', categoryId: '', itemId: '', specification: '', unit: '', remarks: '', width: '', height: '', quantity: 1, name: '', unitPrice: '', type: '', total: 0 }, ...items]);
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const duplicateItem = (itemToCopy, index) => {
    const newItem = { ...itemToCopy, id: Date.now() };
    const newItems = [...items];
    newItems.splice(index + 1, 0, newItem);
    setItems(newItems);
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        let newItem = { ...item, [field]: value };
        
        if (field === 'industry') {
          newItem.categoryId = '';
          newItem.itemId = '';
          newItem.name = '';
          newItem.unitPrice = 0;
          newItem.type = '';
          newItem.specification = '';
          newItem.unit = '';
          newItem.width = '';
          newItem.height = '';
        } else if (field === 'categoryId') {
          newItem.itemId = '';
          newItem.name = '';
          newItem.unitPrice = 0;
          newItem.type = '';
          newItem.specification = '';
          newItem.unit = '';
          newItem.width = '';
          newItem.height = '';
        } else if (field === 'itemId') {
          const category = getCategoriesForIndustry(newItem.industry || 'sign').find(c => c.id === newItem.categoryId);
          const selectedMat = category?.items.find(i => i.id === value);
          if (selectedMat) {
            newItem.name = selectedMat.name;
            newItem.type = selectedMat.type || 'general';
            newItem.specification = selectedMat.specification || '';
            newItem.unit = selectedMat.unit || '';
            newItem.unitPrice = selectedMat.unitPrice || 0;
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

  const calculateTotals = () => {
    const subTotal = items.reduce((sum, item) => sum + item.total, 0);
    const finalSubTotal = Math.max(0, subTotal - discount);
    const vat = includeVat ? Math.floor(finalSubTotal * 0.1) : 0;
    const grandTotal = finalSubTotal + vat;
    return { subTotal, vat, grandTotal };
  };

  const { subTotal, vat, grandTotal } = useMemo(calculateTotals, [items, discount, includeVat]);

  const printRef = useRef();
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `견적서_${customerInfo.project || Date.now()}`,
    pageStyle: "@page { size: A4; margin: 0; } @media print { body { -webkit-print-color-adjust: exact; } }"
  });

  const captureImage = async () => {
    if (!printRef.current) return null;
    
    // Temporarily show the print template if it's hidden
    const element = printRef.current;
    const originalStyle = element.parentElement.style.display;
    element.parentElement.style.display = 'block';
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      return canvas;
    } finally {
      element.parentElement.style.display = originalStyle;
    }
  };

  const handleSaveImage = async () => {
    setIsPreparing(true);
    try {
      const canvas = await captureImage();
      if (!canvas) return;
      
      const link = document.createElement('a');
      link.download = `견적서_${customerInfo.project || '미정'}_${customerInfo.name || '고객'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error("Image saving failed:", error);
      alert("이미지 저장 중 오류가 발생했습니다.");
    } finally {
      setIsPreparing(false);
    }
  };

  const handleShareKakao = async () => {
    if (!window.Kakao) {
      alert("카카오 SDK를 불러오지 못했습니다.");
      return;
    }

    setIsPreparing(true);
    try {
      const canvas = await captureImage();
      if (!canvas) return;

      // Convert canvas to blob for upload
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
      
      // Upload to Firebase Storage
      const fileName = `shares/${currentUser?.uid || 'anon'}_${Date.now()}.jpg`;
      const fileRef = storageRef(storage, fileName);
      await uploadBytes(fileRef, blob);
      const imageUrl = await getDownloadURL(fileRef);

      // Share via Kakao
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `[견적서] ${customerInfo.project || '견적 안내'}`,
          description: `${customerInfo.company || ''} ${customerInfo.name || '고객'}님께 드리는 견적서입니다.\n합계금액: ${grandTotal.toLocaleString()}원`,
          imageUrl: imageUrl,
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
        buttons: [
          {
            title: '견적서 보기',
            link: {
              mobileWebUrl: window.location.href,
              webUrl: window.location.href,
            },
          },
        ],
      });
    } catch (error) {
      console.error("Kakao share failed:", error);
      alert("카카오톡 공유 중 오류가 발생했습니다.");
    } finally {
      setIsPreparing(false);
    }
  };

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
      await saveQuote(currentUser.uid, { customerInfo, items, subTotal, discount, discountReason, vat, grandTotal, includeVat, remarks, status: 'pending' }, editId);
      alert(editId ? "견적서가 성공적으로 수정되었습니다." : "견적 데이터가 성공적으로 저장되었습니다.");
      navigate('/list');
    } catch (error) {
      console.error(error);
      alert("저장에 실패했습니다. Firebase 설정을 확인해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>{editId ? '견적 내역 수정' : '새 견적 작성'}</h2>
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={handlePrint} disabled={isPreparing}><Printer size={18} /> PDF 출력</button>
          <button className="btn btn-outline" onClick={handleSaveImage} disabled={isPreparing}>
            <Image size={18} /> {isPreparing ? '처리 중...' : '이미지 저장'}
          </button>
          <button className="btn btn-outline" onClick={handleShareKakao} style={{ color: '#3A1D1D', borderColor: '#FEE500', backgroundColor: '#FEE500' }} disabled={isPreparing}>
            <MessageCircle size={18} /> {isPreparing ? '처리 중...' : '카톡 공유'}
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={isSaving || isPreparing}>
            <Save size={18} /> {isSaving ? '저장 중...' : '데이터 저장'}
          </button>
        </div>
      </div>
      
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>고객 및 현장 정보</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label>고객 회사명(상호)</label>
            <input type="text" placeholder="예: (주)미래상사" value={customerInfo.company || ''} onChange={e => setCustomerInfo({...customerInfo, company: e.target.value})} />
          </div>
          <div className="form-group">
            <label>고객명 (담당자)</label>
            <input type="text" placeholder="예: 홍길동" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
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
                    <label>업종</label>
                    <select value={item.industry || 'sign'} onChange={e => handleItemChange(item.id, 'industry', e.target.value)}>
                      {industries.map(ind => (
                        <option key={ind.id} value={ind.id}>{ind.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>카테고리</label>
                    <select value={item.categoryId} onChange={e => handleItemChange(item.id, 'categoryId', e.target.value)} disabled={item.industry === 'other' && !(companyProfile?.customMaterials && companyProfile.customMaterials.length > 0)}>
                      <option value="">-- 선택 --</option>
                      {getCategoriesForIndustry(item.industry || 'sign').map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>기본 구분 (선택)</label>
                    <select value={item.itemId} onChange={e => handleItemChange(item.id, 'itemId', e.target.value)} disabled={!item.categoryId}>
                      <option value="">-- 자재/종류 선택 --</option>
                      {getCategoriesForIndustry(item.industry || 'sign').find(c => c.id === item.categoryId)?.items.map(mat => (
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
                    <label>수량 및 단위</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input type="number" min="1" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', e.target.value)} style={{ flex: 1, minWidth: '60px' }} />
                      <input type="text" placeholder="단위(식/SET)" value={item.unit || ''} onChange={e => handleItemChange(item.id, 'unit', e.target.value)} style={{ width: '80px' }} />
                    </div>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button className="btn-icon" style={{ color: 'var(--primary-color)', backgroundColor: 'var(--bg-color)', cursor: 'pointer', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.4rem' }} onClick={() => duplicateItem(item, index)} title="이 항목 그대로 복사하여 바로 아래에 줄 추가">
                    <Copy size={20} />
                  </button>
                  <button className="btn-icon" style={{ color: 'var(--danger-color)', backgroundColor: 'rgba(239, 68, 68, 0.1)', cursor: 'pointer', border: 'none', borderRadius: '4px', padding: '0.4rem' }} onClick={() => removeItem(item.id)} title="이 항목 삭제">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="card" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ flex: '1 1 300px' }}>
            <h3 style={{ marginBottom: '0.8rem', fontSize: '1.1rem', color: 'var(--text-dark)' }}>특약사항 및 결제조건 (선택)</h3>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              style={{ width: '100%', height: '100px', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.95rem', resize: 'vertical' }}
              placeholder="예: 결제조건 - 계약시 50%, 완료시 50% / 장비대 현장 별도"
            />
          </div>
          
          <div style={{ flex: '0 0 320px', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
              <span style={{ color: 'var(--text-light)' }}>공급가액 소계</span>
              <span>{subTotal.toLocaleString()} 원</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ color: 'var(--text-light)' }}>할인</span>
                <input 
                  type="text" 
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value)}
                  style={{ width: '100px', padding: '0.2rem 0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem' }}
                  placeholder="사유(선택)"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ color: 'var(--danger-color)' }}>-</span>
                <input 
                  type="number" 
                  value={discount || ''}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  style={{ width: '90px', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'right' }}
                  placeholder="0"
                />
                <span>원</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, cursor: 'pointer', color: 'var(--text-light)' }}>
                <input type="checkbox" checked={includeVat} onChange={e => setIncludeVat(e.target.checked)} style={{ width: 'auto' }} />
                부가세 (10%)
              </label>
              <span>{vat.toLocaleString()} 원</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>최종 합계</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)' }}>{grandTotal.toLocaleString()} 원</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
          <button className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={handleSave} disabled={isSaving}>
            <Save size={20} />
            {isSaving ? '저장 중...' : (editId ? '견적서 수정 완료' : '견적서 최종 저장')}
          </button>
        </div>
      </div>

      <div style={{ display: 'none' }}>
        <PrintTemplate 
          ref={printRef}
          customerInfo={customerInfo}
          items={items}
          subTotal={subTotal}
          discount={discount}
          discountReason={discountReason}
          vat={vat}
          grandTotal={grandTotal}
          providerInfo={companyProfile}
          remarks={remarks}
          includeVat={includeVat}
        />
      </div>

      {showPaywall && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ maxWidth: '420px', width: '90%', padding: '2.5rem 2rem', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ width: '64px', height: '64px', backgroundColor: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <Lock size={32} color="#ef4444" />
            </div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#0f172a' }}>무료 작성 한도 초과</h2>
            <p style={{ color: '#475569', lineHeight: '1.6', marginBottom: '2rem', fontSize: '1rem' }}>
              무료 버전에서 제공하는 누적 견적서 발급 횟수 <b>(삭제 내역 포함 총 3건)</b>를 모두 소진하셨습니다.<br/><br/>
              <b>월 19,900원</b>의 PRO 요금제로 파격 업그레이드 하시면 <b>무제한 작성</b>과 함께 맞춤형 단가표, PDF 직인 삽입 등 모든 프리미엄 기능을 마음껏 누리실 수 있습니다!
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <button className="btn btn-primary" onClick={() => setShowPaymentModal(true)} style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem', fontWeight: 'bold' }}>PRO 무제한 기능 개방 (월 19,900원)</button>
              <button className="btn btn-outline" onClick={() => navigate('/list')} style={{ width: '100%' }}>목록으로 돌아가기</button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <PaymentModal 
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false);
            setShowPaywall(false);
            alert("PRO 승인 요청이 접수되었습니다! 관리자가 입금 내역을 확인한 후 빠르게 승인 처리해 드릴 예정입니다.");
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
