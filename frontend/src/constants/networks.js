export const NETWORKS = [
  { code: 'MTN', name: 'MTN Ghana', color: '#FFD700', textColor: '#000' },
  { code: 'TELECEL', name: 'Telecel Ghana', color: '#CC0000', textColor: '#fff' },
  { code: 'AT', name: 'AT Ghana', color: '#0066CC', textColor: '#fff' }
];

export const NETWORK_MAP = Object.fromEntries(NETWORKS.map(n => [n.code, n]));
