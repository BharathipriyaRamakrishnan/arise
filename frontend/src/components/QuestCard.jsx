import { useState } from 'react';
import { questAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import toast from 'react-hot-toast';

const STREAK_MULT = (s) => s >= 30 ? '2.0x' : s >= 14 ? '1.8x' : s >= 7 ? '1.5x' : s >= 3 ? '1.2x' : '1.0x';

export default function QuestCard({ quest, onUpdate }) {
  const { refreshPlayer, updatePlayer } = useAuth();
  const { triggerXPPop, handleQuestEvents } = useGame();
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (loading || quest.status === 'completed') return;
    setLoading(true);
    try {
      const res = await questAPI.complete(quest._id);
      const { xpGained, coinGained, events, player } = res.data;

      triggerXPPop(xpGained);
      handleQuestEvents(events);
      updatePlayer(player);

      toast.success(`+${xpGained} XP  🪙 +${coinGained}`, {
        icon: quest.icon || '⚡',
        style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }
      });

      if (events?.some(e => e.type === 'badge')) {
        const badge = events.find(e => e.type === 'badge');
        toast.success(`Badge Unlocked: ${badge.badge.name} ${badge.badge.icon}`, {
          duration: 4000,
          style: { background: 'var(--bg-card)', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)' }
        });
      }
      onUpdate?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFail = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await questAPI.fail(quest._id);
      const { penaltyApplied, events, player } = res.data;
      updatePlayer({ stats: player.stats, debuffs: player.debuffs });

      if (events?.some(e => e.type === 'debuff')) {
        toast.error('FATIGUE debuff applied! XP gain reduced for 24h', {
          icon: '😵',
          style: { background: 'var(--bg-card)', color: 'var(--accent-red)', border: '1px solid var(--accent-red)' }
        });
      } else {
        toast.error(`Penalty: -${penaltyApplied} ${quest.statTarget?.toUpperCase()} stat`, {
          icon: '💔',
          style: { background: 'var(--bg-card)', color: 'var(--accent-red)', border: '1px solid var(--accent-red)' }
        });
      }
      onUpdate?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const isCompleted = quest.status === 'completed';
  const isFailed    = quest.status === 'failed';

  return (
    <div className={`quest-card animate-in${isCompleted ? ' completed' : isFailed ? ' failed' : ''}`}>
      <div className="quest-icon">{quest.icon || '⚡'}</div>

      <div className="quest-body">
        <div className="quest-title" style={{ textDecoration: isCompleted ? 'line-through' : 'none' }}>
          {quest.title}
        </div>
        {quest.description && <div className="quest-desc">{quest.description}</div>}

        {/* Subtasks */}
        {quest.subtasks?.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            {quest.subtasks.map(sub => (
              <div key={sub._id} style={{ fontSize: '0.82rem', color: sub.done ? 'var(--accent-green)' : 'var(--text-muted)', display: 'flex', gap: 6, alignItems: 'center' }}>
                <span>{sub.done ? '✅' : '◻️'}</span> {sub.title}
              </div>
            ))}
          </div>
        )}

        <div className="quest-meta">
          <span className={`badge-difficulty ${quest.difficulty}`}>{quest.difficulty}</span>
          <span className="quest-xp">+{quest.xpReward} XP</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>🪙 +{quest.coinReward}</span>
          {quest.streak > 0 && (
            <span className="streak-badge">🔥 {quest.streak}d {STREAK_MULT(quest.streak)}</span>
          )}
        </div>
      </div>

      {!isCompleted && !isFailed && (
        <div className="quest-actions">
          <button className="btn btn-success btn-sm" onClick={handleComplete} disabled={loading}>
            {loading ? '...' : '✓'}
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleFail} disabled={loading}>
            ✗
          </button>
        </div>
      )}

      {isCompleted && <div style={{ color: 'var(--accent-green)', fontSize: '1.4rem' }}>✓</div>}
      {isFailed    && <div style={{ color: 'var(--accent-red)', fontSize: '1.4rem' }}>✗</div>}
    </div>
  );
}
