/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#030509',
          900: '#070C16',
          850: '#0B1322',
          800: '#101B2E',
          700: '#192843',
          600: '#253C66',
        },
        cyan: {
          DEFAULT: '#00E5FF',
          dim: '#0099AA',
          glow: 'rgba(0, 229, 255, 0.3)',
        },
        amber: {
          DEFAULT: '#FFB703',
          dim: '#B38102',
          glow: 'rgba(255, 183, 3, 0.3)',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'Consolas', 'monospace'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
