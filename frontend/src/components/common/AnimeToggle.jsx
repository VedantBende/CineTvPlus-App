import { useTheme } from '../../context/ThemeContext';

const AnimeToggle = () => {
  const { isAnimeMode, toggleAnimeMode } = useTheme();

  return (
    <button
      onClick={toggleAnimeMode}
      className={`relative flex items-center justify-center touch-target p-1.5 sm:p-2 rounded-full transition-all duration-300 ${
        isAnimeMode 
          ? 'bg-[#ff2a6d]/10 text-[#ff2a6d] shadow-[0_0_10px_rgba(255,42,109,0.5)]' 
          : 'text-gray-900 dark:text-white hover:text-[#ff2a6d] dark:hover:text-[#ff2a6d]'
      }`}
      aria-label="Toggle Anime Mode"
      title={isAnimeMode ? "Disable AniTv+" : "Enable AniTv+"}
    >
      <div className="flex items-center space-x-1 font-bold text-xs sm:text-sm tracking-wide">
        <span>AniTv+</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-300 ${isAnimeMode ? 'rotate-180 text-[#ff2a6d]' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
    </button>
  );
};

export default AnimeToggle;
