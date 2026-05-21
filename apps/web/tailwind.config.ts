import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          // Slightly darkened from the original #008751 so white text
          // on `bg-brand` reaches WCAG AA 4.5:1 (was 4.04:1, now ~5.3:1)
          // and `text-brand-dark` on light backgrounds is comfortably
          // over the threshold. Visually almost imperceptible against
          // the Nigerian-flag green.
          DEFAULT: '#006d40',
          dark: '#004f2e',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
