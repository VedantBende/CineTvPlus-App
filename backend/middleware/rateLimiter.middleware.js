import rateLimit from 'express-rate-limit';

// Standard rate limit options
const getLimitOptions = (windowMs, max, message) => ({
  windowMs,
  max,
  message: { error: message },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Global Rate Limiter
 * Generous limit for the entire app. 
 * Prevents basic volumetric DoS.
 */
export const globalLimiter = rateLimit(
  getLimitOptions(
    15 * 60 * 1000, // 15 minutes
    1000,           // limit each IP to 1000 requests per windowMs
    'Too many requests from this IP, please try again later.'
  )
);

/**
 * TMDB Proxy Limiter
 * Stricter limit optimized for bursty infinite scroll.
 * Protects TMDB API key from being exhausted.
 */
export const tmdbLimiter = rateLimit(
  getLimitOptions(
    5 * 60 * 1000,  // 5 minutes
    300,            // limit each IP to 300 requests per windowMs
    'Too many TMDB API requests from this IP, please try again later.'
  )
);

/**
 * Database Write Limiter
 * Moderate limit for state mutation endpoints (history, continue watching, etc.)
 */
export const dbWriteLimiter = rateLimit(
  getLimitOptions(
    5 * 60 * 1000,  // 5 minutes
    100,            // limit each IP to 100 requests per windowMs
    'Too many database operations from this IP, please try again later.'
  )
);
