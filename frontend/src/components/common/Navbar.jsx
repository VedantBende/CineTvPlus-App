import { Link, useNavigate } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';

function Navbar() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-gradient-to-b from-black to-transparent">
      <div className="container-custom">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
          {/* Logo - Responsive */}
          <Link to="/" className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0" onClick={closeMobileMenu}>
            <img
              src="/CineLogo.svg"
              alt="CineTv+ Logo"
              className="h-6 w-auto sm:h-7 md:h-8"
            />
            <span className="text-netflix-red text-xl sm:text-2xl md:text-3xl font-bold">
              CineTv+
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            <Link to="/" className="text-white hover:text-gray-300 transition text-sm lg:text-base font-medium">
              Home
            </Link>
            <Link to="/movies" className="text-white hover:text-gray-300 transition text-sm lg:text-base font-medium">
              Movies
            </Link>
            <Link to="/tv" className="text-white hover:text-gray-300 transition text-sm lg:text-base font-medium">
              TV Shows
            </Link>
            {isSignedIn && (
              <Link to="/favorites" className="text-white hover:text-gray-300 transition text-sm lg:text-base font-medium">
                My List
              </Link>
            )}
          </div>

          {/* Right Side - Responsive */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            {/* Theme Toggle - Hidden on small mobile */}
            <div className="hidden xs:flex items-center">
              <ThemeToggle />
            </div>

            {/* Search - Responsive */}
            <div className="relative flex items-center">
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="bg-gray-800 bg-opacity-90 text-white px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 rounded-l border-0 focus:outline-none focus:ring-2 focus:ring-netflix-red w-32 xs:w-40 sm:w-48 md:w-64 text-sm backdrop-blur-sm"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="bg-netflix-red text-white px-2 py-1.5 sm:px-2.5 sm:py-2 md:px-3 md:py-2 rounded-r hover:bg-red-700 transition flex items-center justify-center touch-target"
                    aria-label="Search"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="ml-1 sm:ml-2 text-gray-400 hover:text-white flex items-center justify-center touch-target p-1"
                    aria-label="Close search"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="text-white hover:text-gray-300 transition p-1.5 sm:p-2 flex items-center justify-center touch-target"
                  aria-label="Search"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}
            </div>

            {/* User Section - Responsive */}
            {isSignedIn ? (
              <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
                <Link 
                  to="/settings" 
                  className="text-white hover:text-gray-300 transition p-2 flex items-center justify-center touch-target"
                  aria-label="Settings"
                >
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>
                <div className="flex items-center">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="hidden md:block bg-netflix-red hover:bg-red-700 text-white px-3 py-1.5 lg:px-4 lg:py-2 rounded transition font-medium text-sm lg:text-base"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white p-1.5 sm:p-2 flex items-center justify-center touch-target"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu - Enhanced */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-black bg-opacity-98 border-t border-gray-800 backdrop-blur-md animate-slide-down">
            <div className="py-2 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
              <Link 
                to="/" 
                className="block text-white hover:text-gray-300 hover:bg-gray-800 py-3 px-4 transition text-base font-medium touch-target" 
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              <Link 
                to="/movies" 
                className="block text-white hover:text-gray-300 hover:bg-gray-800 py-3 px-4 transition text-base font-medium touch-target" 
                onClick={closeMobileMenu}
              >
                Movies
              </Link>
              <Link 
                to="/tv" 
                className="block text-white hover:text-gray-300 hover:bg-gray-800 py-3 px-4 transition text-base font-medium touch-target" 
                onClick={closeMobileMenu}
              >
                TV Shows
              </Link>
              {isSignedIn ? (
                <>
                  <Link 
                    to="/favorites" 
                    className="block text-white hover:text-gray-300 hover:bg-gray-800 py-3 px-4 transition text-base font-medium touch-target" 
                    onClick={closeMobileMenu}
                  >
                    My List
                  </Link>
                  <Link 
                    to="/settings" 
                    className="block text-white hover:text-gray-300 hover:bg-gray-800 py-3 px-4 transition text-base font-medium touch-target" 
                    onClick={closeMobileMenu}
                  >
                    Settings
                  </Link>
                  <div className="border-t border-gray-800 my-2"></div>
                  <div className="px-4 py-3 flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Account</span>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </>
              ) : (
                <>
                  <div className="border-t border-gray-800 my-2"></div>
                  <button
                    onClick={() => {
                      navigate('/login');
                      closeMobileMenu();
                    }}
                    className="w-full bg-netflix-red hover:bg-red-700 text-white px-4 py-3 mx-4 my-2 rounded transition font-medium text-base"
                    style={{ width: 'calc(100% - 2rem)' }}
                  >
                    Sign In
                  </button>
                </>
              )}
              
              {/* Theme Toggle in Mobile Menu */}
              <div className="xs:hidden border-t border-gray-800 mt-2 pt-2 px-4 pb-2">
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-400 text-sm">Theme</span>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
