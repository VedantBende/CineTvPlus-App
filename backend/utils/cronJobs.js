import cron from 'node-cron';
import User from '../models/User.js';
import { sendEmail } from './email.js';
import { getStatusEmailContent } from './emailTemplates.js';

// Run every day at 5:30 AM
export const startCronJobs = () => {
  cron.schedule('30 5 * * *', async () => {
    console.log('⏳ Running daily access revocation check...');
    try {
      const expiredUsers = await User.find({
        status: 'approved',
        expiresAt: { $lte: new Date() }
      });

      if (expiredUsers.length > 0) {
        const userIds = expiredUsers.map(u => u._id);

        const result = await User.updateMany(
          { _id: { $in: userIds } },
          {
            $set: {
              status: 'revoked',
              revokedReason: 'auto-expired',
              lastRevokedAt: new Date(),
              accessDuration: null,
              expiresAt: null,
              isPermanent: false
            }
          }
        );

        console.log(`✅ Daily check complete. Revoked ${result.modifiedCount} expired users.`);

        // Send automated revocation emails
        for (const user of expiredUsers) {
          const userForEmail = { ...user.toObject(), revokedReason: 'auto-expired' };
          const emailContent = getStatusEmailContent('revoked', user.name, userForEmail);
          if (emailContent && user.email && user.email.includes('@')) {
            sendEmail(user.email, emailContent.subject, emailContent.html)
              .catch(err => console.error(`❌ Background email failed for ${user.email}:`, err));
          }
        }
      } else {
        console.log(`✅ Daily check complete. No users to revoke.`);
      }
    } catch (error) {
      console.error('❌ Error during daily access revocation cron:', error);
    }
  });
};
