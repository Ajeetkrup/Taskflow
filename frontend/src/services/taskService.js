import { taskApiClient } from './apiClient';

const API_BASE = '/api/tasks';

export const taskService = {
  // Get all tasks
  getTasks: async () => {
    const response = await taskApiClient.get(API_BASE);
    return response.data;
  },

  // Get task by ID
  getTask: async (id) => {
    const response = await taskApiClient.get(`${API_BASE}/${id}`);
    return response.data;
  },

  // Create new task
  createTask: async (taskData) => {
    const response = await taskApiClient.post(API_BASE, taskData);
    return response.data;
  },

  // Update task
  updateTask: async (id, taskData) => {
    const response = await taskApiClient.put(`${API_BASE}/${id}`, taskData);
    return response.data;
  },

  // Delete task
  deleteTask: async (id) => {
    const response = await taskApiClient.delete(`${API_BASE}/${id}`);
    return response.data;
  },

  // Get tasks by category
  getTasksByCategory: async (category) => {
    const response = await taskApiClient.get(`${API_BASE}/category/${category}`);
    return response.data;
  },

  // Get task statistics
  getTaskStats: async () => {
    const response = await taskApiClient.get(`${API_BASE}/stats`);
    return response.data;
  }
};
