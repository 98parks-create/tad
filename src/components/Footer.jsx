import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ marginTop: 'auto', padding: '2rem 1.5rem', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.85rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontWeight: 'bold' }}>
          <Link to="/terms" style={{ color: '#475569', textDecoration: 'none' }}>이용약관</Link>
          <Link to="/privacy" style={{ color: '#475569', textDecoration: 'none' }}>개인정보처리방침</Link>
        </div>
        <div style={{ lineHeight: '1.6' }}>
          상호명: (입력 필요) | 대표자명: (입력 필요) | 사업자등록번호: (입력 필요)<br />
          통신판매업 신고번호: (입력 필요) | 사업장 소재지: (입력 필요)<br />
          고객센터: (입력 필요) | 이메일: (입력 필요)<br />
          호스팅 서비스 제공자: Vercel / Firebase
        </div>
        <div style={{ marginTop: '1rem', color: '#94a3b8' }}>
          © {new Date().getFullYear()} TAD B2B. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
