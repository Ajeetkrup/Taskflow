const axios = require('axios');
const Notification = require('../models/Notification');
const emailService = require('./emailService');
const logger = require('../utils/logger');

class ReminderService {
  // Create due date reminders for tasks
  async createDueDateReminders() {
    try {
      // Get tasks with due dates from task service
      const response = await axios.get(`${process.env.TASK_SERVICE_URL}/api/tasks/due-soon`);
      const tasks = response.data;

      for (const task of tasks) {
        // Get user's notification preferences
        const preferences = await Notification.getPreferences(task.user_id);
        
        if (preferences.due_date_reminder) {
          // Calculate reminder time
          const dueDate = new Date(task.due_date);
          const reminderTime = new Date(dueDate.getTime() - (preferences.reminder_minutes * 60 * 1000));
          
          // Check if reminder should be sent now
          if (reminderTime <= new Date()) {
            await this.sendDueDateReminder(task);
          } else {
            // Create scheduled notification
            await Notification.create({
              userId: task.user_id,
              taskId: task.id,
              type: 'due_date',
              title: `Task Due Soon: ${task.title}`,
              message: `Your task "${task.title}" is due on ${dueDate.toLocaleDateString()}`,
              scheduledFor: reminderTime
            });
          }
        }
      }
    } catch (error) {
      logger.error('Error creating due date reminders:', error);
    }
  }

  // Send due date reminder
  async sendDueDateReminder(task) {
    try {
      // Get user details
      const userResponse = await axios.get(`${process.env.USER_SERVICE_URL}/api/users/${task.user_id}`);
      const user = userResponse.data;

      // Get notification preferences
      const preferences = await Notification.getPreferences(task.user_id);

      // Create notification record
      const notification = await Notification.create({
        userId: task.user_id,
        taskId: task.id,
        type: 'due_date',
        title: `Task Due Soon: ${task.title}`,
        message: `Your task "${task.title}" is due on ${new Date(task.due_date).toLocaleDateString()}`,
        scheduledFor: new Date()
      });

      // Send email if enabled
      if (preferences.email_enabled) {
        await emailService.sendDueDateReminder(user.email, task);
      }

      // Mark as sent
      await Notification.markAsSent(notification.id);
      
      logger.info(`Due date reminder sent for task ${task.id} to user ${task.user_id}`);
    } catch (error) {
      logger.error('Error sending due date reminder:', error);
    }
  }

  // Generate and send daily summary
  async sendDailySummary() {
    try {
      // Get all users who have daily summary enabled
      const usersResponse = await axios.get(`${process.env.USER_SERVICE_URL}/api/users/active`);
      const users = usersResponse.data;

      for (const user of users) {
        const preferences = await Notification.getPreferences(user.id);
        
        if (preferences.daily_summary) {
          // Get user's task statistics
          const tasksResponse = await axios.get(`${process.env.TASK_SERVICE_URL}/api/tasks/stats?userId=${user.id}`);
          const summary = tasksResponse.data;

          // Create notification
          await Notification.create({
            userId: user.id,
            taskId: null,
            type: 'daily_summary',
            title: 'Daily Task Summary',
            message: `Completed: ${summary.completed}, Pending: ${summary.pending}, Overdue: ${summary.overdue}`,
            scheduledFor: new Date()
          });

          // Send email if enabled
          if (preferences.email_enabled) {
            await emailService.sendDailySummary(user.email, user.name, summary);
          }
        }
      }
    } catch (error) {
      logger.error('Error sending daily summary:', error);
    }
  }

  // Process scheduled notifications
  async processScheduledNotifications() {
    try {
      const scheduledNotifications = await Notification.getScheduledNotifications();
      
      for (const notification of scheduledNotifications) {
        if (notification.email_enabled) {
          // Send email based on notification type
          switch (notification.type) {
            case 'due_date':
              // Get task details
              const taskResponse = await axios.get(`${process.env.TASK_SERVICE_URL}/api/tasks/${notification.task_id}`);
              const task = taskResponse.data;
              await emailService.sendDueDateReminder(notification.email, task);
              break;
            
            case 'task_update':
              // Handle task update notifications
              break;
            
            default:
              logger.warn(`Unknown notification type: ${notification.type}`);
          }
        }
        
        // Mark as sent
        await Notification.markAsSent(notification.id);
      }
    } catch (error) {
      logger.error('Error processing scheduled notifications:', error);
    }
  }

  // Create task update notification
  async createTaskUpdateNotification(userId, taskId, updateType) {
    try {
      const preferences = await Notification.getPreferences(userId);
      
      if (preferences.email_enabled) {
        // Get task and user details
        const [taskResponse, userResponse] = await Promise.all([
          axios.get(`${process.env.TASK_SERVICE_URL}/api/tasks/${taskId}`),
          axios.get(`${process.env.USER_SERVICE_URL}/api/users/${userId}`)
        ]);
        
        const task = taskResponse.data;
        const user = userResponse.data;

        // Create notification
        await Notification.create({
          userId,
          taskId,
          type: 'task_update',
          title: `Task ${updateType}: ${task.title}`,
          message: `Your task "${task.title}" has been ${updateType}`,
          scheduledFor: new Date()
        });

        // Send email immediately
        await emailService.sendTaskUpdateNotification(user.email, task, updateType);
      }
    } catch (error) {
      logger.error('Error creating task update notification:', error);
    }
  }
}

module.exports = new ReminderService();