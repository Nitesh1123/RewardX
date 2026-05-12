import React, { memo, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const LoadingSpinner = memo(() => {
  const ring1 = useRef(null);
  const ring2 = useRef(null);
  const ring3 = useRef(null);

  useEffect(() => {
    const refs = [ring1.current, ring2.current, ring3.current].filter(Boolean);

    gsap.to(ring1.current, {
      rotation: 360,
      repeat: -1,
      duration: 1.2,
      ease: 'none',
      transformOrigin: 'center',
    });
    gsap.to(ring2.current, {
      rotation: -360,
      repeat: -1,
      duration: 0.8,
      ease: 'none',
      transformOrigin: 'center',
    });
    gsap.to(ring3.current, {
      rotation: 360,
      repeat: -1,
      duration: 2,
      ease: 'none',
      transformOrigin: 'center',
    });

    return () => {
      refs.forEach((ref) => gsap.killTweensOf(ref));
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark">
      <svg width="132" height="132" viewBox="0 0 132 132" className="drop-shadow-[0_0_28px_rgba(245,158,11,0.35)]">
        <circle
          ref={ring1}
          cx="66"
          cy="66"
          r="48"
          fill="none"
          stroke="#F59E0B"
          strokeDasharray="92 210"
          strokeLinecap="round"
          strokeWidth="6"
        />
        <circle
          ref={ring2}
          cx="66"
          cy="66"
          r="34"
          fill="none"
          stroke="#D97706"
          strokeDasharray="70 150"
          strokeLinecap="round"
          strokeWidth="5"
        />
        <circle
          ref={ring3}
          cx="66"
          cy="66"
          r="20"
          fill="none"
          stroke="#92400E"
          strokeDasharray="44 96"
          strokeLinecap="round"
          strokeWidth="4"
        />
      </svg>
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
