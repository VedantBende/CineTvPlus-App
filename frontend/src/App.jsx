import { ClerkProvider, useUser, useAuth } from '@clerk/clerk-react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import router from './router';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import useAuthStore from './store/authStore';
import UpdatePrompt from './components/pwa/UpdatePrompt';
import OfflineIndicator from './components/pwa/OfflineIndicator';
import TransitionOverlay from './components/common/TransitionOverlay';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Component to sync user after auth
function UserSync() {
  const { user: clerkUser, isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { 
    user: mongoUser, 
    isSyncing, 
    syncError, 
    setUser: setMongoUser, 
    setSyncing, 
    setSyncError 
  } = useAuthStore();
  const hasSynced = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const syncUser = async () => {
      // ONLY sync if: isSignedIn, NOT already syncing, NO persistent error, and NOT already synced this session
      if (!isLoaded || !isSignedIn || isSyncing || syncError || hasSynced.current) return;

      hasSynced.current = true;
      console.log('🔄 UserSync starting...');
      setSyncing(true);

      try {
        const token = await getToken();
        console.log('📡 Syncing with backend...');
        
        const response = await axios.post(
          `${API_URL}/auth/sync`,
          {
            email: clerkUser?.primaryEmailAddress?.emailAddress,
            name: clerkUser?.fullName || clerkUser?.firstName
          },
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 15000 // 15s timeout
          }
        );

        if (isMounted) {
          console.log('✅ User synced successfully...');
          setMongoUser(response.data.user);
        }
      } catch (error) {
        if (isMounted) {
          const backendError = error.response?.data;
          let errMsg = 'Sync failed';
          
          if (backendError) {
            errMsg = backendError.message || backendError.error || JSON.stringify(backendError);
          } else {
            errMsg = error.message;
          }
          
          console.error('❌ Failed to sync user:', errMsg, backendError);
          setSyncError(errMsg);
        }
      } finally {
        if (isMounted) {
          setSyncing(false);
        }
      }
    };

    syncUser();

    return () => {
      isMounted = false;
    };
  }, [isSignedIn, isLoaded, getToken, clerkUser, setMongoUser, setSyncing, setSyncError]);

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
        <TransitionOverlay />
        <OfflineIndicator />
        <UpdatePrompt />
        <UserSync />
        <RouterProvider router={router} />
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default App;
