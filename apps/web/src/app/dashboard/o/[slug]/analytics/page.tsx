'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import {
  DashboardError,
  DashboardLoading,
  DashboardPageHeader,
} from '@/components/dashboard/DashboardPageHeader';
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
      setError(e instanceof Error ? e.message : "Couldn't load analytics");
    }
  }, [params.slug, days]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) return <DashboardError message={error} />;
  if (!data) return <DashboardLoading />;

  return (
    <div className="page-enter">
      <DashboardPageHeader
        orgSlug={params.slug}
        eyebrow="Reports"
        title={`${data.organizer.name} · Analytics`}
        sub={`Last ${data.range.days} day${data.range.days === 1 ? '' : 's'} of revenue, orders, refunds and top events.`}
        actions={
          <div role="tablist" aria-label="Range" className="row gap-1">
            {[7, 30, 90, 365].map((d) => (
              <button
                key={d}
                type="button"
                role="tab"
                aria-selected={days === d}
                onClick={() => setDays(d)}
                className={`chip ${days === d ? 'active' : ''}`}
              >
                {d === 365 ? '1y' : `${d}d`}
              </button>
            ))}
          </div>
        }
      />

      <section className="wrap" style={{ paddingBottom: 24 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
          }}
        >
          <StatCard label="Gross revenue" value={formatNgn(data.totals.grossKobo)} />
          <StatCard label="Net (after refunds)" value={formatNgn(data.totals.netKobo)} />
          <StatCard label="Paid orders" value={data.totals.paidOrders.toLocaleString('en-NG')} />
          <StatCard label="Tickets sold" value={data.totals.ticketsSold.toLocaleString('en-NG')} />
          <StatCard label="Avg. order value" value={formatNgn(data.totals.averageOrderKobo)} />
          <StatCard
            label="Refund rate"
            value={`${data.totals.refundRatePct.toFixed(1)}%`}
            danger={data.totals.refundRatePct >= 5}
          />
          <StatCard label="Refunded" value={formatNgn(data.totals.refundedKobo)} />
          <StatCard
            label="Refunded orders"
            value={data.totals.refundedOrders.toLocaleString('en-NG')}
          />
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 24 }}>
        <h2 className="h-3 mb-4">Revenue by day</h2>
        <RevenueChart daily={data.daily} />
      </section>

      <section className="wrap" style={{ paddingBottom: 24 }}>
        <h2 className="h-3">Orders by hour (UTC)</h2>
        <p className="text-sm muted mb-3" style={{ marginTop: 4 }}>
          When buyers are checking out — useful for timing pushes + ad spend.
        </p>
        <HourChart hourly={data.ordersByHour} />
      </section>

      <section className="wrap" style={{ paddingBottom: 64 }}>
        <h2 className="h-3 mb-4">Top events by revenue</h2>
        {data.topEvents.length === 0 ? (
          <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)' }}>
            No events in this range.
          </div>
        ) : (
          <div className="col gap-2">
            {data.topEvents.map((e) => (
              <div
                key={e.slug}
                className="card"
                style={{
                  padding: 18,
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0,1fr) auto',
                  gap: 16,
                  alignItems: 'center',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <Link
                    href={`/events/${e.slug}`}
                    className="fw-600"
                    style={{ fontSize: 15, display: 'block' }}
                  >
                    {e.title}
                  </Link>
                  <div className="text-xs muted mt-1">
                    {e.sold.toLocaleString('en-NG')} /{' '}
                    {e.capacity.toLocaleString('en-NG')} sold ·{' '}
                    {e.sellThroughPct.toFixed(1)}% sell-through
                  </div>
                  <div
                    className="mt-3"
                    style={{
                      height: 4,
                      background: 'var(--surface-2)',
                      borderRadius: 99,
                      overflow: 'hidden',
                    }}
                    role="progressbar"
                    aria-label={`${e.title} sell-through`}
                    aria-valuenow={Math.round(e.sellThroughPct)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, e.sellThroughPct)}%`,
                        background:
                          e.sellThroughPct >= 90
                            ? 'var(--danger)'
                            : 'linear-gradient(90deg, var(--accent), oklch(0.65 0.18 180))',
                      }}
                    />
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="h-3 tnum">{formatNgn(e.revenueKobo)}</div>
                  <Link
                    href={`/events/${e.slug}`}
                    className="text-xs accent-text mt-1"
                    style={{ display: 'inline-block' }}
                  >
                    View public <Icon name="arrow" size={11} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="card" style={{ padding: 22 }}>
      <div className="eyebrow">{label}</div>
      <div
        className="h-1 tnum mt-2"
        style={{ fontSize: 28, lineHeight: 1, color: danger ? 'var(--danger)' : undefined }}
      >
        {value}
      </div>
    </div>
  );
}

function RevenueChart({ daily }: { daily: Analytics['daily'] }) {
  const max = Math.max(1, ...daily.map((d) => d.revenueKobo));
  return (
    <div className="card" style={{ padding: 20 }}>
      <div
        style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 128 }}
        role="img"
        aria-label="Revenue per day"
      >
        {daily.map((d) => {
          const h = Math.max(2, Math.round((d.revenueKobo / max) * 120));
          return (
            <div
              key={d.date}
              title={`${d.date}: ${formatNgn(d.revenueKobo)} from ${d.orders} order${d.orders === 1 ? '' : 's'}`}
              style={{
                flex: 1,
                height: h,
                background:
                  'linear-gradient(180deg, var(--accent), oklch(0.55 0.16 180))',
                borderRadius: '4px 4px 0 0',
              }}
            >
              <span className="sr-only">
                {d.date}: {formatNgn(d.revenueKobo)} from {d.orders} orders
              </span>
            </div>
          );
        })}
      </div>
      <div className="row mt-3 muted text-xs" style={{ justifyContent: 'space-between' }}>
        <span>{daily[0]?.date}</span>
        <span>{daily[daily.length - 1]?.date}</span>
      </div>
    </div>
  );
}

function HourChart({ hourly }: { hourly: Analytics['ordersByHour'] }) {
  const max = Math.max(1, ...hourly.map((h) => h.orders));
  return (
    <div className="card" style={{ padding: 20 }}>
      <div
        style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 100 }}
        role="img"
        aria-label="Orders by hour of day, UTC"
      >
        {hourly.map((h) => {
          const heightPct = Math.round((h.orders / max) * 100);
          return (
            <div
              key={h.hour}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <div
                style={{
                  width: '100%',
                  background: 'var(--surface-2)',
                  borderRadius: 'var(--r-1)',
                  position: 'relative',
                  height: 80,
                }}
              >
                <div
                  title={`${h.hour.toString().padStart(2, '0')}:00 UTC — ${h.orders} order${h.orders === 1 ? '' : 's'}`}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: `${Math.max(2, heightPct)}%`,
                    background: 'var(--accent)',
                    borderRadius: '0 0 var(--r-1) var(--r-1)',
                  }}
                />
              </div>
              <span className="mt-1 muted" style={{ fontSize: 10, fontFamily: 'var(--font-mono)' }}>
                {h.hour.toString().padStart(2, '0')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
