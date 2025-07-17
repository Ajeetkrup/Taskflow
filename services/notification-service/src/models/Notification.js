const db = require('../utils/database');
const logger = require('../utils/logger');

class Notification {
  // Create notification
  static async create(notificationData) {
    try {
      const { userId, taskId, type, title, message, scheduledFor } = notificationData;
      
      const query = `
        INSERT INTO notifications (user_id, task_id, type, title, message, scheduled_for)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const result = await db.query(query, [userId, taskId, type, title, message, scheduledFor]);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  // Get user notifications
  static async getByUserId(userId, limit = 20, offset = 0) {
    try {
      const query = `
        SELECT n.*, t.title as task_title
        FROM notifications n
        LEFT JOIN tasks t ON n.task_id = t.id
        WHERE n.user_id = $1
        ORDER BY n.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      
      const result = await db.query(query, [userId, limit, offset]);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Get unread notifications count
  static async getUnreadCount(userId) {
    try {
      const query = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false';
      const result = await db.query(query, [userId]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      logger.error('Error getting unread count:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    try {
      const query = `
        UPDATE notifications 
        SET is_read = true 
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `;
      
      const result = await db.query(query, [notificationId, userId]);
      return result.rows[0];
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Delete notification
  static async delete(notificationId, userId) {
    try {
      const query = 'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING *';
      const result = await db.query(query, [notificationId, userId]);
      return result.rows[0];
    } catch (error) {
      logger.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Get scheduled notifications
  static async getScheduledNotifications() {
    try {
      const query = `
        SELECT n.*, u.email, np.email_enabled
        FROM notifications n
        JOIN users u ON n.user_id = u.id
        LEFT JOIN notification_preferences np ON n.user_id = np.user_id
        WHERE n.scheduled_for <= NOW() 
        AND n.sent_at IS NULL
        ORDER BY n.scheduled_for ASC
      `;
      
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching scheduled notifications:', error);
      throw error;
    }
  }

  // Mark notification as sent
  static async markAsSent(notificationId) {
    try {
      const query = `
        UPDATE notifications 
        SET sent_at = NOW() 
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await db.query(query, [notificationId]);
      return result.rows[0];
    } catch (error) {
      logger.error('Error marking notification as sent:', error);
      throw error;
    }
  }

  // Get/Create notification preferences
  static async getPreferences(userId) {
    try {
      let query = 'SELECT * FROM notification_preferences WHERE user_id = $1';
      let result = await db.query(query, [userId]);
      
      if (result.rows.length === 0) {
        // Create default preferences
        query = `
          INSERT INTO notification_preferences (user_id, email_enabled, due_date_reminder, reminder_minutes, daily_summary)
          VALUES ($1, true, true, 60, false)
          RETURNING *
        `;
        result = await db.query(query, [userId]);
      }
      
      return result.rows[0];
    } catch (error) {
      logger.error('Error fetching notification preferences:', error);
      throw error;
    }
  }

  // Update notification preferences
  static async updatePreferences(userId, preferences) {
    try {
      const { emailEnabled, dueDateReminder, reminderMinutes, dailySummary } = preferences;
      
      const query = `
        UPDATE notification_preferences 
        SET email_enabled = $2, due_date_reminder = $3, reminder_minutes = $4, daily_summary = $5, updated_at = NOW()
        WHERE user_id = $1
        RETURNING *
      `;
      
      const result = await db.query(query, [userId, emailEnabled, dueDateReminder, reminderMinutes, dailySummary]);
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating notification preferences:', error);
      throw error;
    }
  }
}

module.exports = Notification;