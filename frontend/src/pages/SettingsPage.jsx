import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useEffect, useState } from 'react';


function SettingsPage() {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Playback settings state
  const [autoplay, setAutoplay] = useState(() => {
    return localStorage.getItem('autoplay') === 'true';
  });
  const [videoQuality, setVideoQuality] = useState(() => {
    return localStorage.getItem('videoQuality') || 'auto';
  });
  const [subtitles, setSubtitles] = useState(() => {
    return localStorage.getItem('subtitles') || 'off';
  });
  const [volume, setVolume] = useState(() => {
    return parseInt(localStorage.getItem('volume') || '70', 10);
  });

  useEffect(() => {
    if (!isSignedIn) {
      navigate('/login');
    }
  }, [isSignedIn, navigate]);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('autoplay', autoplay.toString());
  }, [autoplay]);

  useEffect(() => {
    localStorage.setItem('videoQuality', videoQuality);
  }, [videoQuality]);

  useEffect(() => {
    localStorage.setItem('subtitles', subtitles);
  }, [subtitles]);

  useEffect(() => {
    localStorage.setItem('volume', volume.toString());
  }, [volume]);

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen pt-14 sm:pt-16 md:pt-20 bg-netflix-black">
      <div className="container-custom py-6 sm:py-8 md:py-10 lg:py-12 max-w-4xl">
        {/* Page Title - Responsive */}
        <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">
          Settings
        </h1>

        {/* Account Info - Responsive */}
        <div className="bg-netflix-gray rounded-lg p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6">
          <h2 className="text-white text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">
            Account
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="text-gray-400 text-xs sm:text-sm block mb-1">Email</label>
              <p className="text-white text-sm sm:text-base break-all">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
            <div>
              <label className="text-gray-400 text-xs sm:text-sm block mb-1">Member since</label>
              <p className="text-white text-sm sm:text-base">
                {new Date(user?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Appearance - Responsive */}
        <div className="bg-netflix-gray rounded-lg p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6">
          <h2 className="text-white text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">
            Appearance
          </h2>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <h3 className="text-white font-medium text-sm sm:text-base">Theme</h3>
              <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                Choose your preferred theme
              </p>
            </div>
            <div className="flex space-x-2 sm:space-x-3 md:space-x-4">
              <button
                onClick={() => theme === 'light' && toggleTheme()}
                className={`flex-1 sm:flex-none px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded text-sm sm:text-base font-medium transition-all touch-target ${
                  theme === 'dark'
                    ? 'bg-netflix-red text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => theme === 'dark' && toggleTheme()}
                className={`flex-1 sm:flex-none px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded text-sm sm:text-base font-medium transition-all touch-target ${
                  theme === 'light'
                    ? 'bg-netflix-red text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Light
              </button>
            </div>
          </div>
        </div>

        {/* Playback Settings - Responsive */}
        <div className="bg-netflix-gray rounded-lg p-4 sm:p-5 md:p-6">
          <h2 className="text-white text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">
            Playback
          </h2>
          
          <div className="space-y-5 sm:space-y-6">
            {/* Autoplay - Responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex-1">
                <h3 className="text-white font-medium text-sm sm:text-base">Autoplay</h3>
                <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                  Automatically play next episode
                </p>
              </div>
              <button 
                onClick={() => setAutoplay(!autoplay)}
                className={`relative inline-flex h-7 w-12 sm:h-6 sm:w-11 items-center rounded-full transition flex-shrink-0 touch-target ${
                  autoplay ? 'bg-netflix-red' : 'bg-gray-600'
                }`}
                aria-label="Toggle autoplay"
              >
                <span className={`inline-block h-5 w-5 sm:h-4 sm:w-4 transform rounded-full bg-white transition ${
                  autoplay ? 'translate-x-6 sm:translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Quality - Responsive */}
            <div>
              <h3 className="text-white font-medium text-sm sm:text-base mb-2">
                Video Quality
              </h3>
              <select 
                value={videoQuality}
                onChange={(e) => setVideoQuality(e.target.value)}
                className="bg-gray-700 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-netflix-red transition touch-target"
              >
                <option value="auto">Auto</option>
                <option value="360p">360p</option>
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
              </select>
            </div>

            {/* Subtitles - Additional Setting */}
            <div>
              <h3 className="text-white font-medium text-sm sm:text-base mb-2">
                Subtitles
              </h3>
              <select 
                value={subtitles}
                onChange={(e) => setSubtitles(e.target.value)}
                className="bg-gray-700 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-netflix-red transition touch-target"
              >
                <option value="off">Off</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>

            {/* Volume - Additional Setting */}
            <div>
              <h3 className="text-white font-medium text-sm sm:text-base mb-2">
                Default Volume
              </h3>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-netflix-red touch-target"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Mute</span>
                <span className="text-white font-medium">{volume}%</span>
                <span>Max</span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions - Responsive */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-5 py-3 rounded font-medium transition-all text-sm sm:text-base touch-target"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
