import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard',  icon: '⚡', label: 'Dashboard' },
  { to: '/quests',     icon: '📜', label: 'Quest Board' },
  { to: '/character',  icon: '👤', label: 'Character' },
  { to: '/bosses',     icon: '💀', label: 'Boss Arena' },
  { to: '/inventory',  icon: '🎒', label: 'Inventory' },
  { to: '/shop',       icon: '🏪', label: 'Shop' },
  { to: '/story',      icon: '📖', label: 'Story Log' },
];

const CLASS_EMOJI = { warrior: '⚔️', scholar: '📚', shadow: '🌑', sage: '🌿' };

export default function Sidebar() {
  const { player, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">ARISE</div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {player && (
        <div className="sidebar-player">
          <div className="sidebar-player-name">
            <span>{CLASS_EMOJI[player.class]}</span>
            <span>{player.name}</span>
            <span className="sidebar-player-rank badge-rank"
              style={{ color: `var(--rank-${player.rank?.toLowerCase()})`, borderColor: `var(--rank-${player.rank?.toLowerCase()})` }}>
              {player.rank}
            </span>
          </div>
          <div className="sidebar-coins">🪙 {player.currency?.toLocaleString() || 0} Arise Coins</div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary btn-sm btn-full mt-12"
            style={{ fontSize: '0.75rem' }}
          >
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}
