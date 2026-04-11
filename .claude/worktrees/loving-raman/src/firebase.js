import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Firebase 설정은 사용자의 프로젝트 정보로 교체해야 합니다.
// (또는 .env 파일을 사용하여 환경변수로 관리)
const firebaseConfig = {
  apiKey: "AIzaSyDDxXgejnprEtXKgdJFae9rzPalUDBCnq4",
  authDomain: "tad-portfolio1.firebaseapp.com",
  projectId: "tad-portfolio1",
  storageBucket: "tad-portfolio1.firebasestorage.app",
  messagingSenderId: "394136176721",
  appId: "1:394136176721:web:bc3d323f833f5176c95070",
  measurementId: "G-SMN0243VX1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
