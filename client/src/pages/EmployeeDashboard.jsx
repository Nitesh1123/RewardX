import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import {
  BsCalendar3,
  BsCalendarCheck,
} from 'react-icons/bs';
import { BsCoin } from 'react-icons/bs';
import { BsBarChart } from 'react-icons/bs';
import {
  RiMedalLine,
} from 'react-icons/ri';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  CartesianGrid,
} from 'recharts';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import StatCard from '../components/dashboard/StatCard';
import SkeletonCard from '../components/common/SkeletonCard';
import PageTransition from '../components/common/PageTransition';
import TextReveal from '../components/common/TextReveal';
import { fadeInUp, staggerContainer } from '../utils/animations';

gsap.registerPlugin(TextPlugin);

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const tierStyles = {
  bronze: { border: 'border-amber-700', bg: 'bg-amber-900/20', text: 'text-amber-700' },
  silver: { border: 'border-gray-400', bg: 'bg-gray-500/10', text: 'text-gray-400' },
  gold: { border: 'border-amber-400', bg: 'bg-amber-400/10', text: 'text-amber-400' },
  platinum: { border: 'border-purple-400', bg: 'bg-purple-500/10', text: 'text-purple-400' },
};

const categoryIcons = {
  performance: { icon: '🏆', color: 'bg-amber-500/15 text-amber-400' },
  attendance: { icon: '📅', color: 'bg-emerald-500/15 text-emerald-400' },
  teamwork: { icon: '👥', color: 'bg-blue-500/15 text-blue-400' },
  innovation: { icon: '💡', color: 'bg-purple-500/15 text-purple-400' },
};

const formatDate = (date) =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));

