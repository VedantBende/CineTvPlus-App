/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to 'dark'
    return localStorage.getItem('theme') || 'dark';
  });

  const [isAnimeMode, setIsAnimeMode] = useState(() => {
    return localStorage.getItem('isAnimeMode') === 'true';
  });

  const [transitionVideo, setTransitionVideo] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (isAnimeMode) {
      root.classList.add('anime-theme');
    } else {
      root.classList.remove('anime-theme');
    }
    localStorage.setItem('isAnimeMode', isAnimeMode);
  }, [isAnimeMode]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const toggleAnimeMode = () => {
    if (isAnimeMode) {
      setTransitionVideo('toStandard');
    } else {
      setTransitionVideo('toAnime');
    }
    setIsVideoPlaying(true);
  };

  const executeModeSwap = () => {
    setIsAnimeMode(prev => {
      const newValue = !prev;
      localStorage.setItem('isAnimeMode', newValue);
      return newValue;
    });
  };

  const endVideoTransition = () => {
    setTransitionVideo(null);
    setIsVideoPlaying(false);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      isAnimeMode, 
      toggleAnimeMode,
      transitionVideo,
      isVideoPlaying,
      executeModeSwap,
      endVideoTransition
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
