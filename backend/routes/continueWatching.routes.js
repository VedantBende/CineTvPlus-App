import express from 'express';
import { requireAuth, requireMongoUser, requireApproved } from '../middleware/auth.middleware.js';
import ContinueWatching from '../models/ContinueWatching.js';

const router = express.Router();

// All routes require an approved, authenticated user
router.use(requireAuth, requireMongoUser, requireApproved);

// GET / — Fetch all continue watching items for the logged-in user
router.get('/', async (req, res) => {
  try {
    const items = await ContinueWatching.find({ userId: req.user._id })
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
    const { mediaId, mediaType, title, posterPath, backdropPath, season, episode } = req.body;

    if (!mediaId || !mediaType) {
      return res.status(400).json({ error: 'mediaId and mediaType are required' });
    }

    const item = await ContinueWatching.findOneAndUpdate(
      { userId: req.user._id, mediaId: String(mediaId) },
      {
        userId: req.user._id,
        mediaId: String(mediaId),
        mediaType,
        title: title || 'Unknown Title',
        posterPath: posterPath || null,
        backdropPath: backdropPath || null,
        season: season ? parseInt(season) : null,
        episode: episode ? parseInt(episode) : null
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ message: 'Continue watching updated', item });
  } catch (error) {
    console.error('Error upserting continue watching:', error);
    res.status(500).json({ error: 'Failed to update continue watching' });
  }
});

// DELETE /:mediaId — Remove a single item
router.delete('/:mediaId', async (req, res) => {
  try {
    const { mediaId } = req.params;
    await ContinueWatching.findOneAndDelete({ userId: req.user._id, mediaId: String(mediaId) });
    res.json({ message: 'Removed from continue watching' });
  } catch (error) {
    console.error('Error removing continue watching item:', error);
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

export default router;
