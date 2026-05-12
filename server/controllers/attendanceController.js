const Attendance = require('../models/Attendance');

const canAccessEmployee = (req, employeeId) =>
  ['manager', 'admin'].includes(req.user.role) || req.user._id.toString() === employeeId;

const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
};

const formatTime = (date = new Date()) =>
  date.toLocaleTimeString('en-IN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });

const hoursBetween = (date, startTime, endTime) => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const start = new Date(date);
  start.setHours(startHour, startMinute, 0, 0);

  const end = new Date(date);
  end.setHours(endHour, endMinute, 0, 0);

  if (end < start) {
    end.setDate(end.getDate() + 1);
  }

  return Number(((end - start) / (1000 * 60 * 60)).toFixed(2));
};

exports.checkIn = async (req, res, next) => {
  try {
    const { start, end } = getTodayRange();
    const now = new Date();
    const checkIn = req.body.checkIn || formatTime(now);
    const status = req.body.status || 'present';

    if (!['present', 'late', 'half-day'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Check-in status must be present, late, or half-day' });
    }

    const attendance = await Attendance.findOneAndUpdate(
      {
        employeeId: req.user._id,
        date: { $gte: start, $lt: end },
      },
      {
        $setOnInsert: {
          employeeId: req.user._id,
          date: start,
        },
        $set: {
          checkIn,
          status,
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(201).json({ success: true, attendance });
  } catch (error) {
    return next(error);
  }
};

exports.checkOut = async (req, res, next) => {
  try {
    const { start, end } = getTodayRange();
    const checkOut = req.body.checkOut || formatTime(new Date());

    const attendance = await Attendance.findOne({
      employeeId: req.user._id,
      date: { $gte: start, $lt: end },
    });

    if (!attendance || !attendance.checkIn) {
      return res.status(404).json({ success: false, message: 'No check-in found for today' });
    }

    attendance.checkOut = checkOut;
    attendance.workHours = hoursBetween(attendance.date, attendance.checkIn, checkOut);

    if (attendance.workHours > 0 && attendance.workHours < 4) {
      attendance.status = 'half-day';
    }

    await attendance.save();

    return res.status(200).json({ success: true, attendance });
  } catch (error) {
    return next(error);
  }
};

exports.getAttendanceByEmployee = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    if (!canAccessEmployee(req, employeeId)) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
    }

    const attendance = await Attendance.find({ employeeId }).sort({ date: -1 });
    return res.status(200).json({ success: true, count: attendance.length, attendance });
  } catch (error) {
    return next(error);
  }
};

exports.getAttendanceStats = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    if (!canAccessEmployee(req, employeeId)) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
    }

    const attendance = await Attendance.find({ employeeId }).sort({ date: -1 });
    const totalRecords = attendance.length;
    const totalPresent = attendance.filter((record) =>
      ['present', 'late', 'half-day'].includes(record.status)
    ).length;
    const totalAbsent = attendance.filter((record) => record.status === 'absent').length;
    const attendancePercentage =
      totalRecords === 0 ? 0 : Number(((totalPresent / totalRecords) * 100).toFixed(2));

    let streak = 0;
    for (const record of attendance) {
      if (['present', 'late', 'half-day'].includes(record.status)) {
        streak += 1;
      } else {
        break;
      }
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalPresent,
        totalAbsent,
        streak,
        attendancePercentage,
      },
    });
  } catch (error) {
    return next(error);
  }
};
