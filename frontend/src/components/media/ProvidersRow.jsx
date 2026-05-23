import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieCard from './MovieCard';
import { fetchByProvider } from '../../utils/tmdbApi';

// Provider data with TMDB IDs and clean public logos
export const PROVIDERS = [
  {
    id: 8,
    name: 'Netflix',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
    invert: false
  },
  {
    id: 350,
    name: 'Apple TV+',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg',
    invert: true // Often black logo, might need inverting on dark theme
  },
  {
    id: 9,
    name: 'Amazon Prime',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png',
    invert: false
  },
  {
    id: 15,
    name: 'Hulu',
    logo: 'https://api.iconify.design/simple-icons:hulu.svg?color=%231ce783&width=120',
    invert: false
  },
  {
    id: 1899,
    name: 'Max',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Max_logo.svg',
    invert: true // Max logo is often dark blue/black, invert for dark theme
  },
  {
    id: 531,
    name: 'Paramount+',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Paramount_Plus.svg',
    invert: true
  },
  {
    id: 337,
    name: 'Disney+',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg',
    invert: true
  },
  {
    id: 283,
    name: 'Crunchyroll',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Crunchyroll_Logo.png',
    invert: false
  }
];

function ProvidersRow() {
  const [mediaType, setMediaType] = useState('movie');
  const [activeProvider, setActiveProvider] = useState(PROVIDERS[0]);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Scroll checking for the content row
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const timer = setTimeout(checkScroll, 100);
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      clearTimeout(timer);
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [content]);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // Fetch content when provider or media type changes
  useEffect(() => {
    let isMounted = true;
    const loadContent = async () => {
      setLoading(true);
      const data = await fetchByProvider(mediaType, activeProvider.id, 1);
      if (isMounted) {
        setContent(data);
        setLoading(false);
      }
    };
    loadContent();
    return () => {
      isMounted = false;
    };
  }, [mediaType, activeProvider.id]);

  return (
    <div className="relative pt-8 pb-4">
      {/* Header and Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center transition whitespace-nowrap">
          <span className="w-1.5 h-5 xs:h-6 sm:h-7 md:h-8 bg-netflix-red mr-2 sm:mr-3 rounded-full"></span>
          Streaming Providers
        </h2>
        
        {/* Toggle Button */}
        <div className="flex bg-gray-100 dark:bg-[#141414] rounded-full p-1 border border-gray-200 dark:border-[#222] w-full max-w-[320px] sm:max-w-none sm:w-auto mx-auto md:mx-0 shadow-inner">
          <button
            onClick={() => setMediaType('movie')}
            className={`flex-1 whitespace-nowrap px-4 sm:px-8 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${
              mediaType === 'movie'
                ? 'bg-white text-gray-900 dark:bg-[#2a2a2a] dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-[#a3a3a3] hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => setMediaType('tv')}
            className={`flex-1 whitespace-nowrap px-4 sm:px-8 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${
              mediaType === 'tv'
                ? 'bg-white text-gray-900 dark:bg-[#2a2a2a] dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-[#a3a3a3] hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            TV Shows
          </button>
        </div>
      </div>

      {/* Provider List (Horizontal Scrollable) */}
      <div className="flex overflow-x-auto no-scrollbar space-x-3 sm:space-x-4 mb-8 py-4 -my-4 snap-x relative z-10">
        {PROVIDERS.map((provider, index) => {
          const isActive = activeProvider.id === provider.id;
          return (
            <button
              key={provider.id}
              onClick={() => setActiveProvider(provider)}
              className={`flex-shrink-0 snap-start flex flex-col items-center justify-center w-24 h-20 xs:w-28 xs:h-24 sm:w-32 sm:h-28 rounded-xl sm:rounded-2xl transition-all duration-300 border ${
                isActive 
                  ? 'bg-gray-200 dark:bg-gray-800 border-gray-400 dark:border-gray-500 shadow-lg scale-105 z-20' 
                  : 'bg-white dark:bg-[#141414] border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] hover:scale-105 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 z-10'
              } ${index === 0 ? 'origin-left' : ''}`}
            >
              <div className="w-16 h-10 flex items-center justify-center mb-2">
                <img 
                  src={provider.logo} 
                  alt={provider.name} 
                  className={`max-w-full max-h-full object-contain ${
                    (provider.invert && isActive) || provider.invert ? 'dark:invert' : ''
                  } ${isActive && !provider.invert ? 'drop-shadow-md' : ''}`}
                />
              </div>
              <span className={`text-xs font-semibold ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                {provider.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Section Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center flex-wrap gap-3">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center flex-wrap gap-2 sm:gap-3">
            <span>{activeProvider.name}</span>
            <span className="px-3 py-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs sm:text-sm rounded-full whitespace-nowrap">
              {mediaType === 'movie' ? 'Movies' : 'TV Shows'}
            </span>
          </h3>
        </div>
        <button 
          onClick={() => navigate(`/provider/${activeProvider.id}`, { state: { provider: activeProvider, mediaType } })}
          className="flex items-center text-sm font-semibold text-gray-500 hover:text-netflix-red dark:text-gray-400 dark:hover:text-white transition-colors group bg-gray-100 dark:bg-[#1a1a1a] px-4 py-1.5 rounded-full whitespace-nowrap"
        >
          View all
          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Content Row */}
      <div className="relative group/row">
        {/* Left Scroll Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-40 w-12 bg-gradient-to-r from-white via-white/80 dark:from-netflix-black dark:via-netflix-black/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 flex items-center justify-start group"
          >
            <div className="bg-white/80 dark:bg-black/50 p-2 rounded-full backdrop-blur-sm ml-2 group-hover:bg-white dark:group-hover:bg-black/80 transition-colors shadow-lg border border-gray-200 dark:border-gray-800">
              <svg className="w-6 h-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto no-scrollbar gap-2 xs:gap-3 sm:gap-4 snap-x scroll-smooth py-4 -my-4"
        >
          {loading ? (
            // Loading Skeletons
            [...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[42vw] xs:w-[30vw] sm:w-[28vw] md:w-[22vw] lg:w-[17vw] xl:w-[14vw] aspect-[2/3] bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            ))
          ) : content.length > 0 ? (
            content.map((item) => (
              <div key={item.tmdbId} className="flex-shrink-0 snap-start w-[42vw] xs:w-[30vw] sm:w-[28vw] md:w-[22vw] lg:w-[17vw] xl:w-[14vw] transition-transform duration-300 ease-out">
                <MovieCard
                  title={item.title}
                  poster={item.url}
                  rating={item.rating}
                  year={item.year}
                  mediaId={item.mediaId}
                  tmdbId={item.tmdbId}
                  type={mediaType}
                />
              </div>
            ))
          ) : (
            <div className="flex-1 py-12 flex flex-col items-center justify-center text-gray-500">
              <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
              <p>No content found for {activeProvider.name}</p>
            </div>
          )}
        </div>

        {/* Right Scroll Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-40 w-12 bg-gradient-to-l from-white via-white/80 dark:from-netflix-black dark:via-netflix-black/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 flex items-center justify-end group"
          >
            <div className="bg-white/80 dark:bg-black/50 p-2 rounded-full backdrop-blur-sm mr-2 group-hover:bg-white dark:group-hover:bg-black/80 transition-colors shadow-lg border border-gray-200 dark:border-gray-800">
              <svg className="w-6 h-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

export default ProvidersRow;
