'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  DashboardError,
  DashboardLoading,
  DashboardPageHeader,
} from '@/components/dashboard/DashboardPageHeader';
import { api, formatNgn, type DashboardOrdersResponse } from '@/lib/api';
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
      router.replace(
        `/signin?next=${encodeURIComponent(
          `/dashboard/o/${params.slug}/events/${params.eventSlug}/orders`,
        )}`,
      );
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
      `Refund amount in NGN for ${buyerEmail} (max ${formatNgn(
        remainingKobo,
      )}). Leave blank for full refund.`,
      '',
    );
    if (input === null) return;
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
      await api.refundOrder(
        getToken()!,
        orderId,
        amountKobo !== undefined ? { amountKobo } : undefined,
      );
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Refund failed');
    } finally {
      setRefundingId(null);
    }
  }

  if (loading) return <DashboardLoading />;
  if (!data) return <DashboardError message={error ?? 'Could not load orders'} />;

  return (
    <div className="page-enter">
      <DashboardPageHeader
        orgSlug={params.slug}
        eyebrow="Event orders"
        title={data.event.title}
        sub={`${data.orders.length} paid order${data.orders.length === 1 ? '' : 's'}. Refunds hit Paystack, void the tickets atomically, and free up capacity for resale.`}
      />

      <section className="wrap" style={{ paddingBottom: 64 }}>
        {error ? (
          <p role="alert" className="text-sm mb-3" style={{ color: 'var(--danger)' }}>
            {error}
          </p>
        ) : null}
        {data.orders.length === 0 ? (
          <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)' }}>
            No paid orders yet.
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'auto' }}>
            <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  {['Buyer', 'Items', 'Total', 'Status', 'Actions'].map((h, i) => (
                    <th
                      key={h}
                      style={{
                        textAlign: i === 2 || i === 4 ? 'right' : 'left',
                        padding: '12px 16px',
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '.08em',
                        color: 'var(--ink-3)',
                        fontWeight: 600,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.orders.map((o) => (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: 16 }}>
                      <div className="fw-600">{o.buyerName ?? o.buyerEmail}</div>
                      {o.buyerName ? (
                        <div className="text-xs muted mt-1">{o.buyerEmail}</div>
                      ) : null}
                      <div className="text-xs muted-2 mono mt-1">{o.paystackRef}</div>
                    </td>
                    <td style={{ padding: 16 }}>
                      <ul style={{ margin: 0, paddingLeft: 14, color: 'var(--ink-2)' }}>
                        {o.items.map((it, i) => (
                          <li key={i}>
                            {it.quantity}× {it.ticketTypeName}{' '}
                            <span className="muted-2">@ {formatNgn(it.unitPriceKobo)}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td style={{ padding: 16, textAlign: 'right' }}>
                      <div className="fw-600 tnum">{formatNgn(o.totalKobo)}</div>
                      {o.refundedKobo > 0 ? (
                        <div
                          className="text-xs mt-1"
                          style={{ color: 'oklch(0.55 0.16 75)' }}
                        >
                          −{formatNgn(o.refundedKobo)} refunded
                        </div>
                      ) : null}
                    </td>
                    <td style={{ padding: 16 }}>
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td style={{ padding: 16, textAlign: 'right' }}>
                      {o.status === 'PAID' && o.totalKobo > o.refundedKobo ? (
                        <button
                          type="button"
                          onClick={() =>
                            refund(o.id, o.buyerEmail, o.totalKobo - o.refundedKobo)
                          }
                          disabled={refundingId === o.id}
                          className="text-sm"
                          style={{
                            color: 'var(--danger)',
                            background: 'transparent',
                            border: 0,
                            padding: '4px 8px',
                            cursor: 'pointer',
                          }}
                        >
                          {refundingId === o.id ? 'Refunding…' : 'Refund'}
                        </button>
                      ) : (
                        <span className="text-xs muted">
                          {o.status === 'REFUNDED' ? 'refunded' : 'no balance'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const tone =
    status === 'PAID'
      ? { bg: 'var(--accent-soft)', color: 'var(--accent)' }
      : status === 'REFUNDED'
        ? { bg: 'oklch(0.80 0.16 75 / 0.18)', color: 'oklch(0.55 0.16 75)' }
        : { bg: 'var(--surface-2)', color: 'var(--ink-2)' };
  return (
    <span
      className="badge"
      style={{ background: tone.bg, color: tone.color }}
    >
      {status}
    </span>
  );
}
