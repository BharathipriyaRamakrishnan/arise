const STAT_COLORS = {
  strength:     'var(--stat-strength)',
  intelligence: 'var(--stat-intelligence)',
  discipline:   'var(--stat-discipline)',
  charisma:     'var(--stat-charisma)',
  health:       'var(--stat-health)',
};

const STAT_ICONS = {
  strength: '⚔️', intelligence: '🧠', discipline: '🔥', charisma: '💬', health: '❤️'
};

export default function StatBars({ stats = {} }) {
  const MAX_STAT = 999;
  return (
    <div>
      {Object.entries(stats).map(([stat, value]) => (
        <div key={stat} className="stat-bar-row">
          <div className="stat-bar-label">
            {STAT_ICONS[stat]} {stat.slice(0, 3).toUpperCase()}
          </div>
          <div className="stat-bar-track">
            <div
              className="stat-bar-fill"
              style={{
                width: `${Math.min((value / MAX_STAT) * 100, 100)}%`,
                background: STAT_COLORS[stat],
                boxShadow: `0 0 8px ${STAT_COLORS[stat]}40`
              }}
            />
          </div>
          <div className="stat-bar-value" style={{ color: STAT_COLORS[stat] }}>{value}</div>
        </div>
      ))}
    </div>
  );
}
