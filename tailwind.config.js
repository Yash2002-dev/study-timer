/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAF9F5',
          100: '#F2F0E9', // Global background
          200: '#EAE6DC', // Flat card surfaces / pills
          300: '#DDD8CB',
          400: '#C8C2B3',
        },
        charcoal: {
          950: '#111111',
          900: '#1A1A1A', // Primary text
          800: '#2C2C2B',
          700: '#454542',
          600: '#5F5E58', // Secondary body text
          500: '#7A7972', // Muted text
          400: '#9E9D95',
        },
        moss: {
          900: '#1B2721',
          800: '#2E4036', // Primary active accent & buttons
          700: '#3D5447',
          600: '#4D6B5A',
          500: '#648572',
          200: '#C8D7CE',
          100: '#E0EAE3',
          50: '#F0F5F2',
        },
        earth: {
          sand: '#E4DFD3',
          clay: '#8C5A41',
          ochre: '#A67C52',
          sage: '#5B7065',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      transitionTimingFunction: {
        'precision': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'calm': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }
    },
  },
  plugins: [],
}