'use client';

import { useState } from 'react';
import { API_URL } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/auth/password-reset/request`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const b = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(b.message ?? `HTTP ${res.status}`);
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-card-title">Forgot password</h1>
        {sent ? (
          <p className="auth-card-sub">
            If an account exists for that email, a reset link is on its way. The link
            expires in 1 hour.
          </p>
        ) : (
          <>
            <p className="auth-card-sub">
              Enter your email and we&apos;ll send you a link to set a new password.
            </p>
            <form onSubmit={handleSubmit} className="auth-form">
              <label htmlFor="forgot-email" className="sr-only">Email</label>
              <input
                id="forgot-email"
                type="email"
                required
                placeholder="Email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                {submitting ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
