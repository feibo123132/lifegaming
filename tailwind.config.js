/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 波普艺术配色
        pop: {
          yellow: '#FFD93D',
          yellowLight: '#FFE066',
          yellowDark: '#E6C235',
          black: '#1A1A1A',
          white: '#FFFFFF',
          red: '#FF4757',
          redDark: '#E03E4C',
          blue: '#4834DF',
          blueLight: '#5A4EE0',
          green: '#2ED573',
          greenDark: '#26B862',
          purple: '#A55EEA',
          purpleDark: '#8F4FD4',
          orange: '#FF6B35',
          pink: '#FF6B9D',
          cyan: '#48DBFB',
        },
      },
      borderRadius: {
        'pop': '20px',
        'pop-lg': '28px',
        'pop-xl': '36px',
      },
      boxShadow: {
        'pop': '6px 6px 0px 0px #1A1A1A',
        'pop-sm': '4px 4px 0px 0px #1A1A1A',
        'pop-lg': '8px 8px 0px 0px #1A1A1A',
        'pop-hover': '8px 8px 0px 0px #1A1A1A',
        'pop-active': '2px 2px 0px 0px #1A1A1A',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'wiggle': 'wiggle 0.5s ease-in-out infinite',
        'pop-in': 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(2deg)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        popIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
