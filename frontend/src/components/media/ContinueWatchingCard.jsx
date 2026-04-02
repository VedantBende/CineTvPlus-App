import { useState } from 'react';

function ContinueWatchingCard({ title, backdrop, season, episode, mediaId, tmdbId, type = 'movie', onRemove, onClick }) {
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    if (onClick) onClick();
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (onRemove) onRemove(tmdbId || mediaId);
  };

  const subtitle = type === 'tv' && season && episode 
    ? `Continue S${season} E${episode}`
    : 'Continue Movie';

  return (
    <div className="p-1">
      <div
        onClick={handleClick}
        className="group relative cursor-pointer rounded-lg overflow-hidden transition-all duration-300 ring-2 ring-transparent hover:ring-netflix-red shadow-md hover:shadow-xl"
      >
        {/* Wide Image Container */}
        <div className="relative aspect-video bg-gray-200 dark:bg-gray-800 overflow-hidden">
          {!imageError && backdrop ? (
            <img
              src={backdrop}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
          )}

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
          
          {/* Centered Play Button on Hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
            <div className="bg-white/90 rounded-full p-2.5 sm:p-3 transform transition-transform duration-300 scale-90 group-hover:scale-100 shadow-xl">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black ml-0.5 sm:ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {/* X Remove Button - Top Right */}
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 z-20 bg-black/70 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg"
            title="Remove from list"
            aria-label="Remove item"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Text Container - Bottom Left */}
          <div className="absolute bottom-0 left-0 right-0 p-3 xs:p-4 z-10">
            <p className="text-gray-300 text-[10px] xs:text-xs sm:text-sm font-medium mb-0.5 tracking-wide drop-shadow-md">
              {subtitle}
            </p>
            <h3 className="text-white text-xs xs:text-sm sm:text-base font-bold truncate drop-shadow-lg pr-4">
              {title}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContinueWatchingCard;
