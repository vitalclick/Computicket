'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { api, formatNgn, formatDate, type DashboardOverview } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { NewEventForm } from './NewEventForm';

/**
 * Single-organizer dashboard. KPI strip across the top, then the event
 * list with publish + orders actions, then the create-event form
 * (anchored at #new-event so the layout's "+ Create event" button can
 * deep-link straight to it).
 */
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
      router.replace('/signin?next=' + encodeURIComponent(`/dashboard/o/${params.slug}`));
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

  // The DashboardLayout's "+ Create event" link is `#new-event`. Scroll
  // to and expand the form when that anchor is present.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkHash = () => {
      if (window.location.hash === '#new-event') {
        setShowNew(true);
        // Defer scroll until the form has had a chance to render.
        requestAnimationFrame(() => {
          document.getElementById('new-event')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

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

  if (loading) {
    return (
      <div className="wrap" style={{ paddingTop: 64, paddingBottom: 96 }}>
        <p className="muted">Loading…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="wrap" style={{ paddingTop: 64, paddingBottom: 96 }}>
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <Link href="/dashboard" className="btn btn-ghost btn-sm mt-4">
          <Icon name="chevron" size={13} stroke={2} style={{ transform: 'rotate(180deg)' }} />{' '}
          Back to organizers
        </Link>
      </div>
    );
  }
  if (!overview) return null;

  const totalRevenue = overview.events.reduce((acc, e) => acc + e.revenueKobo, 0);
  const totalSold = overview.events.reduce((acc, e) => acc + e.sold, 0);
  const totalCapacity = overview.events.reduce((acc, e) => acc + e.capacity, 0);
  const totalPaidOrders = overview.events.reduce((acc, e) => acc + e.paidOrders, 0);
  const sellThrough =
    totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0;
  const avgOrder = totalPaidOrders > 0 ? totalRevenue / totalPaidOrders : 0;

  const published = overview.events.filter((e) => e.status === 'PUBLISHED');
  const drafts = overview.events.filter((e) => e.status === 'DRAFT');

  return (
    <div className="page-enter">
      <section
        className="wrap"
        style={{ paddingTop: 32, paddingBottom: 24 }}
      >
        <div className="between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="eyebrow mb-2">Promoter Hub</div>
            <h1 className="h-2" style={{ margin: 0 }}>
              {overview.organizer.name}
            </h1>
            <div className="row gap-3 mt-2 muted text-sm">
              <span>
                <span className="mono">{overview.organizer.slug}</span>
              </span>
              <span>·</span>
              <StatusPill status={overview.organizer.status} />
              {overview.organizer.description ? (
                <>
                  <span>·</span>
                  <span style={{ maxWidth: 480 }}>{overview.organizer.description}</span>
                </>
              ) : null}
            </div>
          </div>
          <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
            <Link
              href={`/o/${overview.organizer.slug}`}
              target="_blank"
              className="btn btn-ghost btn-sm"
            >
              <Icon name="eye" size={13} /> Preview public page
            </Link>
            <button
              type="button"
              onClick={() => {
                setShowNew(true);
                requestAnimationFrame(() => {
                  document
                    .getElementById('new-event')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
              }}
              className="btn btn-accent btn-sm"
            >
              <Icon name="plus" size={13} /> New event
            </button>
          </div>
        </div>

        {/* KPI strip */}
        <div
          className="dashboard-kpi-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
            marginTop: 24,
          }}
        >
          <Kpi
            label="Events"
            value={overview.events.length.toLocaleString()}
            sub={`${published.length} live · ${drafts.length} draft`}
            icon="calendar"
          />
          <Kpi
            label="Tickets sold"
            value={totalSold.toLocaleString()}
            sub={
              totalCapacity > 0
                ? `${sellThrough}% of ${totalCapacity.toLocaleString()} capacity`
                : '—'
            }
            icon="qr"
          />
          <Kpi
            label="Gross revenue"
            value={formatNgn(totalRevenue)}
            sub={`${totalPaidOrders.toLocaleString()} paid orders`}
            icon="wallet"
          />
          <Kpi
            label="Avg. order value"
            value={avgOrder > 0 ? formatNgn(Math.round(avgOrder)) : '—'}
            sub="Across paid orders"
            icon="chart"
          />
        </div>
      </section>

      <section className="wrap" style={{ paddingTop: 8, paddingBottom: 64 }}>
        <div className="between mb-4">
          <h2 className="h-3" style={{ margin: 0 }}>
            Events
          </h2>
          <div className="row gap-2 muted text-xs">
            <span>Sorted by upcoming</span>
          </div>
        </div>

        {overview.events.length === 0 ? (
          <div
            className="card"
            style={{
              padding: 48,
              textAlign: 'center',
              background: 'linear-gradient(135deg, var(--accent-soft), transparent)',
              border: '1px dashed var(--line-strong)',
            }}
          >
            <h3 className="h-4" style={{ fontSize: 18 }}>
              No events yet
            </h3>
            <p className="muted mt-2" style={{ maxWidth: 460, margin: '12px auto 0', lineHeight: 1.6 }}>
              Draft an event with multi-tier pricing, then publish when
              you&apos;re ready. We never charge until your first ticket
              sells.
            </p>
            <button
              type="button"
              onClick={() => setShowNew(true)}
              className="btn btn-accent btn-lg mt-6"
            >
              <Icon name="plus" size={14} /> Create your first event
            </button>
          </div>
        ) : (
          <div className="col gap-3">
            {[...overview.events]
              .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
              .map((e) => (
                <EventRow
                  key={e.id}
                  e={e}
                  orgSlug={params.slug}
                  publishing={publishing === e.slug}
                  onPublish={() => publish(e.slug)}
                />
              ))}
          </div>
        )}
      </section>

      {/* Quick links to org sub-tools — discoverability for staff who
          arrive here straight from the org switcher. */}
      <section className="wrap" style={{ paddingBottom: 64 }}>
        <h2 className="h-4 mb-4">Manage</h2>
        <div
          className="dashboard-manage-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}
        >
          <ManageCard
            href={`/dashboard/o/${params.slug}/payouts`}
            icon="wallet"
            title="Payouts"
            body="Connect your bank, see settlement history, manage payout rules."
          />
          <ManageCard
            href={`/dashboard/o/${params.slug}/team`}
            icon="user"
            title="Staff"
            body="Invite Owner / Manager / Finance / Marketing / Scanner / Read-only roles."
          />
          <ManageCard
            href={`/dashboard/o/${params.slug}/analytics`}
            icon="chart"
            title="Reports"
            body="Revenue by day, orders by hour, top events. CSV export."
          />
          <ManageCard
            href={`/dashboard/o/${params.slug}/promo-codes`}
            icon="gift"
            title="Promo codes"
            body="Percentage or fixed-amount discounts, scope per event, max uses + expiry."
          />
          <ManageCard
            href={`/dashboard/o/${params.slug}/bus-routes`}
            icon="bus"
            title="Bus routes"
            body="Define the routes your trips use — Lagos → Abuja, etc."
          />
          <ManageCard
            href={`/dashboard/o/${params.slug}/developers`}
            icon="settings"
            title="Developers"
            body="Per-organizer API keys + signed outbound webhooks."
          />
        </div>
      </section>

      {showNew ? (
        <section id="new-event" className="wrap" style={{ paddingBottom: 96 }}>
          <div className="between mb-4">
            <h2 className="h-3" style={{ margin: 0 }}>
              New event
            </h2>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setShowNew(false)}
            >
              Cancel
            </button>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <NewEventForm
              organizerSlug={params.slug}
              onCreated={() => {
                setShowNew(false);
                load();
              }}
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: 'calendar' | 'qr' | 'wallet' | 'chart';
}) {
  return (
    <div className="card" style={{ padding: 22 }}>
      <div className="row gap-2 muted" style={{ alignItems: 'center', fontSize: 11 }}>
        <Icon name={icon} size={12} /> <span className="eyebrow">{label}</span>
      </div>
      <div className="h-1 tnum mt-2" style={{ fontSize: 32, lineHeight: 1 }}>
        {value}
      </div>
      <div className="text-xs muted mt-2">{sub}</div>
    </div>
  );
}

function ManageCard({
  href,
  icon,
  title,
  body,
}: {
  href: string;
  icon: 'wallet' | 'user' | 'chart' | 'gift' | 'bus' | 'settings';
  title: string;
  body: string;
}) {
  return (
    <Link href={href} className="card card-hover" style={{ padding: 22, display: 'block' }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 'var(--r-2)',
          background: 'var(--accent-soft)',
          color: 'var(--accent)',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Icon name={icon} size={16} />
      </div>
      <div className="h-4 mt-3" style={{ fontSize: 15 }}>
        {title}
      </div>
      <p className="text-xs muted mt-2" style={{ lineHeight: 1.6 }}>
        {body}
      </p>
    </Link>
  );
}

function EventRow({
  e,
  orgSlug,
  publishing,
  onPublish,
}: {
  e: DashboardOverview['events'][number];
  orgSlug: string;
  publishing: boolean;
  onPublish: () => void;
}) {
  const pct = e.capacity > 0 ? Math.round((e.sold / e.capacity) * 100) : 0;
  return (
    <div
      className="card card-hover dashboard-event-row"
      style={{
        padding: 22,
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) auto',
        gap: 24,
        alignItems: 'center',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div className="row gap-2" style={{ alignItems: 'center', marginBottom: 6 }}>
          <StatusPill status={e.status} />
          <span className="text-xs muted">
            {e.venue} · {e.city} · {formatDate(e.startsAt)}
          </span>
        </div>
        <div className="h-4" style={{ fontSize: 17 }}>
          {e.title}
        </div>
        <div className="mt-3" style={{ maxWidth: 480 }}>
          <div
            style={{
              height: 4,
              background: 'var(--surface-2)',
              borderRadius: 99,
              overflow: 'hidden',
            }}
            aria-label={`${pct}% sold`}
          >
            <div
              style={{
                width: `${pct}%`,
                height: '100%',
                background:
                  pct >= 90
                    ? 'var(--danger)'
                    : 'linear-gradient(90deg, var(--accent), oklch(0.65 0.18 180))',
              }}
            />
          </div>
          <div className="row mt-1 muted text-xs" style={{ justifyContent: 'space-between' }}>
            <span>
              {e.sold.toLocaleString()} / {e.capacity.toLocaleString()} sold
              {e.held > 0 ? ` (+${e.held.toLocaleString()} held)` : ''}
            </span>
            <span>{pct}%</span>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <div className="h-3 tnum">{formatNgn(e.revenueKobo)}</div>
        <div className="text-xs muted">{e.paidOrders.toLocaleString()} paid orders</div>
        <div className="row gap-2 mt-3" style={{ justifyContent: 'flex-end' }}>
          {e.status === 'DRAFT' ? (
            <button
              type="button"
              onClick={onPublish}
              disabled={publishing}
              className="btn btn-accent btn-sm"
            >
              {publishing ? 'Publishing…' : 'Publish'}
            </button>
          ) : null}
          {e.status === 'PUBLISHED' ? (
            <Link
              href={`/events/${e.slug}`}
              target="_blank"
              className="btn btn-ghost btn-sm"
            >
              View public <Icon name="arrow" size={12} />
            </Link>
          ) : null}
          {e.paidOrders > 0 ? (
            <Link
              href={`/dashboard/o/${orgSlug}/events/${e.slug}/orders`}
              className="btn btn-ghost btn-sm"
            >
              Orders ({e.paidOrders})
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    PUBLISHED: {
      bg: 'var(--accent-soft)',
      color: 'var(--accent)',
    },
    APPROVED: {
      bg: 'var(--accent-soft)',
      color: 'var(--accent)',
    },
    DRAFT: {
      bg: 'var(--surface-2)',
      color: 'var(--ink-2)',
    },
    PENDING: {
      bg: 'var(--surface-2)',
      color: 'var(--ink-2)',
    },
    CANCELLED: {
      bg: 'oklch(0.65 0.22 25 / 0.12)',
      color: 'var(--danger)',
    },
    SUSPENDED: {
      bg: 'oklch(0.65 0.22 25 / 0.12)',
      color: 'var(--danger)',
    },
  };
  const tone = map[status] ?? { bg: 'var(--surface-2)', color: 'var(--ink-2)' };
  return (
    <span
      className="badge"
      style={{
        background: tone.bg,
        color: tone.color,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}
    >
      {status}
    </span>
  );
}
