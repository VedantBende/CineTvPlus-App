export const calculateExpiryDate = (duration) => {
  if (!duration || duration === 'permanent') return null;

  const date = new Date();
  const value = parseInt(duration);
  const unit = duration.replace(/[0-9]/g, '').toLowerCase();

  if (isNaN(value)) return null;

  switch (unit) {
    case 'h':
      date.setHours(date.getHours() + value);
      break;
    case 'd':
      date.setDate(date.getDate() + value);
      break;
    case 'm':
      date.setMonth(date.getMonth() + value);
      break;
    case 'y':
      date.setFullYear(date.getFullYear() + value);
      break;
    default:
      return null;
  }

  // Return the exact ISO timestamp
  return date.toISOString();
};
