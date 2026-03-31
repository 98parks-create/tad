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

  const sortedItems = [...items].reverse();

  // [글자 깨짐 방지 보정 로직]
  const handleShare = async () => {
    if (!ref.current) return;

    try {
      // 폰트가 완전히 로드될 때까지 대기
      await document.fonts.ready;

      const canvas = await html2canvas(ref.current, {
        scale: 3, // 숫자를 더 높여 선명도 확보 (기존 2 -> 3)
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        letterRendering: true, // 글자 렌더링 정확도 향상
        allowTaint: true,
        // 아래 옵션은 텍스트 위치가 밀리는 것을 방지합니다.
        onclone: (clonedDoc) => {
          const el = clonedDoc.querySelector('.print-template');
          if (el) {
            el.style.transform = 'none';
          }
        }
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const fileName = `견적서_${customerInfo.name || '고객'}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ files: [file], title: '견적서 송부' });
          } catch (shareError) {
            if (shareError.name !== 'AbortError') downloadFallback(blob, fileName);
          }
        } else {
          downloadFallback(blob, fileName);
        }
      }, 'image/png', 1.0); // 품질 최고로 설정
    } catch (err) {
      alert("이미지 생성 중 오류가 발생했습니다.");
    }
  };

  const downloadFallback = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ width: '100%', backgroundColor: '#f1f5f9', padding: '20px 0' }}>
      {/* 캡처를 실행할 실제 컨테이너 */}
      <div
        ref={ref}
        className="print-template"
        style={{
          padding: styles.topBottomPadding,
          width: '210mm',
          minHeight: '290mm',
          boxSizing: 'border-box',
          margin: '0 auto',
          backgroundColor: 'white',
          color: 'black',
          // 폰트를 더 명확하게 지정
          fontFamily: "'Noto Sans KR', 'Malgun Gothic', sans-serif",
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 0 20px rgba(0,0,0,0.1)',
          position: 'relative'
        }}
      >
        {/* 상단 섹션 */}
        <div style={{ textAlign: 'center', marginBottom: styles.headerMarginBottom, borderBottom: '2px solid #003366', paddingBottom: '2mm', paddingTop: '5mm' }}>
          <h1 style={{ color: '#003366', fontSize: '28pt', margin: '0 0 4mm 0', letterSpacing: '6px', fontWeight: 900 }}>견 적 서</h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'left', fontSize: '11pt' }}>
            <div style={{ lineHeight: '1.6' }}>
              <p style={{ margin: 0 }}><strong>견적일자:</strong> {customerInfo.date}</p>
              <div style={{ margin: '8px 0' }}>
                <span style={{ fontSize: '15pt', fontWeight: 'bold', borderBottom: '2px solid #000', paddingBottom: '2px', display: 'inline-block' }}>
                  {customerInfo.company ? `${customerInfo.company} ` : ''}
                  {customerInfo.name ? `${customerInfo.name}` : '___________'}
                </span>
                <span style={{ fontSize: '12pt', fontWeight: 'bold' }}> 귀하</span>
              </div>
              <p style={{ margin: 0 }}><strong>연락처:</strong> {customerInfo.phone || '___________'}</p>
              <p style={{ margin: 0 }}><strong>현장명:</strong> {customerInfo.project || '___________'}</p>
              <p style={{ margin: '15px 0 0 0', fontWeight: 'bold' }}>아래와 같이 견적합니다.</p>
            </div>

            <div style={{ border: '2px solid #000', padding: '12px', borderRadius: '4px', width: '260px', position: 'relative', height: 'fit-content' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontWeight: 'bold' }}>공급자</span>
                <span style={{ fontWeight: 'bold' }}>(인)</span>
              </div>
              {providerInfo?.stampImage && (
                <img src={providerInfo.stampImage} alt="직인" style={{ position: 'absolute', right: '10px', top: '10px', width: '50px', height: '50px', mixBlendMode: 'multiply', zIndex: 1 }} />
              )}
              <div style={{ position: 'relative', zIndex: 2, fontSize: '10pt', lineHeight: '1.4' }}>
                <p style={{ margin: '2px 0' }}>상호: <b>{providerInfo?.companyName || '__________________'}</b></p>
                <p style={{ margin: '2px 0' }}>대표자: {providerInfo?.ceoName || '__________________'}</p>
                <p style={{ margin: '2px 0' }}>등록번호: {providerInfo?.businessNumber || '__________________'}</p>
                <p style={{ margin: '2px 0' }}>주소: {providerInfo?.address || '__________________'}</p>
                <p style={{ margin: '2px 0' }}>연락처: {providerInfo?.phone || '__________________'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 금액 요약 섹션 */}
        <div style={{ margin: styles.titleMargin, padding: '12px 16px', backgroundColor: '#f8fafc', border: '2px solid #000', borderLeft: '8px solid #003366', borderRadius: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontWeight: 'bold', fontSize: '13pt' }}>총 견적 금액 (VAT {includeVat ? '포함' : '별도'}):</span>
            <span style={{ fontSize: '16pt', fontWeight: '900' }}>
              {(grandTotal || 0) > 0 ? `일금 ${(grandTotal || 0).toLocaleString()} 원 정 (₩ ${(grandTotal || 0).toLocaleString()})` : '- 원'}
            </span>
          </div>
        </div>

        {/* 테이블 섹션 (글자 겹침 방지를 위해 고정폭/간격 미세 조정) */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: styles.tableFontSize, marginBottom: '5mm', border: '2px solid #000', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '40px' }} />
            <col />
            <col style={{ width: '100px' }} />
            <col style={{ width: '50px' }} />
            <col style={{ width: '50px' }} />
            <col style={{ width: '90px' }} />
            <col style={{ width: '100px' }} />
            <col style={{ width: '70px' }} />
          </colgroup>
          <thead>
            <tr>
              <th style={{ padding: styles.headerPadding, backgroundColor: '#f1f5f9', border: '1px solid #000', textAlign: 'center' }}>No</th>
              <th style={{ padding: styles.headerPadding, backgroundColor: '#f1f5f9', border: '1px solid #000', textAlign: 'center' }}>품목/자재명</th>
              <th style={{ padding: styles.headerPadding, backgroundColor: '#f1f5f9', border: '1px solid #000', textAlign: 'center' }}>규격</th>
              <th style={{ padding: styles.headerPadding, backgroundColor: '#f1f5f9', border: '1px solid #000', textAlign: 'center' }}>수량</th>
              <th style={{ padding: styles.headerPadding, backgroundColor: '#f1f5f9', border: '1px solid #000', textAlign: 'center' }}>단위</th>
              <th style={{ padding: styles.headerPadding, backgroundColor: '#f1f5f9', border: '1px solid #000', textAlign: 'center' }}>단가</th>
              <th style={{ padding: styles.headerPadding, backgroundColor: '#f1f5f9', border: '1px solid #000', textAlign: 'center' }}>공급가액</th>
              <th style={{ padding: styles.headerPadding, backgroundColor: '#f1f5f9', border: '1px solid #000', textAlign: 'center' }}>비고</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item, i) => (
              <tr key={i} style={{ height: styles.rowHeight }}>
                <td style={{ padding: styles.cellPadding, border: '1px solid #000', textAlign: 'center' }}>{i + 1}</td>
                <td style={{ padding: styles.cellPadding, border: '1px solid #000', fontWeight: '500', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{item.name}</td>
                <td style={{ padding: styles.cellPadding, border: '1px solid #000', textAlign: 'center' }}>{item.specification || (item.type === 'area' ? `${item.width}*${item.height}` : '-')}</td>
                <td style={{ padding: styles.cellPadding, border: '1px solid #000', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: styles.cellPadding, border: '1px solid #000', textAlign: 'center' }}>{item.unit || 'EA'}</td>
                <td style={{ padding: styles.cellPadding, border: '1px solid #000', textAlign: 'right' }}>{Number(item.unitPrice || 0).toLocaleString()}</td>
                <td style={{ padding: styles.cellPadding, border: '1px solid #000', textAlign: 'right', fontWeight: 'bold' }}>{Number(item.total || 0).toLocaleString()}</td>
                <td style={{ padding: styles.cellPadding, border: '1px solid #000', fontSize: '8pt', textAlign: 'center' }}>{item.remarks}</td>
              </tr>
            ))}
            {Array.from({ length: Math.max(0, 8 - sortedItems.length) }).map((_, i) => (
              <tr key={`empty-${i}`} style={{ height: styles.rowHeight }}>
                <td colSpan="8" style={{ border: '1px solid #000' }}></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 합계 테이블 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '5mm' }}>
          <table style={{ width: '400px', borderCollapse: 'collapse', fontSize: '11pt', border: '2px solid #000' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#f8fafc', fontWeight: 'bold', width: '150px' }}>공급가액</td>
                <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{Number(subTotal || 0).toLocaleString()} 원</td>
              </tr>
              {(discount || 0) > 0 && (
                <tr>
                  <td style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#fff9c4', fontWeight: 'bold' }}>
                    할인액 <span style={{ fontSize: '8pt', fontWeight: 'normal', display: 'block' }}>{discountReason ? `(${discountReason})` : ''}</span>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', color: '#d32f2f', fontWeight: 'bold' }}>
                    - {Number(discount || 0).toLocaleString()} 원
                  </td>
                </tr>
              )}
              <tr>
                <td style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#f8fafc', fontWeight: 'bold' }}>부가세 (VAT)</td>
                <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{(vat || 0).toLocaleString()} 원</td>
              </tr>
              <tr>
                <td style={{ border: '2px solid #000', padding: '12px 8px', backgroundColor: '#f1f5f9', fontWeight: '900', fontSize: '13pt' }}>총 합 계</td>
                <td style={{ border: '2px solid #000', padding: '12px 8px', textAlign: 'right', fontWeight: '900', fontSize: '15pt', color: '#003366' }}>{(grandTotal || 0).toLocaleString()} 원</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 'auto' }}>
          {remarks && (
            <div style={{ marginBottom: '5mm', textAlign: 'left', fontSize: '9pt', backgroundColor: '#f1f5f9', padding: '10px 14px', borderRadius: '4px', border: '1px solid #cbd5e1', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
              <strong>[ 특약사항 및 공지 ]</strong><br />{remarks}
            </div>
          )}
          <div style={{ textAlign: 'center', fontSize: '11pt', borderTop: '2px dashed #94a3b8', paddingTop: '6mm', fontWeight: 'bold', letterSpacing: '2px' }}>상기와 같이 견적합니다.</div>
        </div>

        {attachedImages?.length > 0 && (
          <div style={{ marginTop: '10mm' }}>
            <h3 style={{ fontSize: '10pt', borderBottom: '2px solid #000', paddingBottom: '3px', marginBottom: '10px' }}>현장 증빙 사진</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {attachedImages.map((img, idx) => (
                <div key={idx} style={{ aspectRatio: '1', border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden' }}>
                  <img src={img} alt="증빙" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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