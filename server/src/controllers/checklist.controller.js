const Checklist = require('../models/checklist.model');
const Template = require('../models/template.model');
const { ApiError } = require('../middlewares/error.middleware');

/**
 * @desc    Get all checklists for current user
 * @route   GET /api/checklists
 * @access  Private
 */
exports.getChecklists = async (req, res, next) => {
  try {
    // Find checklists created by user or shared with user
    const checklists = await Checklist.find({
      $or: [
        { createdBy: req.user.id },
        { 'sharedWith.user': req.user.id }
      ]
    }).populate('createdBy', 'name email')
      .populate('baseTemplate', 'name')
      .populate('sharedWith.user', 'name email')
      .populate('lastUpdatedBy', 'name email')
      .sort({ updatedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: checklists.length,
      data: checklists
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single checklist
 * @route   GET /api/checklists/:id
 * @access  Private
 */
exports.getChecklist = async (req, res, next) => {
  try {
    const checklist = await Checklist.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('baseTemplate', 'name')
      .populate('sharedWith.user', 'name email')
      .populate('lastUpdatedBy', 'name email')
      .populate('items.completedBy', 'name email');
    
    if (!checklist) {
      return next(new ApiError(`Checklist not found with id of ${req.params.id}`, 404));
    }
    
    // Check if user is authorized to view this checklist
    const isAuthorized = 
      checklist.createdBy._id.toString() === req.user.id || 
      checklist.sharedWith.some(share => share.user._id.toString() === req.user.id);
    
    if (!isAuthorized) {
      return next(new ApiError(`Not authorized to access this checklist`, 403));
    }
    
    res.status(200).json({
      success: true,
      data: checklist
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new checklist from template
 * @route   POST /api/checklists
 * @access  Private
 */
exports.createChecklist = async (req, res, next) => {
  try {
    const { name, description, systemType, baseTemplateId } = req.body;
    
    let items = [];
    
    // If baseTemplateId is provided, copy items from template
    if (baseTemplateId) {
      const template = await Template.findById(baseTemplateId);
      
      if (!template) {
        return next(new ApiError(`Template not found with id of ${baseTemplateId}`, 404));
      }
      
      // Copy items from template
      items = template.items.map((item, index) => ({
        title: item.title,
        description: item.description,
        riskRating: item.riskRating,
        referenceUrl: item.referenceUrl,
        category: item.category,
        tags: item.tags,
        complianceFrameworks: item.complianceFrameworks,
        order: index,
        status: 'Not Started'
      }));
    }
    
    // Create checklist
    const checklist = await Checklist.create({
      name,
      description,
      systemType,
      baseTemplate: baseTemplateId,
      items,
      createdBy: req.user.id,
      lastUpdatedBy: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: checklist
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update checklist
 * @route   PUT /api/checklists/:id
 * @access  Private
 */
exports.updateChecklist = async (req, res, next) => {
  try {
    let checklist = await Checklist.findById(req.params.id);
    
    if (!checklist) {
      return next(new ApiError(`Checklist not found with id of ${req.params.id}`, 404));
    }
    
    // Check if user is authorized to update this checklist
    const isCreator = checklist.createdBy.toString() === req.user.id;
    const isSharedWithWritePermission = checklist.sharedWith.some(
      share => share.user.toString() === req.user.id && share.permission === 'write'
    );
    
    if (!isCreator && !isSharedWithWritePermission) {
      return next(new ApiError(`Not authorized to update this checklist`, 403));
    }
    
    // Update lastUpdatedBy
    req.body.lastUpdatedBy = req.user.id;
    
    checklist = await Checklist.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: checklist
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update checklist item status
 * @route   PUT /api/checklists/:id/items/:itemId
 * @access  Private
 */
exports.updateChecklistItem = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const { id, itemId } = req.params;
    
    const checklist = await Checklist.findById(id);
    
    if (!checklist) {
      return next(new ApiError(`Checklist not found with id of ${id}`, 404));
    }
    
    // Check if user is authorized to update this checklist
    const isCreator = checklist.createdBy.toString() === req.user.id;
    const isSharedWithWritePermission = checklist.sharedWith.some(
      share => share.user.toString() === req.user.id && share.permission === 'write'
    );
    
    if (!isCreator && !isSharedWithWritePermission) {
      return next(new ApiError(`Not authorized to update this checklist`, 403));
    }
    
    // Find the item
    const item = checklist.items.id(itemId);
    
    if (!item) {
      return next(new ApiError(`Item not found with id of ${itemId}`, 404));
    }
    
    // Update item
    if (status) {
      item.status = status;
      
      // If status is 'Done', set completedAt and completedBy
      if (status === 'Done') {
        item.completedAt = Date.now();
        item.completedBy = req.user.id;
      } else {
        item.completedAt = undefined;
        item.completedBy = undefined;
      }
    }
    
    if (notes !== undefined) {
      item.notes = notes;
    }
    
    // Update lastUpdatedBy
    checklist.lastUpdatedBy = req.user.id;
    
    await checklist.save();
    
    res.status(200).json({
      success: true,
      data: checklist
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reorder checklist items
 * @route   PUT /api/checklists/:id/reorder
 * @access  Private
 */
exports.reorderChecklistItems = async (req, res, next) => {
  try {
    const { items } = req.body;
    const { id } = req.params;
    
    if (!items || !Array.isArray(items)) {
      return next(new ApiError('Please provide an array of item IDs in the correct order', 400));
    }
    
    const checklist = await Checklist.findById(id);
    
    if (!checklist) {
      return next(new ApiError(`Checklist not found with id of ${id}`, 404));
    }
    
    // Check if user is authorized to update this checklist
    const isCreator = checklist.createdBy.toString() === req.user.id;
    const isSharedWithWritePermission = checklist.sharedWith.some(
      share => share.user.toString() === req.user.id && share.permission === 'write'
    );
    
    if (!isCreator && !isSharedWithWritePermission) {
      return next(new ApiError(`Not authorized to update this checklist`, 403));
    }
    
    // Validate that all item IDs exist in the checklist
    const checklistItemIds = checklist.items.map(item => item._id.toString());
    const allItemsExist = items.every(itemId => checklistItemIds.includes(itemId));
    
    if (!allItemsExist) {
      return next(new ApiError('One or more item IDs do not exist in this checklist', 400));
    }
    
    // Update order of items
    items.forEach((itemId, index) => {
      const item = checklist.items.id(itemId);
      if (item) {
        item.order = index;
      }
    });
    
    // Update lastUpdatedBy
    checklist.lastUpdatedBy = req.user.id;
    
    await checklist.save();
    
    res.status(200).json({
      success: true,
      data: checklist
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete checklist
 * @route   DELETE /api/checklists/:id
 * @access  Private
 */
exports.deleteChecklist = async (req, res, next) => {
  try {
    const checklist = await Checklist.findById(req.params.id);
    
    if (!checklist) {
      return next(new ApiError(`Checklist not found with id of ${req.params.id}`, 404));
    }
    
    // Check if user is authorized to delete this checklist
    if (checklist.createdBy.toString() !== req.user.id) {
      return next(new ApiError(`Not authorized to delete this checklist`, 403));
    }
    
    await checklist.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Share checklist with another user
 * @route   POST /api/checklists/:id/share
 * @access  Private
 */
exports.shareChecklist = async (req, res, next) => {
  try {
    const { email, permission } = req.body;
    const { id } = req.params;
    
    if (!email || !permission) {
      return next(new ApiError('Please provide email and permission', 400));
    }
    
    if (!['read', 'write'].includes(permission)) {
      return next(new ApiError('Permission must be either read or write', 400));
    }
    
    const checklist = await Checklist.findById(id);
    
    if (!checklist) {
      return next(new ApiError(`Checklist not found with id of ${id}`, 404));
    }
    
    // Check if user is authorized to share this checklist
    if (checklist.createdBy.toString() !== req.user.id) {
      return next(new ApiError(`Not authorized to share this checklist`, 403));
    }
    
    // Find user by email
    const user = await require('../models/user.model').findOne({ email });
    
    if (!user) {
      return next(new ApiError(`User not found with email ${email}`, 404));
    }
    
    // Check if user is already in sharedWith
    const alreadyShared = checklist.sharedWith.some(
      share => share.user.toString() === user._id.toString()
    );
    
    if (alreadyShared) {
      // Update permission
      checklist.sharedWith.forEach(share => {
        if (share.user.toString() === user._id.toString()) {
          share.permission = permission;
        }
      });
    } else {
      // Add user to sharedWith
      checklist.sharedWith.push({
        user: user._id,
        permission
      });
    }
    
    // Update lastUpdatedBy
    checklist.lastUpdatedBy = req.user.id;
    
    await checklist.save();
    
    res.status(200).json({
      success: true,
      data: checklist
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove share from checklist
 * @route   DELETE /api/checklists/:id/share/:userId
 * @access  Private
 */
exports.removeShare = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    
    const checklist = await Checklist.findById(id);
    
    if (!checklist) {
      return next(new ApiError(`Checklist not found with id of ${id}`, 404));
    }
    
    // Check if user is authorized to remove share
    if (checklist.createdBy.toString() !== req.user.id) {
      return next(new ApiError(`Not authorized to remove share from this checklist`, 403));
    }
    
    // Remove user from sharedWith
    checklist.sharedWith = checklist.sharedWith.filter(
      share => share.user.toString() !== userId
    );
    
    // Update lastUpdatedBy
    checklist.lastUpdatedBy = req.user.id;
    
    await checklist.save();
    
    res.status(200).json({
      success: true,
      data: checklist
    });
  } catch (error) {
    next(error);
  }
}; 