import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { fetchByProvider } from '../utils/tmdbApi';
import MovieCard from '../components/media/MovieCard';
import Loader from '../components/ui/Loader';
import ErrorMessage from '../components/ui/ErrorMessage';
import { PROVIDERS } from '../components/media/ProvidersRow';
import useMediaStore, { CACHE_TTL } from '../store/mediaStore';

function ProviderPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Try to get provider and initial mediaType from router state, otherwise fallback
  const stateProvider = location.state?.provider;
  const initialMediaType = location.state?.mediaType || 'movie';
  
  const provider = stateProvider || PROVIDERS.find(p => p.id === parseInt(id)) || {
    id: parseInt(id),
    name: 'Streaming Provider',
    logo: ''
  };

  const [mediaType, setMediaType] = useState(initialMediaType);

  // Cache
  const { providerCache, providerCacheFetchedAt, setProviderData } = useMediaStore();
  const cacheKey = `${provider.id}_${mediaType}`;
  const cachedData = providerCache[cacheKey];

  // Data state — initialise from cache if available
  const [heroMovies, setHeroMovies] = useState(cachedData?.heroMovies ?? []);
  const [gridContent, setGridContent] = useState(cachedData?.gridContent ?? []);
  const [loading, setLoading] = useState(!cachedData);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Hero carousel state
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Infinite Scroll Observer setup
  const observer = useRef();
  const lastElementRef = useCallback(node => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  // Initial fetch when provider or mediaType changes
  useEffect(() => {
    window.scrollTo(0, 0);

    const key = `${provider.id}_${mediaType}`;
    const fetchedAt = providerCacheFetchedAt[key];
    const isCacheFresh = providerCache[key] && fetchedAt && (Date.now() - fetchedAt < CACHE_TTL);

    if (isCacheFresh) {
      // Restore from cache — no network call needed
      setHeroMovies(providerCache[key].heroMovies);
      setGridContent(providerCache[key].gridContent);
      setLoading(false);
      setPage(1);
      setHasMore(true);
      return;
    }

    setHeroMovies([]);
    setGridContent([]);
    setPage(1);
    setHasMore(true);
    loadInitialData();
  }, [provider.id, mediaType]);

  // Fetch more data when page changes > 1
  useEffect(() => {
    if (page > 1) {
      loadMoreData(page);
    }
  }, [page]);

  // Auto-rotate hero carousel
  useEffect(() => {
    if (heroMovies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => prev === heroMovies.length - 1 ? 0 : prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroMovies.length]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const results = await fetchByProvider(mediaType, provider.id, 1);
      
      if (results.length === 0) {
        setHasMore(false);
        return;
      }

      // Slicing first 10 for Hero Carousel, the rest for the grid
      const heroes = results.slice(0, 10).filter(m => m.backdrop);
      
      let finalHeroes, finalGrid;
      // If we don't have backdrops, we fallback to just showing them in the grid
      if (heroes.length > 0) {
        finalHeroes = heroes;
        const heroIds = new Set(heroes.map(h => h.tmdbId));
        finalGrid = results.filter(r => !heroIds.has(r.tmdbId));
      } else {
        finalHeroes = [];
        finalGrid = results;
      }

      setHeroMovies(finalHeroes);
      setGridContent(finalGrid);

      // Persist to store cache
      const key = `${provider.id}_${mediaType}`;
      setProviderData(key, { heroMovies: finalHeroes, gridContent: finalGrid });

      setHasMore(results.length >= 20);
    } catch (err) {
      setError(err.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreData = async (pageNum) => {
    try {
      setLoadingMore(true);
      const results = await fetchByProvider(mediaType, provider.id, pageNum);

      if (results.length === 0) {
        setHasMore(false);
        return;
      }

      setGridContent(prev => {
        const existingIds = new Set(prev.map(r => r.tmdbId));
        const freshResults = results.filter(r => !existingIds.has(r.tmdbId));
        return [...prev, ...freshResults];
      });
      
      setHasMore(results.length >= 20);
    } catch (err) {
      console.error('Error loading more:', err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  // Carousel Controls
  const goToSlide = useCallback((index) => setCurrentHeroIndex(index), []);
  const nextSlide = useCallback(() => {
    setCurrentHeroIndex((prev) => prev === heroMovies.length - 1 ? 0 : prev + 1);
  }, [heroMovies.length]);
  const prevSlide = useCallback(() => {
    setCurrentHeroIndex((prev) => prev === 0 ? heroMovies.length - 1 : prev - 1);
  }, [heroMovies.length]);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchMove = (e) => { touchEndX.current = e.touches[0].clientX; };
  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 75) nextSlide();
    if (touchStartX.current - touchEndX.current < -75) prevSlide();
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen pt-14 sm:pt-16 md:pt-20 bg-white dark:bg-netflix-black transition-colors duration-300">
        <Loader text={`Loading ${provider.name} content...`} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-14 sm:pt-16 md:pt-20 bg-white dark:bg-netflix-black transition-colors duration-300">
        <ErrorMessage message={error} onRetry={loadInitialData} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-netflix-black transition-colors duration-300">

      {/* Hero Carousel */}
      {heroMovies.length > 0 ? (
        <div
          className="relative h-[75vh] xs:h-[60vh] sm:h-[65vh] md:h-[70vh] lg:h-[80vh] xl:h-[110vh] bg-gradient-to-b from-gray-100 to-white dark:from-black dark:to-netflix-black overflow-hidden -mt-14 sm:-mt-16 md:-mt-16 pt-14 sm:pt-16 md:pt-16 transition-colors duration-500"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Carousel Slides */}
          <div className="relative w-full h-full">
            {heroMovies.map((movie, index) => (
              <div
                key={`bg-${movie.tmdbId}`}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out will-change-[opacity] ${
                  index === currentHeroIndex
                    ? 'opacity-100 z-10 ease-in'
                    : 'opacity-0 z-0 ease-out'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
                <div className="absolute bottom-0 left-0 right-0 h-24 xs:h-28 sm:h-32 md:h-40 lg:h-48 bg-gradient-to-t from-netflix-black dark:from-netflix-black via-netflix-black/80 to-transparent z-10" />
                {movie.backdrop && (
                  <img
                    src={movie.backdrop}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    style={{ objectPosition: 'center center' }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Navigation Arrows - Desktop Only */}
          <div className="hidden lg:flex absolute left-0 top-0 bottom-0 w-12 sm:w-16 md:w-20 lg:w-28 z-30 items-center justify-start opacity-0 hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={prevSlide}
              className="ml-1.5 sm:ml-2 md:ml-3 lg:ml-4 bg-gray-200/70 hover:bg-gray-300/90 dark:bg-black/50 dark:hover:bg-black/80 text-gray-900 dark:text-white p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-full transition-all backdrop-blur-sm group/btn touch-target"
              aria-label="Previous slide"
            >
              <svg className="w-7 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          <div className="hidden lg:flex absolute right-0 top-0 bottom-0 w-12 sm:w-16 md:w-20 lg:w-28 z-30 items-center justify-end opacity-0 hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={nextSlide}
              className="mr-1.5 sm:mr-2 md:mr-3 lg:mr-4 bg-gray-200/70 hover:bg-gray-300/90 dark:bg-black/50 dark:hover:bg-black/80 text-gray-900 dark:text-white p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-full transition-all backdrop-blur-sm group/btn touch-target"
              aria-label="Next slide"
            >
              <svg className="w-7 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Hero Content */}
          <div className="absolute bottom-0 left-0 right-0 pb-12 xs:pb-14 sm:pb-16 md:pb-20 lg:pb-24 p-3 xs:p-4 sm:p-6 md:p-8 lg:p-10 xl:p-16 container-custom z-20 pointer-events-none">
            <div className="relative max-w-xs xs:max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-3xl pointer-events-auto">

              {/* Provider Branding — above the title */}
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                {provider.logo && (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-md rounded-xl shadow-lg flex items-center justify-center p-1.5 border border-white/20 flex-shrink-0">
                    <img src={provider.logo} alt={provider.name} className="max-w-full max-h-full object-contain" />
                  </div>
                )}
                <span className="text-white/80 text-sm sm:text-base font-semibold tracking-widest uppercase drop-shadow">
                  {provider.name}
                </span>
              </div>

              {heroMovies.map((movie, index) => (
                <div
                  key={`content-${movie.tmdbId}`}
                  className={`transition-opacity duration-1000 ease-in-out will-change-[opacity] ${
                    index === currentHeroIndex
                      ? 'opacity-100 relative z-10 ease-in'
                      : 'opacity-0 absolute inset-0 z-0 pointer-events-none ease-out'
                  }`}
                >
                  <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-white mb-1.5 xs:mb-2 sm:mb-3 md:mb-4 lg:mb-6 leading-tight uppercase tracking-wide drop-shadow-2xl text-shadow-lg">
                    {movie.title}
                  </h2>

                  <div className="flex items-center flex-wrap gap-1.5 xs:gap-2 sm:gap-3 md:gap-4 mb-2 xs:mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                    {movie.rating && (
                      <div className="flex items-center space-x-1 xs:space-x-1.5 sm:space-x-2 bg-accent-red px-2 py-0.5 xs:px-2.5 xs:py-1 sm:px-3 sm:py-1.5 rounded-lg shadow-lg">
                        <svg className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-white font-bold text-xs sm:text-sm md:text-base">{movie.rating}</span>
                      </div>
                    )}
                    {movie.year && (
                      <span className="text-white text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-semibold bg-white/20 px-2 py-0.5 xs:px-2.5 xs:py-1 sm:px-3 rounded-lg backdrop-blur-sm transition-colors">
                        {movie.year}
                      </span>
                    )}
                  </div>

                  {movie.overview && (
                    <p className="text-white/90 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl mb-3 xs:mb-4 sm:mb-5 md:mb-6 lg:mb-8 line-clamp-2 md:line-clamp-3 leading-relaxed max-w-xl md:max-w-2xl drop-shadow-lg text-shadow">
                      {movie.overview}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
                    <button
                      onClick={() => navigate(`/watch?id=${movie.tmdbId}&type=${mediaType}`)}
                      className="bg-white hover:bg-gray-200 text-black px-4 py-2 xs:px-5 xs:py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-3.5 lg:px-10 lg:py-4 rounded-lg text-xs xs:text-sm sm:text-base md:text-lg font-bold transition-all flex items-center space-x-1.5 xs:space-x-2 sm:space-x-2.5 shadow-xl transform hover:scale-105 active:scale-95 touch-target"
                    >
                      <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      <span>Play</span>
                    </button>
                    <button
                      onClick={() => navigate(`/${mediaType}/${movie.tmdbId}`)}
                      className="bg-transparent hover:bg-gray-100 dark:hover:bg-white/10 text-white hover:text-gray-900 dark:hover:text-white border border-white/50 px-4 py-2 xs:px-5 xs:py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-3.5 lg:px-10 lg:py-4 rounded-lg text-xs xs:text-sm sm:text-base md:text-lg font-semibold transition-all flex items-center space-x-1.5 xs:space-x-2 sm:space-x-2.5 shadow-xl hover:scale-105 active:scale-95 touch-target"
                    >
                      <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>See More</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Dots */}
          <div className="absolute bottom-2 xs:bottom-3 sm:bottom-4 md:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-1.5">
            {heroMovies.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentHeroIndex
                    ? 'bg-accent-red w-6 h-1.5'
                    : 'bg-gray-500/70 hover:bg-gray-400/90 w-1.5 h-1.5'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Spacer for header if no hero movies */
        <div className="h-24 sm:h-32 md:h-40"></div>
      )}

      {/* Content Grid */}
      <div className="container-custom py-8 sm:py-10 md:py-12">
        {/* Section Header with Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-gray-900 dark:text-white text-xl xs:text-2xl sm:text-3xl font-bold flex items-center transition-colors">
            <span className="w-1.5 h-5 xs:h-6 sm:h-7 md:h-8 bg-netflix-red mr-2 sm:mr-3 rounded-full"></span>
            More from {provider.name}
          </h2>

          {/* Toggle */}
          <div className="flex bg-gray-100 dark:bg-[#141414] rounded-full p-1 border border-gray-200 dark:border-[#222] shadow-inner w-full max-w-[280px] sm:w-auto mx-auto sm:mx-0">
            <button
              onClick={() => setMediaType('movie')}
              className={`flex-1 whitespace-nowrap px-5 sm:px-7 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${
                mediaType === 'movie'
                  ? 'bg-white text-gray-900 dark:bg-[#2a2a2a] dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-[#a3a3a3] hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setMediaType('tv')}
              className={`flex-1 whitespace-nowrap px-5 sm:px-7 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${
                mediaType === 'tv'
                  ? 'bg-white text-gray-900 dark:bg-[#2a2a2a] dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-[#a3a3a3] hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              TV Shows
            </button>
          </div>
        </div>
        
        {gridContent.length > 0 ? (
          <>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {gridContent.map((item) => (
                <MovieCard
                  key={`grid-${item.tmdbId}`}
                  title={item.title}
                  poster={item.url}
                  rating={item.rating}
                  year={item.year}
                  mediaId={item.mediaId}
                  tmdbId={item.tmdbId}
                  type={mediaType}
                />
              ))}
            </div>
            
            {/* Infinite Scroll Target */}
            {hasMore ? (
              <div ref={lastElementRef} className="w-full flex justify-center py-6 sm:py-10 mt-4">
                {loadingMore && <Loader text="Loading more..." />}
              </div>
            ) : (
              <div className="w-full text-center text-gray-400 py-8 mt-4 text-sm sm:text-base">
                End of results
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 sm:py-20">
            <p className="text-gray-500 text-lg">No additional content found.</p>
          </div>
        )}
      </div>

    </div>
  );
}

export default ProviderPage;
