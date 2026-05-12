const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  submitFeedback,
  getFeedbackForEmployee,
} = require('../controllers/feedbackController');

router.post('/', protect, submitFeedback);
router.get('/:employeeId', protect, getFeedbackForEmployee);

module.exports = router;
