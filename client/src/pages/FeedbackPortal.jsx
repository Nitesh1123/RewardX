import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { gsap } from 'gsap';
import toast from 'react-hot-toast';
import {
  BsChatDots,
  BsStarFill,
  BsStar,
  BsPeople,
  BsChevronDown,
  BsBriefcase,
  BsEyeSlash,
  BsSend,
  BsIncognito,
} from 'react-icons/bs';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import TextReveal from '../components/common/TextReveal';
import PageTransition from '../components/common/PageTransition';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer } from '../utils/animations';

const StarRating = ({ value, onChange }) => {
  const burstHostRef = useRef(null);

  const burst = (event, star) => {
    onChange(star);
    const host = burstHostRef.current;
    if (!host) return;

    const buttonRect = event.currentTarget.getBoundingClientRect();
    const hostRect = host.getBoundingClientRect();
    const centerX = buttonRect.left - hostRect.left + buttonRect.width / 2;
    const centerY = buttonRect.top - hostRect.top + buttonRect.height / 2;

    Array.from({ length: 4 }, (_, index) => {
      const sparkle = document.createElement('span');
      sparkle.className = 'pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-amber-400 shadow-gold';
      sparkle.style.left = `${centerX}px`;
      sparkle.style.top = `${centerY}px`;
      host.appendChild(sparkle);

      gsap.to(sparkle, {
        x: Math.cos((index / 4) * Math.PI * 2) * 40,
        y: Math.sin((index / 4) * Math.PI * 2) * 40,
        opacity: 0,
        scale: 0,
        duration: 0.4,
        ease: 'power2.out',
        onComplete: () => sparkle.remove(),
      });
    });
  };

  const ratingLabels = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Great',
    5: 'Excellent',
  };

  return (
    <div ref={burstHostRef} className="relative flex items-center gap-2">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            onClick={(event) => burst(event, star)}
            whileHover={{ scale: 1.2, rotate: 15 }}
            whileTap={{ scale: 0.85 }}
            className="transition-colors"
          >
            {star <= value ? (
              <BsStarFill size={28} className="text-amber-400" />
            ) : (
              <BsStar size={28} className="text-gray-600" />
            )}
          </motion.button>
        ))}
      </div>
      {value > 0 && (
        <span className="ml-3 text-sm font-semibold text-amber-400">
          {ratingLabels[value]}
        </span>
      )}
    </div>
  );
};

