const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { setSession, deleteSession } = require('../utils/redis');

// Register new user
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Check if user already exists
    const existingUser = await User.emailExists(email);
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email already exists' 
      });
    }
    
    // Create new user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName
    });
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Store session in Redis
    const sessionKey = `user_session:${user.id}`;
    const sessionData = {
      userId: user.id,
      email: user.email,
      loginTime: new Date().toISOString()
    };
    
    await setSession(sessionKey, sessionData, 24 * 60 * 60); // 24 hours
    
    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      token
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }
    
    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Store session in Redis
    const sessionKey = `user_session:${user.id}`;
    const sessionData = {
      userId: user.id,
      email: user.email,
      loginTime: new Date().toISOString()
    };
    
    await setSession(sessionKey, sessionData, 24 * 60 * 60); // 24 hours
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Remove session from Redis
    const sessionKey = `user_session:${userId}`;
    await deleteSession(sessionKey);
    
    res.json({
      message: 'Logout successful'
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    res.json({
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

// Verify token (health check for authentication)
const verifyToken = async (req, res) => {
  try {
    res.json({
      message: 'Token is valid',
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  verifyToken
};