import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, PlusCircle, Menu, X, Settings as SettingsIcon, Shield, Download, HelpCircle } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import CreateQuote from './pages/CreateQuote';
import QuoteList from './pages/QuoteList';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Landing from './pages/Landing';
import AuthCallback from './pages/AuthCallback';
import Admin from './pages/Admin';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Refund from './pages/Refund';
import Pricing from './pages/Pricing';
import Guide from './pages/Guide';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import './index.css';

// Global variable to capture early beforeinstallprompt events
let globalDeferredPrompt = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalDeferredPrompt = e;
    // Dispatch a custom event to notify React components
    window.dispatchEvent(new CustomEvent('pwa-prompt-available'));
  });
}

function AppContent() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(globalDeferredPrompt);
  const [isIOS] = useState(() => {
    if (typeof window !== 'undefined') {
      return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    }
    return false;
  });
  const [isStandalone] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(display-mode: standalone)').matches || (window.navigator.standalone);
    }
    return false;
  });
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // ios, standalone detects moved to useState lazy init

    // globalDeferredPrompt 초기화는 useState에서 처리됨

    const handlePromptEvent = () => {
      setDeferredPrompt(globalDeferredPrompt);
    };

    window.addEventListener('pwa-prompt-available', handlePromptEvent);
    return () => window.removeEventListener('pwa-prompt-available', handlePromptEvent);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIosGuide(true);
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    }
  };

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch {
      alert('로그아웃에 실패했습니다.');
    }
  }

  // PWA Install Guide Modal for iOS
  const renderPwaInstallGuide = () => {
    const isChromeIOS = /crios/.test(window.navigator.userAgent.toLowerCase());
    
    return (
      <div className={`pwa-guide-overlay ${showIosGuide ? 'active' : ''}`} onClick={() => setShowIosGuide(false)}>
        <div className="pwa-guide-modal" onClick={e => e.stopPropagation()}>
          <div className="pwa-guide-header">
            <h3>아이폰 앱 설치 안내</h3>
            <button className="close-btn" onClick={() => setShowIosGuide(false)}><X size={20} /></button>
          </div>
          <div className="pwa-guide-content">
            <p>이 웹사이트를 앱처럼 편리하게 사용해 보세요!</p>
            <ol className="pwa-steps">
              {isChromeIOS ? (
                <>
                  <li>우측 상단의 <strong>공유 버튼</strong>(또는 점 3개)을 클릭합니다.</li>
                  <li>메뉴가 뜨면 <strong>스크롤을 아래로 내려서</strong></li>
                </>
              ) : (
                <>
                  <li>하단 브라우저 바의 <strong>공유 버튼</strong><span className="ios-icon share-icon"></span>을 클릭합니다.</li>
                </>
              )}
              <li><strong>'홈 화면에 추가'</strong><span className="ios-icon plus-icon"></span>를 찾아 클릭합니다.</li>
              <li>상단 <strong>'추가'</strong> 버튼을 클릭하면 바탕화면에 설치됩니다.</li>
            </ol>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => setShowIosGuide(false)}>확인했습니다</button>
        </div>
      </div>
    );
  };

  // Install Button Visibility Logic
  const showInstallButton = !isStandalone && (deferredPrompt || isIOS);

  if (!currentUser) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/auth/callback/:provider" element={<AuthCallback />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/refund" element={<Refund />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        {showInstallButton && (
          <button
            onClick={handleInstallClick}
            className="pwa-install-btn-floating"
          >
            <Download size={20} />
            앱 설치하기
          </button>
        )}
        {renderPwaInstallGuide()}
        <Chatbot />
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${isMobileMenuOpen ? 'active' : ''}`} 
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header" onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }} style={{ cursor: 'pointer' }}>
          <div style={{ width: 32, height: 32, backgroundColor: 'white', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>T</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 'bold', fontSize: '1.1rem', lineHeight: '1' }}>TAD B2B</span>
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px', fontWeight: 'normal', letterSpacing: '-0.5px' }}>맞춤형 자동 견적 솔루션</span>
          </div>
          {/* Close button for mobile inside sidebar */}
          <button 
            className="mobile-menu-btn" 
            style={{ marginLeft: 'auto', color: 'white' }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />대시보드
          </NavLink>
          <NavLink to="/create" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <PlusCircle size={20} />새 견적 작성
          </NavLink>
          <NavLink to="/list" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FileText size={20} />견적 내역
          </NavLink>
          <NavLink to="/pricing" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Shield size={20} />요금제 안내
          </NavLink>
          <NavLink to="/guide" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <HelpCircle size={20} />이용가이드
          </NavLink>
          <NavLink to="/settings" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <SettingsIcon size={20} />설정 (회사정보)
          </NavLink>
          {['inseopark7@naver.com', import.meta.env.VITE_ADMIN_EMAIL || 'admin@example.com'].includes(currentUser.email) && (
            <NavLink to="/admin" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Shield size={20} color="#f59e0b" />관리자 승인 센터
            </NavLink>
          )}
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
           v1.1.0 (Multi-User)
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <h2 className="header-title" style={{ fontSize: '1.25rem', color: 'var(--text-dark)', margin: 0 }}>맞춤형 자동 견적 솔루션</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <span className="header-email" style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: 500 }}>{currentUser.email}</span>
            <button className="btn btn-outline" style={{ padding: '0.35rem 0.7rem', fontSize: '0.85rem' }} onClick={handleLogout}>로그아웃</button>
          </div>
        </header>
        
        <div className="page-content">
          <Routes>
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/create" element={<PrivateRoute><CreateQuote /></PrivateRoute>} />
            <Route path="/list" element={<PrivateRoute><QuoteList /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
            <Route path="/pricing" element={<PrivateRoute><Pricing /></PrivateRoute>} />
            <Route path="/guide" element={<PrivateRoute><Guide /></PrivateRoute>} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/refund" element={<Refund />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        {showInstallButton && (
          <button
            onClick={handleInstallClick}
            className="pwa-install-btn-floating"
          >
            <Download size={20} />
            앱 설치하기
          </button>
        )}
        {renderPwaInstallGuide()}
        <Chatbot />
        <Footer />
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
