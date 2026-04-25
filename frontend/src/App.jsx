import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider } from './context/GameContext';

import Sidebar from './components/Sidebar';
import LevelUpOverlay from './components/LevelUpOverlay';

import Landing    from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Dashboard  from './pages/Dashboard';
import QuestBoard from './pages/QuestBoard';
import Character  from './pages/Character';
import BossArena  from './pages/BossArena';
import Inventory  from './pages/Inventory';
import Shop       from './pages/Shop';
import Story      from './pages/Story';

function AppInner() {
  const { user, player, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16
      }}>
        <div style={{
          fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: 900,
          letterSpacing: '8px',
          background: 'linear-gradient(135deg, #fff, var(--accent-purple), var(--accent-cyan))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>ARISE</div>
        <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--accent-purple)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  // Logged in but not onboarded
  if (!player?.onboardingComplete) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/onboarding" />} />
      </Routes>
    );
  }

  // Fully authenticated
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/dashboard"  element={<Dashboard />} />
          <Route path="/quests"     element={<QuestBoard />} />
          <Route path="/character"  element={<Character />} />
          <Route path="/bosses"     element={<BossArena />} />
          <Route path="/inventory"  element={<Inventory />} />
          <Route path="/shop"       element={<Shop />} />
          <Route path="/story"      element={<Story />} />
          <Route path="*"           element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
      <LevelUpOverlay />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GameProvider>
          <AppInner />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                fontFamily: 'var(--font-ui)',
              }
            }}
          />
        </GameProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
