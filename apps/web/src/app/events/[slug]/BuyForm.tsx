'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { SeatPicker } from '@/components/SeatPicker';
import type { EventDetail } from '@/lib/api';
import { api, formatNgn } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface Props {
  event: EventDetail;
}

export function BuyForm({ event }: Props) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  // Per-tier seat picks. When a tier has a seatMap, the quantity is
  // derived from seats[tt.id].length and the stepper is hidden.
  const [seats, setSeats] = useState<Record<string, { ids: string[]; labels: string[] }>>({});
  const [seatPickerFor, setSeatPickerFor] = useState<string | null>(null);
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
    .map((tt) => {
      const seated = Boolean(tt.seatMap && tt.seatMap.length > 0);
      const pickedSeats = seats[tt.id]?.ids ?? [];
      const qty = seated ? pickedSeats.length : quantities[tt.id] ?? 0;
      return { tt, qty, seated, seatIds: seated ? pickedSeats : undefined };
    })
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
          items: items.map((i) => ({
            ticketTypeId: i.tt.id,
            quantity: i.qty,
            ...(i.seatIds ? { seatIds: i.seatIds } : {}),
          })),
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
    <form ref={formRef} onSubmit={handleSubmit} className="card" style={{ padding: 24 }}>
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
          const seated = Boolean(tt.seatMap && tt.seatMap.length > 0);
          const seatPick = seats[tt.id];
          const qty = seated ? seatPick?.ids.length ?? 0 : quantities[tt.id] ?? 0;
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
                    {seated ? (
                      <span
                        className="badge"
                        style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                      >
                        Reserved seating
                      </span>
                    ) : null}
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
                  {seated && seatPick && seatPick.labels.length > 0 ? (
                    <div className="text-xs mt-2 mono" style={{ color: 'var(--accent)' }}>
                      Seats: {seatPick.labels.join(', ')}
                    </div>
                  ) : null}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div className="h-4 tnum">{formatNgn(tt.priceKobo)}</div>
                  {seated ? (
                    <button
                      type="button"
                      onClick={() => setSeatPickerFor(tt.id)}
                      disabled={soldOut}
                      className="btn btn-ghost btn-sm mt-2"
                      style={{ padding: '6px 12px' }}
                    >
                      {qty > 0 ? `${qty} seat${qty === 1 ? '' : 's'} · Edit` : 'Pick seats'}
                    </button>
                  ) : (
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
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {seatPickerFor ? (
        <SeatPicker
          ticketTypeId={seatPickerFor}
          max={Math.min(
            10,
            (event.ticketTypes.find((t) => t.id === seatPickerFor)?.capacity ?? 10) -
              (event.ticketTypes.find((t) => t.id === seatPickerFor)?.sold ?? 0),
          )}
          initialSelected={seats[seatPickerFor]?.ids ?? []}
          onClose={() => setSeatPickerFor(null)}
          onConfirm={(ids, labels) => {
            setSeats((s) => ({ ...s, [seatPickerFor]: { ids, labels } }));
            setSeatPickerFor(null);
          }}
        />
      ) : null}

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
        className="btn btn-accent btn-lg mt-4 desktop-only"
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
        className="row gap-2 mt-3 desktop-only"
        style={{ justifyContent: 'center', color: 'var(--ink-3)', fontSize: 11 }}
      >
        <Icon name="shield" size={12} /> Buyer protection · Refund if cancelled
      </div>

      <MobileSwipeToBuy
        total={total}
        ticketCount={ticketCount}
        disabled={submitting || subtotal === 0 || !email}
        submitting={submitting}
        onConfirm={() => formRef.current?.requestSubmit()}
      />
    </form>
  );
}

function MobileSwipeToBuy({
  total,
  ticketCount,
  disabled,
  submitting,
  onConfirm,
}: {
  total: number;
  ticketCount: number;
  disabled: boolean;
  submitting: boolean;
  onConfirm: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const dragging = useRef(false);
  const startX = useRef(0);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const confirmedRef = useRef(false);

  const reset = () => {
    confirmedRef.current = false;
    setProgress(0);
  };

  useEffect(() => {
    if (!submitting) reset();
  }, [submitting]);

  const trackWidth = () => {
    const el = trackRef.current;
    if (!el) return 220;
    return Math.max(120, el.getBoundingClientRect().width - 60);
  };

  const onStart = (clientX: number) => {
    if (disabled || submitting || confirmedRef.current) return;
    dragging.current = true;
    startX.current = clientX;
  };
  const onMove = (clientX: number) => {
    if (!dragging.current) return;
    const dx = clientX - startX.current;
    setProgress(Math.max(0, Math.min(1, dx / trackWidth())));
  };
  const onEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (progress > 0.85 && !confirmedRef.current) {
      confirmedRef.current = true;
      setProgress(1);
      onConfirm();
    } else {
      setProgress(0);
    }
  };

  if (ticketCount === 0) return null;

  return (
    <div
      className="mobile-swipe-bar"
      role="region"
      aria-label="Confirm purchase"
    >
      <div className="between mb-3">
        <div>
          <div className="text-xs muted">
            {ticketCount} ticket{ticketCount === 1 ? '' : 's'}
          </div>
          <div className="h-3 tnum mt-1">{formatNgn(total)}</div>
        </div>
        <div
          className="text-xs muted"
          style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
        >
          <Icon name="shield" size={12} />
          <span>Buyer<br />protected</span>
        </div>
      </div>

      <div
        ref={trackRef}
        className="swipe-track"
        aria-disabled={disabled}
        onMouseDown={(e) => onStart(e.clientX)}
        onMouseMove={(e) => onMove(e.clientX)}
        onMouseUp={onEnd}
        onMouseLeave={() => dragging.current && onEnd()}
        onTouchStart={(e) => onStart(e.touches[0]?.clientX ?? 0)}
        onTouchMove={(e) => onMove(e.touches[0]?.clientX ?? 0)}
        onTouchEnd={onEnd}
      >
        <div className="swipe-label" style={{ opacity: Math.max(0, 1 - progress * 1.4) }}>
          {submitting ? 'Redirecting…' : disabled ? 'Add a ticket to continue' : 'Swipe to buy →'}
        </div>
        <div
          className="swipe-thumb"
          style={{
            transform: `translateX(${progress * (trackWidth())}px)`,
            transition: dragging.current ? 'none' : 'transform .2s',
            animation: progress > 0.05 || submitting ? 'none' : undefined,
          }}
        >
          {submitting ? (
            <span className="swipe-spinner" aria-hidden="true" />
          ) : (
            <Icon name="arrow" size={18} />
          )}
        </div>
      </div>
    </div>
  );
}
