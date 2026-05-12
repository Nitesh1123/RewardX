export const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export const fadeInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'backOut' } },
};

export const slideInSidebar = {
  hidden: { x: -280 },
  visible: { x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export const cardHover = {
  rest: { scale: 1, boxShadow: '0 0 0px rgba(245,158,11,0)' },
  hover: {
    scale: 1.02,
    boxShadow: '0 0 24px rgba(245,158,11,0.25)',
    transition: { duration: 0.2 },
  },
};

export const numberCount = (from, to, duration = 1.5) => ({ from, to, duration });
