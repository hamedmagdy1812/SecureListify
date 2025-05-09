const Checklist = require('../models/checklist.model');
const { ApiError } = require('../middlewares/error.middleware');
const PDFDocument = require('pdfkit');
const yaml = require('js-yaml');

/**
 * @desc    Export checklist to JSON
 * @route   GET /api/export/:id/json
 * @access  Private
 */
exports.exportToJson = async (req, res, next) => {
  try {
    const checklist = await Checklist.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('baseTemplate', 'name')
      .populate('items.completedBy', 'name email');
    
    if (!checklist) {
      return next(new ApiError(`Checklist not found with id of ${req.params.id}`, 404));
    }
    
    // Check if user is authorized to export this checklist
    const isAuthorized = 
      checklist.createdBy._id.toString() === req.user.id || 
      checklist.sharedWith.some(share => share.user.toString() === req.user.id);
    
    if (!isAuthorized) {
      return next(new ApiError(`Not authorized to export this checklist`, 403));
    }
    
    // Convert to plain object
    const checklistObj = checklist.toObject();
    
    // Format data for export
    const exportData = {
      name: checklistObj.name,
      description: checklistObj.description,
      systemType: checklistObj.systemType,
      createdBy: checklistObj.createdBy.name,
      createdAt: checklistObj.createdAt,
      exportedAt: new Date(),
      progress: checklistObj.progress,
      items: checklistObj.items.map(item => ({
        title: item.title,
        description: item.description,
        riskRating: item.riskRating,
        category: item.category,
        status: item.status,
        notes: item.notes || '',
        completedAt: item.completedAt,
        completedBy: item.completedBy ? item.completedBy.name : null,
        referenceUrl: item.referenceUrl,
        tags: item.tags,
        complianceFrameworks: item.complianceFrameworks
      }))
    };
    
    // Set response headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${checklistObj.name.replace(/\s+/g, '_')}_export.json`);
    
    // Send response
    res.status(200).json(exportData);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export checklist to YAML
 * @route   GET /api/export/:id/yaml
 * @access  Private
 */
exports.exportToYaml = async (req, res, next) => {
  try {
    const checklist = await Checklist.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('baseTemplate', 'name')
      .populate('items.completedBy', 'name email');
    
    if (!checklist) {
      return next(new ApiError(`Checklist not found with id of ${req.params.id}`, 404));
    }
    
    // Check if user is authorized to export this checklist
    const isAuthorized = 
      checklist.createdBy._id.toString() === req.user.id || 
      checklist.sharedWith.some(share => share.user.toString() === req.user.id);
    
    if (!isAuthorized) {
      return next(new ApiError(`Not authorized to export this checklist`, 403));
    }
    
    // Convert to plain object
    const checklistObj = checklist.toObject();
    
    // Format data for export
    const exportData = {
      name: checklistObj.name,
      description: checklistObj.description,
      systemType: checklistObj.systemType,
      createdBy: checklistObj.createdBy.name,
      createdAt: checklistObj.createdAt,
      exportedAt: new Date(),
      progress: checklistObj.progress,
      items: checklistObj.items.map(item => ({
        title: item.title,
        description: item.description,
        riskRating: item.riskRating,
        category: item.category,
        status: item.status,
        notes: item.notes || '',
        completedAt: item.completedAt,
        completedBy: item.completedBy ? item.completedBy.name : null,
        referenceUrl: item.referenceUrl,
        tags: item.tags,
        complianceFrameworks: item.complianceFrameworks
      }))
    };
    
    // Convert to YAML
    const yamlData = yaml.dump(exportData);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/yaml');
    res.setHeader('Content-Disposition', `attachment; filename=${checklistObj.name.replace(/\s+/g, '_')}_export.yaml`);
    
    // Send response
    res.status(200).send(yamlData);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export checklist to PDF
 * @route   GET /api/export/:id/pdf
 * @access  Private
 */
exports.exportToPdf = async (req, res, next) => {
  try {
    const checklist = await Checklist.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('baseTemplate', 'name')
      .populate('items.completedBy', 'name email');
    
    if (!checklist) {
      return next(new ApiError(`Checklist not found with id of ${req.params.id}`, 404));
    }
    
    // Check if user is authorized to export this checklist
    const isAuthorized = 
      checklist.createdBy._id.toString() === req.user.id || 
      checklist.sharedWith.some(share => share.user.toString() === req.user.id);
    
    if (!isAuthorized) {
      return next(new ApiError(`Not authorized to export this checklist`, 403));
    }
    
    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${checklist.name.replace(/\s+/g, '_')}_export.pdf`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Add content to PDF
    // Header
    doc.fontSize(25).text('SecureListify', { align: 'center' });
    doc.moveDown();
    doc.fontSize(18).text(checklist.name, { align: 'center' });
    doc.moveDown();
    
    // Metadata
    doc.fontSize(12).text(`System Type: ${checklist.systemType}`);
    doc.fontSize(12).text(`Created By: ${checklist.createdBy.name}`);
    doc.fontSize(12).text(`Created At: ${new Date(checklist.createdAt).toLocaleString()}`);
    doc.fontSize(12).text(`Exported At: ${new Date().toLocaleString()}`);
    doc.moveDown();
    
    // Progress
    doc.fontSize(14).text('Progress Summary');
    doc.fontSize(12).text(`Not Started: ${checklist.progress.notStarted}`);
    doc.fontSize(12).text(`In Progress: ${checklist.progress.inProgress}`);
    doc.fontSize(12).text(`Done: ${checklist.progress.done}`);
    doc.fontSize(12).text(`Not Applicable: ${checklist.progress.notApplicable}`);
    doc.fontSize(12).text(`Total Items: ${checklist.progress.total}`);
    doc.moveDown();
    
    // Items
    doc.fontSize(16).text('Checklist Items', { underline: true });
    doc.moveDown();
    
    // Group items by category
    const itemsByCategory = {};
    checklist.items.forEach(item => {
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = [];
      }
      itemsByCategory[item.category].push(item);
    });
    
    // Add items by category
    Object.keys(itemsByCategory).forEach(category => {
      doc.fontSize(14).text(category, { underline: true });
      doc.moveDown(0.5);
      
      itemsByCategory[category].forEach((item, index) => {
        // Status symbol
        let statusSymbol = '[ ] ';
        if (item.status === 'Done') {
          statusSymbol = '[✓] ';
        } else if (item.status === 'In Progress') {
          statusSymbol = '[~] ';
        } else if (item.status === 'Not Applicable') {
          statusSymbol = '[–] ';
        }
        
        // Risk rating color
        let riskColor = 'black';
        if (item.riskRating === 'High' || item.riskRating === 'Critical') {
          riskColor = 'red';
        } else if (item.riskRating === 'Medium') {
          riskColor = 'orange';
        } else if (item.riskRating === 'Low') {
          riskColor = 'green';
        }
        
        // Item title with status and risk
        doc.fontSize(12)
          .text(`${statusSymbol}${index + 1}. ${item.title} `, { continued: true })
          .fillColor(riskColor)
          .text(`[${item.riskRating}]`, { link: item.referenceUrl })
          .fillColor('black');
        
        // Item description
        doc.fontSize(10).text(item.description, { indent: 15 });
        
        // Item notes if any
        if (item.notes) {
          doc.fontSize(10).text(`Notes: ${item.notes}`, { indent: 15, italic: true });
        }
        
        // Completion info if completed
        if (item.status === 'Done' && item.completedBy) {
          doc.fontSize(10).text(
            `Completed by ${item.completedBy.name} on ${new Date(item.completedAt).toLocaleString()}`, 
            { indent: 15, italic: true }
          );
        }
        
        doc.moveDown();
      });
      
      doc.moveDown();
    });
    
    // Finalize PDF
    doc.end();
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export checklist to Markdown
 * @route   GET /api/export/:id/markdown
 * @access  Private
 */
exports.exportToMarkdown = async (req, res, next) => {
  try {
    const checklist = await Checklist.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('baseTemplate', 'name')
      .populate('items.completedBy', 'name email');
    
    if (!checklist) {
      return next(new ApiError(`Checklist not found with id of ${req.params.id}`, 404));
    }
    
    // Check if user is authorized to export this checklist
    const isAuthorized = 
      checklist.createdBy._id.toString() === req.user.id || 
      checklist.sharedWith.some(share => share.user.toString() === req.user.id);
    
    if (!isAuthorized) {
      return next(new ApiError(`Not authorized to export this checklist`, 403));
    }
    
    // Generate markdown content
    let markdown = `# ${checklist.name}\n\n`;
    
    // Metadata
    markdown += `## Metadata\n\n`;
    markdown += `- **System Type:** ${checklist.systemType}\n`;
    markdown += `- **Created By:** ${checklist.createdBy.name}\n`;
    markdown += `- **Created At:** ${new Date(checklist.createdAt).toLocaleString()}\n`;
    markdown += `- **Exported At:** ${new Date().toLocaleString()}\n\n`;
    
    // Progress
    markdown += `## Progress Summary\n\n`;
    markdown += `- **Not Started:** ${checklist.progress.notStarted}\n`;
    markdown += `- **In Progress:** ${checklist.progress.inProgress}\n`;
    markdown += `- **Done:** ${checklist.progress.done}\n`;
    markdown += `- **Not Applicable:** ${checklist.progress.notApplicable}\n`;
    markdown += `- **Total Items:** ${checklist.progress.total}\n\n`;
    
    // Group items by category
    const itemsByCategory = {};
    checklist.items.forEach(item => {
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = [];
      }
      itemsByCategory[item.category].push(item);
    });
    
    // Add items by category
    markdown += `## Checklist Items\n\n`;
    
    Object.keys(itemsByCategory).forEach(category => {
      markdown += `### ${category}\n\n`;
      
      itemsByCategory[category].forEach((item, index) => {
        // Status symbol
        let statusSymbol = '[ ] ';
        if (item.status === 'Done') {
          statusSymbol = '[x] ';
        } else if (item.status === 'In Progress') {
          statusSymbol = '[~] ';
        } else if (item.status === 'Not Applicable') {
          statusSymbol = '[-] ';
        }
        
        // Item title with status and risk
        markdown += `${statusSymbol}**${index + 1}. ${item.title}** [${item.riskRating}]\n\n`;
        
        // Item description
        markdown += `   ${item.description}\n\n`;
        
        // Reference URL
        markdown += `   **Reference:** [${new URL(item.referenceUrl).hostname}](${item.referenceUrl})\n\n`;
        
        // Item notes if any
        if (item.notes) {
          markdown += `   **Notes:** ${item.notes}\n\n`;
        }
        
        // Completion info if completed
        if (item.status === 'Done' && item.completedBy) {
          markdown += `   **Completed by:** ${item.completedBy.name} on ${new Date(item.completedAt).toLocaleString()}\n\n`;
        }
        
        // Tags if any
        if (item.tags && item.tags.length > 0) {
          markdown += `   **Tags:** ${item.tags.join(', ')}\n\n`;
        }
        
        // Compliance frameworks if any
        if (item.complianceFrameworks && item.complianceFrameworks.length > 0) {
          markdown += `   **Compliance:** ${item.complianceFrameworks.join(', ')}\n\n`;
        }
        
        markdown += `---\n\n`;
      });
    });
    
    // Add footer
    markdown += `\n\n*Generated by SecureListify on ${new Date().toLocaleString()}*\n`;
    
    // Set response headers
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename=${checklist.name.replace(/\s+/g, '_')}_export.md`);
    
    // Send response
    res.status(200).send(markdown);
  } catch (error) {
    next(error);
  }
}; 