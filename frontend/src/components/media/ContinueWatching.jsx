import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getContinueWatching } from '../../utils/progressTracker';
import { fetchMovieDetails, fetchTVShowDetails } from '../../utils/tmdbApi';
import { formatProgress } from '../../utils/formatters';
import Loader from '../ui/Loader';

function ContinueWatching() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadContinueWatching();
  }, []);

  const loadContinueWatching = async () => {
    try {
      setLoading(true);
      const progressItems = await getContinueWatching();

      // Fetch TMDB metadata for each item
      const itemsWithMetadata = await Promise.all(
        progressItems.slice(0, 6).map(async (item) => {
          let metadata;
          
          if (item.mediaType === 'movie') {
            metadata = await fetchMovieDetails(item.mediaId);
          } else {
            metadata = await fetchTVShowDetails(item.mediaId);
          }

          return metadata ? {
            ...item,
            ...metadata
          } : null;
        })
      );

      // Filter out null values
      const validItems = itemsWithMetadata.filter(item => item !== null);
      setItems(validItems);
    } catch (error) {
      console.error('Failed to load continue watching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueWatching = (item) => {
    const params = new URLSearchParams({
      id: item.mediaId,
      type: item.mediaType,
      resume: item.currentTime
    });

    if (item.season) params.append('season', item.season);
    if (item.episode) params.append('episode', item.episode);

    navigate(`/watch?${params.toString()}`);
  };

  if (loading) {
    return <Loader text="Loading your progress..." />;
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-white text-2xl font-bold mb-6">Continue Watching</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            onClick={() => handleContinueWatching(item)}
            className="netflix-card cursor-pointer group"
          >
            <div className="relative aspect-[16/9] bg-gray-800 rounded-lg overflow-hidden">
              {item.backdrop && (
                <img
                  src={item.backdrop}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}

              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                <div
                  className="h-full bg-netflix-red transition-all"
                  style={{ width: `${item.progress}%` }}
                />
              </div>

              {/* Play Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button className="bg-white text-black rounded-full p-3 hover:bg-gray-200 transition">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mt-2">
              <h3 className="text-white text-sm font-medium truncate">
                {item.title}
              </h3>
              <p className="text-gray-400 text-xs">
                {formatProgress(item.progress)} complete
                {item.season && item.episode && ` • S${item.season} E${item.episode}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContinueWatching;
