const Template = require('../models/template.model');
const { ApiError } = require('../middlewares/error.middleware');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

/**
 * @desc    Get all templates
 * @route   GET /api/templates
 * @access  Private
 */
exports.getTemplates = async (req, res, next) => {
  try {
    let query = {};
    
    // Filter by system type if provided
    if (req.query.systemType) {
      query.systemType = req.query.systemType;
    }
    
    // Filter by public or owned by current user
    query.$or = [
      { isPublic: true },
      { createdBy: req.user.id }
    ];
    
    const templates = await Template.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single template
 * @route   GET /api/templates/:id
 * @access  Private
 */
exports.getTemplate = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!template) {
      return next(new ApiError(`Template not found with id of ${req.params.id}`, 404));
    }
    
    // Check if template is public or owned by current user
    if (!template.isPublic && template.createdBy.toString() !== req.user.id) {
      return next(new ApiError(`Not authorized to access this template`, 403));
    }
    
    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new template
 * @route   POST /api/templates
 * @access  Private
 */
exports.createTemplate = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;
    
    const template = await Template.create(req.body);
    
    res.status(201).json({
      success: true,
      data: template
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update template
 * @route   PUT /api/templates/:id
 * @access  Private
 */
exports.updateTemplate = async (req, res, next) => {
  try {
    let template = await Template.findById(req.params.id);
    
    if (!template) {
      return next(new ApiError(`Template not found with id of ${req.params.id}`, 404));
    }
    
    // Make sure user is template owner
    if (template.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ApiError(`User ${req.user.id} is not authorized to update this template`, 403));
    }
    
    template = await Template.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete template
 * @route   DELETE /api/templates/:id
 * @access  Private
 */
exports.deleteTemplate = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return next(new ApiError(`Template not found with id of ${req.params.id}`, 404));
    }
    
    // Make sure user is template owner
    if (template.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ApiError(`User ${req.user.id} is not authorized to delete this template`, 403));
    }
    
    await template.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Import template from YAML/JSON file
 * @route   POST /api/templates/import
 * @access  Private
 */
exports.importTemplate = async (req, res, next) => {
  try {
    if (!req.files || !req.files.file) {
      return next(new ApiError('Please upload a file', 400));
    }
    
    const file = req.files.file;
    
    // Check file type
    if (!file.name.match(/\.(json|yaml|yml)$/)) {
      return next(new ApiError('Please upload a JSON or YAML file', 400));
    }
    
    let templateData;
    
    // Parse file based on extension
    if (file.name.endsWith('.json')) {
      templateData = JSON.parse(file.data.toString());
    } else {
      templateData = yaml.load(file.data.toString());
    }
    
    // Add user to template data
    templateData.createdBy = req.user.id;
    
    // Create template
    const template = await Template.create(templateData);
    
    res.status(201).json({
      success: true,
      data: template
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export template to YAML/JSON
 * @route   GET /api/templates/:id/export/:format
 * @access  Private
 */
exports.exportTemplate = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return next(new ApiError(`Template not found with id of ${req.params.id}`, 404));
    }
    
    // Check if template is public or owned by current user
    if (!template.isPublic && template.createdBy.toString() !== req.user.id) {
      return next(new ApiError(`Not authorized to access this template`, 403));
    }
    
    const format = req.params.format.toLowerCase();
    
    if (!['json', 'yaml', 'yml'].includes(format)) {
      return next(new ApiError('Invalid export format. Use json or yaml', 400));
    }
    
    // Convert to plain object and remove unnecessary fields
    const templateObj = template.toObject();
    delete templateObj._id;
    delete templateObj.__v;
    delete templateObj.createdAt;
    delete templateObj.updatedAt;
    
    let data;
    let contentType;
    let fileName;
    
    if (format === 'json') {
      data = JSON.stringify(templateObj, null, 2);
      contentType = 'application/json';
      fileName = `${template.name.replace(/\s+/g, '_')}.json`;
    } else {
      data = yaml.dump(templateObj);
      contentType = 'application/yaml';
      fileName = `${template.name.replace(/\s+/g, '_')}.yaml`;
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.send(data);
  } catch (error) {
    next(error);
  }
}; 