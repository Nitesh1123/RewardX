const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createBadge,
  getAllBadges,
  getBadgeById,
  updateBadge,
  deleteBadge,
} = require('../controllers/badgeController');

router.get('/', protect, getAllBadges);
router.get('/:id', protect, getBadgeById);
router.post('/', protect, authorize('manager', 'admin'), createBadge);
router.put('/:id', protect, authorize('manager', 'admin'), updateBadge);
router.delete('/:id', protect, authorize('admin'), deleteBadge);

module.exports = router;
