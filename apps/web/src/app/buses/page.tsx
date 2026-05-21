'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, formatNgn } from '@/lib/api';

type Trip = Awaited<ReturnType<typeof api.searchBuses>>[number];

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-NG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function BusesPage() {
  const [cities, setCities] = useState<string[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.busCities().then((r) => setCities(r.cities)).catch(() => undefined);
    // Initial: show next 60 days of all trips so the page isn't empty
    api.searchBuses({}).then((t) => setTrips(t)).catch(() => undefined);
  }, []);

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const t = await api.searchBuses({
        from: from || undefined,
        to: to || undefined,
        date: date || undefined,
      });
      setTrips(t);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">Bus travel</h1>
      <p className="mt-2 text-gray-700">Search inter-city trips and book a seat in minutes.</p>

      <form onSubmit={search} className="mt-6 grid sm:grid-cols-4 gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <label className="text-sm">
          <span className="block text-xs text-gray-600 mb-1">From</span>
          <select value={from} onChange={(e) => setFrom(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white">
            <option value="">Any</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-xs text-gray-600 mb-1">To</span>
          <select value={to} onChange={(e) => setTo(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white">
            <option value="">Any</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-xs text-gray-600 mb-1">Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2" />
        </label>
        <div className="flex items-end">
          <button type="submit" disabled={loading}
            className="w-full bg-brand text-white font-medium px-4 py-2 rounded-md hover:bg-brand-dark disabled:bg-gray-300">
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>
      </form>

      {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

      <h2 className="mt-10 text-lg font-semibold">
        {trips.length === 0 ? 'No trips match' : `${trips.length} trip${trips.length === 1 ? '' : 's'}`}
      </h2>

      <ul className="mt-4 space-y-3">
        {trips.map((t) => {
          const minPrice = Math.min(...t.ticketTypes.map((tt) => tt.priceKobo));
          return (
            <li key={t.slug} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition">
              <Link href={`/events/${t.slug}`} className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xs text-brand-dark font-medium">{t.organizer.name}</div>
                  <div className="mt-1 text-lg font-semibold">
                    {t.route ? `${t.route.fromCity} → ${t.route.toCity}` : t.title}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Depart {formatDateTime(t.departsAt)} · Arrive {formatDateTime(t.arrivesAt)}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Boarding: {t.boardingTerminal}
                    {t.route && ` · ${formatDuration(t.route.durationMinutes)} trip`}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-gray-500 text-xs">From</div>
                  <div className="font-semibold">{formatNgn(minPrice)}</div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
