import { PLAYER_LIST } from '../../utils/playerConfig';

function PlayerSelector({ selectedPlayer, onSelect, animate = false }) {
  return (
    <div
      className={`
        flex items-center justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 flex-wrap px-1
        transition-all duration-500 ease-out
        ${animate
          ? 'animate-slide-fade-in'
          : 'opacity-100'
        }
      `}
      style={animate ? {} : undefined}
    >
      {/* Server label */}
      <span className="text-gray-500 text-[0.65rem] sm:text-xs font-medium mr-1 hidden sm:inline">
        Server:
      </span>

      {PLAYER_LIST.map((player) => {
        const isActive = selectedPlayer === player.id;

        return (
          <button
            key={player.id}
            onClick={() => onSelect(player.id)}
            className={`
              relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium
              transition-all duration-200 ease-out
              focus:outline-none
              ${isActive
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-[1.02]'
                : 'bg-gray-800 bg-opacity-80 text-gray-300 hover:bg-gray-700 hover:text-white'
              }
            `}
            title={`Switch to ${player.label}`}
            aria-label={`Switch to ${player.label}`}
            aria-pressed={isActive}
          >
            {/* Active indicator dot */}
            {isActive && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            )}
            {player.label}
          </button>
        );
      })}

      {/* Inline keyframes for slide-fade-in animation */}
      <style>{`
        @keyframes slideFadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-fade-in {
          animation: slideFadeIn 0.45s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default PlayerSelector;
