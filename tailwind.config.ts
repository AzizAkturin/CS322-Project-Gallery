import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
        'instrument-serif': ['var(--font-instrument-serif)', 'serif'],
      },
      letterSpacing: {
        superwide: '0.25em',
      },
      colors: {
        brand: {
          50:  '#f0faf5',
          100: '#d3ede0',
          200: '#a6d9bf',
          300: '#70bf99',
          400: '#3d9e72',
          500: '#007030',
          600: '#00602a',
          700: '#154733',
          800: '#0f3325',
          900: '#082018',
        },
      },
      boxShadow: {
        card: '0 18px 40px rgba(0,0,0,0.04)',
        'card-hover': '0 22px 60px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
};

export default config;
