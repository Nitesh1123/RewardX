import React, { memo, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const SkeletonCard = memo(({ variant = 'default', className = '' }) => {
  const shimmerRef = useRef(null);

  useEffect(() => {
    if (!shimmerRef.current) return undefined;

    gsap.to(shimmerRef.current, {
      backgroundPosition: '-200% 0',
      repeat: -1,
      duration: 1.5,
      ease: 'none',
    });

    return () => {
      gsap.killTweensOf(shimmerRef.current);
    };
  }, []);

  const shimmerStyle = {
    background: 'linear-gradient(90deg, #111118 25%, #1a1a2e 50%, #111118 75%)',
    backgroundSize: '200% 100%',
  };

  // Stat card skeleton
  if (variant === 'stat') {
    return (
      <div className={`bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-[20px] p-6 relative overflow-hidden ${className}`}>
        <div ref={shimmerRef} className="absolute inset-0" style={shimmerStyle} />
        <div className="relative z-10 space-y-4">
          <div className="flex justify-between items-start">
            <div className="h-3 w-20 bg-white/[0.08] rounded" />
            <div className="w-11 h-11 rounded-2xl bg-white/[0.08]" />
          </div>
          <div className="h-8 w-24 bg-white/[0.08] rounded" />
          <div className="flex justify-between items-end mt-4">
            <div className="h-3 w-32 bg-white/[0.05] rounded" />
            <div className="h-5 w-16 bg-white/[0.08] rounded-full" />
          </div>
        </div>
        {/* Bottom accent bar */}
        <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-amber-500/20 to-transparent" />
      </div>
    );
  }

  // Chart card skeleton
  if (variant === 'chart') {
    return (
      <div className={`bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 relative overflow-hidden ${className}`}>
        <div ref={shimmerRef} className="absolute inset-0" style={shimmerStyle} />
        <div className="relative z-10 space-y-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="h-4 w-32 bg-white/[0.08] rounded mb-2" />
              <div className="h-3 w-24 bg-white/[0.05] rounded" />
            </div>
            <div className="flex gap-2">
              <div className="h-6 w-10 bg-white/[0.08] rounded-full" />
              <div className="h-6 w-10 bg-white/[0.08] rounded-full" />
            </div>
          </div>
          <div className="h-[220px] bg-white/[0.04] rounded-xl" />
        </div>
      </div>
    );
  }

  // Attendance ring skeleton
  if (variant === 'attendance') {
    return (
      <div className={`bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 relative overflow-hidden ${className}`}>
        <div ref={shimmerRef} className="absolute inset-0" style={shimmerStyle} />
        <div className="relative z-10 space-y-4">
          <div className="h-4 w-24 bg-white/[0.08] rounded" />
          <div className="flex justify-center py-4">
            <div className="w-40 h-40 rounded-full bg-white/[0.04]" />
          </div>
          <div className="flex justify-center gap-2">
            <div className="h-6 w-16 bg-white/[0.06] rounded-full" />
            <div className="h-6 w-16 bg-white/[0.06] rounded-full" />
            <div className="h-6 w-16 bg-white/[0.06] rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // List card skeleton (rewards, leaderboard)
  if (variant === 'list') {
    return (
      <div className={`bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 relative overflow-hidden ${className}`}>
        <div ref={shimmerRef} className="absolute inset-0" style={shimmerStyle} />
        <div className="relative z-10 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="h-4 w-32 bg-white/[0.08] rounded" />
            <div className="h-4 w-16 bg-white/[0.06] rounded" />
          </div>
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 bg-white/[0.08] rounded" />
                <div className="h-2 w-1/2 bg-white/[0.05] rounded" />
              </div>
              <div className="h-4 w-12 bg-white/[0.08] rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Badges grid skeleton
  if (variant === 'badges') {
    return (
      <div className={`bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 relative overflow-hidden ${className}`}>
        <div ref={shimmerRef} className="absolute inset-0" style={shimmerStyle} />
        <div className="relative z-10 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="h-4 w-24 bg-white/[0.08] rounded" />
            <div className="h-5 w-16 bg-white/[0.06] rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.06]" />
                <div className="h-3 w-14 bg-white/[0.05] rounded" />
                <div className="h-2 w-10 bg-white/[0.04] rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default skeleton
  return (
    <div className={`bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 relative overflow-hidden ${className}`}>
      <div ref={shimmerRef} className="absolute inset-0" style={shimmerStyle} />
      <div className="relative z-10 space-y-4">
        <div className="h-4 w-32 bg-white/[0.08] rounded" />
        <div className="h-20 bg-white/[0.04] rounded-xl" />
        <div className="h-10 bg-white/[0.06] rounded-lg" />
      </div>
    </div>
  );
});

SkeletonCard.displayName = 'SkeletonCard';

export default SkeletonCard;
