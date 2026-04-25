import { useEffect, useState } from 'react';
import { bossAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';

const DIFFICULTIES = ['normal', 'hard', 'elite', 'legendary'];
const DIFF_HP = { normal: 200, hard: 500, elite: 1000, legendary: 2000 };
const DIFF_XP = { normal: 300, hard: 700, elite: 1500, legendary: 3000 };

const BOSS_ICONS = ['💀', '🐉', '👹', '🔱', '☠️', '🌋', '⚡', '🌑'];

export default function BossArena() {
  const [bosses, setBosses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [resolving, setResolving] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', difficulty: 'normal', deadline: '', icon: '💀' });
  const { refreshPlayer } = useAuth();
  const { triggerLevelUp } = useGame();

  const fetchBosses = async () => {
    try {
      const res = await bossAPI.getAll();
      setBosses(res.data.bosses);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchBosses(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await bossAPI.create(form);
      toast.success(`Boss "${form.name}" has appeared!`, {
        icon: form.icon,
        style: { background: 'var(--bg-card)', color: 'var(--accent-red)', border: '1px solid var(--accent-red)' }
      });
      setShowForm(false);
      setForm({ name: '', description: '', difficulty: 'normal', deadline: '', icon: '💀' });
      fetchBosses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleResolve = async (id, outcome) => {
    setResolving(id + outcome);
    try {
      const res = await bossAPI.resolve(id, outcome);
      const { events } = res.data;
      if (outcome === 'won') {
        toast.success('🏆 BOSS DEFEATED! Massive XP gained!', {
          duration: 4000,
          style: { background: 'var(--bg-card)', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)' }
        });
        events?.filter(e => e.type === 'levelup').forEach(e => triggerLevelUp(e.level, e.rank));
      } else {
        toast.error('💔 Defeated by the boss. You will recover.', {
          style: { background: 'var(--bg-card)', color: 'var(--accent-red)', border: '1px solid var(--accent-red)' }
        });
      }
      await refreshPlayer();
      fetchBosses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
    setResolving(null);
  };

  const active  = bosses.filter(b => b.status === 'active');
  const history = bosses.filter(b => b.status !== 'active');

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">BOSS ARENA</div>
          <div className="page-subtitle">Your real-life challenges await. No mercy given.</div>
        </div>
        <button className="btn btn-danger" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancel' : '💀 Summon Boss'}
        </button>
      </div>

      {/* Boss creation form */}
      {showForm && (
        <div className="card animate-in" style={{ marginBottom: 24, border: '1px solid rgba(239,68,68,0.3)' }}>
          <div className="modal-title" style={{ color: 'var(--accent-red)' }}>SUMMON A BOSS</div>
          <form onSubmit={handleCreate}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Boss Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Final Exam, Project Deadline..." required />
              </div>
              <div className="form-group">
                <label className="form-label">Boss Icon</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {BOSS_ICONS.map(ic => (
                    <button key={ic} type="button" onClick={() => setForm(f => ({ ...f, icon: ic }))}
                      style={{ fontSize: '1.4rem', padding: '4px', borderRadius: 8, background: form.icon === ic ? 'rgba(239,68,68,0.2)' : 'transparent', border: form.icon === ic ? '1px solid var(--accent-red)' : '1px solid transparent', cursor: 'pointer' }}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What is this challenge?" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Difficulty</label>
                <select className="form-select" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                  {DIFFICULTIES.map(d => (
                    <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)} — {DIFF_HP[d]} HP · {DIFF_XP[d]} XP</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Deadline</label>
                <input className="form-input" type="datetime-local" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} required />
              </div>
            </div>
            <button className="btn btn-danger btn-full" type="submit">💀 SUMMON BOSS</button>
          </form>
        </div>
      )}

      {/* Active Bosses */}
      {active.length > 0 && (
        <>
          <div className="section-title">⚔️ ACTIVE ENCOUNTERS ({active.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
            {active.map(boss => <BossCard key={boss._id} boss={boss} onResolve={handleResolve} resolving={resolving} />)}
          </div>
        </>
      )}

      {active.length === 0 && !loading && (
        <div className="empty-state" style={{ marginBottom: 32 }}>
          <div className="empty-state-icon">🏆</div>
          <div className="empty-state-text">No active bosses. Summon one to begin a challenge.</div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <>
          <div className="section-title">📜 BATTLE HISTORY ({history.length})</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {history.map(boss => (
              <div key={boss._id} className="card" style={{
                border: `1px solid ${boss.status === 'won' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.2)'}`,
                opacity: 0.7
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', letterSpacing: '1px' }}>
                    {boss.icon} {boss.name}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-ui)', fontWeight: 700,
                    color: boss.status === 'won' ? 'var(--accent-green)' : 'var(--accent-red)',
                    background: boss.status === 'won' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    padding: '2px 8px', borderRadius: 100 }}>
                    {boss.status === 'won' ? '✓ VICTORY' : '✗ DEFEAT'}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8, fontFamily: 'var(--font-ui)' }}>
                  {new Date(boss.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function BossCard({ boss, onResolve, resolving }) {
  const hpPct = Math.max(0, (boss.currentHP / boss.maxHP) * 100);
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const calc = () => {
      const diff = new Date(boss.deadline) - new Date();
      if (diff <= 0) { setRemaining('⚠️ TIME UP'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setRemaining(d > 0 ? `${d}d ${h}h left` : h > 0 ? `${h}h ${m}m left` : `${m}m left`);
    };
    calc();
    const t = setInterval(calc, 30000);
    return () => clearInterval(t);
  }, [boss.deadline]);

  return (
    <div className="boss-card animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--accent-red)', marginBottom: 4 }}>
            ⚔️ BOSS ENCOUNTER
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', letterSpacing: '2px' }}>
            {boss.icon} {boss.name}
          </div>
          {boss.description && (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>{boss.description}</div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--accent-red)' }}>{remaining}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>{boss.difficulty?.toUpperCase()}</div>
        </div>
      </div>

      {/* HP Bar */}
      <div className="boss-hp-track">
        <div className="boss-hp-fill" style={{ width: `${hpPct}%` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 16 }}>
        <span style={{ color: 'var(--accent-red)' }}>HP {boss.currentHP} / {boss.maxHP}</span>
        <span style={{ color: 'var(--text-muted)' }}>+{boss.xpReward} XP on win</span>
      </div>

      {/* Damage log (last 3) */}
      {boss.damageLog?.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '1.5px', marginBottom: 6, fontFamily: 'var(--font-ui)' }}>RECENT HITS</div>
          {[...boss.damageLog].slice(-3).reverse().map((entry, i) => (
            <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>{entry.questTitle}</span>
              <span style={{ color: 'var(--accent-red)', fontWeight: 700 }}>-{entry.damage} HP</span>
            </div>
          ))}
        </div>
      )}

      {/* Resolve buttons */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          className="btn btn-success"
          style={{ flex: 1 }}
          disabled={!!resolving}
          onClick={() => onResolve(boss._id, 'won')}
        >
          {resolving === boss._id + 'won' ? '...' : '🏆 VICTORY'}
        </button>
        <button
          className="btn btn-danger"
          style={{ flex: 1 }}
          disabled={!!resolving}
          onClick={() => onResolve(boss._id, 'lost')}
        >
          {resolving === boss._id + 'lost' ? '...' : '💔 CONCEDE'}
        </button>
      </div>
    </div>
  );
}
