import { useState, useEffect } from 'react';

export const useDevToolsDetector = () => {
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

  useEffect(() => {
    let checkInterval;

    const checkDevTools = () => {
      // 1. Viewport Difference Detection
      // A safety threshold of 250px vertically and horizontally aggressively ignores all standard bookmarks/sidebars
      const widthThreshold = 250;
      const heightThreshold = 300; 
      
      const widthDiff = window.outerWidth - window.innerWidth > widthThreshold;
      const heightDiff = window.outerHeight - window.innerHeight > heightThreshold;

      let detected = false;
      
      if (widthDiff || heightDiff) {
        detected = true;
      }

      setIsDevToolsOpen(detected);
    };

    // Check periodically without stopping UI rendering
    checkInterval = setInterval(checkDevTools, 500);
    
    // Check aggressively on resize events
    window.addEventListener('resize', checkDevTools);

    // Initial check
    checkDevTools();

    return () => {
      clearInterval(checkInterval);
      window.removeEventListener('resize', checkDevTools);
    };
  }, []);

  return isDevToolsOpen;
};
