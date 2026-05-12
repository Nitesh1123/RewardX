import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import toast from 'react-hot-toast';
import { FiAward, FiLock, FiMail, FiUser, FiBriefcase, FiShield } from 'react-icons/fi';
import api from '../utils/api';
import { fadeInRight, fadeInUp, scaleIn, staggerContainer } from '../utils/animations';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const canvasRef = useRef(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', department: 'Engineering', role: 'employee' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
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
      context.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle) => {
        context.beginPath();
        context.arc(particle.x, particle.y + particle.drift, particle.size, 0, Math.PI * 2);
        context.fillStyle = `rgba(245,158,11,${particle.opacity})`;
        context.shadowColor = 'rgba(245,158,11,0.35)';
        context.shadowBlur = 16;
        context.fill();
      });
    };

    resize();
    const animationFrame = { id: 0 };
    const render = () => {
      draw();
      animationFrame.id = requestAnimationFrame(render);
    };

    particles.forEach((particle) => {
      gsap.to(particle, {
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
      cancelAnimationFrame(animationFrame.id);
      particles.forEach((particle) => gsap.killTweensOf(particle));
    };
  }, []);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError('All fields are required.');
      toast.error('All fields are required.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        department: form.department,
        role: form.role,
      });
      localStorage.setItem('token', response.data.token);
      toast.success('Registration successful!');
      
      const destination = location.state?.from?.pathname;
      navigate(destination || (['manager', 'admin'].includes(response.data.user.role) ? '/manager' : '/dashboard'), {
        replace: true,
      });
      window.location.reload(); // Force reload to sync context
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-dark text-textPrimary lg:grid-cols-2">
      <section className="relative hidden overflow-hidden border-r border-white/10 bg-radial-gold p-12 lg:flex lg:flex-col lg:justify-between">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex items-center gap-4"
        >
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gold-gradient text-3xl text-dark shadow-gold">
            <FiAward />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gradient">RewardX</h1>
            <p className="text-sm uppercase tracking-[0.35em] text-textMuted">Recognition Engine</p>
          </div>
        </motion.div>

        <div className="relative z-10 max-w-xl">
          <p className="mb-6 text-sm font-bold uppercase tracking-[0.32em] text-primary">People-first performance</p>
          <motion.h2
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-6xl font-black leading-tight"
          >
            {['Join.', 'Engage.', 'Grow.'].map((word) => (
              <motion.span key={word} variants={fadeInUp} transition={{ duration: 0.5 }} className="mr-4 inline-block">
                {word}
              </motion.span>
            ))}
          </motion.h2>
          <p className="mt-6 text-lg leading-8 text-textMuted">
            Join the premium employee rewards command center. Track your points, earn badges, and grow with your team.
          </p>
        </div>

        <div className="relative z-10 glass-card max-w-md p-5">
          <p className="text-sm text-textMuted">
            Create an account to start earning points, giving feedback, and building your professional profile.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center p-6 h-screen overflow-y-auto">
        <motion.form
          onSubmit={handleSubmit}
          variants={fadeInRight}
          initial="hidden"
          animate={error ? { x: [0, -10, 10, -10, 10, 0], opacity: 1 } : 'visible'}
          transition={error ? { duration: 0.4 } : undefined}
          className="glass-card w-full max-w-md p-8 shadow-soft my-auto"
        >
          <div className="mb-8 text-center">
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-gold-gradient text-3xl text-dark shadow-gold lg:hidden"
            >
              <FiAward />
            </motion.div>
            <h2 className="text-3xl font-black">Create Account</h2>
            <p className="mt-2 text-textMuted">Join your team's workspace.</p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-red-200">
              {error}
            </div>
          )}

          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <motion.label variants={fadeInUp} className="mb-4 block">
              <span className="mb-2 block text-sm font-bold text-textMuted">Full Name</span>
              <span className="relative block">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" />
                <input
                  className="input-field pl-11"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                />
              </span>
            </motion.label>

            <motion.label variants={fadeInUp} className="mb-4 block">
              <span className="mb-2 block text-sm font-bold text-textMuted">Email</span>
              <span className="relative block">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" />
                <input
                  className="input-field pl-11"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                />
              </span>
            </motion.label>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <motion.label variants={fadeInUp} className="block">
                <span className="mb-2 block text-sm font-bold text-textMuted">Department</span>
                <span className="relative block">
                  <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted z-10" />
                  <select
                    className="input-field pl-11 appearance-none bg-dark"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="HR">HR</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                  </select>
                </span>
              </motion.label>

              <motion.label variants={fadeInUp} className="block">
                <span className="mb-2 block text-sm font-bold text-textMuted">Role</span>
                <span className="relative block">
                  <FiShield className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted z-10" />
                  <select
                    className="input-field pl-11 appearance-none bg-dark"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                  </select>
                </span>
              </motion.label>
            </div>

            <motion.label variants={fadeInUp} className="mb-4 block">
              <span className="mb-2 block text-sm font-bold text-textMuted">Password</span>
              <span className="relative block">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" />
                <input
                  className="input-field pl-11"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                />
              </span>
            </motion.label>
            
            <motion.label variants={fadeInUp} className="mb-6 block">
              <span className="mb-2 block text-sm font-bold text-textMuted">Confirm Password</span>
              <span className="relative block">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" />
                <input
                  className="input-field pl-11"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                />
              </span>
            </motion.label>
          </motion.div>

          <motion.button
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </motion.button>
          
          <p className="mt-6 text-center text-sm text-textMuted">
            Already have an account? <Link to="/login" className="text-primary hover:underline font-bold">Sign In</Link>
          </p>
        </motion.form>
      </section>
    </main>
  );
};

export default Register;
