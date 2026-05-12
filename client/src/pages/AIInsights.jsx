import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { gsap } from 'gsap';
import toast from 'react-hot-toast';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  FiAlertTriangle,
  FiAward,
  FiBarChart2,
  FiCpu,
  FiRefreshCw,
  FiShield,
  FiStar,
  FiTrendingUp,
  FiUserCheck,
  FiZap,
} from 'react-icons/fi';
import api from '../utils/api';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import SkeletonCard from '../components/common/SkeletonCard';
import { fadeInUp, scaleIn, staggerContainer } from '../utils/animations';

const riskFilters = ['All', 'High', 'Medium', 'Low'];
const priorityRank = { High: 0, Medium: 1, Low: 2 };

const fairnessColor = {
  Balanced: '#10B981',
  Underfavored: '#EF4444',
  Overfavored: '#3B82F6',
};

const riskStyle = {
  High: 'border-danger/50 bg-danger/10 text-red-200',
  Medium: 'border-primary/50 bg-primary/10 text-primary',
  Low: 'border-success/50 bg-success/10 text-success',
};

const typeIcon = {
  reward_gap: FiAward,
  performance_drop: FiTrendingUp,
  attendance_streak: FiUserCheck,
  top_performer_unrecognized: FiStar,
  department_fairness: FiShield,
};

const typeBorder = {
  reward_gap: 'border-l-primary',
  performance_drop: 'border-l-danger',
  attendance_streak: 'border-l-success',
  top_performer_unrecognized: 'border-l-info',
  department_fairness: 'border-l-primary',
};

const emptyAward = {
  employeeId: '',
  type: 'points',
  amount: '',
  category: 'performance',
  description: '',
  badgeId: '',
};

const SkeletonBlock = ({ rows = 4 }) => <SkeletonCard rows={rows} />;

const ErrorCard = ({ message, onRetry }) => (
  <div className="glass-card border-danger/30 bg-danger/10 p-5">
    <div className="flex items-start gap-3">
      <FiAlertTriangle className="mt-1 text-xl text-danger" />
      <div className="flex-1">
        <p className="font-black text-red-100">Unable to load AI data</p>
        <p className="mt-1 text-sm text-red-200/80">{message}</p>
        <button onClick={onRetry} className="btn-ghost mt-4 border-danger/30 text-red-100 hover:text-danger">
          Retry
        </button>
      </div>
    </div>
  </div>
);

const ScoreGauge = ({ value }) => {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;
  const circleRef = useRef(null);
  const numberRef = useRef(null);

  useEffect(() => {
    if (!circleRef.current) return undefined;

    gsap.fromTo(
      circleRef.current,
      { strokeDashoffset: circumference },
      {
        strokeDashoffset: offset,
        duration: 1.5,
        ease: 'power2.out',
      }
    );

    const target = { value: 0 };
    gsap.to(target, {
      value,
      duration: 1.5,
      ease: 'power2.out',
      snap: { value: 1 },
      onUpdate() {
        if (numberRef.current) numberRef.current.innerText = Math.round(target.value);
      },
    });

    return () => {
      gsap.killTweensOf([circleRef.current, target]);
    };
  }, [circumference, offset, value]);

  return (
    <div className="relative grid h-40 w-40 place-items-center">
      <svg className="h-40 w-40 -rotate-90">
        <circle cx="80" cy="80" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
        <circle
          ref={circleRef}
          cx="80"
          cy="80"
          r="54"
          fill="none"
          stroke="#F59E0B"
          strokeLinecap="round"
          strokeWidth="14"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute text-center">
        <p ref={numberRef} className="text-4xl font-black text-primary">0</p>
        <p className="text-xs font-bold uppercase tracking-widest text-textMuted">Overall</p>
      </div>
    </div>
  );
};

const ScoreBar = ({ label, value, color = 'bg-primary' }) => (
  <div>
    <div className="mb-2 flex justify-between text-sm font-bold">
      <span className="text-textMuted">{label}</span>
      <span>{Math.round(value)}%</span>
    </div>
    <div className="h-3 overflow-hidden rounded-full bg-white/[0.06]">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  </div>
);

const tooltipStyle = {
  background: '#111118',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 16,
  color: '#F8F8FF',
};

