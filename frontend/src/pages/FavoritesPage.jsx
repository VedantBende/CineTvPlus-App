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
  const [activeFilter, setActiveFilter] = useState('all');

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
      
      const response = await axios.get(`${API_URL}/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setWatchlist(response.data.favorites || []);
    } catch (err) {
      console.error('Error loading watchlist:', err);
      setWatchlist([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (mediaId) => {
    try {
      // Optimistically update the UI for instant feedback
      setWatchlist(prev => prev.filter(item => item.mediaId !== mediaId));
      
      const token = await getToken();
      await axios.delete(`${API_URL}/favorites/remove/${mediaId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error('Error removing favorite:', err);
      // Revert if API call fails
      loadWatchlist();
    }
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'movie', label: 'Movies' },
    { key: 'tv', label: 'TV Shows' },
  ];

  const filteredWatchlist = activeFilter === 'all' 
    ? watchlist 
    : watchlist.filter(item => (item.mediaType || item.type) === activeFilter);

  if (loading) {
    return (
      <div className="min-h-screen pt-14 sm:pt-16 md:pt-20 bg-white dark:bg-netflix-black transition-colors duration-300">
        <Loader text="Loading your favorites..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-14 sm:pt-16 md:pt-20 bg-white dark:bg-netflix-black transition-colors duration-300">
        <ErrorMessage message={error} onRetry={loadWatchlist} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-14 sm:pt-16 md:pt-16 bg-white dark:bg-netflix-black transition-colors duration-300">
      <div className="container-custom py-6 sm:py-8 md:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-gray-900 dark:text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-2 transition-colors">
            My List
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            {watchlist.length} {watchlist.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto no-scrollbar pb-1">
          {filters.map(filter => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                activeFilter === filter.key
                  ? 'bg-accent-red text-white shadow-lg shadow-accent-red/20'
                  : 'bg-gray-100 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/80 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-transparent'
              }`}
            >
              {filter.label}
              {filter.key !== 'all' && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({watchlist.filter(i => filter.key === 'all' ? true : (i.mediaType || i.type) === filter.key).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filteredWatchlist.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center transition-colors">
              <svg 
                className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500" 
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
            </div>
            <h2 className="text-gray-900 dark:text-white text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 transition-colors">
              {activeFilter === 'all' ? 'Your list is empty' : `No ${activeFilter === 'movie' ? 'movies' : 'TV shows'} saved`}
            </h2>
            <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto px-4">
              Start adding movies and shows to watch later!
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-accent-red hover:bg-red-700 text-white px-6 py-2.5 sm:px-8 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all shadow-lg hover:scale-105 active:scale-95"
            >
              Browse Content
            </button>

            {/* Want to see more? */}
            <div className="mt-16 sm:mt-20 pt-8 sm:pt-10 border-t border-gray-200 dark:border-gray-800/50 max-w-lg mx-auto transition-colors">
              <h3 className="text-gray-700 dark:text-gray-300 text-lg sm:text-xl font-semibold mb-2 transition-colors">
                Want to see more?
              </h3>
              <p className="text-gray-500 text-sm sm:text-base mb-4 transition-colors">
                Explore our library to find content you'll love.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => navigate('/movies')}
                  className="bg-gray-100 dark:bg-gray-800/60 hover:bg-gray-200 dark:hover:bg-gray-700/80 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-200 dark:border-transparent"
                >
                  Browse Movies
                </button>
                <button
                  onClick={() => navigate('/tv')}
                  className="bg-gray-100 dark:bg-gray-800/60 hover:bg-gray-200 dark:hover:bg-gray-700/80 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-200 dark:border-transparent"
                >
                  Browse TV Shows
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Watchlist Grid */
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {filteredWatchlist.map((item) => (
              <MovieCard
                key={item.mediaId}
                title={item.title}
                poster={item.posterPath || item.poster}
                rating={item.rating}
                year={item.year}
                mediaId={item.mediaId}
                tmdbId={item.mediaId}
                type={item.mediaType || item.type}
                onRemove={handleRemoveFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FavoritesPage;
