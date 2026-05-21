import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://computicket.ng';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Authed/sensitive surfaces don't belong in a crawler index.
        disallow: ['/account', '/dashboard', '/admin', '/oauth', '/scan'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
