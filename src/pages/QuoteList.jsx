import React, { useEffect, useState, useRef, useMemo } from 'react';
import { getQuotes, deleteQuote, updateQuoteStatus } from '../services/quoteService';
import { getProfile } from '../services/profileService';
import { useAuth } from '../contexts/AuthContext';
import { Printer, X, Edit, Trash2, CheckCircle, Search, Image as ImageIcon, MessageCircle, Copy, FileSpreadsheet } from 'lucide-react';
import PrintTemplate from '../components/PrintTemplate';
import { useReactToPrint } from 'react-to-print';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { storage } from '../firebase';
import { ref as storageRef } from 'firebase/storage';

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

  const handleCopyQuote = () => {
    if (window.confirm("이 견적을 기반으로 새로운 견적서를 작성하시겠습니까?\n(날짜는 오늘로 자동 설정됩니다)")) {
      const copiedQuote = {
        ...selectedQuote,
        id: null,
        customerInfo: {
          ...selectedQuote.customerInfo,
          date: new Date().toISOString().split('T')[0]
        },
        status: 'pending'
      };
      navigate('/create', { state: { editQuote: copiedQuote } });
    }
  };

  const handleHometaxExport = () => {
    if (!selectedQuote) return;

    const rows = [
      ['작성일자', '공급받는자상호', '품목', '규격', '수량', '단가', '공급가액', '세액', '비고']
    ];

    selectedQuote.items.forEach(item => {
      const itemVat = selectedQuote.includeVat !== false ? Math.floor(item.total * 0.1) : 0;
      rows.push([
        selectedQuote.customerInfo.date.replace(/-/g, ''), // YYYYMMDD
        selectedQuote.customerInfo.company || selectedQuote.customerInfo.name,
        item.name,
        item.specification || '',
        item.quantity,
        item.unitPrice,
        item.total,
        itemVat,
        item.remarks || ''
      ]);
    });

    const csvContent = "\uFEFF" + rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `홈택스업로드용_${selectedQuote.customerInfo.project || '미정'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  // handleApprove 함수 부분만 수정 제안
  const handleApprove = async () => {
    if (window.confirm("입금 및 계약이 확인되었습니까?\n승인 완료 처리 시 대시보드 당월 매출에 합산됩니다.")) {
      try {
        // [보강] 만약 날짜에 점(.)이 있다면 하이픈(-)으로 통일하여 업데이트하면 
        // 대시보드에서 날짜 인식이 훨씬 정확해집니다.
        const updatedQuote = {
          ...selectedQuote,
          status: 'approved'
        };

        await updateQuoteStatus(selectedQuote.id, 'approved');

        // 로컬 상태 업데이트
        setQuotes(quotes.map(q => q.id === selectedQuote.id ? { ...q, status: 'approved' } : q));
        setSelectedQuote(updatedQuote);

        // 성공 알림 (선택 사항)
        alert("승인 처리가 완료되었습니다. 대시보드 매출에 반영됩니다.");
      } catch (err) {
        console.error("Status update error", err);
        alert("상태 변경 중 오류가 발생했습니다.");
      }
    }
  };
  const captureImage = async () => {
    if (!printRef.current) return null;

    const element = printRef.current;

    // Wait for all images to be loaded
    const images = Array.from(element.getElementsByTagName('img'));
    await Promise.all(images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve; // Continue even if one image fails
      });
    }));

    // Add a small delay for any layout settling
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // Find the template in the cloned document
          // We search by style or structure since we don't have a unique ID easily available here
          // But we can identify it by the fact it's the 210mm wide div
          const clonedElement = Array.from(clonedDoc.getElementsByTagName('div')).find(div => div.style.width === '210mm');
          if (clonedElement && clonedElement.parentElement) {
            clonedElement.parentElement.className = '';
            clonedElement.parentElement.style.transform = 'none';
            clonedElement.parentElement.style.marginBottom = '0';
            clonedElement.parentElement.style.display = 'block';
            clonedElement.parentElement.style.zoom = '1';
          }
        }
      });
      return canvas;
    } catch (error) {
      console.error("Capture failed:", error);
      return null;
    }
  };

  const handleSaveImage = async () => {
    setIsPreparing(true);
    // Give modal time to settle (solve first-try failure)
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const canvas = await captureImage();
      if (!canvas) {
        alert("이미지 생성에 실패했습니다.");
        return;
      }

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

  const [previewScale, setPreviewScale] = useState(0.85);

  // [다이내믹 스케일링 로직] PC는 보호하고 모바일/태블릿만 해상도에 맞춰 꽉 차게!
  useEffect(() => {
    const updateScale = () => {
      // PC(1024px) 이상이면 사용자님이 원하시는 0.85 고정
      if (window.innerWidth >= 1024) {
        setPreviewScale(0.85);
        return;
      }
      
      // 모바일/태블릿이면 해상도에 맞춰 꽉 차게 계산 (원래 로직 복원)
      const availableWidth = window.innerWidth - 48; // 모달 좌우 여백 제외
      const documentWidth = 794; // 약 210mm
      const newScale = availableWidth / documentWidth;
      setPreviewScale(Math.min(newScale, 1));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const handleShareKakao = async () => {
    setIsPreparing(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const canvas = await captureImage();
      if (!canvas) {
        alert("이미지 생성에 실패했습니다.");
        setIsPreparing(false);
        return;
      }

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(b => b ? resolve(b) : reject(new Error("Blob conversion failed")), 'image/jpeg', 0.8);
      });

      const file = new File([blob], `견적서_${selectedQuote.customerInfo.project || '미정'}.jpg`, { type: 'image/jpeg' });

      // [핵심 개선] 모바일 웹/앱 모든 환경에서 카톡 앱 즉시 호출을 위해 Web Share API 우선 사용
      if (navigator.share) {
        try {
          await navigator.share({
            title: `[견적서] ${selectedQuote.customerInfo.project || '안내'}`,
            text: `${selectedQuote.customerInfo.company || ''} ${selectedQuote.customerInfo.name || '고객'}님 견적서입니다.\n전체 확인: https://tadsmart.co.kr`,
            files: [file]
          });
          setIsPreparing(false);
          return;
        } catch (shareError) {
          console.log("Navigator share failed:", shareError.name);
          if (shareError.name === 'AbortError') {
            setIsPreparing(false);
            return;
          }
        }
      }

      // [기존 SDK 방식 - 폴백 및 데스크톱]
      if (!window.Kakao) {
        alert("카카오 SDK를 불러오지 못했습니다.");
        setIsPreparing(false);
        return;
      }

      if (!window.Kakao.isInitialized()) {
        const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY;
        if (kakaoKey) window.Kakao.init(kakaoKey);
      }

      const uploadResult = await window.Kakao.Share.uploadImage({
        file: [file]
      });
      const imageUrl = uploadResult.infos.original.url;

      if (window.Kakao.Share) {
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: `[견적서] ${selectedQuote.customerInfo.project || '안내'}`,
            description: `${selectedQuote.customerInfo.company || ''} ${selectedQuote.customerInfo.name || '고객'}님 견적서입니다.\n합계금액: ${selectedQuote.grandTotal.toLocaleString()}원`,
            imageUrl: imageUrl,
            link: {
              mobileWebUrl: 'https://tadsmart.co.kr',
              webUrl: 'https://tadsmart.co.kr',
            },
          },
          buttons: [
            {
              title: '웹사이트 바로가기',
              link: {
                mobileWebUrl: 'https://tadsmart.co.kr',
                webUrl: 'https://tadsmart.co.kr',
              },
            },
          ],
        });
      }
    } catch (error) {
      console.error("Share error:", error);
      alert(`공유 중 오류가 발생했습니다: ${error.message}`);
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

  // 렌더링에 필요한 추가 상태가 없음

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
              <button className="btn btn-outline" onClick={handleEdit}>
                <Edit size={18} /> 수정
              </button>
              <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6366f1', borderColor: '#6366f1' }} onClick={handleCopyQuote}>
                <Copy size={18} /> 견적 복사
              </button>
              <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0ea5e9', borderColor: '#0ea5e9' }} onClick={handleHometaxExport} title="국세청 홈택스 일괄발행 양식(CSV)">
                <FileSpreadsheet size={18} /> 홈택스 엑셀
              </button>
              <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }} onClick={handleDelete}>
                <Trash2 size={18} /> 삭제
              </button>
            </div>

            <div className="print-preview-container" style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              overflow: 'hidden', 
              width: '100%',
              backgroundColor: '#cbd5e1',
              borderRadius: '8px',
              padding: '1rem 0'
            }}>
              <div style={{ 
                transform: `scale(${previewScale})`, 
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease',
                width: '794px', // 210mm
                minWidth: '794px'
              }}>
                <PrintTemplate
                  ref={printRef}
                  customerInfo={selectedQuote.customerInfo || {}}
                  items={selectedQuote.items || []}
                  subTotal={selectedQuote.subTotal}
                  vat={selectedQuote.vat}
                  grandTotal={selectedQuote.grandTotal}
                  discount={selectedQuote.discount}
                  discountReason={selectedQuote.discountReason}
                  remarks={selectedQuote.remarks}
                  attachedImages={selectedQuote.attachedImages}
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
