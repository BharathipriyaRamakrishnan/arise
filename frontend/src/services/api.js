import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('arise_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('arise_token');
      localStorage.removeItem('arise_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
};

// ─── Player ────────────────────────────────────────────────────────────────────
export const playerAPI = {
  create:     (data) => api.post('/player/create', data),
  get:        ()     => api.get('/player'),
  stats:      ()     => api.get('/player/stats'),
  story:      ()     => api.get('/player/story'),
};

// ─── Quests ───────────────────────────────────────────────────────────────────
export const questAPI = {
  getAll:       (params) => api.get('/quests', { params }),
  create:       (data)   => api.post('/quests', data),
  complete:     (id)     => api.put(`/quests/${id}/complete`),
  fail:         (id)     => api.put(`/quests/${id}/fail`),
  delete:       (id)     => api.delete(`/quests/${id}`),
  toggleSubtask:(questId, subtaskId) => api.put(`/quests/${questId}/subtask/${subtaskId}`),
};

// ─── Bosses ────────────────────────────────────────────────────────────────────
export const bossAPI = {
  getAll:   ()               => api.get('/bosses'),
  create:   (data)           => api.post('/bosses', data),
  resolve:  (id, outcome)    => api.put(`/bosses/${id}/resolve`, { outcome }),
  delete:   (id)             => api.delete(`/bosses/${id}`),
};

// ─── Shop ──────────────────────────────────────────────────────────────────────
export const shopAPI = {
  items:    ()     => api.get('/shop/items'),
  purchase: (id)   => api.post(`/shop/purchase/${id}`),
  history:  ()     => api.get('/shop/history'),
};

export default api;
