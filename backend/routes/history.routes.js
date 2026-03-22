import express from 'express';
import { requireAuth, requireMongoUser, requireApproved } from '../middleware/auth.middleware.js';
import WatchHistory from '../models/WatchHistory.js';

const router = express.Router();

router.use(requireAuth, requireMongoUser, requireApproved);

// Get all watch history (Continue Watching)
router.get('/', async (req, res) => {
  try {
    // Return items that have > 1% and < 90% progress
    const history = await WatchHistory.find({ 
      userId: req.user._id,
      completed: false,
      progress: { $gt: 1 }
    }).sort({ lastWatchedAt: -1 }).limit(20);
    
    res.json({ history });
  } catch (error) {
    console.error('Error fetching watch history:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update progress
router.post('/update', async (req, res) => {
  try {
    const { mediaId, mediaType, season, episode, currentTime, duration } = req.body;

    if (!mediaId || !mediaType || currentTime === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let history = await WatchHistory.findOne({ userId: req.user._id, mediaId });
    
    if (!history) {
      history = new WatchHistory({
        userId: req.user._id,
        mediaId,
        mediaType,
        season: season || null,
        episode: episode || null,
        currentTime,
        duration: duration || 0
      });
    } else {
      history.season = season || history.season;
      history.episode = episode || history.episode;
      history.currentTime = currentTime;
      if (duration) history.duration = duration;
    }

    await history.save();
    res.json({ message: 'Progress updated', history });

  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get specific progress for an item
router.get('/:mediaId', async (req, res) => {
  try {
    const { mediaId } = req.params;
    const history = await WatchHistory.findOne({ userId: req.user._id, mediaId });
    
    if (!history) {
      return res.json({ progress: null });
    }
    
    res.json({ progress: history });
  } catch (error) {
    console.error('Error fetching specific progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
