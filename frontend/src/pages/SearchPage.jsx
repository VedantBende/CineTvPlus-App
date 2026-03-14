import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchMulti } from '../utils/tmdbApi';
import MovieCard from '../components/media/MovieCard';
import Loader from '../components/ui/Loader';

function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Infinite Scroll Observer setup
  const observer = useRef();
  const lastElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Initial load or reset when query changes
  useEffect(() => {
    setResults([]);
    setPage(1);
    setHasMore(true);
    if (query && query.trim()) {
      performSearch(query, 1);
    }
  }, [query]);

  // Fetch more data when page changes (ignoring page 1 as it's handled above)
  useEffect(() => {
    if (page > 1 && query && query.trim()) {
      performSearch(query, page);
    }
  }, [page]);

  const performSearch = async (searchQuery, pageNum) => {
    try {
      setLoading(true);
      const data = await searchMulti(searchQuery, pageNum);
      
      if (pageNum === 1) {
        setResults(data.results);
      } else {
        // Filter out possible duplicates
        setResults(prev => {
          const existingIds = new Set(prev.map(r => r.tmdbId));
          const freshResults = data.results.filter(r => !existingIds.has(r.tmdbId));
          return [...prev, ...freshResults];
        });
      }

      setHasMore(data.page < data.totalPages);
    } catch (error) {
      console.error('Search failed:', error);
      if (pageNum === 1) setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-14 sm:pt-16 md:pt-20 bg-netflix-black">
      <div className="container-custom py-8 sm:py-10 md:py-12">
        {/* Search Header */}
        <div className="mb-8 sm:mb-10">
          {query ? (
            <>
              <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                Search results
              </h1>
              <div className="flex items-center gap-3 mt-3">
                <h2 className="text-gray-300 text-base sm:text-lg md:text-xl">
                  Showing matches for <span className="text-accent-red font-semibold">"{query}"</span>
                </h2>
                {results.length > 0 && (
                  <span className="bg-accent-red/10 text-accent-red text-xs sm:text-sm font-semibold px-3 py-1 rounded-full">
                    {/* Displaying actual count loaded so far */}
                    {results.length} {results.length === 1 ? 'Result' : 'Results'} Loaded
                  </span>
                )}
              </div>
            </>
          ) : (
            <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold">
              Search
            </h1>
          )}
        </div>

        {/* First Load Spinner */}
        {loading && page === 1 ? (
          <Loader text="Searching..." />
        ) : results.length > 0 ? (
          <>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
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
            
            {/* Infinite Scroll Target */}
            {hasMore ? (
              <div ref={lastElementRef} className="w-full flex justify-center py-6 sm:py-10 mt-4">
                {loading && <Loader text="Loading more..." />}
              </div>
            ) : (
              <div className="w-full text-center text-gray-400 py-8 mt-4 text-sm sm:text-base">
                End of results
              </div>
            )}
          </>
        ) : query ? (
          <div className="text-center py-16 sm:py-20">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full bg-gray-800/50 flex items-center justify-center">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-white text-xl sm:text-2xl font-semibold mb-2">No results found</h2>
            <p className="text-gray-400 text-sm sm:text-base">Try searching with different keywords</p>
          </div>
        ) : (
          <div className="text-center py-16 sm:py-20">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full bg-gray-800/50 flex items-center justify-center">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-white text-xl sm:text-2xl font-semibold mb-2">Start searching</h2>
            <p className="text-gray-400 text-sm sm:text-base">Enter a movie or TV show name to search</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
