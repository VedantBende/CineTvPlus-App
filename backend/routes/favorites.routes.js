import express from 'express';
import { requireAuth, requireMongoUser, requireApproved } from '../middleware/auth.middleware.js';
import Favorite from '../models/Favorite.js';

const router = express.Router();

// All favorites routes require an approved user
router.use(requireAuth, requireMongoUser, requireApproved);

// Get all favorites
router.get('/', async (req, res) => {
  try {
    const isAnime = req.query.anime === 'true';
    const favorites = await Favorite.find({ userId: req.user._id, isAnime }).sort({ createdAt: -1 });
    res.json({ favorites });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a favorite
router.post('/add', async (req, res) => {
  try {
    const { mediaId, mediaType, title, posterPath, isAnime = false } = req.body;
    
    if (!mediaId || !mediaType) {
      return res.status(400).json({ error: 'mediaId and mediaType are required' });
    }

    // Upsert to handle unique constraint safely
    const favorite = await Favorite.findOneAndUpdate(
      { userId: req.user._id, mediaId, isAnime },
      { userId: req.user._id, mediaId, mediaType, title, posterPath, isAnime },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ message: 'Added to favorites', favorite });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove a favorite
router.delete('/remove/:mediaId', async (req, res) => {
  try {
    const { mediaId } = req.params;
    const isAnime = req.query.anime === 'true';
    await Favorite.findOneAndDelete({ userId: req.user._id, mediaId, isAnime });
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Check if a media is in favorites
router.get('/check/:mediaId', async (req, res) => {
  try {
    const { mediaId } = req.params;
    const isAnime = req.query.anime === 'true';
    const favorite = await Favorite.findOne({ userId: req.user._id, mediaId, isAnime });
    res.json({ isFavorite: !!favorite });
  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
