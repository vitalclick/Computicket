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

type Delivery = {
  id: string;
  event: string;
  status: 'PENDING' | 'DELIVERED' | 'FAILED';
  attemptCount: number;
  nextAttemptAt: string;
  responseStatus: number | null;
  createdAt: string;
  endpoint: { url: string };
};

const EVENT_TYPES = ['order.paid', 'order.refunded', 'ticket.scanned'] as const;

export default function DevelopersPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [keys, setKeys] = useState<Awaited<ReturnType<typeof api.listApiKeys>>>([]);
  const [endpoints, setEndpoints] = useState<
    Awaited<ReturnType<typeof api.listWebhookEndpoints>>
  >([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newKey, setNewKey] = useState<{ name: string; key: string } | null>(null);
  const [newSecret, setNewSecret] = useState<{ url: string; secret: string } | null>(null);

  const [keyName, setKeyName] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [endpointUrl, setEndpointUrl] = useState('');
  const [endpointTypes, setEndpointTypes] = useState<string[]>([...EVENT_TYPES]);
  const [creatingEndpoint, setCreatingEndpoint] = useState(false);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace(
        `/signin?next=${encodeURIComponent(`/dashboard/o/${params.slug}/developers`)}`,
      );
      return;
    }
    try {
      const [k, e, d] = await Promise.all([
        api.listApiKeys(token, params.slug),
        api.listWebhookEndpoints(token, params.slug),
        api.listWebhookDeliveries(token, params.slug),
      ]);
      setKeys(k);
      setEndpoints(e);
      setDeliveries(d);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [router, params.slug]);

  useEffect(() => {
    load();
  }, [load]);

  async function createKey(e: React.FormEvent) {
    e.preventDefault();
    setCreatingKey(true);
    try {
      const token = getToken()!;
      const res = await api.createApiKey(token, params.slug, keyName);
      setNewKey({ name: res.name, key: res.key });
      setKeyName('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setCreatingKey(false);
    }
  }

  async function revokeKey(id: string) {
    if (!confirm('Revoke this API key? Any integration using it will stop working.')) return;
    try {
      await api.revokeApiKey(getToken()!, params.slug, id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  }

  async function createEndpoint(e: React.FormEvent) {
    e.preventDefault();
    if (endpointTypes.length === 0) return;
    setCreatingEndpoint(true);
    try {
      const res = await api.createWebhookEndpoint(getToken()!, params.slug, {
        url: endpointUrl,
        eventTypes: endpointTypes,
      });
      setNewSecret({ url: res.url, secret: res.signingSecret });
      setEndpointUrl('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setCreatingEndpoint(false);
    }
  }

  async function deleteEndpoint(id: string) {
    if (!confirm('Delete this webhook endpoint?')) return;
    try {
      await api.deleteWebhookEndpoint(getToken()!, params.slug, id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  }

  if (loading) return <DashboardLoading />;
  if (error && keys.length === 0 && endpoints.length === 0)
    return <DashboardError message={error} />;

  return (
    <div className="page-enter">
      <DashboardPageHeader
        orgSlug={params.slug}
        eyebrow="Developers"
        title="API keys & webhooks"
        sub={
          <>
            Build server-to-server integrations with API keys, get notified of events with
            signed webhooks, or drop the{' '}
            <a className="accent-text" href="/widget-demo" target="_blank" rel="noreferrer">
              buy-button widget
            </a>{' '}
            on your own site.
          </>
        }
      />

      {/* ── API keys ─────────────────────────────────────────────── */}
      <section className="wrap" style={{ paddingBottom: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <div className="row gap-3 mb-3" style={{ alignItems: 'center' }}>
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
            >
              <Icon name="lock" size={16} />
            </div>
            <div>
              <h2 className="h-4" style={{ margin: 0 }}>
                API keys
              </h2>
              <p className="text-xs muted mt-1">
                Authenticate server-to-server calls to <code className="mono">/api/v1/*</code>{' '}
                with <code className="mono">Authorization: Bearer ctng_live_…</code>.
              </p>
            </div>
          </div>

          {newKey ? (
            <RevealOnce
              title="Save this key now"
              hint={
                <>
                  You won&apos;t be able to see <em>{newKey.name}</em>&apos;s key value again.
                </>
              }
              value={newKey.key}
              onDismiss={() => setNewKey(null)}
            />
          ) : null}

          <form onSubmit={createKey} className="row gap-2 mt-4" style={{ alignItems: 'flex-start' }}>
            <input
              type="text"
              required
              placeholder="Key name (e.g. Production server)"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              className="input"
              style={{ flex: 1 }}
              aria-label="API key name"
            />
            <button type="submit" disabled={creatingKey} className="btn btn-accent">
              {creatingKey ? 'Creating…' : 'Create key'}
              <Icon name="arrow" size={13} />
            </button>
          </form>

          {keys.length === 0 ? (
            <p className="text-sm muted mt-5">No keys yet.</p>
          ) : (
            <div className="col gap-2 mt-5">
              {keys.map((k) => (
                <div
                  key={k.id}
                  className="card"
                  style={{
                    padding: 14,
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0,1fr) auto auto auto',
                    gap: 16,
                    alignItems: 'center',
                    background: 'var(--surface-2)',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div className="fw-600 text-sm">{k.name}</div>
                    <div className="text-xs muted mono mt-1">{k.prefix}…</div>
                  </div>
                  <div className="text-xs muted">
                    Created {new Date(k.createdAt).toLocaleDateString('en-NG')}
                  </div>
                  <div className="text-xs muted">
                    {k.lastUsedAt
                      ? `Used ${new Date(k.lastUsedAt).toLocaleString('en-NG')}`
                      : 'Never used'}
                  </div>
                  {k.revokedAt ? (
                    <span className="text-xs muted">revoked</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => revokeKey(k.id)}
                      className="text-xs"
                      style={{
                        color: 'var(--danger)',
                        background: 'transparent',
                        border: 0,
                        padding: '6px 10px',
                        cursor: 'pointer',
                      }}
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Webhook endpoints ────────────────────────────────────── */}
      <section className="wrap" style={{ paddingBottom: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <div className="row gap-3 mb-3" style={{ alignItems: 'center' }}>
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
            >
              <Icon name="send" size={16} />
            </div>
            <div>
              <h2 className="h-4" style={{ margin: 0 }}>
                Webhook endpoints
              </h2>
              <p className="text-xs muted mt-1">
                Signed POSTs for events you subscribe to. Verify{' '}
                <code className="mono">X-Computicket-Signature</code> with HMAC-SHA256 of the
                raw body using the endpoint&apos;s signing secret.
              </p>
            </div>
          </div>

          {newSecret ? (
            <RevealOnce
              title="Save this signing secret now"
              hint={
                <>
                  For endpoint <strong className="mono">{newSecret.url}</strong> — you
                  won&apos;t see the full secret again.
                </>
              }
              value={newSecret.secret}
              onDismiss={() => setNewSecret(null)}
            />
          ) : null}

          <form onSubmit={createEndpoint} className="mt-4 col gap-3">
            <input
              type="url"
              required
              placeholder="https://your-server.com/computicket/webhook"
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
              className="input"
              aria-label="Webhook URL"
            />
            <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
              {EVENT_TYPES.map((t) => (
                <label key={t} className="row gap-2" style={{ alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={endpointTypes.includes(t)}
                    onChange={(e) =>
                      setEndpointTypes((arr) =>
                        e.target.checked ? [...arr, t] : arr.filter((x) => x !== t),
                      )
                    }
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  <code className="mono text-sm">{t}</code>
                </label>
              ))}
            </div>
            <div>
              <button
                type="submit"
                disabled={creatingEndpoint || endpointTypes.length === 0}
                className="btn btn-accent"
              >
                {creatingEndpoint ? 'Creating…' : 'Add endpoint'}
                <Icon name="arrow" size={13} />
              </button>
            </div>
          </form>

          {endpoints.length === 0 ? (
            <p className="text-sm muted mt-5">No endpoints yet.</p>
          ) : (
            <div className="col gap-2 mt-5">
              {endpoints.map((e) => (
                <div
                  key={e.id}
                  className="card"
                  style={{
                    padding: 16,
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0,1fr) auto',
                    gap: 16,
                    alignItems: 'flex-start',
                    background: 'var(--surface-2)',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div className="fw-600 mono text-sm" style={{ wordBreak: 'break-all' }}>
                      {e.url}
                    </div>
                    <div className="text-xs muted mt-2">
                      Events: <span className="mono">{e.eventTypes.join(', ')}</span>
                    </div>
                    <div className="text-xs muted-2 mt-1">
                      Secret ends in{' '}
                      <span className="mono">…{e.signingSecretSuffix}</span> · created{' '}
                      {new Date(e.createdAt).toLocaleDateString('en-NG')}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteEndpoint(e.id)}
                    className="text-xs"
                    style={{
                      color: 'var(--danger)',
                      background: 'transparent',
                      border: 0,
                      padding: '6px 10px',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Recent deliveries ────────────────────────────────────── */}
      <section className="wrap" style={{ paddingBottom: 64 }}>
        <div className="card" style={{ padding: 24 }}>
          <h2 className="h-4" style={{ margin: 0 }}>
            Recent deliveries
          </h2>
          <p className="text-xs muted mt-1">
            Last 100 attempted deliveries across your endpoints. Failed deliveries retry on
            exponential back-off (1 m → 5 m → 30 m → 2 h → 8 h → 24 h) for up to 6 attempts.
          </p>
          {deliveries.length === 0 ? (
            <p className="text-sm muted mt-4">Nothing yet.</p>
          ) : (
            <div style={{ overflowX: 'auto', marginTop: 16 }}>
              <table
                style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}
              >
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--line)' }}>
                    {['Event', 'Endpoint', 'Status', 'Attempts', 'When', ''].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: 'left',
                          padding: '10px 12px',
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
                  {deliveries.map((d) => (
                    <tr key={d.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td className="mono text-xs" style={{ padding: '12px' }}>
                        {d.event}
                      </td>
                      <td
                        className="mono text-xs"
                        style={{ padding: '12px', wordBreak: 'break-all', maxWidth: 280 }}
                      >
                        {d.endpoint.url}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <DeliveryBadge status={d.status} responseStatus={d.responseStatus} />
                      </td>
                      <td style={{ padding: '12px' }}>{d.attemptCount}</td>
                      <td className="muted text-xs" style={{ padding: '12px' }}>
                        {new Date(d.createdAt).toLocaleString('en-NG')}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        {d.status !== 'DELIVERED' ? (
                          <button
                            type="button"
                            onClick={async () => {
                              setRetrying(d.id);
                              try {
                                await api.retryWebhookDelivery(
                                  getToken()!,
                                  params.slug,
                                  d.id,
                                );
                                await load();
                              } finally {
                                setRetrying(null);
                              }
                            }}
                            disabled={retrying === d.id}
                            className="text-xs accent-text"
                            style={{
                              background: 'transparent',
                              border: 0,
                              cursor: 'pointer',
                            }}
                          >
                            {retrying === d.id ? 'Retrying…' : 'Retry now'}
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function RevealOnce({
  title,
  hint,
  value,
  onDismiss,
}: {
  title: string;
  hint: React.ReactNode;
  value: string;
  onDismiss: () => void;
}) {
  return (
    <div
      className="card"
      style={{
        padding: 18,
        background: 'oklch(0.80 0.16 75 / 0.18)',
        borderColor: 'oklch(0.65 0.18 75)',
        marginBottom: 4,
      }}
    >
      <div className="row gap-2" style={{ alignItems: 'center' }}>
        <Icon name="info" size={16} stroke={2.5} />
        <span className="fw-600">{title}</span>
      </div>
      <p className="text-xs muted mt-1">{hint}</p>
      <pre
        className="card mt-3 mono text-xs"
        style={{
          padding: 12,
          margin: 0,
          background: 'var(--surface)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
      >
        {value}
      </pre>
      <button
        type="button"
        onClick={onDismiss}
        className="text-xs mt-3"
        style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--ink-2)' }}
      >
        Dismiss
      </button>
    </div>
  );
}

function DeliveryBadge({
  status,
  responseStatus,
}: {
  status: 'PENDING' | 'DELIVERED' | 'FAILED';
  responseStatus: number | null;
}) {
  const tone =
    status === 'DELIVERED'
      ? { bg: 'var(--accent-soft)', color: 'var(--accent)' }
      : status === 'FAILED'
        ? { bg: 'oklch(0.65 0.22 25 / 0.12)', color: 'var(--danger)' }
        : { bg: 'oklch(0.80 0.16 75 / 0.18)', color: 'oklch(0.55 0.16 75)' };
  return (
    <span
      className="badge"
      style={{
        background: tone.bg,
        color: tone.color,
      }}
    >
      {status}
      {responseStatus ? ` ${responseStatus}` : ''}
    </span>
  );
}
