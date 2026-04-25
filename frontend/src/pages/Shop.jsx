import { useEffect, useState } from 'react';
import { shopAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import toast from 'react-hot-toast';

const RARITY_LABEL = { common: 'COMMON', rare: 'RARE', epic: 'EPIC', legendary: 'LEGENDARY' };

export default function Shop() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [filter, setFilter] = useState('all');
  const { player, refreshPlayer } = useAuth();
  const { triggerLevelUp } = useGame();

  const fetchItems = async () => {
    try {
      const res = await shopAPI.items();
      setItems(res.data.items);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handlePurchase = async (item) => {
    if ((player?.currency || 0) < item.cost) {
      toast.error('Not enough Arise Coins! Complete quests to earn more.', {
        style: { background: 'var(--bg-card)', color: 'var(--accent-red)', border: '1px solid var(--accent-red)' }
      });
      return;
    }
    setPurchasing(item._id);
    try {
      const res = await shopAPI.purchase(item._id);
      const { events } = res.data;
      toast.success(`${item.icon} ${item.name} purchased!`, {
        style: { background: 'var(--bg-card)', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)' }
      });
      events?.filter(e => e.type === 'levelup').forEach(e => triggerLevelUp(e.level, e.rank));
      await refreshPlayer();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Purchase failed');
    }
    setPurchasing(null);
  };

  const TYPES = [
    { id: 'all', label: 'ALL' },
    { id: 'xp_boost', label: '⚡ XP BOOST' },
    { id: 'streak_shield', label: '🛡️ SHIELD' },
    { id: 'stat_elixir', label: '💊 ELIXIR' },
    { id: 'aura_frame', label: '🔮 AURA' },
    { id: 'rank_token', label: '🌟 RANK TOKEN' },
  ];

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">ITEM SHOP</div>
          <div className="page-subtitle">Spend your Arise Coins on power, protection, and prestige.</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--accent-gold)' }}>
            🪙 {(player?.currency || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Arise Coins</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {TYPES.map(({ id, label }) => (
          <button
            key={id}
            className={`tab-btn${filter === id ? ' active' : ''}`}
            style={{ flex: 'none', padding: '8px 16px' }}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <div className="text-muted text-center" style={{ padding: 40 }}>Loading shop...</div>}

      <div className="grid-4">
        {filtered.map(item => (
          <div key={item._id} className={`shop-item-card rarity-${item.rarity} animate-in`}>
            {/* Rarity badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="shop-item-icon">{item.icon}</div>
              <span style={{
                fontSize: '0.65rem', fontFamily: 'var(--font-ui)', fontWeight: 700, letterSpacing: '1px',
                padding: '2px 7px', borderRadius: 100,
                background: item.rarity === 'legendary' ? 'rgba(245,158,11,0.2)' : item.rarity === 'epic' ? 'rgba(124,58,237,0.2)' : item.rarity === 'rare' ? 'rgba(6,182,212,0.2)' : 'rgba(16,185,129,0.1)',
                color: item.rarity === 'legendary' ? 'var(--accent-gold)' : item.rarity === 'epic' ? 'var(--accent-purple)' : item.rarity === 'rare' ? 'var(--accent-cyan)' : 'var(--accent-green)',
              }}>
                {RARITY_LABEL[item.rarity]}
              </span>
            </div>

            <div className="shop-item-name">{item.name}</div>
            <div className="shop-item-desc">{item.description}</div>

            {item.classRestricted && (
              <div style={{ fontSize: '0.72rem', color: `var(--class-${item.classRestricted})`, fontFamily: 'var(--font-ui)', fontWeight: 600 }}>
                🔒 {item.classRestricted.toUpperCase()} ONLY
              </div>
            )}

            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <div className="shop-item-price">🪙 {item.cost}</div>
              <button
                className="btn btn-gold btn-sm"
                onClick={() => handlePurchase(item)}
                disabled={purchasing === item._id || (player?.currency || 0) < item.cost}
              >
                {purchasing === item._id ? '⏳' : 'Buy'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🏪</div>
          <div className="empty-state-text">No items in this category.</div>
        </div>
      )}
    </div>
  );
}
