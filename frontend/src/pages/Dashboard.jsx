import { useEffect, useState } from 'react';
import { questAPI, bossAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CharacterCard from '../components/CharacterCard';
import StatBars from '../components/StatBars';
import QuestCard from '../components/QuestCard';

export default function Dashboard() {
  const { player } = useAuth();
  const [dailyQuests, setDailyQuests] = useState([]);
  const [activeBoss, setActiveBoss]   = useState(null);
  const [loading, setLoading]         = useState(true);

  const fetchData = async () => {
    try {
      const [qRes, bRes] = await Promise.all([
        questAPI.getAll({ type: 'daily' }),
        bossAPI.getAll(),
      ]);
      setDailyQuests(qRes.data.quests.filter(q => q.status !== 'expired').slice(0, 4));
      const active = bRes.data.bosses.find(b => b.status === 'active');
      setActiveBoss(active || null);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  if (!player) return null;

  const completedToday = dailyQuests.filter(q => q.status === 'completed').length;
  const totalToday     = dailyQuests.length;
  const overallStreak  = player.streaks?.overall || 0;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">COMMAND CENTER</div>
          <div className="page-subtitle">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div className="card" style={{ padding: '12px 20px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--accent-gold)' }}>{overallStreak}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>DAY STREAK</div>
          </div>
          <div className="card" style={{ padding: '12px 20px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--accent-cyan)' }}>{completedToday}/{totalToday}</div>
            <div style={{ fontSize: '0.72px', color: 'var(--text-muted)', letterSpacing: '1px' }}>QUESTS TODAY</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <CharacterCard />

          {/* Active Boss */}
          {activeBoss && (
            <div className="boss-card animate-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--accent-red)', marginBottom: 4 }}>
                    ⚠️ ACTIVE BOSS ENCOUNTER
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', letterSpacing: '2px' }}>
                    {activeBoss.icon} {activeBoss.name}
                  </div>
                </div>
                <BossCountdown deadline={activeBoss.deadline} />
              </div>
              <div className="boss-hp-track">
                <div
                  className="boss-hp-fill"
                  style={{ width: `${(activeBoss.currentHP / activeBoss.maxHP) * 100}%` }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <span>HP: {activeBoss.currentHP} / {activeBoss.maxHP}</span>
                <span style={{ color: 'var(--accent-cyan)' }}>Complete quests to deal damage</span>
              </div>
            </div>
          )}

          {/* Daily quests preview */}
          <div>
            <div className="section-title">TODAY'S QUESTS</div>
            {loading && <div className="text-muted text-center">Loading...</div>}
            {!loading && dailyQuests.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">📜</div>
                <div className="empty-state-text">No quests today. Head to Quest Board to create some!</div>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {dailyQuests.map(q => (
                <QuestCard key={q._id} quest={q} onUpdate={fetchData} />
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card card-glow">
            <div className="section-title">STATS</div>
            <StatBars stats={player.stats} />
          </div>

          {/* Skills */}
          {(player.skills || []).length > 0 && (
            <div className="card">
              <div className="section-title">ACTIVE SKILLS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(player.skills || []).map(skillId => (
                  <SkillChip key={skillId} id={skillId} />
                ))}
              </div>
            </div>
          )}

          {/* Quick stats */}
          <div className="card">
            <div className="section-title">HUNTER INFO</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Total XP', value: (player.totalXP || 0).toLocaleString(), color: 'var(--accent-cyan)' },
                { label: 'Badges', value: (player.badges || []).length, color: 'var(--accent-gold)' },
                { label: 'Skills', value: (player.skills || []).length, color: 'var(--accent-purple)' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', letterSpacing: '0.5px' }}>
                    {row.label}
                  </span>
                  <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BossCountdown({ deadline }) {
  const [remaining, setRemaining] = useState('');
  useEffect(() => {
    const calc = () => {
      const diff = new Date(deadline) - new Date();
      if (diff <= 0) { setRemaining('TIME UP'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setRemaining(d > 0 ? `${d}d ${h}h` : `${h}h ${m}m`);
    };
    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, [deadline]);

  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--accent-red)' }}>{remaining}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>REMAINING</div>
    </div>
  );
}

const SKILL_LABELS = {
  iron_will: 'Iron Will', battle_hardened: 'Battle Hardened', endurance_king: 'Endurance King', berserker: 'Berserker Mode',
  deep_focus: 'Deep Focus', analytical_mind: 'Analytical Mind', memory_palace: 'Memory Palace', eureka: 'Eureka Protocol',
  ghost_protocol: 'Ghost Protocol', night_owl: 'Night Owl', social_cipher: 'Social Cipher', silent_grind: 'Silent Grind',
  aura_mastery: 'Aura Mastery', equilibrium: 'Equilibrium', inner_peace: 'Inner Peace', transcendence: 'Transcendence',
};

function SkillChip({ id }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '6px 12px', borderRadius: 8,
      background: 'rgba(124,58,237,0.1)',
      border: '1px solid rgba(124,58,237,0.2)',
      fontSize: '0.82rem', color: 'var(--accent-purple)',
      fontFamily: 'var(--font-ui)', fontWeight: 600
    }}>
      ✨ {SKILL_LABELS[id] || id}
    </div>
  );
}
