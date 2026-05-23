'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { api, formatNgn } from '@/lib/api';
import { getToken } from '@/lib/auth';

type Overview = Awaited<ReturnType<typeof api.walletOverview>>;

export default function WalletPage() {
  const router = useRouter();
  const [data, setData] = useState<Overview | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace('/signin?next=/account/wallet');
      return;
    }
    try {
      setData(await api.walletOverview(token));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load wallet');
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function topUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const ngn = parseFloat(topUpAmount);
      if (!isFinite(ngn) || ngn < 100) {
        alert('Minimum top-up is NGN 100');
        return;
      }
      const res = await api.walletTopUp(getToken()!, {
        amountKobo: Math.round(ngn * 100),
        callbackUrl: `${window.location.origin}/account/wallet`,
      });
      window.location.href = res.paystack.authorizationUrl;
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
      setBusy(false);
    }
  }

  if (error) {
    return (
      <div className="wrap" style={{ paddingTop: 48, paddingBottom: 96, maxWidth: 680 }}>
        <p style={{ color: 'var(--danger)' }}>{error}</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="wrap" style={{ paddingTop: 48, paddingBottom: 96, maxWidth: 680 }}>
        <p className="muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="page-enter wrap" style={{ paddingTop: 32, paddingBottom: 96, maxWidth: 680 }}>
      <Link
        href="/account"
        className="row gap-1 text-sm muted"
        style={{ alignItems: 'center', textDecoration: 'none' }}
      >
        <Icon name="chevron" size={12} style={{ transform: 'rotate(180deg)' }} />
        <span>Account</span>
      </Link>
      <h1 className="h-2 mt-2" style={{ margin: '8px 0 0' }}>
        Wallet
      </h1>

      <div
        className="card mt-6"
        style={{
          padding: 28,
          background:
            'linear-gradient(135deg, oklch(0.45 0.18 152), oklch(0.40 0.16 180))',
          border: 0,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="stars" style={{ opacity: 0.4 }} />
        <div style={{ position: 'relative' }}>
          <div className="eyebrow" style={{ color: 'oklch(1 0 0 / .7)' }}>
            Balance
          </div>
          <div
            className="h-1 tnum mt-2"
            style={{ fontSize: 42, lineHeight: 1, color: 'white' }}
          >
            {formatNgn(data.balanceKobo)}
          </div>
        </div>
      </div>

      <form onSubmit={topUp} className="card mt-6" style={{ padding: 22 }}>
        <h2 className="h-4">Add funds</h2>
        <p className="text-xs muted mt-2" style={{ lineHeight: 1.55 }}>
          Top up via Paystack. The credit lands in your wallet as soon as we
          receive the payment confirmation.
        </p>
        <div className="row gap-2 mt-3" style={{ alignItems: 'stretch' }}>
          <input
            type="number"
            min="100"
            step="100"
            required
            placeholder="Amount (NGN)"
            value={topUpAmount}
            onChange={(e) => setTopUpAmount(e.target.value)}
            className="input"
            style={{ flex: 1 }}
            aria-label="Top-up amount in NGN"
          />
          <button
            type="submit"
            disabled={busy}
            className="btn btn-accent"
            style={{ flexShrink: 0 }}
          >
            {busy ? 'Redirecting…' : 'Top up'}
          </button>
        </div>
      </form>

      <div className="between mt-8 mb-3">
        <h2 className="h-3" style={{ margin: 0 }}>
          Recent activity
        </h2>
        <span className="text-sm muted">{data.transactions.length} entries</span>
      </div>
      {data.transactions.length === 0 ? (
        <div
          className="card"
          style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)' }}
        >
          No transactions yet.
        </div>
      ) : (
        <ul
          className="card col"
          style={{
            padding: 0,
            listStyle: 'none',
            margin: 0,
          }}
        >
          {data.transactions.map((t, i) => {
            const positive = t.amountKobo > 0;
            return (
              <li
                key={t.id}
                style={{
                  padding: '14px 18px',
                  borderTop: i === 0 ? 0 : '1px solid var(--line)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: positive ? 'var(--accent-soft)' : 'var(--surface-2)',
                    color: positive ? 'var(--accent)' : 'var(--ink-3)',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon name={positive ? 'arrowDown' : 'arrowUp'} size={13} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="fw-600 text-sm">{labelForType(t.type)}</div>
                  {t.note ? (
                    <div className="text-xs muted mt-1">{t.note}</div>
                  ) : null}
                  <div className="text-xs muted-2 mt-1">
                    {new Date(t.createdAt).toLocaleString('en-NG')}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div
                    className="fw-600 tnum"
                    style={{
                      color: positive ? 'var(--accent)' : 'var(--danger)',
                      fontSize: 14,
                    }}
                  >
                    {positive ? '+' : ''}
                    {formatNgn(t.amountKobo)}
                  </div>
                  <div className="text-xs muted">
                    Bal {formatNgn(t.balanceAfterKobo)}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function labelForType(type: 'TOP_UP' | 'PURCHASE' | 'REFUND' | 'ADJUSTMENT'): string {
  switch (type) {
    case 'TOP_UP': return 'Top up';
    case 'PURCHASE': return 'Ticket purchase';
    case 'REFUND': return 'Refund credit';
    case 'ADJUSTMENT': return 'Adjustment';
  }
}
