import type { MetadataRoute } from 'next';
import { API_URL } from '@/lib/api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://computicket.ng';

interface EventStub {
  slug: string;
  startsAt: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/events`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/buses`, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${SITE_URL}/for-organizers`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE_URL}/signup`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/signin`, changeFrequency: 'monthly', priority: 0.3 },
  ];

  // Pull live events from the API. Fail open: a sitemap with just the
  // static routes is better than a 500.
  let events: EventStub[] = [];
  try {
    const res = await fetch(`${API_URL}/events`, { next: { revalidate: 600 } });
    if (res.ok) events = (await res.json()) as EventStub[];
  } catch {
    /* ignore */
  }

  const eventEntries: MetadataRoute.Sitemap = events.map((e) => ({
    url: `${SITE_URL}/events/${e.slug}`,
    lastModified: new Date(e.startsAt),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  return [...staticRoutes, ...eventEntries];
}
