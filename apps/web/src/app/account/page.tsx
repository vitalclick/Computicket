'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Icon, type IconName } from '@/components/Icon';
import { api, formatDate, formatNgn, ticketQrUrl } from '@/lib/api';
import { getToken, signOut } from '@/lib/auth';
import { phForId } from '@/lib/design-data';

type Order = Awaited<ReturnType<typeof api.myOrders>>[number];

type TabId = 'overview' | 'tickets' | 'wallet' | 'settings';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'tickets',  label: 'My tickets' },
  { id: 'wallet',   label: 'Wallet' },
  { id: 'settings', label: 'Settings' },
];

const SUGGESTIONS: Array<{ title: string; sub: string; price: string; match: string }> = [
  { title: 'Sunset cruise · Sat 6pm',  sub: 'Pairs with your weekend plans',     price: '₦35,000', match: '96%' },
  { title: 'Nike Art Gallery tour',     sub: 'For art lovers',                    price: '₦8,000',  match: '91%' },
  { title: 'Quilox brunch · Sun 1pm',   sub: 'Walking distance from Eko Hotel',   price: '₦28,000', match: '88%' },
];

const NOTIFICATIONS: Array<{ title: string; sub: string; when: string; icon: IconName }> = [
  { title: 'Payment confirmed', sub: 'Latest ticket order', when: '2 min ago', icon: 'check' },
  { title: 'Price alert',       sub: 'LOS→ABV dropped ₦8,500', when: '1h',      icon: 'arrowDown' },
  { title: 'Earned points',     sub: 'From your last checkout', when: '5h',     icon: 'gift' },
  { title: 'Group invite',      sub: 'Tobi added you to Burna VIP', when: '1d', icon: 'user' },
];

