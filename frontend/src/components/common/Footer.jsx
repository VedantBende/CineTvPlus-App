import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="mt-auto py-8 sm:py-12 px-4 sm:px-8 border-t border-gray-200 dark:border-gray-800/50 bg-white dark:bg-netflix-black transition-colors duration-300">
      <div className="container-custom">
        <div className="flex flex-col space-y-3">
          <Link to="/" className="flex items-center space-x-2 w-max mb-1">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">
              CineTv+
            </h3>
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-3xl transition-colors">
            This site does not store any files on our server, we only linked to the media which is hosted on 3rd party services.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
            vedantbende.dev@gmail.com
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
