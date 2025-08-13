const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.errorWithContext(err, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Default error response
  let errorResponse = {
    success: false,
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong'
  };

  // Handle different types of errors
  if (err.name === 'ValidationError') {
    errorResponse = {
      success: false,
      error: 'Validation Error',
      message: 'Invalid input data',
      details: Object.values(err.errors).map(e => e.message)
    };
    res.status(400);
  } else if (err.name === 'CastError') {
    errorResponse = {
      success: false,
      error: 'Invalid ID',
      message: 'The provided ID is not valid'
    };
    res.status(400);
  } else if (err.name === 'MongoError' && err.code === 11000) {
    errorResponse = {
      success: false,
      error: 'Duplicate Error',
      message: 'A record with this information already exists'
    };
    res.status(409);
  } else if (err.name === 'JsonWebTokenError') {
    errorResponse = {
      success: false,
      error: 'Authentication Error',
      message: 'Invalid or expired token'
    };
    res.status(401);
  } else if (err.name === 'TokenExpiredError') {
    errorResponse = {
      success: false,
      error: 'Authentication Error',
      message: 'Token has expired'
    };
    res.status(401);
  } else if (err.name === 'UnauthorizedError') {
    errorResponse = {
      success: false,
      error: 'Unauthorized',
      message: 'Access denied'
    };
    res.status(401);
  } else if (err.name === 'RateLimitExceeded') {
    errorResponse = {
      success: false,
      error: 'Rate Limit Exceeded',
      message: 'Too many requests, please try again later'
    };
    res.status(429);
  } else {
    // Default to 500 Internal Server Error
    res.status(500);
    
    // In production, don't expose internal error details
    if (process.env.NODE_ENV === 'production') {
      errorResponse.message = 'Internal Server Error';
    }
  }

  // Send error response
  res.json(errorResponse);
};

module.exports = errorHandler;