import React, { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';

const TaskForm = ({ task, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    category: task?.category || '',
    priority: task?.priority || 'medium',
    status: task?.status || 'pending',
    due_date: task?.due_date ? task.due_date.split('T')[0] : ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <Input
        name="title"
        type="text"
        placeholder="Task title"
        value={formData.title}
        onChange={handleChange}
        required
      />
      
      <textarea
        name="description"
        placeholder="Task description"
        value={formData.description}
        onChange={handleChange}
        className="form-textarea"
        rows="3"
      />
      
      <Input
        name="category"
        type="text"
        placeholder="Category"
        value={formData.category}
        onChange={handleChange}
      />
      
      <select
        name="priority"
        value={formData.priority}
        onChange={handleChange}
        className="form-select"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      
      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
        className="form-select"
      >
        <option value="pending">Pending</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
      
      <Input
        name="due_date"
        type="date"
        value={formData.due_date}
        onChange={handleChange}
      />
      
      <div className="form-actions">
        <Button type="submit" variant="primary">
          {task ? 'Update Task' : 'Create Task'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
