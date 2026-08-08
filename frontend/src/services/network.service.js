import api from './api';

export const networkService = {
  getNetworks: () => api.get('/networks'),
  getNetworkStats: (code) => api.get(`/networks/${code}/stats`),
};
