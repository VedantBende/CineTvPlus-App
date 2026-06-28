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

  // Strip the time, keep only the date (YYYY-MM-DD)
  // We use the local date because I wanted "5:30 AM" local time for cron.
  // Converting local date to string ensures when stored in DB, it represents that day.
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  
  return `${yyyy}-${mm}-${dd}`;
};
