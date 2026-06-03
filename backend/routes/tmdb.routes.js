/**
 * TMDB Proxy Routes — Production-Ready
 * 
 * Explicit, validated routes that call the centralized tmdbService.
 * No catch-all RegExp — each endpoint is defined and validated.
 */

import express from 'express';
import {
  fetchTrending,
  fetchPopular,
  fetchTopRated,
  fetchNowPlaying,
  fetchUpcoming,
  fetchDetails,
  searchMulti,
  discoverByProvider,
  fetchAnimeDiscover,
  searchAnimeMulti,
  discoverAnimeByProvider
} from '../services/tmdbService.js';

const router = express.Router();

// ─── VALIDATORS ──────────────────────────────────────────────

const VALID_MEDIA_TYPES = ['movie', 'tv', 'all'];
const VALID_TIME_WINDOWS = ['day', 'week'];

function validateMediaType(type) {
  return VALID_MEDIA_TYPES.includes(type);
}

function validateId(id) {
  return /^\d+$/.test(id);
}

function validatePage(page) {
  const p = parseInt(page, 10);
  return !isNaN(p) && p >= 1 && p <= 500;
}

// Standard error response
function sendError(res, status, message) {
  return res.status(status).json({ success: false, error: message });
}

// ─── ROUTES ──────────────────────────────────────────────────

/**
 * GET /api/tmdb/trending/:mediaType/:timeWindow
 * e.g. /api/tmdb/trending/movie/week?page=1
 */
router.get('/trending/:mediaType/:timeWindow', async (req, res) => {
  try {
    const { mediaType, timeWindow } = req.params;
    const page = parseInt(req.query.page, 10) || 1;

    if (!validateMediaType(mediaType)) {
      return sendError(res, 400, `Invalid media type: ${mediaType}. Must be 'movie' or 'tv'.`);
    }
    if (!VALID_TIME_WINDOWS.includes(timeWindow)) {
      return sendError(res, 400, `Invalid time window: ${timeWindow}. Must be 'day' or 'week'.`);
    }

    const isAnime = req.query.anime === 'true';
    const data = isAnime 
      ? await fetchAnimeDiscover(mediaType, 'trending', page)
      : await fetchTrending(mediaType, timeWindow, page);
    res.json(data);
  } catch (error) {
    handleTmdbError(res, error, 'trending');
  }
});

/**
 * GET /api/tmdb/movie/popular?page=1
 * GET /api/tmdb/tv/popular?page=1
 */
router.get('/:mediaType/popular', async (req, res) => {
  try {
    const { mediaType } = req.params;
    const page = parseInt(req.query.page, 10) || 1;

    if (!validateMediaType(mediaType)) {
      return sendError(res, 400, `Invalid media type: ${mediaType}`);
    }

    const isAnime = req.query.anime === 'true';
    const data = isAnime
      ? await fetchAnimeDiscover(mediaType, 'popular', page)
      : await fetchPopular(mediaType, page);
    res.json(data);
  } catch (error) {
    handleTmdbError(res, error, 'popular');
  }
});

/**
 * GET /api/tmdb/movie/top_rated?page=1
 * GET /api/tmdb/tv/top_rated?page=1
 */
router.get('/:mediaType/top_rated', async (req, res) => {
  try {
    const { mediaType } = req.params;
    const page = parseInt(req.query.page, 10) || 1;

    if (!validateMediaType(mediaType)) {
      return sendError(res, 400, `Invalid media type: ${mediaType}`);
    }

    const isAnime = req.query.anime === 'true';
    const data = isAnime
      ? await fetchAnimeDiscover(mediaType, 'top_rated', page)
      : await fetchTopRated(mediaType, page);
    res.json(data);
  } catch (error) {
    handleTmdbError(res, error, 'top_rated');
  }
});

/**
 * GET /api/tmdb/movie/now_playing?page=1
 */
router.get('/movie/now_playing', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const isAnime = req.query.anime === 'true';
    const data = isAnime
      ? await fetchAnimeDiscover('movie', 'now_playing', page)
      : await fetchNowPlaying(page);
    res.json(data);
  } catch (error) {
    handleTmdbError(res, error, 'now_playing');
  }
});

/**
 * GET /api/tmdb/movie/upcoming?page=1
 */
router.get('/movie/upcoming', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const isAnime = req.query.anime === 'true';
    const data = isAnime
      ? await fetchAnimeDiscover('movie', 'upcoming', page)
      : await fetchUpcoming(page);
    res.json(data);
  } catch (error) {
    handleTmdbError(res, error, 'upcoming');
  }
});

/**
 * GET /api/tmdb/search/multi?query=...&page=1
 */
router.get('/search/multi', async (req, res) => {
  try {
    const { query, page = 1 } = req.query;

    if (!query || query.trim().length === 0) {
      return sendError(res, 400, 'Search query is required.');
    }

    const isAnime = req.query.anime === 'true';
    const data = isAnime
      ? await searchAnimeMulti(query.trim(), parseInt(page, 10) || 1)
      : await searchMulti(query.trim(), parseInt(page, 10) || 1);
    res.json(data);
  } catch (error) {
    handleTmdbError(res, error, 'search');
  }
});

/**
 * GET /api/tmdb/discover/:mediaType?providerId=...&page=1
 */
router.get('/discover/:mediaType', async (req, res) => {
  try {
    const { mediaType } = req.params;
    const { providerId } = req.query;
    const page = parseInt(req.query.page, 10) || 1;

    if (!validateMediaType(mediaType)) {
      return sendError(res, 400, `Invalid media type: ${mediaType}`);
    }
    if (!providerId || !validateId(providerId)) {
      return sendError(res, 400, 'Valid providerId is required.');
    }

    const isAnime = req.query.anime === 'true';
    const data = isAnime
      ? await discoverAnimeByProvider(mediaType, providerId, page)
      : await discoverByProvider(mediaType, providerId, page);
    res.json(data);
  } catch (error) {
    handleTmdbError(res, error, 'discover');
  }
});

/**
 * GET /api/tmdb/movie/:id?language=en-US&append_to_response=credits,videos
 * GET /api/tmdb/tv/:id?language=en-US&append_to_response=credits,videos
 */
router.get('/:mediaType/:id', async (req, res) => {
  try {
    const { mediaType, id } = req.params;

    if (!validateMediaType(mediaType)) {
      return sendError(res, 400, `Invalid media type: ${mediaType}`);
    }
    if (!validateId(id)) {
      return sendError(res, 400, `Invalid ID: ${id}. Must be numeric.`);
    }

    const data = await fetchDetails(mediaType, id);
    res.json(data);
  } catch (error) {
    handleTmdbError(res, error, 'details');
  }
});

// ─── ERROR HANDLER ───────────────────────────────────────────

function handleTmdbError(res, error, endpoint) {
  console.error(`❌ TMDB ${endpoint} error:`, error.message);

  if (error.response) {
    // TMDB returned an error (4xx/5xx)
    const status = error.response.status;
    const tmdbMsg = error.response.data?.status_message || 'TMDB API error';
    return res.status(status).json({
      success: false,
      error: tmdbMsg,
      source: 'tmdb'
    });
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return res.status(504).json({
      success: false,
      error: 'TMDB request timed out. Please try again.',
      source: 'timeout'
    });
  }

  if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
    return res.status(503).json({
      success: false,
      error: 'Cannot reach TMDB (DNS resolution failed). The DNS bypass may not be working correctly.',
      source: 'dns'
    });
  }

  return res.status(500).json({
    success: false,
    error: 'Internal server error while fetching from TMDB.',
    source: 'internal'
  });
}

export default router;
