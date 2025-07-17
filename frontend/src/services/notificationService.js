import apiClient from './apiClient';

export const notificationService = {
  // Get user notifications
  getNotifications: () => apiClient.get('/api/notifications'),
  
  // Mark notification as read
  markAsRead: (id) => apiClient.put(`/api/notifications/${id}/read`),
  
  // Delete notification
  deleteNotification: (id) => apiClient.delete(`/api/notifications/${id}`),
  
  // Get notification preferences
  getPreferences: () => apiClient.get('/api/notifications/preferences'),
  
  // Update notification preferences
  updatePreferences: (preferences) => apiClient.post('/api/notifications/preferences', preferences),
  
  // Send test notification
  sendTestNotification: () => apiClient.post('/api/notifications/test')
};
