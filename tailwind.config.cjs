/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#FAFAF9',
          secondary: '#FFFFFF',
          tertiary: '#F5F5F4',
        },
        border: {
          default: '#E7E5E4',
          strong: '#D6D3D1',
        },
        navy: {
          50: '#F0F4F2',
          100: '#D8E0DD',
          500: '#8BA39A',
          700: '#5C6D66',
          900: '#405953',
        },
        success: '#7BA082',
        warning: '#DCA060',
        danger: '#C88A8A',
        xp: '#9C89B8',
        gold: '#D6C5A1',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08)',
        'card-strong': '0 8px 24px rgba(0,0,0,0.10)',
      },
      borderRadius: {
        card: '12px',
        badge: '6px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
