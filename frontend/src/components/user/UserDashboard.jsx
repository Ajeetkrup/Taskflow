// File: src/components/user/UserDashboard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

const UserDashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome, {user?.name}!</h1>
        <div className="dashboard-actions">
          <Link to="/profile" className="dashboard-link">Profile</Link>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>
      
      <main className="dashboard-main">
        <div className="dashboard-card">
          <h2>User Information</h2>
          <div className="user-info">
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Member since:</strong> {new Date(user?.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="dashboard-card">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/profile" className="action-button">Edit Profile</Link>
            <button className="action-button">View Tasks</button>
            <button className="action-button">Settings</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;