import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTVShowDetails } from '../utils/tmdbApi';
import { formatRating } from '../utils/formatters';
import Loader from '../components/ui/Loader';
import ErrorMessage from '../components/ui/ErrorMessage';
import axios from 'axios';
import { useAuth, useUser } from '@clerk/clerk-react';




const API_URL = import.meta.env.VITE_API_URL;
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w185';




function TVDetails() {
  const { id } = useParams(); // This is TMDB ID
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { isSignedIn } = useUser();
  
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);




  useEffect(() => {
    window.scrollTo(0, 0);
    loadShowDetails();
    if (isSignedIn) {
      checkWatchlist();
    }
  }, [id, isSignedIn]);




  const loadShowDetails = async () => {
    try {
      setLoading(true);
      setError(null);




      const showData = await fetchTVShowDetails(id);
      
      if (!showData) {
        throw new Error('TV show not found');
      }




      setShow(showData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };




  const checkWatchlist = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${API_URL}/favorites/check/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setIsInWatchlist(response.data.isFavorite);
    } catch (error) {
      console.error('Failed to check watchlist:', error);
    }
  };




  const toggleWatchlist = async () => {
    if (!isSignedIn) {
      navigate('/login');
      return;
    }




    setWatchlistLoading(true);
    
    try {
      const token = await getToken();
      
      if (!token) {
        alert('Authentication failed. Please sign in again.');
        navigate('/login');
        return;
      }



      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };



      if (isInWatchlist) {
        await axios.delete(`${API_URL}/favorites/remove/${id}`, config);
        setIsInWatchlist(false);
      } else {
        await axios.post(`${API_URL}/favorites/add`, {
          mediaId: id,
          title: show.title,
          posterPath: show.url,
          rating: show.rating,
          year: show.year,
          mediaType: 'tv'
        }, config);
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error('Watchlist error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to update My List';
      alert(errorMsg);
    } finally {
      setWatchlistLoading(false);
    }
  };




  const handleWatchFirstEpisode = () => {
    // Start with Season 1, Episode 1
    navigate(`/watch?id=${id}&type=tv&season=1&episode=1`);
  };




  if (loading) {
    return (
      <div className="min-h-screen pt-14 sm:pt-16 md:pt-20 bg-white dark:bg-netflix-black transition-colors duration-300">
        <Loader text="Loading show details..." />
      </div>
    );
  }




  if (error || !show) {
    return (
      <div className="min-h-screen pt-14 sm:pt-16 md:pt-20 bg-white dark:bg-netflix-black transition-colors duration-300">
        <ErrorMessage message={error || 'Show not found'} onRetry={loadShowDetails} />
      </div>
    );
  }




  return (
    <div className="min-h-screen bg-white dark:bg-netflix-black transition-colors duration-300">
      {/* Hero Section - Responsive */}
      <div className="relative h-[95vh] sm:h-[60vh] md:h-[65vh] lg:h-[110vh] -mt-14 sm:-mt-16 md:-mt-16 pt-14 sm:pt-16 md:pt-16 bg-gradient-to-b from-gray-100 to-white dark:from-black dark:to-netflix-black transition-colors duration-500">
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/60 to-transparent z-10" />
        <div className="absolute left-0 right-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent z-10" />
        
        {show.backdrop && (
          <img
            src={show.backdrop}
            alt={show.title}
            className="w-full h-full object-cover opacity-80 transition-opacity duration-500"
          />
        )}




        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 lg:p-12 container-custom z-20">
          {/* Title - Responsive */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 md:mb-4 leading-tight drop-shadow-lg">
            {show.title} {show.year && <span className="text-white/70 block sm:inline mt-1 sm:mt-0">({show.year})</span>}
          </h1>




          {/* Metadata - Responsive */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-4 md:mb-6">
            {show.rating && (
              <div className="flex items-center space-x-1 sm:space-x-2 bg-yellow-500 px-2 py-1 sm:px-3 rounded text-xs sm:text-sm">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-white font-bold">{formatRating(show.rating)}</span>
              </div>
            )}
            {show.seasons && (
              <span className="text-white bg-white/20 px-2 py-1 sm:px-3 rounded text-xs sm:text-sm backdrop-blur-sm">
                {show.seasons} Season{show.seasons > 1 ? 's' : ''}
              </span>
            )}
            {show.episodes && (
              <span className="text-white bg-white/20 px-2 py-1 sm:px-3 rounded text-xs sm:text-sm backdrop-blur-sm">
                {show.episodes} Episodes
              </span>
            )}
            {show.genres && show.genres.length > 0 && (
              <span className="text-white bg-white/20 px-2 py-1 sm:px-3 rounded text-xs sm:text-sm line-clamp-1 backdrop-blur-sm">
                {show.genres.slice(0, 2).map(g => g.name).join(', ')}
              </span>
            )}
          </div>




          {/* Overview - Responsive */}
          <p className="text-white/80 text-xs sm:text-sm md:text-base lg:text-lg max-w-3xl mb-3 sm:mb-4 md:mb-6 line-clamp-2 sm:line-clamp-3 leading-relaxed hidden sm:block drop-shadow-md">
            {show.overview}
          </p>




          {/* Action Buttons - Responsive */}
          <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
            <button
              onClick={handleWatchFirstEpisode}
              className="bg-white text-black px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 lg:px-8 rounded text-sm sm:text-base font-semibold hover:bg-gray-200 transition-all flex items-center space-x-1.5 sm:space-x-2 shadow-lg transform hover:scale-105 touch-target"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span className="hidden xs:inline">Play S1 E1</span>
              <span className="xs:hidden">Play</span>
            </button>




            {isSignedIn && (
              <button
                onClick={toggleWatchlist}
                disabled={watchlistLoading}
                className="bg-white/10 dark:bg-gray-700 dark:bg-opacity-70 text-white px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 rounded text-sm sm:text-base font-semibold hover:bg-white/20 dark:hover:bg-opacity-90 transition-all flex items-center space-x-1.5 sm:space-x-2 backdrop-blur-sm disabled:opacity-50 touch-target border border-white/20 dark:border-transparent shadow-md"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill={isInWatchlist ? '#E50914' : 'none'} stroke={isInWatchlist ? '#E50914' : 'currentColor'} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span className="hidden sm:inline">{isInWatchlist ? 'Remove from List' : 'Add to My List'}</span>
                <span className="sm:hidden">{isInWatchlist ? 'Remove' : 'Add'}</span>
              </button>
            )}

            {show.trailer && (
              <a
                href={`https://www.youtube.com/watch?v=${show.trailer}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 dark:bg-gray-700 dark:bg-opacity-70 text-white px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 rounded text-sm sm:text-base font-semibold hover:bg-white/20 dark:hover:bg-opacity-90 transition-all flex items-center space-x-1.5 sm:space-x-2 backdrop-blur-sm touch-target border border-white/20 dark:border-transparent shadow-md"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/>
                </svg>
                <span>Trailer</span>
              </a>
            )}
          </div>
        </div>
      </div>




      {/* Content Section - Responsive */}
      <div className="container-custom py-6 sm:py-8 md:py-10 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            {/* Overview for Mobile */}
            <div className="sm:hidden mb-6">
              <h2 className="text-gray-900 dark:text-white text-lg font-bold mb-2 transition-colors">Overview</h2>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed transition-colors">
                {show.overview}
              </p>
            </div>




            {/* Episodes Section - Responsive */}
            <div className="mb-8 p-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-gray-900 dark:text-white text-xl md:text-2xl font-bold tracking-tight">
                  Episodes
                </h2>
              </div>
              
              {/* Season Selection Pills */}
              <div className="flex overflow-x-auto no-scrollbar gap-2 sm:gap-3 mb-6 pb-2 border-b border-gray-200 dark:border-gray-800">
                {[...Array(show.seasons || 1)].map((_, i) => {
                  const seasonNum = i + 1;
                  const isActive = selectedSeason === seasonNum;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedSeason(seasonNum)}
                      className={`whitespace-nowrap pb-3 px-1 text-sm sm:text-base font-semibold transition-all relative ${
                        isActive
                          ? 'text-[#E50914] dark:text-[#E50914]'
                          : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      Season {seasonNum}
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E50914] rounded-t-lg" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Episodes Minimalist Grid */}
              {(() => {
                const targetSeason = show.seasonsData?.find(s => s.season_number === selectedSeason);
                const epCount = targetSeason?.episode_count || 1;
                
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                    {[...Array(epCount)].map((_, i) => {
                      const epNum = i + 1;
                      return (
                        <button
                          key={i}
                          onClick={() => navigate(`/watch?id=${id}&type=tv&season=${selectedSeason}&episode=${epNum}`)}
                          className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 dark:bg-[#1a1a1a] dark:hover:bg-[#262626] text-gray-900 dark:text-white p-3 sm:p-4 rounded-xl transition-all duration-300 group border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-2xl font-black text-gray-300 dark:text-gray-700 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-colors">
                              {epNum}
                            </span>
                            <div className="flex flex-col items-start">
                              <span className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-[#E50914] transition-colors leading-tight">
                                Episode {epNum}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-500 font-medium mt-0.5">
                                Season {selectedSeason}
                              </span>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-white dark:bg-[#0f0f0f] shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 border border-gray-100 dark:border-gray-800">
                            <svg className="w-3.5 h-3.5 text-[#E50914] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>




            {/* Cast - Responsive */}
            {show.cast && show.cast.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-white text-lg sm:text-xl font-bold mb-3 sm:mb-4">Cast</h3>
                <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 sm:gap-4">
                  {show.cast.map((member, index) => (
                    <div key={index} className="flex flex-col items-center text-center group">
                      <div className="w-full aspect-square rounded-full overflow-hidden bg-gray-700 mb-2 ring-2 ring-transparent group-hover:ring-netflix-red transition-all">
                        {member.profile_path ? (
                          <img
                            src={`${TMDB_IMAGE_BASE}${member.profile_path}`}
                            alt={member.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-medium line-clamp-2 transition-colors">
                        {member.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}




            {/* Creator - Responsive */}
            {show.creator && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-white text-lg sm:text-xl font-bold mb-3 sm:mb-4">Creator</h3>
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 ring-2 ring-gray-600">
                    {show.creator.profile_path ? (
                      <img
                        src={`${TMDB_IMAGE_BASE}${show.creator.profile_path}`}
                        alt={show.creator.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm sm:text-base font-medium">{show.creator.name}</p>
                </div>
              </div>
            )}
          </div>




          {/* Sidebar - Responsive */}
          <div className="order-1 lg:order-2">
            {show.url && (
              <div className="mb-4 sm:mb-6">
                <img
                  src={show.url}
                  alt={show.title}
                  className="w-full max-w-xs mx-auto lg:max-w-full lg:mx-0 rounded-lg shadow-lg"
                />
              </div>
            )}




            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-5 md:p-6 border border-gray-100 dark:border-transparent transition-colors">
              <h3 className="text-gray-900 dark:text-white text-base sm:text-lg font-bold mb-3 sm:mb-4 transition-colors">Details</h3>
              <div className="space-y-2 sm:space-y-3">
                {show.year && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm block mb-1 transition-colors">First Aired</span>
                    <p className="text-gray-900 dark:text-white text-sm sm:text-base transition-colors">{show.year}</p>
                  </div>
                )}
                {show.seasons && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm block mb-1 transition-colors">Seasons</span>
                    <p className="text-gray-900 dark:text-white text-sm sm:text-base transition-colors">{show.seasons}</p>
                  </div>
                )}
                {show.episodes && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm block mb-1 transition-colors">Total Episodes</span>
                    <p className="text-gray-900 dark:text-white text-sm sm:text-base transition-colors">{show.episodes}</p>
                  </div>
                )}
                {show.rating && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm block mb-1 transition-colors">Rating</span>
                    <p className="text-gray-900 dark:text-white text-sm sm:text-base transition-colors">{show.rating}/10</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




export default TVDetails;
