import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import User from '../models/User.js';

const router = express.Router();

// Synchronize Clerk user to MongoDB
router.post('/sync', requireAuth, async (req, res) => {
  try {
    console.log('👤 Sync Request:', { auth: req.auth, body: req.body });
    const { userId } = req.auth;
    const { email, name } = req.body;

    if (!userId) {
       console.error('❌ Sync failed: No userId in req.auth');
       return res.status(401).json({ error: 'Authentication failed: No user ID' });
    }

    let user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      console.log('🆕 Creating new user for:', email);
      if (!email) {
         return res.status(400).json({ error: 'Email required for initial sync' });
      }
      user = new User({
        clerkUserId: userId,
        email: email,
        name: name || '',
        status: 'pending', 
        role: 'user'
      });
      await user.save();
    } else {
      console.log('🔄 Updating lastLogin for user:', user.email);
      user.lastLogin = new Date();
      await user.save();
    }

    res.json({ user });
  } catch (error) {
    console.error('❌ Error syncing user:', error);
    res.status(500).json({ 
      error: 'Server error during sync',
      message: error.message,
      details: error.errors // Mongoose validation errors
    });
  }
});

export default router;
