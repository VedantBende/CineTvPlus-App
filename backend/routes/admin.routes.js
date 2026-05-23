import express from 'express';
import { requireAuth, requireMongoUser, requireAdmin } from '../middleware/auth.middleware.js';
import User from '../models/User.js';
import ContinueWatching from '../models/ContinueWatching.js';
import { sendEmail } from '../utils/email.js';
import { getStatusEmailContent } from '../utils/emailTemplates.js';

const isValidEmail = (email) => {
  return typeof email === 'string' && email.includes('@') && email.includes('.');
};

const router = express.Router();

// Apply middleware to all admin routes
router.use(requireAuth, requireMongoUser, requireAdmin);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-preferences');
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

// Approve user
router.patch('/users/:id/approve', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.status = 'approved';
    await user.save();

    res.json({ message: 'User approved', user });

    // Trigger notification email (async background task)
    const emailContent = getStatusEmailContent('approved', user.name);
    if (emailContent && isValidEmail(user.email)) {
      console.log(`✉️ Triggering background email to: ${user.email}`);
      sendEmail(user.email, emailContent.subject, emailContent.html)
        .then(result => console.log('📧 Background email result:', result))
        .catch(err => console.error('❌ Background email failed:', err));
    }
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ error: 'Server error approving user' });
  }
});

// Reject user
router.patch('/users/:id/reject', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.status = 'rejected';
    await user.save();

    res.json({ message: 'User rejected', user });

    // Trigger notification email (async background task)
    const emailContent = getStatusEmailContent('rejected', user.name);
    if (emailContent && isValidEmail(user.email)) {
      console.log(`✉️ Triggering background email to: ${user.email}`);
      sendEmail(user.email, emailContent.subject, emailContent.html)
        .then(result => console.log('📧 Background email result:', result))
        .catch(err => console.error('❌ Background email failed:', err));
    }
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({ error: 'Server error rejecting user' });
  }
});

// Revoke user
router.patch('/users/:id/revoke', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.status = 'revoked';
    await user.save();

    res.json({ message: 'User revoked', user });

    // Trigger notification email (async background task)
    const emailContent = getStatusEmailContent('revoked', user.name);
    if (emailContent && isValidEmail(user.email)) {
      console.log(`✉️ Triggering background email to: ${user.email}`);
      sendEmail(user.email, emailContent.subject, emailContent.html)
        .then(result => console.log('📧 Background email result:', result))
        .catch(err => console.error('❌ Background email failed:', err));
    }
  } catch (error) {
    console.error('Error revoking user:', error);
    res.status(500).json({ error: 'Server error revoking user' });
  }
});

// Get user activity (last login, currently watching)
router.get('/users/:id/activity', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('lastLogin');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentlyWatching = await ContinueWatching.find({ userId: req.params.id })
      .sort({ updatedAt: -1 })
      .lean();

    res.json({
      lastLogin: user.lastLogin,
      currentlyWatching
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Server error fetching user activity' });
  }
});

export default router;
