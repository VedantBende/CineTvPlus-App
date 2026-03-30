import { useMemo } from 'react';

function EpisodeSelector({ seasons, currentSeason, currentEpisode, onEpisodeChange }) {
  // Filter out specials (season 0) and sort by season number
  const validSeasons = useMemo(() => {
    if (!seasons || !Array.isArray(seasons)) return [];
    return seasons
      .filter(s => s.season_number > 0)
      .sort((a, b) => a.season_number - b.season_number);
  }, [seasons]);

  // Get episode count for the current season
  const episodeCount = useMemo(() => {
    const season = validSeasons.find(s => s.season_number === currentSeason);
    return season?.episode_count || 1;
  }, [validSeasons, currentSeason]);

  if (validSeasons.length === 0) return null;

  const handleSeasonChange = (e) => {
    const newSeason = parseInt(e.target.value, 10);
    onEpisodeChange(newSeason, 1); // Reset to episode 1
  };

  const handleEpisodeChange = (e) => {
    const newEpisode = parseInt(e.target.value, 10);
    onEpisodeChange(currentSeason, newEpisode);
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 mt-2.5 sm:mt-3 px-1 animate-episode-fade">
      {/* Season Dropdown */}
      <div className="relative">
        <select
          value={currentSeason}
          onChange={handleSeasonChange}
          className="
            appearance-none bg-zinc-800/90 text-white text-xs sm:text-sm
            pl-3 pr-7 py-1.5 sm:pl-4 sm:pr-8 sm:py-2
            rounded-md border border-zinc-700/60
            focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/30
            transition-all duration-200 cursor-pointer
            hover:bg-zinc-700/90 hover:border-zinc-600
          "
          aria-label="Select season"
        >
          {validSeasons.map((s) => (
            <option key={s.season_number} value={s.season_number}>
              Season {s.season_number}
            </option>
          ))}
        </select>
        {/* Dropdown arrow */}
        <svg
          className="absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 pointer-events-none"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Episode Dropdown */}
      <div className="relative">
        <select
          value={currentEpisode}
          onChange={handleEpisodeChange}
          className="
            appearance-none bg-zinc-800/90 text-white text-xs sm:text-sm
            pl-3 pr-7 py-1.5 sm:pl-4 sm:pr-8 sm:py-2
            rounded-md border border-zinc-700/60
            focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/30
            transition-all duration-200 cursor-pointer
            hover:bg-zinc-700/90 hover:border-zinc-600
          "
          aria-label="Select episode"
        >
          {Array.from({ length: episodeCount }, (_, i) => i + 1).map((ep) => (
            <option key={ep} value={ep}>
              Episode {ep}
            </option>
          ))}
        </select>
        {/* Dropdown arrow */}
        <svg
          className="absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 pointer-events-none"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Inline animation keyframes */}
      <style>{`
        @keyframes episodeFade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-episode-fade {
          animation: episodeFade 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default EpisodeSelector;
