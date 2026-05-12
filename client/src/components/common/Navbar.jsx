import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import {
  FiSearch,
  FiChevronDown,
  FiMenu,
  FiBell,
} from 'react-icons/fi';
import {
  IoMdNotificationsOutline,
} from 'react-icons/io';
import { useAuth } from '../../hooks/useAuth';

const Navbar = ({ onMobileMenuOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const bellRef = useRef(null);

  // GSAP wiggle animation for bell on mount
  useEffect(() => {
    if (bellRef.current) {
      gsap.fromTo(bellRef.current,
        { rotation: -15 },
        {
          rotation: 15,
          duration: 0.15,
          repeat: 3,
          yoyo: true,
          ease: 'power1.inOut',
          delay: 1
        }
      );
    }
  }, []);

  // Get page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/dashboard': return 'Dashboard';
      case '/manager': return 'Manager Overview';
      case '/leaderboard': return 'Leaderboard';
      case '/rewards': return 'Rewards Store';
      case '/feedback': return 'Feedback Portal';
      case '/ai-insights': return 'AI Insights';
      case '/profile': return 'My Profile';
      default: return 'Dashboard';
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'RX';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsDropdownOpen(false);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsDropdownOpen(false);
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="fixed top-0 left-[260px] right-0 h-[64px] z-40 bg-[rgba(8,8,15,0.85)] backdrop-blur-[20px] border-b border-b-[rgba(245,158,11,0.08)] shadow-[0_1px_0_rgba(245,158,11,0.05)]"
    >
      <div className="flex items-center justify-between px-6 h-full">
        {/* Left Side - Page Title */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMobileMenuOpen}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <FiMenu size={20} />
          </button>
          
          <div>
            <h1 className="text-white font-semibold text-lg">{getPageTitle()}</h1>
            <p className="text-xs text-gray-600">RewardX / {getPageTitle()}</p>
          </div>
        </div>

        {/* Center - Search Bar */}
        <div className="hidden md:block relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <motion.input
            type="text"
            placeholder="Search employees, rewards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[320px] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[rgba(245,158,11,0.4)] focus:shadow-[0_0_0_3px_rgba(245,158,11,0.08)] transition-all"
            whileFocus={{ scale: 1.02 }}
          />
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <motion.button
            ref={bellRef}
            className="relative w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] flex items-center justify-center text-gray-400 hover:border-[rgba(245,158,11,0.3)] hover:text-amber-400 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <IoMdNotificationsOutline size={20} />
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white">
              3
            </span>
          </motion.button>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-white/10" />

          {/* Date Display */}
          <div className="hidden sm:block text-xs text-gray-500">
            {today}
          </div>

          {/* User Avatar Button */}
          <div className="relative">
            <motion.button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
              whileHover={{ scale: 1.02 }}
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full overflow-hidden">
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                    <span className="text-[13px] font-bold text-white">{getInitials(user?.name)}</span>
                  </div>
                )}
              </div>
              
              {/* User Info */}
              <div className="hidden sm:block">
                <p className="text-sm text-white font-medium truncate max-w-[100px]">{user?.name || 'User'}</p>
                <p className="text-[11px] text-amber-400">{user?.role || 'employee'}</p>
              </div>
              
              {/* Chevron */}
              <FiChevronDown 
                size={14} 
                className="text-gray-400 transition-transform duration-200"
                style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-2 min-w-[180px] bg-[#0D0D18] border border-[rgba(245,158,11,0.15)] rounded-xl p-2 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
                >
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[rgba(245,158,11,0.08)] hover:text-amber-400 transition-colors"
                  >
                    <span>👤</span>
                    My Profile
                  </button>
                  
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[rgba(245,158,11,0.08)] hover:text-amber-400 transition-colors"
                  >
                    <span>⚙️</span>
                    Settings
                  </button>
                  
                  <div className="my-1 h-px bg-gray-700" />
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-[rgba(239,68,68,0.08)] transition-colors"
                  >
                    <span>🚪</span>
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Navbar;
