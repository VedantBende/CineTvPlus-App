function ErrorMessage({ message, onRetry }) {
  const isMaintenance = message?.toLowerCase().includes('maintainance') || message?.toLowerCase().includes('maintenance');

  const containerClasses = isMaintenance 
    ? "bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-6 max-w-md w-full transition-colors"
    : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg p-6 max-w-md w-full transition-colors";

  const iconClasses = isMaintenance
    ? "w-6 h-6 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5"
    : "w-6 h-6 text-netflix-red flex-shrink-0 mt-0.5";

  const titleText = isMaintenance ? "Service Notice" : "Error";

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className={containerClasses}>
        <div className="flex items-start space-x-3">
          {isMaintenance ? (
            <svg
              className={iconClasses}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              className={iconClasses}
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
          )}
          <div className="flex-1">
            <h3 className="text-gray-900 dark:text-white font-semibold mb-1 transition-colors">
              {titleText}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm transition-colors">
              {message || 'Something went wrong. Please try again.'}
            </p>
          </div>
        </div>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className={`mt-4 w-full px-4 py-2 rounded transition font-semibold ${
              isMaintenance 
                ? 'bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-100' 
                : 'bg-netflix-red hover:bg-red-700 text-white'
            }`}
          >
            {isMaintenance ? 'Refresh' : 'Try Again'}
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorMessage;
