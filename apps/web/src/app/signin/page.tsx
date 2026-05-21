'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
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
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <p className="mt-2 text-sm text-gray-600">
        {challengeToken
          ? 'Enter the 6-digit code from your authenticator app.'
          : 'Access your tickets, bookings, and organizer dashboard.'}
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        {!challengeToken && (
          <>
            <div>
              <label htmlFor="signin-email" className="sr-only">Email address</label>
              <input
                id="signin-email" type="email" required placeholder="Email" autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="signin-password" className="sr-only">Password</label>
              <input
                id="signin-password" type="password" required minLength={8}
                placeholder="Password" autoComplete="current-password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </>
        )}
        {challengeToken && (
          <div>
            <label htmlFor="signin-totp" className="sr-only">Two-factor authentication code</label>
            <input
              id="signin-totp" type="text" required inputMode="numeric"
              autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6}
              placeholder="6-digit code"
              value={totpCode} onChange={(e) => setTotpCode(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono tracking-widest text-center text-lg"
              autoFocus
            />
          </div>
        )}
        {error && (
          <div className="text-sm text-red-600" role="alert" aria-live="polite">{error}</div>
        )}
        <button
          type="submit" disabled={submitting}
          className="w-full bg-brand text-white font-medium py-2.5 rounded-md hover:bg-brand-dark disabled:bg-gray-300"
        >
          {submitting ? 'Signing in…' : challengeToken ? 'Verify' : 'Sign in'}
        </button>
      </form>
      <div className="mt-6 text-sm text-gray-600 flex justify-between">
        <Link href="/signup" className="text-brand-dark hover:underline">Create an account</Link>
        <Link href="/forgot-password" className="text-brand-dark hover:underline">Forgot password?</Link>
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
