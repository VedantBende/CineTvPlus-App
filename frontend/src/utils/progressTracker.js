import axios from 'axios';
import { getAuthHeaders } from './api';

const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Update watch progress on backend
 */
export const updateProgress = async (getToken, progressData) => {
  try {
    const headers = await getAuthHeaders(getToken);
    const response = await axios.post(
      `${API_URL}/history/update`,
      progressData,
      { headers }
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
export const getProgress = async (getToken, mediaId, season = null, episode = null) => {
  try {
    const headers = await getAuthHeaders(getToken);
    let url = `${API_URL}/history/${mediaId}`;
    const params = new URLSearchParams();
    
    if (season) params.append('season', season);
    if (episode) params.append('episode', episode);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await axios.get(url, { headers });
    return response.data.progress;
  } catch (error) {
    console.error('Error fetching progress:', error);
    return null;
  }
};

/**
 * Get continue watching list
 */
export const getContinueWatching = async (getToken) => {
  try {
    const headers = await getAuthHeaders(getToken);
    const response = await axios.get(
      `${API_URL}/history`,
      { headers }
    );
    return response.data.history || [];
  } catch (error) {
    console.error('Error fetching continue watching:', error);
    return [];
  }
};
