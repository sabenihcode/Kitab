import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadBabData } from '@services/api/babApi';
import type { BabData } from '@/types';
import { ChatSheet } from '@components/chat/ChatSheet';
import { useBabProgress } from '@hooks/useBabProgress';

export const BabDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isCompleted, toggleComplete } = useBabProgress();
  
  const [bab, setBab] = useState<BabData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('ID Bab tidak ditemukan');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const babId = Number(id);

        // Validasi input
        if (isNaN(babId) || babId < 1) {
          throw new Error(`ID Bab tidak valid: ${id}`);
        }

        console.log(`[BabDetailPage] Loading bab ${babId}...`);

        // Load data bab
        const data = await loadBabData(babId);
        
        // Validasi data
        if (!data.paragraf || data.paragraf.length === 0) {
          throw new Error('Data bab tidak lengkap atau kosong');
        }

        setBab(data);
        setError(null);
        
        console.log(`[BabDetailPage] Successfully loaded bab ${babId}`);
      } catch (err) {
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Terjadi kesalahan yang tidak diketahui';
        
        console.error(`[BabDetailPage] Error:`, err);
        setError(errorMessage);
        setBab(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // LOADING STATE
  if (loading) {
    return (
      <div className="center-state">
        <div className="spinner" />
        <p>Memuat bab...</p>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="center-state error-state">
        <h2>⚠️ Gagal Memuat Bab</h2>
        <p className="error-message">{error}</p>
        
        <div className="error-details">
          <p className="error-hint">
            📁 Pastikan file `/public/data/bab/{String(id).padStart(2, '0')}.json` ada
          </p>
        </div>

        <div className="error-actions">
          <button 
            onClick={() => window.location.reload()}
            className="btn-secondary"
          >
            🔄 Coba Lagi
          </button>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            ← Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  // NO DATA STATE
  if (!bab) {
    return (
      <div className="center-state">
        <p>Data bab tidak ditemukan</p>
        <button 
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          ← Kembali ke Beranda
        </button>
      </div>
    );
  }

  const done = isCompleted(bab.id);

  return (
    <div className="bab-container">
      {/* Top Navigation */}
      <nav className="bab-topnav animate-fade-in-1">
        <button 
          className="bab-back" 
          onClick={() => navigate('/')}
          aria-label="Kembali ke beranda"
          title="Kembali ke beranda"
        >
          ← Kembali
        </button>
        <span className="bab-navtitle">Bab {bab.id}</span>
        <button 
          className="bab-chat-btn" 
          onClick={() => setIsChatOpen(true)}
          aria-label="Buka AI Chat"
          title="Tanya AI tentang bab ini"
        >
          Tanya AI
        </button>
      </nav>

      {/* Header Bab */}
      <header className="bab-header">
        <p className="bab-header-label animate-fade-in-2">BAB {bab.id}</p>
        <h1 className="bab-header-ar animate-fade-in-3">{bab.judul_ar}</h1>
        <p className="bab-header-id animate-fade-in-4">{bab.judul_id}</p>
        <p className="bab-header-count animate-fade-in-5">
          {bab.paragraf.length} paragraf
        </p>
      </header>

      {/* Action Bar */}
      <div className="bab-action-bar animate-fade-in-5">
        <button
          className={`btn-mark-done ${done ? 'completed' : ''}`}
          onClick={() => toggleComplete(bab.id)}
          aria-pressed={done}
        >
          {done ? '✓ Selesai Dibaca' : '○ Tandai Selesai Dibaca'}
        </button>
      </div>

      {/* Content */}
      <div className="bab-content">
        {bab.paragraf.map((p, index) => {
          const delay = 0.3 + (index * 0.04);
          
          return (
            <article 
              key={p.id} 
              className="paragraf-card"
              style={{
                opacity: 0,
                animation: 'slideUp 0.5s ease forwards',
                animationDelay: `${delay}s`,
              }}
            >
              {/* Tag Info */}
              <div className="paragraf-tag">
                <span className="tag-tipe">
                  {p.tipe === 'ayat' && 'Ayat Al-Qur\'an'}
                  {p.tipe === 'hadits' && 'Hadits'}
                  {p.tipe === 'atsar' && 'Atsar'}
                  {p.tipe === 'matan' && 'Matan Kitab'}
                </span>
                {(p.referensi || p.rawi) && (
                  <span className="tag-meta">
                    {p.referensi && <span className="tag-meta-text">{p.referensi}</span>}
                    {p.rawi && <span className="tag-meta-text">{p.rawi}</span>}
                  </span>
                )}
              </div>

              {/* Paragraf Number */}
              <p className="paragraf-number">Paragraf {index + 1}</p>
              
              {/* Arabic Text */}
              <div className="paragraf-text-ar" lang="ar">
                <p className="paragraf-arab">{p.teks_ar}</p>
              </div>
              
              <div className="paragraf-divider" />
              
              {/* Indonesian Translation */}
              <div className="paragraf-text-id" lang="id">
                <p className="paragraf-terjemah">{p.terjemah}</p>
              </div>
            </article>
          );
        })}

        {/* Khulasah */}
        {bab.khulasah && (
          <section 
            className="khulasah-card"
            style={{
              opacity: 0,
              animation: 'fadeIn 0.6s ease forwards',
              animationDelay: `${0.3 + (bab.paragraf.length * 0.04)}s`,
            }}
          >
            <div className="khulasah-header">
              <span className="khulasah-icon">✨</span>
              <p className="khulasah-eyebrow">Kesimpulan Bab</p>
            </div>
            <h3 className="khulasah-title">Hikmah & Ringkasan</h3>
            <p className="khulasah-text">{bab.khulasah}</p>
          </section>
        )}

        <div className="bab-bottom-spacer" />
      </div>

      {/* Chat Sheet */}
      <ChatSheet
        babData={bab}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
};