import cron from 'node-cron';
import User from '../models/User.js';

// Run every day at 5:30 AM
export const startCronJobs = () => {
  cron.schedule('30 5 * * *', async () => {
    console.log('⏳ Running daily access revocation check...');
    try {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const currentDateString = `${yyyy}-${mm}-${dd}`;

      const result = await User.updateMany(
        {
          status: 'approved',
          expiresAt: { $lte: new Date(currentDateString) }
        },
        {
          $set: {
            status: 'revoked',
            revokedReason: 'auto-expired',
            lastRevokedAt: new Date()
          }
        }
      );

      console.log(`✅ Daily check complete. Revoked ${result.modifiedCount} expired users.`);
    } catch (error) {
      console.error('❌ Error during daily access revocation cron:', error);
    }
  });
};
