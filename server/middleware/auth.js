const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Authenticate admin user
const authenticateAdmin = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication Error',
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is admin
    if (!decoded.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Authorization Error',
        message: 'Admin access required'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    logger.errorWithContext(error, { method: 'authenticateAdmin' });
    res.status(401).json({
      success: false,
      error: 'Authentication Error',
      message: 'Invalid token'
    });
  }
};

// Authenticate any user (for future use)
const authenticateUser = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication Error',
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.errorWithContext(error, { method: 'authenticateUser' });
    res.status(401).json({
      success: false,
      error: 'Authentication Error',
      message: 'Invalid token'
    });
  }
};

// Optional authentication (for public routes that can work with or without auth)
const optionalAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Generate JWT token
const generateToken = (userData) => {
  return jwt.sign(userData, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

module.exports = {
  authenticateAdmin,
  authenticateUser,
  optionalAuth,
  generateToken
};