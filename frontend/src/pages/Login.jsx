import { SignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

function Login() {
  return (
    <div className="min-h-screen bg-netflix-black flex items-center justify-center px-3 sm:px-4 md:px-6 py-8 sm:py-12">
      <div className="max-w-sm sm:max-w-md w-full">
        {/* Header - Responsive */}
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="inline-block group">
            <div className="flex items-center justify-center space-x-2">
              <img
                src="/CineLogo.svg"
                alt="CineTv+ Logo"
                className="h-8 sm:h-10 w-auto group-hover:scale-110 transition-transform"
              />
              <span className="text-netflix-red text-3xl sm:text-4xl font-bold group-hover:text-red-600 transition-colors">
                CineTv+
              </span>
            </div>
          </Link>
          <h2 className="mt-3 sm:mt-4 text-white text-xl sm:text-2xl font-semibold">
            Welcome Back
          </h2>
          <p className="text-gray-400 mt-1.5 sm:mt-2 text-sm sm:text-base">
            Sign in to continue watching
          </p>
        </div>

        {/* Clerk SignIn Component - Responsive Container */}
        <div className="flex justify-center">
          <div className="w-full">
            <SignIn 
              routing="path" 
              path="/login"
              signUpUrl="/register"
              afterSignInUrl="/"
              redirectUrl="/"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "w-full shadow-2xl",
                  formButtonPrimary: "bg-netflix-red hover:bg-red-700 text-sm sm:text-base",
                  formFieldInput: "text-sm sm:text-base",
                  footerActionLink: "text-netflix-red hover:text-red-600",
                }
              }}
            />
          </div>
        </div>

        {/* Sign Up Link - Responsive */}
        <p className="text-center text-gray-400 mt-4 sm:mt-6 text-xs sm:text-sm md:text-base">
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="text-netflix-red hover:text-red-600 hover:underline font-medium transition-colors"
          >
            Sign up now
          </Link>
        </p>

        {/* Back to Home - Mobile friendly */}
        <div className="text-center mt-4 sm:mt-6">
          <Link 
            to="/" 
            className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-xs sm:text-sm touch-target"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
