import express from 'express';
import WatchProgress from '../models/WatchProgress.js';
import { requireAuth, syncUser } from '../middleware/clerkAuth.middleware.js';
import mongoose from 'mongoose';

const router = express.Router();

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
};

// Get all progress for user
router.get('/', requireAuth, syncUser, async (req, res) => {
  try {
    const progress = await WatchProgress.find({ userId: req.user._id })
      .sort({ lastWatched: -1 })
      .limit(50);

    res.json({ progress });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Get progress for specific media
router.get('/:mediaId', requireAuth, syncUser, async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { season, episode } = req.query;

    const query = { 
      userId: req.user._id, 
      mediaId 
    };

    if (season) query.season = parseInt(season);
    if (episode) query.episode = parseInt(episode);

    const progress = await WatchProgress.findOne(query);

    res.json({ progress: progress || null });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Update or create progress
router.post('/update', requireAuth, syncUser, async (req, res) => {
  try {
    const { mediaId, mediaType, currentTime, duration, season, episode } = req.body;

    if (!mediaId || !mediaType || currentTime === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = { 
      userId: req.user._id, 
      mediaId,
      ...(season && { season: parseInt(season) }),
      ...(episode && { episode: parseInt(episode) })
    };

    const progressData = {
      mediaType,
      currentTime: parseFloat(currentTime),
      duration: parseFloat(duration) || 0,
      lastWatched: new Date()
    };

    const progress = await WatchProgress.findOneAndUpdate(
      query,
      progressData,
      { upsert: true, returnDocument: 'after' }
    );

    res.json({ 
      message: 'Progress updated', 
      progress 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Get continue watching (incomplete items)
router.get('/continue/watching', requireAuth, syncUser, async (req, res) => {
  try {
    const continueWatching = await WatchProgress.find({ 
      userId: req.user._id,
      completed: false,
      progress: { $gt: 5, $lt: 90 } // Between 5% and 90%
    })
      .sort({ lastWatched: -1 })
      .limit(10);

    res.json({ continueWatching });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch continue watching' });
  }
});

export default router;
