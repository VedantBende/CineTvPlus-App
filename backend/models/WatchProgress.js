import mongoose from 'mongoose';

const watchProgressSchema = new mongoose.Schema({
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
  // For TV shows only
  season: {
    type: Number,
    default: null
  },
  episode: {
    type: Number,
    default: null
  },
  // Progress tracking
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
  lastWatched: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
watchProgressSchema.index({ userId: 1, mediaId: 1 });
watchProgressSchema.index({ userId: 1, lastWatched: -1 });
watchProgressSchema.index({ userId: 1, completed: 1 });

// Calculate progress percentage before saving
watchProgressSchema.pre('save', function(next) {
  if (this.duration > 0) {
    this.progress = Math.round((this.currentTime / this.duration) * 100);
    
    // Mark as completed if progress > 90%
    if (this.progress >= 90) {
      this.completed = true;
    }
  }
  next();
});

const WatchProgress = mongoose.model('WatchProgress', watchProgressSchema);

export default WatchProgress;
