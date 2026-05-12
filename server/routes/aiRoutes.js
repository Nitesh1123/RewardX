const express = require('express');
const {
  getAttendancePatterns,
  getEmployeeScorecard,
  getRecommendations,
  getRewardFairness,
  getRiskAnalysis,
  getGeminiRecommendations,
} = require('../controllers/aiController');
const { authorize, protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/risk-analysis', protect, authorize('manager', 'admin'), getRiskAnalysis);
router.get('/reward-fairness', protect, getRewardFairness);
router.get('/attendance-patterns', protect, getAttendancePatterns);
router.get('/recommendations', protect, authorize('manager', 'admin'), getRecommendations);
router.get('/gemini-recommendations', protect, authorize('manager', 'admin'), getGeminiRecommendations);
router.get('/scorecard/:employeeId', protect, getEmployeeScorecard);

module.exports = router;
