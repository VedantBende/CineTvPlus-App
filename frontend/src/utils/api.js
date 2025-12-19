import { useAuth } from '@clerk/clerk-react';

// Base API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper to get auth headers
export const getAuthHeaders = async (getToken) => {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Watchlist API
export const watchlistApi = {
  // Add to watchlist
  add: async (getToken, mediaData) => {
    const headers = await getAuthHeaders(getToken);
    const response = await fetch(`${API_URL}/api/watchlist/add`, {
      method: 'POST',
      headers,
      body: JSON.stringify(mediaData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add to watchlist');
    }
    
    return response.json();
  },

  // Remove from watchlist
  remove: async (getToken, mediaId) => {
    const headers = await getAuthHeaders(getToken);
    const response = await fetch(`${API_URL}/api/watchlist/remove/${mediaId}`, {
      method: 'DELETE',
      headers
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove from watchlist');
    }
    
    return response.json();
  },

  // Get watchlist
  get: async (getToken) => {
    const headers = await getAuthHeaders(getToken);
    const response = await fetch(`${API_URL}/api/watchlist`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch watchlist');
    }
    
    return response.json();
  },

  // Check if in watchlist
  check: async (getToken, mediaId) => {
    const headers = await getAuthHeaders(getToken);
    const response = await fetch(`${API_URL}/api/watchlist/check/${mediaId}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      return { isInWatchlist: false };
    }
    
    return response.json();
  }
};
