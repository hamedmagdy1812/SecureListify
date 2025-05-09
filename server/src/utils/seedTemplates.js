const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Template = require('../models/template.model');
const User = require('../models/user.model');
require('dotenv').config();

/**
 * Seed the database with templates
 */
const seedTemplates = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/securelistify');
    console.log('Connected to MongoDB');
    
    // Create admin user if not exists
    let adminUser = await User.findOne({ email: 'admin@securelistify.com' });
    
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@securelistify.com',
        password: 'securePassword123!', // This would be changed in production
        role: 'admin'
      });
      console.log('Admin user created');
    }
    
    // Read template files
    const templatesDir = path.join(__dirname, '..', 'templates');
    const templateFiles = fs.readdirSync(templatesDir)
      .filter(file => file.endsWith('.json'));
    
    // Process each template file
    for (const file of templateFiles) {
      const templatePath = path.join(templatesDir, file);
      const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
      
      // Check if template already exists
      const existingTemplate = await Template.findOne({ name: templateData.name });
      
      if (existingTemplate) {
        console.log(`Template "${templateData.name}" already exists, skipping`);
        continue;
      }
      
      // Add admin user as creator
      templateData.createdBy = adminUser._id;
      
      // Create template
      await Template.create(templateData);
      console.log(`Template "${templateData.name}" created`);
    }
    
    console.log('Templates seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding templates:', error);
    process.exit(1);
  }
};

// Run the seed function
seedTemplates(); 