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
 * - server: 'otaku1' | 'otaku2' | 'otaku3'
 */
router.get('/embed', async (req, res) => {
  try {
    const { otakuId, type, season, episode, lang = 'sub', server = 'otaku1' } = req.query;

    if (!otakuId || !type) {
      return res.status(400).json({ success: false, error: 'Missing otakuId or type parameter' });
    }

    if (!VALID_MEDIA_TYPES.includes(type)) {
      return res.status(400).json({ success: false, error: `Invalid type: ${type}` });
    }

    // Generate Otaku URL
    let embedUrl = '';
    const epNum = episode || 1;
    let origin = null;

    if (server === 'otaku2') {
      const OTAKU_2_URL = process.env.OTAKU_2_URL;
      embedUrl = `${OTAKU_2_URL}/${otakuId}/${epNum}/${lang}`;
      origin = process.env.OTAKU_ORIGIN;
    } else if (server === 'otaku3') {
      const OTAKU_3_URL = process.env.OTAKU_3_URL;
      embedUrl = `${OTAKU_3_URL}/${otakuId}/${epNum}/${lang}`;
      origin = process.env.OTAKU_ORIGIN;
    } else {
      // Default: otaku1
      const OTAKU_1_URL = process.env.OTAKU_1_URL;
      if (type === 'tv' || type === 'anime') {
        embedUrl = `${OTAKU_1_URL}/stream/ani/${otakuId}/${epNum}/${lang}`;
      } else {
        // For movies, ep is usually 1
        embedUrl = `${OTAKU_1_URL}/stream/ani/${otakuId}/1/${lang}`;
      }
    }

    return res.json({
      success: true,
      url: embedUrl,
      origin,
      otakuId
    });

  } catch (error) {
    console.error('Anime Embed Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error resolving anime embed' });
  }
});

export default router;
