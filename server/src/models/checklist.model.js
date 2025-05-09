const mongoose = require('mongoose');

const checklistItemSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Done', 'Not Applicable'],
    default: 'Not Started'
  },
  notes: {
    type: String,
    trim: true
  },
  completedAt: {
    type: Date
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: String,
    trim: true
  }],
  complianceFrameworks: [{
    type: String,
    trim: true
  }],
  order: {
    type: Number,
    default: 0
  }
});

const checklistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  description: {
    type: String,
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
  baseTemplate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template'
  },
  items: [checklistItemSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['read', 'write'],
      default: 'read'
    }
  }],
  progress: {
    notStarted: {
      type: Number,
      default: 0
    },
    inProgress: {
      type: Number,
      default: 0
    },
    done: {
      type: Number,
      default: 0
    },
    notApplicable: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Update progress counts before saving
checklistSchema.pre('save', function(next) {
  const items = this.items || [];
  
  this.progress = {
    notStarted: items.filter(item => item.status === 'Not Started').length,
    inProgress: items.filter(item => item.status === 'In Progress').length,
    done: items.filter(item => item.status === 'Done').length,
    notApplicable: items.filter(item => item.status === 'Not Applicable').length,
    total: items.length
  };
  
  next();
});

module.exports = mongoose.model('Checklist', checklistSchema); 