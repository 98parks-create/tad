import React, { forwardRef } from 'react';

const PrintTemplate = forwardRef(({ customerInfo, items, subTotal, vat, grandTotal, providerInfo }, ref) => {
  return (
    <div ref={ref} style={{ padding: '10mm 15mm', width: '210mm', boxSizing: 'border-box', margin: '0 auto', backgroundColor: 'white', color: 'black', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', marginBottom: '8mm', borderBottom: '2px solid #00083a', paddingBottom: '4mm' }}>
          <h1 style={{ color: '#00083a', fontSize: '28pt', margin: '0 0 4mm 0', letterSpacing: '4px' }}>견 적 서</h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'left', fontSize: '11pt' }}>
            <div style={{ lineHeight: '1.6', marginTop: '10px' }}>
              <p style={{ margin: 0, fontSize: '11pt' }}><strong>견적일자:</strong> {customerInfo.date}</p>
              <p style={{ margin: '8px 0' }}>
                <span style={{ fontSize: '15pt', fontWeight: 'bold', borderBottom: '2px solid #000', paddingBottom: '2px' }}>
                  {customerInfo.company ? `${customerInfo.company} ` : ''}
                  {customerInfo.name ? `${customerInfo.name}` : '___________'}
                </span>
                <span style={{ fontSize: '13pt', fontWeight: 'bold' }}> 귀하</span>
              </p>
              <p style={{ margin: 0, fontSize: '11pt' }}><strong>연락처:</strong> {customerInfo.phone || '___________'}</p>
              <p style={{ margin: 0, fontSize: '11pt' }}><strong>현장명:</strong> {customerInfo.project || '___________'}</p>

              <p style={{ margin: '20px 0 0 0', fontSize: '12pt', fontWeight: 'bold' }}>아래와 같이 견적합니다.</p>
            </div>
            <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '4px', lineHeight: '1.6', width: '250px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>공급자</span>
                <span style={{ color: '#00083a', fontWeight: 'bold' }}>(인)</span>
              </div>
              <p style={{ margin: '5px 0 0 0' }}>상호: <b>{providerInfo?.companyName || '__________________'}</b></p>
              <p style={{ margin: '2px 0 0 0' }}>대표자: {providerInfo?.ceoName || '__________________'}</p>
              <p style={{ margin: '2px 0 0 0' }}>등록번호: {providerInfo?.businessNumber || '__________________'}</p>
              <p style={{ margin: '2px 0 0 0' }}>주소: {providerInfo?.address || '__________________'}</p>
              <p style={{ margin: '2px 0 0 0' }}>연락처: {providerInfo?.phone || '__________________'}</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '4mm', backgroundColor: '#f4f6f8', borderRadius: '4px', marginBottom: '8mm', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14pt', fontWeight: 'bold' }}>총 견적 금액 (VAT 포함):</span>
          <span style={{ fontSize: '16pt', fontWeight: 'bold', color: '#00083a' }}>
            {grandTotal > 0 ? `일금 ${grandTotal.toLocaleString()} 원 정 (₩ ${grandTotal.toLocaleString()})` : '- 원'}
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8mm', fontSize: '10.5pt' }}>
          <thead>
            <tr style={{ backgroundColor: '#00083a', color: 'white' }}>
              <th style={{ padding: '8px', border: '1px solid #94a3b8' }}>No</th>
              <th style={{ padding: '8px', border: '1px solid #94a3b8' }}>품목/자재명</th>
              <th style={{ padding: '8px', border: '1px solid #94a3b8' }}>규격(가로x세로)</th>
              <th style={{ padding: '8px', border: '1px solid #94a3b8' }}>수량</th>
              <th style={{ padding: '8px', border: '1px solid #94a3b8' }}>단위</th>
              <th style={{ padding: '8px', border: '1px solid #94a3b8' }}>단가</th>
              <th style={{ padding: '8px', border: '1px solid #94a3b8' }}>공급가액</th>
              <th style={{ padding: '8px', border: '1px solid #94a3b8' }}>비고</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>{index + 1}</td>
                <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{item.name}</td>
                <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                  {item.specification || (item.type === 'area' && item.width && item.height ? `${item.width} x ${item.height} mm` : '-')}
                </td>
                <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>{item.unit || 'EA'}</td>
                <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'right' }}>{Number(item.unitPrice).toLocaleString()}</td>
                <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'right' }}>{item.total.toLocaleString()}</td>
                <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{item.remarks || ''}</td>
              </tr>
            ))}
            {/* Empty rows to maintain table height if few items */}
            {Array.from({ length: Math.max(0, 10 - items.length) }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td style={{ padding: '8px', border: '1px solid #cbd5e1', color: 'transparent' }}>-</td>
                <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}></td>
                <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}></td>
                <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}></td>
                <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}></td>
                <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}></td>
                <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}></td>
                <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginBottom: '10mm' }}>
          <table style={{ width: '350px', borderCollapse: 'collapse', fontSize: '11pt' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #94a3b8', backgroundColor: '#f4f6f8', fontWeight: 'bold' }}>공급가액</td>
                <td style={{ padding: '8px', border: '1px solid #94a3b8', textAlign: 'right' }}>{subTotal.toLocaleString()} 원</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #94a3b8', backgroundColor: '#f4f6f8', fontWeight: 'bold' }}>부가세 (VAT)</td>
                <td style={{ padding: '8px', border: '1px solid #94a3b8', textAlign: 'right' }}>{vat.toLocaleString()} 원</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 8px', border: '1px solid #94a3b8', backgroundColor: '#00083a', color: 'white', fontWeight: 'bold' }}>합 계</td>
                <td style={{ padding: '10px 8px', border: '1px solid #94a3b8', textAlign: 'right', fontWeight: 'bold', fontSize: '13pt' }}>{grandTotal.toLocaleString()} 원</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div style={{ marginTop: '15mm', textAlign: 'center', fontSize: '10pt', color: '#666', borderTop: '1px solid #ccc', paddingTop: '10mm', paddingBottom: '5mm' }}>
          상기와 같이 견적합니다.
        </div>
    </div>
  );
});

export default PrintTemplate;
