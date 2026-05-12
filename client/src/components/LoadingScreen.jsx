import { useState, useEffect, useRef } from 'react';

const MIN_TIME = process.env.NODE_ENV === 'development' ? 3000 : 2000;

const MESSAGES = [
  'INITIALIZING...',
  'LOADING REWARDS...',
  'SYNCING DATA...',
  'ALMOST READY...',
  'LAUNCHING...',
];

export default function LoadingScreen({ isReady, onFinish }) {
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [canHide, setCanHide] = useState(false);
  const [hiding, setHiding] = useState(false);
  const startTimeRef = useRef(Date.now());
  const canvas = useRef(null);

  // Canvas hyper-speed tunnel effect
  useEffect(() => {
    const ctx = canvas.current.getContext('2d');
    canvas.current.width = window.innerWidth;
    canvas.current.height = window.innerHeight;

    const cx = canvas.current.width / 2;
    const cy = canvas.current.height / 2;

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.current.width - cx,
      y: Math.random() * canvas.current.height - cy,
      z: Math.random() * canvas.current.width,
      pz: 0,
    }));

    let animId;
    const speed = { current: 8 };

    function draw() {
      ctx.fillStyle = 'rgba(8, 8, 16, 0.25)';
      ctx.fillRect(0, 0, canvas.current.width, canvas.current.height);

      stars.forEach(star => {
        star.pz = star.z;
        star.z -= speed.current;

        if (star.z <= 0) {
          star.x = Math.random() * canvas.current.width - cx;
          star.y = Math.random() * canvas.current.height - cy;
          star.z = canvas.current.width;
          star.pz = star.z;
        }

        const sx  = (star.x / star.z)  * canvas.current.width + cx;
        const sy  = (star.y / star.z)  * canvas.current.height + cy;
        const spx = (star.x / star.pz) * canvas.current.width + cx;
        const spy = (star.y / star.pz) * canvas.current.height + cy;

        const size = Math.max(0.5, (1 - star.z / canvas.current.width) * 3);

        const brightness = Math.floor((1 - star.z / canvas.current.width) * 255);
        const r = 255;
        const g = Math.floor(brightness * 0.85 + 40);
        const b = Math.floor(brightness * 0.4);

        ctx.beginPath();
        ctx.moveTo(spx, spy);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = `rgba(${r},${g},${b},0.9)`;
        ctx.lineWidth = size;
        ctx.stroke();
      });

      animId = requestAnimationFrame(draw);
    }

    draw();

    const handleResize = () => {
      canvas.current.width = window.innerWidth;
      canvas.current.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Progress bar animation
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const fraction = Math.min(elapsed / MIN_TIME, 1);
      const target = canHide ? 100 : Math.min(fraction * 90, 90);
      setProgress(target);
      if (canHide && target >= 100) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [canHide]);

  // Message cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % MESSAGES.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Readiness + minimum time check
  useEffect(() => {
    if (!isReady) return;
    const elapsed = Date.now() - startTimeRef.current;
    const remaining = MIN_TIME - elapsed;
    if (remaining <= 0) {
      setCanHide(true);
    } else {
      setTimeout(() => setCanHide(true), remaining);
    }
  }, [isReady]);

  // Trigger fade-out after canHide
  useEffect(() => {
    if (!canHide) return;
    setProgress(100);
    const timer = setTimeout(() => {
      setHiding(true);
      setTimeout(() => onFinish(), 600);
    }, 250);
    return () => clearTimeout(timer);
  }, [canHide, onFinish]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#08080F',
        overflow: 'hidden',
        opacity: hiding ? 0 : 1,
        transition: 'opacity 0.6s ease',
        pointerEvents: hiding ? 'none' : 'auto',
      }}
    >
      {/* CSS Keyframes */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%,100% { opacity: 0.7; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.08); }
        }
        @keyframes flicker {
          0%,100% { opacity: 1; }
          92%      { opacity: 1; }
          93%      { opacity: 0.4; }
          94%      { opacity: 1; }
        }
      `}</style>

      {/* Canvas warp tunnel */}
      <canvas
        ref={canvas}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />

      {/* Center overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Ring + Logo container */}
        <div style={{ position: 'relative', width: 140, height: 140 }}>
          {/* Outer spinning ring */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 140,
              height: 140,
              borderRadius: '50%',
              border: '2px solid rgba(245, 166, 35, 0.6)',
              boxShadow: '0 0 30px rgba(245,166,35,0.4), 0 0 60px rgba(245,166,35,0.15), inset 0 0 30px rgba(245,166,35,0.1)',
              animation: 'spin 1.2s linear infinite, flicker 4s linear infinite',
            }}
          />

          {/* Inner static circle */}
          <div
            style={{
              position: 'absolute',
              top: 15,
              left: 15,
              width: 110,
              height: 110,
              borderRadius: '50%',
              background: 'rgba(8,8,16,0.85)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                fontSize: 40,
                fontWeight: 800,
                color: '#fff',
                fontFamily: 'Georgia, serif',
                animation: 'pulse 1.8s ease-in-out infinite',
                lineHeight: 1,
              }}
            >
              R
            </div>
            <div
              style={{
                width: 6,
                height: 6,
                background: '#F5A623',
                transform: 'rotate(45deg)',
                marginTop: 6,
              }}
            />
          </div>
        </div>

        {/* Brand name */}
        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: '#fff',
            letterSpacing: 4,
            marginTop: 32,
            fontFamily: 'sans-serif',
          }}
        >
          Reward<span style={{ color: '#F5A623' }}>X</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 10,
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: 8,
            marginTop: 6,
            textTransform: 'uppercase',
            fontFamily: 'sans-serif',
          }}
        >
          EMPLOYEE REWARD MANAGEMENT
        </div>

        {/* Progress bar */}
        <div style={{ width: 240, marginTop: 48 }}>
          <div
            style={{
              width: '100%',
              height: 2,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 999,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #F5A623, #fff8e1)',
                boxShadow: '0 0 8px rgba(245,166,35,0.8)',
                borderRadius: 999,
                transition: 'width 0.25s ease',
              }}
            />
          </div>
        </div>

        {/* Status text */}
        <div
          style={{
            marginTop: 14,
            fontSize: 10,
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: 6,
            textTransform: 'uppercase',
            fontFamily: 'sans-serif',
            minHeight: 16,
            textAlign: 'center',
          }}
        >
          {MESSAGES[msgIndex]}
        </div>
      </div>
    </div>
  );
}
