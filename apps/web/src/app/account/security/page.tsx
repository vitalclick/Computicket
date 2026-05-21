'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';
import { getToken, signOut } from '@/lib/auth';

interface SecurityStatus {
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  totpEnabled: boolean;
  totpEnabledAt: string | null;
}

interface TotpSetup {
  secret: string;
  otpauthUri: string;
}

interface SessionRow {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  lastUsedAt: string;
  current: boolean;
}

export default function SecurityPage() {
  const router = useRouter();
  const [token, setTokenState] = useState<string | null>(null);
  const [status, setStatus] = useState<SecurityStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [setup, setSetup] = useState<TotpSetup | null>(null);
  const [code, setCode] = useState('');
  const [disablePw, setDisablePw] = useState('');
  const [deletePw, setDeletePw] = useState('');
  const [sessions, setSessions] = useState<SessionRow[]>([]);

  useEffect(() => {
    const t = getToken();
    if (!t) {
      router.replace('/signin?next=/account/security');
      return;
    }
    setTokenState(t);
    void refresh(t);
  }, [router]);

  async function refresh(t: string) {
    const [secRes, sessRes] = await Promise.all([
      fetch(`${API_URL}/me/security`, {
        headers: { authorization: `Bearer ${t}` },
        cache: 'no-store',
      }),
      fetch(`${API_URL}/me/sessions`, {
        headers: { authorization: `Bearer ${t}` },
        cache: 'no-store',
      }),
    ]);
    if (secRes.ok) setStatus((await secRes.json()) as SecurityStatus);
    if (sessRes.ok) setSessions((await sessRes.json()) as SessionRow[]);
  }

  async function revokeSession(id: string) {
    if (!token) return;
    await fetch(`${API_URL}/me/sessions/${id}`, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${token}` },
    });
    setInfo('Session revoked.');
    await refresh(token);
  }

  async function revokeOthers() {
    if (!token) return;
    const res = await fetch(`${API_URL}/me/sessions`, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const body = (await res.json()) as { revokedCount: number };
      setInfo(`Signed out of ${body.revokedCount} other session${body.revokedCount === 1 ? '' : 's'}.`);
      await refresh(token);
    }
  }

  async function call<T>(path: string, init?: RequestInit): Promise<T> {
    if (!token) throw new Error('Not signed in');
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) {
      const b = (await res.json().catch(() => ({}))) as { message?: string };
      throw new Error(b.message ?? `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  }

  async function requestVerify() {
    setError(null); setInfo(null);
    try {
      await call('/me/security/email-verify/request', { method: 'POST' });
      setInfo('Verification email sent. Check your inbox.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
  }

  async function startTotp() {
    setError(null); setInfo(null);
    try { setSetup(await call<TotpSetup>('/me/security/2fa/setup', { method: 'POST' })); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
  }

  async function enableTotp() {
    setError(null); setInfo(null);
    try {
      await call('/me/security/2fa/enable', { method: 'POST', body: JSON.stringify({ code }) });
      setSetup(null);
      setCode('');
      setInfo('Two-factor authentication is now active.');
      if (token) await refresh(token);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
  }

  async function disableTotp() {
    setError(null); setInfo(null);
    try {
      await call('/me/security/2fa/disable', { method: 'POST', body: JSON.stringify({ password: disablePw }) });
      setDisablePw('');
      setInfo('Two-factor authentication disabled.');
      if (token) await refresh(token);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
  }

  async function exportData() {
    if (!token) return;
    const res = await fetch(`${API_URL}/me/data-export`, { headers: { authorization: `Bearer ${token}` } });
    if (!res.ok) { setError('Export failed'); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `computicket-data-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function deleteAccount() {
    setError(null); setInfo(null);
    if (!confirm('This permanently scrubs your personal data. Order history is retained for accounting. Continue?')) return;
    try {
      await call('/me/account', { method: 'DELETE', body: JSON.stringify({ password: deletePw }) });
      signOut();
      router.replace('/');
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
  }

  if (!status) return <div className="max-w-2xl mx-auto px-4 py-16 text-gray-500">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-semibold">Account security</h1>
      {info && <div className="rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-3 py-2">{info}</div>}
      {error && <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{error}</div>}

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="font-semibold">Email verification</h2>
        <p className="text-sm text-gray-600 mt-1">
          {status.emailVerified
            ? `Verified ${status.emailVerifiedAt ? `on ${new Date(status.emailVerifiedAt).toLocaleDateString('en-NG')}` : ''}.`
            : 'Your email is not verified yet.'}
        </p>
        {!status.emailVerified && (
          <button onClick={requestVerify} className="mt-3 rounded-md bg-emerald-700 text-white px-4 py-2 text-sm">
            Send verification email
          </button>
        )}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="font-semibold">Two-factor authentication</h2>
        {status.totpEnabled ? (
          <>
            <p className="text-sm text-gray-600 mt-1">
              Active since {status.totpEnabledAt ? new Date(status.totpEnabledAt).toLocaleDateString('en-NG') : ''}.
            </p>
            <div className="mt-3 flex gap-2">
              <input
                type="password" placeholder="Current password"
                value={disablePw} onChange={(e) => setDisablePw(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <button onClick={disableTotp} className="rounded-md bg-red-600 text-white px-4 py-2 text-sm">
                Disable
              </button>
            </div>
          </>
        ) : setup ? (
          <>
            <p className="text-sm text-gray-600 mt-1">
              Scan this URI in Google Authenticator, 1Password, Authy, etc., then enter the 6-digit code.
            </p>
            <pre className="mt-2 text-xs bg-gray-50 border border-gray-200 rounded p-2 break-all">{setup.otpauthUri}</pre>
            <p className="mt-2 text-xs text-gray-500">Or enter the secret manually: <span className="font-mono">{setup.secret}</span></p>
            <div className="mt-3 flex gap-2">
              <input
                type="text" inputMode="numeric" maxLength={6} pattern="[0-9]{6}"
                placeholder="6-digit code"
                value={code} onChange={(e) => setCode(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-mono tracking-widest text-center"
              />
              <button onClick={enableTotp} className="rounded-md bg-emerald-700 text-white px-4 py-2 text-sm">
                Enable
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600 mt-1">Protect your account with a TOTP authenticator app.</p>
            <button onClick={startTotp} className="mt-3 rounded-md bg-emerald-700 text-white px-4 py-2 text-sm">
              Set up 2FA
            </button>
          </>
        )}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="font-semibold">Active sessions</h2>
        <p className="text-sm text-gray-600 mt-1">
          Devices currently signed into your account. Revoke any session to
          immediately invalidate its token.
        </p>
        <ul className="mt-3 divide-y divide-gray-100 text-sm">
          {sessions.map((s) => (
            <li key={s.id} className="py-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate">
                  {s.userAgent ?? <span className="text-gray-400">Unknown device</span>}
                  {s.current && (
                    <span className="ml-2 text-xs font-medium text-emerald-700">this device</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  IP {s.ipAddress ?? 'unknown'} · last seen {new Date(s.lastUsedAt).toLocaleString('en-NG')}
                </div>
              </div>
              {!s.current && (
                <button
                  onClick={() => void revokeSession(s.id)}
                  className="rounded-md bg-gray-100 border border-gray-300 px-3 py-1.5 text-xs"
                >
                  Revoke
                </button>
              )}
            </li>
          ))}
        </ul>
        {sessions.length > 1 && (
          <button
            onClick={revokeOthers}
            className="mt-3 rounded-md bg-red-600 text-white px-4 py-2 text-sm"
          >
            Sign out of all other sessions
          </button>
        )}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="font-semibold">Your data (NDPR)</h2>
        <p className="text-sm text-gray-600 mt-1">
          Download everything we hold about you, or close your account. Closing
          scrubs your personal details but retains order history for accounting.
        </p>
        <div className="mt-3 flex gap-2">
          <button onClick={exportData} className="rounded-md bg-gray-100 text-gray-900 px-4 py-2 text-sm border border-gray-300">
            Export my data
          </button>
        </div>
        <div className="mt-4 border-t pt-4">
          <div className="flex gap-2">
            <input
              type="password" placeholder="Confirm password to delete"
              value={deletePw} onChange={(e) => setDeletePw(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <button onClick={deleteAccount} className="rounded-md bg-red-600 text-white px-4 py-2 text-sm">
              Delete account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
