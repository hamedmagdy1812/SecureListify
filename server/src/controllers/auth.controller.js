const User = require('../models/user.model');
const { ApiError } = require('../middlewares/error.middleware');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ApiError('User with this email already exists', 400));
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password
    });

    // Send token response
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return next(new ApiError('Please provide an email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new ApiError('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ApiError('Invalid credentials', 401));
    }

    // Update last login time
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user / clear cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Successfully logged out'
  });
};

/**
 * Helper function to get token from model, create cookie and send response
 */
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user
  });
}; 