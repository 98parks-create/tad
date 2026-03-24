import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, saveProfile } from '../services/profileService';
import { Save, Plus, Trash2, Upload } from 'lucide-react';

export default function Settings() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState({
    companyName: '',
    ceoName: '',
    businessNumber: '',
    address: '',
    phone: '',
    defaultRemarks: '',
    customMaterials: [],
    stampImage: ''
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

  const addCustomMaterial = () => {
    setProfile(prev => ({
      ...prev,
      customMaterials: [...(prev.customMaterials || []), { id: Date.now().toString(), name: '', specification: '', unit: 'EA', unitPrice: 0 }]
    }));
  };

  const updateCustomMaterial = (id, field, value) => {
    setProfile(prev => ({
      ...prev,
      customMaterials: (prev.customMaterials || []).map(m => m.id === id ? { ...m, [field]: value } : m)
    }));
  };

  const removeCustomMaterial = (id) => {
    setProfile(prev => ({
      ...prev,
      customMaterials: (prev.customMaterials || []).filter(m => m.id !== id)
    }));
  };

  const handleStampUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024) {
        alert("도장/직인 이미지는 500KB 이하로 업로드해주세요.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, stampImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
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

        <div className="form-group" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '0.8rem', fontSize: '1.1rem' }}>공식 직인(도장) 이미지 등록 (선택)</h3>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1rem' }}>견적서 공급자 란의 '(인)' 자리에 붉은색 직인이 진짜 계약서처럼 찍혀서 인쇄됩니다.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {profile.stampImage && (
              <div style={{ width: '60px', height: '60px', border: '1px solid #e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                <img src={profile.stampImage} alt="직인 미리보기" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
            )}
            <div>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, color: '#334155' }}>
                <Upload size={16} /> 도장 이미지 업로드 (500KB 이하)
                <input type="file" accept="image/png, image/jpeg" onChange={handleStampUpload} style={{ display: 'none' }} />
              </label>
              {profile.stampImage && (
                <button type="button" onClick={() => setProfile(prev => ({ ...prev, stampImage: '' }))} style={{ marginLeft: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'white', border: '1px solid var(--danger-color)', color: 'var(--danger-color)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>삭제</button>
              )}
            </div>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>나만의 단골 자재/장비대 관리 (DB)</h3>
            <button type="button" className="btn btn-outline" onClick={addCustomMaterial} style={{ padding: '0.3rem 0.8rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Plus size={16} /> 단가 추가
            </button>
          </div>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1rem' }}>이곳에 등록해둔 단골 품목들은 새 견적 작성 시 드롭다운 1순위로 즉시 소환됩니다.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {(profile.customMaterials || []).length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '4px', color: '#64748b', fontSize: '0.9rem' }}>
                등록된 나만의 커스텀 자재가 없습니다. '단가 추가' 버튼을 눌러보세요!
              </div>
            ) : (
              (profile.customMaterials || []).map((mat) => (
                <div key={mat.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(100px, 2fr) minmax(80px, 1fr) 60px minmax(100px, 1.5fr) 40px', gap: '0.5rem', alignItems: 'center', backgroundColor: '#f8fafc', padding: '0.8rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <input type="text" placeholder="품목/자재명" value={mat.name} onChange={(e) => updateCustomMaterial(mat.id, 'name', e.target.value)} style={{ padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.9rem' }} />
                  <input type="text" placeholder="규격" value={mat.specification} onChange={(e) => updateCustomMaterial(mat.id, 'specification', e.target.value)} style={{ padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.9rem' }} />
                  <input type="text" placeholder="단위" value={mat.unit} onChange={(e) => updateCustomMaterial(mat.id, 'unit', e.target.value)} style={{ padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.9rem', textAlign: 'center' }} />
                  <input type="number" placeholder="단가(원)" value={mat.unitPrice} onChange={(e) => updateCustomMaterial(mat.id, 'unitPrice', Number(e.target.value))} style={{ padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.9rem', textAlign: 'right' }} />
                  <button type="button" onClick={() => removeCustomMaterial(mat.id)} style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', display: 'flex', justifyContent: 'center' }} title="삭제">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <Save size={20} />
          {saving ? '저장 중...' : '회사 정보 저장하기'}
        </button>
      </form>
    </div>
  );
}
