/**
 * Player Configuration & URL Builders
 *
 * Centralized config for all supported video players.
 * Uses ENV-based URLs and proxy naming for abstraction.
 * No default player — user must choose on first visit.
 */

const STORAGE_KEY = 'cinetv_selected_player';

// ─── ENV-based Base URLs ──────────────────────────────────────────────

const ALPHA_MOVIE = import.meta.env.VITE_PLAYER_ALPHA_MOVIE;
const ALPHA_TV    = import.meta.env.VITE_PLAYER_ALPHA_TV;
const BETA_MOVIE  = import.meta.env.VITE_PLAYER_BETA_MOVIE;
const BETA_TV     = import.meta.env.VITE_PLAYER_BETA_TV;
const GAMMA_MOVIE   = import.meta.env.VITE_PLAYER_GAMMA_MOVIE;
const GAMMA_TV      = import.meta.env.VITE_PLAYER_GAMMA_TV;
const DELTA_MOVIE   = import.meta.env.VITE_PLAYER_DELTA_MOVIE;
const DELTA_TV      = import.meta.env.VITE_PLAYER_DELTA_TV;
const EPSILON_MOVIE = import.meta.env.VITE_PLAYER_EPSILON_MOVIE;
const EPSILON_TV    = import.meta.env.VITE_PLAYER_EPSILON_TV;

// ─── Player Definitions ───────────────────────────────────────────────

export const PLAYERS = {
  alpha: {
    id: 'alpha',
    label: 'Server Alpha',
    description: 'Fast & Reliable',
    getUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === 'tv' && season && episode) {
        return `${ALPHA_TV}/${tmdbId}/${season}/${episode}?color=FF0000&overlay=true&autoplayNextEpisode=true`;
      }
      return `${ALPHA_MOVIE}/${tmdbId}?color=FF0000&overlay=true`;
    },
  },

  beta: {
    id: 'beta',
    label: 'Server Beta',
    description: 'Premium Quality',
    getUrl: (tmdbId, mediaType, season, episode, { autoplay = true, resumeTime = 0 } = {}) => {
      let url = mediaType === 'tv'
        ? `${BETA_TV}/${tmdbId}`
        : `${BETA_MOVIE}/${tmdbId}`;

      if (mediaType === 'tv' && season && episode) {
        url += `/${season}/${episode}`;
      }

      const params = ['color=e50914'];

      if (autoplay) {
        params.push('autoPlay=true');
      }

      // Resume time — only if greater than 10 seconds
      if (resumeTime && resumeTime > 10) {
        const timeInSeconds = Math.floor(resumeTime);
        params.push(`t=${timeInSeconds}`);
      }

      if (mediaType === 'tv') {
        params.push('nextEpisode=true');
        params.push('episodeSelector=true');
      }

      return params.length > 0 ? `${url}?${params.join('&')}` : url;
    },
  },

  gamma: {
    id: 'gamma',
    label: 'Server Gamma',
    description: 'Alternative Source',
    getUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === 'tv' && season && episode) {
        return `${GAMMA_TV}/${tmdbId}/${season}/${episode}`;
      }
      return `${GAMMA_MOVIE}/${tmdbId}`;
    },
  },

  delta: {
    id: 'delta',
    label: 'Server Delta',
    description: 'Standard · Fast',
    getUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === 'tv') {
        if (!season || !episode) {
          console.warn('[Delta] TV requires season and episode');
          return null;
        }
        return `${DELTA_TV}/${tmdbId}/${season}/${episode}`;
      }
      return `${DELTA_MOVIE}/${tmdbId}`;
    },
  },

  epsilon: {
    id: 'epsilon',
    label: 'Server Epsilon',
    description: 'Enhanced · Reliable',
    getUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === 'tv') {
        if (!season || !episode) {
          console.warn('[Epsilon] TV requires season and episode');
          return null;
        }
        return `${EPSILON_TV}/${tmdbId}/${season}/${episode}`;
      }
      return `${EPSILON_MOVIE}/${tmdbId}`;
    },
  },
};

// ─── Constants ────────────────────────────────────────────────────────

export const PLAYER_LIST = Object.values(PLAYERS);

// ─── Persistence ──────────────────────────────────────────────────────

/**
 * Get the last selected player from localStorage.
 * Returns null if no valid saved value — triggers modal.
 */
export function getSavedPlayer() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && PLAYERS[saved]) {
      return saved;
    }
  } catch {
    // localStorage may be unavailable (private browsing, etc.)
  }
  return null;
}

/**
 * Save the selected player to localStorage.
 */
export function savePlayer(playerId) {
  try {
    if (PLAYERS[playerId]) {
      localStorage.setItem(STORAGE_KEY, playerId);
    }
  } catch {
    // Silently fail if localStorage unavailable
  }
}

/**
 * Build embed URL for the given player and content.
 * Falls back to alpha if invalid player ID.
 */
export function getEmbedUrl(playerId, tmdbId, mediaType, season, episode, options = {}) {
  const player = PLAYERS[playerId] || PLAYERS.alpha;
  return player.getUrl(tmdbId, mediaType, season, episode, options);
}
