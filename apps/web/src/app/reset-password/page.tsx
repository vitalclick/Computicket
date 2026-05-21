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
      <div className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold">Missing reset token</h1>
        <p className="mt-2 text-sm text-gray-600">
          The reset link is invalid. <Link href="/forgot-password" className="text-brand-dark underline">Request a new one</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold">Set a new password</h1>
      {done ? (
        <p className="mt-4 text-sm text-emerald-700">Password updated. Redirecting to sign in…</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="password" required minLength={8} placeholder="New password"
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
          <input
            type="password" required minLength={8} placeholder="Confirm new password"
            value={confirm} onChange={(e) => setConfirm(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button
            type="submit" disabled={submitting}
            className="w-full bg-brand text-white font-medium py-2.5 rounded-md hover:bg-brand-dark disabled:bg-gray-300"
          >
            {submitting ? 'Saving…' : 'Update password'}
          </button>
        </form>
      )}
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
