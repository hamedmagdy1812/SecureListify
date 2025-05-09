const mongoose = require('mongoose');

const templateItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true
  },
  riskRating: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    required: [true, 'Please provide a risk rating']
  },
  referenceUrl: {
    type: String,
    required: [true, 'Please provide a reference URL'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  complianceFrameworks: [{
    type: String,
    trim: true
  }]
});

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true
  },
  systemType: {
    type: String,
    required: [true, 'Please provide a system type'],
    enum: [
      'Linux Server', 
      'Windows Server', 
      'Web Application', 
      'Docker Container', 
      'Kubernetes Cluster', 
      'AWS EC2', 
      'AWS S3', 
      'Azure VM', 
      'GCP Compute',
      'Network Device',
      'Database',
      'Custom'
    ]
  },
  items: [templateItemSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Template', templateSchema); 