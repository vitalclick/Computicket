import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#008751', // Nigerian green
          dark: '#005a35',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
