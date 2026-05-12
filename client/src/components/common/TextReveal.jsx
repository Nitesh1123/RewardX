import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const TextReveal = ({ text, className = '', delay = 0, stagger = 0.05 }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const letters = containerRef.current.querySelectorAll('.letter');

    gsap.fromTo(
      letters,
      {
        yPercent: 120,
        opacity: 0,
        rotateX: -90,
      },
      {
        yPercent: 0,
        opacity: 1,
        rotateX: 0,
        duration: 0.6,
        ease: 'power3.out',
        stagger: stagger,
        delay: delay,
      }
    );
  }, [text, delay, stagger]);

  return (
    <span
      ref={containerRef}
      className={`inline-flex overflow-hidden ${className}`}
      style={{ perspective: '600px' }}
    >
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="letter inline-block"
          style={{
            display: 'inline-block',
            whiteSpace: char === ' ' ? 'pre' : 'normal',
            transformOrigin: 'top center',
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
};

export default TextReveal;
