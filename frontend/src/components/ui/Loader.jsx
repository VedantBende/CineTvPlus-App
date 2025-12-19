function Loader({ size = 'md', text = 'Loading...' }) {
  const sizeClasses = {
    sm: 'w-6 h-6 sm:w-8 sm:h-8 border-2',
    md: 'w-10 h-10 sm:w-12 sm:h-12 border-2 sm:border-3',
    lg: 'w-14 h-14 sm:w-16 sm:h-16 border-3 sm:border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-10 md:py-12">
      <div
        className={`${sizeClasses[size]} border-netflix-red border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      ></div>
      {text && (
        <p className="text-gray-400 mt-3 sm:mt-4 text-xs sm:text-sm font-medium">{text}</p>
      )}
    </div>
  );
}

export default Loader;
