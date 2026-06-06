// import { useAuth } from '@clerk/clerk-react';

// Base API URL
const API_URL = import.meta.env.VITE_API_URL || '/api';

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
  add: async (getToken, mediaData, isAnime = false) => {
    const headers = await getAuthHeaders(getToken);
    const response = await fetch(`${API_URL}/favorites/add`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...mediaData, isAnime })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add to watchlist');
    }
    
    return response.json();
  },

  // Remove from watchlist
  remove: async (getToken, mediaId, isAnime = false) => {
    const headers = await getAuthHeaders(getToken);
    const response = await fetch(`${API_URL}/favorites/remove/${mediaId}?anime=${isAnime}`, {
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
  getAll: async (getToken, isAnime = false) => {
    const headers = await getAuthHeaders(getToken);
    const response = await fetch(`${API_URL}/favorites?anime=${isAnime}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch watchlist');
    }
    
    return response.json();
  },

  // Check if in watchlist
  check: async (getToken, mediaId, isAnime = false) => {
    const headers = await getAuthHeaders(getToken);
    const response = await fetch(`${API_URL}/favorites/check/${mediaId}?anime=${isAnime}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      return { isInWatchlist: false };
    }
    
    return response.json();
  }
};

// Delete User from Database
export const deleteUserDB = async (getToken) => {
  const headers = await getAuthHeaders(getToken);
  const response = await fetch(`${API_URL}/auth/delete`, {
    method: 'DELETE',
    headers
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete user from database');
  }
  
  return response.json();
};
