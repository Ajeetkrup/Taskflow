import React from 'react';
import NotificationItem from './NotificationItem';

const NotificationList = ({ notifications, onMarkAsRead, onDelete }) => {
  if (notifications.length === 0) {
    return (
      <div className="empty-state">
        <p>No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="notification-list">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default NotificationList;