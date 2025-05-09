const express = require('express');
const {
  exportToJson,
  exportToYaml,
  exportToPdf,
  exportToMarkdown
} = require('../controllers/export.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

router.get('/:id/json', exportToJson);
router.get('/:id/yaml', exportToYaml);
router.get('/:id/pdf', exportToPdf);
router.get('/:id/markdown', exportToMarkdown);

module.exports = router; 