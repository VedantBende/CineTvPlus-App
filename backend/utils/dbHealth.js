import cron from 'node-cron';
import mongoose from 'mongoose';

/**
 * Performs a lightweight ping to the MongoDB database to ensure the connection is active.
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function checkDatabaseHealth() {
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB is not connected (readyState !== 1)');
    }

    // Use the admin command 'ping' for the lightest possible check
    await mongoose.connection.db.admin().command({ ping: 1 });
    
    console.log(`📡 [${new Date().toISOString()}] ✅ MongoDB health check successful`);
    return { success: true, message: '✅ MongoDB health check successful' };
  } catch (error) {
    console.error(`📡 [${new Date().toISOString()}] ❌ MongoDB health check failed:`, error.message);
    return { success: false, message: `MongoDB health check failed: ${error.message}` };
  }
}

/**
 * Initializes a 24-hour background task to keep the MongoDB connection warm.
 */
export function initDatabaseKeepAlive() {
  console.log('🗓️ Scheduling MongoDB Keep-Alive: Every 24 hours');

  // Schedule task: '0 0 * * *' runs at midnight every day
  // For immediate verification during boot, we could also run it once, 
  // but it's cleaner to let the initial connection handle the boot check.
  cron.schedule('0 0 * * *', async () => {
    await checkDatabaseHealth();
  });
}