const AIInsights = () => {
  const [risk, setRisk] = useState([]);
  const [fairness, setFairness] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [geminiRecommendations, setGeminiRecommendations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [badges, setBadges] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [scorecard, setScorecard] = useState(null);
  const [riskFilter, setRiskFilter] = useState('All');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState({
    risk: true,
    fairness: true,
    patterns: true,
    recommendations: true,
    geminiRecommendations: true,
    scorecard: false,
  });
  const [errors, setErrors] = useState({});
  const [awardModal, setAwardModal] = useState(false);
  const [awardForm, setAwardForm] = useState(emptyAward);
  const [notice, setNotice] = useState('');

  const setSectionLoading = (key, value) => setLoading((current) => ({ ...current, [key]: value }));
  const setSectionError = (key, value) => setErrors((current) => ({ ...current, [key]: value }));

  const loadRisk = async () => {
    setSectionLoading('risk', true);
    setSectionError('risk', '');
    try {
      const response = await api.get('/ai/risk-analysis');
      setRisk(response.data.analysis);
    } catch (error) {
      setSectionError('risk', error.response?.data?.message || error.message);
    } finally {
      setSectionLoading('risk', false);
    }
  };

  const loadFairness = async () => {
    setSectionLoading('fairness', true);
    setSectionError('fairness', '');
    try {
      const response = await api.get('/ai/reward-fairness');
      setFairness(response.data.fairness);
    } catch (error) {
      setSectionError('fairness', error.response?.data?.message || error.message);
    } finally {
      setSectionLoading('fairness', false);
    }
  };

  const loadPatterns = async () => {
    setSectionLoading('patterns', true);
    setSectionError('patterns', '');
    try {
      const response = await api.get('/ai/attendance-patterns');
      setPatterns(response.data.patterns);
    } catch (error) {
      setSectionError('patterns', error.response?.data?.message || error.message);
    } finally {
      setSectionLoading('patterns', false);
    }
  };

  const loadRecommendations = async () => {
    setSectionLoading('recommendations', true);
    setSectionError('recommendations', '');
    try {
      const response = await api.get('/ai/recommendations');
      setRecommendations(response.data.recommendations);
    } catch (error) {
      setSectionError('recommendations', error.response?.data?.message || error.message);
    } finally {
      setSectionLoading('recommendations', false);
    }
  };

  const loadGeminiRecommendations = async () => {
    setSectionLoading('geminiRecommendations', true);
    setSectionError('geminiRecommendations', '');
    try {
      const response = await api.get('/ai/gemini-recommendations');
      setGeminiRecommendations(response.data.recommendations);
    } catch (error) {
      setSectionError('geminiRecommendations', error.response?.data?.message || error.message);
    } finally {
      setSectionLoading('geminiRecommendations', false);
    }
  };

  const loadEmployeesAndBadges = async () => {
    const [employeesRes, badgesRes] = await Promise.allSettled([api.get('/employees'), api.get('/badges')]);

    if (employeesRes.status === 'fulfilled') {
      const nextEmployees = employeesRes.value.data.employees;
      setEmployees(nextEmployees);
      setSelectedEmployee((current) => current || nextEmployees[0]?._id || '');
    }

    if (badgesRes.status === 'fulfilled') {
      setBadges(badgesRes.value.data.badges);
    }
  };

  const loadScorecard = async (employeeId = selectedEmployee) => {
    if (!employeeId) return;

    setSectionLoading('scorecard', true);
    setSectionError('scorecard', '');
    try {
      const response = await api.get(`/ai/scorecard/${employeeId}`);
      setScorecard(response.data.scorecard);
    } catch (error) {
      setScorecard(null);
      setSectionError('scorecard', error.response?.data?.message || error.message);
    } finally {
      setSectionLoading('scorecard', false);
    }
  };

  const loadAll = async () => {
    await Promise.all([loadRisk(), loadFairness(), loadPatterns(), loadRecommendations(), loadGeminiRecommendations(), loadEmployeesAndBadges()]);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    loadScorecard(selectedEmployee);
  }, [selectedEmployee]);

  const filteredRisk = useMemo(() => {
    const rows = riskFilter === 'All' ? risk : risk.filter((item) => item.riskLevel === riskFilter);
    return [...rows].sort((a, b) => b.riskScore - a.riskScore);
  }, [risk, riskFilter]);

  const sortedRecommendations = useMemo(
    () => [...recommendations].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]),
    [recommendations]
  );

  const openAwardModal = (employeeId, type = 'points') => {
    setAwardForm({
      ...emptyAward,
      employeeId: employeeId || employees[0]?._id || '',
      type,
      amount: type === 'badge' ? 0 : type === 'bonus' ? 1000 : 100,
      badgeId: badges[0]?._id || '',
      description:
        type === 'badge'
          ? 'AI-recommended badge for exceptional contribution'
          : 'AI-recommended recognition award',
    });
    setAwardModal(true);
  };

  const handleRecommendationAction = (recommendation) => {
    if (recommendation.actionLabel === 'Give Badge') {
      openAwardModal(recommendation.employeeId, 'badge');
      return;
    }

    if (recommendation.actionLabel === 'Award Bonus') {
      openAwardModal(recommendation.employeeId, 'bonus');
      return;
    }

    if (recommendation.actionLabel === 'Award Points') {
      openAwardModal(recommendation.employeeId, 'points');
    }
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
    setNotice('AI action completed successfully.');
    toast.success('AI action completed successfully.');
    setAwardModal(false);
    setAwardForm(emptyAward);
    await loadAll();
  };

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="app-shell">
      <Sidebar />
      <main className="app-main">
        <Navbar title="AI Insights" />
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
          <section className="glass-card flex flex-col justify-between gap-4 p-6 xl:flex-row xl:items-center">
            <div className="flex items-center gap-5">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-3xl text-primary shadow-gold"
              >
                <FiCpu />
              </motion.div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-primary">RewardX AI Engine</p>
                <h1 className="text-4xl font-black">AI Insights</h1>
                <p className="mt-2 text-textMuted">Real-time intelligence powered by RewardX AI Engine</p>
                <p className="mt-1 text-xs text-textMuted">
                  Last updated: {lastUpdated ? lastUpdated.toLocaleString('en-IN') : 'Loading...'}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {notice && <span className="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-bold text-success">{notice}</span>}
              <button onClick={loadAll} className="btn-primary flex items-center justify-center gap-2">
                <FiRefreshCw /> Refresh
              </button>
            </div>
          </section>

          <section className="glass-card p-5">
            <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-2xl font-black">Risk Analysis Table</h2>
                <p className="text-sm text-textMuted">Sorted by risk score descending</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {riskFilters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setRiskFilter(filter)}
                    className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${riskFilter === filter ? 'bg-primary text-dark' : 'bg-white/[0.04] text-textMuted hover:text-primary'}`}
                  >
                    {filter === 'All' ? 'All' : `${filter} Risk`}
                  </button>
                ))}
              </div>
            </div>

            {loading.risk && <SkeletonBlock rows={5} />}
            {errors.risk && <ErrorCard message={errors.risk} onRetry={loadRisk} />}
            {!loading.risk && !errors.risk && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] border-separate border-spacing-y-3">
                  <thead className="text-left text-xs uppercase tracking-widest text-textMuted">
                    <tr>
                      <th className="px-4">Employee</th>
                      <th className="px-4">Department</th>
                      <th className="px-4">Risk Level</th>
                      <th className="px-4">Risk Score</th>
                      <th className="px-4">AI Recommendation</th>
                      <th className="px-4">Action</th>
                    </tr>
                  </thead>
                  <motion.tbody layout>
                    <AnimatePresence mode="popLayout">
                    {filteredRisk.map((item, index) => (
                      <motion.tr
                        key={item.employeeId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={
                          item.riskLevel === 'High'
                            ? { opacity: 1, y: 0, borderLeft: ['2px solid transparent', '2px solid #EF4444'] }
                            : { opacity: 1, y: 0 }
                        }
                        exit={{ opacity: 0, x: -30 }}
                        transition={
                          item.riskLevel === 'High'
                            ? { opacity: { delay: index * 0.05 }, y: { delay: index * 0.05 }, borderLeft: { repeat: Infinity, duration: 1.5, repeatType: 'reverse' } }
                            : { delay: index * 0.05 }
                        }
                        className={`bg-white/[0.035] ${item.riskLevel === 'High' ? 'shadow-[inset_4px_0_0_rgba(239,68,68,0.9)]' : ''}`}
                      >
                        <td className="rounded-l-2xl px-4 py-4 font-black">{item.name}</td>
                        <td className="px-4 py-4 text-textMuted">{item.department}</td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full border px-3 py-1 text-xs font-black ${riskStyle[item.riskLevel]}`}>
                            {item.riskLevel}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-36 overflow-hidden rounded-full bg-white/[0.08]">
                              <div
                                className={`h-full rounded-full ${item.riskLevel === 'High' ? 'bg-danger' : item.riskLevel === 'Medium' ? 'bg-primary' : 'bg-success'}`}
                                style={{ width: `${item.riskScore}%` }}
                              />
                            </div>
                            <span className="font-black">{item.riskScore}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-textMuted">{item.aiRecommendation}</td>
                        <td className="rounded-r-2xl px-4 py-4">
                          <button onClick={() => openAwardModal(item.employeeId, 'points')} className="btn-ghost px-3 py-2 text-xs">
                            Award Points
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                    </AnimatePresence>
                  </motion.tbody>
                </table>
              </div>
            )}
          </section>

          <section className="grid gap-5 xl:grid-cols-[3fr_2fr]">
            <div className="glass-card p-5">
              <h2 className="text-2xl font-black">Reward Fairness</h2>
              <p className="mb-5 text-sm text-textMuted">Rewards per employee by department</p>
              {loading.fairness && <SkeletonBlock rows={5} />}
              {errors.fairness && <ErrorCard message={errors.fairness} onRetry={loadFairness} />}
              {!loading.fairness && !errors.fairness && (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={fairness} layout="vertical" margin={{ left: 24 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                      <XAxis type="number" stroke="#6B7280" tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="department" stroke="#6B7280" tickLine={false} axisLine={false} width={120} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="rewardsPerEmployee" radius={[0, 12, 12, 0]}>
                        {fairness.map((row) => (
                          <Cell key={row.department} fill={fairnessColor[row.fairnessStatus]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="glass-card p-5">
              <h3 className="text-xl font-black">Fairness Summary</h3>
              <div className="mt-5 space-y-3">
                {fairness.map((row) => (
                  <div key={row.department} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-black">{row.department}</p>
                      <span className="rounded-full px-3 py-1 text-xs font-black" style={{ color: fairnessColor[row.fairnessStatus], background: `${fairnessColor[row.fairnessStatus]}22` }}>
                        {row.fairnessStatus}
                      </span>
                    </div>
                    <p className="text-sm text-textMuted">
                      {row.totalRewards} rewards • {row.totalPoints} points • {row.employeeCount} employees
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="glass-card p-5">
            <h2 className="text-2xl font-black">Attendance Patterns</h2>
            <p className="mb-5 text-sm text-textMuted">Attendance and late rates across departments</p>
            {loading.patterns && <SkeletonBlock rows={5} />}
            {errors.patterns && <ErrorCard message={errors.patterns} onRetry={loadPatterns} />}
            {!loading.patterns && !errors.patterns && (
              <>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={patterns}>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                      <XAxis dataKey="department" stroke="#6B7280" tickLine={false} axisLine={false} />
                      <YAxis stroke="#6B7280" tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend />
                      <Bar dataKey="attendanceRate" name="Attendance Rate" fill="#10B981" radius={[12, 12, 0, 0]} />
                      <Bar dataKey="lateRate" name="Late Rate" fill="#F59E0B" radius={[12, 12, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {patterns.map((row) => (
                    <div key={row.department} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                      <p className="font-black">{row.department}</p>
                      <p className="mt-2 text-sm text-textMuted">Most problematic day: <span className="text-primary">{row.mostAbsentDay}</span></p>
                      <p className="mt-1 text-xs text-textMuted">{row.totalEmployees} employees tracked</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          <section className="glass-card p-5">
            <div className="mb-5 flex items-center gap-3">
              <FiZap className="text-2xl text-primary" />
              <div>
                <h2 className="text-2xl font-black">Smart Recommendations Feed</h2>
                <p className="text-sm text-textMuted">Actionable cards combined from risk, fairness, and attendance signals</p>
              </div>
            </div>
            {loading.recommendations && <SkeletonBlock rows={4} />}
            {errors.recommendations && <ErrorCard message={errors.recommendations} onRetry={loadRecommendations} />}
            {!loading.recommendations && !errors.recommendations && (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-4 xl:grid-cols-2">
                {sortedRecommendations.length === 0 && <p className="rounded-2xl bg-white/[0.04] p-5 text-textMuted">No smart recommendations right now.</p>}
                {sortedRecommendations.map((recommendation, index) => {
                  const Icon = typeIcon[recommendation.type] || FiCpu;
                  return (
                    <motion.article
                      key={`${recommendation.type}-${recommendation.employeeId || index}`}
                      variants={scaleIn}
                      className={`glass-card border-l-4 p-5 ${typeBorder[recommendation.type] || 'border-l-primary'}`}
                      style={{ willChange: 'transform, opacity' }}
                    >
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                            <Icon />
                          </div>
                          <div>
                            <h3 className="font-black">{recommendation.title}</h3>
                            <p className="text-xs uppercase tracking-widest text-textMuted">{recommendation.type.replaceAll('_', ' ')}</p>
                          </div>
                        </div>
                        <span className="flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1 text-xs font-black text-textMuted">
                          {recommendation.priority === 'High' && (
                            <motion.span
                              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                              transition={{ repeat: Infinity, duration: 1.2 }}
                              className="h-2 w-2 rounded-full bg-danger"
                            />
                          )}
                          {recommendation.priority}
                        </span>
                      </div>
                      <p className="leading-7 text-textMuted">{recommendation.message}</p>
                      {recommendation.actionLabel === 'Schedule Review' ? (
                        <Link to="/manager" className="btn-ghost mt-5 inline-flex px-4 py-2 text-sm">
                          {recommendation.actionLabel}
                        </Link>
                      ) : (
                        <button onClick={() => handleRecommendationAction(recommendation)} className="btn-primary mt-5 px-4 py-2 text-sm">
                          {recommendation.actionLabel}
                        </button>
                      )}
                    </motion.article>
                  );
                })}
              </motion.div>
            )}
          </section>

          <section className="glass-card p-5 border-l border-violet-500/50">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-500/20 text-xl text-violet-400">✨</div>
                <div>
                  <h2 className="text-2xl font-black text-violet-100">Gemini AI Recommendations</h2>
                  <p className="text-sm font-semibold text-violet-300">Powered by Gemini ✨</p>
                </div>
              </div>
              <button onClick={loadGeminiRecommendations} className="btn-ghost text-violet-300 hover:bg-violet-500/20 hover:text-violet-100">
                <FiRefreshCw className="mr-2 inline" /> Regenerate
              </button>
            </div>
            
            {loading.geminiRecommendations && <SkeletonBlock rows={4} />}
            {errors.geminiRecommendations && <ErrorCard message={errors.geminiRecommendations} onRetry={loadGeminiRecommendations} />}
            {!loading.geminiRecommendations && !errors.geminiRecommendations && (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-4 xl:grid-cols-2">
                {geminiRecommendations.length === 0 && <p className="rounded-2xl bg-white/[0.04] p-5 text-textMuted">No Gemini recommendations right now.</p>}
                {geminiRecommendations.map((recommendation, index) => {
                  const Icon = typeIcon[recommendation.type] || FiCpu;
                  return (
                    <motion.article
                      key={`gemini-${recommendation.type || 'rec'}-${index}`}
                      variants={scaleIn}
                      className="glass-card border-l-4 border-l-violet-500 p-5"
                      style={{ willChange: 'transform, opacity' }}
                    >
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-500/10 text-violet-400">
                            <Icon />
                          </div>
                          <div>
                            <h3 className="font-black text-violet-50">{recommendation.title}</h3>
                            <p className="text-xs uppercase tracking-widest text-violet-300/70">{(recommendation.type || 'RECOMMENDATION').replaceAll('_', ' ')}</p>
                          </div>
                        </div>
                        <span className="flex items-center gap-2 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-black text-violet-300">
                          {recommendation.priority}
                        </span>
                      </div>
                      <p className="leading-7 text-textMuted">{recommendation.message}</p>
                      {recommendation.actionLabel === 'Schedule Review' ? (
                        <Link to="/manager" className="btn-ghost mt-5 inline-flex bg-violet-500/10 hover:bg-violet-500/20 text-violet-200 px-4 py-2 text-sm">
                          {recommendation.actionLabel}
                        </Link>
                      ) : (
                        <button onClick={() => handleRecommendationAction(recommendation)} className="btn-primary mt-5 bg-violet-600 hover:bg-violet-500 px-4 py-2 text-sm shadow-none">
                          {recommendation.actionLabel}
                        </button>
                      )}
                    </motion.article>
                  );
                })}
              </motion.div>
            )}
          </section>

          <section className="glass-card p-5">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-black">Employee Scorecard</h2>
                <p className="text-sm text-textMuted">Comprehensive weighted score for one employee</p>
              </div>
              <select className="input-field max-w-sm" value={selectedEmployee} onChange={(event) => setSelectedEmployee(event.target.value)}>
                {employees.map((employee) => (
                  <option className="bg-dark" key={employee._id} value={employee._id}>
                    {employee.name} • {employee.department || 'Unassigned'}
                  </option>
                ))}
              </select>
            </div>

            {loading.scorecard && <SkeletonBlock rows={4} />}
            {errors.scorecard && <ErrorCard message={errors.scorecard} onRetry={() => loadScorecard(selectedEmployee)} />}
            {!loading.scorecard && !errors.scorecard && scorecard && (
              <div className="grid gap-6 xl:grid-cols-[260px_1fr_1fr]">
                <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.035] p-5">
                  <ScoreGauge value={scorecard.overallScore} />
                  <span className={`mt-4 rounded-full px-3 py-1 text-sm font-black capitalize ${scorecard.trend === 'improving' ? 'bg-success/10 text-success' : scorecard.trend === 'declining' ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'}`}>
                    {scorecard.trend}
                  </span>
                  <p className="mt-3 text-center text-sm text-textMuted">Predicted next month: <span className="font-black text-primary">{scorecard.predictedNextMonthScore}</span></p>
                </div>

                <div className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.035] p-5">
                  <ScoreBar label="Performance" value={scorecard.performanceScore} color="bg-primary" />
                  <ScoreBar label="Attendance" value={scorecard.attendanceScore} color="bg-success" />
                  <ScoreBar label="Engagement" value={scorecard.engagementScore} color="bg-info" />
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-3xl border border-success/20 bg-success/10 p-5">
                    <h3 className="mb-3 font-black text-success">Strengths</h3>
                    <ul className="space-y-2 text-sm text-emerald-100">
                      {scorecard.strengths.map((item) => <li key={item}>• {item}</li>)}
                    </ul>
                  </div>
                  <div className="rounded-3xl border border-primary/20 bg-primary/10 p-5">
                    <h3 className="mb-3 font-black text-primary">Improvements</h3>
                    <ul className="space-y-2 text-sm text-amber-100">
                      {scorecard.improvements.map((item) => <li key={item}>• {item}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <AnimatePresence>
      {awardModal && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.form onSubmit={submitAward} className="glass-card w-full max-w-lg p-6" initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}>
            <h2 className="text-2xl font-black">AI Recommended Action</h2>
            <div className="mt-5 grid gap-4">
              <select className="input-field" value={awardForm.employeeId} onChange={(e) => setAwardForm({ ...awardForm, employeeId: e.target.value })}>
                {employees.map((employee) => (
                  <option className="bg-dark" key={employee._id} value={employee._id}>
                    {employee.name}
                  </option>
                ))}
              </select>
              <select className="input-field" value={awardForm.type} onChange={(e) => setAwardForm({ ...awardForm, type: e.target.value })}>
                <option className="bg-dark" value="points">Points</option>
                <option className="bg-dark" value="bonus">Bonus</option>
                <option className="bg-dark" value="badge">Badge</option>
              </select>
              {awardForm.type === 'badge' ? (
                <select className="input-field" value={awardForm.badgeId} onChange={(e) => setAwardForm({ ...awardForm, badgeId: e.target.value })}>
                  {badges.map((badge) => (
                    <option className="bg-dark" key={badge._id} value={badge._id}>
                      {badge.icon} {badge.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input className="input-field" type="number" min="0" value={awardForm.amount} onChange={(e) => setAwardForm({ ...awardForm, amount: e.target.value })} />
              )}
              <select className="input-field" value={awardForm.category} onChange={(e) => setAwardForm({ ...awardForm, category: e.target.value })}>
                <option className="bg-dark" value="performance">Performance</option>
                <option className="bg-dark" value="attendance">Attendance</option>
                <option className="bg-dark" value="teamwork">Teamwork</option>
                <option className="bg-dark" value="innovation">Innovation</option>
              </select>
              <textarea className="input-field min-h-28" value={awardForm.description} onChange={(e) => setAwardForm({ ...awardForm, description: e.target.value })} />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setAwardModal(false)} className="btn-ghost">Cancel</button>
              <button className="btn-primary">Complete Action</button>
            </div>
          </motion.form>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AIInsights;
