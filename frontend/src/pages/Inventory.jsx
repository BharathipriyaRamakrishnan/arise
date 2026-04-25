import { useAuth } from '../context/AuthContext';

const ALL_BADGES = [
  { id: 'first_quest',   name: 'First Step',    icon: '👣', desc: 'Complete your first quest' },
  { id: 'week_streak',   name: 'Seven Strong',  icon: '🔥', desc: '7-day overall streak' },
  { id: 'boss_slayer',   name: 'Boss Slayer',   icon: '⚔️', desc: 'Defeat your first boss' },
  { id: 'level_10',      name: 'Rising Hunter', icon: '⬆️', desc: 'Reach level 10' },
  { id: 'scholar_elite', name: 'Scholar Elite', icon: '📚', desc: 'Intelligence stat reaches 100' },
  { id: 'iron_body',     name: 'Iron Body',     icon: '💪', desc: 'Strength stat reaches 100' },
  { id: 'no_days_off',   name: 'No Days Off',   icon: '📅', desc: '30-day overall streak' },
  { id: 'rank_s',        name: 'Rank S',        icon: '⭐', desc: 'Achieve Rank S' },
];

export default function Inventory() {
  const { player } = useAuth();
  if (!player) return null;

  const earned = (player.badges || []);
  const earnedCount = earned.filter(b => !b.startsWith('cosmetic_')).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">INVENTORY</div>
          <div className="page-subtitle">Your badges, achievements, and proof of every battle.</div>
        </div>
        <div className="card" style={{ padding: '12px 24px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--accent-gold)' }}>
            {earnedCount} / {ALL_BADGES.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>BADGES EARNED</div>
        </div>
      </div>

      <div className="section-title">ACHIEVEMENT BADGES</div>
      <div className="grid-4" style={{ marginBottom: 32 }}>
        {ALL_BADGES.map(badge => {
          const isEarned = earned.includes(badge.id);
          return (
            <div key={badge.id} className="card card-glow animate-in" style={{
              textAlign: 'center',
              opacity: isEarned ? 1 : 0.35,
              border: isEarned ? '1px solid rgba(245,158,11,0.4)' : '1px solid var(--border)',
              boxShadow: isEarned ? '0 0 20px rgba(245,158,11,0.15)' : 'none',
              transition: 'all 0.3s',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8, filter: isEarned ? 'none' : 'grayscale(1)' }}>
                {badge.icon}
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '0.9rem', marginBottom: 4, color: isEarned ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                {badge.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{badge.desc}</div>
              {isEarned && (
                <div style={{ marginTop: 8, fontSize: '0.7rem', color: 'var(--accent-green)', fontFamily: 'var(--font-ui)', fontWeight: 700 }}>
                  ✓ EARNED
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Player stats summary */}
      <div className="section-title">HUNTER STATS</div>
      <div className="grid-4">
        {[
          { label: 'Total XP Earned', value: (player.totalXP || 0).toLocaleString(), icon: '⚡', color: 'var(--accent-cyan)' },
          { label: 'Longest Streak', value: `${player.streaks?.overall || 0} days`, icon: '🔥', color: 'var(--accent-gold)' },
          { label: 'Arise Coins', value: (player.currency || 0).toLocaleString(), icon: '🪙', color: 'var(--accent-gold)' },
          { label: 'Skills Unlocked', value: (player.skills || []).length, icon: '✨', color: 'var(--accent-purple)' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '1px', marginTop: 4, fontFamily: 'var(--font-ui)' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
