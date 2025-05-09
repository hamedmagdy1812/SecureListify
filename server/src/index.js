require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth.routes');
const templateRoutes = require('./routes/template.routes');
const checklistRoutes = require('./routes/checklist.routes');
const exportRoutes = require('./routes/export.routes');
const userRoutes = require('./routes/user.routes');

// Import middlewares
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/users', userRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Mock data for development without MongoDB
if (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_DATA === 'true') {
  console.log('Using mock data for development');
  
  // Mock auth routes
  app.post('/api/auth/register', (req, res) => {
    res.status(201).json({
      success: true,
      token: 'mock_token',
      user: {
        _id: 'mock_user_id',
        name: req.body.name,
        email: req.body.email,
        role: 'user'
      }
    });
  });
  
  app.post('/api/auth/login', (req, res) => {
    res.status(200).json({
      success: true,
      token: 'mock_token',
      user: {
        _id: 'mock_user_id',
        name: 'Mock User',
        email: req.body.email,
        role: 'user'
      }
    });
  });
  
  // Mock templates routes
  const mockTemplates = require('./templates/linux-server.json');
  mockTemplates._id = 'mock_template_id';
  mockTemplates.createdBy = { _id: 'mock_user_id', name: 'Admin User', email: 'admin@example.com' };
  
  app.get('/api/templates', (req, res) => {
    res.status(200).json({
      success: true,
      count: 1,
      data: [mockTemplates]
    });
  });
  
  app.get('/api/templates/:id', (req, res) => {
    res.status(200).json({
      success: true,
      data: mockTemplates
    });
  });
}

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    if (process.env.NODE_ENV !== 'development' || process.env.USE_MOCK_DATA !== 'true') {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/securelistify');
      console.log('Connected to MongoDB');
    }
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    
    // If in development mode, start server anyway
    if (process.env.NODE_ENV === 'development') {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT} without MongoDB connection`);
      });
    } else {
      process.exit(1);
    }
  }
};

startServer(); 