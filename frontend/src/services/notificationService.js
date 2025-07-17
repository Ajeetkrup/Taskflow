import { notificationApiClient } from './apiClient';

export const notificationService = {
  // Get user notifications
  getNotifications: () => notificationApiClient.get('/api/notifications'),

  // Mark notification as read
  markAsRead: (id) => notificationApiClient.put(`/api/notifications/${id}/read`),

  // Delete notification
  deleteNotification: (id) => notificationApiClient.delete(`/api/notifications/${id}`),

  // Get notification preferences
  getPreferences: () => notificationApiClient.get('/api/notifications/preferences'),

  // Update notification preferences
  updatePreferences: (preferences) => notificationApiClient.post('/api/notifications/preferences', preferences),

  // Send test notification
  sendTestNotification: () => notificationApiClient.post('/api/notifications/test')
};
