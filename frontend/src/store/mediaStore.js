import { create } from 'zustand';

// Cache TTL: 5 minutes (in ms). Data older than this will be re-fetched.
export const CACHE_TTL = 5 * 60 * 1000;

const useMediaStore = create((set) => ({
  // Current media data (runtime only)
  currentMedia: null,
  isLoading: false,
  error: null,

  // Search results (temporary)
  searchResults: [],
  
  // Trending content (session only)
  trendingMovies: [],
  trendingTVShows: [],

  // ──────────────────────────────────────────
  // HOME PAGE cache
  // ──────────────────────────────────────────
  homeData: null,
  homeFetchedAt: null,

  // ──────────────────────────────────────────
  // MOVIES PAGE cache
  // ──────────────────────────────────────────
  moviesData: null,
  moviesFetchedAt: null,

  // ──────────────────────────────────────────
  // TV SHOWS PAGE cache
  // ──────────────────────────────────────────
  tvData: null,
  tvFetchedAt: null,

  // ──────────────────────────────────────────
  // PROVIDER PAGE cache (keyed by "providerId_mediaType")
  // ──────────────────────────────────────────
  providerCache: {},       // { [key]: { heroMovies, gridContent } }
  providerCacheFetchedAt: {}, // { [key]: timestamp }

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

  // Cache setters
  setHomeData: (data) => set({ homeData: data, homeFetchedAt: Date.now() }),
  setMoviesData: (data) => set({ moviesData: data, moviesFetchedAt: Date.now() }),
  setTvData: (data) => set({ tvData: data, tvFetchedAt: Date.now() }),
  setProviderData: (key, data) => set((state) => ({
    providerCache: { ...state.providerCache, [key]: data },
    providerCacheFetchedAt: { ...state.providerCacheFetchedAt, [key]: Date.now() },
  })),
  
  clearAll: () => set({
    currentMedia: null,
    isLoading: false,
    error: null,
    searchResults: [],
    trendingMovies: [],
    trendingTVShows: [],
    homeData: null,
    homeFetchedAt: null,
    moviesData: null,
    moviesFetchedAt: null,
    tvData: null,
    tvFetchedAt: null,
    providerCache: {},
    providerCacheFetchedAt: {},
  })
}));

export default useMediaStore;
