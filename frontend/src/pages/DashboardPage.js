import React from 'react';
import Navigation from '../components/common/Navigation';
import TaskStats from '../components/tasks/TaskStats';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-page">
      <Navigation />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Here's your task overview</p>
        </div>
        
        <div className="dashboard-widgets">
          <div className="widget">
            <TaskStats />
          </div>
          
          <div className="widget">
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              <Link to="/tasks" className="action-button">
                📝 View All Tasks
              </Link>
              <Link to="/tasks" className="action-button">
                ➕ Create New Task
              </Link>
              <Link to="/profile" className="action-button">
                👤 Update Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
