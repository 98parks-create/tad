import React, { useEffect, useState, useRef, useMemo } from 'react';
import { getQuotes, deleteQuote, updateQuoteStatus } from '../services/quoteService';
import { getProfile } from '../services/profileService';
import { useAuth } from '../contexts/AuthContext';
import { Printer, X, Edit, Trash2, CheckCircle, Search, Image as ImageIcon, MessageCircle, Copy, FileSpreadsheet } from 'lucide-react';
import PrintTemplate from '../components/PrintTemplate';
import { useReactToPrint } from 'react-to-print';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
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

  // [신규] 태블릿/모바일 통합 감지 로직 (컴포넌트 레벨로 이동)
  const isMobileTarget = useMemo(() => {
    if (typeof window === 'undefined' || !navigator) return false;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 0 && /Macintosh/.test(navigator.userAgent));
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator?.standalone === true;
    return isMobile || isStandalone;
  }, []);

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

  // [표준] PC 전용 인쇄 핸들러
  const handlePrintStandard = useReactToPrint({
    contentRef: printRef,
    documentTitle: `(${selectedQuote?.customerInfo?.project || '현장명'})+견적서`,
    pageStyle: `
      @page { size: A4; margin: 10mm; }
      @media print {
        .print-template { box-shadow: none !important; margin: 0 auto !important; }
      }
    `
  });

  // [신규] 통합 PDF 액션 핸들러 (인쇄/공유 로직 단일화)
  const handlePrint = async (e) => {
    if (e) e.preventDefault();

    // PC 웹: 표준 브라우저 인쇄 모드 (Native)
    if (!isMobileTarget) {
      handlePrintStandard();
      return;
    }

    // 모바일/태블릿 (PWA 포함): 직접 공유 실행
    setIsPreparing(true);
    try {
      const result = await generatePDF();
      if (result && result.pdfBlob) {
        const fileName = `(${selectedQuote.customerInfo.project || '현장명'})+견적서.pdf`; 
        const pdfFile = new File([result.pdfBlob], fileName, { type: 'application/pdf' });
        
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
          await navigator.share({
            files: [pdfFile]
          });
        } else {
          // 공유 미지원 시 브라우저 기본 다운로드/열기 시도
          downloadFile(result.pdfBlob, fileName);
        }
      } else {
        alert("PDF 생성에 실패했습니다.");
      }
    } catch (err) {
      console.error("Mobile print error:", err);
      alert("출력 준비 중 오류가 발생했습니다.");
    } finally {
      setIsPreparing(false);
    }
  };

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
    downloadFile(blob, `홈택스업로드용_${selectedQuote.customerInfo.project || '미정'}.csv`);
  };

  // [보강] 범용 다운로드 & 메모리 해제 헬퍼 (Standalone 모드 오류 대응)
  const downloadFile = (blob, fileName) => {
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();

      // 즉시 제거 및 URL 해제 (연속 다운로드 보안 대응 및 메모리 초기화)
      setTimeout(() => {
        if (document.body.contains(link)) document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 150);
    } catch (e) {
      console.error("Download failed:", e);
    }
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
        const updatedQuote = {
          ...selectedQuote,
          status: 'approved'
        };

        await updateQuoteStatus(selectedQuote.id, 'approved');
        setQuotes(quotes.map(q => q.id === selectedQuote.id ? { ...q, status: 'approved' } : q));
        setSelectedQuote(updatedQuote);
        alert("승인 처리가 완료되었습니다. 대시보드 매출에 반영됩니다.");
      } catch (err) {
        console.error("Status update error", err);
        alert("상태 변경 중 오류가 발생했습니다.");
      }
    }
  };

  // [신규] 고해상도 이미지 캡처 통합 엔진 (scale: 2.5 고정)
  const captureImage = async () => {
    if (!printRef.current) return null;
    const element = printRef.current;

    try {
      // 폰트 및 이미지 로드 상태 완벽 대기
      await document.fonts.ready;
      const images = Array.from(element.getElementsByTagName('img'));
      await Promise.all(images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }));

      // 레이아웃 안정화 대기
      await new Promise(resolve => setTimeout(resolve, 400));

      const canvas = await html2canvas(element, {
        scale: 2.5, 
        useCORS: true,
        allowTaint: true,
        letterRendering: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // [핵심] 캡처용 복제 문서의 스타일 환경을 완벽히 표준화 (PC/모바일 공통 적용)
          const clonedElement = clonedDoc.getElementById('pdf-capture-area');
          if (clonedElement) {
            // 부모 트리의 모든 간섭 제거 (폭과 높이 제한 해제)
            let current = clonedElement.parentElement;
            while (current && current !== clonedDoc.body) {
              current.style.margin = '0';
              current.style.padding = '0';
              current.style.display = 'block';
              current.style.width = 'auto';
              current.style.height = 'auto';
              current.style.overflow = 'visible';
              current.style.transform = 'none';
              current = current.parentElement;
            }

            // 출력물 규격 강제 (A4 @ 96DPI = 794px x 1123px)
            clonedElement.style.width = '794px'; 
            clonedElement.style.height = '1123px';
            clonedElement.style.minWidth = '794px';
            clonedElement.style.minHeight = '1123px';
            clonedElement.style.transform = 'none';
            clonedElement.style.margin = '0';
            clonedElement.style.boxShadow = 'none';
            clonedElement.style.padding = '10mm 15mm'; // 표준 여백 재부여
            
            // 내부 스케일링 요소가 있다면 캡처 시엔 1로 초기화 (또는 contentScale 유지)
            const innerWrapper = clonedElement.firstElementChild;
            if (innerWrapper) {
              innerWrapper.style.width = '100%';
              innerWrapper.style.height = '100%';
            }
          }
        }
      });
      return canvas;
    } catch (error) {
      console.error("Capture failed:", error);
      return null;
    }
  };

  // [신규] PDF/이미지 병행 생성 엔진 (A4 규격 강제 및 성능 최적화)
  const generatePDF = async () => {
    const canvas = await captureImage();
    if (!canvas) return null;

    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.98);
      
      // Blob 변환을 비선점형(Promise)으로 처리하여 성능 확보
      const imgBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.98));

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      
      return {
        pdfBlob: pdf.output('blob'),
        imgBlob: imgBlob,
        dataUrl: dataUrl
      };
    } catch (err) {
      console.error("Format generation failed:", err);
      return null;
    }
  };

  const [previewScale, setPreviewScale] = useState(0.85);

  useEffect(() => {
    const updateScale = () => {
      if (window.innerWidth >= 1024) {
        setPreviewScale(0.85);
        return;
      }
      const availableWidth = window.innerWidth - 48;
      const documentWidth = 794;
      const newScale = availableWidth / documentWidth;
      setPreviewScale(Math.min(newScale, 1));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // [신규] 배경 이미지 선성성(Pre-capture) 상태 관리
  const [preparedData, setPreparedData] = useState(null);

  // [신규] 상세페이지 오픈 시 배경에서 미리 견적서 파일 생성 (제스처 지연 방지)
  useEffect(() => {
    if (selectedQuote) {
      setPreparedData(null); // 초기화
      const timer = setTimeout(async () => {
        try {
          const result = await generatePDF();
          if (result) {
            const baseFileName = `(${selectedQuote.customerInfo.project || '현장명'})+견적서`;
            const imgFile = new File([result.imgBlob], `${baseFileName}.jpg`, { type: 'image/jpeg' });
            const pdfFile = new File([result.pdfBlob], `${baseFileName}.pdf`, { type: 'application/pdf' });
            
            setPreparedData({
              ...result,
              imgFile,
              pdfFile,
              fileName: baseFileName
            });
          }
        } catch (err) {
          console.error("Pre-capture failed:", err);
        }
      }, 1000); // 1초 대기 (모바일 및 저사양 기기 렌더링 완료 후 안정적으로 캡처 시작)
      return () => clearTimeout(timer);
    }
  }, [selectedQuote]);

  // [개선] 이미지 전용 저장 핸들러 (모바일 웹: 공유 모달 형식으로 일원화)
  const handleSaveImage = async () => {
    if (!preparedData) {
      alert("데이터를 준비 중입니다. 잠시만 기다려주세요.");
      return;
    }

    if (isMobileTarget) {
      /** 모바일 웹: 사장님 요청에 따라 [카톡 공유]와 똑같은 모달 실행 **/
      // 여기서 [이미지 저장]을 선택하면 사진첩(앨범)으로 바로 들어갑니다.
      handleShareKakao();
    } else {
      /** PC 웹: 직접 다운로드 **/
      downloadFile(preparedData.imgBlob, `${preparedData.fileName}.jpg`);
      alert("이미지가 성공적으로 저장되었습니다.");
    }
  };

  // [개선] 카카오톡 공유 핸들러 (즉시 실행 - 파일 기반 공유 고도화)
  const handleShareKakao = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!preparedData) {
      alert("견적서를 생성 중입니다. 잠시만 기다려주세요.");
      return;
    }

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    
    setIsPreparing(true);
    try {
      const { pdfBlob, imgBlob, imgFile, pdfFile, fileName } = preparedData;

      // 1. [기기 및 접속 환경별 분기 처리]
      if (isStandalone) {
        /** [1] 설치형 앱(PWA): PDF 저장 + PDF 파일 공유 **/
        downloadFile(pdfBlob, `${fileName}.pdf`);
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
          await navigator.share({
            files: [pdfFile],
            url: undefined // 브라우저가 현재 주소를 임의로 추가하는 것을 방지
          });
        }
      } else if (isMobileTarget) {
        /** [2] 모바일 웹(브라우저): 통합 공유창 (PDF 파일 그대로 전송) **/
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
          try {
            await navigator.share({
              files: [pdfFile],
              url: undefined // 브라우저가 현재 주소를 임의로 추가하는 것을 방지
            });
          } catch (shareErr) {
            if (shareErr.name !== 'AbortError') throw shareErr;
          }
        } else {
          downloadFile(pdfBlob, `${fileName}.pdf`);
          alert("견적서 파일이 다운로드되었습니다.");
        }
      } else {
        /** [3] PC 웹: 이미지 복사 + PDF 저장 + PDF 즉시 열기 (진짜 "파일" 공유 연계) **/
        // 1. 견적서 이미지를 클립보드에 자동으로 복사 (사장님 요청: 웹/앱처럼 이미지 전송 느낌)
        try {
          // 최신 브라우저의 클립보드 기능을 사용하여 이미지 데이터를 복사함.
          const data = [new ClipboardItem({ [imgBlob.type]: imgBlob })];
          await navigator.clipboard.write(data);
        } catch (clipboardErr) {
          console.error("Clipboard copy failed:", clipboardErr);
        }

        // 2. PDF 파일 즉시 저장 (사장님 필수 요청 - 자동 열기는 제거됨)
        downloadFile(pdfBlob, `${fileName}.pdf`);

        // 3. 최종 안내 (주소 링크창은 사장님 요청으로 완전히 제거됨)
        alert("견적서 파일이 저장되었습니다. 카카오톡 대화방으로 파일을 끌어넣어 전송해 주세요.");
      }
    } catch (error) {
      console.error("Share process failed:", error);
      if (!isMobileTarget) alert("공유 준비 중 예상치 못한 오류가 발생했습니다.");
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
                width: '794px',
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
                  isMobile={isMobileTarget}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
