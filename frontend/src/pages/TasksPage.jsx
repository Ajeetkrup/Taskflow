import React from 'react';
import Navigation from '../components/common/Navigation';
import TaskList from '../components/tasks/TaskList';
import TaskStats from '../components/tasks/TaskStats';

const TasksPage = () => {
  return (
    <div className="tasks-page">
      <Navigation />
      <div className="page-header">
        <h1>Task Management</h1>
      </div>
      <div className="page-content">
        <div className="main-content">
          <TaskList />
        </div>
        <div className="sidebar">
          <TaskStats />
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
