import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadMetadata } from '@services/api/babApi';
import type { Metadata } from '@/types';
import { useBabProgress } from '@hooks/useBabProgress';

type FilterType = 'all' | 'completed' | 'available';

export const SearchPage = () => {
  const navigate = useNavigate();
  const { isCompleted } = useBabProgress();
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // ← ADD
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await loadMetadata();
        setMetadata(data);
        setError(null);
      } catch (err) { // ← ADD
        const errorMsg = err instanceof Error ? err.message : 'Gagal memuat metadata';
        setError(errorMsg);
        console.error('Error loading metadata:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter + search
  const filteredBab = useMemo(() => {
    if (!metadata) return [];

    let result = metadata.daftar_isi;

    // Apply filter
    if (filter === 'completed') {
      result = result.filter(b => isCompleted(b.id));
    } else if (filter === 'available') {
      result = result.filter(b => b.tersedia);
    }

    // Apply search
    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter(b =>
        b.judul_id.toLowerCase().includes(lower) ||
        b.judul_ar.includes(search) ||
        String(b.id).includes(search)
      );
    }

    return result;
  }, [metadata, search, filter, isCompleted]);

  if (loading) {
    return (
      <div className="center-state">
        <div className="spinner" />
        <p>Memuat...</p>
      </div>
    );
  }

  // ← ADD ERROR STATE
  if (error) {
    return (
      <div className="center-state error-state">
        <h2>⚠️ Terjadi Kesalahan</h2>
        <p>{error}</p>
        <button 
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          ← Kembali ke Beranda
        </button>
      </div>
    );
  }

  if (!metadata) return null;

  return (
    <div className="search-container page-with-nav">
      {/* Top Nav */}
      <nav className="search-topnav animate-fade-in-1">
        <button 
          className="search-back" 
          onClick={() => navigate('/')}
          aria-label="Kembali ke beranda"
        >
          ← Kembali
        </button>
        <span className="search-navtitle">Cari Bab</span>
        <div style={{ width: 80 }} />
      </nav>

      <div className="search-content">
        {/* Search Bar */}
        <div className="search-bar-wrap animate-fade-in-2">
          <input
            type="text"
            className="search-bar-input"
            placeholder="Ketik untuk mencari bab..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            aria-label="Cari bab berdasarkan judul atau nomor"
          />
          {search && (
            <button
              className="search-clear-btn"
              onClick={() => setSearch('')}
              aria-label="Hapus pencarian"
              title="Hapus"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="search-filters animate-fade-in-3">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
            aria-pressed={filter === 'all'}
          >
            Semua
          </button>
          <button
            className={`filter-tab ${filter === 'available' ? 'active' : ''}`}
            onClick={() => setFilter('available')}
            aria-pressed={filter === 'available'}
          >
            Tersedia
          </button>
          <button
            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
            aria-pressed={filter === 'completed'}
          >
            Selesai
          </button>
        </div>

        {/* Result Count */}
        <div className="search-result-count animate-fade-in-4">
          <p className="section-label">
            {search || filter !== 'all' ? 'Hasil Pencarian' : 'Daftar Bab'}
          </p>
          <p className="section-count">
            {filteredBab.length} dari {metadata.daftar_isi.length} bab
          </p>
        </div>

        {/* Results */}
        <div className="search-results">
          {filteredBab.length === 0 ? (
            <div className="empty-state">
              <p>😔 Tidak ada bab yang cocok</p>
              {search && (
                <p className="empty-state-sub">Coba kata kunci lain atau gunakan filter berbeda</p>
              )}
            </div>
          ) : (
            filteredBab.map((bab, index) => {
              const done = isCompleted(bab.id);
              return (
                <article
                  key={bab.id}
                  className={`bab-card ${!bab.tersedia ? 'locked' : ''} ${done ? 'completed' : ''}`}
                  onClick={() => bab.tersedia && navigate(`/bab/${bab.id}`)}
                  onKeyDown={(event) => {
                    if (bab.tersedia && (event.key === 'Enter' || event.key === ' ')) {
                      event.preventDefault();
                      navigate(`/bab/${bab.id}`);
                    }
                  }}
                  role={bab.tersedia ? 'button' : undefined}
                  tabIndex={bab.tersedia ? 0 : -1}
                  aria-label={`Bab ${bab.id}: ${bab.judul_id}${done ? ', selesai dibaca' : ''}`}
                  style={{
                    opacity: 0,
                    animation: 'slideUp 0.4s ease forwards',
                    animationDelay: `${0.3 + (index * 0.04)}s`,
                  }}
                >
                  <div className="bab-num">{String(bab.id).padStart(2, '0')}</div>
                  <div className="bab-info">
                    <h3 className="bab-judul">{bab.judul_id}</h3>
                    <p className="bab-status">
                      {done 
                        ? '✓ Selesai dibaca' 
                        : (bab.tersedia ? '📖 Tersedia' : '⏳ Segera hadir')}
                    </p>
                  </div>
                  <span 
                    className={`bab-check ${done ? 'is-complete' : ''}`} 
                    aria-hidden={!done}
                    aria-label={done ? 'Sudah selesai dibaca' : ''}
                  >
                    {done ? '✓' : ''}
                  </span>
                  <span className="bab-chevron" aria-hidden="true">›</span>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};