export default function AccountPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>('overview');
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [walletKobo, setWalletKobo] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/signin?next=/account');
      return;
    }
    Promise.all([api.me(token), api.myOrders(token)])
      .then(([me, os]) => {
        setEmail(me.email);
        setName(me.name ?? null);
        setOrders(os);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
    api
      .walletOverview(token)
      .then((w) => setWalletKobo(w.balanceKobo))
      .catch(() => undefined);
  }, [router]);

  const paid = useMemo(
    () => (orders ?? []).filter((o) => o.status === 'PAID'),
    [orders],
  );
  const upcoming = useMemo(
    () =>
      paid
        .filter((o) => new Date(o.event.startsAt) > new Date())
        .sort((a, b) => new Date(a.event.startsAt).getTime() - new Date(b.event.startsAt).getTime()),
    [paid],
  );
  const next = upcoming[0];
  const totalTickets = paid.reduce((acc, o) => acc + o.ticketCount, 0);
  const yearSpend = paid
    .filter((o) => new Date(o.createdAt).getFullYear() === new Date().getFullYear())
    .reduce((acc, o) => acc + o.totalKobo, 0);

  function handleSignOut() {
    signOut();
    router.replace('/');
  }

  if (error) {
    return (
      <div className="wrap" style={{ paddingTop: 64, paddingBottom: 96 }}>
        <p style={{ color: 'var(--danger)' }}>{error}</p>
      </div>
    );
  }
  if (orders === null) {
    return (
      <div className="wrap" style={{ paddingTop: 64, paddingBottom: 96 }}>
        <p className="muted">Loading…</p>
      </div>
    );
  }

  const displayName = name?.split(' ')[0] ?? email?.split('@')[0] ?? 'there';
  const allTickets = paid.flatMap((o) =>
    o.tickets.map((t) => ({
      ...t,
      orderId: o.id,
      event: o.event,
    })),
  );

  const stats = [
    { label: 'Upcoming',     value: String(upcoming.length), sub: 'events & trips',   icon: 'calendar' as const },
    { label: 'Wallet',       value: walletKobo !== null ? formatNgn(walletKobo) : '—', sub: 'available', icon: 'wallet' as const },
    { label: 'Total tickets', value: String(totalTickets), sub: 'across all orders', icon: 'qr' as const },
    { label: 'Saved',        value: '—',  sub: 'events watched', icon: 'heart' as const },
    { label: 'This year',    value: yearSpend > 0 ? formatNgn(yearSpend) : '₦0', sub: 'booked', icon: 'chart' as const },
  ];

  return (
    <div className="page-enter">
      <section
        className="nebula"
        style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--line)' }}
      >
        <div
          className="wrap"
          style={{ paddingTop: 48, paddingBottom: 40, position: 'relative' }}
        >
          <div className="between">
            <div>
              <div className="eyebrow mb-2">Welcome back</div>
              <h1 className="h-1" style={{ margin: 0, fontSize: 56 }}>
                Hey <span className="serif accent-text">{displayName}</span>,
                {upcoming.length > 0
                  ? ` ${upcoming.length} thing${upcoming.length === 1 ? '' : 's'} to look forward to.`
                  : ' your next adventure awaits.'}
              </h1>
            </div>
            <div className="row gap-3">
              <span className="pill-stat">Member</span>
              <Link href="/account/security" className="btn btn-ghost">
                <Icon name="settings" size={14} /> Preferences
              </Link>
            </div>
          </div>

          <div className="row mt-8" style={{ gap: 16 }}>
            {stats.map((s) => (
              <div
                key={s.label}
                className="card glass"
                style={{ flex: 1, padding: 18 }}
              >
                <div
                  className="row gap-2 muted"
                  style={{ alignItems: 'center', fontSize: 11 }}
                >
                  <Icon name={s.icon} size={12} /> <span className="eyebrow">{s.label}</span>
                </div>
                <div className="h-2 tnum mt-2" style={{ fontSize: 28 }}>
                  {s.value}
                </div>
                <div className="text-xs muted mt-1">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap" style={{ paddingTop: 32, paddingBottom: 96 }}>
        <div className="row" style={{ borderBottom: '1px solid var(--line)', marginBottom: 32 }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                padding: '14px 18px',
                borderBottom: `2px solid ${tab === t.id ? 'var(--accent)' : 'transparent'}`,
                background: 'transparent',
                border: 0,
                cursor: 'pointer',
                color: tab === t.id ? 'var(--ink)' : 'var(--ink-3)',
                fontSize: 13.5,
                fontWeight: tab === t.id ? 600 : 500,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)',
            gap: 32,
            alignItems: 'flex-start',
          }}
        >
          <div className="col gap-6">
            <div className="between">
              <h2 className="h-3" style={{ margin: 0 }}>
                Your tickets
              </h2>
              <span className="text-sm muted">
                {paid.length === 0
                  ? 'No bookings yet'
                  : `${paid.length} paid order${paid.length === 1 ? '' : 's'} · ${totalTickets} ticket${
                      totalTickets === 1 ? '' : 's'
                    }`}
              </span>
            </div>
            {next ? (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div
                  className={`ph ${phForId(next.event.slug)} ph-noise`}
                  style={{ height: 200, position: 'relative' }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(180deg, transparent 30%, oklch(0 0 0 / .85))',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: 24,
                      right: 24,
                      bottom: 24,
                      color: 'white',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                    }}
                  >
                    <div>
                      <div
                        className="mono text-xs"
                        style={{ opacity: 0.85, letterSpacing: '.16em' }}
                      >
                        NEXT UP · {formatDate(next.event.startsAt).toUpperCase()}
                      </div>
                      <div className="serif" style={{ fontSize: 36, lineHeight: 1.05, marginTop: 6 }}>
                        {next.event.title}
                      </div>
                      <div className="text-sm mt-1" style={{ opacity: 0.85 }}>
                        {next.event.venue} · {next.event.city}
                      </div>
                    </div>
                    {next.tickets[0] ? (
                      <div
                        className="card glass"
                        style={{ padding: 10, borderRadius: 'var(--r-2)' }}
                      >
                        <img
                          src={ticketQrUrl(next.tickets[0].code)}
                          alt="QR ticket"
                          width={64}
                          height={64}
                          style={{ display: 'block', borderRadius: 4 }}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
                <div
                  style={{
                    padding: 24,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr) auto',
                    gap: 20,
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div className="text-xs muted">Tickets</div>
                    <div className="h-4 mt-1">{next.ticketCount}</div>
                  </div>
                  <div>
                    <div className="text-xs muted">Status</div>
                    <div className="h-4 mt-1 accent-text">{next.status}</div>
                  </div>
                  <div>
                    <div className="text-xs muted">Order</div>
                    <div className="h-4 mt-1 mono">{next.paystackRef.slice(-8)}</div>
                  </div>
                  <div className="row gap-2">
                    <Link
                      href={`/events/${next.event.slug}`}
                      className="btn btn-ghost btn-sm"
                    >
                      Event page
                    </Link>
                    {next.tickets[0] ? (
                      <a
                        href={ticketQrUrl(next.tickets[0].code)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-accent btn-sm"
                      >
                        View QR <Icon name="qr" size={13} />
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: 32, textAlign: 'center' }}>
                <Icon name="calendar" size={28} />
                <div className="h-3 mt-3">Nothing booked yet</div>
                <p className="muted mt-2">
                  Browse the marketplace and grab your first ticket.
                </p>
                <Link href="/events" className="btn btn-accent mt-4">
                  Browse events <Icon name="arrow" size={14} />
                </Link>
              </div>
            )}

            {upcoming.length > 1 ? (
              <div className="card" style={{ padding: 24 }}>
                <div className="between mb-4">
                  <div className="h-3">Upcoming · {upcoming.length}</div>
                  <span className="text-sm muted">{paid.length} paid orders</span>
                </div>
                <div className="col gap-3">
                  {upcoming.slice(1, 6).map((o) => (
                    <Link
                      key={o.id}
                      href={`/events/${o.event.slug}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '80px minmax(0,1fr) auto auto',
                        gap: 16,
                        alignItems: 'center',
                        padding: 12,
                        borderRadius: 'var(--r-3)',
                        background: 'var(--surface-2)',
                      }}
                    >
                      <div
                        className={`ph ${phForId(o.event.slug)} ph-noise`}
                        style={{
                          aspectRatio: '1.4',
                          borderRadius: 'var(--r-2)',
                          position: 'relative',
                        }}
                      >
                        <span
                          className="badge badge-soon"
                          style={{
                            position: 'absolute',
                            top: 6,
                            left: 6,
                            background: 'oklch(0 0 0 / .6)',
                            color: 'white',
                            fontSize: 9,
                          }}
                        >
                          Ticket
                        </span>
                      </div>
                      <div>
                        <div className="fw-600" style={{ fontSize: 14 }}>
                          {o.event.title}
                        </div>
                        <div className="text-xs muted mt-1">
                          {o.event.venue} · {formatDate(o.event.startsAt)}
                        </div>
                      </div>
                      <div className="text-xs accent-text mono">{o.ticketCount}× ticket</div>
                      <Icon name="chevron" size={13} />
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <div
              className="card"
              style={{
                padding: 24,
                background: 'linear-gradient(135deg, var(--accent-soft), transparent)',
                border: '1px solid oklch(0.68 0.18 152 / .3)',
              }}
            >
              <div className="row gap-3 mb-4">
                <div className="ai-dot" style={{ width: 24, height: 24 }} />
                <div>
                  <div className="eyebrow accent-text">Compass intelligence</div>
                  <div className="h-3 mt-1">Three things I think you&apos;ll love this weekend</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                {SUGGESTIONS.map((s) => (
                  <div
                    key={s.title}
                    className="card"
                    style={{ padding: 16, background: 'var(--surface)' }}
                  >
                    <div className="ai-pill" style={{ fontSize: 10 }}>
                      <span className="ai-dot" /> {s.match} match
                    </div>
                    <div className="fw-600 mt-3" style={{ fontSize: 14 }}>
                      {s.title}
                    </div>
                    <div className="text-xs muted mt-1">{s.sub}</div>
                    <div className="between mt-4">
                      <span className="tnum fw-500 text-sm">{s.price}</span>
                      <Link
                        href="/events"
                        className="text-sm accent-text fw-500"
                        style={{ fontWeight: 500 }}
                      >
                        Book ↗
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {allTickets.length > 0 ? (
              <div className="card" style={{ padding: 24 }}>
                <div className="between mb-4">
                  <div>
                    <div className="eyebrow mb-2">Digital Ticket Vault</div>
                    <h3 className="h-3" style={{ margin: 0 }}>
                      Digital vault · {allTickets.length} active pass
                      {allTickets.length === 1 ? '' : 'es'}
                    </h3>
                  </div>
                </div>
                <div className="rail">
                  {allTickets.slice(0, 8).map((t, i) => (
                    <a
                      key={t.id}
                      href={ticketQrUrl(t.code)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card"
                      style={{ width: 200, padding: 0, overflow: 'hidden', flexShrink: 0 }}
                    >
                      <div
                        className={`ph ${phForId(t.event.slug)} ph-noise`}
                        style={{ height: 100, position: 'relative' }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background:
                              'linear-gradient(180deg, transparent 40%, oklch(0 0 0 / .85))',
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            left: 10,
                            bottom: 8,
                            color: 'white',
                            fontSize: 11,
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          TICKET · {String(i + 1).padStart(2, '0')}/{String(allTickets.length).padStart(2, '0')}
                        </div>
                      </div>
                      <div
                        style={{
                          padding: '12px 14px',
                          display: 'grid',
                          gridTemplateColumns: 'minmax(0,1fr) auto',
                          gap: 8,
                          alignItems: 'center',
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div
                            className="text-xs fw-600"
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {t.event.title}
                          </div>
                          <div
                            className="text-xs mono muted"
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {t.code}
                          </div>
                        </div>
                        <Icon name="qr" size={20} />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="col gap-4">
            <div className="card" style={{ padding: 0, overflow: 'hidden', border: 0 }}>
              <div
                style={{
                  padding: 24,
                  position: 'relative',
                  overflow: 'hidden',
                  background:
                    'linear-gradient(135deg, oklch(0.18 0.12 152), oklch(0.16 0.12 175), oklch(0.18 0.15 200))',
                  color: 'white',
                  minHeight: 180,
                }}
              >
                <div className="stars" />
                <div className="between" style={{ position: 'relative' }}>
                  <div>
                    <div
                      className="mono text-xs"
                      style={{ opacity: 0.7, letterSpacing: '.18em' }}
                    >
                      WALLET BALANCE
                    </div>
                    <div className="h-1 tnum mt-2" style={{ fontSize: 40 }}>
                      {walletKobo !== null ? formatNgn(walletKobo) : '…'}
                    </div>
                  </div>
                  <Icon name="wallet" size={22} />
                </div>
                <div className="between mt-6" style={{ position: 'relative' }}>
                  <div className="text-xs" style={{ opacity: 0.8 }}>
                    Account · {email}
                  </div>
                  <div className="text-xs" style={{ opacity: 0.8 }}>
                    {name ?? ''}
                  </div>
                </div>
              </div>
              <div className="row" style={{ padding: 12, gap: 8 }}>
                <Link
                  href="/account/wallet"
                  className="btn btn-ghost btn-sm"
                  style={{ flex: 1 }}
                >
                  <Icon name="plus" size={13} /> Top up
                </Link>
                <Link
                  href="/account/wallet"
                  className="btn btn-ghost btn-sm"
                  style={{ flex: 1 }}
                >
                  History
                </Link>
              </div>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <div className="eyebrow mb-3">Recent activity</div>
              <div className="col gap-3 text-sm">
                {NOTIFICATIONS.map((n) => (
                  <div key={n.title} className="row gap-3" style={{ alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        background: 'var(--accent-soft)',
                        color: 'var(--accent)',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon name={n.icon} size={14} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="fw-500" style={{ fontSize: 13 }}>
                        {n.title}
                      </div>
                      <div className="text-xs muted">{n.sub}</div>
                    </div>
                    <div className="text-xs muted-2">{n.when}</div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm muted row gap-2"
              style={{ justifyContent: 'center', padding: 14, cursor: 'pointer', background: 'none', border: 0 }}
            >
              <Icon name="logout" size={13} /> Sign out
            </button>
          </aside>
        </div>
      </section>
    </div>
  );
}
