import React from 'react';
import Button from '../common/Button';

const TaskItem = ({ task, onEdit, onDelete, onToggleStatus }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'in-progress': return 'status-progress';
      case 'pending': return 'status-pending';
      default: return 'status-pending';
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  return (
    <div className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}>
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <div className="task-badges">
          <span className={`priority-badge ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <span className={`status-badge ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
        </div>
      </div>
      
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}
      
      <div className="task-details">
        {task.category && (
          <span className="task-category">📁 {task.category}</span>
        )}
        {task.due_date && (
          <span className={`task-due-date ${isOverdue ? 'overdue' : ''}`}>
            📅 {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
      </div>
      
      <div className="task-actions">
        <Button
          variant="secondary"
          size="small"
          onClick={() => onToggleStatus(task)}
        >
          {task.status === 'completed' ? 'Reopen' : 'Complete'}
        </Button>
        <Button
          variant="secondary"
          size="small"
          onClick={() => onEdit(task)}
        >
          Edit
        </Button>
        <Button
          variant="danger"
          size="small"
          onClick={() => onDelete(task.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default TaskItem;
