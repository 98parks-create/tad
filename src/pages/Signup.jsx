import React, { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const nameRef = useRef();
  const companyRef = useRef();
  const termsRef = useRef();
  
  const { signup, loginWithKakao, loginWithNaver } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError('비밀번호가 일치하지 않습니다.');
    }
    
    if (passwordRef.current.value.length < 6) {
      return setError('비밀번호는 6자 이상이어야 합니다.');
    }
    
    if (!termsRef.current.checked) {
      return setError('이용약관 및 개인정보 처리방침에 동의해주세요.');
    }

    try {
      setError('');
      setLoading(true);
      await signup(emailRef.current.value, passwordRef.current.value, nameRef.current.value);
      navigate('/');
    } catch (err) {
      setError('회원가입에 실패했습니다. 이미 존재하는 이메일이거나 형식이 잘못되었습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f6f8', padding: '2rem 0' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary-color)' }}>TAD B2B 회원가입</h2>
        
        {error && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>이름 / 담당자명 <span style={{color: 'var(--danger-color)'}}>*</span></label>
            <input type="text" ref={nameRef} required placeholder="실명을 입력해주세요" />
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>상호명 (회사명)</label>
            <input type="text" ref={companyRef} placeholder="상호명을 입력해주세요 (선택)" />
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>이메일 아이디 <span style={{color: 'var(--danger-color)'}}>*</span></label>
            <input type="email" ref={emailRef} required placeholder="user@company.com" />
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>비밀번호 <span style={{color: 'var(--danger-color)'}}>*</span></label>
            <input type="password" ref={passwordRef} required placeholder="비밀번호 입력 (6자 이상)" minLength={6} />
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>비밀번호 확인 <span style={{color: 'var(--danger-color)'}}>*</span></label>
            <input type="password" ref={passwordConfirmRef} required placeholder="비밀번호 다시 입력" minLength={6} />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>
            <input type="checkbox" id="terms" ref={termsRef} style={{ width: 'auto', marginTop: '0.2rem' }} />
            <label htmlFor="terms" style={{ margin: 0, fontWeight: 'normal', cursor: 'pointer', lineHeight: '1.4' }}>
              [필수] 서비스 이용약관 및 개인정보 처리방침에 동의합니다.
            </label>
          </div>

          <button className="btn btn-primary" disabled={loading} type="submit" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
          <span style={{ padding: '0 1rem', color: '#94a3b8', fontSize: '0.875rem' }}>또는 간편 회원가입</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button type="button" onClick={loginWithKakao} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#FEE500', color: '#000000', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3C6.47715 3 2 6.58172 2 11C2 13.8436 3.65345 16.3353 6.15545 17.6406L5.30314 20.7302C5.20785 21.0776 5.60256 21.3216 5.89926 21.1118L9.58133 18.5204C10.3644 18.636 11.1713 18.6976 12 18.6976C17.5228 18.6976 22 15.1159 22 10.6976C22 6.27932 17.5228 2.69763 12 2.69763V3Z" fill="#000000"/>
            </svg>
            카카오로 시작하기
          </button>
          <button type="button" onClick={loginWithNaver} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#03C75A', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M15.8202 5.00098H20.0002V18.9991H15.8202L8.1791 10.875V18.9991H4.00018V5.00098H8.1791L15.8202 13.124V5.00098Z" fill="white"/>
            </svg>
            네이버로 시작하기
          </button>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          이미 계정이 있으신가요? <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>로그인</Link>
        </div>
      </div>
    </div>
  );
}
