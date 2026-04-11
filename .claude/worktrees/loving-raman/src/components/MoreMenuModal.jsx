import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { X, Settings, Shield, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function MoreMenuModal({ isOpen, onClose }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      navigate('/login');
    } catch {
      alert('로그아웃에 실패했습니다.');
    }
  };

  const isAdmin = ['inseopark7@naver.com', import.meta.env.VITE_ADMIN_EMAIL || 'admin@example.com'].includes(currentUser?.email);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000, 
      display: 'flex', flexDirection: 'column',
      backgroundColor: 'var(--bg-color)',
      animation: 'slideUp 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)'
    }}>
      <style>
        {`
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .more-menu-link {
            display: flex; align-items: center; justify-content: space-between;
            padding: 1.2rem 1.5rem; background: var(--surface-color);
            border-bottom: 1px solid var(--border-color); color: var(--text-dark);
            text-decoration: none; font-weight: 500; font-size: 1.05rem;
            transition: background-color 0.2s, transform 0.1s;
          }
          .more-menu-link:active {
            background-color: var(--border-color);
          }
        `}
      </style>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--surface-color)' }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', padding: '0.5rem', cursor: 'pointer', color: 'var(--text-dark)' }}>
          <X size={28} />
        </button>
        <h2 style={{ fontSize: '1.2rem', margin: '0 auto', transform: 'translateX(-22px)' }}>더보기</h2>
      </div>

      {/* User Info */}
      <div style={{ padding: '2rem 1.5rem', backgroundColor: 'var(--surface-color)', marginBottom: '1rem' }}>
        <div style={{ width: 48, height: 48, backgroundColor: 'var(--primary-color)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.5rem' }}>T</span>
        </div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>TAD B2B 솔루션</h3>
        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>{currentUser?.email}</p>
      </div>

      {/* Menu Links */}
      <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--surface-color)' }}>
        <NavLink to="/settings" onClick={onClose} className="more-menu-link tap-effect">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Settings size={22} color="var(--primary-color)" />
            <span>설정 (회사정보)</span>
          </div>
          <ChevronRight size={20} color="var(--text-light)" />
        </NavLink>
        <NavLink to="/pricing" onClick={onClose} className="more-menu-link tap-effect">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Shield size={22} color="var(--primary-color)" />
            <span>요금제 안내</span>
          </div>
          <ChevronRight size={20} color="var(--text-light)" />
        </NavLink>
        <NavLink to="/guide" onClick={onClose} className="more-menu-link tap-effect">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <HelpCircle size={22} color="var(--primary-color)" />
            <span>이용가이드</span>
          </div>
          <ChevronRight size={20} color="var(--text-light)" />
        </NavLink>
        {isAdmin && (
          <NavLink to="/admin" onClick={onClose} className="more-menu-link tap-effect">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Shield size={22} color="#f59e0b" />
              <span style={{ color: '#f59e0b' }}>관리자 승인 센터</span>
            </div>
            <ChevronRight size={20} color="var(--text-light)" />
          </NavLink>
        )}
        
        <button onClick={handleLogout} className="more-menu-link tap-effect" style={{ width: '100%', border: 'none', background: 'var(--surface-color)', textAlign: 'left', marginTop: '1rem', color: 'var(--danger-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <LogOut size={22} />
            <span>로그아웃</span>
          </div>
        </button>
      </div>
    </div>
  );
}
