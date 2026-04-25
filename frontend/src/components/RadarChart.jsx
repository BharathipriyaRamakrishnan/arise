// SVG Radar/Pentagon chart for 5 stats
const SIZE = 200;
const CENTER = SIZE / 2;
const RADIUS = 80;
const STATS = ['strength', 'intelligence', 'discipline', 'charisma', 'health'];
const LABELS = { strength: '⚔️ STR', intelligence: '🧠 INT', discipline: '🔥 DIS', charisma: '💬 CHA', health: '❤️ HP' };
const MAX_VAL = 200;

const COLORS = {
  strength: '#ef4444', intelligence: '#3b82f6',
  discipline: '#8b5cf6', charisma: '#ec4899', health: '#10b981',
};

function polarToCartesian(angle, r) {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
}

function getPolygonPoints(values, maxR) {
  return STATS.map((stat, i) => {
    const angle = (360 / STATS.length) * i;
    const ratio = Math.min(values[stat] || 0, MAX_VAL) / MAX_VAL;
    const r = ratio * maxR;
    return polarToCartesian(angle, r);
  });
}

export default function RadarChart({ stats = {} }) {
  const points = getPolygonPoints(stats, RADIUS);
  const polyStr = points.map(p => `${p.x},${p.y}`).join(' ');

  // Gridlines
  const grids = [0.25, 0.5, 0.75, 1.0].map(fraction => {
    const gPoints = STATS.map((_, i) => {
      const angle = (360 / STATS.length) * i;
      return polarToCartesian(angle, RADIUS * fraction);
    });
    return gPoints.map(p => `${p.x},${p.y}`).join(' ');
  });

  return (
    <div className="radar-container">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* Grid polygons */}
        {grids.map((poly, i) => (
          <polygon key={i} points={poly} fill="none" stroke="var(--border)" strokeWidth="1" />
        ))}

        {/* Axis lines */}
        {STATS.map((_, i) => {
          const angle = (360 / STATS.length) * i;
          const end = polarToCartesian(angle, RADIUS);
          return <line key={i} x1={CENTER} y1={CENTER} x2={end.x} y2={end.y} stroke="var(--border)" strokeWidth="1" />;
        })}

        {/* Stat polygon fill */}
        <polygon
          points={polyStr}
          fill="rgba(124,58,237,0.15)"
          stroke="var(--accent-purple)"
          strokeWidth="2"
        />

        {/* Dots at each stat vertex */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill={COLORS[STATS[i]]}
            style={{ filter: `drop-shadow(0 0 4px ${COLORS[STATS[i]]})` }} />
        ))}

        {/* Labels */}
        {STATS.map((stat, i) => {
          const angle = (360 / STATS.length) * i;
          const lPos = polarToCartesian(angle, RADIUS + 20);
          return (
            <text key={stat} x={lPos.x} y={lPos.y}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="9" fill="var(--text-secondary)" fontFamily="var(--font-ui)">
              {LABELS[stat]}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
