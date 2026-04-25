export default function XPBar({ current, needed, level }) {
  const pct = Math.min((current / needed) * 100, 100).toFixed(1);

  return (
    <div className="xp-bar-container">
      <div className="xp-bar-label">
        <span>LEVEL {level}</span>
        <span>{Math.floor(current).toLocaleString()} / {needed.toLocaleString()} XP</span>
      </div>
      <div className="xp-bar-track">
        <div className="xp-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
