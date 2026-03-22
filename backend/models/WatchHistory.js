import mongoose from 'mongoose';

const watchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  mediaId: {
    type: String,
    required: true,
    trim: true
  },
  mediaType: {
    type: String,
    enum: ['movie', 'tv'],
    required: true
  },
  season: {
    type: Number,
    default: null
  },
  episode: {
    type: Number,
    default: null
  },
  currentTime: {
    type: Number, // in seconds
    required: true,
    default: 0
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  progress: {
    type: Number, // percentage (0-100)
    required: true,
    default: 0,
    min: 0,
    max: 100
  },
  completed: {
    type: Boolean,
    default: false
  },
  lastWatchedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
watchHistorySchema.index({ userId: 1, mediaId: 1 });
watchHistorySchema.index({ userId: 1, lastWatchedAt: -1 });
watchHistorySchema.index({ userId: 1, completed: 1 });

// Calculate progress percentage before saving
watchHistorySchema.pre('save', function(next) {
  if (this.duration > 0) {
    this.progress = Math.round((this.currentTime / this.duration) * 100);
    
    // Mark as completed if progress > 90%
    if (this.progress >= 90) {
      this.completed = true;
    }
  }
  // Update lastWatchedAt
  this.lastWatchedAt = new Date();
  
  next();
});

const WatchHistory = mongoose.model('WatchHistory', watchHistorySchema);

export default WatchHistory;
