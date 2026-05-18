import api from './axios';

export const publicAPI = {
  submitContact: (data) => api.post('/contact', data),
};

export const authAPI = {
  login: (email, password, role) => api.post('/auth/login', { email, password, role }),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPasswordOtp: (data) => api.post('/auth/reset-password-otp', data),
  googleLogin: (credential, role) => api.post('/auth/google', { credential, role }),
};

export const complaintsAPI = {
  list: (params) => api.get('/complaints', { params }),
  get: (id) => api.get(`/complaints/${id}`),
  create: (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'attachments' && Array.isArray(value)) {
        value.forEach((file) => formData.append('attachments[]', file));
      } else {
        formData.append(key, value);
      }
    });
    return api.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id, data) => api.put(`/complaints/${id}`, data),
  delete: (id) => api.delete(`/complaints/${id}`),
  updateStatus: (id, status, note) => api.patch(`/complaints/${id}/status`, { status, note }),
  assign: (id, staffId) => api.patch(`/complaints/${id}/assign`, { staff_id: staffId }),
  addComment: (id, content) => api.post(`/complaints/${id}/comments`, { content }),
};

export const chatAPI = {
  getMessages: (complaintId, params) => api.get(`/complaints/${complaintId}/chat`, { params }),
  sendMessage: (complaintId, message) => api.post(`/complaints/${complaintId}/chat`, { message }),
};

export const organizationsAPI = {
  list: (params) => api.get('/organizations', { params }),
  get: (id) => api.get(`/organizations/${id}`),
  create: (data) => api.post('/organizations', data),
  update: (id, data) => api.put(`/organizations/${id}`, data),
  delete: (id) => api.delete(`/organizations/${id}`),
  assignUser: (id, data) => api.post(`/organizations/${id}/users`, data),
  getStaff: (id) => api.get(`/organizations/${id}/staff`),
  getStats: (id) => api.get(`/organizations/${id}/stats`),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getCharts: (params) => api.get('/dashboard/charts', { params }),
  getRecent: () => api.get('/dashboard/recent'),
};

export const notificationsAPI = {
  list: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export const usersAPI = {
  list: (params) => api.get('/users', { params }),
  get: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
};
