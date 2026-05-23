'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
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
      setInfo(
        `Signed out of ${body.revokedCount} other session${body.revokedCount === 1 ? '' : 's'}.`,
      );
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
    setError(null);
    setInfo(null);
    try {
      await call('/me/security/email-verify/request', { method: 'POST' });
      setInfo('Verification email sent. Check your inbox.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  }

  async function startTotp() {
    setError(null);
    setInfo(null);
    try {
      setSetup(await call<TotpSetup>('/me/security/2fa/setup', { method: 'POST' }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  }

  async function enableTotp() {
    setError(null);
    setInfo(null);
    try {
      await call('/me/security/2fa/enable', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      setSetup(null);
      setCode('');
      setInfo('Two-factor authentication is now active.');
      if (token) await refresh(token);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  }

  async function disableTotp() {
    setError(null);
    setInfo(null);
    try {
      await call('/me/security/2fa/disable', {
        method: 'POST',
        body: JSON.stringify({ password: disablePw }),
      });
      setDisablePw('');
      setInfo('Two-factor authentication disabled.');
      if (token) await refresh(token);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  }

  async function exportData() {
    if (!token) return;
    const res = await fetch(`${API_URL}/me/data-export`, {
      headers: { authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      setError('Export failed');
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `computicket-data-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function deleteAccount() {
    setError(null);
    setInfo(null);
    if (
      !confirm(
        'This permanently scrubs your personal data. Order history is retained for accounting. Continue?',
      )
    )
      return;
    try {
      await call('/me/account', {
        method: 'DELETE',
        body: JSON.stringify({ password: deletePw }),
      });
      signOut();
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  }

  if (!status) {
    return (
      <div className="wrap" style={{ paddingTop: 48, paddingBottom: 96, maxWidth: 720 }}>
        <p className="muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="page-enter wrap" style={{ paddingTop: 32, paddingBottom: 96, maxWidth: 720 }}>
      <Link
        href="/account"
        className="row gap-1 text-sm muted"
        style={{ alignItems: 'center', textDecoration: 'none' }}
      >
        <Icon name="chevron" size={12} style={{ transform: 'rotate(180deg)' }} />
        <span>Account</span>
      </Link>
      <h1 className="h-2 mt-2" style={{ margin: '8px 0 0' }}>
        Account security
      </h1>

      {info ? <Banner kind="ok" message={info} /> : null}
      {error ? <Banner kind="err" message={error} /> : null}

      {/* Email verification */}
      <section className="card mt-6" style={{ padding: 22 }}>
        <div className="row gap-3" style={{ alignItems: 'flex-start' }}>
          <SectionIcon name="check" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="h-4">Email verification</h2>
            <p className="text-sm muted mt-2" style={{ lineHeight: 1.55 }}>
              {status.emailVerified
                ? `Verified ${status.emailVerifiedAt ? `on ${new Date(status.emailVerifiedAt).toLocaleDateString('en-NG')}` : ''}.`
                : 'Your email is not verified yet.'}
            </p>
            {!status.emailVerified ? (
              <button type="button" onClick={requestVerify} className="btn btn-accent btn-sm mt-3">
                Send verification email
              </button>
            ) : null}
          </div>
          {status.emailVerified ? (
            <span
              className="badge"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              Verified
            </span>
          ) : null}
        </div>
      </section>

      {/* 2FA */}
      <section className="card mt-3" style={{ padding: 22 }}>
        <div className="row gap-3" style={{ alignItems: 'flex-start' }}>
          <SectionIcon name="shield" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="h-4">Two-factor authentication</h2>
            {status.totpEnabled ? (
              <>
                <p className="text-sm muted mt-2" style={{ lineHeight: 1.55 }}>
                  Active since{' '}
                  {status.totpEnabledAt
                    ? new Date(status.totpEnabledAt).toLocaleDateString('en-NG')
                    : '—'}
                  .
                </p>
                <div className="row gap-2 mt-3" style={{ alignItems: 'stretch' }}>
                  <label htmlFor="disable-2fa-pw" className="sr-only">
                    Current password
                  </label>
                  <input
                    id="disable-2fa-pw"
                    type="password"
                    placeholder="Current password"
                    autoComplete="current-password"
                    value={disablePw}
                    onChange={(e) => setDisablePw(e.target.value)}
                    className="input"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={disableTotp}
                    className="btn btn-ghost"
                    style={{ color: 'var(--danger)', borderColor: 'var(--line)' }}
                  >
                    Disable
                  </button>
                </div>
              </>
            ) : setup ? (
              <>
                <p className="text-sm muted mt-2" style={{ lineHeight: 1.55 }}>
                  Scan this URI in Google Authenticator, 1Password, Authy, etc., then enter the
                  6-digit code.
                </p>
                <pre
                  className="mono mt-2"
                  style={{
                    fontSize: 11,
                    background: 'var(--surface-2)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--r-2)',
                    padding: 10,
                    wordBreak: 'break-all',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {setup.otpauthUri}
                </pre>
                <p className="text-xs muted mt-2">
                  Or enter the secret manually:{' '}
                  <span className="mono" style={{ color: 'var(--ink)' }}>
                    {setup.secret}
                  </span>
                </p>
                <div className="row gap-2 mt-3" style={{ alignItems: 'stretch' }}>
                  <label htmlFor="enable-2fa-code" className="sr-only">
                    Code
                  </label>
                  <input
                    id="enable-2fa-code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    placeholder="6-digit code"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="input mono"
                    style={{ flex: 1, textAlign: 'center', letterSpacing: '.3em' }}
                  />
                  <button type="button" onClick={enableTotp} className="btn btn-accent">
                    Enable
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm muted mt-2" style={{ lineHeight: 1.55 }}>
                  Protect your account with a TOTP authenticator app.
                </p>
                <button type="button" onClick={startTotp} className="btn btn-accent btn-sm mt-3">
                  Set up 2FA
                </button>
              </>
            )}
          </div>
          {status.totpEnabled ? (
            <span
              className="badge"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              Active
            </span>
          ) : null}
        </div>
      </section>

      {/* Sessions */}
      <section className="card mt-3" style={{ padding: 22 }}>
        <div className="row gap-3" style={{ alignItems: 'flex-start' }}>
          <SectionIcon name="user" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="h-4">Active sessions</h2>
            <p className="text-sm muted mt-2" style={{ lineHeight: 1.55 }}>
              Devices currently signed into your account. Revoke any session to immediately
              invalidate its token.
            </p>
            <ul className="col gap-2 mt-3" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {sessions.map((s) => (
                <li
                  key={s.id}
                  className="row gap-3"
                  style={{
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: 'var(--r-2)',
                    background: 'var(--surface-2)',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      className="fw-500 text-sm"
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {s.userAgent ?? 'Unknown device'}
                      {s.current ? (
                        <span className="accent-text text-xs ml-2" style={{ fontWeight: 600 }}>
                          this device
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs muted mt-1">
                      IP {s.ipAddress ?? 'unknown'} · last seen{' '}
                      {new Date(s.lastUsedAt).toLocaleString('en-NG')}
                    </div>
                  </div>
                  {!s.current ? (
                    <button
                      type="button"
                      onClick={() => void revokeSession(s.id)}
                      className="btn btn-ghost btn-sm"
                    >
                      Revoke
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
            {sessions.length > 1 ? (
              <button
                type="button"
                onClick={revokeOthers}
                className="btn btn-ghost btn-sm mt-3"
                style={{ color: 'var(--danger)' }}
              >
                Sign out of all other sessions
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {/* NDPR */}
      <section className="card mt-3" style={{ padding: 22 }}>
        <div className="row gap-3" style={{ alignItems: 'flex-start' }}>
          <SectionIcon name="wallet" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="h-4">Your data (NDPR)</h2>
            <p className="text-sm muted mt-2" style={{ lineHeight: 1.55 }}>
              Download everything we hold about you, or close your account. Closing scrubs your
              personal details but retains order history for accounting.
            </p>
            <button
              type="button"
              onClick={exportData}
              className="btn btn-ghost btn-sm mt-3"
            >
              Export my data
            </button>
            <div
              className="mt-4"
              style={{ paddingTop: 16, borderTop: '1px solid var(--line)' }}
            >
              <div className="row gap-2" style={{ alignItems: 'stretch' }}>
                <label htmlFor="delete-pw" className="sr-only">
                  Confirm password
                </label>
                <input
                  id="delete-pw"
                  type="password"
                  placeholder="Confirm password to delete"
                  autoComplete="current-password"
                  value={deletePw}
                  onChange={(e) => setDeletePw(e.target.value)}
                  className="input"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={deleteAccount}
                  className="btn btn-ghost"
                  style={{ color: 'var(--danger)', borderColor: 'var(--line)' }}
                >
                  Delete account
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Banner({ kind, message }: { kind: 'ok' | 'err'; message: string }) {
  const ok = kind === 'ok';
  return (
    <div
      role={ok ? 'status' : 'alert'}
      aria-live="polite"
      className="card mt-4"
      style={{
        padding: 12,
        background: ok ? 'var(--accent-soft)' : 'oklch(0.65 0.22 25 / 0.12)',
        border: `1px solid ${ok ? 'var(--accent)' : 'var(--danger)'}`,
        color: ok ? 'var(--accent)' : 'var(--danger)',
        fontSize: 13,
      }}
    >
      {message}
    </div>
  );
}

function SectionIcon({ name }: { name: 'check' | 'shield' | 'user' | 'wallet' }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 36,
        height: 36,
        borderRadius: 'var(--r-2)',
        background: 'var(--accent-soft)',
        color: 'var(--accent)',
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
      }}
    >
      <Icon name={name} size={16} />
    </span>
  );
}
