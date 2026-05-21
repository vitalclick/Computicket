'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

export default function BusRoutesPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [routes, setRoutes] = useState<Awaited<ReturnType<typeof api.listBusRoutes>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [duration, setDuration] = useState('');

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace('/signin?next=' + encodeURIComponent(`/dashboard/o/${params.slug}/bus-routes`));
      return;
    }
    try {
      setRoutes(await api.listBusRoutes(token, params.slug));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }, [router, params.slug]);

  useEffect(() => {
    load();
  }, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy('create');
    try {
      await api.createBusRoute(getToken()!, params.slug, {
        fromCity,
        toCity,
        durationMinutes: parseInt(duration, 10) * 60,
      });
      setFromCity(''); setToCity(''); setDuration('');
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(null);
    }
  }

  async function deactivate(id: string) {
    if (!confirm('Deactivate this route? Existing trips remain, but no new trips can use it.')) return;
    setBusy(id);
    try {
      await api.deactivateBusRoute(getToken()!, params.slug, id);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-16 text-gray-500">Loading…</div>;
  if (error) return <div className="max-w-3xl mx-auto px-4 py-16 text-red-600">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href={`/dashboard/o/${params.slug}`} className="text-sm text-gray-500 hover:text-brand-dark">
        ← {params.slug}
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Bus routes</h1>
      <p className="text-sm text-gray-600 mt-1">
        Define the inter-city routes you operate. Once a route exists, create each trip as a draft event
        of type Bus trip linked to the route.
      </p>

      <form onSubmit={create} className="mt-8 border border-gray-200 rounded-lg p-4 bg-white space-y-3">
        <h2 className="font-semibold">New route</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <input required placeholder="From (e.g. Lagos)"
            value={fromCity} onChange={(e) => setFromCity(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
          <input required placeholder="To (e.g. Abuja)"
            value={toCity} onChange={(e) => setToCity(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
          <input required type="number" min="1" placeholder="Duration (hours)"
            value={duration} onChange={(e) => setDuration(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </div>
        <button type="submit" disabled={busy === 'create'}
          className="bg-brand text-white px-4 py-2 rounded-md hover:bg-brand-dark disabled:bg-gray-300 text-sm">
          {busy === 'create' ? 'Creating…' : 'Add route'}
        </button>
      </form>

      <h2 className="mt-10 text-lg font-semibold">Routes ({routes.length})</h2>
      {routes.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">No routes yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {routes.map((r) => (
            <li key={r.id} className="border border-gray-200 rounded-lg p-3 bg-white flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold">{r.fromCity} → {r.toCity}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {Math.round(r.durationMinutes / 60)}h trip · {r._count.trips} trip{r._count.trips === 1 ? '' : 's'}
                </div>
              </div>
              {r.active ? (
                <button onClick={() => deactivate(r.id)} disabled={busy === r.id}
                  className="text-red-600 hover:underline text-xs disabled:text-gray-400">
                  Deactivate
                </button>
              ) : (
                <span className="text-xs text-gray-400">inactive</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
