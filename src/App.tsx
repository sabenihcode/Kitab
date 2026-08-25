import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { BabDetailPage } from './pages/BabDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { SearchPage } from '@pages/SearchPage';
import { TanyaAIPage } from './pages/TanyaAIPage';
import { BottomNav } from './components/layout/BottomNav';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/bab/:id" element={<BabDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/tanya" element={<TanyaAIPage />} />
      </Routes>
      <BottomNav />
    </>
  );
}

export default App;