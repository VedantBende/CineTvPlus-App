import express from 'express';
import User from '../models/User.js';
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

// Get user's watchlist
router.get('/', requireAuth, syncUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user.watchlist || []);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

// Add to watchlist
router.post('/add', requireAuth, syncUser, async (req, res) => {
  try {
    const { mediaId, title, poster, rating, year, type } = req.body;
    
    if (!mediaId) {
      return res.status(400).json({ error: 'Media ID is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already exists
    const exists = user.watchlist.some(item => item.mediaId === mediaId);
    if (exists) {
      return res.status(400).json({ error: 'Already in watchlist' });
    }

    const watchlistItem = {
      mediaId,
      title,
      poster,
      rating,
      year,
      type,
      addedAt: new Date()
    };

    user.watchlist.push(watchlistItem);
    await user.save();

    res.json({
      message: 'Added to watchlist',
      item: watchlistItem
    });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
});

// Remove from watchlist
router.delete('/remove/:mediaId', requireAuth, syncUser, async (req, res) => {
  try {
    const { mediaId } = req.params;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.watchlist = user.watchlist.filter(item => item.mediaId !== mediaId);
    await user.save();

    res.json({ message: 'Removed from watchlist' });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
});

// Check if media is in watchlist
router.get('/check/:mediaId', requireAuth, syncUser, async (req, res) => {
  try {
    const { mediaId } = req.params;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.json({ isInWatchlist: false });
    }

    const isInWatchlist = user.watchlist.some(item => item.mediaId === mediaId);
    res.json({ isInWatchlist });
  } catch (error) {
    console.error('Error checking watchlist:', error);
    res.status(500).json({ error: 'Failed to check watchlist' });
  }
});

export default router;
