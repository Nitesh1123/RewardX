const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Performance = require('../models/Performance');

const canAccessEmployee = (req, employeeId) =>
  ['manager', 'admin'].includes(req.user.role) || req.user._id.toString() === employeeId;

exports.getAllEmployees = async (req, res, next) => {
  try {
    const employees = await User.find({ role: 'employee' })
      .select('-password')
      .populate('badges.badgeId', 'name description icon tier criteria')
      .sort({ name: 1 });

    return res.status(200).json({ success: true, count: employees.length, employees });
  } catch (error) {
    return next(error);
  }
};

exports.getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!canAccessEmployee(req, id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
    }

    const employee = await User.findById(id)
      .select('-password')
      .populate('badges.badgeId', 'name description icon tier criteria');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    return res.status(200).json({ success: true, employee });
  } catch (error) {
    return next(error);
  }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!canAccessEmployee(req, id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
    }

    const allowedFields = ['name', 'department', 'profileImage', 'joinDate', 'isActive'];
    if (['manager', 'admin'].includes(req.user.role)) {
      allowedFields.push('role', 'rewardPoints', 'totalBonuses');
    }

    const updates = {};
    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    });

    const employee = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .select('-password')
      .populate('badges.badgeId', 'name description icon tier criteria');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    return res.status(200).json({ success: true, employee });
  } catch (error) {
    return next(error);
  }
};

exports.getEmployeeSummary = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!canAccessEmployee(req, id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
    }

    const employee = await User.findById(id).select('rewardPoints badges');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const [attendanceRecords, performanceAverages] = await Promise.all([
      Attendance.find({ employeeId: id }),
      Performance.aggregate([
        { $match: { employeeId: employee._id } },
        { $group: { _id: null, avgPerformanceScore: { $avg: '$kpiScore' } } },
      ]),
    ]);

    const totalAttendance = attendanceRecords.length;
    const attended = attendanceRecords.filter((record) =>
      ['present', 'late', 'half-day'].includes(record.status)
    ).length;

    const attendancePercentage =
      totalAttendance === 0 ? 0 : Number(((attended / totalAttendance) * 100).toFixed(2));

    return res.status(200).json({
      success: true,
      summary: {
        points: employee.rewardPoints,
        badgesCount: employee.badges.length,
        attendancePercentage,
        avgPerformanceScore: Number((performanceAverages[0]?.avgPerformanceScore || 0).toFixed(2)),
      },
    });
  } catch (error) {
    return next(error);
  }
};
