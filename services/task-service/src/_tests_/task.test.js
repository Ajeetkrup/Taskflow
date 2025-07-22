const request = require('supertest');
const express = require('express');
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const validation = require('../middleware/validation');

// Mock dependencies
jest.mock('../controllers/taskController');
jest.mock('../middleware/auth');
jest.mock('../middleware/validation');

describe('Task Routes Unit Tests', () => {
  let app;
  let router;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create fresh Express app and router for each test
    app = express();
    app.use(express.json());

    // Mock middleware to call next() by default
    auth.mockImplementation((req, res, next) => {
      req.user = { id: 1, email: 'test@example.com' };
      next();
    });

    validation.validateTask.mockImplementation((req, res, next) => {
      next();
    });

    // Mock controller methods to send success responses by default
    taskController.getAllTasks.mockImplementation((req, res) => {
      res.status(200).json({ success: true, data: [] });
    });

    taskController.getTaskStats.mockImplementation((req, res) => {
      res.status(200).json({ success: true, data: { total_tasks: 0 } });
    });

    taskController.getTasksByCategory.mockImplementation((req, res) => {
      res.status(200).json({ success: true, data: [] });
    });

    taskController.getTaskById.mockImplementation((req, res) => {
      res.status(200).json({ success: true, data: { id: 1 } });
    });

    taskController.createTask.mockImplementation((req, res) => {
      res.status(201).json({ success: true, data: { id: 1 } });
    });

    taskController.updateTask.mockImplementation((req, res) => {
      res.status(200).json({ success: true, data: { id: 1 } });
    });

    taskController.deleteTask.mockImplementation((req, res) => {
      res.status(200).json({ success: true, data: { id: 1 } });
    });

    // Load the router after mocking
    router = require('../routes/taskRoutes');
    app.use('/api/tasks', router);
  });

  describe('Middleware Application', () => {
    test('should apply auth middleware to all routes', async () => {
      await request(app).get('/api/tasks');
      expect(auth).toHaveBeenCalled();
    });

    test('should block unauthenticated requests', async () => {
      // Mock auth to return 401
      auth.mockImplementation((req, res, next) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      const response = await request(app).get('/api/tasks');
      
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
      expect(taskController.getAllTasks).not.toHaveBeenCalled();
    });
  });

  describe('GET /', () => {
    test('should call getAllTasks controller', async () => {
      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(200);
      expect(auth).toHaveBeenCalled();
      expect(taskController.getAllTasks).toHaveBeenCalledTimes(1);
    });

    test('should pass request and response objects to controller', async () => {
      await request(app).get('/api/tasks');

      expect(taskController.getAllTasks).toHaveBeenCalledWith(
        expect.objectContaining({
          user: { id: 1, email: 'test@example.com' }
        }),
        expect.objectContaining({
          status: expect.any(Function),
          json: expect.any(Function)
        }),
        expect.any(Function)
      );
    });
  });

  describe('GET /stats', () => {
    test('should call getTaskStats controller', async () => {
      const response = await request(app).get('/api/tasks/stats');

      expect(response.status).toBe(200);
      expect(auth).toHaveBeenCalled();
      expect(taskController.getTaskStats).toHaveBeenCalledTimes(1);
    });

    test('should return stats data structure', async () => {
      const response = await request(app).get('/api/tasks/stats');

      expect(response.body).toEqual({
        success: true,
        data: { total_tasks: 0 }
      });
    });
  });

  describe('GET /category/:category', () => {
    test('should call getTasksByCategory controller with category parameter', async () => {
      const category = 'work';
      const response = await request(app).get(`/api/tasks/category/${category}`);

      expect(response.status).toBe(200);
      expect(auth).toHaveBeenCalled();
      expect(taskController.getTasksByCategory).toHaveBeenCalledTimes(1);
    });

    test('should pass category parameter to controller', async () => {
      const category = 'personal';
      await request(app).get(`/api/tasks/category/${category}`);

      expect(taskController.getTasksByCategory).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { category: 'personal' }
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('GET /:id', () => {
    test('should call getTaskById controller with id parameter', async () => {
      const taskId = '123';
      const response = await request(app).get(`/api/tasks/${taskId}`);

      expect(response.status).toBe(200);
      expect(auth).toHaveBeenCalled();
      expect(taskController.getTaskById).toHaveBeenCalledTimes(1);
    });

    test('should pass id parameter to controller', async () => {
      const taskId = '456';
      await request(app).get(`/api/tasks/${taskId}`);

      expect(taskController.getTaskById).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: '456' }
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('POST /', () => {
    test('should apply validation middleware and call createTask controller', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        category: 'work'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData);

      expect(response.status).toBe(201);
      expect(auth).toHaveBeenCalled();
      expect(validation.validateTask).toHaveBeenCalled();
      expect(taskController.createTask).toHaveBeenCalledTimes(1);
    });

    test('should pass request body to controller', async () => {
      const taskData = {
        title: 'New Task',
        description: 'Task Description',
        category: 'personal',
        priority: 'high'
      };

      await request(app)
        .post('/api/tasks')
        .send(taskData);

      expect(taskController.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          body: taskData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    test('should block request if validation fails', async () => {
      validation.validateTask.mockImplementation((req, res, next) => {
        res.status(400).json({ error: 'Validation failed' });
      });

      const response = await request(app)
        .post('/api/tasks')
        .send({ invalid: 'data' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(taskController.createTask).not.toHaveBeenCalled();
    });
  });

  describe('PUT /:id', () => {
    test('should apply validation middleware and call updateTask controller', async () => {
      const taskId = '123';
      const updateData = {
        title: 'Updated Task',
        status: 'completed'
      };

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(auth).toHaveBeenCalled();
      expect(validation.validateTask).toHaveBeenCalled();
      expect(taskController.updateTask).toHaveBeenCalledTimes(1);
    });

    test('should pass id parameter and request body to controller', async () => {
      const taskId = '789';
      const updateData = {
        title: 'Modified Task',
        priority: 'low',
        status: 'in-progress'
      };

      await request(app)
        .put(`/api/tasks/${taskId}`)
        .send(updateData);

      expect(taskController.updateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: '789' },
          body: updateData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    test('should block request if validation fails', async () => {
      validation.validateTask.mockImplementation((req, res, next) => {
        res.status(400).json({ error: 'Invalid task data' });
      });

      const response = await request(app)
        .put('/api/tasks/123')
        .send({ title: '' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid task data');
      expect(taskController.updateTask).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /:id', () => {
    test('should call deleteTask controller with id parameter', async () => {
      const taskId = '123';
      const response = await request(app).delete(`/api/tasks/${taskId}`);

      expect(response.status).toBe(200);
      expect(auth).toHaveBeenCalled();
      expect(taskController.deleteTask).toHaveBeenCalledTimes(1);
    });

    test('should pass id parameter to controller', async () => {
      const taskId = '999';
      await request(app).delete(`/api/tasks/${taskId}`);

      expect(taskController.deleteTask).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: '999' }
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    test('should not apply validation middleware', async () => {
      await request(app).delete('/api/tasks/123');

      expect(validation.validateTask).not.toHaveBeenCalled();
      expect(taskController.deleteTask).toHaveBeenCalled();
    });
  });

  describe('Route Order and Specificity', () => {
    test('should handle /stats route before /:id route', async () => {
      await request(app).get('/api/tasks/stats');

      expect(taskController.getTaskStats).toHaveBeenCalled();
      expect(taskController.getTaskById).not.toHaveBeenCalled();
    });

    test('should handle /category/:category route before /:id route', async () => {
      await request(app).get('/api/tasks/category/work');

      expect(taskController.getTasksByCategory).toHaveBeenCalled();
      expect(taskController.getTaskById).not.toHaveBeenCalled();
    });
  });

  describe('HTTP Methods', () => {
    test('should only accept GET for / route', async () => {
      const postResponse = await request(app).post('/api/tasks/');
      const putResponse = await request(app).put('/api/tasks/');
      const deleteResponse = await request(app).delete('/api/tasks/');

      // POST should be handled (different route)
      expect(postResponse.status).toBe(201);
      
      // PUT and DELETE should return 404 or 405
      expect([404, 405]).toContain(putResponse.status);
      expect([404, 405]).toContain(deleteResponse.status);
    });

    test('should only accept GET for /stats route', async () => {
      const getResponse = await request(app).get('/api/tasks/stats');
      const postResponse = await request(app).post('/api/tasks/stats');

      expect(getResponse.status).toBe(200);
      expect([404, 405]).toContain(postResponse.status);
    });
  });

  describe('Error Handling', () => {
    test('should handle controller errors gracefully', async () => {
      taskController.getAllTasks.mockImplementation((req, res, next) => {
        const error = new Error('Controller error');
        next(error);
      });

      const response = await request(app).get('/api/tasks');

      expect(taskController.getAllTasks).toHaveBeenCalled();
      // The actual error handling would depend on your error middleware
    });

    test('should handle auth middleware errors', async () => {
      auth.mockImplementation((req, res, next) => {
        const error = new Error('Auth error');
        next(error);
      });

      const response = await request(app).get('/api/tasks');

      expect(auth).toHaveBeenCalled();
      expect(taskController.getAllTasks).not.toHaveBeenCalled();
    });
  });
});