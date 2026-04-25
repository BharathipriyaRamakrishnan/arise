import { useGame } from '../context/GameContext';

export default function LevelUpOverlay() {
  const { levelUpEvent } = useGame();
  if (!levelUpEvent) return null;

  return (
    <div className="levelup-overlay" onClick={() => {}}>
      <div style={{ marginBottom: 16, fontSize: '3rem' }}>⚡</div>
      <div className="levelup-text">LEVEL UP</div>
      <div className="levelup-sub">LEVEL {levelUpEvent.level} REACHED</div>
      {levelUpEvent.rank && (
        <div style={{
          marginTop: 24,
          fontFamily: 'var(--font-heading)',
          fontSize: '1.1rem',
          letterSpacing: '4px',
          color: `var(--rank-${levelUpEvent.rank.toLowerCase()})`,
          border: `1px solid var(--rank-${levelUpEvent.rank.toLowerCase()})`,
          padding: '8px 24px',
          borderRadius: 8,
          textAlign: 'center'
        }}>
          RANK {levelUpEvent.rank}
        </div>
      )}
      <div style={{
        marginTop: 32,
        fontFamily: 'var(--font-ui)',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        letterSpacing: '2px'
      }}>
        THE HUNTER GROWS STRONGER
      </div>
    </div>
  );
}
