const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  getEmployeeSummary,
} = require('../controllers/employeeController');

router.get('/', protect, authorize('manager', 'admin'), getAllEmployees);
router.get('/:id/summary', protect, getEmployeeSummary);
router.get('/:id', protect, getEmployeeById);
router.put('/:id', protect, updateEmployee);

module.exports = router;
