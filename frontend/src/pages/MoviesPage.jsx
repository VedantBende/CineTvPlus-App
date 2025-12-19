import { useEffect, useState } from 'react';
import { 
  fetchPopularMovies, 
  fetchTopRatedMovies, 
  fetchNowPlayingMovies,
  fetchTrendingMovies 
} from '../utils/tmdbApi';
import MovieCard from '../components/media/MovieCard';
import Loader from '../components/ui/Loader';
import ErrorMessage from '../components/ui/ErrorMessage';

function MoviesPage() {
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    try {
      setLoading(true);
      setError(null);

      const [popular, topRated, nowPlaying, trending] = await Promise.all([
        fetchPopularMovies(),
        fetchTopRatedMovies(),
        fetchNowPlayingMovies(),
        fetchTrendingMovies()
      ]);

      setPopularMovies(popular);
      setTopRatedMovies(topRated);
      setNowPlayingMovies(nowPlaying);
      setTrendingMovies(trending);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
        <ErrorMessage message={error} onRetry={loadMovies} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-14 sm:pt-16 md:pt-20 bg-netflix-black">
      <div className="container-custom py-6 sm:py-8 md:py-10 lg:py-12">
        {/* Page Title - Responsive */}
        <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 md:mb-10 lg:mb-12">
          Movies
        </h1>

        {/* Trending Movies */}
        {trendingMovies.length > 0 && (
          <section className="mb-8 sm:mb-10 md:mb-12">
            <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
              <h2 className="text-white text-lg sm:text-xl md:text-2xl font-bold">
                Trending Now
              </h2>
              <span className="text-gray-400 text-xs sm:text-sm">
                {trendingMovies.length} movies
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {trendingMovies.map((movie) => (
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

        {/* Now Playing */}
        {nowPlayingMovies.length > 0 && (
          <section className="mb-8 sm:mb-10 md:mb-12">
            <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
              <h2 className="text-white text-lg sm:text-xl md:text-2xl font-bold">
                Now Playing
              </h2>
              <span className="text-gray-400 text-xs sm:text-sm">
                {nowPlayingMovies.length} movies
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {nowPlayingMovies.map((movie) => (
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
          <section className="mb-8 sm:mb-10 md:mb-12">
            <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
              <h2 className="text-white text-lg sm:text-xl md:text-2xl font-bold">
                Popular Movies
              </h2>
              <span className="text-gray-400 text-xs sm:text-sm">
                {popularMovies.length} movies
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {popularMovies.map((movie) => (
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
          <section className="mb-8 sm:mb-10 md:mb-12 pb-6 sm:pb-8">
            <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
              <h2 className="text-white text-lg sm:text-xl md:text-2xl font-bold">
                Top Rated
              </h2>
              <span className="text-gray-400 text-xs sm:text-sm">
                {topRatedMovies.length} movies
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {topRatedMovies.map((movie) => (
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

export default MoviesPage;
