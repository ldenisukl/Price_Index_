import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        surface: '#111827',
        surfaceLight: '#1f2937',
        accent: '#4f46e5',
        accentSoft: '#c7d2fe',
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444'
      },
      boxShadow: {
        glow: '0 20px 70px rgba(79, 70, 229, 0.15)'
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
};

export default config;
