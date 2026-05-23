'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

/**
 * Passwordless sign-in request form. The backend always returns
 * { sent: true } so we mirror that — the success message is identical
 * regardless of whether the email is known. No enumeration possible.
 */
export function MagicLinkForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.magicLinkRequest(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send link');
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div
        className="card"
        style={{
          padding: 20,
          background: 'var(--accent-soft)',
          border: '1px solid oklch(0.68 0.18 152 / .3)',
        }}
      >
        <div className="fw-600">Check your email.</div>
        <p className="text-sm muted mt-2" style={{ lineHeight: 1.55 }}>
          If <span className="mono">{email}</span> is on file, a sign-in link is on
          its way. The link works once and expires in 15 minutes.
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setEmail('');
          }}
          className="btn btn-ghost btn-sm mt-3"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="col gap-2">
      <label className="text-sm muted" htmlFor="magic-link-email">
        Email me a sign-in link instead
      </label>
      <div className="row gap-2">
        <input
          id="magic-link-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="input"
          style={{ flex: 1 }}
        />
        <button
          type="submit"
          disabled={busy || !email}
          className="btn btn-accent"
        >
          {busy ? 'Sending…' : 'Send link'}
        </button>
      </div>
      {error ? (
        <p role="alert" className="text-sm" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      ) : null}
    </form>
  );
}
