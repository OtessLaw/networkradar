import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  outages: [],
  addOutage: (outage) => set((state) => ({ 
    outages: [...state.outages.filter(o => o.id !== outage.id), outage] 
  })),
  removeOutage: (id) => set((state) => ({
    outages: state.outages.filter(o => o.id !== id)
  }))
}));
