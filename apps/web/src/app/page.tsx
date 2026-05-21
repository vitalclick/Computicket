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
          <p className="mt-4 text-lg max-w-xl">
            Nigeria&apos;s all-in-one booking platform for events, concerts, bus travel and more.
          </p>
          <Link
            href="/events"
            className="inline-block mt-8 bg-white text-brand-dark font-medium px-6 py-3 rounded-md hover:bg-gray-100"
          >
            Browse events
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl font-bold">Upcoming events</h2>
          <Link href="/events" className="text-sm text-brand-dark hover:underline">View all →</Link>
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
                  <div className="text-xs text-brand-dark font-medium">{event.organizer.name}</div>
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

      <section className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-14 grid md:grid-cols-[1.2fr,1fr] gap-10 items-center">
          <div>
            <p className="text-sm uppercase tracking-wide text-brand-dark font-medium">For organizers</p>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold">
              An event management app like Computicket is essential for modern event planning.
            </h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              It centralizes control, automates ticket sales, and provides real-time analytics —
              saving you time and maximizing revenue.
            </p>
            <Link
              href="/for-organizers"
              className="inline-block mt-5 bg-brand text-white font-medium px-5 py-2.5 rounded-md hover:bg-brand-dark"
            >
              See how it works
            </Link>
          </div>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="text-brand-dark">●</span>
              <span><strong>Centralized control</strong> — events, ticket tiers, refunds, scanning, payouts in one dashboard.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-dark">●</span>
              <span><strong>Automated sales</strong> — Paystack checkout, atomic inventory holds, direct settlement to your bank.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-dark">●</span>
              <span><strong>Real-time analytics</strong> — sold counts, revenue, paid orders, all live as money lands.</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
