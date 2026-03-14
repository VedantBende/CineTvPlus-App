import { useEffect, useState, useCallback, useRef } from 'react';
import { 
  fetchPopularMovies, 
  fetchTopRatedMovies, 
  fetchNowPlayingMovies,
  fetchTrendingMovies,
  fetchUpcomingMovies
} from '../utils/tmdbApi';
import MovieCard from '../components/media/MovieCard';
import ContentRow, { ContentRowItem } from '../components/media/ContentRow';
import Top10Row from '../components/media/Top10Row';
import Loader from '../components/ui/Loader';
import ErrorMessage from '../components/ui/ErrorMessage';

function MoviesPage() {
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [heroMovies, setHeroMovies] = useState([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state for vertical infinite scroll
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [dynamicRows, setDynamicRows] = useState([]);

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

  useEffect(() => {
    window.scrollTo(0, 0);
    loadInitialMovies();
  }, []);

  // Fetch more data when page changes
  useEffect(() => {
    if (page > 1) {
      loadMoreMovies(page);
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

  const loadInitialMovies = async () => {
    try {
      setLoading(true);
      setError(null);

      const [popular, topRated, nowPlaying, trending, upcoming] = await Promise.all([
        fetchPopularMovies(1),
        fetchTopRatedMovies(1),
        fetchNowPlayingMovies(1),
        fetchTrendingMovies('week', 1),
        fetchUpcomingMovies(1)
      ]);

      setPopularMovies(popular);
      setTopRatedMovies(topRated);
      setNowPlayingMovies(nowPlaying);
      setTrendingMovies(trending);
      setUpcomingMovies(upcoming);

      const heroes = trending.filter(m => m.backdrop).slice(0, 5);
      setHeroMovies(heroes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMovies = async (pageNum) => {
    try {
      setLoadingMore(true);
      
      const [popular, topRated, upcoming] = await Promise.all([
        fetchPopularMovies(pageNum),
        fetchTopRatedMovies(pageNum),
        fetchUpcomingMovies(pageNum)
      ]);

      if (popular.length === 0 && topRated.length === 0 && upcoming.length === 0) {
        setHasMore(false);
        return;
      }

      const newRows = [];
      
      if (popular.length > 0) {
        newRows.push({ title: `More Popular Movies`, icon: 'whatshot', data: popular });
      }
      if (topRated.length > 0) {
        newRows.push({ title: `More Highly Rated Movies`, icon: 'star', data: topRated });
      }
      if (upcoming.length > 0) {
        newRows.push({ title: `More Upcoming Releases`, icon: 'upcoming', data: upcoming });
      }

      setDynamicRows(prev => [...prev, ...newRows]);
      setHasMore(popular.length >= 20 || topRated.length >= 20);
    } catch (err) {
      console.error('Error loading more movies:', err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen pt-14 sm:pt-16 md:pt-20 bg-netflix-black">
        <Loader text="Loading movies..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-14 sm:pt-16 md:pt-20 bg-netflix-black">
        <ErrorMessage message={error} onRetry={loadInitialMovies} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Hero Carousel - Same size as HomePage */}
      <div
        className="relative h-[75vh] xs:h-[60vh] sm:h-[65vh] md:h-[70vh] lg:h-[80vh] xl:h-[110vh] bg-gradient-to-b from-black to-netflix-black overflow-hidden -mt-14 sm:-mt-16 md:-mt-16 pt-14 sm:pt-16 md:pt-16"
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
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/5 sm:via-black/70 md:via-black/50 to-transparent z-10" />
              <div className="absolute bottom-0 left-0 right-0 h-24 xs:h-28 sm:h-32 md:h-40 lg:h-48 bg-gradient-to-t from-netflix-black via-netflix-black/90 to-transparent z-10" />
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
            className="ml-1.5 sm:ml-2 md:ml-3 lg:ml-4 bg-black/50 hover:bg-black/80 text-white p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-full transition-all backdrop-blur-sm group/btn touch-target"
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
            className="mr-1.5 sm:mr-2 md:mr-3 lg:mr-4 bg-black/50 hover:bg-black/80 text-white p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-full transition-all backdrop-blur-sm group/btn touch-target"
            aria-label="Next slide"
          >
            <svg className="w-7 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 pb-12 xs:pb-14 sm:pb-16 md:pb-20 lg:pb-24 p-3 xs:p-4 sm:p-6 md:p-8 lg:p-10 xl:p-16 container-custom z-20">
          <div className="relative max-w-xs xs:max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
            {heroMovies.map((movie, index) => (
              <div
                key={`content-${movie.tmdbId}`}
                className={`transition-opacity duration-1000 ease-in-out will-change-[opacity] ${
                  index === currentHeroIndex
                    ? 'opacity-100 relative z-10 ease-in'
                    : 'opacity-0 absolute inset-0 z-0 pointer-events-none ease-out'
                }`}
              >
                <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-white mb-1.5 xs:mb-2 sm:mb-3 md:mb-4 lg:mb-6 drop-shadow-2xl leading-tight text-shadow-lg uppercase tracking-wide">
                  {movie.title}
                </h1>

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
                    <span className="text-white text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-semibold bg-white/10 px-2 py-0.5 xs:px-2.5 xs:py-1 sm:px-3 rounded-lg backdrop-blur-sm">
                      {movie.year}
                    </span>
                  )}
                </div>

                {movie.overview && (
                  <p className="text-white/80 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl mb-3 xs:mb-4 sm:mb-5 md:mb-6 lg:mb-8 line-clamp-2 md:line-clamp-3 drop-shadow-lg leading-relaxed text-shadow max-w-xl md:max-w-2xl">
                    {movie.overview}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
                  <button
                    onClick={() => window.location.href = `/watch?id=${movie.tmdbId}&type=movie`}
                    className="bg-white hover:bg-gray-200 text-black px-4 py-2 xs:px-5 xs:py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-3.5 lg:px-10 lg:py-4 rounded-lg text-xs xs:text-sm sm:text-base md:text-lg font-bold transition-all flex items-center space-x-1.5 xs:space-x-2 sm:space-x-2.5 shadow-xl transform hover:scale-105 active:scale-95 touch-target"
                  >
                    <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>Play</span>
                  </button>
                  <button
                    onClick={() => window.location.href = `/movie/${movie.tmdbId}`}
                    className="bg-transparent hover:bg-white/10 text-white border border-white/50 px-4 py-2 xs:px-5 xs:py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-3.5 lg:px-10 lg:py-4 rounded-lg text-xs xs:text-sm sm:text-base md:text-lg font-semibold transition-all flex items-center space-x-1.5 xs:space-x-2 sm:space-x-2.5 shadow-xl hover:scale-105 active:scale-95 touch-target"
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

      {/* Content Rows (Deduplicated) */}
      <div className="container-custom py-4 xs:py-5 sm:py-6 md:py-8 lg:py-10 xl:py-12 space-y-6 xs:space-y-7 sm:space-y-8 md:space-y-10 lg:space-y-12">
        {trendingMovies.length > 0 && (
          <Top10Row items={trendingMovies} type="movie" />
        )}

        {(() => {
          const shownIds = new Set(heroMovies.map(m => m.tmdbId));
          const dedupe = (items) => {
            const filtered = items.filter(item => !shownIds.has(item.tmdbId));
            filtered.forEach(item => shownIds.add(item.tmdbId));
            return filtered;
          };

          const uniqueTrending = dedupe(trendingMovies);
          const uniquePopular = dedupe(popularMovies);
          const uniqueNowPlaying = dedupe(nowPlayingMovies);
          const uniqueTopRated = dedupe(topRatedMovies);
          const uniqueUpcoming = dedupe(upcomingMovies);

          return (
            <>
              {uniqueTrending.length > 0 && (
                <ContentRow title="Trending Now" icon="trending_up">
                  {uniqueTrending.map((movie) => (
                    <ContentRowItem key={movie.tmdbId}>
                      <MovieCard title={movie.title} poster={movie.url} rating={movie.rating} year={movie.year} mediaId={movie.mediaId} tmdbId={movie.tmdbId} type="movie" />
                    </ContentRowItem>
                  ))}
                </ContentRow>
              )}

              {uniquePopular.length > 0 && (
                <ContentRow title="Top Picks for You" icon="thumb_up">
                  {uniquePopular.map((movie) => (
                    <ContentRowItem key={movie.tmdbId}>
                      <MovieCard title={movie.title} poster={movie.url} rating={movie.rating} year={movie.year} mediaId={movie.mediaId} tmdbId={movie.tmdbId} type="movie" />
                    </ContentRowItem>
                  ))}
                </ContentRow>
              )}

              {uniqueNowPlaying.length > 0 && (
                <ContentRow title="Now Playing" icon="theaters">
                  {uniqueNowPlaying.map((movie) => (
                    <ContentRowItem key={movie.tmdbId}>
                      <MovieCard title={movie.title} poster={movie.url} rating={movie.rating} year={movie.year} mediaId={movie.mediaId} tmdbId={movie.tmdbId} type="movie" />
                    </ContentRowItem>
                  ))}
                </ContentRow>
              )}

              {uniqueTopRated.length > 0 && (
                <ContentRow title="Critically Acclaimed" icon="star">
                  {uniqueTopRated.map((movie) => (
                    <ContentRowItem key={movie.tmdbId}>
                      <MovieCard title={movie.title} poster={movie.url} rating={movie.rating} year={movie.year} mediaId={movie.mediaId} tmdbId={movie.tmdbId} type="movie" />
                    </ContentRowItem>
                  ))}
                </ContentRow>
              )}

              {uniqueUpcoming.length > 0 && (
                <ContentRow title="Coming Soon" icon="upcoming">
                  {uniqueUpcoming.map((movie) => (
                    <ContentRowItem key={movie.tmdbId}>
                      <MovieCard title={movie.title} poster={movie.url} rating={movie.rating} year={movie.year} mediaId={movie.mediaId} tmdbId={movie.tmdbId} type="movie" />
                    </ContentRowItem>
                  ))}
                </ContentRow>
              )}
            </>
          );
        })()}

        {/* Dynamically Loaded Rows via Infinite Scroll */}
        {dynamicRows.map((row, index) => (
          <ContentRow key={`dynamic-row-${index}`} title={row.title} icon={row.icon}>
            {row.data.map((item) => (
              <ContentRowItem key={`dynamic-${item.tmdbId}-${index}`}>
                <MovieCard 
                  title={item.title} 
                  poster={item.url} 
                  rating={item.rating} 
                  year={item.year} 
                  mediaId={item.mediaId} 
                  tmdbId={item.tmdbId} 
                  type="movie" 
                />
              </ContentRowItem>
            ))}
          </ContentRow>
        ))}

        {/* Infinite Scroll Target */}
        {hasMore && (
          <div ref={lastElementRef} className="w-full flex justify-center py-6 mt-4">
            {loadingMore && <Loader text="Loading more movies..." />}
          </div>
        )}
      </div>
    </div>
  );
}

export default MoviesPage;
