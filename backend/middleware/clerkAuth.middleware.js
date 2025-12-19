import { clerkClient } from '@clerk/clerk-sdk-node';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Ensure MongoDB connection for serverless
const connectDB = async () => {
  // Check if already connected
  if (mongoose.connection.readyState === 1) {
    return;
  }
  
  // Wait for existing connection attempt
  if (mongoose.connection.readyState === 2) {
    await new Promise(resolve => {
      mongoose.connection.once('connected', resolve);
    });
    return;
  }
  
  // This shouldn't happen in local dev since server.js connects
  // But needed for Vercel serverless
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  
  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }
  
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected (middleware)');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
};

// Simple auth middleware - verify Clerk session token
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Decode and verify token
    try {
      const base64Payload = token.split('.')[1];
      const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
      
      if (!payload.sub) {
        return res.status(401).json({ error: 'Invalid token format' });
      }

      // Verify user exists in Clerk
      await clerkClient.users.getUser(payload.sub);

      req.auth = {
        userId: payload.sub,
        sessionId: payload.sid
      };

      next();
    } catch (verifyError) {
      console.error('❌ Token verification error:', verifyError.message);
      return res.status(401).json({ error: 'Invalid session token' });
    }
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    res.status(401).json({ error: 'Unauthorized', details: error.message });
  }
};

// Sync Clerk user to MongoDB
export const syncUser = async (req, res, next) => {
  try {
    await connectDB(); // Ensure connection
    
    const { userId } = req.auth;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user from Clerk
    const clerkUser = await clerkClient.users.getUser(userId);

    // Find or create user in MongoDB
    let user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      // Create new user from Clerk data
      user = await User.create({
        clerkUserId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || clerkUser.primaryEmailAddress?.emailAddress,
        lastLogin: new Date()
      });
      console.log(`✅ New user synced: ${user.email}`);
    } else {
      // Update last login
      user.lastLogin = new Date();
      await user.save();
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ User sync error:', error.message);
    res.status(500).json({ error: 'Failed to sync user', details: error.message });
  }
};
