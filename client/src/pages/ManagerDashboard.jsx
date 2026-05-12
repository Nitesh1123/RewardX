import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import toast from 'react-hot-toast';
import {
  FiAward,
  FiX,
  FiSearch,
  FiStar,
} from 'react-icons/fi';
import { BsCoin, BsBarChart, BsArrowUpRight, BsClipboard, BsPeople, BsGift } from 'react-icons/bs';
import {
  RiMedalLine,
} from 'react-icons/ri';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
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

const categories = ['performance', 'attendance', 'teamwork', 'innovation'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const emptyAward = { employeeId: '', type: 'points', amount: '', category: 'performance', description: '', badgeId: '' };
const emptyReview = {
  employeeId: '',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  kpiScore: '',
  goalsCompleted: '',
  totalGoals: '',
  rating: '',
  productivity: '',
  managerNote: '',
};

const formatDate = (date) => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date(date));

const formatRelativeTime = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return formatDate(date);
};

const categoryColors = {
  performance: '#F59E0B',
  attendance: '#10B981',
  teamwork: '#3B82F6',
  innovation: '#8B5CF6',
};

const departmentColors = {
  Engineering: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-400/20' },
  HR: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-400/20' },
  Sales: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-400/20' },
  Marketing: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-400/20' },
  Operations: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-400/20' },
  Finance: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-400/20' },
};

const getInitials = (name) => {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'RX';
};

