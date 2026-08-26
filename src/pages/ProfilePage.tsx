import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import { useBabProgress } from '../hooks/useBabProgress';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { profile, updateName, resetName, defaultName } = useUserProfile();
  const { completed, clearProgress } = useBabProgress();

  const [name, setName] = useState(profile.name);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setName(profile.name);
  }, [profile.name]);

  const hasChanges = name.trim() !== profile.name && name.trim().length > 0;
  const isDefault = profile.name === defaultName;

  const handleSave = () => {
    if (!name.trim()) return;
    const success = updateName(name);
    if (success) {
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    }
  };

  const handleResetName = () => {
    if (window.confirm(`Reset nama ke default "${defaultName}"?`)) {
      resetName();
      setName(defaultName);
    }
  };

  const handleResetProgress = () => {
    if (window.confirm('Reset semua progress baca?')) {
      clearProgress();
    }
  };

  const getInitials = (str: string): string => {
    if (!str || str === defaultName) return 'A';
    return str.trim().charAt(0).toUpperCase();
  };

  return (
    <div className="profile-container page-with-nav">
      <nav className="profile-topnav animate-fade-in-1">
        <button 
          className="profile-back" 
          onClick={() => navigate('/')}
          aria-label="Kembali"
        >
          Kembali
        </button>
        <span className="profile-navtitle">Pengaturan</span>
        <div style={{ width: 80 }} />
      </nav>

      <div className="profile-content">
        <div className="profile-card-compact animate-scale-in">
          <div className="profile-avatar-medium">
            <span className="profile-avatar-text">
              {getInitials(profile.name)}
            </span>
          </div>
          <div className="profile-info">
            <h2 className="profile-name-display">{profile.name}</h2>
            <p className="profile-meta">Pengguna Bustanul Arifin</p>
          </div>
        </div>

        <div className="settings-card profile-settings-card">
          <p className="settings-eyebrow">Profil Pengguna</p>
          <div className="settings-body">
            <label htmlFor="user-name" className="settings-label">
              Nama Panggilan
            </label>

            <div className="settings-input-wrap">
              <input
                id="user-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Ahmad Fauzi"
                maxLength={30}
                className="settings-input"
              />
              <span className="settings-input-counter">
                {name.length}/30
              </span>
            </div>

            <div className="settings-actions">
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`btn-save ${savedFlash ? 'saved' : ''}`}
              >
                {savedFlash ? 'Tersimpan' : 'Simpan Nama'}
              </button>

              {!isDefault && (
                <button
                  onClick={handleResetName}
                  className="btn-reset-small"
                  title="Reset nama"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="settings-card profile-settings-card">
          <p className="settings-eyebrow">Data Bacaan</p>
          <div className="settings-body">
            <div className="progress-info">
              <div className="progress-info-row">
                <span>Total selesai</span>
                <strong>{completed.length} dari 13 bab</strong>
              </div>
              <div className="progress-info-row">
                <span>Persentase</span>
                <strong>{Math.round((completed.length / 13) * 100)}%</strong>
              </div>
            </div>

            <button
              onClick={handleResetProgress}
              className="btn-danger-full"
            >
              Reset Progress
            </button>
          </div>
        </div>

        <div className="settings-card profile-settings-card">
          <p className="settings-eyebrow">Tentang</p>
          <div className="settings-body">
            <div className="about-row-simple">
              <span>Aplikasi</span>
              <strong>Bustanul Arifin 1.0</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
