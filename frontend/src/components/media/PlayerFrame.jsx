import { useEffect, useRef } from 'react';


function PlayerFrame({ 
  tmdbId,
  mediaType, 
  season = null, 
  episode = null,
  autoplay = true,
  resumeTime = 0 
}) {
  const iframeRef = useRef(null);


  const VIDEO_BASE_URL = import.meta.env.VITE_PLAYER_BASE_URL;


  // Build Vidking embed URL
  const getEmbedUrl = () => {
    let url = `${VIDEO_BASE_URL}/${mediaType}/${tmdbId}`;
    
    // For TV shows, add season and episode
    if (mediaType === 'tv' && season && episode) {
      url += `/${season}/${episode}`;
    }
    
    const params = [];


    // Color
    params.push('color=e50914');


    // Autoplay
    if (autoplay) {
      params.push('autoPlay=true');
    }


    // Resume time - only if greater than 10 seconds
    if (resumeTime && resumeTime > 10) {
      const timeInSeconds = Math.floor(resumeTime);
      params.push(`t=${timeInSeconds}`);
      console.log(`🎬 Resuming playback from ${timeInSeconds} seconds`);
    } else {
      console.log(`🎬 Starting playback from beginning`);
    }


    // TV-specific features
    if (mediaType === 'tv') {
      params.push('nextEpisode=true');
      params.push('episodeSelector=true');
    }


    const finalUrl = params.length > 0 ? `${url}?${params.join('&')}` : url;
    console.log('Player URL:', finalUrl);
    
    return finalUrl;
  };


  useEffect(() => {
    // Listen for progress events from player
    const handleMessage = (event) => {
      try {
        if (event.data && typeof event.data === 'object') {
          // Handle player events
          if (event.data.event === 'timeupdate' && event.data.currentTime && event.data.duration) {
            const progressData = {
              tmdbId,
              mediaType,
              season,
              episode,
              currentTime: event.data.currentTime,
              duration: event.data.duration,
              progress: (event.data.currentTime / event.data.duration) * 100,
              lastWatched: new Date().toISOString()
            };


            // Store in localStorage every 10 seconds
            const currentSeconds = Math.floor(event.data.currentTime);
            if (currentSeconds % 10 === 0) {
              const storageKey = `progress_${mediaType}_${tmdbId}${season ? `_${season}_${episode}` : ''}`;
              localStorage.setItem(storageKey, JSON.stringify(progressData));
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
  }, [tmdbId, mediaType, season, episode]);


  const embedUrl = getEmbedUrl();


  return (
    <div className="relative w-full overflow-hidden rounded-none sm:rounded-md md:rounded-lg" style={{ paddingBottom: '56.25%' }}>
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className="absolute top-0 left-0 w-full h-full border-0"
        frameBorder="0"
        sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        title="Video Player"
        referrerPolicy="no-referrer"
        loading="eager"
      />
    </div>
  );
}


export default PlayerFrame;
