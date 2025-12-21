import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import MovieCard from '../components/media/MovieCard';
import Loader from '../components/ui/Loader';
import ErrorMessage from '../components/ui/ErrorMessage';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function FavoritesPage() {
  const { getToken } = useAuth();
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isSignedIn) {
      navigate('/login');
      return;
    }
    
    loadWatchlist();
  }, [isSignedIn, navigate]);

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await getToken();
      
      const response = await axios.get(`${API_URL}/watchlist`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setWatchlist(response.data || []);
    } catch (err) {
      console.error('Error loading watchlist:', err);
      // CHANGED: Don't set error state, just set empty array
      setWatchlist([]);
      // Optional: You can keep a console warning but don't block the UI
      // setError(err.response?.data?.error || err.message || 'Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-14 sm:pt-16 md:pt-20 bg-netflix-black">
        <Loader text="Loading your favorites..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-14 sm:pt-16 md:pt-20 bg-netflix-black">
        <ErrorMessage message={error} onRetry={loadWatchlist} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-14 sm:pt-16 md:pt-16 bg-netflix-black">
      <div className="container-custom py-6 sm:py-8 md:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
            My List
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            {watchlist.length} {watchlist.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {/* Empty State */}
        {watchlist.length === 0 ? (
          <div className="text-center py-12 sm:py-16 md:py-20">
            <svg 
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-gray-600 mx-auto mb-4 sm:mb-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
              />
            </svg>
            <h2 className="text-white text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">
              Your list is empty
            </h2>
            <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto px-4">
              Start adding movies and shows to watch later!
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-white text-black px-6 py-2.5 sm:px-8 sm:py-3 rounded text-sm sm:text-base font-semibold hover:bg-gray-200 transition-all shadow-lg hover:scale-105 active:scale-95"
            >
              Browse Content
            </button>
          </div>
        ) : (
          /* Watchlist Grid */
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {watchlist.map((item) => (
              <MovieCard
                key={item.mediaId}
                title={item.title}
                poster={item.poster}
                rating={item.rating}
                year={item.year}
                mediaId={item.mediaId}
                tmdbId={item.mediaId}
                type={item.type}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FavoritesPage;
