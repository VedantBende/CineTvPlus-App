import { create } from 'zustand';

const useMediaStore = create((set, get) => ({
  // Current media data (runtime only)
  currentMedia: null,
  isLoading: false,
  error: null,

  // Search results (temporary)
  searchResults: [],
  
  // Trending content (session only)
  trendingMovies: [],
  trendingTVShows: [],

  // Actions
  setCurrentMedia: (media) => set({ currentMedia: media, error: null }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error, isLoading: false }),
  
  setSearchResults: (results) => set({ searchResults: results }),
  
  setTrendingMovies: (movies) => set({ trendingMovies: movies }),
  
  setTrendingTVShows: (shows) => set({ trendingTVShows: shows }),
  
  clearCurrentMedia: () => set({ 
    currentMedia: null, 
    error: null 
  }),
  
  clearSearch: () => set({ searchResults: [] }),
  
  clearAll: () => set({
    currentMedia: null,
    isLoading: false,
    error: null,
    searchResults: [],
    trendingMovies: [],
    trendingTVShows: []
  })
}));

export default useMediaStore;
