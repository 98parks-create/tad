import React, { useEffect, useState, useRef } from 'react';
import { getQuotes, deleteQuote } from '../services/quoteService';
import { getProfile } from '../services/profileService';
import { useAuth } from '../contexts/AuthContext';
import { Printer, X, Edit, Trash2 } from 'lucide-react';
import PrintTemplate from '../components/PrintTemplate';
import { useReactToPrint } from 'react-to-print';
import { useNavigate } from 'react-router-dom';
import PrintTemplate from '../components/PrintTemplate';
import { useReactToPrint } from 'react-to-print';

export default function QuoteList() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(null);
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `견적서_${selectedQuote?.customerInfo?.project || Date.now()}`,
  });

  const handleEdit = () => {
    navigate('/create', { state: { editQuote: selectedQuote } });
  };

  const handleDelete = async () => {
    if (window.confirm("정말로 이 견적서를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.")) {
      try {
        await deleteQuote(selectedQuote.id);
        setQuotes(quotes.filter(q => q.id !== selectedQuote.id));
        setSelectedQuote(null);
      } catch (err) {
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const data = await getQuotes(currentUser.uid);
        setQuotes(data);
        const profile = await getProfile(currentUser.uid);
        if (profile) setCompanyProfile(profile);
      } catch (err) {
        setError("데이터를 불러올 수 없습니다. Firebase 설정을 확인해주세요.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1rem' }}>전체 견적 내역</h2>
      <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>저장된 모든 견적서를 확인하고 관리할 수 있습니다.</p>
      
      {error && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>{error}</div>}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-light)' }}>
              <th style={{ padding: '1rem 0.5rem' }}>견적일자</th>
              <th style={{ padding: '1rem 0.5rem' }}>고객명</th>
              <th style={{ padding: '1rem 0.5rem' }}>현장명</th>
              <th style={{ padding: '1rem 0.5rem' }}>항목 수</th>
              <th style={{ padding: '1rem 0.5rem' }}>총 금액</th>
              <th style={{ padding: '1rem 0.5rem' }}>상태</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-light)' }}>
                  불러오는 중...
                </td>
              </tr>
            ) : quotes.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-light)' }}>
                  등록된 견적서가 없습니다.
                </td>
              </tr>
            ) : (
              quotes.map(quote => (
                <tr key={quote.id} onClick={() => setSelectedQuote(quote)} style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '1rem 0.5rem' }}>{quote.customerInfo?.date}</td>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{quote.customerInfo?.name}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>{quote.customerInfo?.project}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>{quote.items?.length || 0} 개</td>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 'bold' }}>{quote.grandTotal?.toLocaleString()} 원</td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', backgroundColor: '#e2e8f0', color: '#475569' }}>
                      {quote.status === 'pending' ? '대기/보류' : quote.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedQuote && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setSelectedQuote(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
              <X size={24} color="#64748b" />
            </button>
            <h2 style={{ marginBottom: '1.5rem', paddingRight: '2rem' }}>견적서 상세현황</h2>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <button className="btn btn-primary" onClick={handlePrint}>
                <Printer size={18} /> PDF/인쇄
              </button>
              <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={handleEdit}>
                <Edit size={18} /> 수정
              </button>
              <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }} onClick={handleDelete}>
                <Trash2 size={18} /> 삭제
              </button>
            </div>

            <div style={{ border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '4px', background: '#e2e8f0', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
              <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center', marginBottom: '-50mm' }}>
                <PrintTemplate 
                  ref={printRef}
                  customerInfo={selectedQuote.customerInfo}
                  items={selectedQuote.items}
                  subTotal={selectedQuote.subTotal}
                  vat={selectedQuote.vat}
                  grandTotal={selectedQuote.grandTotal}
                  providerInfo={companyProfile}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
