import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadMetadata, loadBabData } from '@services/api/babApi';
import type { Metadata, BabData } from '@/types';
import { ChatSheet } from '@components/chat/ChatSheet';

export const TanyaAIPage = () => {
  const navigate = useNavigate();
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [selectedBab, setSelectedBab] = useState<BabData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingBab, setLoadingBab] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await loadMetadata();
        setMetadata(data);
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Gagal memuat metadata';
        setError(errorMsg);
        console.error('Error loading metadata:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectBab = async (babId: number) => {
    try {
      setLoadingBab(true);
      const babData = await loadBabData(babId);
      
      if (!babData) {
        throw new Error('Data bab tidak ditemukan');
      }

      setSelectedBab(babData);
      setError(null);
      setIsChatOpen(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal memuat bab';
      setError(errorMsg);
      console.error('Gagal load bab:', err);
      setIsChatOpen(false);
    } finally {
      setLoadingBab(false);
    }
  };

  if (loading) {
    return (
      <div className="center-state">
        <div className="spinner" />
        <p>Memuat daftar bab...</p>
      </div>
    );
  }

  if (error && !isChatOpen) {
    return (
      <div className="center-state error-state">
        <h2>Terjadi Kesalahan</h2>
        <p>{error}</p>
        <button 
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="center-state">
        <p>Data tidak tersedia</p>
        <button 
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const availableBabs = metadata.daftar_isi.filter(b => b.tersedia);

  return (
    <div className="tanya-container page-with-nav">
      {/* Top Nav */}
      <nav className="tanya-topnav animate-fade-in-1">
        <button 
          className="tanya-back" 
          onClick={() => navigate('/')}
          aria-label="Kembali ke beranda"
        >
          Kembali
        </button>
        <span className="tanya-navtitle">Tanya Jawab</span>
        <div style={{ width: 80 }} />
      </nav>

      <div className="tanya-content">
        {/* Info Header Card */}
        <header className="tanya-info-card animate-fade-in-2">
          <div className="info-card-content">
            <h1 className="tanya-info-title">Ajak Sabenih Diskusi</h1>
            <p className="tanya-info-desc">
              Pilih bab kitab yang ingin kamu diskusikan. Sabenih siap menjawab pertanyaan-pertanyaanmu dengan penjelasan mendalam dan relevan.
            </p>
          </div>
        </header>

        {/* List Bab */}
        <div className="tanya-bab-section">
          <h2 className="tanya-section-title">Pilih Bab untuk Didiskusikan</h2>
          
          <div className="tanya-bab-list">
            {availableBabs.length === 0 ? (
              <div className="empty-state-card">
                <p>Belum ada bab yang tersedia untuk didiskusikan</p>
              </div>
            ) : (
              availableBabs.map((bab, index) => (
                <article
                  key={bab.id}
                  className="tanya-bab-card"
                  onClick={() => handleSelectBab(bab.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleSelectBab(bab.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Diskusikan ${bab.judul_id}`}
                  style={{
                    opacity: 0,
                    animation: 'slideUp 0.4s ease forwards',
                    animationDelay: `${0.3 + (index * 0.05)}s`,
                    cursor: loadingBab ? 'wait' : 'pointer',
                  }}
                >
                  <div className="tanya-bab-header">
                    <div className="tanya-bab-num">{String(bab.id).padStart(2, '0')}</div>
                    <div className="tanya-bab-info">
                      <h3 className="tanya-bab-judul">{bab.judul_id}</h3>
                      <p className="tanya-bab-judul-ar">{bab.judul_ar}</p>
                    </div>
                  </div>
                  
                  <div className="tanya-bab-footer">
                    <p className="tanya-bab-action">
                      {loadingBab ? 'Memuat...' : 'Mulai Chat'}
                    </p>
                    <span className="tanya-bab-chevron" aria-hidden="true">›</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        {/* Tips Section Card */}
        <section className="tanya-tips-card animate-fade-in-4">
          <div className="tips-card-header">
            <h2 className="tips-title">Tips Bertanya yang Efektif</h2>
          </div>
          
          <div className="tips-card-content">
            <ul className="tips-list">
              <li className="tips-list-item">
                <span className="tips-icon">1</span>
                <div className="tips-text">
                  <p className="tips-label">Tanyakan Hal yang Ingin Dipahami</p>
                  <p className="tips-desc">Ajukan pertanyaan tentang hal yang ingin kamu pahami lebih dalam dari materi</p>
                </div>
              </li>
              
              <li className="tips-list-item">
                <span className="tips-icon">2</span>
                <div className="tips-text">
                  <p className="tips-label">Jangan Takut Bertanya Berkali-kali</p>
                  <p className="tips-desc">Tidak ada batasan jumlah pertanyaan, tanyakan sampai kamu benar-benar memahami</p>
                </div>
              </li>
              
              <li className="tips-list-item">
                <span className="tips-icon">3</span>
                <div className="tips-text">
                  <p className="tips-label">Berikan Konteks Jika Diperlukan</p>
                  <p className="tips-desc">Jelaskan latar belakang atau konteks pertanyaanmu agar jawaban lebih spesifik</p>
                </div>
              </li>
              
              <li className="tips-list-item">
                <span className="tips-icon">4</span>
                <div className="tips-text">
                  <p className="tips-label">Pertanyaan Spesifik Menghasilkan Jawaban Lebih Baik</p>
                  <p className="tips-desc">Semakin detail pertanyaanmu, semakin detail dan relevan jawaban yang akan diberikan</p>
                </div>
              </li>
            </ul>
          </div>
        </section>
      </div>

      {/* Chat Sheet */}
      {selectedBab && (
        <ChatSheet
          babData={selectedBab}
          isOpen={isChatOpen}
          onClose={() => {
            setIsChatOpen(false);
            setSelectedBab(null);
            setError(null);
          }}
        />
      )}

      {/* Error Toast */}
      {error && isChatOpen && (
        <div className="error-toast">
          <p>{error}</p>
          <button 
            onClick={() => setError(null)}
            className="error-toast-close"
            aria-label="Tutup pesan error"
          >
            X
          </button>
        </div>
      )}
    </div>
  );
};
