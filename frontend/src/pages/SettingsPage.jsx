import { useUser, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useEffect, useState, useRef } from 'react';
import { clearHistory } from '../utils/continueWatchingStore';
import { deleteUserDB } from '../utils/api';
import useMediaStore from '../store/mediaStore';

function SettingsPage() {
  const { user, isSignedIn } = useUser();
  const { getToken, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { clearAll } = useMediaStore();

  const [isExiting, setIsExiting] = useState(false);

  // Modal states
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    const handleSettingsClose = () => {
      setIsExiting(true);
      setTimeout(() => {
        navigate(-1);
      }, 250);
    };

    window.addEventListener('trigger-settings-close', handleSettingsClose);
    return () => window.removeEventListener('trigger-settings-close', handleSettingsClose);
  }, [navigate]);

  const handleBackToHomeClick = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate('/');
    }, 250);
  };

  useEffect(() => {
    if (!isSignedIn) {
      navigate('/login');
    }
  }, [isSignedIn, navigate]);



  const handleClearHistory = async () => {
    setIsClearing(true);
    try {
      await clearHistory(getToken);
      setShowHistoryModal(false);
      // Optional: you could trigger a re-fetch of the continue watching row here
      // But since it's on the home page, it will just re-fetch when they navigate back
    } catch (error) {
      console.error('Failed to clear history:', error);
      alert('Failed to clear history. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') return;
    setIsDeleting(true);
    try {
      // Deletes from MongoDB AND Clerk on the backend via clerkClient
      await deleteUserDB(getToken); 
      
      // Sign the user out locally since their account no longer exists
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert(`Failed to delete account: ${error.message || 'Unknown error'}`);
      setIsDeleting(false);
    }
  };

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className={`min-h-screen pt-14 sm:pt-16 md:pt-20 bg-white dark:bg-netflix-black transition-colors duration-300 relative`}>
      <div className={`container-custom py-6 sm:py-8 md:py-10 lg:py-12 max-w-4xl ${isExiting ? 'opacity-0 translate-y-8 transition-all duration-300 ease-in' : 'animate-slide-up'}`}>
        
        {/* Page Title */}
        <h1 className="text-gray-900 dark:text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 transition-colors">
          Settings
        </h1>

        {/* Account Info */}
        <div className="bg-gray-50 dark:bg-netflix-gray border border-gray-200 dark:border-transparent rounded-lg p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 transition-colors">
          <h2 className="text-gray-900 dark:text-white text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 transition-colors">
            Account
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm block mb-1 transition-colors">Email</label>
              <p className="text-gray-800 dark:text-white text-sm sm:text-base break-all transition-colors">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
            <div>
              <label className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm block mb-1 transition-colors">Member since</label>
              <p className="text-gray-800 dark:text-white text-sm sm:text-base transition-colors">
                {new Date(user?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-gray-50 dark:bg-netflix-gray border border-gray-200 dark:border-transparent rounded-lg p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 transition-colors">
          <h2 className="text-gray-900 dark:text-white text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 transition-colors">
            Appearance
          </h2>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <h3 className="text-gray-900 dark:text-white font-medium text-sm sm:text-base transition-colors">Theme</h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-0.5 transition-colors">
                Choose your preferred theme
              </p>
            </div>
            <div className="flex space-x-2 sm:space-x-3 md:space-x-4">
              <button
                onClick={() => theme === 'light' && toggleTheme()}
                className={`flex-1 sm:flex-none px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded text-sm sm:text-base font-medium transition-all touch-target ${
                  theme === 'dark'
                    ? 'bg-netflix-red text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => theme === 'dark' && toggleTheme()}
                className={`flex-1 sm:flex-none px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded text-sm sm:text-base font-medium transition-all touch-target ${
                  theme === 'light'
                    ? 'bg-netflix-red text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Light
              </button>
            </div>
          </div>
        </div>


        {/* Privacy & Data Management */}
        <div className="bg-gray-50 dark:bg-netflix-gray border border-red-500/20 rounded-lg p-4 sm:p-5 md:p-6 transition-colors">
          <h2 className="text-red-500 dark:text-red-400 text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 transition-colors">
            Privacy & Data
          </h2>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-gray-900 dark:text-white font-medium text-sm sm:text-base">Clear Watch History</h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-0.5">
                  Reset your "Continue Watching" progress permanently.
                </p>
              </div>
              <button
                onClick={() => setShowHistoryModal(true)}
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded text-sm font-medium transition"
              >
                Clear History
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-red-500 font-medium text-sm sm:text-base">Delete Account</h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-0.5">
                  Permanently delete your account and all associated data.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium transition"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={handleBackToHomeClick}
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-5 py-3 rounded font-medium transition-all text-sm sm:text-base touch-target"
          >
            Back to Home
          </button>
        </div>
      </div>

      {/* MODALS */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-netflix-gray rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Clear Watch History?</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
              Are you sure you want to clear all your watch history? This action cannot be undone and your "Continue Watching" list will be emptied.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition"
                disabled={isClearing}
              >
                Cancel
              </button>
              <button 
                onClick={handleClearHistory}
                className="px-4 py-2 rounded bg-netflix-red text-white hover:bg-red-700 font-medium transition flex items-center justify-center min-w-[80px]"
                disabled={isClearing}
              >
                {isClearing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Clear'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-netflix-gray rounded-xl p-6 max-w-sm w-full shadow-2xl border border-red-500/30">
            <h3 className="text-xl font-bold text-red-500 mb-2">Delete Account</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              This action is permanent and cannot be reversed. All your data, favorites, and history will be wiped.
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 font-medium">
              Please type <strong className="text-gray-900 dark:text-white">DELETE</strong> to confirm.
            </p>
            <input 
              type="text" 
              value={deleteConfirmation}
              onChange={(e) => {
                const val = e.target.value;
                if (/[a-z]/.test(val)) return; // Completely reject lowercase characters
                setDeleteConfirmation(val);
              }}
              placeholder="DELETE"
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 mb-6"
            />
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                }}
                className="px-4 py-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== 'DELETE' || isDeleting}
                className="px-4 py-2 rounded bg-red-600 text-white font-medium transition flex items-center justify-center min-w-[80px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700"
              >
                {isDeleting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default SettingsPage;
