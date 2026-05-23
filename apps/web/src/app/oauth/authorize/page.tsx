'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { API_URL } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface DescribeResponse {
  client: { id: string; clientId: string; name: string };
  redirectUri: string;
  scopes: string[];
}

function ConsentInner() {
  const router = useRouter();
  const search = useSearchParams();
  const clientId = search.get('client_id');
  const redirectUri = search.get('redirect_uri');
  const scope = search.get('scope');
  const state = search.get('state') ?? '';

  const [info, setInfo] = useState<DescribeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      router.replace(`/signin?next=${next}`);
      return;
    }
    if (!clientId || !redirectUri || !scope) {
      setError('Missing client_id, redirect_uri or scope');
      return;
    }
    const qs = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, scope });
    fetch(`${API_URL}/oauth/authorize?${qs}`, { cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).message ?? `HTTP ${r.status}`);
        return r.json() as Promise<DescribeResponse>;
      })
      .then(setInfo)
      .catch((e) => setError(e.message));
  }, [clientId, redirectUri, scope, router]);

  async function approve() {
    if (!info) return;
    setBusy(true);
    try {
      const res = await fetch(`${API_URL}/oauth/authorize/grant`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ client_id: clientId, redirect_uri: redirectUri, scope }),
      });
      if (!res.ok) throw new Error((await res.json()).message ?? `HTTP ${res.status}`);
      const { code } = (await res.json()) as { code: string };
      const url = new URL(redirectUri!);
      url.searchParams.set('code', code);
      if (state) url.searchParams.set('state', state);
      window.location.href = url.toString();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
      setBusy(false);
    }
  }

  function deny() {
    if (!redirectUri) return;
    const url = new URL(redirectUri);
    url.searchParams.set('error', 'access_denied');
    if (state) url.searchParams.set('state', state);
    window.location.href = url.toString();
  }

  if (error) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <h1 className="auth-card-title">Couldn&apos;t authorize</h1>
          <p className="auth-card-sub" style={{ color: 'var(--danger)' }}>
            {error}
          </p>
        </div>
      </div>
    );
  }
  if (!info) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <p className="muted">Loading consent…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="eyebrow mb-2">OAuth consent</div>
        <h1 className="auth-card-title">Authorize {info.client.name}</h1>
        <p className="auth-card-sub">
          <strong style={{ color: 'var(--ink)' }}>{info.client.name}</strong> wants to
          access your Computicket account with the following permissions:
        </p>
        <ul
          className="col gap-2 mt-4"
          style={{ listStyle: 'none', margin: '16px 0 0', padding: 0 }}
        >
          {info.scopes.map((s) => (
            <li
              key={s}
              className="row gap-2"
              style={{
                alignItems: 'center',
                padding: '10px 12px',
                background: 'var(--surface-2)',
                borderRadius: 'var(--r-2)',
              }}
            >
              <Icon name="check" size={13} stroke={2.5} style={{ color: 'var(--accent)' }} />
              <code className="mono text-sm">{s}</code>
            </li>
          ))}
        </ul>
        <p className="text-xs muted mt-4" style={{ lineHeight: 1.55 }}>
          You will be redirected to{' '}
          <code className="mono" style={{ wordBreak: 'break-all', color: 'var(--ink-2)' }}>
            {info.redirectUri}
          </code>
        </p>
        <div className="row gap-3 mt-6" style={{ alignItems: 'stretch' }}>
          <button
            type="button"
            onClick={approve}
            disabled={busy}
            className="btn btn-accent btn-lg"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            {busy ? 'Authorizing…' : 'Authorize'}
          </button>
          <button
            type="button"
            onClick={deny}
            className="btn btn-ghost btn-lg"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConsentPage() {
  return (
    <Suspense fallback={null}>
      <ConsentInner />
    </Suspense>
  );
}
