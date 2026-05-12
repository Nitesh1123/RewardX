const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Feedback = require('../models/Feedback');
const Performance = require('../models/Performance');
const Reward = require('../models/Reward');
const User = require('../models/User');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const daysAgo = (days) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
};

const monthKey = ({ year, month }) => year * 12 + month;

const getLastMonthPairs = (count) => {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    return { month: date.getMonth() + 1, year: date.getFullYear() };
  });
};

const average = (values) => {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const getDaysSince = (date) => {
  if (!date) return 999;
  return Math.floor((Date.now() - new Date(date).getTime()) / MS_PER_DAY);
};

const departmentOf = (department) => department || 'Unassigned';

const sortReviewsDesc = (reviews) =>
  [...reviews].sort((a, b) => monthKey(b) - monthKey(a) || new Date(b.createdAt) - new Date(a.createdAt));

const getRecentEmployeeSignals = async (employee) => {
  const lastThreeMonths = getLastMonthPairs(3);
  const lastThreeKeys = new Set(lastThreeMonths.map((item) => `${item.year}-${item.month}`));
  const last30Days = daysAgo(30);

  const [performances, attendance, lastReward, feedbackCount] = await Promise.all([
    Performance.find({ employeeId: employee._id }),
    Attendance.find({ employeeId: employee._id, date: { $gte: last30Days } }),
    Reward.findOne({ employeeId: employee._id }).sort({ awardedAt: -1 }),
    Feedback.countDocuments({ toEmployee: employee._id, createdAt: { $gte: last30Days } }),
  ]);

  const recentPerformance = performances.filter((review) => lastThreeKeys.has(`${review.year}-${review.month}`));
  const sortedPerformance = sortReviewsDesc(performances);
  const avgKpiScore = Number(average(recentPerformance.map((review) => review.kpiScore)).toFixed(2));
  const absentCount = attendance.filter((record) => record.status === 'absent').length;
  const lateCount = attendance.filter((record) => record.status === 'late').length;
  const presentCount = attendance.filter((record) => ['present', 'late', 'half-day'].includes(record.status)).length;
  const daysSinceLastReward = getDaysSince(lastReward?.awardedAt);

  return {
    performances: sortedPerformance,
    attendance,
    avgKpiScore,
    absentCount,
    lateCount,
    presentCount,
    lastReward,
    daysSinceLastReward,
    feedbackCount,
  };
};

const buildRiskRecommendation = ({ avgKpiScore, absentCount, lateCount, daysSinceLastReward, feedbackCount }) => {
  if (absentCount > 5) return 'High absenteeism detected -> HR review recommended';
  if (avgKpiScore < 50 && daysSinceLastReward > 30) {
    return 'Low KPI + no recent reward -> Schedule a 1:1 and create a recovery recognition plan';
  }
  if (avgKpiScore > 85 && daysSinceLastReward > 30) {
    return 'Strong performer with no recent recognition -> Award a gold badge or bonus points';
  }
  if (lateCount > 3) return 'Repeated late arrivals -> Discuss schedule blockers and support options';
  if (feedbackCount === 0) return 'No recent feedback signal -> Request peer or manager feedback this week';
  if (daysSinceLastReward > 15) return 'Recognition gap forming -> Consider a small points award for recent contributions';
  return 'Healthy engagement pattern -> Maintain current recognition cadence';
};

const calculateRisk = (signals) => {
  let riskScore = 0;

  if (signals.avgKpiScore < 50) riskScore += 35;
  else if (signals.avgKpiScore < 70) riskScore += 15;

  if (signals.absentCount > 5) riskScore += 25;
  else if (signals.lateCount > 3) riskScore += 10;

  if (signals.daysSinceLastReward > 30) riskScore += 25;
  else if (signals.daysSinceLastReward > 15) riskScore += 10;

  if (signals.feedbackCount === 0) riskScore += 15;

  const boundedScore = Math.min(100, riskScore);
  const riskLevel = boundedScore >= 60 ? 'High' : boundedScore >= 30 ? 'Medium' : 'Low';

  return {
    riskScore: boundedScore,
    riskLevel,
    aiRecommendation: buildRiskRecommendation(signals),
  };
};

const getFairnessRows = async () => {
  const since = daysAgo(90);
  const [employees, rewards] = await Promise.all([
    User.find({ role: 'employee', isActive: true }).select('department'),
    Reward.find({ awardedAt: { $gte: since } }).populate('employeeId', 'department isActive role'),
  ]);

  const rowsByDepartment = new Map();

  employees.forEach((employee) => {
    const department = departmentOf(employee.department);
    if (!rowsByDepartment.has(department)) {
      rowsByDepartment.set(department, {
        department,
        totalRewards: 0,
        totalPoints: 0,
        employeeCount: 0,
        rewardsPerEmployee: 0,
        fairnessStatus: 'Balanced',
      });
    }
    rowsByDepartment.get(department).employeeCount += 1;
  });

  rewards.forEach((reward) => {
    if (!reward.employeeId || reward.employeeId.role !== 'employee' || reward.employeeId.isActive === false) return;

    const department = departmentOf(reward.employeeId.department);
    if (!rowsByDepartment.has(department)) {
      rowsByDepartment.set(department, {
        department,
        totalRewards: 0,
        totalPoints: 0,
        employeeCount: 0,
        rewardsPerEmployee: 0,
        fairnessStatus: 'Balanced',
      });
    }

    const row = rowsByDepartment.get(department);
    row.totalRewards += 1;
    if (reward.type === 'points') {
      row.totalPoints += reward.amount;
    }
  });

  const rows = Array.from(rowsByDepartment.values()).map((row) => ({
    ...row,
    rewardsPerEmployee:
      row.employeeCount === 0 ? 0 : Number((row.totalRewards / row.employeeCount).toFixed(2)),
  }));

  const departmentsWithEmployees = rows.filter((row) => row.employeeCount > 0);
  const avgRewardsPerEmployee = average(departmentsWithEmployees.map((row) => row.rewardsPerEmployee));

  return rows
    .map((row) => {
      let fairnessStatus = 'Balanced';
      if (avgRewardsPerEmployee > 0 && row.rewardsPerEmployee < 0.6 * avgRewardsPerEmployee) {
        fairnessStatus = 'Underfavored';
      } else if (avgRewardsPerEmployee > 0 && row.rewardsPerEmployee > 1.4 * avgRewardsPerEmployee) {
        fairnessStatus = 'Overfavored';
      }

      return { ...row, fairnessStatus };
    })
    .sort((a, b) => a.department.localeCompare(b.department));
};

const getAttendancePatternRows = async () => {
  const since = daysAgo(30);
  const [employees, attendance] = await Promise.all([
    User.find({ role: 'employee', isActive: true }).select('department'),
    Attendance.find({ date: { $gte: since } }).populate('employeeId', 'department isActive role'),
  ]);

  const rowsByDepartment = new Map();

  employees.forEach((employee) => {
    const department = departmentOf(employee.department);
    if (!rowsByDepartment.has(department)) {
      rowsByDepartment.set(department, {
        department,
        presentCount: 0,
        lateCount: 0,
        totalRecords: 0,
        totalEmployees: 0,
        absentDays: {},
      });
    }
    rowsByDepartment.get(department).totalEmployees += 1;
  });

  attendance.forEach((record) => {
    if (!record.employeeId || record.employeeId.role !== 'employee' || record.employeeId.isActive === false) return;

    const department = departmentOf(record.employeeId.department);
    if (!rowsByDepartment.has(department)) {
      rowsByDepartment.set(department, {
        department,
        presentCount: 0,
        lateCount: 0,
        totalRecords: 0,
        totalEmployees: 0,
        absentDays: {},
      });
    }

    const row = rowsByDepartment.get(department);
    row.totalRecords += 1;
    if (['present', 'late', 'half-day'].includes(record.status)) row.presentCount += 1;
    if (record.status === 'late') row.lateCount += 1;
    if (record.status === 'absent') {
      const day = weekdays[new Date(record.date).getDay()];
      if (day !== 'Sun' && day !== 'Sat') {
        row.absentDays[day] = (row.absentDays[day] || 0) + 1;
      }
    }
  });

  return Array.from(rowsByDepartment.values())
    .map((row) => {
      const mostAbsentDayEntry = Object.entries(row.absentDays).sort((a, b) => b[1] - a[1])[0];
      return {
        department: row.department,
        attendanceRate:
          row.totalRecords === 0 ? 0 : Number(((row.presentCount / row.totalRecords) * 100).toFixed(2)),
        lateRate: row.totalRecords === 0 ? 0 : Number(((row.lateCount / row.totalRecords) * 100).toFixed(2)),
        mostAbsentDay: mostAbsentDayEntry?.[0] || 'No absences',
        totalEmployees: row.totalEmployees,
      };
    })
    .sort((a, b) => a.attendanceRate - b.attendanceRate);
};

const calculateAttendanceStreak = (attendance) => {
  const sorted = [...attendance].sort((a, b) => new Date(b.date) - new Date(a.date));
  let streak = 0;

  for (const record of sorted) {
    if (record.status === 'present') streak += 1;
    else break;
  }

  return streak;
};

const priorityRank = { High: 0, Medium: 1, Low: 2 };

exports.getRiskAnalysis = async (req, res, next) => {
  try {
    const employees = await User.find({ role: 'employee', isActive: true }).select('name department');

    const analysis = await Promise.all(
      employees.map(async (employee) => {
        const signals = await getRecentEmployeeSignals(employee);
        const risk = calculateRisk(signals);

        return {
          employeeId: employee._id,
          name: employee.name,
          department: departmentOf(employee.department),
          ...risk,
        };
      })
    );

    return res.status(200).json({
      success: true,
      analysis: analysis.sort((a, b) => b.riskScore - a.riskScore),
    });
  } catch (error) {
    return next(error);
  }
};

exports.getRewardFairness = async (req, res, next) => {
  try {
    const fairness = await getFairnessRows();
    return res.status(200).json({ success: true, fairness });
  } catch (error) {
    return next(error);
  }
};

exports.getAttendancePatterns = async (req, res, next) => {
  try {
    const patterns = await getAttendancePatternRows();
    return res.status(200).json({ success: true, patterns });
  } catch (error) {
    return next(error);
  }
};

exports.getRecommendations = async (req, res, next) => {
  try {
    const employees = await User.find({ role: 'employee', isActive: true }).select('name department');
    const recommendations = [];

    for (const employee of employees) {
      const signals = await getRecentEmployeeSignals(employee);
      const latestReview = signals.performances[0];
      const previousReview = signals.performances[1];
      const attendanceStreak = calculateAttendanceStreak(signals.attendance);

      if (signals.daysSinceLastReward > 45) {
        recommendations.push({
          type: 'reward_gap',
          priority: 'Medium',
          title: 'Recognition Gap Detected',
          message: `${employee.name} has not been rewarded in ${signals.daysSinceLastReward} days despite consistent attendance`,
          actionLabel: 'Award Points',
          employeeId: employee._id,
        });
      }

      if (latestReview && previousReview && previousReview.kpiScore - latestReview.kpiScore > 15) {
        recommendations.push({
          type: 'performance_drop',
          priority: 'High',
          title: 'Performance Drop Alert',
          message: `${employee.name}'s KPI dropped from ${previousReview.kpiScore} to ${latestReview.kpiScore} this month`,
          actionLabel: 'Schedule Review',
          employeeId: employee._id,
        });
      }

      if (attendanceStreak >= 20) {
        recommendations.push({
          type: 'attendance_streak',
          priority: 'Low',
          title: 'Attendance Hero',
          message: `${employee.name} has been present for ${attendanceStreak} days straight. Consider a badge!`,
          actionLabel: 'Give Badge',
          employeeId: employee._id,
        });
      }

      if (latestReview?.kpiScore > 85 && signals.daysSinceLastReward > 30) {
        recommendations.push({
          type: 'top_performer_unrecognized',
          priority: 'High',
          title: 'Top Performer Needs Recognition',
          message: `${employee.name} scored ${latestReview.kpiScore} on KPI but hasn't received a reward this month`,
          actionLabel: 'Award Bonus',
          employeeId: employee._id,
        });
      }
    }

    const fairness = await getFairnessRows();
    fairness
      .filter((row) => row.fairnessStatus === 'Underfavored')
      .forEach((row) => {
        recommendations.push({
          type: 'department_fairness',
          priority: 'Medium',
          title: `Reward Imbalance in ${row.department}`,
          message: `${row.department} department is receiving fewer rewards than average`,
          actionLabel: 'Review Distribution',
        });
      });

    return res.status(200).json({
      success: true,
      recommendations: recommendations.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]),
    });
  } catch (error) {
    return next(error);
  }
};

