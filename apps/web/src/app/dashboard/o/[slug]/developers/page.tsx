'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
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
  const [endpoints, setEndpoints] = useState<Awaited<ReturnType<typeof api.listWebhookEndpoints>>>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reveal-once values shown after creation
  const [newKey, setNewKey] = useState<{ name: string; key: string } | null>(null);
  const [newSecret, setNewSecret] = useState<{ url: string; secret: string } | null>(null);

  // Forms
  const [keyName, setKeyName] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [endpointUrl, setEndpointUrl] = useState('');
  const [endpointTypes, setEndpointTypes] = useState<string[]>([...EVENT_TYPES]);
  const [creatingEndpoint, setCreatingEndpoint] = useState(false);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace('/dashboard/signin');
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
      alert(err instanceof Error ? err.message : 'Failed');
    } finally {
      setCreatingKey(false);
    }
  }

  async function revokeKey(id: string) {
    if (!confirm('Revoke this API key? Any integration using it will stop working.')) return;
    try {
      const token = getToken()!;
      await api.revokeApiKey(token, params.slug, id);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    }
  }

  async function createEndpoint(e: React.FormEvent) {
    e.preventDefault();
    if (endpointTypes.length === 0) return;
    setCreatingEndpoint(true);
    try {
      const token = getToken()!;
      const res = await api.createWebhookEndpoint(token, params.slug, {
        url: endpointUrl,
        eventTypes: endpointTypes,
      });
      setNewSecret({ url: res.url, secret: res.signingSecret });
      setEndpointUrl('');
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    } finally {
      setCreatingEndpoint(false);
    }
  }

  async function deleteEndpoint(id: string) {
    if (!confirm('Delete this webhook endpoint?')) return;
    try {
      const token = getToken()!;
      await api.deleteWebhookEndpoint(token, params.slug, id);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    }
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-16 text-gray-500">Loading…</div>;
  if (error) return <div className="max-w-4xl mx-auto px-4 py-16 text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link href={`/dashboard/o/${params.slug}`} className="text-sm text-gray-500 hover:text-brand-dark">
        ← {params.slug}
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Developers</h1>
      <p className="mt-2 text-sm text-gray-600">
        Build server-to-server integrations with API keys, get notified of events with webhooks,
        or drop a <a href="/widget-demo" target="_blank" rel="noreferrer" className="text-brand-dark hover:underline">buy button</a> on your own website.
      </p>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">API keys</h2>
        <p className="text-sm text-gray-600 mt-1">
          Authenticate server-to-server calls to <code>/api/v1/*</code> with the{' '}
          <code>Authorization: Bearer ctng_live_…</code> header.
        </p>

        {newKey && (
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
            <div className="text-sm font-semibold text-amber-900">Save this key now</div>
            <div className="text-xs text-amber-800 mt-1">
              You won&apos;t be able to see <em>{newKey.name}</em>&apos;s key value again.
            </div>
            <pre className="mt-3 bg-white border border-amber-200 p-3 rounded font-mono text-xs break-all">
              {newKey.key}
            </pre>
            <button
              onClick={() => setNewKey(null)}
              className="mt-2 text-xs text-amber-700 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={createKey} className="mt-4 flex gap-2">
          <input
            type="text"
            required
            placeholder="Key name (e.g. Production server)"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={creatingKey}
            className="bg-brand text-white px-4 py-2 rounded-md hover:bg-brand-dark disabled:bg-gray-300 text-sm"
          >
            {creatingKey ? 'Creating…' : 'Create key'}
          </button>
        </form>

        {keys.length === 0 ? (
          <p className="mt-6 text-sm text-gray-500">No keys yet.</p>
        ) : (
          <table className="mt-4 w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
              <tr>
                <th className="py-2">Name</th>
                <th className="py-2">Prefix</th>
                <th className="py-2">Created</th>
                <th className="py-2">Last used</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id} className="border-b border-gray-100">
                  <td className="py-3">{k.name}</td>
                  <td className="py-3 font-mono text-xs">{k.prefix}…</td>
                  <td className="py-3 text-gray-500">{new Date(k.createdAt).toLocaleDateString('en-NG')}</td>
                  <td className="py-3 text-gray-500">{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString('en-NG') : '—'}</td>
                  <td className="py-3 text-right">
                    {k.revokedAt ? (
                      <span className="text-gray-400 text-xs">revoked</span>
                    ) : (
                      <button onClick={() => revokeKey(k.id)} className="text-red-600 hover:underline text-xs">
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Webhook endpoints</h2>
        <p className="text-sm text-gray-600 mt-1">
          We send signed POST requests for events you subscribe to. Verify the{' '}
          <code>X-Computicket-Signature</code> header with HMAC SHA-256 of the body using the endpoint&apos;s signing secret.
        </p>

        {newSecret && (
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
            <div className="text-sm font-semibold text-amber-900">Save this signing secret now</div>
            <div className="text-xs text-amber-800 mt-1">
              For endpoint <strong>{newSecret.url}</strong> — you won&apos;t see the full secret again.
            </div>
            <pre className="mt-3 bg-white border border-amber-200 p-3 rounded font-mono text-xs break-all">
              {newSecret.secret}
            </pre>
            <button
              onClick={() => setNewSecret(null)}
              className="mt-2 text-xs text-amber-700 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={createEndpoint} className="mt-4 space-y-3">
          <input
            type="url"
            required
            placeholder="https://your-server.com/computicket/webhook"
            value={endpointUrl}
            onChange={(e) => setEndpointUrl(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-3 text-sm">
            {EVENT_TYPES.map((t) => (
              <label key={t} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={endpointTypes.includes(t)}
                  onChange={(e) =>
                    setEndpointTypes((arr) =>
                      e.target.checked ? [...arr, t] : arr.filter((x) => x !== t),
                    )
                  }
                />
                <code>{t}</code>
              </label>
            ))}
          </div>
          <button
            type="submit"
            disabled={creatingEndpoint || endpointTypes.length === 0}
            className="bg-brand text-white px-4 py-2 rounded-md hover:bg-brand-dark disabled:bg-gray-300 text-sm"
          >
            {creatingEndpoint ? 'Creating…' : 'Add endpoint'}
          </button>
        </form>

        {endpoints.length === 0 ? (
          <p className="mt-6 text-sm text-gray-500">No endpoints yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {endpoints.map((e) => (
              <li key={e.id} className="border border-gray-200 rounded-lg p-3 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-mono text-sm break-all">{e.url}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Events: {e.eventTypes.join(', ')}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Secret ends in <span className="font-mono">…{e.signingSecretSuffix}</span> · created{' '}
                    {new Date(e.createdAt).toLocaleDateString('en-NG')}
                  </div>
                </div>
                <button onClick={() => deleteEndpoint(e.id)} className="text-red-600 hover:underline text-xs shrink-0">
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Recent deliveries</h2>
        <p className="text-sm text-gray-600 mt-1">
          Last 100 attempted deliveries across your endpoints. Failed deliveries retry on a back-off
          schedule (1m, 5m, 30m, 2h, 8h, 24h) for up to 6 attempts.
        </p>
        {deliveries.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">Nothing yet.</p>
        ) : (
          <table className="mt-3 w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
              <tr>
                <th className="py-2">Event</th>
                <th className="py-2">Endpoint</th>
                <th className="py-2">Status</th>
                <th className="py-2">Attempts</th>
                <th className="py-2">When</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d) => (
                <tr key={d.id} className="border-b border-gray-100">
                  <td className="py-3 font-mono text-xs">{d.event}</td>
                  <td className="py-3 font-mono text-xs break-all max-w-xs">{d.endpoint.url}</td>
                  <td className="py-3">
                    <span className={deliveryBadge(d.status)}>
                      {d.status}
                      {d.responseStatus && ` (${d.responseStatus})`}
                    </span>
                  </td>
                  <td className="py-3">{d.attemptCount}</td>
                  <td className="py-3 text-gray-500">{new Date(d.createdAt).toLocaleString('en-NG')}</td>
                  <td className="py-3 text-right">
                    {d.status !== 'DELIVERED' && (
                      <button
                        onClick={async () => {
                          setRetrying(d.id);
                          try {
                            await api.retryWebhookDelivery(getToken()!, params.slug, d.id);
                            await load();
                          } finally {
                            setRetrying(null);
                          }
                        }}
                        disabled={retrying === d.id}
                        className="text-brand-dark hover:underline text-xs disabled:text-gray-400"
                      >
                        {retrying === d.id ? 'Retrying…' : 'Retry now'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function deliveryBadge(status: 'PENDING' | 'DELIVERED' | 'FAILED'): string {
  const base = 'px-2 py-0.5 rounded-md text-xs font-medium';
  if (status === 'DELIVERED') return `${base} bg-green-50 text-green-700`;
  if (status === 'FAILED') return `${base} bg-red-50 text-red-700`;
  return `${base} bg-amber-50 text-amber-800`;
}
