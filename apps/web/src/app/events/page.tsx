'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { API_URL, type EventSummary, formatDate, formatNgn } from '@/lib/api';

async function fetchEvents(q: string): Promise<EventSummary[]> {
  const url = q.trim()
    ? `${API_URL}/events/search?q=${encodeURIComponent(q.trim())}`
    : `${API_URL}/events`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return [];
  return (await res.json()) as EventSummary[];
}

export default function EventsPage() {
  const [q, setQ] = useState('');
  const [events, setEvents] = useState<EventSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    setLoading(true);
    debounce.current = setTimeout(async () => {
      const rows = await fetchEvents(q);
      setEvents(rows);
      setLoading(false);
    }, 200);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [q]);

  const hasResults = !!events && events.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">All events</h1>
      <div className="mb-8">
        <label htmlFor="event-search" className="sr-only">Search events</label>
        <input
          id="event-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by event, venue or city…"
          className="w-full max-w-xl rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      {loading && events === null ? (
        <p className="text-gray-500">Loading…</p>
      ) : !hasResults ? (
        <p className="text-gray-500">
          {q.trim() ? `No events match "${q.trim()}".` : 'No events available right now.'}
        </p>
      ) : (
        <ul className="space-y-4">
          {events!.map((event) => <EventRow key={event.id} event={event} />)}
        </ul>
      )}
    </div>
  );
}

function EventRow({ event }: { event: EventSummary }) {
  const minPrice = useMemo(
    () => Math.min(...event.ticketTypes.map((t) => t.priceKobo)),
    [event.ticketTypes],
  );
  return (
    <li className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
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
}
