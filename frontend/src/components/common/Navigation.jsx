import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import NotificationBell from '../notifications/NotificationBell';

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/dashboard">TaskFlow</Link>
      </div>
      <div className="nav-links">
        <Link
          to="/dashboard"
          className={isActive('/dashboard') ? 'active' : ''}
        >
          Dashboard
        </Link>
        <Link
          to="/tasks"
          className={isActive('/tasks') ? 'active' : ''}
        >
          Tasks
        </Link>
        <Link
          to="/analytics"
          className={isActive('/analytics') ? 'active' : ''}
        >
          Analytics
        </Link>
        <Link
          to="/profile"
          className={isActive('/profile') ? 'active' : ''}
        >
          Profile
        </Link>
        <Link
          to="/notifications"
          className={isActive('/notifications') ? 'active' : ''}
        >
          Notifications
        </Link>
      </div>
      <div className="nav-actions">
        <NotificationBell />
        <button onClick={logout} className="nav-logout">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navigation;