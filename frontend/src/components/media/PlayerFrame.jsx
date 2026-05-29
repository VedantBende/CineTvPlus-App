import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { updateProgress } from '../../utils/progressTracker';
import { getEmbedUrl, getSavedPlayer, savePlayer } from '../../utils/playerConfig';
import PlayerSelector from './PlayerSelector';
import ServerPickerModal from './ServerPickerModal';
import EpisodeSelector from './EpisodeSelector';

function PlayerFrame({ 
  tmdbId,
  mediaType, 
  season = null, 
  episode = null,
  seasons = null,
  autoplay = true,
  resumeTime = 0 
}) {
  const { getToken } = useAuth();
  const iframeRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Player selection — null means no player chosen yet (show modal)
  const [selectedPlayer, setSelectedPlayer] = useState(() => getSavedPlayer(tmdbId, mediaType));
  const [animateButtons, setAnimateButtons] = useState(false);

  // Internal season/episode state (for TV switching without page reload)
  const [activeSeason, setActiveSeason] = useState(() => mediaType === 'tv' ? (season || 1) : null);
  const [activeEpisode, setActiveEpisode] = useState(() => mediaType === 'tv' ? (episode || 1) : null);

  // Sync with props when they change (e.g. URL navigation)
  useEffect(() => {
    setActiveSeason(mediaType === 'tv' ? (season || 1) : null);
    setActiveEpisode(mediaType === 'tv' ? (episode || 1) : null);
    setSelectedPlayer(getSavedPlayer(tmdbId, mediaType));
  }, [season, episode, mediaType, tmdbId]);


  // Build embed URL (only when a player is selected)
  const embedUrl = selectedPlayer
    ? getEmbedUrl(selectedPlayer, tmdbId, mediaType, activeSeason, activeEpisode, {
        autoplay,
        resumeTime,
      })
    : null;


  // Handle player selection (from modal or buttons)
  const handlePlayerSelect = useCallback((playerId) => {
    const isFirstSelection = selectedPlayer === null;
    setSelectedPlayer(playerId);
    savePlayer(playerId, tmdbId, mediaType);

    // Trigger button animation on first selection
    if (isFirstSelection) {
      setTimeout(() => setAnimateButtons(true), 100);
    }
  }, [selectedPlayer, tmdbId, mediaType]);


  // Handle season/episode change from EpisodeSelector
  const handleEpisodeChange = useCallback((newSeason, newEpisode) => {
    setActiveSeason(newSeason);
    setActiveEpisode(newEpisode);

    // Sync URL without a page reload so UI S1 E1 indicators naturally update!
    const params = new URLSearchParams(location.search);
    params.set('season', newSeason);
    params.set('episode', newEpisode);
    navigate(`?${params.toString()}`, { replace: true });
  }, [location.search, navigate]);


  // Listen for progress events from player
  useEffect(() => {
    const handleMessage = (event) => {
      try {
        if (event.data && typeof event.data === 'object') {
          // If the message is wrapped in a "PLAYER_EVENT", extract the inner payload
          const payload = event.data.type === 'PLAYER_EVENT' && event.data.data 
            ? event.data.data 
            : event.data;

          if (payload.event === 'timeupdate' && payload.currentTime && payload.duration) {
            const currentProgress = (payload.currentTime / payload.duration) * 100;
            
            const progressData = {
              tmdbId,
              mediaType,
              season: activeSeason,
              episode: activeEpisode,
              currentTime: payload.currentTime,
              duration: payload.duration,
              progress: currentProgress,
              lastWatched: new Date().toISOString()
            };

            // Calculate seconds to throttle
            const currentSeconds = Math.floor(payload.currentTime);

            // Store in backend every 10 seconds
            if (currentSeconds % 10 === 0 && currentSeconds > 0) {
              updateProgress(getToken, progressData).catch(err => console.error('Failed to save progress:', err));
            }
          }
        }
      } catch (error) {
        // Silently handle errors
      }
    };


    window.addEventListener('message', handleMessage);


    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [tmdbId, mediaType, activeSeason, activeEpisode, getToken]);


  // ─── Shared Event Handler (Delta + Epsilon) ─────────────────────
  useEffect(() => {
    // Only attach if active server is Delta or Epsilon
    if (selectedPlayer !== 'delta' && selectedPlayer !== 'epsilon') return;

    const TRUSTED_ORIGIN = import.meta.env.VITE_PLAYER_DELTA_EPSILON_ORIGIN;

    const handleDeltaEpsilonMessage = (event) => {
      // Strict origin validation — NEVER process other origins
      if (event.origin !== TRUSTED_ORIGIN) return;

      try {
        const message = event.data;
        if (!message || typeof message !== 'object') return;

        // ── MEDIA_DATA: Store stream metadata in localStorage ──
        if (message.type === 'MEDIA_DATA') {
          try {
            const existing = JSON.parse(localStorage.getItem('deltaEpsilonProgress') || '{}');
            const key = mediaType === 'tv'
              ? `tv_${tmdbId}_s${activeSeason}_e${activeEpisode}`
              : `movie_${tmdbId}`;

            localStorage.setItem('deltaEpsilonProgress', JSON.stringify({
              ...existing,
              [key]: {
                ...message.data,
                tmdbId,
                mediaType,
                season: activeSeason,
                episode: activeEpisode,
                server: selectedPlayer,
                last_updated: new Date().toISOString(),
              }
            }));
          } catch {
            // localStorage may be unavailable
          }
          return;
        }

        // ── PLAYER_EVENT: Handle playback lifecycle events ──
        if (message.type === 'PLAYER_EVENT') {
          const payload = message.data || {};
          const eventType = payload.event;

          if (!eventType) return;

          switch (eventType) {
            case 'timeupdate': {
              const { currentTime, duration } = payload;
              if (!currentTime || !duration) break;

              const currentSeconds = Math.floor(currentTime);

              // Throttle: sync to backend every 10s
              if (currentSeconds % 10 === 0 && currentSeconds > 0) {
                const progressData = {
                  tmdbId,
                  mediaType,
                  season: activeSeason,
                  episode: activeEpisode,
                  currentTime,
                  duration,
                  progress: (currentTime / duration) * 100,
                  lastWatched: new Date().toISOString(),
                };
                updateProgress(getToken, progressData).catch(
                  err => console.error('[Delta/Epsilon] Failed to save progress:', err)
                );
              }
              break;
            }

            case 'play':
            case 'pause':
            case 'seeked':
            case 'ended':
              console.debug(`[${selectedPlayer}] Player event: ${eventType}`);
              break;

            default:
              // Silently ignore unknown events
              break;
          }
        }
      } catch {
        // Malformed event data — silently discard
      }
    };

    window.addEventListener('message', handleDeltaEpsilonMessage);
    return () => window.removeEventListener('message', handleDeltaEpsilonMessage);

  }, [selectedPlayer, tmdbId, mediaType, activeSeason, activeEpisode, getToken]);


  // ─── Gamma Event Bridge ────────────────────────────────────────
  useEffect(() => {
    if (selectedPlayer !== 'gamma') return;

    const TRUSTED_ORIGIN = import.meta.env.VITE_PLAYER_GAMMA_ORIGIN;

    const handleGammaMessage = (event) => {
      if (event.origin !== TRUSTED_ORIGIN) return;

      try {
        const message = event.data;
        if (!message || typeof message !== 'object') return;

        // ── MEDIA_DATA: Store stream metadata in localStorage ──
        if (message.type === 'MEDIA_DATA') {
          try {
            const existing = JSON.parse(localStorage.getItem('gammaProgress') || '{}');
            const key = mediaType === 'tv'
              ? `tv_${tmdbId}_s${activeSeason}_e${activeEpisode}`
              : `movie_${tmdbId}`;

            localStorage.setItem('gammaProgress', JSON.stringify({
              ...existing,
              [key]: {
                ...message.data,
                tmdbId,
                mediaType,
                season: activeSeason,
                episode: activeEpisode,
                server: 'gamma',
                last_updated: new Date().toISOString(),
              }
            }));
          } catch {
            // localStorage may be unavailable
          }
          return;
        }

        // ── PLAYER_EVENT: Handle playback lifecycle events ──
        if (message.type === 'PLAYER_EVENT') {
          const payload = message.data || {};
          const eventType = payload.event;

          if (!eventType) return;

          switch (eventType) {
            case 'timeupdate': {
              const { currentTime, duration } = payload;
              if (!currentTime || !duration) break;

              const currentSeconds = Math.floor(currentTime);

              // Throttle: sync to backend every 10s
              if (currentSeconds % 10 === 0 && currentSeconds > 0) {
                const progressData = {
                  tmdbId,
                  mediaType,
                  season: activeSeason,
                  episode: activeEpisode,
                  currentTime,
                  duration,
                  progress: (currentTime / duration) * 100,
                  lastWatched: new Date().toISOString(),
                };
                updateProgress(getToken, progressData).catch(
                  err => console.error('[Gamma] Failed to save progress:', err)
                );
              }
              break;
            }

            case 'play':
            case 'pause':
            case 'seeked':
            case 'ended':
              console.debug(`[gamma] Player event: ${eventType}`);
              break;

            default:
              break;
          }
        }
      } catch {
        // Malformed event data — silently discard
      }
    };

    window.addEventListener('message', handleGammaMessage);
    return () => window.removeEventListener('message', handleGammaMessage);

  }, [selectedPlayer, tmdbId, mediaType, activeSeason, activeEpisode, getToken]);


  // No player selected — show server picker modal
  if (!selectedPlayer) {
    return (
      <div>
        {/* Empty player placeholder */}
        <div className="relative w-full overflow-hidden rounded-none sm:rounded-md md:rounded-lg bg-zinc-900/50" style={{ paddingBottom: '56.25%' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-zinc-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
              </svg>
              <p className="text-zinc-600 text-xs sm:text-sm">Select a server to start watching</p>
            </div>
          </div>
        </div>

        {/* Server Picker Modal */}
        <ServerPickerModal onSelect={handlePlayerSelect} />
      </div>
    );
  }


  // Restore fallback logic: strictly no sandbox parameters to prevent Server Zeta issues.
  const iframeReferrer = selectedPlayer === 'zeta'
    ? 'no-referrer'
    : 'origin';


  return (
    <div>
      {/* Player Container */}
      <div className="relative w-full overflow-hidden rounded-none sm:rounded-md md:rounded-lg" style={{ paddingBottom: '56.25%' }}>
        <iframe
          key={`${selectedPlayer}-${tmdbId}-${activeSeason}-${activeEpisode}`}
          ref={iframeRef}
          src={embedUrl}
          className="absolute top-0 left-0 w-full h-full border-0"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          title="Video Player"
          referrerPolicy={iframeReferrer}
          loading="eager"
        />
      </div>

      {/* Player Selector (server buttons) */}
      <PlayerSelector
        selectedPlayer={selectedPlayer}
        onSelect={handlePlayerSelect}
        animate={animateButtons}
      />

      {/* Episode Selector (TV shows only) */}
      {mediaType === 'tv' && seasons && seasons.length > 0 && (
        <EpisodeSelector
          seasons={seasons}
          currentSeason={activeSeason}
          currentEpisode={activeEpisode}
          onEpisodeChange={handleEpisodeChange}
        />
      )}
    </div>
  );
}


export default PlayerFrame;
