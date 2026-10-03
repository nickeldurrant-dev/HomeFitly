/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // HomeFitly brand green (matches the native iOS app's appPrimary #33734D)
        brand: {
          50: '#F1F7F3',
          100: '#DEEBE3',
          200: '#BFD9CB',
          500: '#4A8A63',
          600: '#33734D',
          700: '#2A5F40',
          800: '#224E35',
        },
        // Warm terracotta accent (#C67B5C) for highlights, badges, and the ideas pillar
        clay: {
          50: '#FBF3EC',
          100: '#F6E4D3',
          200: '#ECC9A8',
          500: '#D08A5E',
          600: '#C67B5C',
          700: '#A05F43',
        },
      },
      screens: {
        'xs': '475px',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
    },
  },
  plugins: [],
};
