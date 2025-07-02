const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  // Handle specific error types
  if (err.type === 'validation') {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: err.message 
    });
  }

  if (err.type === 'authentication') {
    return res.status(401).json({ 
      error: 'Authentication required' 
    });
  }

  if (err.type === 'authorization') {
    return res.status(403).json({ 
      error: 'Insufficient permissions' 
    });
  }

  // Default server error
  res.status(500).json({ 
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const validateSession = (req, res, next) => {
  if (!req.session.playerId && req.path !== '/auth/login' && req.path !== '/auth/register') {
    const error = new Error('Authentication required');
    error.type = 'authentication';
    return next(error);
  }
  next();
};

module.exports = {
  errorHandler,
  asyncHandler,
  validateSession
};
