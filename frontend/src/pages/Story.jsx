import { useEffect, useState } from 'react';
import { playerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TYPE_ICONS  = { milestone: '⭐', levelup: '⬆️', boss: '💀', daily: '📅', skill: '✨' };

export default function Story() {
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    playerAPI.story()
      .then(res => { setLog(res.data.storyLog); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">STORY LOG</div>
          <div className="page-subtitle">Every action writes a chapter. This is your legend.</div>
        </div>
      </div>

      {loading && <div className="text-muted text-center" style={{ padding: 40 }}>Loading your story...</div>}

      {!loading && log.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📖</div>
          <div className="empty-state-text">Your story is just beginning. Complete quests to write your legend.</div>
        </div>
      )}

      <div className="card">
        {log.map((entry, i) => (
          <div key={i} className="story-entry">
            <div className={`story-dot ${entry.type}`}>
              {TYPE_ICONS[entry.type] || '📌'}
            </div>
            <div className="story-content">
              {entry.chapter && <div className="story-chapter">{entry.chapter}</div>}
              <div className="story-text">"{entry.text}"</div>
              <div className="story-date">{new Date(entry.date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
