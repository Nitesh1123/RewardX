import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { gsap } from 'gsap';
import { FiSearch } from 'react-icons/fi';
import { BsCoin } from 'react-icons/bs';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import PageTransition from '../components/common/PageTransition';
import TextReveal from '../components/common/TextReveal';
import SkeletonCard from '../components/common/SkeletonCard';
import { fadeInUp, staggerContainer } from '../utils/animations';

const getInitials = (name) => {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'RX';
};

const departmentColors = {
  Engineering: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-400/20' },
  HR: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-400/20' },
  Sales: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-400/20' },
  Marketing: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-400/20' },
  Operations: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-400/20' },
  Finance: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-400/20' },
};

const Leaderboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('month');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const firstRef = useRef(null);
  const secondRef = useRef(null);
  const thirdRef = useRef(null);
  const crownRef = useRef(null);
  const orbitRefs = useRef([]);
  const liveDotRef = useRef(null);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await api.get('/rewards/leaderboard');
        setLeaderboard(response.data.leaderboard);
        setLastUpdated(new Date());
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [tab]);

  // Filter by search and department
  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return leaderboard.filter(
      (employee) =>
        (employee.name.toLowerCase().includes(term) ||
        (employee.department || '').toLowerCase().includes(term)) &&
        (deptFilter === 'All' || employee.department === deptFilter)
    );
  }, [leaderboard, search, deptFilter]);

  const topThree = filtered.slice(0, 3);
  const restOfList = filtered.slice(3);
  const maxPoints = Math.max(...filtered.map(e => e.rewardPoints), 1);

  // Get unique departments
  const departments = useMemo(() => {
    const depts = [...new Set(leaderboard.map(e => e.department).filter(Boolean))];
    return ['All', ...depts];
  }, [leaderboard]);

  // Current user rank
  const userRankInfo = useMemo(() => {
    const userIndex = filtered.findIndex(e => e.id === user?.id);
    if (userIndex === -1) return null;
    return {
      rank: userIndex + 1,
      employee: filtered[userIndex],
      nextRank: filtered[userIndex - 1],
      pointsToNext: userIndex > 0 ? filtered[userIndex - 1].rewardPoints - filtered[userIndex].rewardPoints : 0,
    };
  }, [filtered, user?.id]);

  // Live dot pulse animation
  useEffect(() => {
    if (liveDotRef.current) {
      gsap.to(liveDotRef.current, {
        scale: 1.5,
        opacity: 0.5,
        duration: 0.75,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });
    }
  }, []);

  // Podium entrance timeline
  useEffect(() => {
    if (!topThree.length || loading) return undefined;

    const tl = gsap.timeline({ delay: 0.3 });

    if (thirdRef.current) {
      tl.from(thirdRef.current, { y: 100, opacity: 0, duration: 0.5, ease: 'power2.out' });
    }
    if (firstRef.current) {
      tl.from(firstRef.current, { y: 150, opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.2');
    }
    if (secondRef.current) {
      tl.from(secondRef.current, { y: 80, opacity: 0, duration: 0.5, ease: 'power2.out' }, '-=0.4');
    }
    if (crownRef.current) {
      tl.fromTo(crownRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'bounce.out' },
        '-=0.1'
      );
      // Crown float animation
      gsap.to(crownRef.current, {
        y: -6,
        repeat: -1,
        yoyo: true,
        duration: 1.5,
        ease: 'power1.inOut',
        delay: 1.5,
      });
    }

    // Orbit particles
    orbitRefs.current.forEach((dot, i) => {
      if (dot) {
        gsap.to(dot, {
          rotation: 360,
          transformOrigin: '0px 55px',
          repeat: -1,
          duration: 3 + (i * 0.3),
          ease: 'none',
          delay: 1.2,
        });
      }
    });

    return () => {
      tl.kill();
      gsap.killTweensOf([firstRef.current, secondRef.current, thirdRef.current, crownRef.current, ...orbitRefs.current]);
    };
  }, [topThree.length, loading]);

  // Loading state
  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-[#08080F] p-6 space-y-8">
          <div className="max-w-[1200px] mx-auto space-y-8">
            {/* Header skeleton */}
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <div className="h-3 w-24 bg-white/[0.06] rounded" />
                <div className="h-12 w-48 bg-white/[0.08] rounded" />
                <div className="h-4 w-64 bg-white/[0.05] rounded" />
              </div>
              <div className="h-10 w-32 bg-white/[0.06] rounded-full" />
            </div>

            {/* Tabs skeleton */}
            <div className="flex justify-center">
              <div className="h-12 w-64 bg-white/[0.06] rounded-2xl" />
            </div>

            {/* Podium skeleton */}
            <div className="flex justify-center gap-4 pt-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`${i === 2 ? 'w-28 h-40' : 'w-24 h-32'} bg-white/[0.04] rounded-t-xl`} />
              ))}
            </div>

            {/* List skeleton */}
            <SkeletonCard variant="list" className="h-[400px]" />
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#08080F] p-6 space-y-8">
        <div className="max-w-[1200px] mx-auto space-y-8">
          {/* SECTION 1 — PAGE HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-start mb-4"
          >
            {/* Left */}
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] text-amber-400/70 mb-2">HALL OF FAME</p>
              <TextReveal
                text="Leaderboard"
                className="text-white text-4xl font-bold"
                delay={0.2}
                stagger={0.04}
              />
              <p className="text-gray-500 text-sm mt-2">Top performers ranked by reward points</p>
            </div>

            {/* Right - Live pill */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)]"
            >
              <div ref={liveDotRef} className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-gray-400 text-xs">Live Rankings</span>
            </motion.div>
          </motion.div>

          {/* SECTION 2 — TABS */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center"
          >
            <div className="flex gap-1 p-1 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)]">
              {[
                { value: 'month', label: 'This Month' },
                { value: 'all', label: 'All Time' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setTab(value)}
                  className="relative px-6 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200"
                >
                  {tab === value && (
                    <motion.div
                      layoutId="tabBackground"
                      className="absolute inset-0 rounded-xl bg-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.3)]"
                      style={{ boxShadow: '0 0 20px rgba(245,158,11,0.1)' }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className={`relative z-10 ${tab === value ? 'text-amber-400' : 'text-gray-500 hover:text-gray-300'}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* SECTION 3 — TOP 3 PODIUM */}
          {topThree.length > 0 && (
            <div className="relative flex items-end justify-center gap-4 px-8 pt-12 pb-0 mb-8">
              {/* Confetti burst */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                {Array.from({ length: 30 }, (_, i) => {
                  const colors = ['#F59E0B', '#FCD34D', '#ffffff', '#B45309', '#8B5CF6'];
                  const angle = (i / 30) * Math.PI * 2;
                  const distance = 100 + Math.random() * 100;
                  return (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-sm"
                      style={{ backgroundColor: colors[i % colors.length] }}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
                      animate={{
                        x: Math.cos(angle) * distance,
                        y: Math.sin(angle) * distance - 50,
                        opacity: 0,
                        scale: 0.5 + Math.random(),
                        rotate: Math.random() * 360,
                      }}
                      transition={{
                        duration: 1 + Math.random(),
                        ease: 'power2.out',
                        delay: 0.8 + Math.random() * 0.5,
                      }}
                    />
                  );
                })}
              </div>

              {/* 2nd Place */}
              {topThree[1] && (
                <motion.div
                  ref={secondRef}
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 80 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <span className="text-2xl mb-2">🥈</span>
                  <div className="w-20 h-20 rounded-full border-4 border-gray-300 overflow-hidden shadow-[0_0_20px_rgba(156,163,175,0.3)]">
                    {topThree[1].profileImage ? (
                      <img src={topThree[1].profileImage} alt={topThree[1].name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">{getInitials(topThree[1].name)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-white font-bold text-base mt-3 max-w-[120px] truncate text-center">{topThree[1].name}</p>
                  <p className="text-gray-500 text-xs text-center mt-0.5">{topThree[1].department}</p>
                  <div className="flex items-center gap-1.5 mt-2 px-4 py-1.5 rounded-full bg-gray-400/10 border border-gray-400/20 text-gray-300 font-bold text-sm">
                    <GiTwoCoins size={14} />
                    {topThree[1].rewardPoints.toLocaleString()} pts
                  </div>
                  {/* Podium base */}
                  <div
                    className="w-[140px] h-[70px] mt-4 rounded-t-xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(180deg, rgba(156,163,175,0.15) 0%, rgba(156,163,175,0.03) 100%)',
                      borderTop: '2px solid rgba(156,163,175,0.4)',
                      borderLeft: '1px solid rgba(156,163,175,0.15)',
                      borderRight: '1px solid rgba(156,163,175,0.15)',
                    }}
                  >
                    <span className="text-gray-400 font-bold text-2xl">2</span>
                  </div>
                </motion.div>
              )}

              {/* 1st Place */}
              {topThree[0] && (
                <motion.div
                  ref={firstRef}
                  className="flex flex-col items-center relative -mt-8"
                  initial={{ opacity: 0, y: 150 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {/* Crown */}
                  <span ref={crownRef} className="text-4xl mb-2 absolute -top-10">👑</span>

                  {/* Orbit particles */}
                  <div className="absolute top-10 left-1/2 -translate-x-1/2">
                    {Array.from({ length: 8 }, (_, i) => (
                      <div
                        key={i}
                        ref={(el) => (orbitRefs.current[i] = el)}
                        className="absolute w-1.5 h-1.5 bg-amber-400 rounded-full"
                        style={{
                          opacity: 0.4 + (i * 0.05),
                          transform: `rotate(${i * 45}deg)`,
                        }}
                      />
                    ))}
                  </div>

                  <div className="w-24 h-24 rounded-full border-4 border-amber-400 overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.5)]">
                    {topThree[0].profileImage ? (
                      <img src={topThree[0].profileImage} alt={topThree[0].name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{getInitials(topThree[0].name)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-white font-bold text-lg mt-3 max-w-[120px] truncate text-center">{topThree[0].name}</p>
                  <p className="text-gray-500 text-xs text-center mt-0.5">{topThree[0].department}</p>
                  <div className="flex items-center gap-1.5 mt-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-400 font-bold text-sm">
                    <GiTwoCoins size={14} />
                    {topThree[0].rewardPoints.toLocaleString()} pts
                  </div>
                  {/* Podium base */}
                  <div
                    className="w-[140px] h-[100px] mt-4 rounded-t-xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(180deg, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0.05) 100%)',
                      borderTop: '2px solid rgba(245,158,11,0.4)',
                      borderLeft: '1px solid rgba(245,158,11,0.15)',
                      borderRight: '1px solid rgba(245,158,11,0.15)',
                    }}
                  >
                    <span
                      className="text-3xl font-black bg-clip-text text-transparent"
                      style={{ backgroundImage: 'linear-gradient(135deg, #FCD34D, #F59E0B)' }}
                    >
                      1
                    </span>
                  </div>
                </motion.div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <motion.div
                  ref={thirdRef}
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <span className="text-xl mb-2">🥉</span>
                  <div className="w-20 h-20 rounded-full border-4 border-amber-700 overflow-hidden shadow-[0_0_20px_rgba(180,83,9,0.3)]">
                    {topThree[2].profileImage ? (
                      <img src={topThree[2].profileImage} alt={topThree[2].name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">{getInitials(topThree[2].name)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-white font-bold text-base mt-3 max-w-[120px] truncate text-center">{topThree[2].name}</p>
                  <p className="text-gray-500 text-xs text-center mt-0.5">{topThree[2].department}</p>
                  <div className="flex items-center gap-1.5 mt-2 px-4 py-1.5 rounded-full bg-amber-800/20 border border-amber-800/30 text-amber-700 font-bold text-sm">
                    <GiTwoCoins size={14} />
                    {topThree[2].rewardPoints.toLocaleString()} pts
                  </div>
                  {/* Podium base */}
                  <div
                    className="w-[140px] h-[50px] mt-4 rounded-t-xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(180deg, rgba(180,83,9,0.15) 0%, rgba(180,83,9,0.03) 100%)',
                      borderTop: '2px solid rgba(180,83,9,0.4)',
                      borderLeft: '1px solid rgba(180,83,9,0.15)',
                      borderRight: '1px solid rgba(180,83,9,0.15)',
                    }}
                  >
                    <span className="text-amber-800 font-bold text-2xl">3</span>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* SECTION 4 — SEARCH + FILTER BAR */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] px-5 py-4 rounded-2xl flex items-center justify-between gap-4 flex-wrap"
          >
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or department..."
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[rgba(245,158,11,0.4)] transition-all"
              />
            </div>

            {/* Results count */}
            <p className="text-gray-500 text-sm">{filtered.length} employees ranked</p>

            {/* Department filters */}
            <div className="flex gap-2 overflow-x-auto">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setDeptFilter(dept)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
                    deptFilter === dept
                      ? 'bg-amber-400/15 text-amber-400 border border-amber-400/30'
                      : 'bg-white/[0.03] text-gray-500 border border-white/[0.08] hover:border-white/15'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </motion.div>

          {/* SECTION 5 — FULL RANKED LIST */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden"
          >
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 bg-[rgba(255,255,255,0.02)]">
              <div className="col-span-1 text-[11px] uppercase tracking-widest text-gray-600">Rank</div>
              <div className="col-span-5 text-[11px] uppercase tracking-widest text-gray-600">Employee</div>
              <div className="col-span-2 text-[11px] uppercase tracking-widest text-gray-600">Department</div>
              <div className="col-span-2 text-[11px] uppercase tracking-widest text-gray-600 text-right">Points</div>
              <div className="col-span-1 text-[11px] uppercase tracking-widest text-gray-600 text-center">Badges</div>
              <div className="col-span-1 text-[11px] uppercase tracking-widest text-gray-600 text-right">Perf</div>
            </div>

            {/* Table rows */}
            <AnimatePresence mode="popLayout">
              {restOfList.map((employee, index) => {
                const rank = index + 4;
                const isCurrentUser = employee.id === user?.id;
                const deptStyle = departmentColors[employee.department] || { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-400/20' };
                const isTop10 = rank <= 10;

                return (
                  <motion.div
                    key={employee.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-white/4 last:border-0 hover:bg-white/[0.02] transition-colors duration-150 cursor-pointer ${
                      isCurrentUser ? 'bg-[rgba(245,158,11,0.04)] border-l-[3px] border-l-[rgba(245,158,11,0.4)]' : ''
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-1">
                      {rank <= 3 ? (
                        <span className="text-xl">{['🥇', '🥈', '🥉'][rank - 1]}</span>
                      ) : isTop10 ? (
                        <span className="text-amber-400/70 font-bold text-sm">{rank}</span>
                      ) : (
                        <span className="text-gray-600 font-semibold text-sm">{rank}</span>
                      )}
                      {/* Rank change indicator (mock) */}
                      <div className="text-[10px] mt-0.5">
                        {index % 3 === 0 ? (
                          <span className="text-green-400">▲{Math.floor(Math.random() * 3) + 1}</span>
                        ) : index % 3 === 1 ? (
                          <span className="text-red-400">▼{Math.floor(Math.random() * 2) + 1}</span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </div>
                    </div>

                    {/* Employee */}
                    <div className="col-span-5 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ${rank <= 3 ? 'border-2 ' + (rank === 1 ? 'border-amber-400' : rank === 2 ? 'border-gray-300' : 'border-amber-700') : ''}`}>
                        {employee.profileImage ? (
                          <img src={employee.profileImage} alt={employee.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                            <span className="text-sm font-bold text-white">{getInitials(employee.name)}</span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">
                          {employee.name}
                          {isCurrentUser && <span className="text-amber-400 text-xs ml-1">(You)</span>}
                        </p>
                        <p className="text-gray-600 text-xs truncate">{employee.email || 'employee@rewardx.com'}</p>
                      </div>
                    </div>

                    {/* Department */}
                    <div className="col-span-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${deptStyle.bg} ${deptStyle.text} border ${deptStyle.border}`}>
                        {employee.department || 'General'}
                      </span>
                    </div>

                    {/* Points */}
                    <div className="col-span-2 text-right">
                      <p className="text-amber-400 font-bold text-sm">{employee.rewardPoints.toLocaleString()}</p>
                      <div className="w-full h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(employee.rewardPoints / maxPoints) * 100}%` }}
                          transition={{ duration: 1, delay: 0.8 + index * 0.05 }}
                          className={`h-full rounded-full ${rank <= 3 ? 'bg-amber-400' : 'bg-white/30'}`}
                        />
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="col-span-1 text-center">
                      <span className="bg-purple-400/10 text-purple-400 text-xs px-2 py-0.5 rounded-full font-bold">
                        {employee.badges?.length || Math.floor(Math.random() * 5)}
                      </span>
                    </div>

                    {/* Performance */}
                    <div className="col-span-1 text-right">
                      <span
                        className={`font-semibold text-sm ${
                          (employee.kpiScore || 75) > 80
                            ? 'text-green-400'
                            : (employee.kpiScore || 75) > 60
                            ? 'text-amber-400'
                            : 'text-red-400'
                        }`}
                      >
                        {employee.kpiScore || 75}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500">No matching employees found.</p>
              </div>
            )}
          </motion.div>

          {/* SECTION 6 — CURRENT USER POSITION BANNER */}
          {userRankInfo && userRankInfo.rank > 10 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="bg-[rgba(245,158,11,0.04)] border border-[rgba(245,158,11,0.2)] px-6 py-4 rounded-2xl flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Your Position</p>
                  <p className="text-amber-400 font-bold text-2xl">#{userRankInfo.rank}</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                    {userRankInfo.employee.profileImage ? (
                      <img src={userRankInfo.employee.profileImage} alt={userRankInfo.employee.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-white">{getInitials(userRankInfo.employee.name)}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{userRankInfo.employee.name}</p>
                    <p className="text-amber-400 text-sm">{userRankInfo.employee.rewardPoints.toLocaleString()} pts</p>
                  </div>
                </div>
              </div>

              {userRankInfo.nextRank && (
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Points to next rank: <span className="text-white">{userRankInfo.pointsToNext}</span></p>
                  <div className="w-48 h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{
                        width: `${((userRankInfo.employee.rewardPoints / userRankInfo.nextRank.rewardPoints) * 100).toFixed(0)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Leaderboard;
