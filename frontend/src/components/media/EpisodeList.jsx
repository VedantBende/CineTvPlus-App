import { useState } from 'react';

function EpisodeList({ episodes, onEpisodeSelect, currentEpisode }) {
  const [selectedSeason, setSelectedSeason] = useState(1);

  // Group episodes by season
  const seasons = episodes.reduce((acc, episode) => {
    if (!acc[episode.season]) {
      acc[episode.season] = [];
    }
    acc[episode.season].push(episode);
    return acc;
  }, {});

  const currentSeasonEpisodes = seasons[selectedSeason] || [];

  return (
    <div className="bg-netflix-gray rounded-lg p-6">
      <h2 className="text-white text-2xl font-bold mb-4">Episodes</h2>

      {/* Season Selector */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {Object.keys(seasons).map((season) => (
          <button
            key={season}
            onClick={() => setSelectedSeason(Number(season))}
            className={`px-4 py-2 rounded transition ${
              selectedSeason === Number(season)
                ? 'bg-netflix-red text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Season {season}
          </button>
        ))}
      </div>

      {/* Episode List */}
      <div className="space-y-4">
        {currentSeasonEpisodes.map((episode) => (
          <div
            key={`${episode.season}-${episode.episode}`}
            onClick={() => onEpisodeSelect(episode)}
            className={`flex items-start space-x-4 p-4 rounded-lg cursor-pointer transition ${
              currentEpisode?.episode === episode.episode &&
              currentEpisode?.season === episode.season
                ? 'bg-gray-700 border-l-4 border-netflix-red'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            {/* Episode Number */}
            <div className="flex-shrink-0 w-12 h-12 bg-netflix-red rounded flex items-center justify-center">
              <span className="text-white font-bold">{episode.episode}</span>
            </div>

            {/* Episode Info */}
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">
                {episode.title || `Episode ${episode.episode}`}
              </h3>
              {episode.description && (
                <p className="text-gray-400 text-sm line-clamp-2">
                  {episode.description}
                </p>
              )}
              {episode.duration && (
                <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">{episode.duration}</p>
              )}
            </div>

            {/* Play Button */}
            <button className="flex-shrink-0 bg-white text-black rounded-full p-2 hover:bg-gray-200 transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EpisodeList;
