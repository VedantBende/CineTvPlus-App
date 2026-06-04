import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
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
    }),
    {
      name: 'cinetv-auth-cache',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

export default useAuthStore;
