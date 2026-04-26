import { useAuth } from '../context/AuthContext';
import StatBars from '../components/StatBars';
import RadarChart from '../components/RadarChart';
import XPBar from '../components/XPBar';
import { playerAPI } from '../services/api';

const SKILLS_DATA = {
  warrior: [
    { id: 'iron_will',       name: 'Iron Will',       icon: '🔩', desc: '+10% Strength XP gain',         unlock: '7-day workout streak' },
    { id: 'battle_hardened', name: 'Battle Hardened', icon: '🛡️', desc: 'Strength penalties -30%',        unlock: 'Level 5' },
    { id: 'endurance_king',  name: 'Endurance King',  icon: '💪', desc: '+20% Health XP gain',            unlock: '500 Strength XP' },
    { id: 'berserker',       name: 'Berserker Mode',  icon: '⚔️', desc: '2x Strength XP after any quest', unlock: 'Level 20' },
  ],
  scholar: [
    { id: 'deep_focus',      name: 'Deep Focus',      icon: '🧠', desc: '+10% Intelligence XP gain',    unlock: '7-day study streak' },
    { id: 'analytical_mind', name: 'Analytical Mind', icon: '🔬', desc: 'Side quest XP +25%',           unlock: 'Level 5' },
    { id: 'memory_palace',   name: 'Memory Palace',   icon: '🏛️', desc: 'Fatigue duration halved',       unlock: '500 Intelligence XP' },
    { id: 'eureka',          name: 'Eureka Protocol', icon: '💡', desc: 'Main quests give +50 bonus XP', unlock: 'Level 20' },
  ],
  shadow: [
    { id: 'ghost_protocol',  name: 'Ghost Protocol',  icon: '👻', desc: 'First miss/week: no penalty',   unlock: 'Level 5' },
    { id: 'night_owl',       name: 'Night Owl',       icon: '🦉', desc: 'Late discipline quests 1.3x XP',unlock: '7-day discipline streak' },
    { id: 'social_cipher',   name: 'Social Cipher',   icon: '🎭', desc: '+15% Charisma XP gain',         unlock: '300 Charisma XP' },
    { id: 'silent_grind',    name: 'Silent Grind',    icon: '🌑', desc: 'Streak shields last 2 days',     unlock: 'Level 20' },
  ],
  sage: [
    { id: 'aura_mastery',  name: 'Aura Mastery',  icon: '🔮', desc: 'All stat XP +5%',               unlock: 'Level 5' },
    { id: 'equilibrium',   name: 'Equilibrium',   icon: '⚖️', desc: 'No stat drops below 5',          unlock: 'Level 10' },
    { id: 'inner_peace',   name: 'Inner Peace',   icon: '🌿', desc: 'Debuffs expire 25% faster',      unlock: '400 Discipline XP' },
    { id: 'transcendence', name: 'Transcendence', icon: '✨', desc: 'After Lv50: all XP +30%',         unlock: 'Level 50' },
  ],
};

const RANK_THRESHOLDS = [
  { rank: 'E', minLevel: 1 }, { rank: 'D', minLevel: 5 },
  { rank: 'C', minLevel: 15 }, { rank: 'B', minLevel: 30 },
  { rank: 'A', minLevel: 50 }, { rank: 'S', minLevel: 75 },
  { rank: 'SS', minLevel: 100 }, { rank: 'SSS', minLevel: 150 },
];

