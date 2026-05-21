import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Computicket Nigeria',
    short_name: 'Computicket',
    description:
      "Nigeria's all-in-one ticketing platform. Book events, concerts, bus travel, flights and more.",
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#008751',
    icons: [
      // Next.js generates resized variants from /icon.png automatically;
      // /logo.png is the same source served from /public for any home-
      // screen consumer that wants a high-res original.
      { src: '/icon.png', sizes: 'any', type: 'image/png', purpose: 'any' },
      { src: '/logo.png', sizes: '1200x1204', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
