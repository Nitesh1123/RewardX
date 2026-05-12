const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  awardReward,
  getRewardsByEmployee,
  getLeaderboard,
} = require('../controllers/rewardController');

router.post('/award', protect, authorize('manager', 'admin'), awardReward);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/:employeeId', protect, getRewardsByEmployee);

module.exports = router;
