'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { API_URL, formatNgn } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface Analytics {
  organizer: { slug: string; name: string };
  range: { from: string; to: string; days: number };
  totals: {
    paidOrders: number;
    refundedOrders: number;
    grossKobo: number;
    refundedKobo: number;
    netKobo: number;
    ticketsSold: number;
    averageOrderKobo: number;
    refundRatePct: number;
  };
  daily: Array<{ date: string; orders: number; revenueKobo: number; ticketsSold: number }>;
  ordersByHour: Array<{ hour: number; orders: number }>;
  topEvents: Array<{
    slug: string;
    title: string;
    sold: number;
    capacity: number;
    sellThroughPct: number;
    revenueKobo: number;
  }>;
}

export default function AnalyticsPage() {
  const params = useParams<{ slug: string }>();
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError('Sign in required.');
      return;
    }
    setData(null);
    setError(null);
    try {
      const res = await fetch(
        `${API_URL}/dashboard/organizers/${params.slug}/analytics?days=${days}`,
        { headers: { authorization: `Bearer ${token}` }, cache: 'no-store' },
      );
      if (!res.ok) throw new Error((await res.json()).message ?? `HTTP ${res.status}`);
      setData((await res.json()) as Analytics);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn\'t load analytics');
    }
  }, [params.slug, days]);

  useEffect(() => { void load(); }, [load]);

  if (error) {
    return <div className="max-w-6xl mx-auto px-4 py-12 text-red-600">{error}</div>;
  }
  if (!data) {
    return <div className="max-w-6xl mx-auto px-4 py-12 text-gray-500">Loading…</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Link href={`/dashboard/o/${params.slug}`} className="text-sm text-brand-dark hover:underline">
            ← Back to dashboard
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">{data.organizer.name} · analytics</h1>
          <p className="text-sm text-gray-500">
            Last {data.range.days} day{data.range.days === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex gap-2" role="tablist" aria-label="Range">
          {[7, 30, 90, 365].map((d) => (
            <button
              key={d}
              role="tab"
              aria-selected={days === d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-sm rounded-md border ${
                days === d ? 'bg-brand text-white border-brand' : 'border-gray-300 text-gray-700'
              }`}
            >
              {d === 365 ? '1y' : `${d}d`}
            </button>
          ))}
        </div>
      </div>

      <section className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Gross revenue" value={formatNgn(data.totals.grossKobo)} />
        <StatCard label="Net (after refunds)" value={formatNgn(data.totals.netKobo)} />
        <StatCard label="Paid orders" value={data.totals.paidOrders.toLocaleString('en-NG')} />
        <StatCard label="Tickets sold" value={data.totals.ticketsSold.toLocaleString('en-NG')} />
        <StatCard label="Avg. order value" value={formatNgn(data.totals.averageOrderKobo)} />
        <StatCard
          label="Refund rate"
          value={`${data.totals.refundRatePct.toFixed(1)}%`}
          // 5%+ refund rate is worth flagging — colour the value red.
          danger={data.totals.refundRatePct >= 5}
        />
        <StatCard label="Refunded" value={formatNgn(data.totals.refundedKobo)} />
        <StatCard label="Refunded orders" value={data.totals.refundedOrders.toLocaleString('en-NG')} />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Revenue by day</h2>
        <RevenueChart daily={data.daily} />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Orders by hour (UTC)</h2>
        <p className="text-sm text-gray-500 mb-2">When buyers are checking out — useful for timing pushes + ad spend.</p>
        <HourChart hourly={data.ordersByHour} />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Top events by revenue</h2>
        {data.topEvents.length === 0 ? (
          <p className="text-gray-500 mt-2">No events yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {data.topEvents.map((e) => (
              <li key={e.slug} className="rounded-lg border border-gray-200 p-4 bg-white">
                <div className="flex justify-between items-baseline gap-4">
                  <div className="min-w-0">
                    <Link href={`/events/${e.slug}`} className="font-medium hover:underline truncate block">
                      {e.title}
                    </Link>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {e.sold.toLocaleString('en-NG')} / {e.capacity.toLocaleString('en-NG')} sold ·
                      {' '}
                      {e.sellThroughPct.toFixed(1)}% sell-through
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatNgn(e.revenueKobo)}</div>
                  </div>
                </div>
                <div
                  className="mt-3 h-1.5 rounded bg-gray-100 overflow-hidden"
                  role="progressbar"
                  aria-label={`${e.title} sell-through`}
                  aria-valuenow={Math.round(e.sellThroughPct)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full bg-brand"
                    style={{ width: `${Math.min(100, e.sellThroughPct)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${danger ? 'text-red-600' : ''}`}>{value}</div>
    </div>
  );
}

function RevenueChart({ daily }: { daily: Analytics['daily'] }) {
  const max = Math.max(1, ...daily.map((d) => d.revenueKobo));
  // Inline SVG sparkline + per-bucket CSS bars. Avoids pulling in a
  // chart library for what's effectively two-dozen rectangles.
  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-end gap-[2px] h-32" role="img" aria-label="Revenue per day">
        {daily.map((d) => {
          const h = Math.max(2, Math.round((d.revenueKobo / max) * 120));
          return (
            <div
              key={d.date}
              className="flex-1 bg-brand/80 rounded-t-sm relative group"
              style={{ height: h }}
              title={`${d.date}: ${formatNgn(d.revenueKobo)} from ${d.orders} order${d.orders === 1 ? '' : 's'}`}
            >
              <span className="sr-only">
                {d.date}: {formatNgn(d.revenueKobo)} from {d.orders} orders
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>{daily[0]?.date}</span>
        <span>{daily[daily.length - 1]?.date}</span>
      </div>
    </div>
  );
}

function HourChart({ hourly }: { hourly: Analytics['ordersByHour'] }) {
  const max = Math.max(1, ...hourly.map((h) => h.orders));
  return (
    <div className="mt-2 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-end gap-1 h-24" role="img" aria-label="Orders by hour of day, UTC">
        {hourly.map((h) => {
          const heightPct = Math.round((h.orders / max) * 100);
          return (
            <div key={h.hour} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-100 rounded relative" style={{ height: 80 }}>
                <div
                  className="absolute bottom-0 left-0 right-0 bg-brand rounded-b"
                  style={{ height: `${Math.max(2, heightPct)}%` }}
                  title={`${h.hour.toString().padStart(2, '0')}:00 UTC — ${h.orders} order${h.orders === 1 ? '' : 's'}`}
                />
              </div>
              <span className="mt-1 text-[10px] text-gray-500">
                {h.hour.toString().padStart(2, '0')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
