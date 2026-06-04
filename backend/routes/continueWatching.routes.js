import express from 'express';
import { requireAuth, requireMongoUser, requireApproved } from '../middleware/auth.middleware.js';
import ContinueWatching from '../models/ContinueWatching.js';

const router = express.Router();

// All routes require an approved, authenticated user
router.use(requireAuth, requireMongoUser, requireApproved);

// GET / — Fetch all continue watching items for the logged-in user
router.get('/', async (req, res) => {
  try {
    const isAnime = req.query.anime === 'true';
    
    // For standard mode, match explicitly false OR missing field (for old documents)
    const query = { userId: req.user._id, isAnime: isAnime ? true : { $ne: true } };

    const items = await ContinueWatching.find(query)
      .sort({ updatedAt: -1 })
      .limit(20);

    res.json({ items });
  } catch (error) {
    console.error('Error fetching continue watching:', error);
    res.status(500).json({ error: 'Failed to fetch continue watching list' });
  }
});

// POST / — Add or update a continue watching item (upsert)
router.post('/', async (req, res) => {
  try {
    const { mediaId, mediaType, title, posterPath, backdropPath, season, episode, isAnime = false } = req.body;

    if (!mediaId || !mediaType) {
      return res.status(400).json({ error: 'mediaId and mediaType are required' });
    }

    const item = await ContinueWatching.findOneAndUpdate(
      { userId: req.user._id, mediaId: String(mediaId), isAnime },
      {
        userId: req.user._id,
        mediaId: String(mediaId),
        mediaType,
        title: title || 'Unknown Title',
        posterPath: posterPath || null,
        backdropPath: backdropPath || null,
        season: season ? parseInt(season) : null,
        episode: episode ? parseInt(episode) : null,
        isAnime
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ message: 'Continue watching updated', item });
  } catch (error) {
    console.error('Error upserting continue watching:', error);
    res.status(500).json({ error: 'Failed to update continue watching' });
  }
});

// DELETE /clear/all — Clear all continue watching history for the user
router.delete('/clear/all', async (req, res) => {
  try {
    const isAnime = req.query.anime === 'true';
    const query = { userId: req.user._id, isAnime: isAnime ? true : { $ne: true } };
    await ContinueWatching.deleteMany(query);
    res.json({ message: 'Watch history cleared' });
  } catch (error) {
    console.error('Error clearing watch history:', error);
    res.status(500).json({ error: 'Failed to clear watch history' });
  }
});

// DELETE /:mediaId — Remove a single item
router.delete('/:mediaId', async (req, res) => {
  try {
    const { mediaId } = req.params;
    const isAnime = req.query.anime === 'true';
    const query = { userId: req.user._id, mediaId: String(mediaId), isAnime: isAnime ? true : { $ne: true } };
    await ContinueWatching.findOneAndDelete(query);
    res.json({ message: 'Removed from continue watching' });
  } catch (error) {
    console.error('Error removing continue watching item:', error);
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

// PATCH /:mediaId/touch — Bump updatedAt only, to move the item to position 1.
// Called the instant the user clicks a Continue Watching card, before navigating.
router.patch('/:mediaId/touch', async (req, res) => {
  try {
    const { mediaId } = req.params;
    const isAnime = req.body?.isAnime ?? false;
    const query = { userId: req.user._id, mediaId: String(mediaId), isAnime: isAnime ? true : { $ne: true } };

    const item = await ContinueWatching.findOneAndUpdate(
      query,
      { $set: { updatedAt: new Date() } },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ error: 'Item not found in continue watching' });
    }

    res.json({ message: 'Item promoted to top', item });
  } catch (error) {
    console.error('Error touching continue watching item:', error);
    res.status(500).json({ error: 'Failed to touch item' });
  }
});

export default router;
