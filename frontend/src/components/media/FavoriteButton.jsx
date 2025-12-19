import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function FavoriteButton({ tmdbId, title, poster, rating, year, type, className = '' }) {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      checkFavoriteStatus();
    }
  }, [isSignedIn, tmdbId]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/favorites/check/${tmdbId}`,
        { withCredentials: true }
      );
      setIsFavorite(response.data.isFavorite);
    } catch (err) {
      console.error('Error checking favorite status:', err);
    }
  };

  const toggleFavorite = async () => {
    if (!isSignedIn) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await axios.delete(`${API_URL}/api/favorites/${tmdbId}`, {
          withCredentials: true
        });
        setIsFavorite(false);
      } else {
        await axios.post(
          `${API_URL}/api/favorites`,
          { tmdbId, title, poster, rating, year, type },
          { withCredentials: true }
        );
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`group transition-all ${className}`}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 transition-all ${
          isFavorite
            ? 'fill-red-500 stroke-red-500'
            : 'fill-none stroke-white group-hover:fill-red-500 group-hover:stroke-red-500'
        } ${loading ? 'opacity-50' : ''}`}
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}

export default FavoriteButton;