export default function Character() {
  const { player, xpNeeded } = useAuth();
  if (!player) return null;

  const classSkills = SKILLS_DATA[player.class] || [];
  const now = new Date();
  const activeDebuffs = (player.debuffs || []).filter(d => new Date(d.expiresAt) > now);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">CHARACTER SHEET</div>
          <div className="page-subtitle">Stats, skills, and the shape of your soul.</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Identity */}
          <div className="card card-glow">
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>
              {{ warrior: '⚔️', scholar: '📚', shadow: '🌑', sage: '🌿' }[player.class]}
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', letterSpacing: '3px' }}>{player.name}</div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9rem', letterSpacing: '2px', color: `var(--class-${player.class})`, marginTop: 4 }}>
              {player.class?.toUpperCase()} · RANK {player.rank} · LEVEL {player.level}
            </div>

            {/* Status effects */}
            {activeDebuffs.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div className="section-title">STATUS EFFECTS</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {activeDebuffs.map((d, i) => (
                    <span key={i} className={`debuff-chip ${d.type}`}>
                      {d.type === 'fatigue' ? '😵' : d.type === 'weakened' ? '💔' : '🔮'} {d.type.toUpperCase()}
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        · expires {new Date(d.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <XPBar current={player.currentXP || 0} needed={xpNeeded} level={player.level} />
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', letterSpacing: '1px', marginBottom: 8 }}>RANK PROGRESSION</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {RANK_THRESHOLDS.map(({ rank, minLevel }) => (
                  <span key={rank} className={`badge-rank ${rank}`}
                    style={{ opacity: player.level >= minLevel ? 1 : 0.3 }}>
                    {rank}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="card">
            <div className="section-title">STATS</div>
            <StatBars stats={player.stats} />
            <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div className="section-title">STAT XP</div>
              <StatBars stats={player.statXP || {}} />
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'linear-gradient(to right, rgba(239, 68, 68, 0.05), transparent)' }}>
            <div className="section-title" style={{ color: '#ef4444' }}>DANGER ZONE</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Resetting your hunter will wipe all stats, quests, bosses, and class progression. You will start anew at the onboarding screen. This action cannot be undone.
            </p>
            <button 
              onClick={async () => {
                const confirmed = window.confirm('Are you absolutely sure you want to reset your hunter? ALL progress will be lost!');
                if (confirmed) {
                  try {
                    await playerAPI.reset();
                    window.location.reload();
                  } catch (err) {
                    alert('Failed to reset hunter');
                  }
                }
              }}
              className="btn" 
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', width: '100%' }}
            >
              🔥 Reset Hunter Progress
            </button>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Radar Chart */}
          <div className="card card-glow" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="section-title" style={{ width: '100%' }}>STAT RADAR</div>
            <RadarChart stats={player.stats} />
          </div>

          {/* Skill Tree */}
          <div className="card">
            <div className="section-title">SKILL TREE — {player.class?.toUpperCase()}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {classSkills.map((skill, i) => {
                const isUnlocked = (player.skills || []).includes(skill.id);
                return (
                  <div key={skill.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                    padding: '14px 16px', borderRadius: 'var(--radius-md)',
                    background: isUnlocked ? 'rgba(124,58,237,0.1)' : 'var(--bg-secondary)',
                    border: `1px solid ${isUnlocked ? 'rgba(124,58,237,0.3)' : 'var(--border)'}`,
                    opacity: isUnlocked ? 1 : 0.5,
                    transition: 'all 0.2s'
                  }}>
                    {/* Node indicator */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: isUnlocked ? 'rgba(124,58,237,0.3)' : 'var(--bg-card)',
                        border: `2px solid ${isUnlocked ? 'var(--accent-purple)' : 'var(--border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem',
                        boxShadow: isUnlocked ? '0 0 12px rgba(124,58,237,0.4)' : 'none'
                      }}>{skill.icon}</div>
                      {i < classSkills.length - 1 && (
                        <div style={{ width: 2, height: 12, background: isUnlocked ? 'var(--accent-purple)' : 'var(--border)', opacity: 0.5 }} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '0.95rem', color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {skill.name}
                        </span>
                        {isUnlocked && (
                          <span style={{ fontSize: '0.7rem', background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', color: 'var(--accent-purple)', padding: '1px 7px', borderRadius: 100, fontFamily: 'var(--font-ui)', fontWeight: 700 }}>
                            UNLOCKED
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{skill.desc}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                        🔓 Unlock: {skill.unlock}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
