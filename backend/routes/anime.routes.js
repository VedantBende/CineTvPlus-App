import express from 'express';

const router = express.Router();

const VALID_MEDIA_TYPES = ['movie', 'tv', 'anime'];

/**
 * GET /api/anime/embed
 * Query params:
 * - otakuId: number
 * - type: 'tv' | 'movie' | 'anime'
 * - season: number
 * - episode: number
 * - lang: 'sub' | 'dub'
 */
router.get('/embed', async (req, res) => {
  try {
    const { otakuId, type, season, episode, lang = 'sub' } = req.query;

    if (!otakuId || !type) {
      return res.status(400).json({ success: false, error: 'Missing otakuId or type parameter' });
    }

    if (!VALID_MEDIA_TYPES.includes(type)) {
      return res.status(400).json({ success: false, error: `Invalid type: ${type}` });
    }

    // Generate Otaku URL
    // Expected format based on Otaku public route
    // Allow overriding via environment variable
    const OTAKU_BASE_URL = process.env.OTAKU_BASE_URL;
    
    // Construct the Otaku URL based on the known Otaku ID path format:
    let embedUrl = '';
    
    if (type === 'tv' || type === 'anime') {
      const epNum = episode || 1;
      embedUrl = `${OTAKU_BASE_URL}/stream/ani/${otakuId}/${epNum}/${lang}`;
    } else {
      // For movies, ep is usually 1
      embedUrl = `${OTAKU_BASE_URL}/stream/ani/${otakuId}/1/${lang}`;
    }

    return res.json({
      success: true,
      url: embedUrl,
      otakuId
    });

  } catch (error) {
    console.error('Anime Embed Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error resolving anime embed' });
  }
});

export default router;
