import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

// Manual Service Worker Registration
registerSW({ immediate: true })

// Initialize Kakao SDK
if (window.Kakao && !window.Kakao.isInitialized()) {
  const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY;
  if (kakaoKey) {
    window.Kakao.init(kakaoKey);
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
