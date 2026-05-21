'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
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

  if (error) return <div className="max-w-2xl mx-auto px-4 py-16 text-red-600">{error}</div>;
  if (!data) return <div className="max-w-2xl mx-auto px-4 py-16 text-gray-500">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/account" className="text-sm text-gray-500 hover:text-brand-dark">← Account</Link>
      <h1 className="mt-2 text-2xl font-bold">Wallet</h1>

      <div className="mt-6 rounded-lg bg-brand text-white p-6">
        <div className="text-sm uppercase tracking-wide ">Balance</div>
        <div className="mt-2 text-4xl font-bold">{formatNgn(data.balanceKobo)}</div>
      </div>

      <form onSubmit={topUp} className="mt-6 border border-gray-200 rounded-lg p-4 bg-white">
        <h2 className="font-semibold">Add funds</h2>
        <p className="text-xs text-gray-500 mt-1">
          Top up via Paystack. The credit lands in your wallet as soon as we receive the payment confirmation.
        </p>
        <div className="mt-3 flex gap-2">
          <input
            type="number" min="100" step="100" required placeholder="Amount (NGN)"
            value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <button type="submit" disabled={busy}
            className="bg-brand text-white px-4 py-2 rounded-md hover:bg-brand-dark disabled:bg-gray-300 text-sm">
            {busy ? 'Redirecting…' : 'Top up'}
          </button>
        </div>
      </form>

      <h2 className="mt-10 text-lg font-semibold">Recent activity</h2>
      {data.transactions.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">No transactions yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-gray-200 border border-gray-200 rounded-lg bg-white">
          {data.transactions.map((t) => (
            <li key={t.id} className="px-4 py-3 flex items-center justify-between text-sm">
              <div>
                <div className="font-medium">{labelForType(t.type)}</div>
                {t.note && <div className="text-xs text-gray-500">{t.note}</div>}
                <div className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleString('en-NG')}</div>
              </div>
              <div className="text-right">
                <div className={`font-semibold ${t.amountKobo > 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {t.amountKobo > 0 ? '+' : ''}{formatNgn(t.amountKobo)}
                </div>
                <div className="text-xs text-gray-500">Balance: {formatNgn(t.balanceAfterKobo)}</div>
              </div>
            </li>
          ))}
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
