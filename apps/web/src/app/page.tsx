import Link from 'next/link';
import { api, formatDate, formatNgn } from '@/lib/api';

export default async function HomePage() {
  let events: Awaited<ReturnType<typeof api.listEvents>> = [];
  let error: string | null = null;
  try {
    events = await api.listEvents();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load events';
  }

  return (
    <div>
      <section className="bg-brand text-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-bold max-w-2xl">
            Tickets, travel and experiences — all in one place.
          </h1>
          <p className="mt-4 text-lg opacity-90 max-w-xl">
            Nigeria&apos;s all-in-one booking platform for events, concerts, bus travel and more.
          </p>
          <Link
            href="/events"
            className="inline-block mt-8 bg-white text-brand font-medium px-6 py-3 rounded-md hover:bg-gray-100"
          >
            Browse events
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl font-bold">Upcoming events</h2>
          <Link href="/events" className="text-sm text-brand hover:underline">View all →</Link>
        </div>

        {error && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Can&apos;t reach the API yet ({error}). Start it with <code>pnpm dev</code>.
          </div>
        )}

        {!error && events.length === 0 && (
          <div className="text-gray-500">No published events yet. Seed the database with <code>pnpm db:seed</code>.</div>
        )}

        <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.slice(0, 6).map((event) => {
            const minPrice = Math.min(...event.ticketTypes.map((t) => t.priceKobo));
            return (
              <li key={event.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
                <Link href={`/events/${event.slug}`} className="block p-5">
                  <div className="text-xs text-brand font-medium">{event.organizer.name}</div>
                  <h3 className="mt-1 text-lg font-semibold">{event.title}</h3>
                  <div className="mt-2 text-sm text-gray-600">{event.venue}, {event.city}</div>
                  <div className="text-sm text-gray-600">{formatDate(event.startsAt)}</div>
                  <div className="mt-4 text-sm">From <span className="font-semibold">{formatNgn(minPrice)}</span></div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
