const User = require('../models/User');

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName } = req.body;
    
    // Update user profile
    const updatedUser = await User.updateProfile(userId, {
      firstName,
      lastName
    });
    
    if (!updatedUser) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }
    
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser.toJSON()
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

// Update user password
const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password for verification
    const user = await User.findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }
    
    // Verify current password
    const isValidPassword = await User.verifyPassword(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ 
        error: 'Current password is incorrect' 
      });
    }

    //Verify if both the passwords should not be equal
    if(currentPassword === newPassword) {
      return res.status(400).json({ 
        error: 'Both passwords can not be equal' 
      });
    }
    
    // Update password
    const success = await User.updatePassword(userId, newPassword);
    if (!success) {
      return res.status(400).json({ 
        error: 'Failed to update password' 
      });
    }
    
    res.json({
      message: 'Password updated successfully'
    });
    
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

// Get user by ID (for other services)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }
    
    res.json({
      user: user.toJSON()
    });
    
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

// Deactivate user account
const deactivateAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const success = await User.deactivate(userId);
    if (!success) {
      return res.status(400).json({ 
        error: 'Failed to deactivate account' 
      });
    }
    
    res.json({
      message: 'Account deactivated successfully'
    });
    
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

module.exports = {
  updateProfile,
  updatePassword,
  getUserById,
  deactivateAccount
};