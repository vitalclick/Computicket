'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { api, formatNgn, formatDate } from '@/lib/api';
import type { DashboardOverview } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { NewEventForm } from './NewEventForm';

export default function OrganizerDashboard() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [publishing, setPublishing] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace('/dashboard/signin');
      return;
    }
    setError(null);
    try {
      const data = await api.dashboardOverview(token, params.slug);
      setOverview(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [params.slug, router]);

  useEffect(() => {
    load();
  }, [load]);

  async function publish(slug: string) {
    setPublishing(slug);
    try {
      const token = getToken()!;
      await api.publishEvent(token, slug);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Publish failed');
    } finally {
      setPublishing(null);
    }
  }

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-16 text-gray-500">Loading…</div>;
  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-red-600">{error}</div>
        <Link href="/dashboard" className="text-sm text-brand-dark hover:underline mt-4 inline-block">
          ← Back to organizers
        </Link>
      </div>
    );
  }
  if (!overview) return null;

  const totalRevenue = overview.events.reduce((acc, e) => acc + e.revenueKobo, 0);
  const totalSold = overview.events.reduce((acc, e) => acc + e.sold, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link href="/dashboard" className="text-sm text-gray-500 hover:text-brand-dark">
        ← Organizers
      </Link>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="mt-2 text-2xl font-bold">{overview.organizer.name}</h1>
          <div className="text-xs text-gray-500 mt-0.5">
            {overview.organizer.slug} · {overview.organizer.status}
          </div>
        </div>
        <div className="mt-3 flex gap-4 flex-wrap">
          <Link href={`/dashboard/o/${params.slug}/analytics`} className="text-sm text-brand-dark hover:underline">Analytics →</Link>
          <Link href={`/dashboard/o/${params.slug}/team`} className="text-sm text-brand-dark hover:underline">Team →</Link>
          <Link href={`/dashboard/o/${params.slug}/promo-codes`} className="text-sm text-brand-dark hover:underline">Promo codes →</Link>
          <Link href={`/dashboard/o/${params.slug}/bus-routes`} className="text-sm text-brand-dark hover:underline">Bus routes →</Link>
          <Link href={`/dashboard/o/${params.slug}/payouts`} className="text-sm text-brand-dark hover:underline">Payouts →</Link>
          <Link href={`/dashboard/o/${params.slug}/developers`} className="text-sm text-brand-dark hover:underline">Developers →</Link>
        </div>
      </div>

      <div className="mt-6 grid sm:grid-cols-3 gap-3">
        <Stat label="Events" value={overview.events.length.toString()} />
        <Stat label="Tickets sold" value={totalSold.toLocaleString()} />
        <Stat label="Gross revenue" value={formatNgn(totalRevenue)} />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Events</h2>
        <button
          onClick={() => setShowNew((v) => !v)}
          className="bg-brand text-white text-sm px-4 py-2 rounded-md hover:bg-brand-dark"
        >
          {showNew ? 'Cancel' : '+ New event'}
        </button>
      </div>

      {showNew && (
        <div className="mt-4">
          <NewEventForm
            organizerSlug={params.slug}
            onCreated={() => {
              setShowNew(false);
              load();
            }}
          />
        </div>
      )}

      {overview.events.length === 0 ? (
        <p className="mt-6 text-gray-500">No events yet. Create your first one.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {overview.events.map((e) => (
            <li key={e.id} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{e.title}</div>
                  <div className="text-sm text-gray-600 mt-0.5">
                    {e.venue}, {e.city} · {formatDate(e.startsAt)}
                  </div>
                  <div className="text-xs mt-2 inline-flex items-center gap-2">
                    <span className={statusBadge(e.status)}>{e.status}</span>
                    <span className="text-gray-500">
                      {e.sold.toLocaleString()} / {e.capacity.toLocaleString()} sold
                      {e.held > 0 ? ` (+${e.held} held)` : ''}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold">{formatNgn(e.revenueKobo)}</div>
                  <div className="text-xs text-gray-500">{e.paidOrders} paid orders</div>
                  <div className="mt-2 flex gap-3 justify-end">
                    {e.status === 'DRAFT' && (
                      <button
                        onClick={() => publish(e.slug)}
                        disabled={publishing === e.slug}
                        className="text-sm text-brand-dark hover:underline disabled:text-gray-400"
                      >
                        {publishing === e.slug ? 'Publishing…' : 'Publish'}
                      </button>
                    )}
                    {e.status === 'PUBLISHED' && (
                      <Link
                        href={`/events/${e.slug}`}
                        target="_blank"
                        className="text-sm text-brand-dark hover:underline"
                      >
                        View public ↗
                      </Link>
                    )}
                    {e.paidOrders > 0 && (
                      <Link
                        href={`/dashboard/o/${params.slug}/events/${e.slug}/orders`}
                        className="text-sm text-brand-dark hover:underline"
                      >
                        Orders ({e.paidOrders})
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function statusBadge(status: string): string {
  const base = 'px-2 py-0.5 rounded-md text-xs font-medium';
  switch (status) {
    case 'PUBLISHED':
      return `${base} bg-green-50 text-green-700`;
    case 'DRAFT':
      return `${base} bg-gray-100 text-gray-700`;
    case 'CANCELLED':
      return `${base} bg-red-50 text-red-700`;
    default:
      return `${base} bg-gray-100 text-gray-700`;
  }
}
