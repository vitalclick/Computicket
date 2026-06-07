'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import {
  DashboardError,
  DashboardLoading,
  DashboardPageHeader,
} from '@/components/dashboard/DashboardPageHeader';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface PayoutSettings {
  paystackSubaccountCode: string | null;
  payoutAccountNumber: string | null;
  payoutAccountName: string | null;
  payoutBankCode?: string | null;
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
      router.replace(
        `/signin?next=${encodeURIComponent(`/dashboard/o/${params.slug}/payouts`)}`,
      );
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
      setSuccess(
        `Verified ${res.accountName} at ${res.bankName}. Sub-account ${res.subaccountCode}.`,
      );
      await load();
      setAccountNumber('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <DashboardLoading />;
  if (!settings) return <DashboardError message={error ?? 'No payout settings'} />;

  return (
    <div className="page-enter">
      <DashboardPageHeader
        orgSlug={params.slug}
        eyebrow="Payouts"
        title="Settlement account"
        sub={
          <>
            Ticket sales settle directly to your bank account via Paystack. Platform commission
            of <strong>{settings.commissionPercent}%</strong> is taken from each transaction
            before funds reach you.
          </>
        }
      />

      <section className="wrap" style={{ paddingBottom: 24 }}>
        {settings.isSetUp ? (
          <div
            className="card"
            style={{
              padding: 24,
              background: 'var(--accent-soft)',
              borderColor: 'oklch(0.68 0.18 152 / .3)',
            }}
          >
            <div className="row gap-2" style={{ alignItems: 'center' }}>
              <Icon name="check" size={16} stroke={2.5} />
              <span className="fw-600">Settlement configured</span>
            </div>
            <div className="mt-3" style={{ fontSize: 14 }}>
              <div>
                <span className="muted">Account name:</span>{' '}
                <strong>{settings.payoutAccountName}</strong>
              </div>
              <div className="mt-1">
                <span className="muted">Account number:</span>{' '}
                <span className="mono">{settings.payoutAccountNumber}</span>
              </div>
              <div className="mt-1">
                <span className="muted">Bank:</span> {settings.bankName}
              </div>
              <div className="mt-1">
                <span className="muted">Paystack subaccount:</span>{' '}
                <span className="mono text-xs">{settings.paystackSubaccountCode}</span>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="card"
            style={{ padding: 24, border: '1px dashed var(--line-strong)' }}
          >
            <div className="row gap-3" style={{ alignItems: 'flex-start' }}>
              <Icon name="info" size={20} />
              <div>
                <div className="fw-600">No payout account yet</div>
                <p
                  className="text-sm muted mt-2"
                  style={{ lineHeight: 1.6 }}
                >
                  You can draft events without this, but every event needs a verified payout
                  account before it can publish — buyers&apos; money must have a destination.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="wrap" style={{ paddingBottom: 64 }}>
        <form onSubmit={handleSubmit} className="card" style={{ padding: 24 }}>
          <h2 className="h-4" style={{ margin: 0 }}>
            {settings.isSetUp ? 'Change settlement account' : 'Set up settlement account'}
          </h2>
          <p className="text-xs muted mt-1">
            We verify the account name with Paystack&apos;s bank API in under 5 seconds before
            saving. Most major Nigerian banks supported.
          </p>

          <div className="col gap-3 mt-5">
            <label className="col gap-1">
              <span className="text-xs muted">Bank</span>
              <select
                required
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                className="input"
              >
                <option value="">Select a bank</option>
                {banks.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="col gap-1">
              <span className="text-xs muted">Account number (10 digits)</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{10}"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                className="input mono"
                placeholder="0123456789"
              />
            </label>
          </div>

          {error ? (
            <p role="alert" className="text-sm mt-4" style={{ color: 'var(--danger)' }}>
              {error}
            </p>
          ) : null}
          {success ? (
            <p role="status" className="text-sm mt-4 accent-text">
              {success}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={saving}
            className="btn btn-accent mt-5"
          >
            {saving ? 'Verifying with bank…' : settings.isSetUp ? 'Update account' : 'Verify and save'}
            <Icon name="arrow" size={13} />
          </button>
        </form>
      </section>
    </div>
  );
}