const getHealthScoreColor = (score) => {
  if (score >= 80) return '#10B981';
  if (score >= 60) return '#F59E0B';
  return '#EF4444';
};

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [badges, setBadges] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [latestReviews, setLatestReviews] = useState({});
  const [awardModal, setAwardModal] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [badgeModal, setBadgeModal] = useState(false);
  const [awardForm, setAwardForm] = useState(emptyAward);
  const [reviewForm, setReviewForm] = useState(emptyReview);
  const [badgeForm, setBadgeForm] = useState({ employeeId: '', badgeId: '', note: '' });
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [awardSuccess, setAwardSuccess] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const healthRingRef = useRef(null);
  const pendingPulseRef = useRef(null);
  const headingRef = useRef(null);

  const loadManagerData = async () => {
    try {
      setLoading(true);
      const [employeesRes, badgesRes] = await Promise.allSettled([api.get('/employees'), api.get('/badges')]);
      const nextEmployees = employeesRes.status === 'fulfilled' ? employeesRes.value.data.employees : [];
      setEmployees(nextEmployees);
      if (badgesRes.status === 'fulfilled') setBadges(badgesRes.value.data.badges);

      const aggregate = await Promise.all(
        nextEmployees.map(async (employee) => {
          const [summaryRes, rewardsRes, feedbackRes, reviewRes] = await Promise.allSettled([
            api.get(`/employees/${employee._id}/summary`),
            api.get(`/rewards/${employee._id}`),
            api.get(`/feedback/${employee._id}`),
            api.get(`/performance/${employee._id}/latest`),
          ]);

          return {
            employeeId: employee._id,
            summary: summaryRes.status === 'fulfilled' ? summaryRes.value.data.summary : null,
            rewards: rewardsRes.status === 'fulfilled' ? rewardsRes.value.data.rewards : [],
            feedback: feedbackRes.status === 'fulfilled' ? feedbackRes.value.data.feedback : [],
            latestReview: reviewRes.status === 'fulfilled' ? reviewRes.value.data.performance : null,
          };
        })
      );

      setSummaries(Object.fromEntries(aggregate.map((item) => [item.employeeId, item.summary])));
      setLatestReviews(Object.fromEntries(aggregate.map((item) => [item.employeeId, item.latestReview])));
      setRewards(aggregate.flatMap((item) => item.rewards));
      setFeedback(aggregate.flatMap((item) => item.feedback).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManagerData();
  }, []);

  // Calculate pending reviews before using in useEffect
  const pendingReviews = useMemo(() => {
    return employees.filter((employee) => !latestReviews[employee._id]).length;
  }, [employees, latestReviews]);

  // Pending pulse animation
  useEffect(() => {
    if (pendingPulseRef.current && pendingReviews > 0) {
      gsap.to(pendingPulseRef.current, {
        scale: 1.4,
        opacity: 0.5,
        duration: 0.75,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });
    }
  }, [pendingReviews]);

  // Health ring animation
  useEffect(() => {
    if (!loading && healthRingRef.current) {
      const circumference = 2 * Math.PI * 60;
      const healthScore = Math.round(
        (Object.values(summaries).reduce((acc, s) => acc + (s?.avgPerformanceScore || 0), 0) / employees.length) || 0
      );
      const offset = circumference - (healthScore / 100) * circumference;

      gsap.fromTo(
        healthRingRef.current,
        { strokeDashoffset: circumference },
        {
          strokeDashoffset: offset,
          duration: 1.5,
          ease: 'power2.out',
          delay: 0.3,
        }
      );
    }
  }, [loading, summaries, employees.length]);

  // Close modals on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setAwardModal(false);
        setReviewModal(false);
        setBadgeModal(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const distribution = useMemo(
    () =>
      categories.map((category) => ({
        name: category,
        count: rewards.filter((reward) => reward.category === category).length,
      })),
    [rewards]
  );

  const topPerformer = useMemo(() => {
    if (employees.length === 0) return { name: 'No team yet', kpiScore: 0 };
    const best = employees.reduce((best, employee) => (employee.rewardPoints > best.rewardPoints ? employee : best), employees[0]);
    const review = latestReviews[best._id];
    return { name: best.name, kpiScore: review?.kpiScore || 0 };
  }, [employees, latestReviews]);

  const rewardsThisMonth = rewards.filter((reward) => new Date(reward.awardedAt).getMonth() === new Date().getMonth()).length;

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           employee.department?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'All' || employee.role === roleFilter.toLowerCase();
      return matchesSearch && matchesRole;
    });
  }, [employees, searchQuery, roleFilter]);

  // Team health score
  const teamHealthScore = useMemo(() => {
    if (employees.length === 0) return 0;
    const avgPerformance = Object.values(summaries).reduce((acc, s) => acc + (s?.avgPerformanceScore || 0), 0) / employees.length;
    const avgAttendance = Object.values(summaries).reduce((acc, s) => acc + (s?.attendancePercentage || 0), 0) / employees.length;
    return Math.round((avgPerformance + avgAttendance) / 2);
  }, [summaries, employees.length]);

  // Recent activity
  const recentActivity = useMemo(() => {
    const rewardActivities = rewards.slice(0, 5).map((r) => ({
      type: r.type === 'badge' ? 'badge' : 'award',
      description: r.type === 'badge' ? `gave a badge to` : `awarded ${r.amount} points to`,
      target: employees.find((e) => e._id === r.employeeId)?.name || 'Employee',
      date: r.awardedAt,
      category: r.category,
    }));

    const feedbackActivities = feedback.slice(0, 3).map((f) => ({
      type: 'feedback',
      description: `received feedback for`,
      target: employees.find((e) => e._id === f.toEmployee)?.name || 'Employee',
      date: f.createdAt,
      rating: f.rating,
    }));

    return [...rewardActivities, ...feedbackActivities]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);
  }, [rewards, feedback, employees]);

  const openAwardModal = (employee, type = 'points') => {
    setSelectedEmployee(employee);
    setAwardForm({ ...emptyAward, employeeId: employee._id, type, badgeId: badges[0]?._id || '' });
    setAwardSuccess(false);
    setAwardModal(true);
  };

  const openReviewModal = (employee) => {
    setSelectedEmployee(employee);
    setReviewForm({ ...emptyReview, employeeId: employee._id });
    setReviewModal(true);
  };

  const openBadgeModal = (employee) => {
    setSelectedEmployee(employee);
    setBadgeForm({ employeeId: employee._id, badgeId: badges[0]?._id || '', note: '' });
    setBadgeModal(true);
  };

  const submitAward = async (event) => {
    event.preventDefault();
    const payload = {
      ...awardForm,
      amount: Number(awardForm.amount || 0),
    };

    if (payload.type !== 'badge') {
      delete payload.badgeId;
    }

    await api.post('/rewards/award', payload);
    setAwardSuccess(true);
    setNotice('Reward awarded successfully.');
    toast.success('Reward awarded successfully.');

    // Confetti effect
    const confetti = Array.from({ length: 20 }, (_, i) => ({
      x: Math.random() * 200 - 100,
      y: Math.random() * -200 - 50,
      rotation: Math.random() * 360,
      delay: i * 0.05,
    }));

    // Auto close after 2s
    setTimeout(() => {
      setAwardModal(false);
      setAwardForm(emptyAward);
      setAwardSuccess(false);
      loadManagerData();
    }, 2000);
  };

  const submitBadge = async (event) => {
    event.preventDefault();
    const payload = {
      employeeId: badgeForm.employeeId,
      type: 'badge',
      badgeId: badgeForm.badgeId,
      description: badgeForm.note || 'Badge awarded',
      category: 'performance',
      amount: 0,
    };

    await api.post('/rewards/award', payload);
    setNotice('Badge awarded successfully.');
    toast.success('Badge awarded successfully.');
    setBadgeModal(false);
    setBadgeForm({ employeeId: '', badgeId: '', note: '' });
    await loadManagerData();
  };

  const submitReview = async (event) => {
    event.preventDefault();
    await api.post('/performance', {
      ...reviewForm,
      month: Number(reviewForm.month),
      year: Number(reviewForm.year),
      kpiScore: Number(reviewForm.kpiScore),
      goalsCompleted: Number(reviewForm.goalsCompleted),
      totalGoals: Number(reviewForm.totalGoals),
      rating: Number(reviewForm.rating),
      productivity: Number(reviewForm.productivity),
    });
    setNotice('Performance review added.');
    toast.success('Performance review added.');
    setReviewModal(false);
    setReviewForm(emptyReview);
    await loadManagerData();
  };

  // Loading state
  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-[#08080F] p-6 space-y-6">
          <div className="max-w-[1400px] mx-auto space-y-6">
            {/* Header skeleton */}
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <div className="h-3 w-32 bg-white/[0.06] rounded" />
                <div className="h-10 w-64 bg-white/[0.08] rounded" />
                <div className="h-4 w-48 bg-white/[0.05] rounded" />
              </div>
              <div className="flex gap-3">
                <div className="h-10 w-32 bg-white/[0.06] rounded-xl" />
                <div className="h-10 w-32 bg-white/[0.06] rounded-xl" />
              </div>
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

            {/* Table skeleton */}
            <SkeletonCard variant="list" className="h-96" />
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
            className="flex justify-between items-start"
          >
            {/* Left */}
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] text-amber-400/70 mb-2">MANAGER OVERVIEW</p>
              <TextReveal
                text="Team Dashboard"
                className="text-white text-3xl font-bold"
                delay={0.2}
                stagger={0.04}
              />
              <p className="text-gray-500 text-sm mt-1">
                Managing {user?.department || 'All'} department • {employees.length} members
              </p>
            </div>

            {/* Right - Buttons */}
            <div className="flex gap-3">
              <motion.button
                onClick={() => openReviewModal(employees[0] || { _id: '' })}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-[rgba(245,158,11,0.3)] text-amber-400 hover:bg-amber-400/10 transition-colors flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <BsClipboard size={16} />
                Add Review
              </motion.button>
              <motion.button
                onClick={() => openAwardModal(employees[0] || { _id: '' })}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#08080F] flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #F59E0B, #B45309)',
                  boxShadow: '0 4px 20px rgba(245,158,11,0.3)',
                }}
                whileHover={{
                  filter: 'brightness(1.1)',
                  y: -1,
                  boxShadow: '0 8px 30px rgba(245,158,11,0.4)',
                }}
                whileTap={{ scale: 0.97 }}
              >
                <BsGift size={16} />
                Award Reward
              </motion.button>
            </div>
          </motion.div>

          {/* SECTION 2 — STAT CARDS ROW */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
          >
            <StatCard
              title="Total Employees"
              value={employees.length}
              icon={BsPeople}
              iconBg="rgba(59,130,246,0.15)"
              trend="up"
              trendValue={3}
              description="Active team members"
              index={0}
            />
            <StatCard
              title="Rewards Given"
              value={rewardsThisMonth}
              icon={BsGift}
              iconBg="rgba(245,158,11,0.15)"
              trend="up"
              trendValue={18}
              description="This month total"
              index={1}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.26 }}
              className="relative overflow-hidden rounded-[20px] p-6 transition-all duration-300 cursor-default"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* Background decoration */}
              <div
                className="absolute -top-5 -right-5 w-[120px] h-[120px] rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
                }}
              />
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">Top Performer</p>
                </div>
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'rgba(139,92,246,0.15)',
                    border: '1px solid rgba(139,92,246,0.3)',
                  }}
                >
                  <FiAward size={20} style={{ color: '#8B5CF6' }} />
                </div>
              </div>
              <div className="mt-2 relative z-10">
                <span className="text-white text-2xl font-bold tracking-tight">{topPerformer.name}</span>
              </div>
              <div className="flex justify-between items-end mt-4 relative z-10">
                <p className="text-gray-600 text-xs">{topPerformer.kpiScore} KPI score</p>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-[rgba(16,185,129,0.1)] text-[#10B981]">
                  <BsArrowUpRight size={14} />
                  Lead
                </div>
              </div>
            </motion.div>
            <div className="relative">
              <StatCard
                title="Pending Reviews"
                value={pendingReviews}
                icon={BsClipboard}
                iconBg="rgba(239,68,68,0.15)"
                trend="down"
                trendValue={2}
                description="Awaiting your action"
                index={3}
              />
              {pendingReviews > 0 && (
                <div
                  ref={pendingPulseRef}
                  className="absolute top-4 right-4 w-3 h-3 rounded-full bg-red-500"
                  style={{ transform: 'scale(1)' }}
                />
              )}
            </div>
          </motion.div>

          {/* SECTION 3 — CHARTS ROW */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          >
            {/* LEFT — Reward Distribution Chart */}
            <div className="lg:col-span-2 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-white font-semibold text-base">Reward Distribution</p>
                  <p className="text-gray-500 text-xs">By category this month</p>
                </div>
                <div className="flex gap-2">
                  {Object.entries(categoryColors).map(([cat, color]) => (
                    <div key={cat} className="flex items-center gap-1 text-xs text-gray-400">
                      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                      <span className="capitalize">{cat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#4B5563', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#4B5563', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#0D0D18',
                        border: '1px solid rgba(245,158,11,0.2)',
                        borderRadius: '10px',
                        padding: '10px 14px',
                      }}
                      labelStyle={{ color: '#F59E0B', textTransform: 'capitalize' }}
                      itemStyle={{ color: 'white' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={1200}>
                      {distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={categoryColors[entry.name]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* RIGHT — Team Health Score */}
            <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
              <div className="mb-4">
                <p className="text-white font-semibold">Team Health</p>
                <p className="text-gray-500 text-xs">Overall score</p>
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
                      ref={healthRingRef}
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke={getHealthScoreColor(teamHealthScore)}
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 60}
                      strokeDashoffset={2 * Math.PI * 60}
                    />
                  </g>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-3xl font-bold text-white">{teamHealthScore}</p>
                  <p className="text-xs text-gray-500">/100</p>
                </div>
              </div>

              {/* Mini metrics */}
              <div className="space-y-2 mt-4">
                {[
                  { label: 'Avg Performance', value: Math.round(Object.values(summaries).reduce((a, s) => a + (s?.avgPerformanceScore || 0), 0) / employees.length) || 0, icon: BsBarChart },
                  { label: 'Attendance Rate', value: Math.round(Object.values(summaries).reduce((a, s) => a + (s?.attendancePercentage || 0), 0) / employees.length) || 0, icon: BsClipboard, suffix: '%' },
                  { label: 'Reward Frequency', value: Math.round(rewards.length / Math.max(employees.length, 1)), icon: BsGift, suffix: '/mo' },
                  { label: 'Feedback Score', value: (feedback.reduce((a, f) => a + f.rating, 0) / Math.max(feedback.length, 1)).toFixed(1), icon: FiStar, suffix: '/5' },
                ].map((metric, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2">
                      <metric.icon size={14} className="text-gray-500" />
                      <span className="text-gray-400 text-xs">{metric.label}</span>
                    </div>
                    <span className="text-white text-xs font-semibold">{metric.value}{metric.suffix || ''}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* SECTION 4 — TEAM MEMBERS TABLE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden"
          >
            {/* Table Header */}
            <div className="flex justify-between items-center p-6 pb-4">
              <div>
                <p className="text-white font-semibold">Team Members</p>
                <p className="text-gray-500 text-xs">{filteredEmployees.length} employees</p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-[220px] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] rounded-xl px-4 py-2 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[rgba(245,158,11,0.4)] transition-all"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[rgba(245,158,11,0.4)]"
                >
                  <option value="All">All</option>
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.06)]">
                  <tr>
                    {['Employee', 'Department', 'Points', 'Attendance', 'Performance', 'Actions'].map((header) => (
                      <th key={header} className="text-[11px] font-bold uppercase tracking-widest text-gray-500 px-6 py-4 text-left">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee, index) => {
                    const summary = summaries[employee._id] || {};
                    const latestReview = latestReviews[employee._id];
                    const deptStyle = departmentColors[employee.department] || { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-400/20' };
                    const attendancePct = summary.attendancePercentage || 0;
                    const kpiScore = latestReview?.kpiScore || 0;

                    return (
                      <motion.tr
                        key={employee._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(245,158,11,0.03)] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                              {employee.profileImage ? (
                                <img src={employee.profileImage} alt={employee.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs font-bold text-white">{getInitials(employee.name)}</span>
                              )}
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">{employee.name}</p>
                              <p className="text-gray-600 text-xs">{employee.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full ${deptStyle.bg} ${deptStyle.text} border ${deptStyle.border}`}>
                            {employee.department || 'Unassigned'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <BsCoin size={14} className="text-amber-400" />
                            <span className="text-amber-400 font-semibold text-sm">{employee.rewardPoints?.toLocaleString() || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-[60px]">
                            <p className="text-white text-xs font-semibold mb-1">{attendancePct}%</p>
                            <div className="bg-white/10 h-[3px] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  attendancePct > 80 ? 'bg-emerald-400' : attendancePct > 60 ? 'bg-amber-400' : 'bg-red-400'
                                }`}
                                style={{ width: `${attendancePct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                              kpiScore > 80
                                ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
                                : kpiScore > 60
                                ? 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                                : 'bg-red-400/10 text-red-400 border-red-400/20'
                            }`}
                          >
                            {kpiScore || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <motion.button
                              onClick={() => openAwardModal(employee)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(245,158,11,0.1)] text-amber-400 hover:bg-amber-400/20 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Award Points"
                            >
                              <BsCoin size={14} />
                            </motion.button>
                            <motion.button
                              onClick={() => openBadgeModal(employee)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(139,92,246,0.1)] text-purple-400 hover:bg-purple-400/20 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Give Badge"
                            >
                              <RiMedalLine size={14} />
                            </motion.button>
                            <motion.button
                              onClick={() => openReviewModal(employee)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(59,130,246,0.1)] text-blue-400 hover:bg-blue-400/20 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Add Review"
                            >
                              <BsClipboard size={14} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* SECTION 5 — RECENT ACTIVITY FEED */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6"
          >
            <p className="text-white font-semibold mb-4">Recent Activity</p>
            <div className="space-y-3">
              {recentActivity.length === 0 && (
                <p className="text-gray-600 text-sm">No recent activity</p>
              )}
              {recentActivity.map((activity, index) => {
                const icons = {
                  award: { icon: '🏆', color: 'bg-amber-500/10 text-amber-400' },
                  badge: { icon: '🎖️', color: 'bg-purple-500/10 text-purple-400' },
                  review: { icon: '📋', color: 'bg-blue-500/10 text-blue-400' },
                  feedback: { icon: '💬', color: 'bg-green-500/10 text-green-400' },
                };
                const style = icons[activity.type] || icons.award;

                return (
                  <div key={index} className="flex gap-3 py-3 border-b border-white/5 last:border-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${style.color}`}>
                      <span className="text-sm">{style.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-300 text-sm">
                        <span className="font-semibold text-white">You</span>{' '}
                        <span className="text-amber-400">{activity.description}</span>{' '}
                        <span className="font-semibold text-white">{activity.target}</span>
                      </p>
                    </div>
                    <p className="text-gray-600 text-xs">{formatRelativeTime(activity.date)}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* AWARD POINTS MODAL */}
        <AnimatePresence>
          {awardModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setAwardModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'backOut' }}
                className="w-full max-w-md mx-4 bg-[#0D0D18] border border-[rgba(245,158,11,0.2)] rounded-3xl p-8 shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
                onClick={(e) => e.stopPropagation()}
              >
                {awardSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                      <span className="text-4xl text-emerald-400">✓</span>
                    </div>
                    <p className="text-white text-xl font-bold mb-2">Points Awarded! 🎉</p>
                    <p className="text-gray-500 text-sm">
                      {awardForm.amount} points added to {selectedEmployee?.name}'s account
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <p className="text-white font-bold text-xl">Award Points</p>
                        <p className="text-gray-500 text-sm">Recognize great work</p>
                      </div>
                      <motion.button
                        onClick={() => setAwardModal(false)}
                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                        whileTap={{ scale: 0.9 }}
                      >
                        <FiX size={18} />
                      </motion.button>
                    </div>

                    <form onSubmit={submitAward} className="space-y-4">
                      <div>
                        <label className="text-gray-400 text-xs uppercase tracking-wide mb-2 block">Employee</label>
                        <select
                          value={awardForm.employeeId}
                          onChange={(e) => setAwardForm({ ...awardForm, employeeId: e.target.value })}
                          className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/40"
                        >
                          {employees.map((emp) => (
                            <option key={emp._id} value={emp._id} className="bg-[#0D0D18]">{emp.name} — {emp.department}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-gray-400 text-xs uppercase tracking-wide mb-2 block">Points to Award</label>
                        <input
                          type="number"
                          value={awardForm.amount}
                          onChange={(e) => setAwardForm({ ...awardForm, amount: e.target.value })}
                          className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/40"
                          placeholder="Enter amount"
                        />
                        <div className="flex gap-2 mt-2">
                          {[50, 100, 200, 500].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setAwardForm({ ...awardForm, amount: amt })}
                              className="px-3 py-1 rounded-lg border border-white/10 text-gray-400 text-sm hover:border-amber-400/30 hover:text-amber-400 transition-colors"
                            >
                              +{amt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-gray-400 text-xs uppercase tracking-wide mb-2 block">Category</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'performance', icon: '🏆', label: 'Performance' },
                            { id: 'attendance', icon: '📅', label: 'Attendance' },
                            { id: 'teamwork', icon: '🤝', label: 'Teamwork' },
                            { id: 'innovation', icon: '💡', label: 'Innovation' },
                          ].map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setAwardForm({ ...awardForm, category: cat.id })}
                              className={`p-3 rounded-xl border text-center transition-colors ${
                                awardForm.category === cat.id
                                  ? 'border-amber-400/40 bg-amber-400/8 text-amber-400'
                                  : 'border-white/10 text-gray-400 hover:border-amber-400/20'
                              }`}
                            >
                              <span className="block text-lg mb-1">{cat.icon}</span>
                              <span className="text-xs">{cat.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-gray-400 text-xs uppercase tracking-wide mb-2 block">Note (optional)</label>
                        <textarea
                          value={awardForm.description}
                          onChange={(e) => setAwardForm({ ...awardForm, description: e.target.value })}
                          className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/40 resize-none"
                          rows={3}
                          placeholder="Add a personal note about this achievement..."
                        />
                      </div>

                      <motion.button
                        type="submit"
                        className="w-full py-3 rounded-xl text-sm font-semibold text-[#08080F]"
                        style={{
                          background: 'linear-gradient(135deg, #F59E0B, #B45309)',
                          boxShadow: '0 4px 20px rgba(245,158,11,0.3)',
                        }}
                        whileHover={{ filter: 'brightness(1.1)' }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Award Points
                      </motion.button>
                    </form>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GIVE BADGE MODAL */}
        <AnimatePresence>
          {badgeModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setBadgeModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'backOut' }}
                className="w-full max-w-md mx-4 bg-[#0D0D18] border border-[rgba(245,158,11,0.2)] rounded-3xl p-8 shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-white font-bold text-xl">Give Badge</p>
                    <p className="text-gray-500 text-sm">Recognize achievement</p>
                  </div>
                  <motion.button
                    onClick={() => setBadgeModal(false)}
                    className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                    whileTap={{ scale: 0.9 }}
                  >
                    <FiX size={18} />
                  </motion.button>
                </div>

                <form onSubmit={submitBadge} className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-wide mb-2 block">Employee</label>
                    <select
                      value={badgeForm.employeeId}
                      onChange={(e) => setBadgeForm({ ...badgeForm, employeeId: e.target.value })}
                      className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/40"
                    >
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id} className="bg-[#0D0D18]">{emp.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-wide mb-2 block">Select Badge</label>
                    <div className="grid grid-cols-3 gap-3">
                      {badges.map((badge) => {
                        const tierColors = {
                          bronze: 'border-amber-700',
                          silver: 'border-gray-400',
                          gold: 'border-amber-400',
                          platinum: 'border-purple-400',
                        };
                        const tierEmojis = { bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎' };
                        const isSelected = badgeForm.badgeId === badge._id;

                        return (
                          <button
                            key={badge._id}
                            type="button"
                            onClick={() => setBadgeForm({ ...badgeForm, badgeId: badge._id })}
                            className={`p-3 rounded-2xl border text-center transition-colors ${
                              isSelected
                                ? `${tierColors[badge.tier]} bg-${badge.tier === 'bronze' ? 'amber' : badge.tier === 'silver' ? 'gray' : badge.tier === 'gold' ? 'amber' : 'purple'}-400/10`
                                : 'border-white/10 bg-white/[0.02]'
                            }`}
                          >
                            <span className="text-2xl">{tierEmojis[badge.tier]}</span>
                            <p className="text-xs mt-1 text-white">{badge.name}</p>
                            <p className="text-[10px] text-gray-500 uppercase">{badge.tier}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-wide mb-2 block">Note (optional)</label>
                    <textarea
                      value={badgeForm.note}
                      onChange={(e) => setBadgeForm({ ...badgeForm, note: e.target.value })}
                      className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/40 resize-none"
                      rows={3}
                      placeholder="Add a personal note..."
                    />
                  </div>

                  <motion.button
                    type="submit"
                    className="w-full py-3 rounded-xl text-sm font-semibold text-[#08080F]"
                    style={{
                      background: 'linear-gradient(135deg, #F59E0B, #B45309)',
                      boxShadow: '0 4px 20px rgba(245,158,11,0.3)',
                    }}
                    whileHover={{ filter: 'brightness(1.1)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Award Badge
                  </motion.button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ADD REVIEW MODAL */}
        <AnimatePresence>
          {reviewModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setReviewModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'backOut' }}
                className="w-full max-w-xl mx-4 bg-[#0D0D18] border border-[rgba(245,158,11,0.2)] rounded-3xl p-8 shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-white font-bold text-xl">Performance Review</p>
                    <p className="text-gray-500 text-sm">{monthNames[new Date().getMonth()]} {new Date().getFullYear()}</p>
                  </div>
                  <motion.button
                    onClick={() => setReviewModal(false)}
                    className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                    whileTap={{ scale: 0.9 }}
                  >
                    <FiX size={18} />
                  </motion.button>
                </div>

                <form onSubmit={submitReview} className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-wide mb-2 block">Employee</label>
                    <select
                      value={reviewForm.employeeId}
                      onChange={(e) => setReviewForm({ ...reviewForm, employeeId: e.target.value })}
                      className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/40"
                    >
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id} className="bg-[#0D0D18]">{emp.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-xs uppercase tracking-wide mb-2 block">Month</label>
                      <select
                        value={reviewForm.month}
                        onChange={(e) => setReviewForm({ ...reviewForm, month: e.target.value })}
                        className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/40"
                      >
                        {monthNames.map((m, i) => (
                          <option key={m} value={i + 1} className="bg-[#0D0D18]">{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs uppercase tracking-wide mb-2 block">Year</label>
                      <select
                        value={reviewForm.year}
                        onChange={(e) => setReviewForm({ ...reviewForm, year: e.target.value })}
                        className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/40"
                      >
                        {[new Date().getFullYear(), new Date().getFullYear() - 1].map((y) => (
                          <option key={y} value={y} className="bg-[#0D0D18]">{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-wide mb-2 block">KPI Score</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={reviewForm.kpiScore}
                        onChange={(e) => setReviewForm({ ...reviewForm, kpiScore: e.target.value })}
                        className="w-24 bg-transparent border-b-2 border-amber-400 text-white text-4xl font-bold text-center focus:outline-none"
                      />
                      <span className="text-gray-500 text-sm">out of 100</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={reviewForm.kpiScore || 0}
                      onChange={(e) => setReviewForm({ ...reviewForm, kpiScore: e.target.value })}
                      className="w-full mt-4 h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #F59E0B ${reviewForm.kpiScore || 0}%, rgba(255,255,255,0.1) ${reviewForm.kpiScore || 0}%)`,
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-gray-400 text-xs uppercase tracking-wide mb-2 block">Goals Completed</label>
                      <input
                        type="number"
                        value={reviewForm.goalsCompleted}
                        onChange={(e) => setReviewForm({ ...reviewForm, goalsCompleted: e.target.value })}
                        className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/40"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs uppercase tracking-wide mb-2 block">Total Goals</label>
                      <input
                        type="number"
                        value={reviewForm.totalGoals}
                        onChange={(e) => setReviewForm({ ...reviewForm, totalGoals: e.target.value })}
                        className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/40"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs uppercase tracking-wide mb-2 block">Productivity %</label>
                      <input
                        type="number"
                        value={reviewForm.productivity}
                        onChange={(e) => setReviewForm({ ...reviewForm, productivity: e.target.value })}
                        className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/40"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-wide mb-2 block">Rating (1-5 stars)</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className={`text-2xl transition-colors ${
                            star <= reviewForm.rating ? 'text-amber-400' : 'text-gray-600'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          ★
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-wide mb-2 block">Manager Note</label>
                    <textarea
                      value={reviewForm.managerNote}
                      onChange={(e) => setReviewForm({ ...reviewForm, managerNote: e.target.value })}
                      className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/40 resize-none"
                      rows={3}
                      placeholder="Add your assessment..."
                    />
                  </div>

                  <motion.button
                    type="submit"
                    className="w-full py-3 rounded-xl text-sm font-semibold text-[#08080F]"
                    style={{
                      background: 'linear-gradient(135deg, #F59E0B, #B45309)',
                      boxShadow: '0 4px 20px rgba(245,158,11,0.3)',
                    }}
                    whileHover={{ filter: 'brightness(1.1)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Submit Review
                  </motion.button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default ManagerDashboard;
