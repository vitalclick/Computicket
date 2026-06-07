'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';

function VerifyEmailInner() {
  const search = useSearchParams();
  const token = search.get('token') ?? '';
  const [state, setState] = useState<'pending' | 'ok' | 'fail'>('pending');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setState('fail');
      setError('Missing verification token.');
      return;
    }
    fetch(`${API_URL}/auth/verify-email/confirm?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).message ?? `HTTP ${r.status}`);
        setState('ok');
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Verification failed');
        setState('fail');
      });
  }, [token]);

  return (
    <div className="auth-shell">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <h1 className="auth-card-title">Email verification</h1>
        {state === 'pending' ? (
          <p className="auth-card-sub">Confirming your email…</p>
        ) : null}
        {state === 'ok' ? (
          <>
            <p className="auth-card-sub" style={{ color: 'var(--accent)' }}>
              Your email is verified.
            </p>
            <Link
              href="/account"
              className="btn btn-accent mt-6"
              style={{ justifyContent: 'center' }}
            >
              Continue to your account
            </Link>
          </>
        ) : null}
        {state === 'fail' ? (
          <>
            <p className="auth-card-sub" style={{ color: 'var(--danger)' }}>
              {error}
            </p>
            <Link
              href="/account"
              className="btn btn-ghost mt-6"
              style={{ justifyContent: 'center' }}
            >
              Go to account
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailInner />
    </Suspense>
  );
}
