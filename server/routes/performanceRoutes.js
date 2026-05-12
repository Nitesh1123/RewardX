const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createPerformanceReview,
  getPerformanceByEmployee,
  getLatestPerformanceByEmployee,
} = require('../controllers/performanceController');

router.post('/', protect, authorize('manager', 'admin'), createPerformanceReview);
router.get('/:employeeId/latest', protect, getLatestPerformanceByEmployee);
router.get('/:employeeId', protect, getPerformanceByEmployee);

module.exports = router;
