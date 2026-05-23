'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
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

  if (error) {
    return (
      <div className="wrap" style={{ paddingTop: 48, paddingBottom: 96, maxWidth: 1080 }}>
        <p style={{ color: 'var(--danger)' }}>{error}</p>
      </div>
    );
  }
  if (!stats || !orgs) {
    return (
      <div className="wrap" style={{ paddingTop: 48, paddingBottom: 96, maxWidth: 1080 }}>
        <p className="muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="page-enter wrap" style={{ paddingTop: 32, paddingBottom: 96, maxWidth: 1080 }}>
      <div className="eyebrow mb-2">Platform admin</div>
      <h1 className="h-2" style={{ margin: 0 }}>
        Platform overview
      </h1>

      <ul
        className="dashboard-kpi-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          listStyle: 'none',
          padding: 0,
          margin: '24px 0 0',
        }}
      >
        <Stat label="Organizers" value={stats.organizers.toLocaleString()} />
        <Stat label="Events" value={stats.events.toLocaleString()} />
        <Stat label="Paid orders" value={stats.paidOrders.toLocaleString()} />
        <Stat label="Refunded orders" value={stats.refundedOrders.toLocaleString()} />
        <Stat label="Gross revenue" value={formatNgn(stats.grossKobo)} />
        <Stat label="Buyer fees" value={formatNgn(stats.buyerFeesKobo)} />
      </ul>

      <div className="between mt-8 mb-4">
        <h2 className="h-3" style={{ margin: 0 }}>
          Organizers
        </h2>
        <span className="text-sm muted">{orgs.length} total</span>
      </div>
      <ul className="col gap-3" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {orgs.map((o) => (
          <li key={o.id} className="card" style={{ padding: 22 }}>
            <div
              className="between"
              style={{ alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="fw-600">{o.name}</div>
                <div className="text-xs muted mono mt-1">{o.slug}</div>
                {o.owner ? (
                  <div className="text-xs muted mt-1">
                    Owner:{' '}
                    {o.owner.name ? `${o.owner.name} <${o.owner.email}>` : o.owner.email}
                  </div>
                ) : null}
                <div className="text-xs muted mt-1">
                  Created {new Date(o.createdAt).toLocaleDateString('en-NG')} ·{' '}
                  {o.eventCount} event{o.eventCount === 1 ? '' : 's'}
                </div>
              </div>
              <StatusPill status={o.status} />
            </div>

            {o.payout.accountNumber ? (
              <div className="text-sm mt-3" style={{ color: 'var(--ink-2)' }}>
                Payout:{' '}
                <span className="fw-600" style={{ color: 'var(--ink)' }}>
                  {o.payout.accountName ?? '—'}
                </span>{' '}
                · {o.payout.accountNumber} · {o.payout.bankCode ?? '—'} ·{' '}
                <span className="mono text-xs">
                  {o.payout.subaccountCode ?? 'no sub-account'}
                </span>
              </div>
            ) : (
              <div
                className="text-sm mt-3"
                style={{ color: 'oklch(0.55 0.18 50)' }}
              >
                No payout bank configured yet
              </div>
            )}

            <div
              className="dashboard-kpi-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                marginTop: 16,
              }}
            >
              <label className="col gap-1">
                <span className="text-xs muted">
                  Commission (basis points; 100 = 1%)
                </span>
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
                  className="input"
                />
              </label>
              <label className="col gap-1">
                <span className="text-xs muted">KYC notes</span>
                <input
                  type="text"
                  defaultValue={o.kycNotes ?? ''}
                  onChange={(e) =>
                    setNotesDraft((d) => ({ ...d, [o.slug]: e.target.value }))
                  }
                  onBlur={() => {
                    if ((notesDraft[o.slug] ?? '') !== (o.kycNotes ?? '')) {
                      saveNotes(o.slug);
                    }
                  }}
                  placeholder="Reviewed CAC, BVN matches…"
                  className="input"
                />
              </label>
            </div>

            <div className="row gap-2 mt-4">
              {o.status !== 'APPROVED' ? (
                <button
                  type="button"
                  onClick={() => approve(o.slug)}
                  disabled={busy === o.slug}
                  className="btn btn-accent btn-sm"
                >
                  <Icon name="check" size={13} stroke={2.5} /> Approve
                </button>
              ) : null}
              {o.status === 'APPROVED' ? (
                <button
                  type="button"
                  onClick={() => suspend(o.slug)}
                  disabled={busy === o.slug}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--danger)' }}
                >
                  Suspend
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <li className="card" style={{ padding: 18 }}>
      <div className="eyebrow">{label}</div>
      <div className="h-2 tnum mt-2" style={{ fontSize: 24, lineHeight: 1 }}>
        {value}
      </div>
    </li>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone: { bg: string; color: string } =
    status === 'APPROVED'
      ? { bg: 'var(--accent-soft)', color: 'var(--accent)' }
      : status === 'SUSPENDED'
        ? { bg: 'oklch(0.65 0.22 25 / 0.12)', color: 'var(--danger)' }
        : { bg: 'oklch(0.80 0.16 75 / 0.18)', color: 'oklch(0.55 0.16 50)' };
  return (
    <span className="badge" style={{ background: tone.bg, color: tone.color }}>
      {status}
    </span>
  );
}
