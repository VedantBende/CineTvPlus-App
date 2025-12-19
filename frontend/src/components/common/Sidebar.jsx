import { Link, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { isSignedIn } = useUser();

  const menuItems = [
    { name: 'Home', path: '/', icon: 'home' },
    { name: 'Movies', path: '/movies', icon: 'film' },
    { name: 'TV Shows', path: '/tv', icon: 'tv' },
    ...(isSignedIn ? [{ name: 'My List', path: '/favorites', icon: 'bookmark' }] : []),
    ...(isSignedIn ? [{ name: 'Settings', path: '/settings', icon: 'cog' }] : []),
  ];

  const getIcon = (iconName) => {
    const icons = {
      home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      film: 'M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z',
      tv: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      bookmark: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z',
      cog: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
    };
    return icons[iconName] || icons.home;
  };

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close sidebar on route change
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  return (
    <>
      {/* Overlay - Responsive opacity */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar - Responsive width and padding */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 sm:w-72 md:w-80 lg:w-64 bg-netflix-gray z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 safe-area-top safe-area-bottom`}
      >
        <div className="p-4 sm:p-5 md:p-6 h-full overflow-y-auto">
          {/* Logo - Responsive size */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <Link to="/" className="flex items-center space-x-2" onClick={onClose}>
              <img
                src="/CineLogo.svg"
                alt="CineTv+ Logo"
                className="h-6 w-auto sm:h-7"
              />
              <span className="text-netflix-red text-xl sm:text-2xl font-bold">CineTv+</span>
            </Link>
            
            {/* Close button - Mobile only */}
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-white transition p-2 touch-target"
              aria-label="Close sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation - Responsive spacing */}
          <nav className="space-y-1.5 sm:space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center space-x-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg transition touch-target ${
                  location.pathname === item.path
                    ? 'bg-netflix-red text-white shadow-lg'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getIcon(item.icon)} />
                </svg>
                <span className="text-sm sm:text-base font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User info section - if signed in */}
          {isSignedIn && (
            <div className="mt-auto pt-6 border-t border-gray-700">
              <div className="px-3 py-2">
                <p className="text-gray-400 text-xs sm:text-sm">Signed in</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
