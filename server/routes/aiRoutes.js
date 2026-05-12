const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getRiskAnalysis, getRewardFairness } = require('../controllers/aiController');

router.get('/risk-analysis', protect, getRiskAnalysis);
router.get('/reward-fairness', protect, getRewardFairness);

module.exports = router;
