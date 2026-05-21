'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { api, formatNgn } from '@/lib/api';
import type { DashboardOrdersResponse } from '@/lib/api';
import { getToken } from '@/lib/auth';

export default function EventOrdersPage() {
  const router = useRouter();
  const params = useParams<{ slug: string; eventSlug: string }>();
  const [data, setData] = useState<DashboardOrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refundingId, setRefundingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace('/dashboard/signin');
      return;
    }
    setError(null);
    try {
      const res = await api.listEventOrders(token, params.slug, params.eventSlug);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [router, params.slug, params.eventSlug]);

  useEffect(() => {
    load();
  }, [load]);

  async function refund(orderId: string, buyerEmail: string, remainingKobo: number) {
    const input = prompt(
      `Refund amount in NGN for ${buyerEmail} (max ${formatNgn(remainingKobo)}). Leave blank for full refund.`,
      '',
    );
    if (input === null) return; // cancelled
    let amountKobo: number | undefined;
    if (input.trim() !== '') {
      const ngn = parseFloat(input);
      if (!isFinite(ngn) || ngn <= 0) {
        alert('Enter a positive number, or leave blank.');
        return;
      }
      amountKobo = Math.round(ngn * 100);
      if (amountKobo > remainingKobo) {
        alert(`Amount exceeds remaining refundable balance (${formatNgn(remainingKobo)}).`);
        return;
      }
    }
    setRefundingId(orderId);
    try {
      const token = getToken()!;
      await api.refundOrder(token, orderId, amountKobo !== undefined ? { amountKobo } : undefined);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Refund failed');
    } finally {
      setRefundingId(null);
    }
  }

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-16 text-gray-500">Loading…</div>;
  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-red-600">{error}</div>
        <Link href={`/dashboard/o/${params.slug}`} className="text-sm text-brand-dark hover:underline mt-4 inline-block">
          ← Back
        </Link>
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link href={`/dashboard/o/${params.slug}`} className="text-sm text-gray-500 hover:text-brand-dark">
        ← {params.slug}
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{data.event.title}</h1>
      <p className="text-sm text-gray-600 mt-1">Orders ({data.orders.length})</p>

      {data.orders.length === 0 ? (
        <p className="mt-6 text-gray-500">No paid orders yet.</p>
      ) : (
        <table className="mt-6 w-full text-sm border-collapse">
          <thead className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
            <tr>
              <th className="py-2">Buyer</th>
              <th className="py-2">Items</th>
              <th className="py-2 text-right">Total</th>
              <th className="py-2">Status</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.orders.map((o) => (
              <tr key={o.id} className="border-b border-gray-100">
                <td className="py-3">
                  <div className="font-medium">{o.buyerName ?? o.buyerEmail}</div>
                  {o.buyerName && <div className="text-xs text-gray-500">{o.buyerEmail}</div>}
                  <div className="text-xs text-gray-400 font-mono mt-0.5">{o.paystackRef}</div>
                </td>
                <td className="py-3">
                  <ul className="text-gray-600">
                    {o.items.map((it, i) => (
                      <li key={i}>
                        {it.quantity}× {it.ticketTypeName}{' '}
                        <span className="text-gray-400">@ {formatNgn(it.unitPriceKobo)}</span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="py-3 text-right">
                  <div className="font-semibold">{formatNgn(o.totalKobo)}</div>
                  {o.refundedKobo > 0 && (
                    <div className="text-xs text-amber-700">−{formatNgn(o.refundedKobo)} refunded</div>
                  )}
                </td>
                <td className="py-3">
                  <span className={statusBadge(o.status)}>{o.status}</span>
                </td>
                <td className="py-3 text-right">
                  {o.status === 'PAID' && o.totalKobo > o.refundedKobo ? (
                    <button
                      onClick={() => refund(o.id, o.buyerEmail, o.totalKobo - o.refundedKobo)}
                      disabled={refundingId === o.id}
                      className="text-red-600 hover:underline disabled:text-gray-400"
                    >
                      {refundingId === o.id ? 'Refunding…' : 'Refund'}
                    </button>
                  ) : (
                    <span className="text-gray-400">{o.status === 'REFUNDED' ? 'refunded' : 'no balance'}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function statusBadge(status: string): string {
  const base = 'px-2 py-0.5 rounded-md text-xs font-medium';
  if (status === 'PAID') return `${base} bg-green-50 text-green-700`;
  if (status === 'REFUNDED') return `${base} bg-amber-50 text-amber-800`;
  return `${base} bg-gray-100 text-gray-700`;
}
