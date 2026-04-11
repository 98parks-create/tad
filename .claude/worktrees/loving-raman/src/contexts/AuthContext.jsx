import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, name) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateProfile(userCredential.user, { displayName: name });
    }
    return userCredential;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  // --- 소셜 연동 API ---
  // --- 소셜 연동 API ---
  function loginWithKakao() {
    const KAKAO_CLIENT_ID = 'a943703dfa539a566422a258392aa3e9';
    const redirectUri = `${window.location.origin}/auth/callback/kakao`;
    window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code`;
  }

  function loginWithNaver() {
    const NAVER_CLIENT_ID = 'Hfz9nrxiGx4JoQrsxBMo';
    const redirectUri = `${window.location.origin}/auth/callback/naver`;
    const state = Math.random().toString(36).substring(7);
    window.location.href = `https://nid.naver.com/oauth2.0/authorize?client_id=${NAVER_CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}&state=${state}`;
  }
  // -----------------------

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    logout,
    loginWithKakao,
    loginWithNaver
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
