const cron = require('node-cron');
const reminderService = require('./reminderService');
const logger = require('../utils/logger');

class SchedulerService {
  initialize() {
    logger.info('Initializing notification scheduler...');
    
    // Check for due date reminders every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
      logger.info('Running due date reminder check...');
      await reminderService.createDueDateReminders();
    });

    // Process scheduled notifications every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      logger.info('Processing scheduled notifications...');
      await reminderService.processScheduledNotifications();
    });

    // Send daily summary at 9 AM every day
    cron.schedule('0 9 * * *', async () => {
      logger.info('Sending daily summaries...');
      await reminderService.sendDailySummary();
    });

    // Clean up old notifications at midnight
    cron.schedule('0 0 * * *', async () => {
      logger.info('Cleaning up old notifications...');
      await this.cleanupOldNotifications();
    });

    logger.info('Notification scheduler initialized successfully');
  }

  // Clean up notifications older than 30 days
  async cleanupOldNotifications() {
    try {
      const db = require('../utils/database');
      const query = `
        DELETE FROM notifications 
        WHERE created_at < NOW() - INTERVAL '30 days'
        AND is_read = true
      `;
      
      const result = await db.query(query);
      logger.info(`Cleaned up ${result.rowCount} old notifications`);
    } catch (error) {
      logger.error('Error cleaning up old notifications:', error);
    }
  }

  // Manual trigger for testing
  async triggerDueDateCheck() {
    logger.info('Manually triggering due date check...');
    await reminderService.createDueDateReminders();
  }

  async triggerScheduledNotifications() {
    logger.info('Manually triggering scheduled notifications...');
    await reminderService.processScheduledNotifications();
  }
}

module.exports = new SchedulerService();