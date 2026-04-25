import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Landing() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const data = await login(form.email, form.password);
        if (data.user?.player?.onboardingComplete) navigate('/dashboard');
        else navigate('/onboarding');
      } else {
        await register(form.username, form.email, form.password);
        navigate('/onboarding');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong', {
        style: { background: 'var(--bg-card)', color: 'var(--accent-red)', border: '1px solid var(--accent-red)' }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing">
      <div>
        <div className="landing-logo">ARISE</div>
        <div className="landing-tagline">Your life. Your quest. Your legend.</div>
      </div>

      <div className="auth-box">
        {/* Mode switcher */}
        <div className="tab-list" style={{ marginBottom: 28 }}>
          <button className={`tab-btn${mode === 'login' ? ' active' : ''}`} onClick={() => setMode('login')}>
            LOGIN
          </button>
          <button className={`tab-btn${mode === 'register' ? ' active' : ''}`} onClick={() => setMode('register')}>
            REGISTER
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Hunter Name</label>
              <input
                className="form-input"
                placeholder="Choose your name..."
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="hunter@arise.gg"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>

          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? '...' : mode === 'login' ? '⚡ ENTER THE SYSTEM' : '🌟 BEGIN YOUR JOURNEY'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
          "Every expert was once a beginner. Every rank S was once rank E."
        </div>
      </div>
    </div>
  );
}
