import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, PlusCircle, Menu, X, Settings as SettingsIcon } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import CreateQuote from './pages/CreateQuote';
import QuoteList from './pages/QuoteList';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Landing from './pages/Landing';
import AuthCallback from './pages/AuthCallback';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './index.css';

function AppContent() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch {
      alert('로그아웃에 실패했습니다.');
    }
  }

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth/callback/:provider" element={<AuthCallback />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
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
        <div className="sidebar-header">
          <div style={{ width: 32, height: 32, backgroundColor: 'white', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>T</span>
          </div>
          TAD B2B
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
          <NavLink to="/settings" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <SettingsIcon size={20} />설정 (회사정보)
          </NavLink>
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
           v1.1.0 (Multi-User)
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-dark)', margin: 0 }}>통합 견적 솔루션</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: 500 }}>{currentUser.email}</span>
            <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem' }} onClick={handleLogout}>로그아웃</button>
          </div>
        </header>
        
        <div className="page-content">
          <Routes>
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/create" element={<PrivateRoute><CreateQuote /></PrivateRoute>} />
            <Route path="/list" element={<PrivateRoute><QuoteList /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
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
