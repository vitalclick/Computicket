import { notFound } from 'next/navigation';
import { api, formatDate } from '@/lib/api';
import { BuyForm } from './BuyForm';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await api.getEvent(slug).catch(() => null);
  if (!event) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-sm text-brand font-medium">{event.organizer.name}</div>
      <h1 className="mt-2 text-3xl md:text-4xl font-bold">{event.title}</h1>
      <div className="mt-3 text-gray-600">
        <div>{event.venue}, {event.city}</div>
        <div>{formatDate(event.startsAt)} — {formatDate(event.endsAt)}</div>
      </div>

      {event.description && (
        <p className="mt-6 text-gray-700 leading-relaxed">{event.description}</p>
      )}

      <BuyForm event={event} />
    </div>
  );
}
