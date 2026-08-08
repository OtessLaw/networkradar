import api from './api';

export const reportService = {
  submitReport: (data) => api.post('/reports', data),
  getReports: (params) => api.get('/reports', { params }),
  getUserReports: (params) => api.get('/users/me/reports', { params })
};
