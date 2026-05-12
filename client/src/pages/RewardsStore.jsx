import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { gsap } from 'gsap';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiGift, FiShoppingBag } from 'react-icons/fi';
import { BsCoin } from 'react-icons/bs';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import { fadeInUp, scaleIn, staggerContainer } from '../utils/animations';

const storeItems = [
  { id: 'gift-card', icon: '🎁', title: 'Gift Card', points: 500, description: 'Redeem for a flexible digital gift card.' },
  { id: 'leave-day', icon: '🌴', title: 'Extra Leave Day', points: 1200, description: 'Convert recognition into real rest.' },
  { id: 'merch', icon: '🧢', title: 'Premium Merchandise', points: 800, description: 'Company-branded gear with a luxe finish.' },
  { id: 'lunch', icon: '🍱', title: 'Lunch Voucher', points: 350, description: 'A team lunch or solo treat on RewardX.' },
  { id: 'learning', icon: '📚', title: 'Learning Credit', points: 950, description: 'Upskill with a course or workshop.' },
  { id: 'wellness', icon: '💪', title: 'Wellness Pass', points: 700, description: 'Gym, yoga, meditation, or wellness support.' },
];

const SuccessModal = ({ data, onClose }) => {
  const checkRef = useRef(null);
  const pointsRef = useRef(null);

  useEffect(() => {
    if (checkRef.current) {
      gsap.fromTo(
        checkRef.current,
        { strokeDashoffset: 200 },
        { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out' }
      );
    }

    if (pointsRef.current) {
      const target = { value: 0 };
      gsap.to(target, {
        value: -data.points,
        duration: 1.1,
        ease: 'power2.out',
        snap: { value: 1 },
        onUpdate() {
          if (pointsRef.current) pointsRef.current.innerText = `Points Deducted: ${Math.floor(target.value)}`;
        },
      });

      return () => {
        gsap.killTweensOf([target, checkRef.current]);
      };
    }

    return () => {
      gsap.killTweensOf(checkRef.current);
    };
  }, [data.points]);

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="glass-card relative w-full max-w-md overflow-hidden p-8 text-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.7 }}
        transition={{ duration: 0.35, ease: 'backOut' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-1 w-1">
          {Array.from({ length: 30 }, (_, index) => (
            <motion.span
              key={index}
              className="absolute h-2 w-2 rounded-full"
              style={{ backgroundColor: ['#F59E0B', '#D97706', '#F8F8FF'][index % 3] }}
              initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
              animate={{
                x: Math.sin(index * 2.1) * 150,
                y: -50 - ((index * 29) % 150),
                rotate: (index * 51) % 360,
                opacity: 0,
              }}
              transition={{ duration: 1 + (index % 5) * 0.1, ease: 'easeOut' }}
            />
          ))}
        </div>

        <svg className="mx-auto h-24 w-24" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.3)" strokeWidth="4" />
          <path
            ref={checkRef}
            d="M30 52 L44 66 L72 34"
            fill="none"
            stroke="#10B981"
            strokeDasharray="200"
            strokeDashoffset="200"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="8"
          />
        </svg>

        <h2 className="mt-5 text-3xl font-black">Redeemed!</h2>
        <p className="mt-2 text-textMuted">{data.title} is now yours.</p>
        <p ref={pointsRef} className="mt-5 rounded-2xl bg-primary/10 px-4 py-3 font-black text-primary">Points Deducted: 0</p>
        <button className="btn-primary mt-6 w-full" onClick={onClose}>Continue</button>
      </motion.div>
    </motion.div>
  );
};

const RewardsStore = () => {
  const { user } = useAuth();
  const [points, setPoints] = useState(user?.rewardPoints || 0);
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState('');
  const [successData, setSuccessData] = useState(null);
  const pointsRef = useRef(null);

  useEffect(() => {
    const loadProfile = async () => {
      const response = await api.get('/auth/me');
      setPoints(response.data.user.rewardPoints);
    };

    loadProfile();
  }, []);

  useEffect(() => {
    if (!pointsRef.current) return undefined;

    const target = { value: 0 };
    gsap.to(target, {
      value: points,
      duration: 1.5,
      ease: 'power2.out',
      snap: { value: 1 },
      onUpdate() {
        if (pointsRef.current) pointsRef.current.innerText = Math.ceil(target.value).toLocaleString();
      },
    });

    return () => gsap.killTweensOf(target);
  }, [points]);

  const redeem = () => {
    if (!selected) return;
    if (points < selected.points) {
      setNotice('Not enough points for this reward yet.');
      toast.error('Not enough points for this reward yet.');
      setSelected(null);
      return;
    }

    setPoints((current) => current - selected.points);
    setNotice(`${selected.title} redeemed successfully.`);
    toast.success(`${selected.title} redeemed successfully.`);
    setSuccessData(selected);
    setSelected(null);
  };

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="app-shell">
      <Sidebar />
      <main className="app-main">
        <Navbar title="Rewards Store" />
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
          <section className="glass-card flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-primary">Recognition marketplace</p>
              <h1 className="mt-2 text-4xl font-black">Spend Your Points</h1>
              <p className="mt-2 text-textMuted">Redeem earned recognition for meaningful perks.</p>
            </div>
            <div className="rounded-3xl border border-primary/30 bg-primary/10 px-6 py-4 text-primary">
              <p className="text-sm font-bold uppercase tracking-widest">Current Points</p>
              <p className="flex items-center gap-2 text-4xl font-black"><FiGift /> <span ref={pointsRef}>{points.toLocaleString()}</span></p>
            </div>
          </section>

          {notice && (
            <div className="flex items-center gap-3 rounded-2xl border border-success/30 bg-success/10 px-4 py-3 font-semibold text-success">
              <FiCheckCircle /> {notice}
            </div>
          )}

          <motion.section
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          >
            {storeItems.map((item) => (
              <motion.article
                key={item.id}
                variants={scaleIn}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(245,158,11,0.2)' }}
                whileTap={{ scale: 0.97 }}
                className="glass-card group p-6 transition"
                style={{ willChange: 'transform' }}
              >
                <div className="mb-5 flex items-center justify-between">
                  <motion.span
                    whileHover={{ rotate: [0, -10, 10, -5, 5, 0] }}
                    transition={{ duration: 0.4 }}
                    className="text-5xl"
                  >
                    {item.icon}
                  </motion.span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-black text-primary">{item.points} pts</span>
                </div>
                <h2 className="text-2xl font-black">{item.title}</h2>
                <p className="mt-2 min-h-12 text-textMuted">{item.description}</p>
                <button onClick={() => setSelected(item)} className="btn-primary mt-6 flex w-full items-center justify-center gap-2">
                  <FiShoppingBag /> Redeem
                </button>
              </motion.article>
            ))}
          </motion.section>
        </div>
      </main>

      <AnimatePresence>
        {selected && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="glass-card w-full max-w-md p-6" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
            <p className="text-5xl">{selected.icon}</p>
            <h2 className="mt-4 text-2xl font-black">Redeem {selected.title}?</h2>
            <p className="mt-2 text-textMuted">This will deduct {selected.points} points from your balance.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setSelected(null)} className="btn-ghost">Cancel</button>
              <button onClick={redeem} className="btn-primary">Confirm</button>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {successData && <SuccessModal data={successData} onClose={() => setSuccessData(null)} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default RewardsStore;