const EmployeeDropdown = ({ employees, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedEmployee = employees.find((e) => e.id === selected);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/8 cursor-pointer transition-all hover:border-white/12 hover:bg-white/[0.06]"
      >
        <div className="flex items-center gap-3">
          {selectedEmployee ? (
            <>
              <div className="w-6 h-6 rounded-full bg-amber-400/20 flex items-center justify-center text-xs font-bold text-amber-400">
                {selectedEmployee.name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <span className="text-white text-sm font-medium">{selectedEmployee.name}</span>
            </>
          ) : (
            <span className="text-gray-500 text-sm">Select employee...</span>
          )}
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <BsChevronDown size={14} className="text-gray-500" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 bg-[#0D0D18] border border-amber-400/15 rounded-xl overflow-hidden z-50 max-h-48 overflow-y-auto"
          >
            {employees.map((emp, idx) => (
              <button
                key={emp.id}
                type="button"
                onClick={() => {
                  onChange(emp.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-amber-400/8 ${
                  idx !== employees.length - 1 ? 'border-b border-white/5' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400/40 to-amber-600/40 flex items-center justify-center text-xs font-bold text-amber-400">
                  {emp.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{emp.name}</p>
                  <p className="text-gray-500 text-xs truncate">{emp.department || 'Team'}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CustomToggle = ({ checked, onChange }) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
        checked ? 'bg-amber-400/80' : 'bg-white/10'
      }`}
    >
      <motion.div
        animate={{
          x: checked ? 22 : 2,
        }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 600, damping: 30 }}
        className="absolute w-5 h-5 rounded-full bg-white shadow-md top-0.5 left-0.5"
      />
    </button>
  );
};

const FeedbackPortal = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [received, setReceived] = useState([]);
  const [given, setGiven] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [expandedCard, setExpandedCard] = useState(null);
  const [form, setForm] = useState({
    toEmployee: '',
    rating: 0,
    message: '',
    isAnonymous: false,
    type: user?.role === 'employee' ? 'peer' : 'manager',
  });

  const loadFeedbackData = async () => {
    if (!user?.id) return;

    const [leaderboardRes, feedbackRes, givenRes] = await Promise.allSettled([
      api.get('/rewards/leaderboard'),
      api.get(`/feedback/${user.id}`),
      api.get(`/feedback/given/${user.id}`),
    ]);

    if (leaderboardRes.status === 'fulfilled') {
      const options = leaderboardRes.value.data.leaderboard.filter(
        (employee) => employee.id !== user.id
      );
      setEmployees(options);
      setForm((current) => ({
        ...current,
        toEmployee: current.toEmployee || options[0]?.id || '',
      }));
    }

    if (feedbackRes.status === 'fulfilled') {
      setReceived(feedbackRes.value.data.feedback);
      setFilteredFeedback(feedbackRes.value.data.feedback);
    }

    if (givenRes.status === 'fulfilled') {
      setGiven(givenRes.value.data.feedback || []);
    }
  };

  useEffect(() => {
    loadFeedbackData();
  }, [user?.id]);

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    if (filter === 'All') {
      setFilteredFeedback(received);
    } else if (filter === 'Anonymous') {
      setFilteredFeedback(received.filter((f) => f.isAnonymous));
    } else {
      setFilteredFeedback(received.filter((f) => f.type === filter.toLowerCase()));
    }
  };

  const submitFeedback = async (event) => {
    event.preventDefault();
    if (!form.toEmployee || form.rating === 0 || !form.message.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      await api.post('/feedback', form);
      setSubmitted(true);
      toast.success('Feedback sent! 🎉');
      setForm({
        toEmployee: employees[0]?.id || '',
        rating: 0,
        message: '',
        isAnonymous: false,
        type: user?.role === 'employee' ? 'peer' : 'manager',
      });
      await loadFeedbackData();
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
  };

  const getAverageRating = () => {
    if (received.length === 0) return 0;
    const sum = received.reduce((acc, f) => acc + (f.rating || 0), 0);
    return (sum / received.length).toFixed(1);
  };

  const getColorGradient = (index) => {
    const colors = [
      'from-amber-400/40 to-amber-600/40',
      'from-blue-400/40 to-blue-600/40',
      'from-green-400/40 to-green-600/40',
      'from-purple-400/40 to-purple-600/40',
      'from-pink-400/40 to-pink-600/40',
    ];
    return colors[index % colors.length];
  };

  return (
    <PageTransition>
      <div className="app-shell">
        <Sidebar />
        <main className="app-main">
          <Navbar title="Feedback Portal" />

          <div className="min-h-screen bg-[#08080F] p-6 space-y-6">
            <div className="max-w-[1400px] mx-auto space-y-6">
              {/* SECTION 1: PAGE HEADER */}
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="flex justify-between items-start"
              >
                <div>
                  <p className="text-[11px] font-bold tracking-[0.2em] text-amber-400/70 mb-2 uppercase">
                    Feedback Center
                  </p>
                  <TextReveal
                    text="Feedback Portal"
                    delay={0.2}
                    stagger={0.04}
                    className="text-4xl font-bold text-white"
                  />
                  <p className="text-gray-500 text-sm mt-2">
                    Give and receive meaningful recognition
                  </p>
                </div>

                {/* STATS PILLS */}
                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1 }}
                  className="flex gap-3"
                >
                  {/* Given Feedback */}
                  <motion.div
                    whileHover={{ borderColor: 'rgba(245,158,11,0.3)' }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/7 transition-all"
                  >
                    <BsChatDots size={16} className="text-amber-400" />
                    <div>
                      <p className="text-gray-500 text-xs">Feedback Given</p>
                      <p className="text-white font-bold text-lg">{given.length}</p>
                    </div>
                  </motion.div>

                  {/* Avg Rating */}
                  <motion.div
                    whileHover={{ borderColor: 'rgba(245,158,11,0.3)' }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/7 transition-all"
                  >
                    <BsStarFill size={16} className="text-amber-400" />
                    <div>
                      <p className="text-gray-500 text-xs">Avg Rating</p>
                      <p className="text-amber-400 font-bold text-lg">
                        {getAverageRating()}/5
                      </p>
                    </div>
                  </motion.div>

                  {/* Received */}
                  <motion.div
                    whileHover={{ borderColor: 'rgba(59,130,246,0.3)' }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/7 transition-all"
                  >
                    <BsPeople size={16} className="text-blue-400" />
                    <div>
                      <p className="text-gray-500 text-xs">Received</p>
                      <p className="text-white font-bold text-lg">{received.length}</p>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* SECTION 2: MAIN CONTENT GRID */}
              <div className="grid grid-cols-5 gap-6">
                {/* LEFT COLUMN: FORM */}
                <motion.div
                  variants={fadeInLeft}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.15 }}
                  className="col-span-2"
                >
                  <div className="glass-card p-6 rounded-2xl border border-white/6 sticky top-24">
                    <AnimatePresence mode="wait">
                      {submitted ? (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="text-center py-8"
                        >
                          <motion.div
                            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 0.6, ease: 'easeInOut' }}
                            className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400/40 to-amber-600/40 flex items-center justify-center mx-auto mb-4"
                          >
                            <span className="text-3xl">✓</span>
                          </motion.div>
                          <p className="text-white font-bold text-xl">Feedback Sent! 🎉</p>
                          <p className="text-gray-400 text-sm mt-2">
                            Your feedback has been delivered
                          </p>
                        </motion.div>
                      ) : (
                        <motion.form
                          key="form"
                          onSubmit={submitFeedback}
                          variants={staggerContainer}
                          initial="hidden"
                          animate="visible"
                          className="space-y-5"
                        >
                          {/* Form Header */}
                          <motion.div variants={fadeInUp} className="text-center pb-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/20 flex items-center justify-center mx-auto mb-3">
                              <BsChatDots size={18} className="text-amber-400" />
                            </div>
                            <h3 className="text-white font-bold text-lg">Give Feedback</h3>
                            <p className="text-gray-500 text-sm mt-1">
                              Recognize a colleague's great work
                            </p>
                          </motion.div>

                          <div className="w-full h-px bg-amber-400/10" />

                          {/* Employee Selector */}
                          <motion.div variants={fadeInUp} className="block">
                            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2 block">
                              To Employee
                            </label>
                            <EmployeeDropdown
                              employees={employees}
                              selected={form.toEmployee}
                              onChange={(id) => setForm({ ...form, toEmployee: id })}
                            />
                          </motion.div>

                          {/* Feedback Type */}
                          <motion.div variants={fadeInUp} className="block">
                            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2 block">
                              Type
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setForm({ ...form, type: 'peer' })
                                }
                                className={`p-3 rounded-xl border transition-all text-center ${
                                  form.type === 'peer'
                                    ? 'border-blue-400/40 bg-blue-400/8'
                                    : 'border-white/8 bg-transparent'
                                }`}
                              >
                                <BsPeople
                                  size={20}
                                  className="text-blue-400 mx-auto mb-1"
                                />
                                <p className="text-sm font-medium text-white">
                                  Peer Review
                                </p>
                                <p className="text-xs text-gray-600">
                                  From colleague
                                </p>
                              </button>
                              {['manager', 'admin'].includes(user?.role) && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setForm({ ...form, type: 'manager' })
                                  }
                                  className={`p-3 rounded-xl border transition-all text-center ${
                                    form.type === 'manager'
                                      ? 'border-amber-400/40 bg-amber-400/8'
                                      : 'border-white/8 bg-transparent'
                                  }`}
                                >
                                  <BsBriefcase
                                    size={20}
                                    className="text-amber-400 mx-auto mb-1"
                                  />
                                  <p className="text-sm font-medium text-white">
                                    Manager
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    From manager
                                  </p>
                                </button>
                              )}
                            </div>
                          </motion.div>

                          {/* Star Rating */}
                          <motion.div variants={fadeInUp} className="block">
                            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3 block">
                              Rating
                            </label>
                            <StarRating
                              value={form.rating}
                              onChange={(rating) =>
                                setForm({ ...form, rating })
                              }
                            />
                          </motion.div>

                          {/* Message */}
                          <motion.div variants={fadeInUp} className="block">
                            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2 block">
                              Message
                            </label>
                            <div className="relative">
                              <textarea
                                value={form.message}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    message: e.target.value.slice(0, 500),
                                  })
                                }
                                placeholder="Share specific examples of great work, helpful behavior, or outstanding effort..."
                                className="w-full rows-5 resize-none bg-white/[0.04] border border-white/8 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 outline-none transition-all focus:border-amber-400/40 focus:ring-4 focus:ring-amber-400/8"
                                rows={5}
                              />
                              <p
                                className={`absolute bottom-3 right-4 text-xs ${
                                  form.message.length > 480
                                    ? 'text-red-500'
                                    : form.message.length > 400
                                      ? 'text-amber-400'
                                      : 'text-gray-600'
                                }`}
                              >
                                {form.message.length}/500
                              </p>
                            </div>
                          </motion.div>

                          {/* Anonymous Toggle */}
                          <motion.div
                            variants={fadeInUp}
                            className="flex items-center justify-between py-3 border-t border-white/5"
                          >
                            <div className="flex items-center gap-2">
                              <BsEyeSlash size={16} className="text-gray-500" />
                              <div>
                                <p className="text-gray-300 text-sm font-medium">
                                  Send Anonymously
                                </p>
                                <p className="text-gray-600 text-xs">
                                  Your name won't be visible
                                </p>
                              </div>
                            </div>
                            <CustomToggle
                              checked={form.isAnonymous}
                              onChange={(val) =>
                                setForm({ ...form, isAnonymous: val })
                              }
                            />
                          </motion.div>

                          {/* Submit Button */}
                          <motion.button
                            variants={fadeInUp}
                            type="submit"
                            whileHover={{ translateY: -2 }}
                            whileTap={{ scale: 0.97 }}
                            className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-[#08080F] font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-amber-500/40"
                          >
                            <BsSend size={16} />
                            Send Feedback
                          </motion.button>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* RIGHT COLUMN: RECEIVED FEEDBACK */}
                <motion.div
                  variants={fadeInRight}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.2 }}
                  className="col-span-3"
                >
                  <div className="space-y-4">
                    {/* Header & Filters */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-white font-bold text-xl">
                          Feedback Received
                        </h2>
                        <p className="text-gray-500 text-sm">
                          {received.length} total
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {['All', 'Peer', 'Manager', 'Anonymous'].map((filter) => (
                          <button
                            key={filter}
                            onClick={() => handleFilterChange(filter)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              selectedFilter === filter
                                ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                                : 'bg-white/[0.04] text-gray-400 border border-white/8'
                            }`}
                          >
                            {filter}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Feedback Cards */}
                    {filteredFeedback.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12"
                      >
                        <div className="text-6xl opacity-30 mb-4">💬</div>
                        <p className="text-white font-semibold text-lg">
                          No feedback yet
                        </p>
                        <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
                          Ask your manager or colleagues to share their thoughts
                          about your work
                        </p>
                        <button
                          type="button"
                          className="mt-4 px-4 py-2 rounded-xl border border-amber-400/30 text-amber-400 text-sm font-semibold hover:bg-amber-400/8 transition-all"
                        >
                          Share Profile Link
                        </button>
                      </motion.div>
                    ) : (
                      <AnimatePresence mode="popLayout">
                        {filteredFeedback.map((item, idx) => (
                          <motion.div
                            key={item._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: idx * 0.06 }}
                            className="glass-card p-5 rounded-2xl border border-white/6 hover:border-amber-400/15 transition-all"
                          >
                            {/* Card Top Row */}
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-3 flex-1">
                                {/* Avatar */}
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${
                                    item.isAnonymous
                                      ? 'bg-gray-800 border-white/10'
                                      : `bg-gradient-to-br ${getColorGradient(
                                          idx
                                        )} border-white/10`
                                  }`}
                                >
                                  {item.isAnonymous ? (
                                    <BsIncognito
                                      size={20}
                                      className="text-gray-500"
                                    />
                                  ) : (
                                    <span className="text-xs font-bold text-white">
                                      {item.fromEmployee?.name
                                        ?.split(' ')
                                        .map((n) => n[0])
                                        .join('')}
                                    </span>
                                  )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-semibold text-sm">
                                    {item.isAnonymous
                                      ? 'Anonymous'
                                      : item.fromEmployee?.name}
                                  </p>
                                  <div className="flex gap-2 mt-0.5">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                        item.type === 'peer'
                                          ? 'bg-blue-400/10 text-blue-400 border-blue-400/20'
                                          : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                                      }`}
                                    >
                                      {item.type}
                                    </span>
                                    <span className="text-gray-600 text-xs">
                                      {new Date(
                                        item.createdAt
                                      ).toLocaleDateString('en-IN')}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Star Rating */}
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <BsStarFill
                                    key={star}
                                    size={14}
                                    className={
                                      star <= item.rating
                                        ? 'text-amber-400'
                                        : 'text-gray-700'
                                    }
                                  />
                                ))}
                                <span className="text-amber-400 font-bold text-sm ml-1">
                                  {item.rating}
                                </span>
                              </div>
                            </div>

                            <div className="w-full h-px bg-white/5 my-4" />

                            {/* Message */}
                            <motion.p
                              className={`text-gray-300 text-sm leading-relaxed ${
                                expandedCard === item._id ? '' : 'line-clamp-3'
                              }`}
                            >
                              {item.message}
                            </motion.p>
                            {item.message.split('\n').length > 3 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedCard(
                                    expandedCard === item._id
                                      ? null
                                      : item._id
                                  )
                                }
                                className="text-amber-400 text-xs font-semibold cursor-pointer mt-2 hover:text-amber-300"
                              >
                                {expandedCard === item._id
                                  ? 'Show less'
                                  : 'Read more'}
                              </button>
                            )}

                            {/* Card Bottom */}
                            <div className="flex justify-between items-center mt-4">
                              <span className="text-xs text-gray-600 px-2 py-1 rounded-full bg-white/[0.03]">
                                {item.fromEmployee?.department || 'Team'}
                              </span>
                              <div className="flex gap-2">
                                <motion.button
                                  type="button"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/8 text-gray-400 text-xs hover:bg-green-400/10 hover:text-green-400 hover:border-green-400/20 transition-all"
                                >
                                  👍 0
                                </motion.button>
                                <motion.button
                                  type="button"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/8 text-gray-400 text-xs hover:bg-red-400/10 hover:text-red-400 hover:border-red-400/20 transition-all"
                                >
                                  ❤️ 0
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* SECTION 3: FEEDBACK GIVEN */}
              {given.length > 0 && (
                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.5 }}
                  className="glass-card p-6 rounded-2xl border border-white/6"
                >
                  <div className="flex justify-between items-center mb-5">
                    <div>
                      <h3 className="text-white font-semibold text-lg">
                        Feedback Given
                      </h3>
                      <p className="text-gray-500 text-xs">
                        {given.length} feedback submitted
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {given.map((item, idx) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="min-w-[260px] p-4 rounded-xl bg-white/[0.02] border border-white/6 hover:border-amber-400/20 transition-all"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold truncate">
                              {item.toEmployee?.name}
                            </p>
                          </div>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <BsStarFill
                                key={star}
                                size={12}
                                className={
                                  star <= item.rating
                                    ? 'text-amber-400'
                                    : 'text-gray-700'
                                }
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-500 text-xs mt-2 line-clamp-2">
                          {item.message}
                        </p>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-gray-700 text-[11px]">
                            {new Date(item.createdAt).toLocaleDateString(
                              'en-IN'
                            )}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              item.type === 'peer'
                                ? 'bg-blue-400/10 text-blue-400'
                                : 'bg-amber-400/10 text-amber-400'
                            }`}
                          >
                            {item.type}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default FeedbackPortal;