const getInitials = (name) => {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'RX';
};

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState({ points: 0, badgesCount: 0, attendancePercentage: 0, avgPerformanceScore: 0 });
  const [rewards, setRewards] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6M');
  const [currentTime, setCurrentTime] = useState(new Date());
  const handRef = useRef(null);
  const attendanceRingRef = useRef(null);
  const leaderboardBarsRef = useRef([]);

  // Load dashboard data
  useEffect(() => {
    const loadDashboard = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const [meRes, summaryRes, rewardsRes, performanceRes, attendanceRes, leaderboardRes] = await Promise.allSettled([
          api.get('/auth/me'),
          api.get(`/employees/${user.id}/summary`),
          api.get(`/rewards/${user.id}`),
          api.get(`/performance/${user.id}`),
          api.get(`/attendance/${user.id}`),
          api.get('/rewards/leaderboard'),
        ]);

        if (meRes.status === 'fulfilled') setProfile(meRes.value.data.user);
        if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value.data.summary);
        if (rewardsRes.status === 'fulfilled') setRewards(rewardsRes.value.data.rewards);
        if (performanceRes.status === 'fulfilled') setPerformance(performanceRes.value.data.performance);
        if (attendanceRes.status === 'fulfilled') setAttendance(attendanceRes.value.data.attendance);
        if (leaderboardRes.status === 'fulfilled') setLeaderboard(leaderboardRes.value.data.leaderboard);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user?.id]);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Waving hand animation
  useEffect(() => {
    if (handRef.current) {
      gsap.to(handRef.current, {
        rotation: 20,
        repeat: 5,
        yoyo: true,
        duration: 0.3,
        ease: 'power1.inOut',
        delay: 0.8,
      });
    }
  }, []);

  // Attendance ring animation
  useEffect(() => {
    if (!loading && attendanceRingRef.current) {
      const circumference = 2 * Math.PI * 60;
      const offset = circumference - (summary.attendancePercentage / 100) * circumference;

      gsap.fromTo(
        attendanceRingRef.current,
        { strokeDashoffset: circumference },
        {
          strokeDashoffset: offset,
          duration: 1.5,
          ease: 'power2.out',
          delay: 0.5,
        }
      );
    }
  }, [loading, summary.attendancePercentage]);

  // Leaderboard bars animation
  useEffect(() => {
    if (!loading && leaderboardBarsRef.current.length > 0) {
      const maxPoints = Math.max(...leaderboard.slice(0, 5).map(l => l.rewardPoints), 1);

      leaderboardBarsRef.current.forEach((bar, index) => {
        if (bar) {
          const points = leaderboard[index]?.rewardPoints || 0;
          const widthPercent = (points / maxPoints) * 100;

          gsap.fromTo(
            bar,
            { width: '0%' },
            {
              width: `${widthPercent}%`,
              duration: 1,
              ease: 'power2.out',
              delay: index * 0.1,
            }
          );
        }
      });
    }
  }, [loading, leaderboard]);

  const chartData = useMemo(() => {
    const monthsToShow = timeRange === '1M' ? 1 : timeRange === '3M' ? 3 : 6;
    const latest = performance.slice(0, monthsToShow).reverse();

    if (latest.length === 0) {
      return monthNames.slice(0, monthsToShow).map((month) => ({ month, kpiScore: 0 }));
    }

    return latest.map((review) => ({
      month: monthNames[review.month - 1],
      kpiScore: review.kpiScore,
    }));
  }, [performance, timeRange]);

  const attendanceStats = useMemo(() => {
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    // Calculate streak
    let streak = 0;
    for (let i = attendance.length - 1; i >= 0; i--) {
      if (attendance[i].status === 'present') streak++;
      else break;
    }

    return { total, present, absent, late, percentage, streak };
  }, [attendance]);

  const topFive = leaderboard.slice(0, 5);
  const currentUserRank = leaderboard.find((entry) => entry.id === user?.id);
  const badges = profile?.badges || [];

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const todayDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const currentTimeStr = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Loading state
  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-[#08080F] p-6 space-y-6">
          <div className="max-w-[1400px] mx-auto space-y-6">
            {/* Header skeleton */}
            <div className="flex justify-between items-start mb-2">
              <div className="space-y-3">
                <div className="h-6 w-32 bg-white/[0.06] rounded" />
                <div className="h-10 w-64 bg-white/[0.08] rounded" />
              </div>
              <div className="h-14 w-40 bg-white/[0.06] rounded-2xl" />
            </div>

            {/* Stat cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} variant="stat" />
              ))}
            </div>

            {/* Charts skeleton */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <SkeletonCard variant="chart" />
              </div>
              <div>
                <SkeletonCard variant="attendance" />
              </div>
            </div>

            {/* Rewards + Badges skeleton */}
            <div className="grid grid-cols-2 gap-4">
              <SkeletonCard variant="list" />
              <SkeletonCard variant="badges" />
            </div>

            {/* Leaderboard skeleton */}
            <SkeletonCard variant="list" />
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#08080F] p-6 space-y-6">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* SECTION 1 — PAGE HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-start mb-2"
          >
            {/* Left - Greeting */}
            <div>
              <p className="text-gray-400 text-lg font-normal">{getGreeting()},</p>
              <div className="flex items-center gap-2">
                <TextReveal
                  text={profile?.name || 'Teammate'}
                  className="text-white text-3xl font-bold"
                  delay={0.3}
                  stagger={0.05}
                />
                <span ref={handRef} className="text-3xl inline-block">👋</span>
              </div>
              <p className="text-gray-500 text-sm mt-1">
                Here's what's happening with your rewards today
              </p>
            </div>

            {/* Right - Date Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-[rgba(255,255,255,0.03)] border border-[rgba(245,158,11,0.1)] px-5 py-3 rounded-2xl flex items-center gap-3"
            >
              <BsCalendar3 size={18} className="text-amber-400" />
              <div>
                <p className="text-white font-semibold text-sm">{todayDate}</p>
                <p className="text-amber-400 text-xs font-mono">{currentTimeStr}</p>
              </div>
            </motion.div>
          </motion.div>

          {/* SECTION 2 — STAT CARDS ROW */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
          >
            <StatCard
              title="Total Points"
              value={summary.points}
              icon={BsCoin}
              iconBg="rgba(245,158,11,0.15)"
              trend="up"
              trendValue={12}
              suffix="pts"
              description="Lifetime reward points"
              index={0}
            />
            <StatCard
              title="Badges Earned"
              value={summary.badgesCount}
              icon={RiMedalLine}
              iconBg="rgba(139,92,246,0.15)"
              trend="up"
              trendValue={2}
              description="Achievements unlocked"
              index={1}
            />
            <StatCard
              title="Attendance"
              value={attendanceStats.percentage}
              icon={BsCalendarCheck}
              iconBg="rgba(16,185,129,0.15)"
              trend={attendanceStats.percentage > 80 ? 'up' : 'down'}
              trendValue={attendanceStats.streak}
              suffix="%"
              description="This month attendance rate"
              index={2}
            />
            <StatCard
              title="Performance"
              value={summary.avgPerformanceScore || 0}
              icon={BsBarChart}
              iconBg="rgba(59,130,246,0.15)"
              trend="up"
              trendValue={5}
              suffix="/100"
              description="Latest KPI score"
              index={3}
            />
          </motion.div>

          {/* SECTION 3 — CHARTS ROW */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          >
            {/* LEFT — Performance Chart */}
            <div className="lg:col-span-2 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-white font-semibold text-base">Performance Trend</p>
                  <p className="text-gray-500 text-xs mt-0.5">Last {timeRange === '1M' ? 'month' : timeRange === '3M' ? '3 months' : '6 months'} KPI scores</p>
                </div>
                <div className="flex gap-2">
                  {['6M', '3M', '1M'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        timeRange === range
                          ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <defs>
                      <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#4B5563', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#4B5563', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#0D0D18',
                        border: '1px solid rgba(245,158,11,0.2)',
                        borderRadius: '10px',
                        padding: '10px 14px',
                      }}
                      labelStyle={{ color: '#F59E0B' }}
                      itemStyle={{ color: 'white' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="kpiScore"
                      stroke="none"
                      fill="url(#goldGradient)"
                    />
                    <Line
                      type="monotone"
                      dataKey="kpiScore"
                      stroke="#F59E0B"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{
                        r: 5,
                        fill: '#F59E0B',
                        strokeWidth: 2,
                        stroke: '#08080F',
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* RIGHT — Attendance Ring Chart */}
            <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
              <div className="mb-4">
                <p className="text-white font-semibold">Attendance</p>
                <p className="text-gray-500 text-xs">This month</p>
              </div>

              <div className="flex justify-center py-4 relative">
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <g transform="rotate(-90 80 80)">
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="12"
                    />
                    <circle
                      ref={attendanceRingRef}
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 60}
                      strokeDashoffset={2 * Math.PI * 60}
                    />
                  </g>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-3xl font-bold text-white">{attendanceStats.percentage}%</p>
                  <p className="text-xs text-gray-500">Attendance</p>
                </div>
              </div>

              {/* Stats pills */}
              <div className="flex justify-center gap-2 mt-4">
                <div className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Present: {attendanceStats.present}
                </div>
                <div className="text-xs px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  Absent: {attendanceStats.absent}
                </div>
                <div className="text-xs px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Late: {attendanceStats.late}
                </div>
              </div>

              {/* Streak */}
              <div className="flex items-center justify-center gap-2 mt-3">
                <span>🔥</span>
                <span className="text-amber-400 font-semibold text-sm">{attendanceStats.streak} day streak</span>
              </div>
            </div>
          </motion.div>

          {/* SECTION 4 — REWARDS + BADGES ROW */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          >
            {/* LEFT — Recent Rewards */}
            <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <p className="text-white font-semibold">Recent Rewards</p>
                <button className="text-amber-400 text-xs hover:underline">View All</button>
              </div>

              <div className="space-y-3">
                {rewards.length === 0 && (
                  <div className="text-center py-8">
                    <span className="text-4xl text-gray-600">🏆</span>
                    <p className="text-gray-600 mt-2">No rewards yet</p>
                    <p className="text-gray-700 text-xs">Keep up the great work!</p>
                  </div>
                )}
                {rewards.slice(0, 5).map((reward) => {
                  const categoryStyle = categoryIcons[reward.category] || categoryIcons.performance;
                  return (
                    <div
                      key={reward._id}
                      className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${categoryStyle.color}`}>
                        <span className="text-lg">{categoryStyle.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{reward.description}</p>
                        <div className="flex gap-2 mt-0.5">
                          <span className="text-[10px] uppercase tracking-wide rounded-full px-2 py-0.5 bg-white/5 text-gray-400">
                            {reward.category}
                          </span>
                          <span className="text-gray-600 text-xs">{formatDate(reward.awardedAt)}</span>
                        </div>
                      </div>
                      <p className="text-amber-400 font-bold text-sm">
                        {reward.type === 'bonus' ? `+₹${reward.amount}` : `+${reward.amount}`}
                        {reward.type !== 'bonus' && <span className="text-xs">pts</span>}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT — My Badges */}
            <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <p className="text-white font-semibold">My Badges</p>
                <div className="bg-amber-400/10 text-amber-400 text-xs px-2 py-0.5 rounded-full">
                  {badges.length} earned
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {badges.length === 0 && (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5 opacity-30">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-gray-600 bg-gray-900/20">
                          <span className="text-xl">🔒</span>
                        </div>
                        <p className="text-[11px] text-gray-400 text-center">Locked</p>
                      </div>
                    ))}
                  </>
                )}
                {badges.map(({ badgeId, earnedAt }) => {
                  const tierStyle = tierStyles[badgeId?.tier] || tierStyles.bronze;
                  return (
                    <motion.div
                      key={badgeId?._id || earnedAt}
                      className="flex flex-col items-center gap-1.5 cursor-pointer group"
                      whileHover={{ scale: 1.08 }}
                      title={`${badgeId?.name || 'Badge'} - ${badgeId?.criteria || ''}`}
                    >
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 ${tierStyle.border} ${tierStyle.bg} transition-shadow group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]`}>
                        <span className="text-[28px]">{badgeId?.icon || '🏆'}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 text-center truncate max-w-[70px]">
                        {badgeId?.name || 'Badge'}
                      </p>
                      <p className={`text-[10px] font-bold uppercase ${tierStyle.text}`}>
                        {badgeId?.tier || 'earned'}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* SECTION 5 — LEADERBOARD PREVIEW */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-white font-semibold">Top Performers</p>
                <p className="text-gray-500 text-xs">This month's leaderboard</p>
              </div>
              <button className="text-amber-400 text-xs border border-amber-400/20 px-3 py-1.5 rounded-lg hover:bg-amber-400/10 transition-colors">
                Full Leaderboard →
              </button>
            </div>

            <div className="space-y-2">
              {topFive.map((entry, index) => {
                const isCurrentUser = entry.id === user?.id;
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0 ${
                      isCurrentUser ? 'bg-amber-400/5 rounded-xl px-3 -mx-3' : ''
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-8 text-center">
                      {index === 0 && <span className="text-xl">🥇</span>}
                      {index === 1 && <span className="text-xl">🥈</span>}
                      {index === 2 && <span className="text-xl">🥉</span>}
                      {index > 2 && <span className="text-gray-600 font-bold text-sm">#{entry.rank || index + 1}</span>}
                    </div>

                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                      {entry.profileImage ? (
                        <img src={entry.profileImage} alt={entry.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-white">{getInitials(entry.name)}</span>
                      )}
                    </div>

                    {/* Name + Dept */}
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">
                        {entry.name}
                        {isCurrentUser && <span className="text-amber-400 ml-1">(You)</span>}
                      </p>
                      <p className="text-gray-600 text-xs">{entry.department}</p>
                    </div>

                    {/* Points Bar */}
                    <div className="w-32">
                      <div className="bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div
                          ref={(el) => (leaderboardBarsRef.current[index] = el)}
                          className="bg-amber-400 h-full rounded-full"
                          style={{ width: '0%' }}
                        />
                      </div>
                    </div>

                    {/* Points Value */}
                    <div className="w-16 text-right">
                      <p className="text-amber-400 font-bold text-sm">{entry.rewardPoints.toLocaleString()}</p>
                      <p className="text-gray-600 text-xs">pts</p>
                    </div>
                  </div>
                );
              })}
              {currentUserRank && currentUserRank.rank > 5 && (
                <div className="flex items-center gap-3 py-2.5 bg-amber-400/5 rounded-xl px-3 -mx-3">
                  <div className="w-8 text-center">
                    <span className="text-gray-600 font-bold text-sm">#{currentUserRank.rank}</span>
                  </div>
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                    {currentUserRank.profileImage ? (
                      <img src={currentUserRank.profileImage} alt={currentUserRank.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-white">{getInitials(currentUserRank.name)}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                      {currentUserRank.name}
                      <span className="text-amber-400 ml-1">(You)</span>
                    </p>
                    <p className="text-gray-600 text-xs">{currentUserRank.department}</p>
                  </div>
                  <div className="w-32">
                    <div className="bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                  <div className="w-16 text-right">
                    <p className="text-amber-400 font-bold text-sm">{currentUserRank.rewardPoints.toLocaleString()}</p>
                    <p className="text-gray-600 text-xs">pts</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default EmployeeDashboard;
