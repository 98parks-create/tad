import React, { forwardRef } from 'react';

const PrintTemplate = forwardRef(({ customerInfo, items, subTotal, discount, discountReason, vat, grandTotal, providerInfo, remarks, includeVat = true }, ref) => {
  const dynamicScale = items.length > 8 ? 8 / items.length : 1;

  return (
    <div ref={ref} style={{ padding: '10mm 15mm', width: '210mm', height: '290mm', boxSizing: 'border-box', margin: '0 auto', backgroundColor: 'white', color: 'black', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', zoom: dynamicScale }}>
        <div style={{ textAlign: 'center', marginBottom: '4mm', borderBottom: '2px solid #00083a', paddingBottom: '2mm', paddingTop: '5mm' }}>
          <h1 style={{ color: '#00083a', fontSize: '26pt', margin: '0 0 2mm 0', letterSpacing: '4px' }}>견 적 서</h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'left', fontSize: '10.5pt' }}>
            <div style={{ lineHeight: '1.4', marginTop: '5px' }}>
              <p style={{ margin: 0, fontSize: '10.5pt' }}><strong>견적일자:</strong> {customerInfo.date}</p>
              <p style={{ margin: '5px 0' }}>
                <span style={{ fontSize: '14pt', fontWeight: 'bold', borderBottom: '2px solid #000', paddingBottom: '1px' }}>
                  {customerInfo.company ? `${customerInfo.company} ` : ''}
                  {customerInfo.name ? `${customerInfo.name}` : '___________'}
                </span>
                <span style={{ fontSize: '12pt', fontWeight: 'bold' }}> 귀하</span>
              </p>
              <p style={{ margin: 0, fontSize: '10.5pt' }}><strong>연락처:</strong> {customerInfo.phone || '___________'}</p>
              <p style={{ margin: 0, fontSize: '10.5pt' }}><strong>현장명:</strong> {customerInfo.project || '___________'}</p>

              <p style={{ margin: '15px 0 0 0', fontSize: '11pt', fontWeight: 'bold' }}>아래와 같이 견적합니다.</p>
            </div>
            <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '4px', lineHeight: '1.4', width: '250px', fontSize: '10pt', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                <span style={{ fontWeight: 'bold' }}>공급자</span>
                <span style={{ color: '#00083a', fontWeight: 'bold' }}>(인)</span>
              </div>
              {providerInfo?.stampImage && (
                <img 
                  crossOrigin="anonymous"
                  src={providerInfo.stampImage} 
                  alt="직인" 
                  style={{ 
                    position: 'absolute', 
                    right: '8px', 
                    top: '8px', 
                    width: '45px', 
                    height: '45px',
                    mixBlendMode: 'multiply',
                    zIndex: 1
                  }} 
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

        <div style={{ margin: '4mm 0', padding: '8px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontWeight: 'bold', fontSize: '11pt' }}>총 견적 금액 (VAT {includeVat ? '포함' : '별도'}):</span>
          <span style={{ fontSize: '14pt', fontWeight: 'bold', color: '#0f172a' }}>
            {grandTotal > 0 ? `일금 ${grandTotal.toLocaleString()} 원 정 (₩ ${grandTotal.toLocaleString()})` : '- 원'}
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt', marginBottom: '5mm', pageBreakInside: 'auto' }}>
          <thead>
            <tr style={{ pageBreakInside: 'avoid', pageBreakAfter: 'auto' }}>
              <th style={{ padding: '5px', backgroundColor: '#00083a', color: 'white', border: '1px solid #cbd5e1' }}>No</th>
              <th style={{ padding: '5px', backgroundColor: '#00083a', color: 'white', border: '1px solid #cbd5e1' }}>품목/자재명</th>
              <th style={{ padding: '5px', backgroundColor: '#00083a', color: 'white', border: '1px solid #cbd5e1' }}>규격(가로x세로)</th>
              <th style={{ padding: '5px', backgroundColor: '#00083a', color: 'white', border: '1px solid #cbd5e1' }}>수량</th>
              <th style={{ padding: '5px', backgroundColor: '#00083a', color: 'white', border: '1px solid #cbd5e1' }}>단위</th>
              <th style={{ padding: '5px', backgroundColor: '#00083a', color: 'white', border: '1px solid #cbd5e1' }}>단가</th>
              <th style={{ padding: '5px', backgroundColor: '#00083a', color: 'white', border: '1px solid #cbd5e1' }}>공급가액</th>
              <th style={{ padding: '5px', backgroundColor: '#00083a', color: 'white', border: '1px solid #cbd5e1' }}>비고</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} style={{ pageBreakInside: 'avoid', pageBreakAfter: 'auto' }}>
                <td style={{ padding: '5px', border: '1px solid #cbd5e1', textAlign: 'center' }}>{i + 1}</td>
                <td style={{ padding: '5px', border: '1px solid #cbd5e1' }}>{item.name}</td>
                <td style={{ padding: '5px', border: '1px solid #cbd5e1', textAlign: 'center' }}>{item.specification || (item.type === 'area' && item.width && item.height ? `${item.width}*${item.height}` : '-')}</td>
                <td style={{ padding: '5px', border: '1px solid #cbd5e1', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '5px', border: '1px solid #cbd5e1', textAlign: 'center' }}>{item.unit || 'EA'}</td>
                <td style={{ padding: '5px', border: '1px solid #cbd5e1', textAlign: 'right' }}>{Number(item.unitPrice).toLocaleString()}</td>
                <td style={{ padding: '5px', border: '1px solid #cbd5e1', textAlign: 'right' }}>{item.total.toLocaleString()}</td>
                <td style={{ padding: '5px', border: '1px solid #cbd5e1' }}>{item.remarks}</td>
              </tr>
            ))}
            {/* Empty rows to maintain table height if few items */}
            {Array.from({ length: Math.max(0, 8 - items.length) }).map((_, i) => (
              <tr key={`empty-${i}`} style={{ height: '25px' }}>
                <td style={{ padding: '5px', border: '1px solid #cbd5e1' }}></td>
                <td style={{ padding: '5px', border: '1px solid #cbd5e1' }}></td>
                <td style={{ padding: '5px', border: '1px solid #cbd5e1' }}></td>
                <td style={{ padding: '5px', border: '1px solid #cbd5e1' }}></td>
                <td style={{ padding: '5px', border: '1px solid #cbd5e1' }}></td>
                <td style={{ padding: '5px', border: '1px solid #cbd5e1' }}></td>
                <td style={{ padding: '5px', border: '1px solid #cbd5e1' }}></td>
                <td style={{ padding: '5px', border: '1px solid #cbd5e1' }}></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginBottom: '5mm' }}>
          <table style={{ width: '350px', borderCollapse: 'collapse', fontSize: '11pt' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #cbd5e1', padding: '6px', backgroundColor: '#f1f5f9', fontWeight: 'bold', width: '120px' }}>공급가액</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'right' }}>{Number(subTotal).toLocaleString()} 원</td>
              </tr>
              {discount > 0 && (
                <tr>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px', backgroundColor: '#fcd34d', fontWeight: 'bold' }}>할인액 {discountReason ? `(${discountReason})` : ''}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'right', color: '#b45309', fontWeight: 'bold' }}>- {Number(discount).toLocaleString()} 원</td>
                </tr>
              )}
              <tr>
                <td style={{ border: '1px solid #cbd5e1', padding: '6px', backgroundColor: '#f1f5f9', fontWeight: 'bold' }}>부가세 (VAT)</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'right' }}>{vat.toLocaleString()} 원</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px', backgroundColor: '#00083a', color: 'white', fontWeight: 'bold', fontSize: '12pt' }}>합 계</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'right', fontWeight: 'bold', fontSize: '13pt' }}>{grandTotal.toLocaleString()} 원</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div style={{ marginTop: 'auto', paddingTop: '5mm', paddingBottom: '3mm' }}>
          {remarks && (
            <div style={{ marginBottom: '5mm', textAlign: 'left', fontSize: '9pt', color: '#334155', backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '4px', border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
              <strong>[ 특약사항 및 공지 ]</strong><br/>
              {remarks}
            </div>
          )}
          <div style={{ textAlign: 'center', fontSize: '10pt', color: '#666', borderTop: '1px solid #ccc', paddingTop: '5mm' }}>
            상기와 같이 견적합니다.
          </div>
        </div>
    </div>
  );
});

export default PrintTemplate;
