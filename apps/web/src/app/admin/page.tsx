'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { api, formatNgn } from '@/lib/api';
import type { AdminOrganizer, AdminStats } from '@/lib/api';
import { getToken } from '@/lib/auth';

export default function AdminHome() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orgs, setOrgs] = useState<AdminOrganizer[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace('/signin?next=/admin');
      return;
    }
    try {
      const me = await api.me(token);
      if (!me.isAdmin) {
        router.replace('/');
        return;
      }
      const [s, o] = await Promise.all([
        api.adminStats(token),
        api.adminListOrganizers(token),
      ]);
      setStats(s);
      setOrgs(o);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function approve(slug: string) {
    setBusy(slug);
    try {
      await api.adminApprove(getToken()!, slug);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(null);
    }
  }
  async function suspend(slug: string) {
    if (!confirm(`Suspend ${slug}? They will not be able to publish events or take payments.`)) return;
    setBusy(slug);
    try {
      await api.adminSuspend(getToken()!, slug);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(null);
    }
  }
  async function setCommission(slug: string, bpsStr: string) {
    const bps = parseInt(bpsStr, 10);
    if (Number.isNaN(bps) || bps < 0 || bps > 5000) {
      alert('Commission must be between 0 and 5000 basis points (0–50%)');
      return;
    }
    setBusy(slug);
    try {
      await api.adminSetCommission(getToken()!, slug, bps);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(null);
    }
  }
  async function saveNotes(slug: string) {
    setBusy(slug);
    try {
      await api.adminSetKycNotes(getToken()!, slug, notesDraft[slug] ?? '');
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(null);
    }
  }

  if (error) return <div className="max-w-5xl mx-auto px-4 py-16 text-red-600">{error}</div>;
  if (!stats || !orgs) return <div className="max-w-5xl mx-auto px-4 py-16 text-gray-500">Loading…</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold">Platform overview</h1>

      <ul className="mt-6 grid sm:grid-cols-3 gap-3">
        <Stat label="Organizers" value={stats.organizers.toLocaleString()} />
        <Stat label="Events" value={stats.events.toLocaleString()} />
        <Stat label="Paid orders" value={stats.paidOrders.toLocaleString()} />
        <Stat label="Refunded orders" value={stats.refundedOrders.toLocaleString()} />
        <Stat label="Gross revenue" value={formatNgn(stats.grossKobo)} />
        <Stat label="Buyer fees (kobo)" value={formatNgn(stats.buyerFeesKobo)} />
      </ul>

      <h2 className="mt-12 text-xl font-semibold">Organizers</h2>
      <ul className="mt-4 space-y-4">
        {orgs.map((o) => (
          <li key={o.id} className="border border-gray-200 rounded-lg p-5 bg-white">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="font-semibold">{o.name}</div>
                <div className="text-xs text-gray-500 mt-0.5 font-mono">{o.slug}</div>
                {o.owner && (
                  <div className="text-xs text-gray-500 mt-1">
                    Owner: {o.owner.name ? `${o.owner.name} <${o.owner.email}>` : o.owner.email}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  Created {new Date(o.createdAt).toLocaleDateString('en-NG')} ·{' '}
                  {o.eventCount} event{o.eventCount === 1 ? '' : 's'}
                </div>
              </div>
              <span className={statusBadge(o.status)}>{o.status}</span>
            </div>

            {o.payout.accountNumber ? (
              <div className="mt-3 text-sm text-gray-700">
                Payout: <strong>{o.payout.accountName ?? '—'}</strong> · {o.payout.accountNumber} ·{' '}
                {o.payout.bankCode ?? '—'} ·{' '}
                <span className="font-mono text-xs">{o.payout.subaccountCode ?? 'no sub-account'}</span>
              </div>
            ) : (
              <div className="mt-3 text-sm text-amber-700">No payout bank configured yet</div>
            )}

            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="block text-xs text-gray-600 mb-1">Commission (basis points; 100 = 1%)</span>
                <input
                  type="number"
                  min={0}
                  max={5000}
                  defaultValue={o.commissionBps}
                  onBlur={(e) => {
                    if (parseInt(e.target.value, 10) !== o.commissionBps) {
                      setCommission(o.slug, e.target.value);
                    }
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </label>
              <label className="text-sm">
                <span className="block text-xs text-gray-600 mb-1">KYC notes</span>
                <input
                  type="text"
                  defaultValue={o.kycNotes ?? ''}
                  onChange={(e) => setNotesDraft((d) => ({ ...d, [o.slug]: e.target.value }))}
                  onBlur={() => {
                    if ((notesDraft[o.slug] ?? '') !== (o.kycNotes ?? '')) {
                      saveNotes(o.slug);
                    }
                  }}
                  placeholder="Reviewed CAC, BVN matches…"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </label>
            </div>

            <div className="mt-4 flex gap-2">
              {o.status !== 'APPROVED' && (
                <button
                  onClick={() => approve(o.slug)}
                  disabled={busy === o.slug}
                  className="bg-green-600 text-white text-sm px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-300"
                >
                  Approve
                </button>
              )}
              {o.status === 'APPROVED' && (
                <button
                  onClick={() => suspend(o.slug)}
                  disabled={busy === o.slug}
                  className="bg-red-600 text-white text-sm px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-300"
                >
                  Suspend
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <li className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </li>
  );
}

function statusBadge(status: string): string {
  const base = 'px-2 py-0.5 rounded-md text-xs font-medium';
  if (status === 'APPROVED') return `${base} bg-green-50 text-green-700`;
  if (status === 'SUSPENDED') return `${base} bg-red-50 text-red-700`;
  return `${base} bg-amber-50 text-amber-800`;
}
