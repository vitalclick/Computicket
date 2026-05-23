import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { GroupShareCallout } from './GroupShareCallout';
import { api, formatNgn, ticketQrUrl } from '@/lib/api';

interface PageProps {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}

export default async function CheckoutReturnPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const reference = params.reference ?? params.trxref;

  if (!reference) {
    return (
      <div className="wrap" style={{ paddingTop: 64, paddingBottom: 96, textAlign: 'center' }}>
        <h1 className="h-2">Missing reference</h1>
        <p className="muted mt-2">We couldn&apos;t find your transaction.</p>
        <Link href="/" className="btn btn-ghost mt-6">
          Back home
        </Link>
      </div>
    );
  }

  const order = await api.getOrderByReference(reference).catch(() => null);

  if (!order) {
    return (
      <div className="wrap" style={{ paddingTop: 64, paddingBottom: 96, textAlign: 'center' }}>
        <h1 className="h-2">Order not found</h1>
        <p className="muted mt-2">
          Reference: <code className="mono">{reference}</code>
        </p>
      </div>
    );
  }

  if (order.status !== 'PAID') {
    return (
      <div className="wrap" style={{ paddingTop: 64, paddingBottom: 96, maxWidth: 720 }}>
        <div
          className="card"
          style={{
            padding: 28,
            background:
              'linear-gradient(135deg, oklch(0.80 0.16 75 / .2), oklch(0.70 0.18 50 / .15))',
            border: '1px solid oklch(0.70 0.18 50 / .35)',
          }}
        >
          <div className="row gap-2 mb-2" style={{ alignItems: 'center' }}>
            <span className="dot dot-live" style={{ background: 'oklch(0.70 0.18 50)' }} />
            <span className="eyebrow" style={{ color: 'oklch(0.45 0.16 50)' }}>
              Awaiting confirmation
            </span>
          </div>
          <h1 className="h-3">Confirming your payment…</h1>
          <p className="muted mt-2" style={{ lineHeight: 1.6 }}>
            Status: <strong className="mono">{order.status}</strong>. This page updates
            once we receive Paystack&apos;s confirmation. If this takes more than a
            minute, refresh.
          </p>
          <form action="" className="mt-4">
            <button type="submit" className="btn btn-accent">
              <Icon name="refresh" size={13} /> Refresh
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap" style={{ paddingTop: 48, paddingBottom: 96, maxWidth: 720 }}>
      <div
        className="card"
        style={{
          padding: 28,
          background:
            'linear-gradient(135deg, var(--accent-soft), oklch(0.55 0.18 180 / .15))',
          border: '1px solid var(--accent)',
        }}
      >
        <div className="row gap-2 mb-2" style={{ alignItems: 'center' }}>
          <span
            className="badge"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            Paid
          </span>
          <span className="eyebrow accent-text">Payment received</span>
        </div>
        <h1 className="h-2" style={{ margin: '4px 0 8px' }}>
          You&apos;re going to {order.event.title}
        </h1>
        <div className="muted text-sm" style={{ lineHeight: 1.55 }}>
          {order.event.venue}, {order.event.city} · Total{' '}
          <span className="fw-600 tnum" style={{ color: 'var(--ink)' }}>
            {formatNgn(order.totalKobo)}
          </span>
        </div>
      </div>

      {order.tickets.length > 1 ? (
        <GroupShareCallout
          tickets={order.tickets.map((t) => ({ code: t.code }))}
        />
      ) : null}

      <div className="between mt-8 mb-4">
        <h2 className="h-3" style={{ margin: 0 }}>
          Your tickets
        </h2>
        <span className="text-sm muted">
          {order.tickets.length} ticket{order.tickets.length === 1 ? '' : 's'}
        </span>
      </div>
      <ul className="col gap-3" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {order.tickets.map((t) => (
          <li
            key={t.id}
            className="card"
            style={{
              padding: 16,
              display: 'flex',
              gap: 16,
              alignItems: 'center',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ticketQrUrl(t.code)}
              alt={`QR code for ticket ${t.code}`}
              style={{
                width: 112,
                height: 112,
                borderRadius: 'var(--r-2)',
                background: 'white',
                padding: 6,
                flexShrink: 0,
              }}
            />
            <div style={{ minWidth: 0 }}>
              <div className="eyebrow">{t.status}</div>
              <div className="mono fw-600 mt-1" style={{ fontSize: 14 }}>
                {t.code}
              </div>
              <p className="text-xs muted mt-2" style={{ lineHeight: 1.55 }}>
                Show this QR at the gate. One scan only.
              </p>
              <Link
                href={`/tickets/${t.code}/collectible`}
                className="text-xs accent-text mt-2"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                Open boarding pass <Icon name="arrow" size={11} />
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <div
        className="card mt-6"
        style={{
          padding: 18,
          background: 'var(--surface-2)',
          border: 0,
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
        }}
      >
        <Icon name="shield" size={16} />
        <div className="text-sm" style={{ color: 'var(--ink-2)', lineHeight: 1.55 }}>
          A copy of your tickets has been sent to your email. Forward the message
          to anyone in your party, or open this page from any signed-in device.
        </div>
      </div>
    </div>
  );
}