exports.getEmployeeScorecard = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ success: false, message: 'Invalid employee id' });
    }

    if (!['manager', 'admin'].includes(req.user.role) && req.user._id.toString() !== employeeId) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
    }

    const employee = await User.findById(employeeId).select('name badges');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const signals = await getRecentEmployeeSignals(employee);
    const last30Attendance = signals.attendance;
    const rewardsLast90 = await Reward.countDocuments({ employeeId, awardedAt: { $gte: daysAgo(90) } });
    const feedbackGivenLast90 = await Feedback.countDocuments({ fromEmployee: employeeId, createdAt: { $gte: daysAgo(90) } });

    const performanceScore = Number(signals.avgKpiScore.toFixed(2));
    const attendanceScore =
      last30Attendance.length === 0
        ? 0
        : Number(((signals.presentCount / last30Attendance.length) * 100).toFixed(2));
    const engagementScore = Math.min(
      100,
      Math.round(feedbackGivenLast90 * 8 + rewardsLast90 * 12 + employee.badges.length * 10)
    );
    const overallScore = Number(
      (performanceScore * 0.4 + attendanceScore * 0.35 + engagementScore * 0.25).toFixed(2)
    );

    const latest = signals.performances[0];
    const previous = signals.performances[1];
    let trend = 'stable';
    if (latest && previous && latest.kpiScore - previous.kpiScore > 5) trend = 'improving';
    if (latest && previous && previous.kpiScore - latest.kpiScore > 5) trend = 'declining';

    const strengths = [];
    const improvements = [];

    if (performanceScore >= 80) strengths.push('Strong KPI performance over the last three months');
    else if (performanceScore < 65) improvements.push('Improve KPI consistency with clearer monthly goals');

    if (attendanceScore >= 90) strengths.push('Reliable attendance pattern');
    else if (attendanceScore < 75) improvements.push('Address attendance consistency and schedule blockers');

    if (engagementScore >= 70) strengths.push('Healthy engagement through feedback, rewards, and badges');
    else if (engagementScore < 45) improvements.push('Increase peer feedback participation and recognition activity');

    if (strengths.length === 0) strengths.push('Balanced baseline with room for targeted growth');
    if (improvements.length === 0) improvements.push('Maintain momentum and keep recognition cadence steady');

    let predictedNextMonthScore = overallScore;
    if (latest && previous) {
      predictedNextMonthScore = Math.max(0, Math.min(100, latest.kpiScore + (latest.kpiScore - previous.kpiScore)));
    }

    return res.status(200).json({
      success: true,
      scorecard: {
        overallScore,
        performanceScore,
        attendanceScore,
        engagementScore,
        trend,
        strengths,
        improvements,
        predictedNextMonthScore: Number(predictedNextMonthScore.toFixed(2)),
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.getGeminiRecommendations = async (req, res, next) => {
  try {
    const employees = await User.find({ role: { $ne: 'admin' } }).select('name department role');
    
    const employeeData = await Promise.all(
      employees.map(async (emp) => {
        const last30Days = daysAgo(30);
        const attendance = await Attendance.find({ employeeId: emp._id, date: { $gte: last30Days } });
        const performances = await Performance.find({ employeeId: emp._id }).sort({ year: -1, month: -1 }).limit(1);
        
        return {
          id: emp._id,
          name: emp.name,
          department: emp.department,
          role: emp.role,
          recentAttendance: {
            present: attendance.filter(a => a.status === 'present').length,
            absent: attendance.filter(a => a.status === 'absent').length,
            late: attendance.filter(a => a.status === 'late').length,
            halfDay: attendance.filter(a => a.status === 'half-day').length,
          },
          lastPerformanceScore: performances.length > 0 ? performances[0].kpiScore : null,
        };
      })
    );

    const prompt = `You are an HR AI assistant for a company reward system. 
    Here is the employee data: ${JSON.stringify(employeeData)}
    Based on this data, give 5 specific actionable HR recommendations 
    to improve employee motivation and reward fairness.
    Return ONLY a JSON array of objects with fields: 
    title, message, priority (High/Medium/Low), type, actionLabel.
    No markdown, no explanation, just the JSON array.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    const recommendations = JSON.parse(text);

    return res.status(200).json({ success: true, recommendations });
  } catch (error) {
    return next(error);
  }
};
