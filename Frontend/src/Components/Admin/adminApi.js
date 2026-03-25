import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Automatically attach admin token to every request
API.interceptors.request.use((req) => {
  const info = JSON.parse(localStorage.getItem('adminInfo'));
  if (info?.token) req.headers.Authorization = `Bearer ${info.token}`;
  return req;
});

// ── Auth ──────────────────────────────────────────────────────────────────────
export const loginAdminAPI    = (data) => API.post('/admin/login', data);
export const registerAdminAPI = (data) => API.post('/admin/register', data); // admin creates admin

// ── Problems ──────────────────────────────────────────────────────────────────
export const getAllProblemsAPI = ()           => API.get('/problems');
export const createProblemAPI = (data)        => API.post('/problems', data);
export const updateProblemAPI = (id, data)    => API.put(`/problems/${id}`, data);
export const deleteProblemAPI = (id)          => API.delete(`/problems/${id}`);
export const togglePublishAPI = (id)          => API.patch(`/problems/${id}/publish`);

// ── Setter Requests ───────────────────────────────────────────────────────────
export const submitSetterRequestAPI  = (data) => API.post('/setter-requests', data);
export const getAllSetterRequestsAPI = ()      => API.get('/setter-requests');
export const approveSetterRequestAPI = (id)   => API.patch(`/setter-requests/${id}/approve`);
export const rejectSetterRequestAPI  = (id)   => API.patch(`/setter-requests/${id}/reject`);