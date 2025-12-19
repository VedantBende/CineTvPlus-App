import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 mt-auto">
      <div className="container-custom py-4 sm:py-6 md:py-8">
        {/* Responsive grid: 1 column mobile, 2 columns tablet, 3 columns desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          
          {/* About */}
          <div className="text-center sm:text-left">
            <h3 className="text-white font-bold mb-2 sm:mb-3 md:mb-4 text-sm sm:text-base md:text-lg">CineTv+</h3>
            <p className="text-gray-400 text-[0.65rem] sm:text-xs md:text-sm leading-relaxed">
              Your streaming platform powered by live data.
            </p>
          </div>

          {/* Links */}
          <div className="text-center sm:text-left">
            <h4 className="text-white font-semibold mb-2 sm:mb-3 md:mb-4 text-xs sm:text-sm md:text-base">Quick Links</h4>
            <ul className="space-y-1 sm:space-y-1.5 md:space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white text-[0.65rem] sm:text-xs md:text-sm transition touch-target inline-block py-0.5 sm:py-1">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/movies" className="text-gray-400 hover:text-white text-[0.65rem] sm:text-xs md:text-sm transition touch-target inline-block py-0.5 sm:py-1">
                  Movies
                </Link>
              </li>
              <li>
                <Link to="/tv" className="text-gray-400 hover:text-white text-[0.65rem] sm:text-xs md:text-sm transition touch-target inline-block py-0.5 sm:py-1">
                  TV Shows
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="text-center sm:text-left sm:col-span-2 md:col-span-1">
            <h4 className="text-white font-semibold mb-2 sm:mb-3 md:mb-4 text-xs sm:text-sm md:text-base">Account</h4>
            <ul className="space-y-1 sm:space-y-1.5 md:space-y-2">
              <li>
                <Link to="/favorites" className="text-gray-400 hover:text-white text-[0.65rem] sm:text-xs md:text-sm transition touch-target inline-block py-0.5 sm:py-1">
                  My List
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-gray-400 hover:text-white text-[0.65rem] sm:text-xs md:text-sm transition touch-target inline-block py-0.5 sm:py-1">
                  Settings
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-800 mt-4 sm:mt-6 md:mt-8 pt-3 sm:pt-4 md:pt-6 text-center">
          <p className="text-gray-400 text-[0.65rem] sm:text-xs md:text-sm">
            © 2025 CineTv+ All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
