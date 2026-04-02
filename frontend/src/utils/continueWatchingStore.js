import { fetchMovieDetails, fetchTVShowDetails } from './tmdbApi';

const STORAGE_KEY = 'continueWatching';
const MAX_ITEMS = 20;

export const getContinueWatchingList = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to parse continue watching list', err);
    return [];
  }
};

export const addOrUpdateItem = async (tmdbId, type, season = null, episode = null) => {
  if (!tmdbId || !type) return;

  try {
    let list = getContinueWatchingList();
    const existingIndex = list.findIndex(item => String(item.id) === String(tmdbId));
    let itemToSave;

    if (existingIndex !== -1) {
      // Use existing item and just update properties
      itemToSave = { ...list[existingIndex] };
      itemToSave.season = season ? parseInt(season) : null;
      itemToSave.episode = episode ? parseInt(episode) : null;
      itemToSave.addedAt = new Date().toISOString();
      list.splice(existingIndex, 1);
    } else {
      // New item, fetch metadata
      let metadata;
      if (type === 'movie') {
        metadata = await fetchMovieDetails(tmdbId);
      } else {
        metadata = await fetchTVShowDetails(tmdbId);
      }
      
      if (!metadata) return; // Prevent saving if API fails
      
      itemToSave = {
        id: String(tmdbId),
        type,
        title: metadata.title || 'Unknown Title',
        poster_path: metadata.url || null,
        backdrop_path: metadata.backdrop || null,
        season: season ? parseInt(season) : null,
        episode: episode ? parseInt(episode) : null,
        addedAt: new Date().toISOString()
      };
    }

    list.unshift(itemToSave);

    if (list.length > MAX_ITEMS) {
      list = list.slice(0, MAX_ITEMS);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to add continue watching item', err);
  }
};

export const removeItem = (id) => {
  try {
    let list = getContinueWatchingList();
    list = list.filter(item => String(item.id) !== String(id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to remove item', err);
  }
};

export const clearAll = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear list', err);
  }
};
