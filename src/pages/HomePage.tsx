import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadMetadata } from '../services/api/babApi';
import { Metadata } from '../types';
import { useBabProgress } from '../hooks/useBabProgress';
import { useUserProfile } from '../hooks/useUserProfile';
import { getGreetingByTime } from '../utils/getGreeting';
import './HomePage.css';

export const HomePage = () => {
  const navigate = useNavigate();
  const { isCompleted, completed } = useBabProgress();
  const { profile } = useUserProfile();

  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [greeting, setGreeting] = useState(() => getGreetingByTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreetingByTime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await loadMetadata();
        setMetadata(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredBab = useMemo(() => {
    if (!metadata) return [];
    if (!search.trim()) return metadata.daftar_isi;
    
    const lower = search.toLowerCase();
    return metadata.daftar_isi.filter(bab =>
      bab.judul_id.toLowerCase().includes(lower) ||
      bab.judul_ar.includes(search)
    );
  }, [metadata, search]);

  const totalBab = metadata?.kitab.total_bab || 0;
  const completedCount = completed.length;
  const progressPercent = totalBab > 0 
    ? Math.round((completedCount / totalBab) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="center-state">
        <div className="spinner" />
        <p>Memuat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="center-state error-state">
        <h2>Terjadi Kesalahan</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!metadata) return null;

  return (
    <div className="home-container page-with-nav">
      {/* Header */}
      <header className="home-header">
        <div className="home-header-text">
          <p className="home-eyebrow">{greeting.text}</p>
          <h1 className="home-title">{profile.name}</h1>
          <p className="home-subtitle">Semoga harimu penuh berkah</p>
        </div>

        <div className="home-avatar">
          <img 
            src="/assets/logo.png" 
            alt="Logo Bustanul Arifin"
            className="home-avatar-img"
          />
        </div>
      </header>

      {/* Stats - GRID 2 KOLOM (KIRI KANAN) */}
      <div className="stats-grid">
        <div className="stat-card stat-gold">
          <p className="stat-label">Progress</p>
          <p className="stat-value">
            {completedCount}<span className="stat-total">/{totalBab}</span>
          </p>
          <p className="stat-desc">bab selesai</p>
        </div>
        <div className="stat-card stat-sage">
          <p className="stat-label">Persentase</p>
          <p className="stat-value">
            {progressPercent}<span className="stat-unit">%</span>
          </p>
          <p className="stat-desc">terbaca</p>
        </div>
      </div>

      {/* Kitab Card */}
      <div className="kitab-card">
        <p className="kitab-label">Kitab Klasik</p>
        <h2 className="kitab-title-ar">{metadata.kitab.judul_ar}</h2>
        <p className="kitab-title-id">{metadata.kitab.judul_id}</p>
        <p className="kitab-meta">
          {metadata.kitab.pengarang} • {metadata.kitab.kategori}
        </p>
      </div>

      {/* Search */}
      <div className="search-wrap">
        <input
          type="text"
          className="search-input"
          placeholder="Cari bab..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Cari bab berdasarkan judul"
        />
      </div>

      {/* Section Header */}
      <div className="section-header">
        <p className="section-label">Daftar Bab</p>
        <p className="section-count">
          {filteredBab.length} dari {totalBab}
        </p>
      </div>

      {/* Bab List */}
      <div className="bab-list">
        {filteredBab.length === 0 ? (
          <div className="empty-state">
            <p>Tidak ada bab yang cocok dengan "{search}"</p>
          </div>
        ) : (
          filteredBab.map((bab, index) => {
            const done = isCompleted(bab.id);
            return (
              <div
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
                aria-label={`${bab.judul_id}${done ? ', sudah dibaca' : ''}`}
                style={{
                  animation: 'slideUp 0.4s ease forwards',
                  animationDelay: `${0.5 + index * 0.05}s`,
                  opacity: 0,
                }}
              >
                <div className="bab-num">{String(bab.id).padStart(2, '0')}</div>
                <div className="bab-info">
                  <h3 className="bab-judul">{bab.judul_id}</h3>
                  <p className="bab-status">
                    {done 
                      ? 'Selesai dibaca' 
                      : (bab.tersedia ? 'Tersedia' : 'Segera hadir')}
                  </p>
                </div>
                <span className={`bab-check ${done ? 'is-complete' : ''}`}>
                  {done ? '' : ''}
                </span>
                <span className="bab-chevron" aria-hidden="true">›</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
