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
        SET is_read = true, updated_at = CURRENT_TIMESTAMP
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

  // Mark all notifications as read for a user
  static async markAllAsRead(userId) {
    try {
      const query = `
        UPDATE notifications 
        SET is_read = true, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND is_read = false
        RETURNING *
      `;

      const result = await db.query(query, [userId]);
      return result.rows;
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
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

  // Delete all notifications for a user
  static async deleteAllForUser(userId) {
    try {
      const query = 'DELETE FROM notifications WHERE user_id = $1 RETURNING *';
      const result = await db.query(query, [userId]);
      return result.rows;
    } catch (error) {
      logger.error('Error deleting all notifications:', error);
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
        SET sent_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
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
      const values = [userId];
      const setClauses = [];
      let paramIndex = 2; // Start after $1 (userId)

      // Map JS field names to DB columns
      const fieldMap = {
        emailEnabled: 'email_enabled',
        dueDateReminder: 'due_date_reminder',
        reminderMinutes: 'reminder_minutes',
        dailySummary: 'daily_summary'
      };

      // Build dynamic SET clauses
      Object.entries(fieldMap).forEach(([jsField, dbColumn]) => {
        if (preferences[jsField] !== undefined) {
          setClauses.push(`${dbColumn} = $${paramIndex}`);
          values.push(preferences[jsField]);
          paramIndex++;
        }
      });

      // Handle case where no valid fields were provided
      if (setClauses.length === 0) {
        throw new Error('No valid fields provided for update');
      }

      // Always update the timestamp
      setClauses.push('updated_at = CURRENT_TIMESTAMP');

      const query = `
      UPDATE notification_preferences 
      SET ${setClauses.join(', ')}
      WHERE user_id = $1
      RETURNING *
    `;

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  // Get notifications by type
  static async getByType(userId, type, limit = 20, offset = 0) {
    try {
      const query = `
        SELECT n.*, t.title as task_title
        FROM notifications n
        LEFT JOIN tasks t ON n.task_id = t.id
        WHERE n.user_id = $1 AND n.type = $2
        ORDER BY n.created_at DESC
        LIMIT $3 OFFSET $4
      `;

      const result = await db.query(query, [userId, type, limit, offset]);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching notifications by type:', error);
      throw error;
    }
  }

  // Get notification statistics
  static async getStats(userId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN is_read = false THEN 1 END) as unread,
          COUNT(CASE WHEN is_read = true THEN 1 END) as read,
          COUNT(CASE WHEN sent_at IS NOT NULL THEN 1 END) as sent,
          COUNT(CASE WHEN scheduled_for > NOW() THEN 1 END) as scheduled
        FROM notifications 
        WHERE user_id = $1
      `;

      const result = await db.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      logger.error('Error fetching notification stats:', error);
      throw error;
    }
  }
}

module.exports = Notification;