import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Get progress from localStorage
 */
export const getLocalProgress = (tmdbId, mediaType, season = null, episode = null) => {
  const storageKey = `progress_${mediaType}_${tmdbId}${season ? `_${season}_${episode}` : ''}`;
  const stored = localStorage.getItem(storageKey);
  
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing stored progress:', error);
      return null;
    }
  }
  return null;
};

/**
 * Update watch progress on backend
 */
export const updateProgress = async (progressData) => {
  try {
    const response = await axios.post(
      `${API_URL}/progress/update`,
      progressData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error updating progress:', error);
    throw error;
  }
};

/**
 * Get progress for specific media from backend
 */
export const getProgress = async (mediaId, season = null, episode = null) => {
  try {
    let url = `${API_URL}/progress/${mediaId}`;
    const params = new URLSearchParams();
    
    if (season) params.append('season', season);
    if (episode) params.append('episode', episode);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await axios.get(url, {
      withCredentials: true
    });

    return response.data.progress;
  } catch (error) {
    console.error('Error fetching progress:', error);
    return null;
  }
};

/**
 * Get continue watching list
 */
export const getContinueWatching = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/progress/continue/watching`,
      {
        withCredentials: true
      }
    );

    return response.data.continueWatching || [];
  } catch (error) {
    console.error('Error fetching continue watching:', error);
    return [];
  }
};

/**
 * Parse player event and save progress
 */
export const handlePlayerEvent = async (eventData, tmdbId, mediaType, season = null, episode = null) => {
  if (eventData.type === 'PLAYER_EVENT') {
    const { currentTime, duration, progress } = eventData.data;

    // Save to localStorage immediately
    const progressData = {
      tmdbId,
      mediaType,
      season,
      episode,
      currentTime,
      duration,
      progress,
      lastWatched: new Date().toISOString()
    };

    const storageKey = `progress_${mediaType}_${tmdbId}${season ? `_${season}_${episode}` : ''}`;
    localStorage.setItem(storageKey, JSON.stringify(progressData));

    // Debounce backend updates (only save every 10 seconds)
    if (!window.progressUpdateTimeout) {
      window.progressUpdateTimeout = setTimeout(async () => {
        try {
          await updateProgress({
            mediaId: tmdbId.toString(),
            mediaType,
            currentTime,
            duration,
            season,
            episode
          });
        } catch (error) {
          console.error('Failed to save progress to backend:', error);
        }
        window.progressUpdateTimeout = null;
      }, 10000);
    }
  }
};
