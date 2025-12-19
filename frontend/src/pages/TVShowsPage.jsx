import { useEffect, useState } from 'react';
import { fetchPopularTVShows, fetchTrendingTVShows } from '../utils/tmdbApi';
import MovieCard from '../components/media/MovieCard';
import Loader from '../components/ui/Loader';
import ErrorMessage from '../components/ui/ErrorMessage';

function TVShowsPage() {
  const [popularShows, setPopularShows] = useState([]);
  const [trendingShows, setTrendingShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTVShows();
  }, []);

  const loadTVShows = async () => {
    try {
      setLoading(true);
      setError(null);

      const [popular, trending] = await Promise.all([
        fetchPopularTVShows(),
        fetchTrendingTVShows()
      ]);

      setPopularShows(popular);
      setTrendingShows(trending);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-14 sm:pt-16 md:pt-20 bg-netflix-black">
        <Loader text="Loading TV shows..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-14 sm:pt-16 md:pt-20 bg-netflix-black">
        <ErrorMessage message={error} onRetry={loadTVShows} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-14 sm:pt-16 md:pt-20 bg-netflix-black">
      <div className="container-custom py-6 sm:py-8 md:py-10 lg:py-12">
        {/* Page Title - Responsive */}
        <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 md:mb-10 lg:mb-12">
          TV Shows
        </h1>

        {/* Trending TV Shows */}
        {trendingShows.length > 0 && (
          <section className="mb-8 sm:mb-10 md:mb-12">
            <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
              <h2 className="text-white text-lg sm:text-xl md:text-2xl font-bold">
                Trending Now
              </h2>
              <span className="text-gray-400 text-xs sm:text-sm">
                {trendingShows.length} shows
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {trendingShows.map((show) => (
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

        {/* Popular TV Shows */}
        {popularShows.length > 0 && (
          <section className="mb-8 sm:mb-10 md:mb-12 pb-6 sm:pb-8">
            <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
              <h2 className="text-white text-lg sm:text-xl md:text-2xl font-bold">
                Popular TV Shows
              </h2>
              <span className="text-gray-400 text-xs sm:text-sm">
                {popularShows.length} shows
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {popularShows.map((show) => (
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
      </div>
    </div>
  );
}

export default TVShowsPage;
