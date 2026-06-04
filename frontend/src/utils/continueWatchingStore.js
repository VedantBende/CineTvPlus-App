import axios from 'axios';
import { getAuthHeaders } from './api';

const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Fetch the user's continue watching list from the database.
 * @param {Function} getToken - Clerk getToken function
 * @returns {Array} list of continue watching items
 */
export const fetchContinueWatchingList = async (getToken, isAnime = false) => {
  try {
    const headers = await getAuthHeaders(getToken);
    const response = await axios.get(`${API_URL}/continue-watching?anime=${isAnime}`, { headers });
    return response.data.items || [];
  } catch (error) {
    console.error('Failed to fetch continue watching list:', error);
    return [];
  }
};

/**
 * Add or update a continue watching item in the database.
 * Silently skips if getToken is not available (unauthenticated).
 * @param {Function|null} getToken - Clerk getToken function
 * @param {Object} params - media metadata
 */
export const addOrUpdateItem = async (getToken, { tmdbId, type, title, posterPath, backdropPath, season, episode, isAnime = false }) => {
  if (!getToken || !tmdbId || !type) return;

  try {
    const headers = await getAuthHeaders(getToken);
    await axios.post(
      `${API_URL}/continue-watching`,
      {
        mediaId: String(tmdbId),
        mediaType: type,
        title: title || 'Unknown Title',
        posterPath: posterPath || null,
        backdropPath: backdropPath || null,
        season: season ? parseInt(season) : null,
        episode: episode ? parseInt(episode) : null,
        isAnime
      },
      { headers }
    );
  } catch (error) {
    console.error('Failed to add/update continue watching item:', error);
  }
};

/**
 * Remove a continue watching item from the database.
 * @param {Function} getToken - Clerk getToken function
 * @param {string} mediaId - TMDB media ID
 */
export const removeItem = async (getToken, mediaId, isAnime = false) => {
  if (!getToken || !mediaId) return;

  try {
    const headers = await getAuthHeaders(getToken);
    await axios.delete(`${API_URL}/continue-watching/${mediaId}?anime=${isAnime}`, { headers });
  } catch (error) {
    console.error('Failed to remove continue watching item:', error);
    throw error; // Re-throw so caller can revert optimistic UI
  }
};

/**
 * Bump a continue watching item's updatedAt to move it to position 1.
 * Fire-and-forget — called the instant the user clicks a CW card.
 * @param {Function} getToken - Clerk getToken function
 * @param {string} mediaId - TMDB media ID
 */
export const touchItem = async (getToken, mediaId, isAnime = false) => {
  if (!getToken || !mediaId) return;

  try {
    const headers = await getAuthHeaders(getToken);
    await axios.patch(`${API_URL}/continue-watching/${mediaId}/touch`, { isAnime }, { headers });
  } catch (error) {
    console.error('Failed to touch continue watching item:', error);
  }
};

/**
 * Clear all continue watching history from the database.
 * @param {Function} getToken - Clerk getToken function
 */
export const clearHistory = async (getToken, isAnime = false) => {
  if (!getToken) return;

  try {
    const headers = await getAuthHeaders(getToken);
    await axios.delete(`${API_URL}/continue-watching/clear/all?anime=${isAnime}`, { headers });
  } catch (error) {
    console.error('Failed to clear watch history:', error);
    throw error;
  }
};
