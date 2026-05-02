import React, { useState } from 'react';
import { Sparkles, ArrowRight, FileText, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const INDUSTRIES = [
  { id: 'sign', name: '간판/광고물' },
  { id: 'interior', name: '인테리어' },
  { id: 'wallpaper', name: '도배/장판' },
  { id: 'tile', name: '타일' },
  { id: 'furniture', name: '가구/목공' },
  { id: 'painting', name: '도장/방수' },
  { id: 'electrical', name: '전기/조명' },
  { id: 'facility', name: '설비' },
  { id: 'demolition', name: '철거/해체' },
  { id: 'clean_move', name: '청소/이사' },
];

const EXAMPLES = [
  { industry: 'sign', text: '강남역 앞 카페 간판 교체. 가로 3m, 세로 1.2m 에폭시 채널 5자 제작 + 크레인 설치.' },
  { industry: 'interior', text: '30평 사무실 인테리어. 천장 덴조, 바닥 강마루 시공, 조명 교체 15개.' },
  { industry: 'wallpaper', text: '25평 아파트 전체 도배. 실크벽지 + 천장합지. 기존 도배지 제거 포함.' },
  { industry: 'tile', text: '욕실 리모델링. 바닥 포세린 600×600, 벽 300×600 욕실타일 전체 교체.' },
  { industry: 'furniture', text: '안방 붙박이장 2.4m + 드레스룸 1.8m 제작 설치.' },
  { industry: 'painting', text: '상가 외벽 전체 도장. 탄성코트 150㎡ + 옥상 우레탄 방수 80㎡.' },
  { industry: 'electrical', text: '카페 인테리어 조명 공사. 다운라이트 20개, 레일조명 8m, 간접조명 설치.' },
  { industry: 'facility', text: '음식점 주방 배관 교체. 수도배관 10m 신설, 양변기 2개 교체, 설비기공 2인.' },
  { industry: 'demolition', text: '40평 사무실 전체 철거. 천장·바닥·가벽 철거 + 폐기물 처리 포함.' },
  { industry: 'clean_move', text: '강동구 아파트 32평 포장이사 + 입주청소 포함.' },
];

export default function AiDemoSection() {
  const navigate = useNavigate();
  const [industry, setIndustry] = useState('sign');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async (desc = description, ind = industry) => {
    if (!desc.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/ai/quote-draft', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ description: desc, industry: ind })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError(e.message || 'AI 초안 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleExample = (ex) => {
    setIndustry(ex.industry);
    setDescription(ex.text);
    setResult(null);
    setError('');
  };

  const handleSignup = () => {
    if (result) {
      sessionStorage.setItem('ai_demo_result', JSON.stringify({ ...result, description, industry }));
    }
    navigate('/signup');
  };

  return (
    <section style={{ padding: '6rem 2rem', backgroundColor: '#fafafa', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* 섹션 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f0f0ff', border: '1px solid #c4b5fd', borderRadius: '100px', padding: '0.4rem 1rem', marginBottom: '1rem' }}>
            <Sparkles size={16} color="#7c3aed" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#7c3aed' }}>AI 견적 체험</span>
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.8rem', letterSpacing: '-1px', lineHeight: 1.2 }}>
            작업 내용만 입력하면<br />
            <span style={{ color: '#7c3aed' }}>완성된 견적서</span>가 나옵니다
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.05rem' }}>회원가입 없이 지금 바로 체험해보세요</p>
        </div>

        {/* 입력 영역 */}
        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>

          {/* 업종 선택 */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.5rem' }}>업종 선택</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {INDUSTRIES.map(ind => (
                <button
                  key={ind.id}
                  onClick={() => setIndustry(ind.id)}
                  style={{
                    padding: '0.45rem 1rem', borderRadius: '100px', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                    border: `2px solid ${industry === ind.id ? '#7c3aed' : '#e2e8f0'}`,
                    backgroundColor: industry === ind.id ? '#7c3aed' : 'white',
                    color: industry === ind.id ? 'white' : '#64748b'
                  }}
                >
                  {ind.name}
                </button>
              ))}
            </div>
          </div>

          {/* 예시 버튼 */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.5rem' }}>예시 불러오기</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {EXAMPLES.filter(e => e.industry === industry).map((ex, i) => (
                <button
                  key={i}
                  onClick={() => handleExample(ex)}
                  style={{ padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', border: '1px dashed #c4b5fd', backgroundColor: '#faf5ff', color: '#6d28d9', maxWidth: '100%', textAlign: 'left' }}
                >
                  {ex.text.length > 40 ? ex.text.slice(0, 40) + '...' : ex.text}
                </button>
              ))}
            </div>
          </div>

          {/* 텍스트 입력 */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.5rem' }}>작업 내용 입력</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="예: 홍대입구역 앞 치킨집 간판 교체. 가로 4m 세로 1.5m 에폭시 채널 7자 + 크레인 필요. 야간 작업 예정."
              style={{ width: '100%', minHeight: '90px', padding: '0.9rem', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.95rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.6, outline: 'none' }}
              onFocus={e => e.target.style.borderColor = '#7c3aed'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <button
            onClick={() => handleGenerate()}
            disabled={loading || !description.trim()}
            style={{
              width: '100%', padding: '1rem', borderRadius: '12px', fontSize: '1.05rem', fontWeight: 800, cursor: loading || !description.trim() ? 'not-allowed' : 'pointer',
              background: loading || !description.trim() ? '#e2e8f0' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              color: loading || !description.trim() ? '#94a3b8' : 'white', border: 'none',
              boxShadow: loading || !description.trim() ? 'none' : '0 4px 14px rgba(124,58,237,0.35)',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem'
            }}
          >
            <Sparkles size={20} />
            {loading ? 'AI가 견적서를 작성 중입니다...' : 'AI 견적서 자동 생성'}
          </button>

          {error && (
            <div style={{ marginTop: '1rem', padding: '0.8rem 1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}
        </div>

        {/* 결과 - 견적서 미리보기 */}
        {result && (
          <div style={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>

            {/* 미리보기 헤더 */}
            <div style={{ padding: '1rem 1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <FileText size={18} color="#7c3aed" />
              <span style={{ fontWeight: 700, color: '#374151', fontSize: '0.95rem' }}>견적서 미리보기</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#94a3b8' }}>실제 견적서와 동일한 양식</span>
            </div>

            <div style={{ padding: '1.5rem 2rem' }}>

              {/* 견적서 타이틀 */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #1d4ed8', paddingBottom: '1rem', marginBottom: '1.2rem' }}>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1d3a8a', letterSpacing: '6px', margin: '0 0 0.6rem 0' }}>견 적 서</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569' }}>
                  <div style={{ textAlign: 'left' }}>
                    <div>견적일자: <strong>{result.customerInfo?.date}</strong></div>
                    {result.customerInfo?.paymentDueDate && <div>결제요청일: <strong>{result.customerInfo.paymentDueDate}</strong></div>}
                    <div style={{ marginTop: '0.4rem', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                      고 객 귀하
                    </div>
                    <div>현장명: <strong>{result.customerInfo?.project || '-'}</strong></div>
                  </div>
                  <div style={{ textAlign: 'right', border: '1px solid #cbd5e1', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.8rem', color: '#64748b', minWidth: '160px' }}>
                    <div style={{ fontWeight: 700, color: '#374151', marginBottom: '0.3rem' }}>공급자</div>
                    <div>상호: ___________</div>
                    <div>대표자: ___________</div>
                    <div>등록번호: ___________</div>
                  </div>
                </div>
              </div>

              {/* 총 견적 금액 */}
              <div style={{ backgroundColor: '#eff6ff', border: '2px solid #1d4ed8', borderLeft: '6px solid #1d4ed8', borderRadius: '6px', padding: '0.8rem 1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e3a8a', whiteSpace: 'nowrap' }}>총 견적 금액 (VAT {result.includeVat ? '포함' : '별도'}):</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1e3a8a' }}>
                  일금 {(result.grandTotal || 0).toLocaleString()} 원 정
                </span>
              </div>

              {/* 품목 테이블 */}
              <div style={{ overflowX: 'auto', marginBottom: '1.2rem' }}>
                <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9' }}>
                      {['No', '품목/자재명', '규격', '수량', '단위', '단가', '공급가액', '비고'].map(h => (
                        <th key={h} style={{ padding: '0.5rem 0.4rem', border: '1px solid #000', textAlign: 'center', fontWeight: 700, whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...result.items].reverse().map((item, i) => (
                      <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                        <td style={{ padding: '0.45rem 0.4rem', border: '1px solid #000', textAlign: 'center', color: '#64748b', fontSize: '0.78rem' }}>{i + 1}</td>
                        <td style={{ padding: '0.45rem 0.6rem', border: '1px solid #000', fontWeight: 600, color: '#0f172a' }}>{item.name}</td>
                        <td style={{ padding: '0.45rem 0.4rem', border: '1px solid #000', textAlign: 'center', color: '#475569', fontSize: '0.8rem' }}>{item.specification || '-'}</td>
                        <td style={{ padding: '0.45rem 0.4rem', border: '1px solid #000', textAlign: 'center', color: '#0f172a', fontWeight: 600 }}>{item.quantity}</td>
                        <td style={{ padding: '0.45rem 0.4rem', border: '1px solid #000', textAlign: 'center', color: '#475569' }}>{item.unit || 'EA'}</td>
                        <td style={{ padding: '0.45rem 0.6rem', border: '1px solid #000', textAlign: 'right', color: '#475569' }}>{(item.unitPrice || 0).toLocaleString()}</td>
                        <td style={{ padding: '0.45rem 0.6rem', border: '1px solid #000', textAlign: 'right', fontWeight: 700, color: '#1e3a8a' }}>{(item.total || 0).toLocaleString()}</td>
                        <td style={{ padding: '0.45rem 0.4rem', border: '1px solid #000', textAlign: 'center', color: '#64748b', fontSize: '0.75rem' }}>{item.remarks || ''}</td>
                      </tr>
                    ))}
                    {/* 빈 행 */}
                    {Array.from({ length: Math.max(0, 3 - result.items.length) }).map((_, i) => (
                      <tr key={`e${i}`}>
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j} style={{ padding: '0.45rem', border: '1px solid #000', height: '28px' }} />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 합계 영역 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
                {/* 특약사항 */}
                {result.remarks && (
                  <div style={{ flex: 1, minWidth: '200px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.8rem', fontSize: '0.8rem', color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    <strong style={{ display: 'block', marginBottom: '0.3rem', color: '#374151' }}>[ 특약사항 및 결제조건 ]</strong>
                    {result.remarks}
                  </div>
                )}

                {/* 합계 테이블 */}
                <table style={{ borderCollapse: 'collapse', fontSize: '0.88rem', minWidth: '280px' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '0.5rem 0.8rem', border: '1px solid #000', backgroundColor: '#f8fafc', fontWeight: 700, whiteSpace: 'nowrap' }}>공급가액</td>
                      <td style={{ padding: '0.5rem 0.9rem', border: '1px solid #000', textAlign: 'right', minWidth: '130px' }}>{(result.subTotal || 0).toLocaleString()} 원</td>
                    </tr>
                    {result.discount > 0 && (
                      <tr>
                        <td style={{ padding: '0.5rem 0.8rem', border: '1px solid #000', backgroundColor: '#fff9c4', fontWeight: 700 }}>할인액</td>
                        <td style={{ padding: '0.5rem 0.9rem', border: '1px solid #000', textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>- {(result.discount || 0).toLocaleString()} 원</td>
                      </tr>
                    )}
                    <tr>
                      <td style={{ padding: '0.5rem 0.8rem', border: '1px solid #000', backgroundColor: '#f8fafc', fontWeight: 700 }}>부가세 (VAT)</td>
                      <td style={{ padding: '0.5rem 0.9rem', border: '1px solid #000', textAlign: 'right' }}>{(result.vat || 0).toLocaleString()} 원</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.7rem 0.8rem', border: '2px solid #000', backgroundColor: '#f1f5f9', fontWeight: 900, fontSize: '1rem' }}>총 합 계</td>
                      <td style={{ padding: '0.7rem 0.9rem', border: '2px solid #000', textAlign: 'right', fontWeight: 900, fontSize: '1.1rem', color: '#1e3a8a' }}>{(result.grandTotal || 0).toLocaleString()} 원</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 하단 */}
              <div style={{ textAlign: 'center', borderTop: '1.5px dashed #94a3b8', paddingTop: '0.8rem', fontSize: '0.88rem', fontWeight: 700, color: '#64748b', letterSpacing: '2px', marginBottom: '1.5rem' }}>
                상기와 같이 견적합니다.
              </div>

              {/* CTA */}
              <div style={{ backgroundColor: '#f5f3ff', borderRadius: '14px', padding: '1.5rem', textAlign: 'center', border: '1px solid #ddd6fe' }}>
                <p style={{ fontWeight: 800, fontSize: '1.1rem', color: '#4c1d95', marginBottom: '0.4rem' }}>
                  이 견적서, 그대로 저장하고 싶으세요?
                </p>
                <p style={{ color: '#6d28d9', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
                  회원가입하면 이 견적서를 PDF로 저장하고 고객에게 바로 전송할 수 있습니다.
                </p>
                <button
                  onClick={handleSignup}
                  style={{
                    backgroundColor: '#7c3aed', color: 'white', border: 'none', padding: '0.9rem 2.5rem',
                    borderRadius: '12px', fontSize: '1rem', fontWeight: 800, cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
                    display: 'inline-flex', alignItems: 'center', gap: '0.6rem'
                  }}
                >
                  무료 가입하고 견적서 저장하기 <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 결과 없을 때 안내 */}
        {!result && !loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <ChevronDown size={24} style={{ opacity: 0.4 }} />
            작업 내용을 입력하고 버튼을 누르면 완성된 견적서가 여기에 나타납니다
          </div>
        )}

      </div>
    </section>
  );
}
