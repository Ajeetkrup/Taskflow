const Notification = require('../models/Notification');
const reminderService = require('../services/reminderService');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

class NotificationController {
  // Get user notifications
  async getNotifications(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;
      
      const notifications = await Notification.getByUserId(req.user.id, parseInt(limit), offset);
      const unreadCount = await Notification.getUnreadCount(req.user.id);
      
      res.json({
        notifications,
        unreadCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: notifications.length
        }
      });
    } catch (error) {
      logger.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }

  // Get unread notifications count
  async getUnreadCount(req, res) {
    try {
      const count = await Notification.getUnreadCount(req.user.id);
      res.json({ unreadCount: count });
    } catch (error) {
      logger.error('Error fetching unread count:', error);
      res.status(500).json({ error: 'Failed to fetch unread count' });
    }
  }

  // Mark notification as read
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const notification = await Notification.markAsRead(id, req.user.id);
      
      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      
      res.json({ message: 'Notification marked as read', notification });
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  }

  // Delete notification
  async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const notification = await Notification.delete(id, req.user.id);
      
      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      
      res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
      logger.error('Error deleting notification:', error);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  }

  // Get notification preferences
  async getPreferences(req, res) {
    try {
      const preferences = await Notification.getPreferences(req.user.id);
      res.json(preferences);
    } catch (error) {
      logger.error('Error fetching notification preferences:', error);
      res.status(500).json({ error: 'Failed to fetch notification preferences' });
    }
  }

  // Update notification preferences
  async updatePreferences(req, res) {
    try {
      const preferences = await Notification.updatePreferences(req.user.id, req.body);
      res.json({ message: 'Notification preferences updated successfully', preferences });
    } catch (error) {
      logger.error('Error updating notification preferences:', error);
      res.status(500).json({ error: 'Failed to update notification preferences' });
    }
  }

  // Create notification (internal API)
  async createNotification(req, res) {
    try {
      const { userId, taskId, type, title, message, scheduledFor } = req.body;
      
      const notification = await Notification.create({
        userId,
        taskId,
        type,
        title,
        message,
        scheduledFor
      });
      
      res.status(201).json({ message: 'Notification created successfully', notification });
    } catch (error) {
      logger.error('Error creating notification:', error);
      res.status(500).json({ error: 'Failed to create notification' });
    }
  }

  // Send test notification
  async sendTestNotification(req, res) {
    try {
      const { type = 'test' } = req.body;
      
      // Create test notification
      const notification = await Notification.create({
        userId: req.user.id,
        taskId: null,
        type: 'test',
        title: 'Test Notification',
        message: 'This is a test notification to verify your notification settings.',
        scheduledFor: new Date()
      });

      // Get user preferences
      const preferences = await Notification.getPreferences(req.user.id);

      // Send test email if enabled
      if (preferences.email_enabled) {
        await emailService.sendEmail(
          req.user.email,
          'Test Notification - TaskFlow',
          'This is a test notification to verify your notification settings.',
          '<p>This is a test notification to verify your notification settings.</p>'
        );
      }

      res.json({ message: 'Test notification sent successfully', notification });
    } catch (error) {
      logger.error('Error sending test notification:', error);
      res.status(500).json({ error: 'Failed to send test notification' });
    }
  }

  // Manual trigger for due date reminders (admin/testing)
  async triggerDueDateCheck(req, res) {
    try {
      await reminderService.createDueDateReminders();
      res.json({ message: 'Due date check triggered successfully' });
    } catch (error) {
      logger.error('Error triggering due date check:', error);
      res.status(500).json({ error: 'Failed to trigger due date check' });
    }
  }

  // Mark all notifications as read
  async markAllAsRead(req, res) {
    try {
      const db = require('../utils/database');
      const query = `
        UPDATE notifications 
        SET is_read = true 
        WHERE user_id = $1 AND is_read = false
      `;
      
      await db.query(query, [req.user.id]);
      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  }
}

module.exports = new NotificationController();