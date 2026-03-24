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
  async function loginWithKakao() {
    // TODO: 카카오 SDK (window.Kakao.Auth.login) 또는 REST API, Firebase Custom Token 연동 코드 작성 영역
    console.log("카카오 로그인 연동 필요");
    alert("카카오 로그인 연동 준비 중 (실제 API 연결 시 이 함수에서 처리합니다)");
  }

  async function loginWithNaver() {
    // TODO: 네이버 로그인 SDK 또는 REST API, Firebase Custom Token 연동 코드 작성 영역
    console.log("네이버 로그인 연동 필요");
    alert("네이버 로그인 연동 준비 중 (실제 API 연결 시 이 함수에서 처리합니다)");
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
