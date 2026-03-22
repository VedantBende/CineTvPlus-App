import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
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
    type: String
  },
  posterPath: {
    type: String
  }
}, {
  timestamps: true // adds createdAt
});

// Compound index to ensure a user only favorites a piece of media once
favoriteSchema.index({ userId: 1, mediaId: 1 }, { unique: true });
favoriteSchema.index({ userId: 1, createdAt: -1 });

const Favorite = mongoose.model('Favorite', favoriteSchema);

export default Favorite;
