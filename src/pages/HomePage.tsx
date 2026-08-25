import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadMetadata } from '../services/api/babApi';
import { Metadata } from '../types';
import { useBabProgress } from '../hooks/useBabProgress';
import { useUserProfile } from '../hooks/useUserProfile';
import { getGreetingByTime } from '../utils/getGreeting';
import './HomePage.css'; // ✅ Import CSS

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
        <p>Memuat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="center-state">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!metadata) return null;

  return (
    <div className="home-container page-with-nav">
      {/* ✅ HEADER dengan animasi */}
      <header className="home-header">
        <div className="home-header-text">
          <p className="home-eyebrow animate-fade-in-1">{greeting.text}</p>
          <h1 className="home-title animate-fade-in-2">{profile.name}</h1>
          <p className="home-subtitle animate-fade-in-3">
            Semoga harimu penuh berkah
          </p>
        </div>

        {/* ✅ Logo dengan animasi */}
        <div className="home-avatar animate-fade-in-4">
          <img 
            src="/assets/logo.png" 
            alt="Logo Bustanul Arifin"
            className="home-avatar-img"
          />
        </div>
      </header>

      {/* ✅ Stats dengan stagger animation */}
      <div className="stats-grid">
        <div className="stat-card stat-gold animate-slide-up-1">
          <p className="stat-label">Progress</p>
          <p className="stat-value">
            {completedCount}<span className="stat-total">/{totalBab}</span>
          </p>
          <p className="stat-desc">bab selesai</p>
        </div>
        <div className="stat-card stat-sage animate-slide-up-2">
          <p className="stat-label">Persentase</p>
          <p className="stat-value">
            {progressPercent}<span className="stat-unit">%</span>
          </p>
          <p className="stat-desc">terbaca</p>
        </div>
      </div>

      {/* ✅ Kitab Card dengan animasi */}
      <div className="kitab-card animate-fade-in-5">
        <p className="kitab-label">Kitab Klasik</p>
        <h2 className="kitab-title-ar">{metadata.kitab.judul_ar}</h2>
        <p className="kitab-title-id">{metadata.kitab.judul_id}</p>
        <p className="kitab-meta">
          {metadata.kitab.pengarang} • {metadata.kitab.kategori}
        </p>
      </div>

      {/* ✅ Search dengan animasi */}
      <div className="search-wrap animate-fade-in-6">
        <input
          type="text"
          className="search-input"
          placeholder="Cari bab..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Section Header */}
      <div className="section-header">
        <p className="section-label">Daftar Bab</p>
        <p className="section-count">
          {filteredBab.length} dari {totalBab}
        </p>
      </div>

      {/* ✅ Bab List dengan stagger */}
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
                role={bab.tersedia ? 'link' : undefined}
                tabIndex={bab.tersedia ? 0 : undefined}
                style={{
                  animation: `slideUp 0.4s ease forwards`,
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
                <span className={`bab-check ${done ? 'is-complete' : ''}`} aria-label={done ? 'Sudah selesai' : 'Belum selesai'}>
                  {done ? '✓' : ''}
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