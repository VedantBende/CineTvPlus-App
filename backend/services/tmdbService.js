/**
 * TMDB Service — Production-ready API client
 * 
 * Features:
 * - DNS bypass via Google Public DNS (fixes ISP blocks in India/restricted regions)
 * - In-memory TTL cache (node-cache)
 * - Retry with exponential backoff
 * - Request timeout
 * - Proper User-Agent header
 */

import dns from 'dns';
import http from 'http';
import https from 'https';
import axios from 'axios';
import NodeCache from 'node-cache';

// ─── DNS-over-HTTPS BYPASS ────────────────────────────────────
// ISPs in India often block TMDB at the DNS level AND filter
// raw DNS queries to 8.8.8.8. DNS-over-HTTPS (DoH) sends
// DNS lookups over HTTPS (port 443), making them unblockable.
//
// IMPORTANT: We use direct IP addresses for DoH servers to avoid
// the chicken-and-egg problem (can't resolve dns.google if DNS is blocked).

const dnsCache = new Map(); // hostname -> { ip, expiry }

// DoH endpoints using DIRECT IP ADDRESSES (no DNS needed to reach them)
const DOH_ENDPOINTS = [
  { url: 'https://8.8.8.8/resolve', host: 'dns.google' },
  { url: 'https://1.1.1.1/dns-query', host: 'cloudflare-dns.com' }
];

/**
 * Resolve a hostname using DNS-over-HTTPS (Google/Cloudflare).
 * Uses direct IPs to avoid circular DNS dependency.
 * Results are cached for at least 5 minutes.
 */
async function resolveViaDoH(hostname) {
  // Check DNS cache first
  const cached = dnsCache.get(hostname);
  if (cached && cached.expiry > Date.now()) {
    return cached.ip;
  }

  for (const { url, host } of DOH_ENDPOINTS) {
    try {
      const resp = await axios.get(url, {
        params: { name: hostname, type: 'A' },
        headers: {
          'Accept': 'application/dns-json',
          'Host': host  // Required for TLS certificate validation
        },
        timeout: 5000,
        // Skip the custom agent for DoH requests themselves (use system default)
        httpAgent: undefined,
        httpsAgent: new https.Agent({ rejectUnauthorized: true })
      });

      const answers = resp.data?.Answer;
      if (answers && answers.length > 0) {
        // Find A record (type 1)
        const aRecord = answers.find(a => a.type === 1);
        if (aRecord) {
          const ip = aRecord.data;
          const ttl = Math.max(aRecord.TTL || 300, 300); // Min 5 min cache
          dnsCache.set(hostname, { ip, expiry: Date.now() + ttl * 1000 });
          console.log(`🌐 DoH resolved ${hostname} → ${ip} (TTL: ${ttl}s)`);
          return ip;
        }
      }
    } catch (err) {
      console.warn(`⚠️ DoH via ${url} failed: ${err.message}`);
    }
  }

  // LAST RESORT: Hardcoded known IPs for api.themoviedb.org
  // These are TMDB's Cloudflare-backed IPs (may change, but work as fallback)
  if (hostname === 'api.themoviedb.org') {
    console.warn('🔧 Using hardcoded fallback IP for api.themoviedb.org');
    return '13.225.89.10';
  }

  throw new Error(`DNS-over-HTTPS failed to resolve: ${hostname}`);
}

console.log('🌐 DNS-over-HTTPS bypass active (Google 8.8.8.8 DoH + Cloudflare 1.1.1.1 DoH)');

// ─── RESOLVED IP STATE ───────────────────────────────────────
let tmdbResolvedIp = null;

/**
 * Ensure we have a resolved IP for api.themoviedb.org.
 * Called before every request (uses cached IP most of the time).
 */
async function ensureTmdbIp() {
  if (!tmdbResolvedIp) {
    tmdbResolvedIp = await resolveViaDoH('api.themoviedb.org');
  }
  return tmdbResolvedIp;
}

// Refresh the resolved IP every 5 minutes
setInterval(async () => {
  try {
    tmdbResolvedIp = await resolveViaDoH('api.themoviedb.org');
  } catch (e) {
    console.warn('⚠️ Failed to refresh TMDB IP:', e.message);
  }
}, 5 * 60 * 1000);

// ─── CACHE SETUP ─────────────────────────────────────────────
const cache = new NodeCache({
  stdTTL: 600,       // Default: 10 minutes
  checkperiod: 120,  // Cleanup every 2 minutes
  useClones: false   // Don't clone on get (faster)
});

// Cache TTLs by category
const CACHE_TTLS = {
  list: 600,      // 10 min for trending/popular/top_rated
  detail: 3600,   // 1 hour for movie/TV details
  search: 300     // 5 min for search results
};

// ─── AXIOS CONFIG ────────────────────────────────────────────
// NOTE: TMDB_API_KEY is read from process.env at request time, NOT module load time.
// This is critical because this module may be imported before dotenv.config() runs.

