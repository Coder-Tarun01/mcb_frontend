/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        gray: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          '"Fira Sans"',
          '"Droid Sans"',
          '"Helvetica Neue"',
          'sans-serif',
        ],
        mono: [
          'source-code-pro',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Courier New"',
          'monospace',
        ],
      },
      screens: {
        'xs': '375px',
        'sm': '480px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1200px',
        '2xl': '1400px',
        '3xl': '1920px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      keyframes: {
        floatShape: {
          '0%, 100%': {
            transform: 'translateY(0px) rotate(0deg) scale(1)',
          },
          '25%': {
            transform: 'translateY(-20px) rotate(90deg) scale(1.1)',
          },
          '50%': {
            transform: 'translateY(-40px) rotate(180deg) scale(0.9)',
          },
          '75%': {
            transform: 'translateY(-20px) rotate(270deg) scale(1.05)',
          },
        },
        particleFloat: {
          '0%, 100%': {
            transform: 'translateY(0px) scale(0)',
            opacity: '0',
          },
          '50%': {
            transform: 'translateY(-100px) scale(1)',
            opacity: '1',
          },
        },
        contentGlow: {
          '0%': {
            opacity: '0.3',
            transform: 'scale(1)',
          },
          '100%': {
            opacity: '0.6',
            transform: 'scale(1.05)',
          },
        },
        subtitleGlow: {
          '0%': {
            textShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
            transform: 'translateY(0px)',
          },
          '100%': {
            textShadow: '0 4px 16px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.2)',
            transform: 'translateY(-1px)',
          },
        },
        titleGlow: {
          '0%': {
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          },
          '100%': {
            textShadow: '0 8px 30px rgba(30, 58, 138, 0.2)',
          },
        },
        underlinePulse: {
          '0%, 100%': {
            width: '80px',
            opacity: '0.8',
          },
          '50%': {
            width: '120px',
            opacity: '1',
          },
        },
        iconGlow: {
          '0%, 100%': {
            opacity: '0.5',
            transform: 'translate(-50%, -50%) scale(1)',
          },
          '50%': {
            opacity: '0.8',
            transform: 'translate(-50%, -50%) scale(1.1)',
          },
        },
        floatIcon: {
          '0%, 100%': {
            transform: 'translateY(0px) rotateX(0deg) rotateY(0deg)',
          },
          '25%': {
            transform: 'translateY(-4px) rotateX(1deg) rotateY(0.5deg)',
          },
          '50%': {
            transform: 'translateY(-8px) rotateX(0deg) rotateY(0deg)',
          },
          '75%': {
            transform: 'translateY(-4px) rotateX(-1deg) rotateY(-0.5deg)',
          },
        },
        spin: {
          '0%': {
            transform: 'rotate(0deg)',
          },
          '100%': {
            transform: 'rotate(360deg)',
          },
        },
        slideIn: {
          'from': {
            opacity: '0',
            transform: 'translateY(-10px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideInDown: {
          'from': {
            opacity: '0',
            transform: 'translateY(-20px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideInLeft: {
          'from': {
            transform: 'translateX(-100%)',
            opacity: '0',
          },
          'to': {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
      },
      animation: {
        'floatShape': 'floatShape 8s ease-in-out infinite',
        'particleFloat': 'particleFloat 4s ease-in-out infinite',
        'contentGlow': 'contentGlow 6s ease-in-out infinite alternate',
        'subtitleGlow': 'subtitleGlow 4s ease-in-out infinite alternate',
        'titleGlow': 'titleGlow 3s ease-in-out infinite alternate',
        'underlinePulse': 'underlinePulse 2s ease-in-out infinite',
        'iconGlow': 'iconGlow 2s ease-in-out infinite',
        'floatIcon': 'floatIcon 6s ease-in-out infinite',
        'spin': 'spin 1s linear infinite',
        'slideIn': 'slideIn 0.3s ease',
        'slideInDown': 'slideInDown 0.3s ease',
        'slideInLeft': 'slideInLeft 0.3s ease-out',
      },
      animationDelay: {
        '0': '0s',
        '500': '0.5s',
        '1000': '1s',
        '1500': '1.5s',
        '2000': '2s',
        '2500': '2.5s',
        '3000': '3s',
        '3500': '3.5s',
        '4000': '4s',
        '4500': '4.5s',
      },
    },
  },
  plugins: [],
}
