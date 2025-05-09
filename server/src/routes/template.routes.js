const express = require('express');
const {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  importTemplate,
  exportTemplate
} = require('../controllers/template.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/')
  .get(getTemplates)
  .post(createTemplate);

router.route('/:id')
  .get(getTemplate)
  .put(updateTemplate)
  .delete(deleteTemplate);

router.post('/import', importTemplate);
router.get('/:id/export/:format', exportTemplate);

module.exports = router; 