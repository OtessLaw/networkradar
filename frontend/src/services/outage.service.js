import api from './api';

export const outageService = {
  getActiveOutages: () => api.get('/outages/active'),
  getResolvedOutages: () => api.get('/outages?status=resolved'),
  getAllOutages: () => api.get('/outages'),
};
