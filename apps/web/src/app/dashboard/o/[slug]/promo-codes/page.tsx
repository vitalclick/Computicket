'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import {
  DashboardError,
  DashboardLoading,
  DashboardPageHeader,
} from '@/components/dashboard/DashboardPageHeader';
import { api, formatNgn } from '@/lib/api';
import { getToken } from '@/lib/auth';

export default function PromoCodesPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [codes, setCodes] = useState<Awaited<ReturnType<typeof api.listPromoCodes>>>([]);
  const [overview, setOverview] = useState<
    Awaited<ReturnType<typeof api.dashboardOverview>> | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [type, setType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [valueInput, setValueInput] = useState('');
  const [eventSlug, setEventSlug] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace(
        `/signin?next=${encodeURIComponent(`/dashboard/o/${params.slug}/promo-codes`)}`,
      );
      return;
    }
    try {
      const [c, o] = await Promise.all([
        api.listPromoCodes(token, params.slug),
        api.dashboardOverview(token, params.slug),
      ]);
      setCodes(c);
      setOverview(o);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }, [router, params.slug]);

  useEffect(() => {
    load();
  }, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy('create');
    setCreateError(null);
    try {
      // PERCENTAGE: stored as basis-points (12.5% → 1250)
      // FIXED: stored as kobo (₦500 → 50000)
      const numericValue = Math.round(parseFloat(valueInput) * 100);
      await api.createPromoCode(getToken()!, params.slug, {
        code,
        type,
        value: numericValue,
        eventSlug: eventSlug || undefined,
        maxUses: maxUses ? parseInt(maxUses, 10) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      });
      setCode('');
      setValueInput('');
      setMaxUses('');
      setExpiresAt('');
      setEventSlug('');
      await load();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(null);
    }
  }

  async function deactivate(id: string) {
    if (!confirm('Deactivate this promo code? It will no longer be usable.')) return;
    setBusy(id);
    try {
      await api.deactivatePromoCode(getToken()!, params.slug, id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <DashboardLoading />;
  if (error && codes.length === 0) return <DashboardError message={error} />;

  return (
    <div className="page-enter">
      <DashboardPageHeader
        orgSlug={params.slug}
        eyebrow="Promo codes"
        title="Discount codes"
        sub="Discounts apply to the subtotal, before fees. Codes are case-insensitive. Scope to a single event or use across every event under this organizer."
      />

      <section className="wrap" style={{ paddingBottom: 24 }}>
        <form onSubmit={create} className="card" style={{ padding: 24 }}>
          <h2 className="h-4" style={{ margin: 0 }}>
            New promo code
          </h2>
          <div
            className="mt-4"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            <label className="col gap-1">
              <span className="text-xs muted">Code</span>
              <input
                required
                pattern="[A-Za-z0-9-]{2,32}"
                placeholder="EARLYBIRD"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="input mono"
                style={{ textTransform: 'uppercase' }}
              />
            </label>
            <label className="col gap-1">
              <span className="text-xs muted">Discount type</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'PERCENTAGE' | 'FIXED')}
                className="input"
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed (NGN)</option>
              </select>
            </label>
            <label className="col gap-1">
              <span className="text-xs muted">
                {type === 'PERCENTAGE' ? 'Percentage off (1–100)' : 'NGN off'}
              </span>
              <input
                required
                type="number"
                step="0.01"
                min="0.01"
                max={type === 'PERCENTAGE' ? 100 : undefined}
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
                className="input"
              />
            </label>
            <label className="col gap-1">
              <span className="text-xs muted">Scope</span>
              <select
                value={eventSlug}
                onChange={(e) => setEventSlug(e.target.value)}
                className="input"
              >
                <option value="">All events</option>
                {overview?.events.map((ev) => (
                  <option key={ev.slug} value={ev.slug}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="col gap-1">
              <span className="text-xs muted">Max uses (optional)</span>
              <input
                type="number"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="input"
                placeholder="Unlimited"
              />
            </label>
            <label className="col gap-1">
              <span className="text-xs muted">Expires (optional)</span>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="input"
              />
            </label>
          </div>
          {createError ? (
            <p role="alert" className="text-sm mt-4" style={{ color: 'var(--danger)' }}>
              {createError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy === 'create'}
            className="btn btn-accent mt-5"
          >
            {busy === 'create' ? 'Creating…' : 'Create promo code'}
            <Icon name="arrow" size={13} />
          </button>
        </form>
      </section>

      <section className="wrap" style={{ paddingBottom: 64 }}>
        <div className="between mb-4">
          <h2 className="h-3" style={{ margin: 0 }}>
            All codes
          </h2>
          <span className="text-sm muted">{codes.length} total</span>
        </div>
        {error ? (
          <p role="alert" className="text-sm mb-3" style={{ color: 'var(--danger)' }}>
            {error}
          </p>
        ) : null}
        {codes.length === 0 ? (
          <div
            className="card"
            style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)' }}
          >
            <p>No promo codes yet — create your first above.</p>
          </div>
        ) : (
          <div className="col gap-2">
            {codes.map((c) => (
              <div
                key={c.id}
                className="card"
                style={{
                  padding: 18,
                  display: 'grid',
                  gridTemplateColumns: 'auto minmax(0,1fr) auto',
                  gap: 16,
                  alignItems: 'center',
                  opacity: c.active ? 1 : 0.6,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--r-2)',
                    background: 'var(--accent-soft)',
                    color: 'var(--accent)',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                  aria-hidden="true"
                >
                  <Icon name="gift" size={16} />
                </div>
                <div>
                  <div className="fw-600 mono">{c.code}</div>
                  <div className="text-xs muted mt-1">
                    {c.type === 'PERCENTAGE'
                      ? `${(c.value / 100).toFixed(2)}% off`
                      : `${formatNgn(c.value)} off`}{' '}
                    · {c.event ? `Event: ${c.event.title}` : 'All events'}
                    {c.maxUses
                      ? ` · ${c.usesCount}/${c.maxUses} used`
                      : ` · ${c.usesCount} used`}
                    {c.expiresAt
                      ? ` · expires ${new Date(c.expiresAt).toLocaleDateString('en-NG')}`
                      : ''}
                  </div>
                </div>
                {c.active ? (
                  <button
                    type="button"
                    onClick={() => deactivate(c.id)}
                    disabled={busy === c.id}
                    className="text-xs"
                    style={{
                      color: 'var(--danger)',
                      background: 'transparent',
                      border: 0,
                      padding: '6px 10px',
                      cursor: 'pointer',
                    }}
                  >
                    Deactivate
                  </button>
                ) : (
                  <span className="text-xs muted">inactive</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
