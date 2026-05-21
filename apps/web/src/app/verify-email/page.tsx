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
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Email verification</h1>
      {state === 'pending' && <p className="mt-4 text-sm text-gray-600">Confirming your email…</p>}
      {state === 'ok' && (
        <>
          <p className="mt-4 text-emerald-700">Your email is verified.</p>
          <Link href="/account" className="mt-6 inline-block text-brand-dark hover:underline">Continue to your account</Link>
        </>
      )}
      {state === 'fail' && (
        <>
          <p className="mt-4 text-red-600">{error}</p>
          <Link href="/account" className="mt-6 inline-block text-brand-dark hover:underline">Go to account</Link>
        </>
      )}
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
