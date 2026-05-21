import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api, formatDate } from '@/lib/api';
import { BuyForm } from './BuyForm';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await api.getEvent(slug).catch(() => null);
  if (!event) return { title: 'Event not found' };
  const description = event.description?.slice(0, 200)
    ?? `${event.title} at ${event.venue}, ${event.city} on ${formatDate(event.startsAt)}. Get tickets on Computicket Nigeria.`;
  return {
    title: event.title,
    description,
    openGraph: {
      type: 'article',
      title: event.title,
      description,
      images: event.coverUrl ? [{ url: event.coverUrl }] : undefined,
    },
    twitter: {
      card: event.coverUrl ? 'summary_large_image' : 'summary',
      title: event.title,
      description,
      images: event.coverUrl ? [event.coverUrl] : undefined,
    },
    alternates: {
      canonical: `/events/${event.slug}`,
    },
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await api.getEvent(slug).catch(() => null);
  if (!event) notFound();

  // schema.org Event payload for richer search snippets and social previews.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description ?? undefined,
    startDate: event.startsAt,
    endDate: event.endsAt,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.venue,
      address: { '@type': 'PostalAddress', addressLocality: event.city, addressCountry: 'NG' },
    },
    organizer: { '@type': 'Organization', name: event.organizer.name },
    offers: event.ticketTypes.map((t) => ({
      '@type': 'Offer',
      name: t.name,
      price: (t.priceKobo / 100).toFixed(2),
      priceCurrency: 'NGN',
      availability:
        t.sold < t.capacity ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
    })),
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="text-sm text-brand-dark font-medium">{event.organizer.name}</div>
      <h1 className="mt-2 text-3xl md:text-4xl font-bold">{event.title}</h1>
      <div className="mt-3 text-gray-600">
        <div>{event.venue}, {event.city}</div>
        <div>
          <time dateTime={event.startsAt}>{formatDate(event.startsAt)}</time>
          {' — '}
          <time dateTime={event.endsAt}>{formatDate(event.endsAt)}</time>
        </div>
      </div>

      {event.description && (
        <p className="mt-6 text-gray-700 leading-relaxed">{event.description}</p>
      )}

      <BuyForm event={event} />
    </div>
  );
}
