import Link from 'next/link';
import { api, formatDate, formatNgn } from '@/lib/api';

export const metadata = {
  title: 'Events — Computicket Nigeria',
};

export default async function EventsPage() {
  const events = await api.listEvents().catch(() => []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">All events</h1>
      {events.length === 0 ? (
        <p className="text-gray-500">No events available right now.</p>
      ) : (
        <ul className="space-y-4">
          {events.map((event) => {
            const minPrice = Math.min(...event.ticketTypes.map((t) => t.priceKobo));
            return (
              <li key={event.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                <Link href={`/events/${event.slug}`} className="flex justify-between items-start">
                  <div>
                    <div className="text-xs text-brand font-medium">{event.organizer.name}</div>
                    <h2 className="mt-1 text-lg font-semibold">{event.title}</h2>
                    <div className="mt-1 text-sm text-gray-600">{event.venue}, {event.city}</div>
                    <div className="text-sm text-gray-600">{formatDate(event.startsAt)}</div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-gray-500">From</div>
                    <div className="font-semibold">{formatNgn(minPrice)}</div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
