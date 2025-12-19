import { useEffect } from 'react';

export const useClickProtection = () => {
  useEffect(() => {
    const handleClick = (e) => {
      // Check if click is on iframe
      const iframe = document.querySelector('iframe');
      if (iframe && e.target === iframe) {
        console.log('Click detected on iframe');
        // You can add additional logic here
      }
    };

    // Monitor clicks
    document.addEventListener('click', handleClick, true);

    // Block popup attempts
    const originalOpen = window.open;
    window.open = function(...args) {
      console.warn('Popup blocked:', args);
      return null;
    };

    return () => {
      document.removeEventListener('click', handleClick, true);
      window.open = originalOpen;
    };
  }, []);
};
