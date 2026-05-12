const Performance = require('../models/Performance');
const User = require('../models/User');

const canAccessEmployee = (req, employeeId) =>
  ['manager', 'admin'].includes(req.user.role) || req.user._id.toString() === employeeId;

exports.createPerformanceReview = async (req, res, next) => {
  try {
    const {
      employeeId,
      month,
      year,
      kpiScore,
      goalsCompleted,
      totalGoals,
      rating,
      managerNote,
      productivity,
    } = req.body;

    if (
      !employeeId ||
      !month ||
      !year ||
      kpiScore === undefined ||
      goalsCompleted === undefined ||
      totalGoals === undefined ||
      !rating ||
      productivity === undefined
    ) {
      return res.status(400).json({ success: false, message: 'Missing required performance fields' });
    }

    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const performance = await Performance.create({
      employeeId,
      month,
      year,
      kpiScore,
      goalsCompleted,
      totalGoals,
      rating,
      managerNote: managerNote || '',
      productivity,
      reviewedBy: req.user._id,
    });

    return res.status(201).json({ success: true, performance });
  } catch (error) {
    return next(error);
  }
};

exports.getPerformanceByEmployee = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    if (!canAccessEmployee(req, employeeId)) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
    }

    const performance = await Performance.find({ employeeId })
      .populate('reviewedBy', 'name email role')
      .sort({ year: -1, month: -1, createdAt: -1 });

    return res.status(200).json({ success: true, count: performance.length, performance });
  } catch (error) {
    return next(error);
  }
};

exports.getLatestPerformanceByEmployee = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    if (!canAccessEmployee(req, employeeId)) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
    }

    const performance = await Performance.findOne({ employeeId })
      .populate('reviewedBy', 'name email role')
      .sort({ year: -1, month: -1, createdAt: -1 });

    if (!performance) {
      return res.status(404).json({ success: false, message: 'No performance review found' });
    }

    return res.status(200).json({ success: true, performance });
  } catch (error) {
    return next(error);
  }
};
