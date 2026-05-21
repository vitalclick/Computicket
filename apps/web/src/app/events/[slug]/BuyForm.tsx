'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/components/Icon';
import type { EventDetail } from '@/lib/api';
import { api, formatNgn } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface Props {
  event: EventDetail;
}

export function BuyForm({ event }: Props) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [payFromWallet, setPayFromWallet] = useState(false);
  const [walletBalanceKobo, setWalletBalanceKobo] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    setSignedIn(true);
    api
      .me(token)
      .then((me) => {
        setEmail((curr) => curr || me.email);
        setName((curr) => curr || me.name || '');
      })
      .catch(() => undefined);
    api
      .walletOverview(token)
      .then((w) => setWalletBalanceKobo(w.balanceKobo))
      .catch(() => undefined);
  }, []);

  const items = event.ticketTypes
    .map((tt) => ({ tt, qty: quantities[tt.id] ?? 0 }))
    .filter((i) => i.qty > 0);

  const subtotal = useMemo(
    () => items.reduce((acc, i) => acc + i.tt.priceKobo * i.qty, 0),
    [items],
  );
  const fee = Math.round(subtotal * 0.015);
  const total = subtotal + fee;
  const ticketCount = items.reduce((acc, i) => acc + i.qty, 0);

  function bump(ttId: string, delta: number, max: number) {
    setQuantities((q) => {
      const next = Math.max(0, Math.min(max, (q[ttId] ?? 0) + delta));
      return { ...q, [ttId]: next };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (items.length === 0) {
      setError('Pick at least one ticket.');
      return;
    }
    setSubmitting(true);
    try {
      const origin = window.location.origin;
      const token = getToken() ?? undefined;
      const res = await api.createOrder(
        {
          eventSlug: event.slug,
          buyerEmail: email,
          buyerName: name || undefined,
          promoCode: promoCode.trim() || undefined,
          payFromWallet,
          callbackUrl: `${origin}/checkout/return`,
          items: items.map((i) => ({ ticketTypeId: i.tt.id, quantity: i.qty })),
        },
        token,
      );
      if ('paidFromWallet' in res && res.paidFromWallet) {
        window.location.href = `/checkout/return?reference=${res.order.paystackRef}`;
      } else if ('paystack' in res) {
        window.location.href = res.paystack.authorizationUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: 24 }}>
      <div className="between mb-3">
        <div className="eyebrow">Select ticket tier</div>
        <span className="ai-pill">
          <span className="ai-dot" />
          <span>Verified inventory</span>
        </span>
      </div>

      <div className="col gap-2">
        {event.ticketTypes.map((tt) => {
          const remaining = tt.capacity - tt.sold;
          const soldOut = remaining <= 0;
          const qty = quantities[tt.id] ?? 0;
          const selected = qty > 0;
          return (
            <div
              key={tt.id}
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--r-3)',
                border: `1px solid ${selected ? 'var(--accent)' : 'var(--line)'}`,
                background: selected ? 'var(--accent-soft)' : 'var(--surface-2)',
                opacity: soldOut ? 0.5 : 1,
              }}
            >
              <div className="between">
                <div style={{ minWidth: 0 }}>
                  <div className="row gap-2" style={{ alignItems: 'center' }}>
                    <span className="fw-600">{tt.name}</span>
                    {soldOut ? (
                      <span className="badge badge-soon">Sold out</span>
                    ) : remaining < 10 ? (
                      <span
                        className="badge"
                        style={{ background: 'var(--danger)', color: 'white' }}
                      >
                        {remaining} left
                      </span>
                    ) : null}
                  </div>
                  {tt.description ? (
                    <div className="text-xs muted mt-1">{tt.description}</div>
                  ) : null}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div className="h-4 tnum">{formatNgn(tt.priceKobo)}</div>
                  <div
                    className="row gap-2 mt-2"
                    style={{ alignItems: 'center', justifyContent: 'flex-end' }}
                  >
                    <button
                      type="button"
                      className="icon-btn"
                      style={{ width: 28, height: 28 }}
                      onClick={() => bump(tt.id, -1, Math.min(10, remaining))}
                      disabled={qty === 0}
                      aria-label={`Decrease ${tt.name}`}
                    >
                      <Icon name="minus" size={12} />
                    </button>
                    <span
                      className="fw-600 tnum"
                      style={{ minWidth: 18, textAlign: 'center' }}
                    >
                      {qty}
                    </span>
                    <button
                      type="button"
                      className="icon-btn"
                      style={{ width: 28, height: 28 }}
                      onClick={() => bump(tt.id, 1, Math.min(10, remaining))}
                      disabled={soldOut || qty >= Math.min(10, remaining)}
                      aria-label={`Increase ${tt.name}`}
                    >
                      <Icon name="plus" size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hr mt-4 mb-4" />

      <div className="col gap-3">
        <label>
          <span className="text-xs muted">Email</span>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input mt-1"
          />
        </label>
        <label>
          <span className="text-xs muted">Full name (optional)</span>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input mt-1"
          />
        </label>
        <label>
          <span className="text-xs muted">Promo code (optional)</span>
          <input
            type="text"
            placeholder="DISCOUNT20"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            className="input mt-1 mono"
            style={{ textTransform: 'uppercase' }}
          />
        </label>
      </div>

      {signedIn && walletBalanceKobo !== null ? (
        <label
          className="mt-3"
          style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13 }}
        >
          <input
            type="checkbox"
            checked={payFromWallet}
            disabled={walletBalanceKobo < total}
            onChange={(e) => setPayFromWallet(e.target.checked)}
            style={{ accentColor: 'var(--accent)', marginTop: 2 }}
          />
          <span>
            Pay from wallet ({formatNgn(walletBalanceKobo)} available)
            {walletBalanceKobo < total ? (
              <span style={{ color: 'var(--danger)', marginLeft: 4 }}>
                — insufficient for this purchase
              </span>
            ) : null}
          </span>
        </label>
      ) : null}

      {subtotal > 0 ? (
        <div className="mt-4" style={{ paddingTop: 14, borderTop: '1px solid var(--line)' }}>
          <div className="between text-sm">
            <span className="muted">
              Subtotal · {ticketCount} ticket{ticketCount === 1 ? '' : 's'}
            </span>
            <span className="tnum">{formatNgn(subtotal)}</span>
          </div>
          <div className="between text-sm mt-1">
            <span className="muted">Service fee (1.5%)</span>
            <span className="tnum">{formatNgn(fee)}</span>
          </div>
          <div
            className="between mt-3"
            style={{ paddingTop: 12, borderTop: '1px solid var(--line)' }}
          >
            <span className="fw-600">Total</span>
            <span className="h-3 tnum">{formatNgn(total)}</span>
          </div>
        </div>
      ) : null}

      {!signedIn ? (
        <p className="mt-3 text-xs muted">
          <Link href={`/signin?next=/events/${event.slug}`} className="accent-text">
            Sign in
          </Link>{' '}
          to use wallet balance, see your order history, and earn Compass points.
        </p>
      ) : null}

      {error ? (
        <div
          className="mt-3 text-sm"
          style={{
            color: 'var(--danger)',
            background: 'oklch(0.65 0.22 25 / 0.1)',
            padding: '10px 12px',
            borderRadius: 'var(--r-2)',
          }}
        >
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitting || subtotal === 0 || !email}
        className="btn btn-accent btn-lg mt-4"
        style={{ width: '100%', justifyContent: 'center' }}
      >
        {submitting ? (
          <>Redirecting to Paystack…</>
        ) : payFromWallet && walletBalanceKobo !== null && walletBalanceKobo >= total ? (
          <>
            <Icon name="wallet" size={14} /> Pay {subtotal > 0 ? formatNgn(total) : ''} from wallet
          </>
        ) : (
          <>
            <Icon name="lock" size={14} /> Pay {subtotal > 0 ? formatNgn(total) : ''} securely
          </>
        )}
      </button>

      <div
        className="row gap-2 mt-3"
        style={{ justifyContent: 'center', color: 'var(--ink-3)', fontSize: 11 }}
      >
        <Icon name="shield" size={12} /> Buyer protection · Refund if cancelled
      </div>
    </form>
  );
}
