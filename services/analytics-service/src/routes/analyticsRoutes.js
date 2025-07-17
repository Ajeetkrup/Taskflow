const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Analytics endpoints
router.get('/overview', analyticsController.getOverview);
router.get('/productivity', analyticsController.getProductivity);
router.get('/categories', analyticsController.getCategoryStats);
router.get('/trends', analyticsController.getTrends);

module.exports = router;