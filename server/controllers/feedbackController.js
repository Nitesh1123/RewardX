const Feedback = require('../models/Feedback');
const User = require('../models/User');

const canAccessEmployee = (req, employeeId) =>
  ['manager', 'admin'].includes(req.user.role) || req.user._id.toString() === employeeId;

exports.submitFeedback = async (req, res, next) => {
  try {
    const { toEmployee, message, rating, type, isAnonymous = false } = req.body;

    if (!toEmployee || !message || !rating || !type) {
      return res.status(400).json({ success: false, message: 'Missing required feedback fields' });
    }

    if (type === 'manager' && !['manager', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only managers or admins can submit manager feedback' });
    }

    const employee = await User.findById(toEmployee);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Feedback recipient not found' });
    }

    const feedback = await Feedback.create({
      fromEmployee: req.user._id,
      toEmployee,
      message,
      rating,
      type,
      isAnonymous,
    });

    return res.status(201).json({ success: true, feedback });
  } catch (error) {
    return next(error);
  }
};

exports.getFeedbackForEmployee = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    if (!canAccessEmployee(req, employeeId)) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
    }

    const feedback = await Feedback.find({ toEmployee: employeeId })
      .populate('fromEmployee', 'name email role')
      .populate('toEmployee', 'name email role')
      .sort({ createdAt: -1 });

    const safeFeedback = feedback.map((item) => {
      const doc = item.toObject();
      if (doc.isAnonymous && !['manager', 'admin'].includes(req.user.role)) {
        doc.fromEmployee = null;
      }
      return doc;
    });

    return res.status(200).json({ success: true, count: safeFeedback.length, feedback: safeFeedback });
  } catch (error) {
    return next(error);
  }
};
