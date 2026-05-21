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
      // /icon.png is 512×512 from the centered-and-padded master so it
      // never distorts when browsers scale it down for the tab favicon.
      // /logo.png is the same source at 256×256 — used in the site
      // header and as the inline mark in transactional emails.
      { src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/logo.png', sizes: '256x256', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
