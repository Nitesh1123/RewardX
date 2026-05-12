/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#F59E0B',
        primaryDark: '#D97706',
        dark: '#0A0A0F',
        darkCard: '#111118',
        darkBorder: '#1E1E2E',
        glass: 'rgba(255,255,255,0.05)',
        textPrimary: '#F8F8FF',
        textMuted: '#6B7280',
        success: '#10B981',
        danger: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #F59E0B, #D97706)',
        'radial-gold': 'radial-gradient(circle at top, rgba(245,158,11,0.22), transparent 34%)',
      },
      boxShadow: {
        gold: '0 0 24px rgba(245,158,11,0.3)',
        soft: '0 20px 80px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
}
