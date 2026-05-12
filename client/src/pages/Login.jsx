import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import toast from 'react-hot-toast';
import { FiAward, FiMail, FiLock, FiEye, FiEyeOff, FiRefreshCw } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc'
import { useAuth } from '../hooks/useAuth';
import TextReveal from '../components/common/TextReveal';

// Animation variants
const panelFade = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};
const fieldFade = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.2 + i * 0.08 } }),
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  // Animated gold floating dots (left panel)
  const leftPanelRef = useRef(null);
  useEffect(() => {
    if (!leftPanelRef.current) return;
    const panel = leftPanelRef.current;
    const createDot = () => {
      const dot = document.createElement('div');
      dot.className = 'dot absolute rounded-full bg-amber-400 opacity-20';
      dot.style.width = '2px';
      dot.style.height = '2px';
      dot.style.left = `${Math.random() * 100}%`;
      dot.style.top = `${Math.random() * 100}%`;
      panel.appendChild(dot);
      gsap.to(dot, {
        y: '-=80',
        yoyo: true,
        repeat: -1,
        ease: 'none',
        duration: 8 + Math.random() * 7,
        delay: Math.random() * 3,
      });
    };
    Array.from({ length: 40 }).forEach(() => createDot());
  }, []);

  // Canvas background particles (existing effect kept)
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.clientWidth,
      y: Math.random() * canvas.clientHeight,
      size: Math.random() * 4 + 2,
      opacity: Math.random() * 0.25 + 0.15,
      drift: 0,
    }));
    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y + p.drift, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245,158,11,${p.opacity})`;
        ctx.shadowColor = 'rgba(245,158,11,0.35)';
        ctx.shadowBlur = 16;
        ctx.fill();
      });
    };
    resize();
    const anim = { id: 0 };
    const render = () => {
      draw();
      anim.id = requestAnimationFrame(render);
    };
    particles.forEach(p => {
      gsap.to(p, {
        drift: gsap.utils.random(-26, 26),
        duration: gsap.utils.random(3, 7),
        delay: gsap.utils.random(0, 2),
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });
    window.addEventListener('resize', resize);
    render();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(anim.id);
      particles.forEach(p => gsap.killTweensOf(p));
    };
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const formRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email.trim() || !form.password.trim()) {
      const msg = 'Email and password are required.';
      setError(msg);
      toast.error(msg);
      return;
    }
    setLoading(true);
    try {
      const userData = await login(form.email, form.password);

      // userData comes directly from login() in AuthContext
      // Extract role safely
      const role = userData?.role ||
        JSON.parse(
          atob(
            localStorage.getItem('token').split('.')[1]
          )
        )?.role;

      const dest = location.state?.from?.pathname;
      if (role === 'employee') {
        navigate(dest || '/dashboard', { replace: true });
      } else if (role === 'manager' || role === 'admin') {
        navigate(dest || '/manager', { replace: true });
      } else {
        navigate(dest || '/dashboard', { replace: true });
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Invalid credentials';
      setError(msg);
      toast.error(msg);
      // Shake animation on error
      if (formRef.current) {
        gsap.to(formRef.current, {
          x: [0, -10, 10, -10, 10, 0],
          duration: 0.4,
          ease: 'power1.inOut'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen font-inter lg:grid-cols-2 bg-[#08080F]">
      {/* Left Panel */}
      <section
        ref={leftPanelRef}
        className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12"
        style={{
          background:
            'radial-gradient(ellipse at 40% 50%, rgba(245,158,11,0.12) 0%, transparent 65%)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 text-amber-400 text-xl font-bold">
          <FiAward className="text-2xl" />
          <span>RewardX</span>
        </div>
        {/* Tagline */}
        <div className="flex flex-col gap-2">
          <TextReveal text="Recognize." delay={0.3} stagger={0.06} className="text-5xl font-bold text-white" />
          <TextReveal text="Reward." delay={0.8} stagger={0.06} className="text-5xl font-bold text-amber-400" />
          <TextReveal text="Retain." delay={1.3} stagger={0.06} className="text-5xl font-bold text-white" />
        </div>
        <div className="my-6 h-px w-16 bg-amber-400" />
        <p className="max-w-[320px] text-sm text-[#6B7280]">
          The intelligent platform for recognizing your team's best.
        </p>
        {/* Feature pills */}
        <div className="flex gap-3 mt-8">
          {['🏆 Smart Rewards', '📊 AI Analytics', '🔒 Secure'].map(pill => (
            <span
              key={pill}
              className="rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-2 text-amber-400 text-sm"
            >
              {pill}
            </span>
          ))}
        </div>
      </section>

      {/* Right Panel */}
      <section className="flex items-center justify-center bg-[#0D0D18]">
        <motion.div
          ref={formRef}
          className="w-full max-w-[420px] p-12 rounded-2xl lg:rounded-2xl rounded-none"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(245,158,11,0.15)',
            boxShadow: '0 0 80px rgba(245,158,11,0.08)',
          }}
          variants={panelFade}
          initial="hidden"
          animate="visible"
        >
          <div className="text-center">
            <FiAward className="mx-auto mb-4 text-4xl text-amber-400" />
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            <p className="mt-1 text-sm text-[#6B7280]">Sign in to your RewardX account</p>
          </div>
          <div className="my-6 h-px w-full opacity-10 bg-white" />
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <motion.div className="relative" custom={0} variants={fieldFade}>
              <label htmlFor="email" className="mb-1 block text-xs text-gray-400">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" size={18} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  className="w-full rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] py-3 pl-11 pr-4 text-white placeholder-[#4B5563] focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-[rgba(245,158,11,0.1)] transition"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </motion.div>
            {/* Password */}
            <motion.div className="relative" custom={1} variants={fieldFade}>
              <label htmlFor="password" className="mb-1 block text-xs text-gray-400">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" size={18} />
                <input
                  id="password"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] py-3 pl-11 pr-12 text-white placeholder-[#4B5563] focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-[rgba(245,158,11,0.1)] transition"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-400"
                  onClick={() => setShowPwd(v => !v)}
                >
                  {showPwd ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </motion.div>
            {/* Remember / Forgot */}
            <motion.div className="flex items-center justify-between" custom={2} variants={fieldFade}>
              <label className="inline-flex items-center gap-2 text-amber-400">
                <input type="checkbox" className="rounded bg-[#0D0D18] border-amber-400 text-amber-400 focus:ring-amber-400" />
                Remember me
              </label>
              <Link to="#" className="text-amber-400 hover:underline">
                Forgot password?
              </Link>
            </motion.div>
            {/* Sign In button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full flex h-13 items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-[#08080F] font-bold text-base shadow-lg transition-transform"
              whileHover={{ scale: 1.02, filter: 'brightness(1.1)', y: -1, boxShadow: '0 12px 40px rgba(245,158,11,0.45)' }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <FiRefreshCw className="mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </motion.button>
            {/* Divider */}
            <div className="my-6 flex items-center text-sm text-gray-500">
              <hr className="flex-1 border-t border-gray-600" />
              <span className="px-3">or continue with</span>
              <hr className="flex-1 border-t border-gray-600" />
            </div>
            {/* Google SSO */}
            <motion.button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] py-2 text-white hover:border-[rgba(245,158,11,0.3)] transition"
              whileHover={{ scale: 1.02 }}
            >
              <FcGoogle size={20} />
              Continue with Google
            </motion.button>
            {/* Bottom link */}
            <p className="mt-6 text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-amber-400 font-semibold hover:underline">
                Create Account
              </Link>
            </p>
            {/* Error message */}
            {error && (
              <motion.p className="mt-4 text-center text-sm text-red-400" animate={{ x: [0, -8, 8, -8, 8, 0] }}>
                {error}
              </motion.p>
            )}
          </form>
        </motion.div>
      </section>
    </main>
  );
};

export default Login;
