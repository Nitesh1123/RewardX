const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Performance = require('../models/Performance');
const Reward = require('../models/Reward');

exports.getRiskAnalysis = async (req, res) => {
  try {
    const employees = await User.find({ role: { $ne: 'admin' } });
    const attendances = await Attendance.find();
    const performances = await Performance.find();
    const rewards = await Reward.find();

    const data = employees.map(emp => {
      const empAttendances = attendances.filter(a => a.employeeId.toString() === emp._id.toString());
      const totalDays = empAttendances.length;
      let attendanceScore = 100;
      if (totalDays > 0) {
        const presentDays = empAttendances.filter(a => a.status === 'present').length;
        attendanceScore = (presentDays / totalDays) * 100;
      }

      const empPerformances = performances.filter(p => p.employeeId.toString() === emp._id.toString());
      let performanceScore = 100;
      if (empPerformances.length > 0) {
        const sortedPerf = empPerformances.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        performanceScore = sortedPerf[0].score || 100;
      }

      const empRewards = rewards.filter(r => r.employeeId.toString() === emp._id.toString());
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentRewards = empRewards.filter(r => new Date(r.date || r.createdAt) >= thirtyDaysAgo);
      
      let rewardScore = recentRewards.length > 0 ? 100 : 0;
      
      let lastRewardDate = null;
      if (empRewards.length > 0) {
        const sortedRewards = empRewards.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
        lastRewardDate = sortedRewards[0].date || sortedRewards[0].createdAt;
      }

      const riskScore = Math.round(100 - ((attendanceScore * 0.4) + (performanceScore * 0.4) + (rewardScore * 0.2)));
      
      let riskLevel = 'Low';
      if (riskScore >= 70) riskLevel = 'High';
      else if (riskScore >= 40) riskLevel = 'Medium';

      const factors = [];
      if (attendanceScore < 70) factors.push('Low attendance');
      if (performanceScore < 50) factors.push('Below average performance');
      if (rewardScore === 0) factors.push('No recent rewards');

      let aiRecommendation = 'Monitor progress';
      if (riskLevel === 'High') aiRecommendation = 'Immediate review required';
      else if (riskLevel === 'Medium') aiRecommendation = 'Schedule 1-on-1 check-in';

      return {
        employeeId: emp._id,
        name: emp.name,
        department: emp.department || 'N/A',
        designation: emp.designation || 'N/A',
        riskScore,
        riskLevel,
        attendanceRate: Math.round(attendanceScore),
        performanceScore,
        lastRewardDate,
        factors,
        aiRecommendation
      };
    });

    data.sort((a, b) => b.riskScore - a.riskScore);

    res.json({ success: true, analysis: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getRewardFairness = async (req, res) => {
  try {
    const rewards = await Reward.find().populate('employeeId');
    const employees = await User.find({ role: { $ne: 'admin' } });

    const deptStats = {};
    employees.forEach(emp => {
      const dept = emp.department || 'Unassigned';
      if (!deptStats[dept]) {
        deptStats[dept] = { employeeCount: 0, totalRewards: 0, totalPoints: 0 };
      }
      deptStats[dept].employeeCount++;
    });

    rewards.forEach(r => {
      if (r.employeeId && r.employeeId.department) {
        const dept = r.employeeId.department;
        if (deptStats[dept]) {
          deptStats[dept].totalRewards++;
          deptStats[dept].totalPoints += (r.points || 0);
        }
      }
    });

    const departments = [];
    let maxAvg = -1;
    let minAvg = Infinity;
    let mostRewarded = 'N/A';
    let leastRewarded = 'N/A';

    for (const [dept, stats] of Object.entries(deptStats)) {
      if (stats.employeeCount === 0) continue;
      const avgPointsPerEmployee = Math.round(stats.totalPoints / stats.employeeCount);
      const rewardsPerEmployee = Number((stats.totalRewards / stats.employeeCount).toFixed(2));
      
      let fairnessScore = 100 - Math.min(100, Math.abs(avgPointsPerEmployee - 500) / 10);
      fairnessScore = Math.round(Math.max(0, Math.min(100, fairnessScore)));
      
      let fairnessStatus = 'Balanced';
      if (fairnessScore < 60 && avgPointsPerEmployee < 400) fairnessStatus = 'Underfavored';
      else if (fairnessScore < 60 && avgPointsPerEmployee > 600) fairnessStatus = 'Overfavored';

      departments.push({
        department: dept,
        totalRewards: stats.totalRewards,
        totalPoints: stats.totalPoints,
        employeeCount: stats.employeeCount,
        avgPointsPerEmployee,
        rewardsPerEmployee,
        fairnessScore,
        fairnessStatus
      });

      if (avgPointsPerEmployee > maxAvg) {
        maxAvg = avgPointsPerEmployee;
        mostRewarded = dept;
      }
      if (avgPointsPerEmployee < minAvg) {
        minAvg = avgPointsPerEmployee;
        leastRewarded = dept;
      }
    }

    const overallFairnessScore = departments.length > 0 ? 
      Math.round(departments.reduce((acc, curr) => acc + curr.fairnessScore, 0) / departments.length) : 100;

    let recommendation = 'Fairness is optimal based on current data.';
    if (departments.length > 1 && leastRewarded !== 'N/A') {
      recommendation = `${leastRewarded} department is under-rewarded. Consider increasing recognition.`;
    }

    res.json({
      success: true,
      fairness: departments,
      summary: {
        mostRewarded,
        leastRewarded,
        overallFairnessScore,
        recommendation
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

