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

export default function BusRoutesPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [routes, setRoutes] = useState<Awaited<ReturnType<typeof api.listBusRoutes>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [duration, setDuration] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace(
        `/signin?next=${encodeURIComponent(`/dashboard/o/${params.slug}/bus-routes`)}`,
      );
      return;
    }
    try {
      setRoutes(await api.listBusRoutes(token, params.slug));
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
      await api.createBusRoute(getToken()!, params.slug, {
        fromCity,
        toCity,
        durationMinutes: parseInt(duration, 10) * 60,
      });
      setFromCity('');
      setToCity('');
      setDuration('');
      await load();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(null);
    }
  }

  async function deactivate(id: string) {
    if (
      !confirm(
        'Deactivate this route? Existing trips remain, but no new trips can use it.',
      )
    )
      return;
    setBusy(id);
    try {
      await api.deactivateBusRoute(getToken()!, params.slug, id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <DashboardLoading />;
  if (error && routes.length === 0) return <DashboardError message={error} />;

  return (
    <div className="page-enter">
      <DashboardPageHeader
        orgSlug={params.slug}
        eyebrow="Bus routes"
        title="Inter-city routes"
        sub="Define the inter-city routes you operate. Once a route exists, create each trip as a draft event linked to the route."
      />

      <section className="wrap" style={{ paddingBottom: 24 }}>
        <form onSubmit={create} className="card" style={{ padding: 24 }}>
          <h2 className="h-4" style={{ margin: 0 }}>
            New route
          </h2>
          <div
            className="mt-4"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr auto',
              gap: 10,
              alignItems: 'flex-start',
            }}
          >
            <input
              required
              placeholder="From (e.g. Lagos)"
              value={fromCity}
              onChange={(e) => setFromCity(e.target.value)}
              aria-label="From city"
              className="input"
            />
            <input
              required
              placeholder="To (e.g. Abuja)"
              value={toCity}
              onChange={(e) => setToCity(e.target.value)}
              aria-label="To city"
              className="input"
            />
            <input
              required
              type="number"
              min="1"
              placeholder="Hours"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              aria-label="Trip duration in hours"
              className="input"
            />
            <button
              type="submit"
              disabled={busy === 'create'}
              className="btn btn-accent"
              style={{ height: 'fit-content' }}
            >
              {busy === 'create' ? 'Creating…' : 'Add route'}
              <Icon name="arrow" size={13} />
            </button>
          </div>
          {createError ? (
            <p role="alert" className="text-sm mt-3" style={{ color: 'var(--danger)' }}>
              {createError}
            </p>
          ) : null}
        </form>
      </section>

      <section className="wrap" style={{ paddingBottom: 64 }}>
        <div className="between mb-4">
          <h2 className="h-3" style={{ margin: 0 }}>
            Routes
          </h2>
          <span className="text-sm muted">{routes.length} total</span>
        </div>
        {error ? (
          <p role="alert" className="text-sm mb-3" style={{ color: 'var(--danger)' }}>
            {error}
          </p>
        ) : null}
        {routes.length === 0 ? (
          <div
            className="card"
            style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)' }}
          >
            <p>No routes yet — add your first above.</p>
          </div>
        ) : (
          <div className="col gap-2">
            {routes.map((r) => (
              <div
                key={r.id}
                className="card"
                style={{
                  padding: 18,
                  display: 'grid',
                  gridTemplateColumns: 'auto minmax(0,1fr) auto',
                  gap: 16,
                  alignItems: 'center',
                  opacity: r.active ? 1 : 0.6,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--r-2)',
                    background: 'var(--surface-2)',
                    color: 'var(--accent)',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                  aria-hidden="true"
                >
                  <Icon name="bus" size={16} />
                </div>
                <div>
                  <div className="fw-600">
                    {r.fromCity}{' '}
                    <Icon name="arrow" size={13} stroke={2} /> {r.toCity}
                  </div>
                  <div className="text-xs muted mt-1">
                    {Math.round(r.durationMinutes / 60)}h trip ·{' '}
                    {r._count.trips} trip{r._count.trips === 1 ? '' : 's'}
                  </div>
                </div>
                {r.active ? (
                  <button
                    type="button"
                    onClick={() => deactivate(r.id)}
                    disabled={busy === r.id}
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
