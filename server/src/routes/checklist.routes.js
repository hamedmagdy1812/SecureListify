const express = require('express');
const {
  getChecklists,
  getChecklist,
  createChecklist,
  updateChecklist,
  deleteChecklist,
  updateChecklistItem,
  reorderChecklistItems,
  shareChecklist,
  removeShare
} = require('../controllers/checklist.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/')
  .get(getChecklists)
  .post(createChecklist);

router.route('/:id')
  .get(getChecklist)
  .put(updateChecklist)
  .delete(deleteChecklist);

router.put('/:id/items/:itemId', updateChecklistItem);
router.put('/:id/reorder', reorderChecklistItems);
router.post('/:id/share', shareChecklist);
router.delete('/:id/share/:userId', removeShare);

module.exports = router; 