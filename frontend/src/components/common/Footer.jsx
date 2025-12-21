import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-netflix-black border-t border-gray-800 mt-auto">
      <div className="container-custom py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-netflix-red">
              CineTv+
            </h3>
            <p className="text-xs sm:text-sm text-gray-400">
              Stream any content in it's original language.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2 sm:space-y-3">
            <h4 className="text-sm sm:text-base font-semibold text-white mb-2 sm:mb-3">
              Quick Links
            </h4>
            <nav className="flex flex-col space-y-1.5 sm:space-y-2">
              <Link
                to="/"
                className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link
                to="/movies"
                className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
              >
                Movies
              </Link>
              <Link
                to="/tv-shows"
                className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
              >
                TV Shows
              </Link>
            </nav>
          </div>

          {/* Account */}
          <div className="space-y-2 sm:space-y-3">
            <h4 className="text-sm sm:text-base font-semibold text-white mb-2 sm:mb-3">
              Account
            </h4>
            <nav className="flex flex-col space-y-1.5 sm:space-y-2">
              <Link
                to="/favorites"
                className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
              >
                My List
              </Link>
              <Link
                to="/settings"
                className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
              >
                Settings
              </Link>
            </nav>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-800">
          <p className="text-xs sm:text-sm text-gray-500 text-center">
            © 2025 CineTv+ All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
