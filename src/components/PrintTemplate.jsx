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

  // [글자 크기 하향 조정]
  const styles = {
    tableFontSize: compactLevel === 'very-dense' ? '7.5pt' : compactLevel === 'dense' ? '8pt' : '9pt',
    cellPadding: compactLevel === 'very-dense' ? '2px 2px' : compactLevel === 'dense' ? '4px 3px' : '5px 4px',
    headerPadding: compactLevel === 'very-dense' ? '4px 2px' : compactLevel === 'dense' ? '5px 3px' : '6px 4px',
    rowHeight: compactLevel === 'very-dense' ? '16px' : compactLevel === 'dense' ? '22px' : '28px',
    topBottomPadding: compactLevel === 'very-dense' ? '5mm 12mm' : '10mm 15mm',
    titleMargin: compactLevel === 'very-dense' ? '2mm 0' : '5mm 0 3mm 0',
    headerMarginBottom: compactLevel === 'very-dense' ? '1mm' : '3mm',
  };

  const sortedItems = [...items].reverse();

  return (
    <div style={{ width: '100%', backgroundColor: '#f1f5f9', padding: '20px 0' }}>
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
          fontFamily: "'Noto Sans KR', sans-serif",
          boxShadow: '0 0 20px rgba(0,0,0,0.1)',
          lineHeight: '1.4'
        }}
      >
        {/* 헤더 섹션 */}
        <div style={{ textAlign: 'center', marginBottom: styles.headerMarginBottom, borderBottom: '1.5px solid #003366', paddingBottom: '2mm', paddingTop: '3mm', overflow: 'hidden' }}>
          <h1 style={{ color: '#003366', fontSize: '24pt', margin: '0 0 5mm 0', letterSpacing: '5px', fontWeight: 900 }}>견 적 서</h1>

          <div style={{ textAlign: 'left', fontSize: '10pt', width: '100%' }}>
            {/* 왼쪽 고객정보 */}
            <div style={{ display: 'inline-block', width: '58%', verticalAlign: 'top', lineHeight: '1.5' }}>
              <p style={{ margin: 0 }}><strong>견적일자:</strong> {customerInfo.date}</p>
              <div style={{ margin: '6px 0' }}>
                <span style={{ fontSize: '13pt', fontWeight: 'bold', borderBottom: '1.5px solid #000', paddingBottom: '1px' }}>
                  {customerInfo.company ? `${customerInfo.company} ` : ''}
                  {customerInfo.name ? `${customerInfo.name}` : '___________'}
                </span>
                <span style={{ fontSize: '11pt', fontWeight: 'bold' }}> 귀하</span>
              </div>
              <p style={{ margin: 0, fontSize: '9.5pt' }}><strong>연락처:</strong> {customerInfo.phone || '___________'}</p>
              <p style={{ margin: 0, fontSize: '9.5pt' }}><strong>현장명:</strong> {customerInfo.project || '___________'}</p>
              <p style={{ margin: '10px 0 0 0', fontWeight: 'bold', fontSize: '10pt' }}>아래와 같이 견적합니다.</p>
            </div>

            {/* 오른쪽 공급자정보 (글자 크기 축소) */}
            <div style={{ display: 'inline-block', width: '38%', float: 'right', border: '1.5px solid #000', padding: '8px', borderRadius: '4px', position: 'relative' }}>
              <div style={{ overflow: 'hidden', marginBottom: '3px', fontSize: '9.5pt' }}>
                <span style={{ fontWeight: 'bold', float: 'left' }}>공급자</span>
                <span style={{ fontWeight: 'bold', float: 'right' }}>(인)</span>
              </div>
              {providerInfo?.stampImage && (
                <img src={providerInfo.stampImage} alt="직인" style={{ position: 'absolute', right: '5px', top: '5px', width: '42px', height: '42px', mixBlendMode: 'multiply', zIndex: 1 }} />
              )}
              <div style={{ position: 'relative', zIndex: 2, fontSize: '9pt', lineHeight: '1.4' }}>
                <p style={{ margin: '1px 0' }}>상호: <b>{providerInfo?.companyName || '________________'}</b></p>
                <p style={{ margin: '1px 0' }}>대표자: {providerInfo?.ceoName || '________________'}</p>
                <p style={{ margin: '1px 0' }}>등록번호: {providerInfo?.businessNumber || '________________'}</p>
                <p style={{ margin: '1px 0' }}>주소: <span style={{ fontSize: '8.5pt' }}>{providerInfo?.address || '________________'}</span></p>
                <p style={{ margin: '1px 0' }}>연락처: {providerInfo?.phone || '________________'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 금액 요약 박스 (높이 및 글자 축소) */}
        <div style={{ margin: styles.titleMargin, padding: '10px 14px', backgroundColor: '#f8fafc', border: '1.5px solid #000', borderLeft: '6px solid #003366', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ float: 'left', fontWeight: 'bold', fontSize: '11pt', lineHeight: '1.4' }}>총 견적 금액 (VAT {includeVat ? '포함' : '별도'}):</div>
          <div style={{ float: 'right', fontSize: '14pt', fontWeight: '900', lineHeight: '1.1' }}>
            {(grandTotal || 0) > 0 ? `일금 ${(grandTotal || 0).toLocaleString()} 원 정 (₩ ${(grandTotal || 0).toLocaleString()})` : '- 원'}
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>

        {/* 테이블 섹션 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: styles.tableFontSize, marginBottom: '4mm', border: '1.5px solid #000' }}>
          <thead>
            <tr>
              <th style={{ width: '30px', padding: styles.headerPadding, backgroundColor: '#f1f5f9', border: '1px solid #000', textAlign: 'center' }}>No</th>
              <th style={{ padding: styles.headerPadding, backgroundColor: '#f1f5f9', border: '1px solid #000', textAlign: 'center' }}>품목/자재명</th>
              <th style={{ width: '100px', padding: styles.headerPadding, backgroundColor: '#f1f5f9', border: '1px solid #000', textAlign: 'center' }}>규격</th>
              <th style={{ width: '40px', padding: styles.headerPadding, backgroundColor: '#f1f5f9', border: '1px solid #000', textAlign: 'center' }}>수량</th>
              <th style={{ width: '40px', padding: styles.headerPadding, backgroundColor: '#f1f5f9', border: '1px solid #000', textAlign: 'center' }}>단위</th>
              <th style={{ width: '85px', padding: styles.headerPadding, backgroundColor: '#f1f5f9', border: '1px solid #000', textAlign: 'center' }}>단가</th>
              <th style={{ width: '95px', padding: styles.headerPadding, backgroundColor: '#f1f5f9', border: '1px solid #000', textAlign: 'center' }}>공급가액</th>
              <th style={{ width: '70px', padding: styles.headerPadding, backgroundColor: '#f1f5f9', border: '1px solid #000', textAlign: 'center' }}>비고</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item, i) => (
              <tr key={i} style={{ height: styles.rowHeight }}>
                <td style={{ border: '1px solid #000', textAlign: 'center' }}>{i + 1}</td>
                <td style={{ border: '1px solid #000', padding: '0 4px', fontWeight: '500' }}>{item.name}</td>
                <td style={{ border: '1px solid #000', textAlign: 'center', fontSize: '8pt' }}>{item.specification || (item.type === 'area' ? `${item.width}*${item.height}` : '-')}</td>
                <td style={{ border: '1px solid #000', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ border: '1px solid #000', textAlign: 'center' }}>{item.unit || 'EA'}</td>
                <td style={{ border: '1px solid #000', padding: '0 4px', textAlign: 'right' }}>{Number(item.unitPrice || 0).toLocaleString()}</td>
                <td style={{ border: '1px solid #000', padding: '0 4px', textAlign: 'right', fontWeight: 'bold' }}>{Number(item.total || 0).toLocaleString()}</td>
                <td style={{ border: '1px solid #000', textAlign: 'center', fontSize: '7.5pt' }}>{item.remarks}</td>
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
        <div style={{ textAlign: 'right', marginBottom: '4mm' }}>
          <table style={{ display: 'inline-table', width: '380px', borderCollapse: 'collapse', fontSize: '10pt', border: '1.5px solid #000' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px', backgroundColor: '#f8fafc', fontWeight: 'bold', width: '130px', textAlign: 'left' }}>공급가액</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'right' }}>{Number(subTotal || 0).toLocaleString()} 원</td>
              </tr>
              {(discount || 0) > 0 && (
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', backgroundColor: '#fff9c4', fontWeight: 'bold', textAlign: 'left' }}>
                    할인액 <span style={{ fontSize: '8pt', fontWeight: 'normal' }}>{discountReason ? `(${discountReason})` : ''}</span>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'right', color: '#d32f2f', fontWeight: 'bold' }}>
                    - {Number(discount || 0).toLocaleString()} 원
                  </td>
                </tr>
              )}
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px', backgroundColor: '#f8fafc', fontWeight: 'bold', textAlign: 'left' }}>부가세 (VAT)</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'right' }}>{(vat || 0).toLocaleString()} 원</td>
              </tr>
              <tr>
                <td style={{ border: '2px solid #000', padding: '10px 8px', backgroundColor: '#f1f5f9', fontWeight: '900', fontSize: '11pt', textAlign: 'left' }}>총 합 계</td>
                <td style={{ border: '2px solid #000', padding: '10px 8px', textAlign: 'right', fontWeight: '900', fontSize: '13pt', color: '#003366' }}>{(grandTotal || 0).toLocaleString()} 원</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 하단 섹션 */}
        <div style={{ marginTop: 'auto' }}>
          {remarks && (
            <div style={{ marginBottom: '4mm', textAlign: 'left', fontSize: '8.5pt', backgroundColor: '#f1f5f9', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
              <strong>[ 특약사항 및 공지 ]</strong><br />{remarks}
            </div>
          )}
          <div style={{ textAlign: 'center', fontSize: '10pt', borderTop: '1.5px dashed #94a3b8', paddingTop: '6mm', fontWeight: 'bold', letterSpacing: '2px' }}>상기와 같이 견적합니다.</div>
        </div>

        {attachedImages?.length > 0 && (
          <div style={{ marginTop: '8mm' }}>
            <h3 style={{ fontSize: '9pt', borderBottom: '1.5px solid #000', paddingBottom: '2px', marginBottom: '8px' }}>현장 증빙 사진</h3>
            <div style={{ display: 'block', overflow: 'hidden' }}>
              {attachedImages.map((img, idx) => (
                <div key={idx} style={{ float: 'left', width: '31%', marginRight: '2%', marginBottom: '8px', aspectRatio: '1', border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden' }}>
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