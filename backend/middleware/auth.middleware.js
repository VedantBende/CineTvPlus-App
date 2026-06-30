import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import User from '../models/User.js';

// 1. Verify Clerk Token
export const requireAuth = (req, res, next) => {
  console.log(`🔒 Auth middleware: Verifying token for ${req.path}...`);
  return ClerkExpressRequireAuth()(req, res, (err) => {
    if (err) {
      console.error('❌ Clerk Auth Error:', err);
      return next(err);
    }
    console.log('✅ Clerk Auth Success for:', req.auth?.userId);
    next();
  });
};

// 2. Fetch User from MongoDB
export const requireMongoUser = async (req, res, next) => {
  try {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findOne({ clerkUserId: req.auth.userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found in MongoDB. Please log out and back in.' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 3. Admin Authorization
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// 4. Approved Authorization (blocks pending/rejected users from accessing data)
export const requireApproved = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (req.user.role === 'admin') {
     return next(); // Admins always have access
  }
  if (req.user.status !== 'approved') {
    return res.status(403).json({ error: `Access denied. Status: ${req.user.status}`, status: req.user.status });
  }

  // Real-time exact timestamp expiry block
  if (!req.user.isPermanent && req.user.expiresAt && new Date(req.user.expiresAt) < new Date()) {
    // Override the response status to pretend they are revoked, even if the cron job hasn't run yet
    return res.status(403).json({ error: 'Access expired', status: 'revoked', revokedReason: 'auto-expired' });
  }
  
  next();
};
