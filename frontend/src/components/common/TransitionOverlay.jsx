import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const VIDEOS = {
  desktop: {
    toAnime: import.meta.env.VITE_TRANSITION_VIDEO_DESKTOP_TO_ANIME,
    toStandard: import.meta.env.VITE_TRANSITION_VIDEO_DESKTOP_TO_STANDARD
  },
  mobile: {
    toAnime: import.meta.env.VITE_TRANSITION_VIDEO_MOBILE_TO_ANIME,
    toStandard: import.meta.env.VITE_TRANSITION_VIDEO_MOBILE_TO_STANDARD
  }
};

const TransitionOverlay = () => {
  const { transitionVideo, isVideoPlaying, executeModeSwap, endVideoTransition } = useTheme();
  const videoRef = useRef(null);
  const [hasSwapped, setHasSwapped] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // Check on initial mount
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (transitionVideo) {
      setHasSwapped(false);
      setIsFadingOut(false);
    }
  }, [transitionVideo]);

  // Remove the early return so the wrapper stays in the DOM, allowing the fade-in transition

  const handleTimeUpdate = () => {
    if (!videoRef.current || hasSwapped) return;

    const { currentTime, duration } = videoRef.current;
    // Swap the mode immediately after the video starts playing
    // This allows the async data to load in the background while the video plays!
    if (duration > 0 && currentTime >= 0.1) {
      executeModeSwap();
      setHasSwapped(true);
    }
  };

  const handleEnded = () => {
    setIsFadingOut(true);
    // Allow the fade-out CSS transition to finish before unmounting
    setTimeout(() => {
      endVideoTransition();
      setIsFadingOut(false);
    }, 500);
  };

  // We only start fading in if transitionVideo is active
  const isVisible = isVideoPlaying && !isFadingOut;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-2xl transition-opacity duration-500 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {transitionVideo && (
        <video
          key={transitionVideo + (isMobile ? '-mobile' : '-desktop')} // Force remount if size changes during transition
          ref={videoRef}
          src={isMobile ? VIDEOS.mobile[transitionVideo] : VIDEOS.desktop[transitionVideo]}
          autoPlay
          playsInline
          muted={false} // Unmuted per user request
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          className="w-full h-full object-cover pointer-events-none mix-blend-screen"
        />
      )}
    </div>
  );
};

export default TransitionOverlay;
