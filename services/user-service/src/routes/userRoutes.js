const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');
const { validateProfileUpdate, validatePasswordUpdate } = require('../middleware/validation');

// Protected routes (require authentication)
router.put('/profile', verifyToken, validateProfileUpdate, userController.updateProfile);
router.put('/password', verifyToken, validatePasswordUpdate, userController.updatePassword);
router.delete('/deactivate', verifyToken, userController.deactivateAccount);

// Internal routes (for other microservices)
router.get('/:id', userController.getUserById);

module.exports = router;