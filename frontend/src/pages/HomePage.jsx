import { useEffect, useState, useCallback } from 'react';
import { 
  fetchTrendingMovies, 
  fetchTrendingTVShows,
  fetchPopularMovies,
  fetchNowPlayingMovies,
  fetchTopRatedMovies
} from '../utils/tmdbApi';
import MovieCard from '../components/media/MovieCard';
import ContinueWatching from '../components/media/ContinueWatching';
import Loader from '../components/ui/Loader';
import ErrorMessage from '../components/ui/ErrorMessage';
import { useUser } from '@clerk/clerk-react';

function HomePage() {
  const { isSignedIn } = useUser();
  
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTV, setTrendingTV] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [heroMovies, setHeroMovies] = useState([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadContent();
  }, []);

  // Auto-rotate hero carousel
  useEffect(() => {
    if (heroMovies.length === 0) return;

    const interval = setInterval(() => {
      setCurrentHeroIndex((prevIndex) => 
        prevIndex === heroMovies.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [heroMovies.length]);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const hasApiKey = import.meta.env.VITE_TMDB_API_KEY;

      if (!hasApiKey) {
        throw new Error('TMDB API key not configured. Please add VITE_TMDB_API_KEY to your .env file');
      }

      const [trending, trendingShows, popular, nowPlaying, topRated] = await Promise.all([
        fetchTrendingMovies(),
        fetchTrendingTVShows(),
        fetchPopularMovies(),
        fetchNowPlayingMovies(),
        fetchTopRatedMovies()
      ]);

      setTrendingMovies(trending);
      setTrendingTV(trendingShows);
      setPopularMovies(popular);
      setNowPlayingMovies(nowPlaying);
      setTopRatedMovies(topRated);

      // Set hero movies (top 5 trending movies with backdrops)
      const heroMoviesData = trending
        .filter(movie => movie.backdrop)
        .slice(0, 5);
      setHeroMovies(heroMoviesData);

    } catch (err) {
      console.error('Error loading content:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const goToSlide = useCallback((index) => {
    setCurrentHeroIndex(index);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentHeroIndex((prevIndex) => 
      prevIndex === heroMovies.length - 1 ? 0 : prevIndex + 1
    );
  }, [heroMovies.length]);

  const prevSlide = useCallback(() => {
    setCurrentHeroIndex((prevIndex) => 
      prevIndex === 0 ? heroMovies.length - 1 : prevIndex - 1
    );
  }, [heroMovies.length]);

  if (loading) {
    return (
      <div className="min-h-screen pt-14 sm:pt-16 md:pt-20 bg-netflix-black">
        <Loader text="Loading awesome content..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-14 sm:pt-16 md:pt-20 bg-netflix-black">
        <ErrorMessage message={error} onRetry={loadContent} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-14 sm:pt-16 md:pt-16 bg-netflix-black">
      {/* Hero Carousel Section - Fixed Dots Position */}
      <div className="relative h-[55vh] xs:h-[60vh] sm:h-[65vh] md:h-[70vh] lg:h-[80vh] xl:h-[85vh] bg-gradient-to-b from-black to-netflix-black overflow-hidden">
        {/* Carousel Slides - Background Images with Ease In/Out */}
        <div className="relative w-full h-full">
          {heroMovies.map((movie, index) => (
            <div
              key={`bg-${movie.tmdbId}`}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === currentHeroIndex 
                  ? 'opacity-100 z-10 ease-in' 
                  : 'opacity-0 z-0 ease-out'
              }`}
            >
              {/* Gradient Overlays - Responsive */}
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 sm:via-black/70 md:via-black/50 to-transparent z-10" />
              <div className="absolute bottom-0 left-0 right-0 h-24 xs:h-28 sm:h-32 md:h-40 lg:h-48 bg-gradient-to-t from-netflix-black via-netflix-black/90 to-transparent z-10" />
              
              {/* Hero Background Image */}
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

        {/* Navigation Arrows - Responsive Hover Zones */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-16 md:w-20 lg:w-28 z-30 flex items-center justify-start opacity-0 hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={prevSlide}
            className="ml-1.5 sm:ml-2 md:ml-3 lg:ml-4 bg-black/50 hover:bg-black/80 text-white p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-full transition-all backdrop-blur-sm group/btn touch-target"
            aria-label="Previous slide"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-16 md:w-20 lg:w-28 z-30 flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={nextSlide}
            className="mr-1.5 sm:mr-2 md:mr-3 lg:mr-4 bg-black/50 hover:bg-black/80 text-white p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-full transition-all backdrop-blur-sm group/btn touch-target"
            aria-label="Next slide"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Hero Content - Ease In/Out Transition */}
        <div className="absolute bottom-0 left-0 right-0 pb-12 xs:pb-14 sm:pb-16 md:pb-20 lg:pb-24 p-3 xs:p-4 sm:p-6 md:p-8 lg:p-10 xl:p-16 container-custom z-20">
          <div className="relative max-w-xs xs:max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
            {heroMovies.map((movie, index) => (
              <div
                key={`content-${movie.tmdbId}`}
                className={`transition-opacity duration-700 ${
                  index === currentHeroIndex 
                    ? 'opacity-100 relative z-10 ease-in' 
                    : 'opacity-0 absolute inset-0 z-0 pointer-events-none ease-out'
                }`}
              >
                {/* Title - Fully Responsive */}
                <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-white mb-1.5 xs:mb-2 sm:mb-3 md:mb-4 lg:mb-6 drop-shadow-2xl leading-tight text-shadow-lg">
                  {movie.title}
                </h1>

                {/* Rating & Year - Responsive */}
                <div className="flex items-center flex-wrap gap-1.5 xs:gap-2 sm:gap-3 md:gap-4 mb-2 xs:mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                  {movie.rating && (
                    <div className="flex items-center space-x-1 xs:space-x-1.5 sm:space-x-2 bg-yellow-500 px-2 py-0.5 xs:px-2.5 xs:py-1 sm:px-3 sm:py-1.5 rounded-md shadow-lg">
                      <svg className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-white font-bold text-xs sm:text-sm md:text-base">{movie.rating}</span>
                    </div>
                  )}
                  {movie.year && (
                    <span className="text-white text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-semibold bg-black/30 px-2 py-0.5 xs:px-2.5 xs:py-1 sm:px-3 rounded-md backdrop-blur-sm">
                      {movie.year}
                    </span>
                  )}
                </div>

                {/* Overview - Responsive */}
                {movie.overview && (
                  <p className="text-white text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl mb-3 xs:mb-4 sm:mb-5 md:mb-6 lg:mb-8 line-clamp-2 md:line-clamp-3 drop-shadow-lg leading-relaxed text-shadow max-w-xl md:max-w-2xl">
                    {movie.overview}
                  </p>
                )}

                {/* Action Buttons - Fully Responsive */}
                <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
                  <button 
                    onClick={() => window.location.href = `/watch?id=${movie.tmdbId}&type=movie`}
                    className="bg-white text-black px-4 py-2 xs:px-5 xs:py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-3.5 lg:px-10 lg:py-4 rounded-md text-xs xs:text-sm sm:text-base md:text-lg font-bold hover:bg-gray-200 transition-all flex items-center space-x-1.5 xs:space-x-2 sm:space-x-2.5 shadow-xl transform hover:scale-105 active:scale-95 touch-target"
                  >
                    <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>Play</span>
                  </button>
                  <button 
                    onClick={() => window.location.href = `/movie/${movie.tmdbId}`}
                    className="bg-gray-600/80 hover:bg-gray-600 backdrop-blur-md text-white px-4 py-2 xs:px-5 xs:py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-3.5 lg:px-10 lg:py-4 rounded-md text-xs xs:text-sm sm:text-base md:text-lg font-semibold transition-all flex items-center space-x-1.5 xs:space-x-2 sm:space-x-2.5 shadow-xl hover:scale-105 active:scale-95 touch-target"
                  >
                    <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="hidden xs:inline">More Info</span>
                    <span className="xs:hidden">Info</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Indicators/Dots - Fixed Position Above Buttons */}
        <div className="absolute bottom-2 xs:bottom-3 sm:bottom-4 md:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-1.5">
          {heroMovies.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentHeroIndex 
                  ? 'bg-white w-5 h-1' 
                  : 'bg-gray-500/70 hover:bg-gray-400/90 w-1 h-1'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Content Sections - Fully Responsive */}
      <div className="container-custom py-4 xs:py-5 sm:py-6 md:py-8 lg:py-10 xl:py-12 space-y-6 xs:space-y-7 sm:space-y-8 md:space-y-10 lg:space-y-12">
        {/* Continue Watching */}
        {isSignedIn && <ContinueWatching />}

        {/* Trending Movies */}
        {trendingMovies.length > 0 && (
          <section className="space-y-2.5 xs:space-y-3 sm:space-y-4">
            <h2 className="text-white text-base xs:text-lg sm:text-xl md:text-2xl font-bold">
              Trending Movies
            </h2>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {trendingMovies.slice(0, 12).map((movie) => (
                <MovieCard
                  key={movie.tmdbId}
                  title={movie.title}
                  poster={movie.url}
                  rating={movie.rating}
                  year={movie.year}
                  mediaId={movie.mediaId}
                  tmdbId={movie.tmdbId}
                  type="movie"
                />
              ))}
            </div>
          </section>
        )}

        {/* Trending TV Shows */}
        {trendingTV.length > 0 && (
          <section className="space-y-2.5 xs:space-y-3 sm:space-y-4">
            <h2 className="text-white text-base xs:text-lg sm:text-xl md:text-2xl font-bold">
              Trending TV Shows
            </h2>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {trendingTV.slice(0, 12).map((show) => (
                <MovieCard
                  key={show.tmdbId}
                  title={show.title}
                  poster={show.url}
                  rating={show.rating}
                  year={show.year}
                  mediaId={show.mediaId}
                  tmdbId={show.tmdbId}
                  type="tv"
                />
              ))}
            </div>
          </section>
        )}

        {/* Now Playing */}
        {nowPlayingMovies.length > 0 && (
          <section className="space-y-2.5 xs:space-y-3 sm:space-y-4">
            <h2 className="text-white text-base xs:text-lg sm:text-xl md:text-2xl font-bold">
              Now Playing in Theaters
            </h2>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {nowPlayingMovies.slice(0, 12).map((movie) => (
                <MovieCard
                  key={movie.tmdbId}
                  title={movie.title}
                  poster={movie.url}
                  rating={movie.rating}
                  year={movie.year}
                  mediaId={movie.mediaId}
                  tmdbId={movie.tmdbId}
                  type="movie"
                />
              ))}
            </div>
          </section>
        )}

        {/* Popular Movies */}
        {popularMovies.length > 0 && (
          <section className="space-y-2.5 xs:space-y-3 sm:space-y-4">
            <h2 className="text-white text-base xs:text-lg sm:text-xl md:text-2xl font-bold">
              Popular Movies
            </h2>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {popularMovies.slice(0, 12).map((movie) => (
                <MovieCard
                  key={movie.tmdbId}
                  title={movie.title}
                  poster={movie.url}
                  rating={movie.rating}
                  year={movie.year}
                  mediaId={movie.mediaId}
                  tmdbId={movie.tmdbId}
                  type="movie"
                />
              ))}
            </div>
          </section>
        )}

        {/* Top Rated Movies */}
        {topRatedMovies.length > 0 && (
          <section className="space-y-2.5 xs:space-y-3 sm:space-y-4 pb-4 xs:pb-5 sm:pb-6 md:pb-8 lg:pb-12">
            <h2 className="text-white text-base xs:text-lg sm:text-xl md:text-2xl font-bold">
              Top Rated Movies
            </h2>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {topRatedMovies.slice(0, 12).map((movie) => (
                <MovieCard
                  key={movie.tmdbId}
                  title={movie.title}
                  poster={movie.url}
                  rating={movie.rating}
                  year={movie.year}
                  mediaId={movie.mediaId}
                  tmdbId={movie.tmdbId}
                  type="movie"
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default HomePage;
