import { useAuth } from '../context/AuthContext';
import XPBar from './XPBar';

const CLASS_EMOJI = { warrior: '⚔️', scholar: '📚', shadow: '🌑', sage: '🌿' };
const CLASS_COLOR  = { warrior: 'var(--class-warrior)', scholar: 'var(--class-scholar)', shadow: 'var(--class-shadow)', sage: 'var(--class-sage)' };

export default function CharacterCard() {
  const { player, xpNeeded } = useAuth();
  if (!player) return null;

  const now = new Date();
  const activeDebuffs = (player.debuffs || []).filter(d => new Date(d.expiresAt) > now);

  return (
    <div className="character-card card-glow">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
        {/* Avatar */}
        <div className="character-avatar">
          {CLASS_EMOJI[player.class] || '🧙'}
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div className="character-name">{player.name}</div>
            <span className={`badge-rank ${player.rank}`}>{player.rank} RANK</span>
          </div>
          <div className="character-class" style={{ color: CLASS_COLOR[player.class] }}>
            {player.class?.toUpperCase()} CLASS
          </div>
          <div className="character-level">LVL {player.level}</div>

          {/* Debuffs */}
          {activeDebuffs.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              {activeDebuffs.map((d, i) => (
                <span key={i} className={`debuff-chip ${d.type}`}>
                  {d.type === 'fatigue' ? '😵' : d.type === 'weakened' ? '💔' : '🔮'} {d.type.toUpperCase()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Currency */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
            🪙 {(player.currency || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Arise Coins</div>
        </div>
      </div>

      {/* XP Bar */}
      <div style={{ marginTop: 20 }}>
        <XPBar current={player.currentXP || 0} needed={xpNeeded} level={player.level} />
      </div>

      {/* Active items */}
      {(player.activeItems || []).filter(i => new Date(i.expiresAt) > now).length > 0 && (
        <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(player.activeItems || [])
            .filter(i => new Date(i.expiresAt) > now)
            .map((item, i) => (
              <span key={i} style={{
                background: 'rgba(6,182,212,0.1)',
                border: '1px solid rgba(6,182,212,0.25)',
                borderRadius: '100px',
                padding: '3px 10px',
                fontSize: '0.75rem',
                color: 'var(--accent-cyan)',
                fontFamily: 'var(--font-ui)',
                fontWeight: 600
              }}>
                ✨ {item.name}
              </span>
            ))}
        </div>
      )}
    </div>
  );
}
