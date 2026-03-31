import React from 'react';
import { Settings, Edit3, Send, Download } from 'lucide-react';

export default function Guide() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <h2 style={{ fontSize: '2.2rem', color: 'var(--primary-color)', marginBottom: '1rem', fontWeight: 800 }}>
          3분 만에 마스터하는 태드 활용법
        </h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-light)', fontWeight: 500 }}>
          누구나 쉽게 전문가급 견적서를 만들 수 있습니다.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Step 1 */}
        <div className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', borderLeft: '6px solid var(--primary-color)' }}>
          <div style={{ backgroundColor: 'var(--primary-light)', color: 'white', padding: '1rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justify: 'center', flexShrink: 0 }}>
            <Settings size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Step 1. 내 회사 설정 (내 정보)</h3>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-light)', lineHeight: 1.6 }}>
              원활한 서비스 이용을 위해 가장 먼저 대표님의 <b>회사 정보</b>를 입력해주세요.<br/>
              <b>상호, 대표자명, 사업자번호 등 기본 정보와 도장 사진</b>을 단 한 번만 등록해두시면 <br/>
              앞으로 작성하시는 모든 견적서 하단에 자동으로 멋지게 날인되어 들어갑니다!
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', borderLeft: '6px solid var(--accent-color)' }}>
          <div style={{ backgroundColor: 'var(--accent-color)', color: 'white', padding: '1rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justify: 'center', flexShrink: 0 }}>
            <Edit3 size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Step 2. 현장에서 바로 견적서 쓰기</h3>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-light)', lineHeight: 1.6 }}>
              고객명, 품목, 단가만 넣으세요.<br/>
              <b>복잡한 합계와 부가세 계산은 태드가 알아서</b> 합니다.<br/>
              현장 증빙 사진도 스마트폰에서 바로 찍어 밑에 첨부하세요.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', borderLeft: '6px solid #f59e0b' }}>
          <div style={{ backgroundColor: '#f59e0b', color: 'white', padding: '1rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justify: 'center', flexShrink: 0 }}>
            <Send size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Step 3. 1초 만에 카톡 전송</h3>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-light)', lineHeight: 1.6 }}>
              작성 완료된 견적서를 <b>이미지(JPG) 또는 PDF</b>로 저장해<br/>
              고객님께 카카오톡으로 바로 보내세요.<br/>
              깔끔한 디자인으로 사장님의 신뢰도가 2배 올라갑니다.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', borderLeft: '6px solid var(--success-color)' }}>
          <div style={{ backgroundColor: 'var(--success-color)', color: 'white', padding: '1rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justify: 'center', flexShrink: 0 }}>
            <Download size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Step 4. 퇴근 전 홈택스 마무리</h3>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-light)', lineHeight: 1.6 }}>
              하루 일과가 끝난 후, 오늘 발행한 내역을 리스트에서 선택해<br/>
              <b>'홈택스 엑셀 다운로드'</b> 버튼 한 번만 누르세요.<br/>
              골치 아픈 세금계산서 발행 업무가 10초 만에 끝납니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
