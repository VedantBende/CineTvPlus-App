import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MovieCard({ title, poster, rating, year, mediaId, tmdbId, type = 'movie' }) {
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    // Use tmdbId if available, otherwise use mediaId
    const id = tmdbId || mediaId;
    const route = type === 'movie' ? `/movie/${id}` : `/tv/${id}`;
    navigate(route);
  };

  return (
    <div
      onClick={handleClick}
      className="netflix-card group relative"
    >
      {/* Poster Image */}
      <div className="relative aspect-[2/3] bg-gray-800">
        {!imageError && poster ? (
          <img
            src={poster}
            alt={title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
              />
            </svg>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="text-center px-4">
            <button className="bg-white text-black rounded-full p-3 mb-2 hover:bg-gray-200 transition">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <p className="text-white text-sm font-semibold">{title}</p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-2">
        <h3 className="text-white text-sm font-medium truncate">{title}</h3>
        <div className="flex items-center justify-between mt-1">
          {rating && (
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-gray-400 text-xs">{rating}</span>
            </div>
          )}
          {year && (
            <span className="text-gray-500 text-xs">{year}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieCard;
