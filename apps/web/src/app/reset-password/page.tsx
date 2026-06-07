'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { API_URL } from '@/lib/api';

function ResetForm() {
  const router = useRouter();
  const search = useSearchParams();
  const token = search.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError('Password must be at least 8 characters');
    if (password !== confirm) return setError('Passwords do not match');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/auth/password-reset/confirm`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      if (!res.ok) {
        const b = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(b.message ?? `HTTP ${res.status}`);
      }
      setDone(true);
      setTimeout(() => router.push('/signin'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <h1 className="auth-card-title">Missing reset token</h1>
          <p className="auth-card-sub">
            The reset link is invalid.{' '}
            <Link href="/forgot-password" className="accent-text">
              Request a new one
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-card-title">Set a new password</h1>
        {done ? (
          <p className="auth-card-sub" style={{ color: 'var(--accent)' }}>
            Password updated. Redirecting to sign in…
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <label htmlFor="reset-password" className="sr-only">New password</label>
            <input
              id="reset-password"
              type="password"
              required
              minLength={8}
              placeholder="New password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
            <label htmlFor="reset-confirm" className="sr-only">Confirm new password</label>
            <input
              id="reset-confirm"
              type="password"
              required
              minLength={8}
              placeholder="Confirm new password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="input"
            />
            {error ? (
              <div className="text-sm" style={{ color: 'var(--danger)' }}>
                {error}
              </div>
            ) : null}
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-accent btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {submitting ? 'Saving…' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}
