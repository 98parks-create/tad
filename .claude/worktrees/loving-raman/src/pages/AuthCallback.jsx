import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { getProfile } from '../services/profileService';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const { provider } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    async function processLogin() {
      const code = params.get('code');
      const state = params.get('state');

      if (!code) {
        setError('인증 코드가 없습니다.');
        return;
      }

      try {
        const redirectUri = `${window.location.origin}/auth/callback/${provider}`;
        
        let bodyPayload = {};
        let apiUrl = '';

        if (provider === 'kakao') {
          apiUrl = `/api/auth/kakaoCallback`;
          bodyPayload = { code, redirectUri };
        } else if (provider === 'naver') {
          apiUrl = `/api/auth/naverCallback`;
          bodyPayload = { code, state };
        } else {
          throw new Error('지원하지 않는 로그인 방식입니다.');
        }

        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload)
        });

        const data = await res.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        if (data.customToken) {
          const auth = getAuth();
          const userCredential = await signInWithCustomToken(auth, data.customToken);
          const uid = userCredential.user.uid;

          // Check if profile exists to determine if it's a new user
          const profile = await getProfile(uid);
          if (!profile) {
            navigate('/guide');
          } else {
            navigate('/');
          }
        } else {
          throw new Error('로그인에 실패했습니다. 유효한 토큰이 없습니다.');
        }
      } catch (err) {
        console.error('SSO Login Error:', err);
        setError(`로그인 처리 중 오류 발생: ${err.message}`);
      }
    }

    processLogin();
  }, [params, provider, navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f6f8' }}>
      <div className="card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
        {error ? (
          <div>
            <h3 style={{ color: 'var(--danger-color)', marginBottom: '1rem' }}>로그인 실패</h3>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ marginTop: '1.5rem' }}>로그인 화면으로 돌아가기</button>
          </div>
        ) : (
          <div>
            <h3>{provider === 'kakao' ? '카카오' : '네이버'} 계정 연결 중...</h3>
            <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>안전하게 로그인 처리 중입니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
