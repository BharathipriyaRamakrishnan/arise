import { useEffect, useState } from 'react';
import { questAPI } from '../services/api';
import QuestCard from '../components/QuestCard';
import toast from 'react-hot-toast';

const DIFFICULTIES = ['easy', 'medium', 'hard', 'legendary'];
const STAT_TARGETS = ['strength', 'intelligence', 'discipline', 'charisma', 'health', 'all'];

export default function QuestBoard() {
  const [tab, setTab]         = useState('daily');
  const [quests, setQuests]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', difficulty: 'medium', statTarget: 'intelligence', dueDate: '', icon: '⚡', subtaskInput: '', subtasks: [] });

  const fetchQuests = async () => {
    setLoading(true);
    try {
      const res = await questAPI.getAll({ type: tab });
      setQuests(res.data.quests);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchQuests(); }, [tab]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        type: tab === 'daily' ? 'daily' : tab === 'main' ? 'main' : 'side',
        title: form.title, description: form.description,
        difficulty: form.difficulty, statTarget: form.statTarget,
        icon: form.icon, subtasks: form.subtasks,
        ...(form.dueDate ? { dueDate: form.dueDate } : {})
      };
      await questAPI.create(payload);
      toast.success('Quest created!', { style: { background: 'var(--bg-card)', color: 'var(--accent-green)', border: '1px solid var(--accent-green)' } });
      setForm({ title: '', description: '', difficulty: 'medium', statTarget: 'intelligence', dueDate: '', icon: '⚡', subtaskInput: '', subtasks: [] });
      setShowForm(false);
      fetchQuests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create quest');
    }
  };

  const addSubtask = () => {
    if (!form.subtaskInput.trim()) return;
    setForm(f => ({ ...f, subtasks: [...f.subtasks, { title: f.subtaskInput }], subtaskInput: '' }));
  };

  const ICONS = ['⚡', '📖', '🏋️', '💧', '🌅', '🤝', '📝', '🎯', '💪', '🧘', '🔍', '✍️', '🚿', '📵', '💬'];

  const activeQuests   = quests.filter(q => q.status === 'active');
  const completedQuests = quests.filter(q => q.status === 'completed');
  const failedQuests   = quests.filter(q => q.status === 'failed');

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">QUEST BOARD</div>
          <div className="page-subtitle">Accept your fate. Complete your quests.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancel' : '+ New Quest'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card animate-in" style={{ marginBottom: 24 }}>
          <div className="modal-title">CREATE QUEST</div>
          <form onSubmit={handleCreate}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Quest Title</label>
                <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Name your quest..." required />
              </div>
              <div className="form-group">
                <label className="form-label">Icon</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {ICONS.map(ic => (
                    <button key={ic} type="button"
                      onClick={() => setForm(f => ({ ...f, icon: ic }))}
                      style={{ fontSize: '1.4rem', padding: '4px', borderRadius: 8, background: form.icon === ic ? 'rgba(124,58,237,0.2)' : 'transparent', border: form.icon === ic ? '1px solid var(--accent-purple)' : '1px solid transparent', cursor: 'pointer' }}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What do you need to do?" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Difficulty</label>
                <select className="form-select" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Stat Target</label>
                <select className="form-select" value={form.statTarget} onChange={e => setForm(f => ({ ...f, statTarget: e.target.value }))}>
                  {STAT_TARGETS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>
            {tab === 'main' && (
              <>
                <div className="form-group">
                  <label className="form-label">Deadline</label>
                  <input className="form-input" type="datetime-local" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Subtasks</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="form-input" value={form.subtaskInput} onChange={e => setForm(f => ({ ...f, subtaskInput: e.target.value }))} placeholder="Add a subtask..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubtask())} />
                    <button type="button" className="btn btn-secondary" onClick={addSubtask}>+</button>
                  </div>
                  {form.subtasks.length > 0 && (
                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {form.subtasks.map((s, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 10px', background: 'var(--bg-secondary)', borderRadius: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          ◻️ {s.title}
                          <button type="button" onClick={() => setForm(f => ({ ...f, subtasks: f.subtasks.filter((_, ii) => ii !== i) }))} style={{ color: 'var(--accent-red)', fontSize: '0.8rem' }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
            <button className="btn btn-primary btn-full" type="submit">⚡ CREATE QUEST</button>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="tab-list">
        {[['daily','📅 DAILY'], ['main','⚔️ MAIN'], ['side','🎲 SIDE']].map(([id, label]) => (
          <button key={id} className={`tab-btn${tab === id ? ' active' : ''}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {loading && <div className="text-muted text-center" style={{ padding: 40 }}>Loading quests...</div>}

      {!loading && (
        <>
          {/* Active */}
          {activeQuests.length > 0 && (
            <>
              <div className="section-title">ACTIVE ({activeQuests.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {activeQuests.map(q => <QuestCard key={q._id} quest={q} onUpdate={fetchQuests} />)}
              </div>
            </>
          )}

          {/* Completed */}
          {completedQuests.length > 0 && (
            <>
              <div className="section-title">COMPLETED ({completedQuests.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {completedQuests.map(q => <QuestCard key={q._id} quest={q} onUpdate={fetchQuests} />)}
              </div>
            </>
          )}

          {/* Failed */}
          {failedQuests.length > 0 && (
            <>
              <div className="section-title">FAILED ({failedQuests.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {failedQuests.map(q => <QuestCard key={q._id} quest={q} onUpdate={fetchQuests} />)}
              </div>
            </>
          )}

          {quests.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📜</div>
              <div className="empty-state-text">No {tab} quests. Create one above!</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
