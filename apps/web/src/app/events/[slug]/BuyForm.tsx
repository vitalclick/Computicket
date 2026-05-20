'use client';

import { useMemo, useState } from 'react';
import type { EventDetail } from '@/lib/api';
import { api, formatNgn } from '@/lib/api';

interface Props {
  event: EventDetail;
}

export function BuyForm({ event }: Props) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const items = event.ticketTypes
    .map((tt) => ({ tt, qty: quantities[tt.id] ?? 0 }))
    .filter((i) => i.qty > 0);

  const subtotal = useMemo(
    () => items.reduce((acc, i) => acc + i.tt.priceKobo * i.qty, 0),
    [items],
  );
  const fee = Math.round(subtotal * 0.015);
  const total = subtotal + fee;

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
      const res = await api.createOrder({
        eventSlug: event.slug,
        buyerEmail: email,
        buyerName: name || undefined,
        callbackUrl: `${origin}/checkout/return`,
        items: items.map((i) => ({ ticketTypeId: i.tt.id, quantity: i.qty })),
      });
      window.location.href = res.paystack.authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10">
      <h2 className="text-xl font-semibold mb-4">Tickets</h2>
      <ul className="space-y-3">
        {event.ticketTypes.map((tt) => {
          const remaining = tt.capacity - tt.sold;
          const soldOut = remaining <= 0;
          const qty = quantities[tt.id] ?? 0;
          return (
            <li
              key={tt.id}
              className="border border-gray-200 rounded-lg p-4 flex items-center justify-between gap-4"
            >
              <div>
                <div className="font-medium">{tt.name}</div>
                {tt.description && <div className="text-sm text-gray-600">{tt.description}</div>}
                <div className="text-xs text-gray-500 mt-1">
                  {soldOut ? 'Sold out' : `${remaining} remaining`}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="font-semibold">{formatNgn(tt.priceKobo)}</div>
                <select
                  disabled={soldOut}
                  value={qty}
                  onChange={(e) =>
                    setQuantities((q) => ({ ...q, [tt.id]: parseInt(e.target.value, 10) }))
                  }
                  className="border border-gray-300 rounded-md px-2 py-1.5 disabled:bg-gray-100"
                >
                  {Array.from({ length: Math.min(10, remaining) + 1 }, (_, i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
            </li>
          );
        })}
      </ul>

      {subtotal > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-4 space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatNgn(subtotal)}</span></div>
          <div className="flex justify-between text-gray-500"><span>Service fee</span><span>{formatNgn(fee)}</span></div>
          <div className="flex justify-between text-lg font-semibold pt-2"><span>Total</span><span>{formatNgn(total)}</span></div>
        </div>
      )}

      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2"
        />
        <input
          type="text"
          placeholder="Full name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

      <button
        type="submit"
        disabled={submitting || subtotal === 0 || !email}
        className="mt-6 w-full bg-brand text-white font-medium py-3 rounded-md hover:bg-brand-dark disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {submitting ? 'Redirecting to Paystack…' : `Pay ${subtotal > 0 ? formatNgn(total) : ''} with Paystack`}
      </button>
    </form>
  );
}
