const express = require('express');
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const validation = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Task routes
router.get('/', taskController.getAllTasks);
router.get('/stats', taskController.getTaskStats);
router.get('/category/:category', taskController.getTasksByCategory);
router.get('/:id', taskController.getTaskById);
router.post('/', validation.validateTask, taskController.createTask);
router.put('/:id', validation.validateTask, taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
