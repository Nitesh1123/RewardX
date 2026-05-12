const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  checkIn,
  checkOut,
  getAttendanceByEmployee,
  getAttendanceStats,
} = require('../controllers/attendanceController');

router.post('/checkin', protect, checkIn);
router.put('/checkout', protect, checkOut);
router.get('/:employeeId/stats', protect, getAttendanceStats);
router.get('/:employeeId', protect, getAttendanceByEmployee);

module.exports = router;
