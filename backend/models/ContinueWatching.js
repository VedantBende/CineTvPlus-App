import mongoose from 'mongoose';

const continueWatchingSchema = new mongoose.Schema({
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
  title: {
    type: String,
    default: 'Unknown Title'
  },
  posterPath: {
    type: String,
    default: null
  },
  backdropPath: {
    type: String,
    default: null
  },
  season: {
    type: Number,
    default: null
  },
  episode: {
    type: Number,
    default: null
  },
  isAnime: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // createdAt + updatedAt
});

// Unique constraint: one entry per user per media per mode
continueWatchingSchema.index({ userId: 1, mediaId: 1, isAnime: 1 }, { unique: true });
// Fast sort query for fetching user's list (partitioned by isAnime)
continueWatchingSchema.index({ userId: 1, isAnime: 1, updatedAt: -1 });

const ContinueWatching = mongoose.model('ContinueWatching', continueWatchingSchema);

export default ContinueWatching;
