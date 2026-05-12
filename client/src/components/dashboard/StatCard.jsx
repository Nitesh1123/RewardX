import React, { memo, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { BsArrowUpRight, BsArrowDownRight } from 'react-icons/bs';

const StatCard = memo(({
  title,
  value,
  icon: Icon,
  iconBg = 'rgba(245,158,11,0.15)',
  trend = 'up',
  trendValue = 0,
  suffix = '',
  prefix = '',
  description = '',
  index = 0,
}) => {
  const numberRef = useRef(null);
  const barRef = useRef(null);

  const { numericValue, isNumeric } = useMemo(() => {
    const text = String(value ?? '0');
    const match = text.match(/-?\d+(\.\d+)?/);

    if (!match) {
      return { numericValue: 0, isNumeric: false };
    }

    return {
      numericValue: Number(match[0]),
      isNumeric: true,
    };
  }, [value]);

  // GSAP number counter animation
  useEffect(() => {
    if (!numberRef.current || !isNumeric) {
      if (numberRef.current) numberRef.current.innerText = value;
      return undefined;
    }

    const target = { innerText: 0 };
    gsap.fromTo(
      target,
      { innerText: 0 },
      {
        innerText: numericValue,
        duration: 1.8,
        ease: 'power2.out',
        snap: { innerText: 1 },
        onUpdate() {
          if (numberRef.current) {
            numberRef.current.innerText = Math.ceil(target.innerText).toLocaleString();
          }
        },
      }
    );

    return () => {
      gsap.killTweensOf(target);
    };
  }, [isNumeric, numericValue, value]);

  // Bottom accent bar animation
  useEffect(() => {
    if (!barRef.current) return undefined;

    gsap.fromTo(
      barRef.current,
      { width: '0%' },
      {
        width: '100%',
        duration: 1.2,
        ease: 'power2.out',
        delay: index * 0.1,
      }
    );

    return () => {
      gsap.killTweensOf(barRef.current);
    };
  }, [index]);

  const isUp = trend === 'up';

  // Icon color based on iconBg
  const iconColor = useMemo(() => {
    if (iconBg.includes('245,158,11')) return '#F59E0B'; // amber
    if (iconBg.includes('139,92,246')) return '#8B5CF6'; // purple
    if (iconBg.includes('16,185,129')) return '#10B981'; // green
    if (iconBg.includes('59,130,246')) return '#3B82F6'; // blue
    return '#F59E0B';
  }, [iconBg]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.08 }}
      whileHover={{
        y: -2,
        borderColor: 'rgba(245,158,11,0.25)',
        boxShadow: '0 0 40px rgba(245,158,11,0.08)',
      }}
      className="relative overflow-hidden rounded-[20px] p-6 transition-all duration-300 cursor-default"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Background decoration - top right circle */}
      <div
        className="absolute -top-5 -right-5 w-[120px] h-[120px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${iconBg.replace('0.15', '0.06')} 0%, transparent 70%)`,
        }}
      />

      {/* Top row - title and icon */}
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">
            {title}
          </p>
        </div>

        {/* Icon box */}
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{
            background: iconBg,
            border: `1px solid ${iconBg.replace('0.15', '0.3')}`,
          }}
        >
          {Icon && <Icon size={20} style={{ color: iconColor }} />}
        </div>
      </div>

      {/* Middle - value display */}
      <div className="flex items-baseline gap-1 mt-2 relative z-10">
        {prefix && (
          <span className="text-amber-400 text-lg font-bold">{prefix}</span>
        )}
        <span
          ref={numberRef}
          className="text-white text-3xl font-bold tracking-tight"
        >
          {numericValue.toLocaleString()}
        </span>
        {suffix && (
          <span className="text-gray-400 text-lg ml-1">{suffix}</span>
        )}
      </div>

      {/* Bottom row - description and trend */}
      <div className="flex justify-between items-end mt-4 relative z-10">
        <p className="text-gray-600 text-xs">{description}</p>

        {/* Trend indicator */}
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
            isUp
              ? 'bg-[rgba(16,185,129,0.1)] text-[#10B981]'
              : 'bg-[rgba(239,68,68,0.1)] text-[#EF4444]'
          }`}
        >
          {trend === 'up' ? <BsArrowUpRight className="text-green-400" /> : <BsArrowDownRight className="text-red-400" />}
          {isUp ? '+' : '-'}{trendValue}% this month
        </div>
      </div>

      {/* Bottom accent bar */}
      <div
        ref={barRef}
        className="absolute bottom-0 left-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, #F59E0B, transparent)',
          width: '0%',
        }}
      />
    </motion.div>
  );
});

StatCard.displayName = 'StatCard';

export default StatCard;
