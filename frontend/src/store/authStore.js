import { create } from 'zustand';

const useAuthStore = create((set) => ({
   user: null,
  isAuthenticated: false,
  isSyncing: false,
  syncError: null,
  
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user,
    isSyncing: false,
    syncError: null
  }),
  
  clearUser: () => set({ 
    user: null, 
    isAuthenticated: false,
    isSyncing: false,
    syncError: null
  }),

  setSyncing: (isSyncing) => set({ isSyncing }),
  setSyncError: (error) => set({ syncError: error, isSyncing: false })
}));

export default useAuthStore;
