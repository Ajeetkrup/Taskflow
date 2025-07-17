import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationList from '../components/notifications/NotificationList';
import NotificationPreferences from '../components/notifications/NotificationPreferences';
import Loader from '../components/common/Loader';

const NotificationsPage = () => {
  const {
    notifications,
    preferences,
    loading,
    error,
    markAsRead,
    deleteNotification,
    updatePreferences
  } = useNotifications();

  if (loading) return <Loader />;
  if (error) return <div className="error">Error: {error}</div>;

  console.log("updatePreferences -- ", preferences) 

  return (
    <div className="notifications-page">
      <div className="page-header">
        <h1>Notifications</h1>
      </div>
      
      <div className="notifications-content">
        <div className="notifications-section">
          <h2>Recent Notifications</h2>
          <NotificationList
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
          />
        </div>
        
        <div className="preferences-section">
          <NotificationPreferences
            preferences={preferences}
            onUpdate={updatePreferences}
          />
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;