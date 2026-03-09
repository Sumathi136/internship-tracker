import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) { localStorage.removeItem('token'); window.location.href = '/login'; }
  return Promise.reject(err);
});

export const authAPI = {
  register:       d => api.post('/auth/register', d),
  login:          d => api.post('/auth/login', d),
  getMe:          () => api.get('/auth/me'),
  updateProfile:  d => api.put('/auth/profile', d),
  changePassword: d => api.put('/auth/password', d),
};

export const appAPI = {
  getAll:      p => api.get('/applications', { params: p }),
  getOne:      id => api.get(`/applications/${id}`),
  create:      d => api.post('/applications', d),
  update:      (id, d) => api.put(`/applications/${id}`, d),
  delete:      id => api.delete(`/applications/${id}`),
  bulkDelete:  ids => api.post('/applications/bulk-delete', { ids }),
  bulkStatus:  (ids, status) => api.put('/applications/bulk-status', { ids, status }),
  addTimeline: (id, d) => api.post(`/applications/${id}/timeline`, d),
  addRound:    (id, d) => api.post(`/applications/${id}/interview-rounds`, d),
  exportCSV:   () => api.get('/applications/export/csv', { responseType: 'blob' }),
  upcoming:    days => api.get('/applications/deadlines/upcoming', { params: { days } }),
};

export const statsAPI = {
  overview: () => api.get('/stats/overview'),
};

export const resumeAPI = {
  getAll:  () => api.get('/resumes'),
  upload:  fd => api.post('/resumes', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:  (id, d) => api.put(`/resumes/${id}`, d),
  delete:  id => api.delete(`/resumes/${id}`),
};

export const noteAPI = {
  getAll: p => api.get('/notes', { params: p }),
  create: d => api.post('/notes', d),
  update: (id, d) => api.put(`/notes/${id}`, d),
  delete: id => api.delete(`/notes/${id}`),
};

export const reminderAPI = {
  sendTest: () => api.post('/reminders/test-email'),
};

export default api;