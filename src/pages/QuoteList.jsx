import React, { useEffect, useState, useRef, useMemo } from 'react';
import { getQuotes, deleteQuote, updateQuoteStatus } from '../services/quoteService';
import { getProfile } from '../services/profileService';
import { useAuth } from '../contexts/AuthContext';
import { Printer, X, Edit, Trash2, CheckCircle, Search, Image as ImageIcon, MessageCircle } from 'lucide-react';
import PrintTemplate from '../components/PrintTemplate';
import { useReactToPrint } from 'react-to-print';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { storage } from '../firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function QuoteList() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const printRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const filteredQuotes = useMemo(() => {
    if (!searchTerm) return quotes;
    const lowerSearch = searchTerm.toLowerCase();
    return quotes.filter(quote => {
      const matchName = quote.customerInfo?.name?.toLowerCase().includes(lowerSearch);
      const matchProject = quote.customerInfo?.project?.toLowerCase().includes(lowerSearch);
      const matchDate = quote.customerInfo?.date?.includes(lowerSearch);
      const matchItems = quote.items?.some(item => 
        item.name?.toLowerCase().includes(lowerSearch) ||
        item.specs?.toLowerCase().includes(lowerSearch)
      );
      return matchName || matchProject || matchDate || matchItems;
    });
  }, [quotes, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, quotes]);

  const totalPages = Math.max(1, Math.ceil(filteredQuotes.length / ITEMS_PER_PAGE));
  const paginatedQuotes = filteredQuotes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `견적서_${selectedQuote?.customerInfo?.project || Date.now()}`,
    pageStyle: "@page { size: A4; margin: 0; } @media print { body { -webkit-print-color-adjust: exact; } }"
  });

  const handleEdit = () => {
    navigate('/create', { state: { editQuote: selectedQuote } });
  };

  const handleDelete = async () => {
    if (window.confirm("정말로 이 견적서를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.")) {
      try {
        await deleteQuote(selectedQuote.id);
        setQuotes(quotes.filter(q => q.id !== selectedQuote.id));
        setSelectedQuote(null);
      } catch (err) {
        console.error("Delete error", err);
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const handleApprove = async () => {
    if (window.confirm("입금 및 계약이 확인되었습니까?\n승인 완료 처리 시 대시보드 당월 매출에 합산됩니다.")) {
      try {
        await updateQuoteStatus(selectedQuote.id, 'approved');
        setQuotes(quotes.map(q => q.id === selectedQuote.id ? { ...q, status: 'approved' } : q));
        setSelectedQuote({ ...selectedQuote, status: 'approved' });
      } catch (err) {
        console.error("Status update error", err);
        alert("상태 변경 중 오류가 발생했습니다.");
      }
    }
  };

  const captureImage = async () => {
    if (!printRef.current) return null;
    
    // Temporarily disable transform for better capture reliability
    const element = printRef.current;
    const parent = element.parentElement;
    const originalTransform = parent.style.transform;
    const originalMargin = parent.style.marginBottom;
    
    parent.style.transform = 'none';
    parent.style.marginBottom = '0';
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      return canvas;
    } catch (error) {
      console.error("Capture failed:", error);
      return null;
    } finally {
      parent.style.transform = originalTransform;
      parent.style.marginBottom = originalMargin;
    }
  };

  const handleSaveImage = async () => {
    setIsPreparing(true);
    try {
      const canvas = await captureImage();
      if (!canvas) return;
      
      const link = document.createElement('a');
      link.download = `견적서_${selectedQuote.customerInfo.project || '미정'}_${selectedQuote.customerInfo.name || '고객'}.png`;
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
      alert("카카오 SDK를 불러오지 못했습니다. 페이지를 새로고침해 주세요.");
      return;
    }

    // Defensive initialization check
    if (!window.Kakao.isInitialized()) {
      const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY;
      if (kakaoKey) {
        window.Kakao.init(kakaoKey);
      } else {
        alert("카카오 앱 키가 설정되지 않았습니다.");
        return;
      }
    }

    setIsPreparing(true);
    try {
      const canvas = await captureImage();
      if (!canvas) {
        alert("이미지 생성에 실패했습니다.");
        return;
      }

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(b => b ? resolve(b) : reject(new Error("Blob conversion failed")), 'image/jpeg', 0.9);
      });
      
      const fileName = `shares/${currentUser?.uid || 'anon'}_${Date.now()}.jpg`;
      const fileRef = storageRef(storage, fileName);
      await uploadBytes(fileRef, blob);
      const imageUrl = await getDownloadURL(fileRef);

      if (window.Kakao.Share) {
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: `[견적서] ${selectedQuote.customerInfo.project || '견적 안내'}`,
            description: `${selectedQuote.customerInfo.company || ''} ${selectedQuote.customerInfo.name || '고객'}님께 드리는 견적서입니다.\n합계금액: ${selectedQuote.grandTotal.toLocaleString()}원`,
            imageUrl: imageUrl,
            link: {
              mobileWebUrl: window.location.origin,
              webUrl: window.location.origin,
            },
          },
          buttons: [
            {
              title: '전체 내역 보기',
              link: {
                mobileWebUrl: window.location.origin,
                webUrl: window.location.origin,
              },
            },
          ],
        });
      } else {
        throw new Error("Kakao.Share undefined");
      }
    } catch (error) {
      console.error("Kakao share failed:", error);
      alert(`카카오톡 공유 실패: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setIsPreparing(false);
    }
  };

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const data = await getQuotes(currentUser.uid);
        setQuotes(data);
        const profile = await getProfile(currentUser.uid);
        if (profile) setCompanyProfile(profile);
      } catch (err) {
        console.error("Fetch quotes error", err);
        setError("데이터를 불러올 수 없습니다. Firebase 설정을 확인해주세요.");
      } finally {
        setLoading(false);
      }
    };
    if (currentUser?.uid) {
      fetchQuotes();
    }
  }, [currentUser?.uid]);

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1rem' }}>전체 견적 내역</h2>
      <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>저장된 모든 견적서를 확인하고 관리할 수 있습니다.</p>

      {error && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>{error}</div>}

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.6rem 1rem', width: '100%', maxWidth: '400px' }}>
        <Search size={18} color="#94a3b8" style={{ marginRight: '0.5rem' }} />
        <input 
          type="text" 
          placeholder="고객명, 현장명, 날짜 또는 항목 검색..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem', background: 'transparent' }}
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-light)' }}>
              <th style={{ padding: '1rem 0.5rem' }}>견적일자</th>
              <th style={{ padding: '1rem 0.5rem' }}>고객명</th>
              <th style={{ padding: '1rem 0.5rem' }}>현장명</th>
              <th style={{ padding: '1rem 0.5rem' }}>항목 수</th>
              <th style={{ padding: '1rem 0.5rem' }}>총 금액</th>
              <th style={{ padding: '1rem 0.5rem' }}>상태</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-light)' }}>
                  불러오는 중...
                </td>
              </tr>
            ) : quotes.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-light)' }}>
                  등록된 견적서가 없습니다.
                </td>
              </tr>
            ) : paginatedQuotes.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-light)' }}>
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              paginatedQuotes.map(quote => (
                <tr key={quote.id} onClick={() => setSelectedQuote(quote)} style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '1rem 0.5rem' }}>{quote.customerInfo?.date}</td>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{quote.customerInfo?.name}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>{quote.customerInfo?.project}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>{quote.items?.length || 0} 개</td>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 'bold' }}>{quote.grandTotal?.toLocaleString()} 원</td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', backgroundColor: '#e2e8f0', color: '#475569' }}>
                      {quote.status === 'pending' ? '대기/보류' : quote.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
          <button 
            className="btn btn-outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            style={{ padding: '0.4rem 0.8rem' }}
          >
            이전
          </button>
          <span style={{ fontWeight: 500, color: 'var(--text-main)', fontSize: '0.95rem' }}>
            {currentPage} / {totalPages}
          </span>
          <button 
            className="btn btn-outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            style={{ padding: '0.4rem 0.8rem' }}
          >
            다음
          </button>
        </div>
      )}

      {selectedQuote && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setSelectedQuote(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
              <X size={24} color="#64748b" />
            </button>
            <h2 style={{ marginBottom: '1.5rem', paddingRight: '2rem' }}>견적서 상세현황</h2>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={handlePrint}>
                <Printer size={18} /> PDF/인쇄
              </button>
              <button className="btn btn-outline" onClick={handleSaveImage} disabled={isPreparing} style={{ color: '#10b981', borderColor: '#10b981' }}>
                <ImageIcon size={18} /> 이미지 저장
              </button>
              <button className="btn btn-outline" onClick={handleShareKakao} disabled={isPreparing} style={{ color: '#3A1D1D', borderColor: '#FEE500', backgroundColor: '#FEE500' }}>
                <MessageCircle size={18} /> 카톡 공유
              </button>
              {selectedQuote.status === 'pending' && (
                <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#059669', borderColor: '#059669' }} onClick={handleApprove}>
                  <CheckCircle size={18} /> 입금/승인 완료
                </button>
              )}
              {selectedQuote.status === 'pending' && (
                <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={handleEdit}>
                  <Edit size={18} /> 수정
                </button>
              )}
              <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }} onClick={handleDelete}>
                <Trash2 size={18} /> 삭제
              </button>
            </div>

            <div style={{ border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '4px', background: '#e2e8f0', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
              <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center', marginBottom: '-50mm' }}>
                <PrintTemplate
                  ref={printRef}
                  customerInfo={selectedQuote.customerInfo}
                  items={selectedQuote.items}
                  subTotal={selectedQuote.subTotal}
                  vat={selectedQuote.vat}
                  grandTotal={selectedQuote.grandTotal}
                  providerInfo={companyProfile}
                  includeVat={selectedQuote.includeVat !== false}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
