import { useState } from 'react';

function OptimizedImage({ src, alt, className, placeholder = 'blur' }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="relative">
      {/* Blur placeholder */}
      {!loaded && !error && (
        <div className={`absolute inset-0 bg-gray-800 animate-pulse ${className}`} />
      )}
      
      {/* Actual image */}
      {!error && (
        <img
          src={src}
          alt={alt}
          className={`${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          loading="lazy"
        />
      )}
      
      {/* Error fallback */}
      {error && (
        <div className={`${className} bg-gray-800 flex items-center justify-center`}>
          <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default OptimizedImage;
