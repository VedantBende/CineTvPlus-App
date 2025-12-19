import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchMulti } from '../utils/tmdbApi';
import MovieCard from '../components/media/MovieCard';
import Loader from '../components/ui/Loader';

function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query && query.trim()) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery) => {
    try {
      setLoading(true);
      const searchResults = await searchMulti(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-netflix-black">
      <div className="container-custom py-12">
        <h1 className="text-white text-3xl font-bold mb-2">
          Search Results {query && `for "${query}"`}
        </h1>
        <p className="text-gray-400 mb-8">
          {results.length} {results.length === 1 ? 'result' : 'results'} found
        </p>

        {loading ? (
          <Loader text="Searching..." />
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {results.map((item) => (
              <MovieCard
                key={item.tmdbId}
                title={item.title}
                poster={item.url}
                rating={item.rating}
                year={item.year}
                mediaId={item.mediaId}
                tmdbId={item.tmdbId}
                type={item.type}
              />
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-20">
            <svg className="w-24 h-24 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="text-white text-2xl font-semibold mb-2">No results found</h2>
            <p className="text-gray-400">Try searching with different keywords</p>
          </div>
        ) : (
          <div className="text-center py-20">
            <svg className="w-24 h-24 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="text-white text-2xl font-semibold mb-2">Start searching</h2>
            <p className="text-gray-400">Enter a movie or TV show name to search</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
