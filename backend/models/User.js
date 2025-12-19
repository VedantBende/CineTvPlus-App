import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  watchlist: [{
    _id: false,
    mediaId: { type: String, required: true },
    title: { type: String },
    poster: { type: String },
    rating: { type: Number },
    year: { type: Number },
    type: { type: String, enum: ['movie', 'tv'] },
    addedAt: { type: Date, default: Date.now }
  }],
  preferences: {
    theme: {
      type: String,
      enum: ['dark', 'light'],
      default: 'dark'
    },
    autoplay: {
      type: Boolean,
      default: true
    },
    quality: {
      type: String,
      enum: ['auto', '720p', '1080p'],
      default: 'auto'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ clerkUserId: 1 });

const User = mongoose.model('User', userSchema);

export default User;
