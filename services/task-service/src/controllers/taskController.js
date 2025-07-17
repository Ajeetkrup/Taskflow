const Task = require('../models/Task');
const { redisClient } = require('../utils/redis');

const taskController = {
  // Get all tasks for user
  getAllTasks: async (req, res) => {
    try {
      const userId = req.user.id;
      const cacheKey = `user:${userId}:tasks`;
      
      // Check cache first
      const cachedTasks = await redisClient.get(cacheKey);
      if (cachedTasks) {
        return res.json(JSON.parse(cachedTasks));
      }

      const tasks = await Task.findByUserId(userId);
      
      // Cache for 5 minutes
      await redisClient.setex(cacheKey, 300, JSON.stringify(tasks));
      
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  },

  // Get task by ID
  getTaskById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const task = await Task.findById(id, userId);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      res.json(task);
    } catch (error) {
      console.error('Error fetching task:', error);
      res.status(500).json({ error: 'Failed to fetch task' });
    }
  },

  // Create new task
  createTask: async (req, res) => {
    try {
      const userId = req.user.id;
      const task = await Task.create(userId, req.body);
      
      // Clear cache
      await redisClient.del(`user:${userId}:tasks`);
      
      res.status(201).json(task);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  },

  // Update task
  updateTask: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const task = await Task.update(id, userId, req.body);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      // Clear cache
      await redisClient.del(`user:${userId}:tasks`);
      
      res.json(task);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  },

  // Delete task
  deleteTask: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const task = await Task.delete(id, userId);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      // Clear cache
      await redisClient.del(`user:${userId}:tasks`);
      
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  },

  // Get tasks by category
  getTasksByCategory: async (req, res) => {
    try {
      const { category } = req.params;
      const userId = req.user.id;
      
      const tasks = await Task.findByCategory(userId, category);
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks by category:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  },

  // Get task statistics
  getTaskStats: async (req, res) => {
    try {
      const userId = req.user.id;
      const stats = await Task.getStats(userId);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching task stats:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }
};

module.exports = taskController;
