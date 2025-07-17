import React, { useState, useEffect } from 'react';

const NotificationPopover = ({ message, status, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 2500); // 2.5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible || !message) return null;

  return (
    <div className={`notification-popover ${status === 'error' ? 'error' : 'success'}`}>
      <div className="notification-content">
        <span className="notification-message">{message}</span>
      </div>
      <style jsx>{`
        .notification-popover {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 16px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          max-width: 300px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: white;
          animation: slideIn 0.3s ease-out;
        }

        .notification-popover.success {
          background-color: #10b981;
          border-left: 4px solid #065f46;
        }

        .notification-popover.error {
          background-color: #ef4444;
          border-left: 4px solid #7f1d1d;
        }

        .notification-content {
          display: flex;
          align-items: center;
        }

        .notification-message {
          line-height: 1.4;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @media (max-width: 480px) {
          .notification-popover {
            left: 20px;
            right: 20px;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationPopover;