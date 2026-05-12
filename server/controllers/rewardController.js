const Reward = require('../models/Reward');
const User = require('../models/User');
const Badge = require('../models/Badge');

const canAccessEmployee = (req, employeeId) =>
  ['manager', 'admin'].includes(req.user.role) || req.user._id.toString() === employeeId;

exports.awardReward = async (req, res, next) => {
  try {
    const { employeeId, type, amount = 0, description, category, badgeId } = req.body;

    if (!employeeId || !type || !description || !category) {
      return res.status(400).json({ success: false, message: 'Missing required reward fields' });
    }

    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (type === 'badge') {
      if (!badgeId) {
        return res.status(400).json({ success: false, message: 'badgeId is required for badge rewards' });
      }

      const badge = await Badge.findById(badgeId);
      if (!badge) {
        return res.status(404).json({ success: false, message: 'Badge not found' });
      }
    }

    const reward = await Reward.create({
      employeeId,
      type,
      amount,
      description,
      category,
      badgeId,
      awardedBy: req.user._id,
      awardedAt: new Date(),
    });

    if (type === 'points') {
      employee.rewardPoints += amount;
    }

    if (type === 'bonus') {
      employee.totalBonuses += amount;
    }

    if (type === 'badge') {
      const alreadyEarned = employee.badges.some((badge) => badge.badgeId.toString() === badgeId);
      if (!alreadyEarned) {
        employee.badges.push({ badgeId, earnedAt: new Date() });
      }
    }

    await employee.save();

    return res.status(201).json({
      success: true,
      reward,
      employee: await User.findById(employeeId)
        .select('-password')
        .populate('badges.badgeId', 'name description icon tier criteria'),
    });
  } catch (error) {
    return next(error);
  }
};

exports.getRewardsByEmployee = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    if (!canAccessEmployee(req, employeeId)) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
    }

    const rewards = await Reward.find({ employeeId })
      .populate('employeeId', 'name email department rewardPoints totalBonuses')
      .populate('awardedBy', 'name email role')
      .populate('badgeId', 'name description icon tier')
      .sort({ awardedAt: -1 });

    return res.status(200).json({ success: true, count: rewards.length, rewards });
  } catch (error) {
    return next(error);
  }
};

exports.getLeaderboard = async (req, res, next) => {
  try {
    const employees = await User.find({ role: 'employee', isActive: true })
      .select('name email department profileImage rewardPoints totalBonuses badges')
      .sort({ rewardPoints: -1, totalBonuses: -1, name: 1 })
      .limit(10);

    const leaderboard = employees.map((employee, index) => ({
      rank: index + 1,
      id: employee._id,
      name: employee.name,
      email: employee.email,
      department: employee.department,
      profileImage: employee.profileImage,
      rewardPoints: employee.rewardPoints,
      totalBonuses: employee.totalBonuses,
      badgesCount: employee.badges.length,
    }));

    return res.status(200).json({ success: true, leaderboard });
  } catch (error) {
    return next(error);
  }
};
