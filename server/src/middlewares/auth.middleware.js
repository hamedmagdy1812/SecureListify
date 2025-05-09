const jwt = require('jsonwebtoken');
const { ApiError } = require('./error.middleware');
const User = require('../models/user.model');

/**
 * Middleware to protect routes that require authentication
 */
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return next(new ApiError('Not authorized to access this route', 401));
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new ApiError('User not found', 404));
    }
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError('Invalid token', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError('Token expired', 401));
    }
    next(error);
  }
};

/**
 * Middleware to restrict access based on user role
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError('User not authenticated', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(`Role ${req.user.role} is not authorized to access this route`, 403));
    }
    
    next();
  };
}; 