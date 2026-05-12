import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiAward,
  FiGift,
  FiMessageSquare,
  FiSearch,
  FiChevronDown,
  FiX,
  FiMenu,
} from 'react-icons/fi';
import {
  RxDashboard,
} from 'react-icons/rx';
import {
  MdDashboardCustomize,
} from 'react-icons/md';
import {
  HiOutlineGift,
} from 'react-icons/hi';
import {
  RiMessage2Line,
  RiLogoutBoxLine,
} from 'react-icons/ri';
import {
  TbBrain,
} from 'react-icons/tb';
import {
  CgProfile,
} from 'react-icons/cg';
import {
  GiTwoCoins,
} from 'react-icons/gi';
import { useAuth } from '../../hooks/useAuth';
import { fadeInLeft, fadeInUp, scaleIn, slideInSidebar, staggerContainer } from '../../utils/animations';

const baseNavItems = [
  { icon: RxDashboard, label: 'Dashboard', path: '/dashboard', roles: ['employee'] },
  { icon: MdDashboardCustomize, label: 'Overview', path: '/manager', roles: ['manager', 'admin'] },
  { icon: FiAward, label: 'Leaderboard', path: '/leaderboard', roles: ['all'] },
  { icon: HiOutlineGift, label: 'Rewards Store', path: '/rewards', roles: ['all'] },
  { icon: RiMessage2Line, label: 'Feedback', path: '/feedback', roles: ['all'] },
  { icon: TbBrain, label: 'AI Insights', path: '/ai-insights', roles: ['manager', 'admin'] },
  { icon: CgProfile, label: 'Profile', path: '/profile', roles: ['all'] },
];

const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutTooltip, setShowLogoutTooltip] = useState(false);

  const visibleItems = baseNavItems
    .map((item) =>
      item.label === 'Dashboard' && ['manager', 'admin'].includes(user?.role)
        ? { ...item, path: '/manager' }
        : item
    )
    .filter((item) => item.roles === 'all' || item.roles?.includes(user?.role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'RX';
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'manager': return 'text-amber-400 bg-amber-400/10';
      case 'admin': return 'text-purple-400 bg-purple-400/10';
      default: return 'text-blue-400 bg-blue-400/10';
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}
      
      {/* Sidebar */}
      <motion.aside
        variants={slideInSidebar}
        initial="hidden"
        animate="visible"
        className={`fixed left-0 top-0 z-50 h-screen w-[260px] bg-[#08080F] border-r border-r-[rgba(245,158,11,0.1)] lg:block lg:z-40 ${
          isMobileOpen ? 'block' : 'hidden'
        }`}
        style={{ willChange: 'transform' }}
      >
        {/* Gold gradient line on right edge */}
        <div 
          className="absolute right-0 top-0 h-full w-[1px] opacity-40"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(245,158,11,0.4) 50%, transparent 100%)'
          }}
        />
        
        {/* Close button for mobile */}
        <button
          onClick={onCloseMobile}
          className="absolute right-4 top-4 lg:hidden text-gray-400 hover:text-white"
        >
          <FiX size={20} />
        </button>
        {/* Logo Section */}
        <div className="flex items-center gap-3 h-[72px] px-6">
          <div className="w-9 h-9 rounded-full bg-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.3)] flex items-center justify-center">
            <span className="text-[18px]">🏆</span>
          </div>
          <div>
            <h1 className="text-[20px] font-black bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              RewardX
            </h1>
          </div>
        </div>
        
        {/* Divider */}
        <div className="w-full h-px bg-[rgba(245,158,11,0.08)]" />

        {/* Navigation Section */}
        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex-1 pt-4 space-y-1"
        >
          {visibleItems.map(({ label, path, icon: Icon }) => (
            <motion.li key={path} variants={fadeInLeft} whileHover={{ x: 4 }} style={{ willChange: 'transform' }}>
              <NavLink
                to={path}
                onClick={() => isMobileOpen && onCloseMobile()}
                className={({ isActive }) => {
                  const baseClasses = 'group relative flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl mx-3 mb-1 overflow-hidden transition-all duration-200';
                  const activeClasses = isActive 
                    ? 'bg-[rgba(245,158,11,0.1)] border-l-[3px] border-amber-400 shadow-[inset_2px_0_12px_rgba(245,158,11,0.1)]'
                    : 'hover:bg-[rgba(245,158,11,0.06)]';
                  
                  return `${baseClasses} ${activeClasses}`;
                }}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute inset-0 bg-[rgba(245,158,11,0.1)] border-l-[3px] border-amber-400 shadow-[inset_2px_0_12px_rgba(245,158,11,0.1)] rounded-xl"
                        style={{ zIndex: -1 }}
                      />
                    )}
                    <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                      isActive ? 'bg-[rgba(245,158,11,0.15)]' : 'bg-transparent'
                    }`}>
                      <Icon 
                        className="text-lg" 
                        style={{ color: isActive ? '#F59E0B' : '#4B5563' }}
                      />
                    </div>
                    <span 
                      className="text-[14px] font-medium"
                      style={{ 
                        color: isActive ? '#FCD34D' : '#6B7280',
                        fontWeight: isActive ? 600 : 500
                      }}
                    >
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            </motion.li>
          ))}
        </motion.ul>

        {/* Section Divider */}
        <div className="mx-4 my-3">
          <div className="h-px bg-[rgba(255,255,255,0.05)]" />
          <p className="text-[10px] text-gray-600 font-bold tracking-widest px-4 mt-2 mb-2">ACCOUNT</p>
        </div>

        {/* Points Display (for employees only) */}
        {user?.role === 'employee' && (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
            className="mx-3 mb-2 px-4 py-3 rounded-xl bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.12)]"
          >
            <div className="flex items-center gap-3">
              <GiTwoCoins size={20} className="text-amber-400" />
              <div className="flex-1">
                <p className="text-[11px] text-gray-500">Your Points</p>
                <p className="text-lg font-bold text-amber-400">{user?.rewardPoints || 0}</p>
              </div>
              {user?.rewardPoints > 0 && (
                <span className="text-green-400 text-sm">↑</span>
              )}
            </div>
          </motion.div>
        )}

        {/* User Card */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
          className="mx-3 mb-4 p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(245,158,11,0.1)]"
        >
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              {user?.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <span className="text-[14px] font-bold text-white">{getInitials(user?.name)}</span>
                </div>
              )}
            </div>
            
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{user?.name || 'RewardX User'}</p>
              <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${getRoleColor(user?.role)}`}>
                {user?.role || 'employee'}
              </span>
            </div>
            
            {/* Logout Button */}
            <div className="relative">
              <motion.button
                onClick={handleLogout}
                onMouseEnter={() => setShowLogoutTooltip(true)}
                onMouseLeave={() => setShowLogoutTooltip(false)}
                className="text-gray-500 hover:text-red-400 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <RiLogoutBoxLine size={18} />
              </motion.button>
              
              {/* Tooltip */}
              <AnimatePresence>
                {showLogoutTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#0D0D18] border border-[rgba(245,158,11,0.15)] rounded text-xs text-white whitespace-nowrap"
                  >
                    Logout
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
