'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { MagicLinkForm } from '@/components/auth/MagicLinkForm';
import { AuthDivider, SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { API_URL } from '@/lib/api';
import { setToken } from '@/lib/auth';

interface SigninResponse {
  token?: string;
  requires2FA?: boolean;
  challengeToken?: string;
}

function SignInForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') ?? '/account';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const b = (await res.json().catch(() => ({}))) as { message?: string };
      throw new Error(b.message ?? `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (challengeToken) {
        const res = await post<SigninResponse>('/auth/signin/2fa', { challengeToken, totpCode });
        if (res.token) {
          setToken(res.token);
          router.push(next);
        }
        return;
      }
      const res = await post<SigninResponse>('/auth/signin', { email, password });
      if (res.requires2FA && res.challengeToken) {
        setChallengeToken(res.challengeToken);
        setSubmitting(false);
        return;
      }
      if (res.token) {
        setToken(res.token);
        router.push(next);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-card-title">Sign in</h1>
        <p className="auth-card-sub">
          {challengeToken
            ? 'Enter the 6-digit code from your authenticator app.'
            : 'Access your tickets, bookings, and organizer dashboard.'}
        </p>
        {!challengeToken ? (
          <div className="mt-6">
            <SocialAuthButtons next={next} onSuccess={(n) => router.push(n)} />
            <AuthDivider label="or use email" />
          </div>
        ) : null}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {!challengeToken && (
            <>
              <label htmlFor="signin-email" className="sr-only">Email address</label>
              <input
                id="signin-email"
                type="email"
                required
                placeholder="Email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
              <label htmlFor="signin-password" className="sr-only">Password</label>
              <input
                id="signin-password"
                type="password"
                required
                minLength={8}
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
              />
            </>
          )}
          {challengeToken && (
            <>
              <label htmlFor="signin-totp" className="sr-only">
                Two-factor authentication code
              </label>
              <input
                id="signin-totp"
                type="text"
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="6-digit code"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                className="input mono"
                style={{ textAlign: 'center', letterSpacing: '.4em', fontSize: 18 }}
                autoFocus
              />
            </>
          )}
          {error ? (
            <div className="text-sm" role="alert" aria-live="polite" style={{ color: 'var(--danger)' }}>
              {error}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-accent btn-lg"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {submitting ? 'Signing in…' : challengeToken ? 'Verify' : 'Sign in'}
          </button>
        </form>
        {!challengeToken ? (
          <div className="mt-6">
            <AuthDivider label="passwordless" />
            <div className="mt-3">
              <MagicLinkForm />
            </div>
          </div>
        ) : null}
        <div className="auth-card-foot">
          <Link href="/signup">Create an account</Link>
          <Link href="/forgot-password">Forgot password?</Link>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
