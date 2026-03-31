import React, { forwardRef } from 'react';
import html2canvas from 'html2canvas';

const PrintTemplate = forwardRef(({ customerInfo, items, subTotal, discount, discountReason, vat, grandTotal, providerInfo, remarks, includeVat = true, attachedImages = [] }, ref) => {
  const itemCount = items.length;
  const hasImages = attachedImages && attachedImages.length > 0;

  let compactLevel = 'normal';
  if (hasImages) {
    if (itemCount > 12) compactLevel = 'very-dense';
    else if (itemCount > 6) compactLevel = 'dense';
  } else {
    if (itemCount > 16) compactLevel = 'very-dense';
    else if (itemCount > 10) compactLevel = 'dense';
  }

  const styles = {
    tableFontSize: compactLevel === 'very-dense' ? '8pt' : compactLevel === 'dense' ? '8.5pt' : '9.5pt',
    cellPadding: compactLevel === 'very-dense' ? '3px 2px' : compactLevel === 'dense' ? '5px 4px' : '6px 5px',
    headerPadding: compactLevel === 'very-dense' ? '5px 2px' : compactLevel === 'dense' ? '6px 4px' : '8px 5px',
    rowHeight: compactLevel === 'very-dense' ? '18px' : compactLevel === 'dense' ? '24px' : '30px',
    topBottomPadding: compactLevel === 'very-dense' ? '5mm 15mm' : '10mm 15mm',
    titleMargin: compactLevel === 'very-dense' ? '3mm 0' : '6mm 0 4mm 0',
    headerMarginBottom: compactLevel === 'very-dense' ? '2mm' : '4mm',
  };

  // 요청하신 FIFO 정렬 (먼저 쓴 게 위로)
  const sortedItems = [...items].reverse();

  // [추가 기능] 카카오톡/모바일 이미지 공유 로직
  const handleShare = async () => {
    if (!ref.current) return;
    try {
      const canvas = await html2canvas(ref.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `견적서_${customerInfo.name || '공유'}.png`, { type: 'image/png' });

        // 모바일 브라우저 표준 공유 기능 (Web Share API)
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: '견적서 송부',
            text: `${customerInfo.company || ''} ${customerInfo.name || ''}님 견적서입니다.`,
          });
        } else {
          // PC나 지원하지 않는 브라우저의 경우 이미지 다운로드로 대체
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `견적서_${customerInfo.name || '다운로드'}.png`;
          link.click();
        }
      }, 'image/png');
    } catch (err) {
      console.error("공유 중 오류 발생:", err);
      alert("이미지 생성 중 오류가 발생했습니다.");
    }
  };

  return (
    <div style={{ width: '100%', backgroundColor: '#f1f5f9', padding: '20px 0' }}>
      {/* 공유 버튼: 인쇄 시에는 보이지 않도록 'no-print' 클래스 권장 */}
      <div style={{ width: '210mm', margin: '0 auto 10px auto', textAlign: 'right' }}>
        <button
          onClick={handleShare}
          style={{
            padding: '10px 20px',
            backgroundColor: '#FEE500',
            color: '#3C1E1E',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          카톡/이미지 공유하기
        </button>
      </div>

      {/* 견적서 본문 영역 */}
      <div ref={ref} className="print-template" style={{ padding: styles.topBottomPadding, width: '210mm', minHeight: '290mm', boxSizing: 'border-box', margin: '0 auto', backgroundColor: 'white', color: 'black', fontFamily: "'Noto Sans KR', sans-serif", display: 'flex', flexDirection: 'column', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: styles.headerMarginBottom, borderBottom: '2px solid #003366', paddingBottom: '2mm', paddingTop: '5mm' }}>
          <h1 style={{ color: '#003366', fontSize: '28pt', margin: '0 0 4mm 0', letterSpacing: '6px', fontWeight: 900 }}>견 적 서</h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'left', fontSize: '11pt' }}>
            <div style={{ lineHeight: '1.5', marginTop: '5px' }}>
              <p style={{ margin: 0, fontSize: '11pt' }}><strong>견적일자:</strong> {customerInfo.date}</p>
              <p style={{ margin: '8px 0' }}>
                <span style={{ fontSize: '15pt', fontWeight: 'bold', borderBottom: '2px solid #000', paddingBottom: '2px' }}>
                  {customerInfo.company ? `${customerInfo.company} ` : ''}
                  {customerInfo.name ? `${customerInfo.name}` : '___________'}
                </span>
                <span style={{ fontSize: '12pt', fontWeight: 'bold' }}> 귀하</span>
              </p>
              <p style={{ margin: 0, fontSize: '10.5pt' }}><strong>연락처:</strong> {customerInfo.phone || '___________'}</p>
              <p style={{ margin: 0, fontSize: '10.5pt' }}><strong>현장명:</strong> {customerInfo.project || '___________'}</p>
              <p style={{ margin: '15px 0 0 0', fontSize: '11pt', fontWeight: 'bold' }}>아래와 같이 견적합니다.</p>
            </div>
            <div style={{ border: '2px solid #000', padding: '12px', borderRadius: '4px', lineHeight: '1.5', width: '260px', fontSize: '10.5pt', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                <span style={{ fontWeight: 'bold' }}>공급자</span>
                <span style={{ color: '#000', fontWeight: 'bold' }}>(인)</span>
              </div>
              {providerInfo?.stampImage && (
                <img
                  src={providerInfo.stampImage}
                  alt="직인"
                  style={{ position: 'absolute', right: '8px', top: '8px', width: '45px', height: '45px', mixBlendMode: 'multiply', zIndex: 1 }}
                />
              )}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <p style={{ margin: '5px 0 0 0' }}>상호: <b>{providerInfo?.companyName || '__________________'}</b></p>
                <p style={{ margin: '2px 0 0 0' }}>대표자: {providerInfo?.ceoName || '__________________'}</p>
                <p style={{ margin: '2px 0 0 0' }}>등록번호: {providerInfo?.businessNumber || '__________________'}</p>
                <p style={{ margin: '2px 0 0 0' }}>주소: {providerInfo?.address || '__________________'}</p>
                <p style={{ margin: '2px 0 0 0' }}>연락처: {providerInfo?.phone || '__________________'}</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ margin: styles.titleMargin, padding: '12px 16px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', gap: '1rem', border: '2px solid #000', borderLeft: '8px solid #003366', borderRadius: '4px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '13pt', color: '#0f172a' }}>총 견적 금액 (VAT {includeVat ? '포함' : '별도'}):</span>
          <span style={{ fontSize: '16pt', fontWeight: '900', color: '#000' }}>
            {(grandTotal || 0) > 0 ? `일금 ${(grandTotal || 0).toLocaleString()} 원 정 (₩ ${(grandTotal || 0).toLocaleString()})` : '- 원'}
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: styles.tableFontSize, marginBottom: '5mm', pageBreakInside: 'avoid', border: '2px solid #000' }}>
          <thead>
            <tr>
              <th style={{ padding: styles.headerPadding, backgroundColor: '#f1f5f9', border: '1px solid #000' }}>No</th>
              <th style={{ padding: styles.headerPadding, backgroundColor: '#f1f5f9', border: '1px solid #000' }}>품목/자재명</th>
              <th style={{ padding: styles.headerPadding, backgroundColor: '#f1f5f9', border: '1px solid #000' }}>규격(가로x세로)</th>
              <th style={{ padding: styles.headerPadding, backgroundColor: '#f1f5f9', border: '1px solid #000' }}>수량</th>
              <th style={{ padding: styles.headerPadding, backgroundColor: '#f1f5f9', border: '1px solid #000' }}>단위</th>
              <th style={{ padding: styles.headerPadding, backgroundColor: '#f1f5f9', border: '1px solid #000' }}>단가</th>
              <th style={{ padding: styles.headerPadding, backgroundColor: '#f1f5f9', border: '1px solid #000' }}>공급가액</th>
              <th style={{ padding: styles.headerPadding, backgroundColor: '#f1f5f9', border: '1px solid #000' }}>비고</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item, i) => (
              <tr key={i}>
                <td style={{ padding: styles.cellPadding, border: '1px solid #000', textAlign: 'center' }}>{i + 1}</td>
                <td style={{ padding: styles.cellPadding, border: '1px solid #000', fontWeight: '500' }}>{item.name}</td>
                <td style={{ padding: styles.cellPadding, border: '1px solid #000', textAlign: 'center' }}>{item.specification || (item.type === 'area' && item.width && item.height ? `${item.width}*${item.height}` : '-')}</td>
                <td style={{ padding: styles.cellPadding, border: '1px solid #000', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: styles.cellPadding, border: '1px solid #000', textAlign: 'center' }}>{item.unit || 'EA'}</td>
                <td style={{ padding: styles.cellPadding, border: '1px solid #000', textAlign: 'right' }}>{Number(item.unitPrice || 0).toLocaleString()}</td>
                <td style={{ padding: styles.cellPadding, border: '1px solid #000', textAlign: 'right', fontWeight: 'bold' }}>{Number(item.total || 0).toLocaleString()}</td>
                <td style={{ padding: styles.cellPadding, border: '1px solid #000' }}>{item.remarks}</td>
              </tr>
            ))}
            {Array.from({ length: Math.max(0, 8 - sortedItems.length) }).map((_, i) => (
              <tr key={`empty-${i}`} style={{ height: styles.rowHeight }}>
                <td colSpan="8" style={{ border: '1px solid #000' }}></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginBottom: '5mm' }}>
          <table style={{ width: '420px', borderCollapse: 'collapse', fontSize: '11pt', border: '2px solid #000' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#f8fafc', fontWeight: 'bold', width: '160px' }}>공급가액</td>
                <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', backgroundColor: '#ffffff' }}>{Number(subTotal || 0).toLocaleString()} 원</td>
              </tr>
              {(discount || 0) > 0 && (
                <tr>
                  <td style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#fff9c4', fontWeight: 'bold' }}>
                    할인액 <span style={{ fontSize: '9pt', fontWeight: 'normal', marginLeft: '4px' }}>{discountReason ? `(${discountReason})` : ''}</span>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', color: '#d32f2f', fontWeight: 'bold', backgroundColor: '#ffffff' }}>
                    - {Number(discount || 0).toLocaleString()} 원
                  </td>
                </tr>
              )}
              <tr>
                <td style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#f8fafc', fontWeight: 'bold' }}>부가세 (VAT)</td>
                <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', backgroundColor: '#ffffff' }}>{(vat || 0).toLocaleString()} 원</td>
              </tr>
              <tr>
                <td style={{ border: '2px solid #000', padding: '12px 8px', backgroundColor: '#f1f5f9', color: '#000', fontWeight: '900', fontSize: '14pt' }}>총 합 계</td>
                <td style={{ border: '2px solid #000', padding: '12px 8px', textAlign: 'right', fontWeight: '900', fontSize: '16pt', color: '#003366', backgroundColor: '#ffffff' }}>{(grandTotal || 0).toLocaleString()} 원</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: compactLevel === 'very-dense' ? '2mm' : '5mm', paddingBottom: '3mm' }}>
          {remarks && (
            <div style={{ marginBottom: compactLevel === 'very-dense' ? '2mm' : '5mm', textAlign: 'left', fontSize: '10pt', color: '#334155', backgroundColor: '#f1f5f9', padding: '12px 16px', borderRadius: '4px', border: '1px solid #cbd5e1', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              <strong>[ 특약사항 및 공지 ]</strong><br />
              {remarks}
            </div>
          )}
          <div style={{ textAlign: 'center', fontSize: '11pt', color: '#0f172a', borderTop: '2px dashed #94a3b8', paddingTop: '8mm', marginTop: compactLevel === 'very-dense' ? '2mm' : '5mm', fontWeight: 'bold', letterSpacing: '2px' }}>
            상기와 같이 견적합니다.
          </div>
        </div>

        {attachedImages && attachedImages.length > 0 && (
          <div style={{ marginTop: compactLevel === 'very-dense' ? '5mm' : '10mm', pageBreakInside: 'avoid' }}>
            <h3 style={{ fontSize: '11pt', borderBottom: '2px solid #00083a', paddingBottom: '3px', marginBottom: '10px', color: '#0f172a' }}>현장 증빙 사진</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {attachedImages.map((img, idx) => (
                <div key={idx} style={{ aspectRatio: '1', border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                  <img src={img} alt={`증빙 ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default PrintTemplate;