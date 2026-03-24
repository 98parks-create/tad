import React, { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleKakaoLogin = () => {
    const KAKAO_CLIENT_ID = 'a943703dfa539a566422a258392aa3e9';
    const redirectUri = `${window.location.origin}/auth/callback/kakao`;
    window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code`;
  };

  const handleNaverLogin = () => {
    const NAVER_CLIENT_ID = 'Hfz9nrxiGx4JoQrsxBMo';
    const redirectUri = `${window.location.origin}/auth/callback/naver`;
    const state = Math.random().toString(36).substring(7);
    window.location.href = `https://nid.naver.com/oauth2.0/authorize?client_id=${NAVER_CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}&state=${state}`;
  };

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      navigate('/');
    } catch (err) {
      setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f6f8' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary-color)' }}>TAD B2B 로그인</h2>
        
        {error && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>이메일</label>
            <input type="email" ref={emailRef} required placeholder="이메일 주소 입력" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>비밀번호</label>
            <input type="password" ref={passwordRef} required placeholder="비밀번호 입력" />
          </div>
          <button className="btn btn-primary" disabled={loading} type="submit" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
            {loading ? '로그인 중...' : '이메일로 로그인'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
          <span style={{ padding: '0 1rem', color: '#94a3b8', fontSize: '0.875rem' }}>또는 간편 로그인</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button type="button" onClick={handleKakaoLogin} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#FEE500', color: '#000000', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3C6.47715 3 2 6.58172 2 11C2 13.8436 3.65345 16.3353 6.15545 17.6406L5.30314 20.7302C5.20785 21.0776 5.60256 21.3216 5.89926 21.1118L9.58133 18.5204C10.3644 18.636 11.1713 18.6976 12 18.6976C17.5228 18.6976 22 15.1159 22 10.6976C22 6.27932 17.5228 2.69763 12 2.69763V3Z" fill="#000000"/>
            </svg>
            카카오 로그인
          </button>
          <button type="button" onClick={handleNaverLogin} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#03C75A', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M15.8202 5.00098H20.0002V18.9991H15.8202L8.1791 10.875V18.9991H4.00018V5.00098H8.1791L15.8202 13.124V5.00098Z" fill="white"/>

            </svg>
            네이버 로그인
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          계정이 없으신가요? <Link to="/signup" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>회원가입</Link>
        </div>
      </div>
    </div>
  );
}
