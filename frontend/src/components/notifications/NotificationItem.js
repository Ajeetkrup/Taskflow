import React from 'react';

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const handleMarkAsRead = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
  };

  const handleDelete = () => {
    onDelete(notification.id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}>
      <div className="notification-content">
        <h4>{notification.title}</h4>
        <p>{notification.message}</p>
        <small>{formatDate(notification.created_at)}</small>
      </div>
      <div className="notification-actions">
        {!notification.is_read && (
          <button onClick={handleMarkAsRead} className="btn-mark-read">
            Mark as Read
          </button>
        )}
        <button onClick={handleDelete} className="btn-delete">
          ×
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;