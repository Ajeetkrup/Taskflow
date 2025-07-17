const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');
const { validateNotificationPreferences, validateNotificationCreate } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// Get user notifications
router.get('/', notificationController.getNotifications);

// Get unread notifications count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark notification as read
router.put('/:id/read', notificationController.markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

// Get notification preferences
router.get('/preferences', notificationController.getPreferences);

// Update notification preferences
router.post('/preferences', validateNotificationPreferences, notificationController.updatePreferences);

// Create notification (internal API)
router.post('/', validateNotificationCreate, notificationController.createNotification);

// Send test notification
router.post('/test', notificationController.sendTestNotification);

// Manual trigger for due date check (admin/testing)
router.post('/trigger/due-date-check', notificationController.triggerDueDateCheck);

module.exports = router;