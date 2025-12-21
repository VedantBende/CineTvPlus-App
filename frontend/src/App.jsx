import { ClerkProvider, useUser, useAuth } from '@clerk/clerk-react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import router from './router';
import { useEffect, useState } from 'react';
import axios from 'axios';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Get API URL
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }

  const protocol = window.location.protocol;
  const hostname = window.location.hostname;

  return `${protocol}//${hostname}:5000/api`;
};

const API_URL = getApiUrl();

// Component to sync user after auth
function UserSync() {
  const { isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    const syncUser = async () => {
      if (isLoaded && isSignedIn) {
        try {
          const token = await getToken();
          await axios.post(
            `${API_URL}/user/sync`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          console.log('✅ User synced to MongoDB');
        } catch (error) {
          console.error('Failed to sync user:', error.message);
        }
      }
    };

    syncUser();
  }, [isSignedIn, isLoaded, getToken]);

  return null;
}

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // Check if splash has been shown before
    const hasSeenSplash = localStorage.getItem('hasSeenSplash');
    return !hasSeenSplash;
  });

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        // Mark splash as seen
        localStorage.setItem('hasSeenSplash', 'true');
      }, 5000); // 5 seconds

      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  if (showSplash) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-netflix-black overflow-hidden">
        <div className="flex flex-col items-center text-center">
          <img
            src="/CineLogo.svg" // logo
            alt="CineTv+"
            className="w-20 h-20 sm:w-24 sm:h-24 mb-4"
          />
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-wide text-red-600 mb-3">
            CineTv+
          </h1>
          <p className="text-gray-300 text-base sm:text-lg mb-5">
            Stream Content in Its Original Language
          </p>

          {/* Loader */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-bounce [animation-delay:-0.2s]" />
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-bounce [animation-delay:-0.1s]" />
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-bounce" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <ThemeProvider>
        <UserSync />
        <RouterProvider router={router} />
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default App;