/**
 * Create an axios request config that connects directly to the resolved IP
 * with proper Host header and TLS servername for certificate validation.
 */
function getTmdbRequestConfig(path, params = {}) {
  const apiKey = process.env.TMDB_API_KEY; // Read at request time
  return {
    url: `https://${tmdbResolvedIp}/3${path}`,
    method: 'get',
    params: { ...params, api_key: apiKey },
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'CineTvPlus/1.0 (Backend Proxy)',
      'Host': 'api.themoviedb.org'
    },
    httpsAgent: new https.Agent({
      servername: 'api.themoviedb.org', // TLS SNI — critical for cert validation
      rejectUnauthorized: true
    }),
    timeout: 8000
  };
}

// ─── RETRY LOGIC ─────────────────────────────────────────────
/**
 * Fetch from TMDB with retry + cache.
 * @param {string} path    - TMDB API path, e.g. '/trending/movie/week'
 * @param {object} params  - Query params (excluding api_key)
 * @param {object} options - { cacheTTL, cacheKey }
 */
async function tmdbFetch(path, params = {}, options = {}) {
  const { cacheTTL = CACHE_TTLS.list, cacheKey: customCacheKey } = options;
  
  // Build cache key
  const cacheKey = customCacheKey || `tmdb:${path}:${JSON.stringify(params)}`;
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`⚡ Cache HIT: ${cacheKey}`);
    return cached;
  }
  
  // Ensure we have a resolved IP
  await ensureTmdbIp();
  
  console.log(`🎬 TMDB Fetch: ${path}`, params);
  
  // Retry loop (initial + 3 retries = 4 attempts total)
  const MAX_RETRIES = 3;
  let lastError;
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        const delay = 500 * Math.pow(2, attempt - 1); // 500ms, 1000ms, 2000ms
        console.log(`🔄 Retry ${attempt}/${MAX_RETRIES} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const config = getTmdbRequestConfig(path, params);
      const response = await axios(config);
      
      // Cache the result
      cache.set(cacheKey, response.data, cacheTTL);
      console.log(`✅ TMDB OK: ${path} (cached for ${cacheTTL}s)`);
      
      return response.data;
    } catch (error) {
      lastError = error;
      
      // Don't retry on 4xx errors (client errors from TMDB), EXCEPT 429 Too Many Requests
      if (error.response && error.response.status >= 400 && error.response.status < 500 && error.response.status !== 429) {
        throw error;
      }
      
      console.warn(`⚠️ TMDB attempt ${attempt + 1} failed: ${error.message}`);
    }
  }
  
  // All retries exhausted
  throw lastError;
}

// ─── PUBLIC API ──────────────────────────────────────────────

// Trending
export async function fetchTrending(mediaType, timeWindow = 'week', page = 1) {
  return tmdbFetch(`/trending/${mediaType}/${timeWindow}`, { page }, {
    cacheTTL: CACHE_TTLS.list
  });
}

// Popular
export async function fetchPopular(mediaType, page = 1) {
  return tmdbFetch(`/${mediaType}/popular`, { language: 'en-US', page }, {
    cacheTTL: CACHE_TTLS.list
  });
}

// Top Rated
export async function fetchTopRated(mediaType, page = 1) {
  return tmdbFetch(`/${mediaType}/top_rated`, { language: 'en-US', page }, {
    cacheTTL: CACHE_TTLS.list
  });
}

// Now Playing (movies only)
export async function fetchNowPlaying(page = 1) {
  return tmdbFetch('/movie/now_playing', { language: 'en-US', page }, {
    cacheTTL: CACHE_TTLS.list
  });
}

// Upcoming (movies only)
export async function fetchUpcoming(page = 1) {
  return tmdbFetch('/movie/upcoming', { language: 'en-US', page }, {
    cacheTTL: CACHE_TTLS.list
  });
}

// Details (movie or tv)
export async function fetchDetails(mediaType, id) {
  return tmdbFetch(`/${mediaType}/${id}`, {
    language: 'en-US',
    append_to_response: 'credits,videos'
  }, {
    cacheTTL: CACHE_TTLS.detail
  });
}

// Search
export async function searchMulti(query, page = 1) {
  return tmdbFetch('/search/multi', { language: 'en-US', query, page }, {
    cacheTTL: CACHE_TTLS.search
  });
}

// Discover by provider
export async function discoverByProvider(mediaType, providerId, page = 1) {
  return tmdbFetch(`/discover/${mediaType}`, {
    language: 'en-US',
    page,
    with_watch_providers: providerId,
    watch_region: 'IN',
    sort_by: 'popularity.desc'
  }, {
    cacheTTL: CACHE_TTLS.list
  });
}

// Cache stats (for health check)
export function getCacheStats() {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    ksize: cache.getStats().ksize,
    vsize: cache.getStats().vsize
  };
}

export default {
  fetchTrending,
  fetchPopular,
  fetchTopRated,
  fetchNowPlaying,
  fetchUpcoming,
  fetchDetails,
  searchMulti,
  discoverByProvider,
  getCacheStats
};
