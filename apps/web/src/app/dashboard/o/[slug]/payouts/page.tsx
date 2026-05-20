'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface PayoutSettings {
  paystackSubaccountCode: string | null;
  payoutAccountNumber: string | null;
  payoutAccountName: string | null;
  bankName: string | null;
  commissionPercent: number;
  isSetUp: boolean;
}

export default function PayoutsPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [settings, setSettings] = useState<PayoutSettings | null>(null);
  const [banks, setBanks] = useState<Array<{ code: string; name: string }>>([]);
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace('/dashboard/signin');
      return;
    }
    try {
      const [s, b] = await Promise.all([
        api.getPayouts(token, params.slug),
        api.listBanks(),
      ]);
      setSettings(s);
      setBanks(b.banks);
      if (s.payoutBankCode) setBankCode(s.payoutBankCode);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [router, params.slug]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const token = getToken()!;
      const res = await api.setPayouts(token, params.slug, { bankCode, accountNumber });
      setSuccess(`Verified ${res.accountName} at ${res.bankName}. Sub-account ${res.subaccountCode}.`);
      await load();
      setAccountNumber('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-16 text-gray-500">Loading…</div>;
  if (!settings) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href={`/dashboard/o/${params.slug}`} className="text-sm text-gray-500 hover:text-brand">
        ← {params.slug}
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Payouts</h1>
      <p className="text-sm text-gray-600 mt-1">
        Ticket sales settle directly to your bank account via Paystack. Platform commission of{' '}
        <strong>{settings.commissionPercent}%</strong> is taken from each transaction.
      </p>

      {settings.isSetUp && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="text-sm font-semibold text-green-800">Settlement configured</div>
          <div className="mt-1 text-sm text-green-700">
            {settings.payoutAccountName} ·{' '}
            <span className="font-mono">{settings.payoutAccountNumber}</span> · {settings.bankName}
          </div>
          <div className="text-xs text-green-600 mt-1 font-mono">
            {settings.paystackSubaccountCode}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <h2 className="font-semibold">
          {settings.isSetUp ? 'Change settlement account' : 'Set up settlement account'}
        </h2>
        <label className="block">
          <span className="text-xs text-gray-600">Bank</span>
          <select
            required
            value={bankCode}
            onChange={(e) => setBankCode(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
          >
            <option value="">Select a bank</option>
            {banks.map((b) => (
              <option key={b.code} value={b.code}>{b.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-gray-600">Account number (10 digits)</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{10}"
            required
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 font-mono"
          />
        </label>

        {error && <div className="text-sm text-red-600">{error}</div>}
        {success && <div className="text-sm text-green-700">{success}</div>}

        <button
          type="submit"
          disabled={saving}
          className="bg-brand text-white px-4 py-2 rounded-md hover:bg-brand-dark disabled:bg-gray-300"
        >
          {saving ? 'Verifying with bank…' : settings.isSetUp ? 'Update' : 'Verify and save'}
        </button>
      </form>
    </div>
  );
}
