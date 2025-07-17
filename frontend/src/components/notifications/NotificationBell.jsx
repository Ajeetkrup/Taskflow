import React, { useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationList from './NotificationList';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markAsRead, deleteNotification } = useNotifications();
  
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="notification-bell">
      <button 
        className="bell-button" 
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>
      
      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <button 
              className="close-button" 
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>
          <NotificationList
            notifications={notifications.slice(0, 5)}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
          />
          {notifications.length > 5 && (
            <div className="view-all">
              <a href="/notifications">View All</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;