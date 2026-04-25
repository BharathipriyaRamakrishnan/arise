import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { questAPI } from '../services/api';
import toast from 'react-hot-toast';

const CLASSES = [
  {
    id: 'warrior', icon: '⚔️', name: 'WARRIOR',
    desc: 'Raw power and physical dominance. Thrives on fitness and endurance.',
    passive: 'Battle Hardened — Strength penalties reduced 30%',
    bonus: '+50% Strength XP gain',
    stats: 'STR 15 · INT 5 · DIS 10 · CHA 5 · HP 15',
    color: 'var(--class-warrior)',
  },
  {
    id: 'scholar', icon: '📚', name: 'SCHOLAR',
    desc: 'Mind over matter. Master of intelligence and deep learning.',
    passive: 'Analytical Mind — Side quest XP +25%',
    bonus: '+50% Intelligence XP gain',
    stats: 'STR 5 · INT 15 · DIS 10 · CHA 5 · HP 15',
    color: 'var(--class-scholar)',
  },
  {
    id: 'shadow', icon: '🌑', name: 'SHADOW',
    desc: 'Silent, consistent, unstoppable. Master of discipline and charisma.',
    passive: 'Ghost Protocol — First missed quest/week has no penalty',
    bonus: '+40% Discipline & Charisma XP',
    stats: 'STR 5 · INT 10 · DIS 15 · CHA 15 · HP 5',
    color: 'var(--class-shadow)',
  },
  {
    id: 'sage', icon: '🌿', name: 'SAGE',
    desc: 'Balanced and holistic. Hardest to master, highest ceiling.',
    passive: 'Balance — No stat can drop below 5',
    bonus: '+25% to ALL stat XP',
    stats: 'STR 10 · INT 10 · DIS 10 · CHA 10 · HP 10',
    color: 'var(--class-sage)',
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user, refreshPlayer, updatePlayer } = useAuth();
  const navigate = useNavigate();

  const handleConfirm = async () => {
    if (!name.trim() || !selectedClass) return;
    setLoading(true);
    try {
      const { playerAPI } = await import('../services/api');
      const res = await playerAPI.create({ name: name.trim(), playerClass: selectedClass });
      updatePlayer(res.data.player);

      // Seed initial daily quests for this class
      const defaults = {
        warrior: [
          { title: 'Morning Workout', icon: '🏋️', statTarget: 'strength', difficulty: 'medium', description: 'Complete your physical training' },
          { title: 'Stay Hydrated', icon: '💧', statTarget: 'health', difficulty: 'easy', description: 'Drink 8 glasses of water' },
          { title: 'Early Rise', icon: '🌅', statTarget: 'discipline', difficulty: 'easy', description: 'Wake up before 7am' },
        ],
        scholar: [
          { title: 'Study Session', icon: '📖', statTarget: 'intelligence', difficulty: 'medium', description: 'Study for at least 2 hours' },
          { title: 'Read 20 Pages', icon: '📚', statTarget: 'intelligence', difficulty: 'easy', description: 'Read 20 pages of any book' },
          { title: 'Sleep by 11pm', icon: '🌙', statTarget: 'health', difficulty: 'easy', description: 'Get proper rest' },
        ],
        shadow: [
          { title: 'Social Connection', icon: '🤝', statTarget: 'charisma', difficulty: 'easy', description: 'Have a meaningful conversation' },
          { title: 'No Procrastination', icon: '⏰', statTarget: 'discipline', difficulty: 'hard', description: 'Complete all planned tasks on time' },
          { title: 'Journaling', icon: '📝', statTarget: 'charisma', difficulty: 'easy', description: 'Write a journal entry' },
        ],
        sage: [
          { title: 'Meditation', icon: '🧘', statTarget: 'health', difficulty: 'easy', description: '10 minutes of mindfulness' },
          { title: 'Learning & Working', icon: '🌟', statTarget: 'intelligence', difficulty: 'medium', description: 'Make progress on a main goal' },
          { title: 'Physical Activity', icon: '🚶', statTarget: 'strength', difficulty: 'easy', description: 'At least 30 mins of movement' },
        ],
      };

      for (const q of defaults[selectedClass] || []) {
        await questAPI.create({ type: 'daily', ...q });
      }

      // Seed 3 side quests
      const SIDE_QUESTS = [
        { title: 'Read 10 Pages', icon: '📖', statTarget: 'intelligence', difficulty: 'easy', description: 'Read 10 pages of any book' },
        { title: 'Talk to Someone New', icon: '💬', statTarget: 'charisma', difficulty: 'easy', description: 'Start a new conversation' },
        { title: 'No Phone for 2 Hours', icon: '📵', statTarget: 'discipline', difficulty: 'medium', description: 'Digital detox for 2 hours' },
      ];
      for (const sq of SIDE_QUESTS) {
        await questAPI.create({ type: 'side', ...sq });
      }

      await refreshPlayer();
      navigate('/dashboard');
      toast.success(`Welcome, ${name}! Your journey begins.`, {
        style: { background: 'var(--bg-card)', color: 'var(--accent-cyan)', border: '1px solid var(--accent-purple)' }
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create character');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-container">
      <div style={{ width: '100%', maxWidth: 680 }}>

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="card animate-in" style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', letterSpacing: '4px', color: 'var(--accent-purple)', marginBottom: 16 }}>
              SYSTEM INITIALIZATION
            </div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 900, letterSpacing: '4px', marginBottom: 8 }}>
              WHAT IS YOUR NAME, HUNTER?
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 36, fontFamily: 'var(--font-ui)' }}>
              This is how the world will remember you.
            </p>
            <input
              className="form-input"
              placeholder="Enter your hunter name..."
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ textAlign: 'center', fontSize: '1.1rem', letterSpacing: '2px', fontFamily: 'var(--font-heading)' }}
              maxLength={24}
              autoFocus
            />
            <button
              className="btn btn-primary btn-lg btn-full"
              style={{ marginTop: 24 }}
              onClick={() => { if (name.trim()) setStep(2); }}
              disabled={!name.trim()}
            >
              CONTINUE →
            </button>
          </div>
        )}

        {/* Step 2: Class */}
        {step === 2 && (
          <div className="animate-in">
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', letterSpacing: '4px', color: 'var(--accent-purple)', marginBottom: 8 }}>
                WELCOME, {name.toUpperCase()}
              </div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 900, letterSpacing: '3px' }}>
                CHOOSE YOUR CLASS
              </h1>
              <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', marginTop: 8 }}>
                Your class shapes your destiny and skill tree.
              </p>
            </div>

            <div className="class-cards-grid">
              {CLASSES.map(cls => (
                <div
                  key={cls.id}
                  className={`class-card class-card--${cls.id}${selectedClass === cls.id ? ' selected' : ''}`}
                  style={{ '--card-accent': cls.color }}
                  onClick={() => setSelectedClass(cls.id)}
                >
                  <div className="class-icon">{cls.icon}</div>
                  <div className="class-name">{cls.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{cls.desc}</div>
                  <div className="class-stat-buster">{cls.bonus}</div>
                  <div className="class-passive">🛡 {cls.passive}</div>
                  <div style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', letterSpacing: '0.5px' }}>
                    {cls.stats}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>← BACK</button>
              <button
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
                onClick={() => { if (selectedClass) setStep(3); }}
                disabled={!selectedClass}
              >
                CONFIRM CLASS →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && selectedClass && (() => {
          const cls = CLASSES.find(c => c.id === selectedClass);
          return (
            <div className="card animate-in" style={{ textAlign: 'center', padding: 48 }}>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>{cls.icon}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', letterSpacing: '4px', color: 'var(--text-muted)', marginBottom: 8 }}>
                YOUR DESTINY
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', letterSpacing: '4px', color: cls.color }}>
                {name.toUpperCase()}
              </h2>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '1rem', letterSpacing: '3px', color: 'var(--text-secondary)', marginBottom: 32 }}>
                {cls.name} CLASS · RANK E
              </div>
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 28, textAlign: 'left' }}>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>Class Abilities</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 8 }}>⚡ {cls.bonus}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>🛡 {cls.passive}</div>
              </div>
              <button className="btn btn-primary btn-lg btn-full" onClick={handleConfirm} disabled={loading}>
                {loading ? '⏳ INITIALIZING...' : '⚡ BEGIN YOUR JOURNEY'}
              </button>
              <button className="btn btn-secondary btn-full" style={{ marginTop: 12 }} onClick={() => setStep(2)}>
                ← CHANGE CLASS
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
