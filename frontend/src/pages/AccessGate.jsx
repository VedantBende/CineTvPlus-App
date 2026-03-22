import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';

const AccessGate = () => {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    // If user is already signed in, don't show the gate
    if (isLoaded && isSignedIn) {
      navigate('/', { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);

  const handleAction = (path) => {
    localStorage.setItem('hasVisited', 'true');
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-netflix-black text-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background Cinematic Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 via-netflix-black to-netflix-black" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-2xl w-full z-10 flex flex-col items-center text-center animate-fade-up">
        {/* Logo */}
        <div className="flex items-center space-x-2 mb-8 transform hover:scale-105 transition-transform cursor-default">
          <img
            src="/CineLogo.svg"
            alt="CineTv+"
            className="w-12 h-12 sm:w-16 sm:h-16"
          />
          <span className="text-netflix-red text-4xl sm:text-5xl font-bold tracking-tighter">
            CineTv+
          </span>
        </div>

        {/* Content Card */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-8 sm:p-12 rounded-2xl backdrop-blur-md shadow-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Welcome to CineTv+
          </h1>
          
          <div className="space-y-6 text-gray-300 text-base sm:text-lg leading-relaxed text-left">
            <p className="border-l-4 border-netflix-red pl-4 py-1 italic">
              This platform is a controlled-access demo project.
            </p>
            
            <p>
              To explore CineTv+, you must first create an account and request access from the developer.
            </p>

            <div className="bg-black/40 p-6 rounded-xl border border-zinc-800/50">
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-netflix-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                After signing up:
              </h3>
              <ul className="space-y-2 text-sm sm:text-base">
                <li className="flex items-start">
                  <span className="text-netflix-red mr-2">•</span>
                  Your request will be reviewed
                </li>
                <li className="flex items-start">
                  <span className="text-netflix-red mr-2">•</span>
                  Access will only be granted after approval
                </li>
                <li className="flex items-start">
                  <span className="text-netflix-red mr-2">•</span>
                  Access can be revoked anytime
                </li>
              </ul>
            </div>

            <p className="text-gray-400 text-sm italic text-center">
              This system is designed to restrict public access and allow only selected users to explore the project.
            </p>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center w-full">
            <button
              onClick={() => handleAction('/login')}
              className="px-8 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition-all transform hover:scale-[1.02] active:scale-95 border border-zinc-700 shadow-xl w-full sm:w-auto"
            >
              Login
            </button>
            <button
              onClick={() => handleAction('/register')}
              className="px-10 py-3.5 bg-netflix-red hover:bg-red-700 text-white font-bold rounded-lg transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-red-900/20 w-full sm:w-auto"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessGate;
