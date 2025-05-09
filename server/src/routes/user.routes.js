const express = require('express');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Example user routes for future expansion
router.get('/profile', (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
});

// Admin only routes
router.get('/', authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin only route'
  });
});

module.exports = router; 