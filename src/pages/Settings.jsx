import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, saveProfile } from '../services/profileService';
import { Save } from 'lucide-react';

export default function Settings() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState({
    companyName: '',
    ceoName: '',
    businessNumber: '',
    address: '',
    phone: '',
    defaultRemarks: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) return;
      try {
        const data = await getProfile(currentUser.uid);
        if (data) {
          setProfile(data);
        }
      } catch (error) {
        console.error('Failed to load profile', error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await saveProfile(currentUser.uid, profile);
      setMessage('회사 정보가 성공적으로 저장되었습니다. 이제 인쇄하는 견적서에 최신 정보가 반영됩니다!');
    } catch (error) {
      setMessage('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="card">불러오는 중...</div>;
  }

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>내 회사 정보 설정 (공급자 프로필)</h2>
      <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>이곳에 등록된 정보는 견적서를 발행(PDF 인쇄)할 때 우측 상단 공급자란에 자동으로 출력됩니다.</p>

      {message && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '4px', backgroundColor: message.includes('성공') ? '#dcfce3' : '#fee2e2', color: message.includes('성공') ? '#166534' : '#991b1b' }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>상호 (회사명)</label>
          <input type="text" name="companyName" value={profile.companyName || ''} onChange={handleChange} placeholder="예) 대한간판" required />
        </div>
        <div className="form-group">
          <label>대표자명</label>
          <input type="text" name="ceoName" value={profile.ceoName || ''} onChange={handleChange} placeholder="예) 홍길동" required />
        </div>
        <div className="form-group">
          <label>사업자등록번호</label>
          <input type="text" name="businessNumber" value={profile.businessNumber || ''} onChange={handleChange} placeholder="예) 123-45-67890" />
        </div>
        <div className="form-group">
          <label>사업장 주소</label>
          <input type="text" name="address" value={profile.address || ''} onChange={handleChange} placeholder="예) 서울시 강남구 테헤란로 123" />
        </div>
        <div className="form-group">
          <label>연락처 (전화번호)</label>
          <input type="text" name="phone" value={profile.phone || ''} onChange={handleChange} placeholder="예) 02-1234-5678" />
        </div>

        <div className="form-group" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '0.8rem', fontSize: '1.1rem' }}>기본 특약사항 / 안내문 (선택)</h3>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1rem' }}>새 견적서를 작성할 때마다 아래 내용이 견적서 하단에 자동으로 채워집니다.</p>
          <textarea 
            name="defaultRemarks" 
            value={profile.defaultRemarks || ''} 
            onChange={handleChange} 
            placeholder="예시)&#10;- 장비대(크레인/스카이) 비용은 현장 상황에 따라 별도 청구될 수 있습니다.&#10;- 결제조건: 계약금 50%, 시공 완료 후 50%" 
            style={{ width: '100%', height: '100px', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '4px', resize: 'vertical' }}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <Save size={20} />
          {saving ? '저장 중...' : '회사 정보 저장하기'}
        </button>
      </form>
    </div>
  );
}
