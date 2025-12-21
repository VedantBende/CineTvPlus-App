import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getLocalProgress } from '../utils/progressTracker';
import PlayerFrame from '../components/media/PlayerFrame';
import Loader from '../components/ui/Loader';

function WatchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const tmdbId = searchParams.get('id');
  const mediaType = searchParams.get('type');
  const season = searchParams.get('season');
  const episode = searchParams.get('episode');
  const resume = searchParams.get('resume');

  const [resumeTime, setResumeTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const [showServerTip, setShowServerTip] = useState(false);

  useEffect(() => {
    if (!tmdbId || !mediaType) {
      navigate('/');
      return;
    }

    loadProgress();
  }, [tmdbId, mediaType, season, episode]);

  // Detect fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isNowFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Show server tip after 30 seconds
  useEffect(() => {
    const showTimer = setTimeout(() => {
      setShowServerTip(true);
    }, 30000);

    return () => clearTimeout(showTimer);
  }, []);

  // Auto-hide server tip after 7 seconds of being shown
  useEffect(() => {
    if (showServerTip) {
      const hideTimer = setTimeout(() => {
        setShowServerTip(false);
      }, 7000);

      return () => clearTimeout(hideTimer);
    }
  }, [showServerTip]);

  // Hide tips after 12 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTips(false);
    }, 12000);

    return () => clearTimeout(timer);
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);

      let timeToResume = 0;

      if (resume) {
        const resumeValue = parseFloat(resume);
        if (!isNaN(resumeValue) && resumeValue > 0) {
          timeToResume = resumeValue;
          console.log('📍 Resume from URL:', timeToResume);
        }
      } else {
        const progress = getLocalProgress(tmdbId, mediaType, season, episode);
        
        if (progress) {
          const currentTime = parseFloat(progress.currentTime) || 0;
          const duration = parseFloat(progress.duration) || 0;

          if (currentTime > 0 && duration > 0) {
            const percentWatched = (currentTime / duration) * 100;
            
            console.log('📊 Progress found:', {
              currentTime: currentTime.toFixed(2),
              duration: duration.toFixed(2),
              percentWatched: percentWatched.toFixed(2) + '%'
            });

            if (currentTime > 10 && percentWatched < 95) {
              timeToResume = currentTime;
              console.log('✅ Will resume from:', timeToResume.toFixed(2), 'seconds');
            } else if (percentWatched >= 95) {
              console.log('🎬 Already watched 95%+, starting fresh');
            } else {
              console.log('🎬 Less than 10 seconds watched, starting fresh');
            }
          } else {
            console.log('🎬 Invalid progress data, starting fresh');
          }
        } else {
          console.log('🎬 No progress found, starting fresh');
        }
      }

      setResumeTime(timeToResume);
    } catch (error) {
      console.error('❌ Failed to load progress:', error);
      setResumeTime(0);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader text="Preparing player..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden safe-area-top safe-area-bottom">
      {/* Back Button - Responsive */}
      {!isFullscreen && (
        <button
          onClick={handleBack}
          className="fixed top-2 left-2 sm:top-3 sm:left-3 md:top-4 md:left-4 z-50 bg-black bg-opacity-80 hover:bg-opacity-100 text-white p-2 sm:p-2.5 md:p-3 rounded-md sm:rounded-lg transition shadow-lg touch-target"
          title="Exit player"
          aria-label="Go back"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
      )}

      {/* Info Banner - Responsive */}
      {!isFullscreen && (
        <div className="fixed top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 z-50 bg-black bg-opacity-80 text-white px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 rounded-md sm:rounded-lg shadow-lg">
          <p className="text-xs sm:text-sm font-medium whitespace-nowrap">
            {mediaType === 'tv' && season && episode ? (
              <span>S{season} E{episode}</span>
            ) : (
              <span>Now Playing</span>
            )}
          </p>
        </div>
      )}

      {/* Player Container - Fully Responsive */}
      <div className="flex items-center justify-center min-h-screen w-full p-0 sm:p-2 md:p-3 lg:p-4">
        <div className="w-full max-w-7xl">
          <PlayerFrame
            tmdbId={tmdbId}
            mediaType={mediaType}
            season={season ? parseInt(season) : null}
            episode={episode ? parseInt(episode) : null}
            resumeTime={resumeTime}
            autoplay={true}
            quality="auto"
          />
        </div>
      </div>

      {/* Minimal Tips Card - Responsive */}
      {showTips && !isFullscreen && (
        <div className="fixed bottom-2 sm:bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2 z-40 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] md:max-w-md px-2 sm:px-0 animate-slide-up">
          <div className="bg-gray-800 bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700">
            {/* Compact Header */}
            <div className="flex items-center justify-between px-3 py-1.5 sm:px-4 sm:py-2 border-b border-gray-700">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <h3 className="text-gray-300 font-medium text-[0.65rem] sm:text-xs">Helpful Tips</h3>
              </div>
              <button 
                onClick={() => setShowTips(false)}
                className="text-gray-400 hover:text-white transition touch-target p-1 -m-1"
                aria-label="Close tips"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Compact Tips */}
            <div className="px-3 py-2 sm:px-4 sm:py-3 space-y-1.5 sm:space-y-2">
              <p className="text-gray-300 text-[0.65rem] sm:text-xs leading-snug">
                <span className="text-gray-400">•</span> <strong className="text-white">Avoid clicking ads</strong> - they may redirect you
              </p>
              <p className="text-gray-300 text-[0.65rem] sm:text-xs leading-snug">
                <span className="text-gray-400">•</span> <strong className="text-white">Use fullscreen</strong> - for best experience
              </p>
              <p className="text-gray-300 text-[0.65rem] sm:text-xs leading-snug">
                <span className="text-gray-400">•</span> <strong className="text-white">Low Video Quality</strong> - Try changing server
              </p>
              <p className="text-gray-300 text-[0.65rem] sm:text-xs leading-snug">
                <span className="text-gray-400">•</span> <strong className="text-white">Video not loading?</strong> - Try changing server after 30s
              </p>
              <p className="text-gray-300 text-[0.65rem] sm:text-xs leading-snug">
                <span className="text-gray-400">•</span> <strong className="text-white">Progress auto-saves</strong> - resume anytime
              </p>
            </div>

            {/* Minimal Footer */}
            <div className="px-3 py-1 sm:px-4 sm:py-1.5 bg-gray-900 bg-opacity-50 text-center">
              <p className="text-gray-500 text-[0.6rem] sm:text-xs">Auto-hide in a few seconds</p>
            </div>
          </div>
        </div>
      )}

      {/* Minimal Server Tip - Responsive */}
      {showServerTip && !isFullscreen && !showTips && (
        <div className="fixed bottom-2 sm:bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2 z-40 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] md:max-w-sm px-2 sm:px-0 animate-slide-up">
          <div className="bg-gray-800 bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700 p-2.5 sm:p-3">
            <div className="flex items-start space-x-2 sm:space-x-2.5">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-gray-300 text-[0.65rem] sm:text-xs flex-1 leading-snug">
                <strong className="text-white">Video taking too long?</strong> Try changing the server using player controls.
              </p>
              <button 
                onClick={() => setShowServerTip(false)}
                className="text-gray-400 hover:text-white transition flex-shrink-0 touch-target p-1 -m-1"
                aria-label="Close server tip"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WatchPage;
