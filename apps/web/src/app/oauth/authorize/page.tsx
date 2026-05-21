'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
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

  if (error) return <div className="max-w-md mx-auto px-4 py-16 text-red-600">{error}</div>;
  if (!info) return <div className="max-w-md mx-auto px-4 py-16 text-gray-500">Loading…</div>;

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold">Authorize {info.client.name}</h1>
      <p className="mt-3 text-gray-700">
        <strong>{info.client.name}</strong> wants to access your Computicket account with the
        following permissions:
      </p>
      <ul className="mt-4 space-y-2">
        {info.scopes.map((s) => (
          <li key={s} className="flex gap-2 text-sm">
            <span className="text-brand-dark">●</span>
            <code className="font-mono">{s}</code>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-gray-500">
        You will be redirected to <code className="break-all">{info.redirectUri}</code>
      </p>
      <div className="mt-8 flex gap-3">
        <button
          onClick={approve}
          disabled={busy}
          className="flex-1 bg-brand text-white font-medium py-2.5 rounded-md hover:bg-brand-dark disabled:bg-gray-300"
        >
          {busy ? 'Authorizing…' : 'Authorize'}
        </button>
        <button
          onClick={deny}
          className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
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
