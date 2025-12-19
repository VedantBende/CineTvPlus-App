function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-red-900/20 border border-red-900 rounded-lg p-6 max-w-md w-full">
        <div className="flex items-start space-x-3">
          <svg
            className="w-6 h-6 text-netflix-red flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">Error</h3>
            <p className="text-gray-300 text-sm">
              {message || 'Something went wrong. Please try again.'}
            </p>
          </div>
        </div>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 w-full bg-netflix-red hover:bg-red-700 text-white px-4 py-2 rounded transition"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorMessage;
