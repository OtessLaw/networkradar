import api from './api';

export const measurementService = {
  submitTest: (data) => api.post('/measurements', data),
  getRecent: (params) => api.get('/measurements', { params }),
  getUserTests: (params) => api.get('/users/me/measurements', { params })
};
