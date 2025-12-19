/**
 * Format duration in seconds to HH:MM:SS or MM:SS
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '00:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  return `${minutes}:${String(secs).padStart(2, '0')}`;
};

/**
 * Format progress percentage
 */
export const formatProgress = (progress) => {
  if (!progress || progress < 0) return '0%';
  if (progress > 100) return '100%';
  return `${Math.round(progress)}%`;
};

/**
 * Format rating
 */
export const formatRating = (rating) => {
  if (!rating) return 'N/A';
  const numRating = parseFloat(rating);
  if (isNaN(numRating)) return rating;
  return numRating.toFixed(1);
};

/**
 * Format year
 */
export const formatYear = (year) => {
  if (!year) return '';
  return `(${year})`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 150) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';

  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now - then) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return then.toLocaleDateString();
};

/**
 * Generate media identifier from title
 */
export const generateMediaId = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Extract media ID from various formats
 */
export const extractMediaId = (input) => {
  // If it's already an ID (alphanumeric with dashes)
  if (/^[a-z0-9-]+$/.test(input)) {
    return input;
  }
  
  // If it's an IMDb ID
  if (/^tt\d+$/.test(input)) {
    return input;
  }
  
  // Otherwise generate from title
  return generateMediaId(input);
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Format list of items with commas and "and"
 */
export const formatList = (items) => {
  if (!items || items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return items.join(' and ');
  
  return items.slice(0, -1).join(', ') + ', and ' + items[items.length - 1];
};
