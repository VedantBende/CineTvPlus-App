import { useState, useEffect } from 'react';
import { PLAYER_LIST } from '../../utils/playerConfig';

function ServerPickerModal({ onSelect }) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Trigger entrance animation on mount
  useEffect(() => {
    const timer = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  const handleSelect = (playerId) => {
    setSelectedId(playerId);

    // Brief delay for selection feedback before closing
    setTimeout(() => {
      onSelect(playerId);
    }, 250);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.80)', backdropFilter: 'blur(8px)' }}
    >
      {/* Modal Card */}
      <div
        className={`w-full max-w-md transition-all duration-400 ease-out ${
          isVisible
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
        }`}
        style={{ transitionDelay: '100ms' }}
      >
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          {/* Server Icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-red-600/15 border border-red-600/25 mb-4 sm:mb-5">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
            </svg>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 sm:mb-2">
            Select Streaming Server
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm">
            Choose your preferred server to start watching
          </p>
        </div>

        {/* Server Options */}
        <div className="space-y-2.5 sm:space-y-3">
          {PLAYER_LIST.map((player, index) => {
            const isSelected = selectedId === player.id;

            return (
              <button
                key={player.id}
                onClick={() => handleSelect(player.id)}
                disabled={selectedId !== null}
                className={`
                  w-full group relative overflow-hidden rounded-xl p-3.5 sm:p-4
                  text-left transition-all duration-300 ease-out
                  border focus:outline-none
                  ${isSelected
                    ? 'bg-red-600/20 border-red-500/60 scale-[0.98]'
                    : selectedId !== null
                      ? 'bg-zinc-900/50 border-zinc-800/50 opacity-40 cursor-not-allowed'
                      : 'bg-zinc-900/80 border-zinc-700/50 hover:bg-zinc-800/90 hover:border-red-500/40 hover:scale-[1.01] active:scale-[0.98]'
                  }
                `}
                style={{ transitionDelay: `${(index + 1) * 80}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-3.5">
                    {/* Server indicator */}
                    <div className={`
                      flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center
                      transition-colors duration-300
                      ${isSelected
                        ? 'bg-red-600 text-white'
                        : 'bg-zinc-800 text-gray-400 group-hover:bg-red-600/20 group-hover:text-red-400'
                      }
                    `}>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>

                    {/* Text */}
                    <div>
                      <h3 className={`font-semibold text-sm sm:text-base transition-colors duration-200 ${
                        isSelected ? 'text-red-400' : 'text-white'
                      }`}>
                        {player.label}
                      </h3>
                      <p className="text-gray-500 text-[0.65rem] sm:text-xs mt-0.5">
                        {player.description}
                      </p>
                    </div>
                  </div>

                  {/* Selection indicator */}
                  <div className={`
                    flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center
                    transition-all duration-300
                    ${isSelected
                      ? 'border-red-500 bg-red-600'
                      : 'border-zinc-600 group-hover:border-red-500/40'
                    }
                  `}>
                    {isSelected && (
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer hint */}
        <p className="text-center text-gray-600 text-[0.6rem] sm:text-xs mt-5 sm:mt-6">
          You can switch servers anytime while watching
        </p>
      </div>
    </div>
  );
}

export default ServerPickerModal;
