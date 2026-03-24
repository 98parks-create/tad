import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, PlusCircle } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import CreateQuote from './pages/CreateQuote';
import QuoteList from './pages/QuoteList';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Landing from './pages/Landing';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './index.css';

function AppContent() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

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
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div style={{ width: 32, height: 32, backgroundColor: 'white', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>T</span>
          </div>
          TAD B2B
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />대시보드
          </NavLink>
          <NavLink to="/create" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <PlusCircle size={20} />새 견적 작성
          </NavLink>
          <NavLink to="/list" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FileText size={20} />견적 내역
          </NavLink>
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
           v1.1.0 (Multi-User)
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-dark)', margin: 0 }}>통합 견적 솔루션</h2>
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
