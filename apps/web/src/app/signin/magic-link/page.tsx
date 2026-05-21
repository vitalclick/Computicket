'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { api } from '@/lib/api';
import { setToken } from '@/lib/auth';

type Status = 'verifying' | 'success' | 'expired' | 'invalid' | 'used' | 'error';

function MagicLinkConsumer() {
  const router = useRouter();
  const search = useSearchParams();
  const token = search.get('token');
  const next = search.get('next') ?? '/account';
  const [status, setStatus] = useState<Status>('verifying');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const auth = await api.magicLinkConfirm(token);
        if (cancelled) return;
        setToken(auth.token);
        setStatus('success');
        // Tiny delay so the success state flashes before navigation.
        setTimeout(() => router.replace(next), 600);
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message.toLowerCase() : '';
        if (msg.includes('expired')) setStatus('expired');
        else if (msg.includes('already used')) setStatus('used');
        else if (msg.includes('invalid')) setStatus('invalid');
        else {
          setStatus('error');
          setMessage(e instanceof Error ? e.message : 'Something went wrong');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, next, router]);

  return (
    <div className="wrap" style={{ maxWidth: 520, padding: '96px 24px' }}>
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        {status === 'verifying' ? (
          <>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Icon name="refresh" size={22} />
            </div>
            <h1 className="h-3">Signing you in…</h1>
            <p className="muted mt-2">Verifying your link with Computicket.</p>
          </>
        ) : status === 'success' ? (
          <>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'var(--accent)',
                color: 'white',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Icon name="check" size={22} stroke={2.5} />
            </div>
            <h1 className="h-3">You&apos;re in.</h1>
            <p className="muted mt-2">Redirecting to your account…</p>
          </>
        ) : (
          <>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'oklch(0.65 0.22 25 / 0.15)',
                color: 'var(--danger)',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Icon name="close" size={22} stroke={2.5} />
            </div>
            <h1 className="h-3">
              {status === 'expired' && 'This link has expired'}
              {status === 'used' && 'This link was already used'}
              {status === 'invalid' && 'Invalid sign-in link'}
              {status === 'error' && "Something didn't work"}
            </h1>
            <p className="muted mt-2" style={{ lineHeight: 1.6 }}>
              {status === 'expired' && (
                <>Magic links expire 15 minutes after they&apos;re sent. Request a fresh one — it takes a second.</>
              )}
              {status === 'used' && (
                <>For your safety, each link works once. Request a new one from the sign-in page.</>
              )}
              {status === 'invalid' && (
                <>The token in this URL is unrecognised. If you copied the link from your email and it broke across lines, try again — request a fresh one below.</>
              )}
              {status === 'error' && message}
            </p>
            <div
              className="row mt-6 gap-3"
              style={{ justifyContent: 'center' }}
            >
              <Link href="/signin" className="btn btn-accent">
                Request a new link <Icon name="arrow" size={14} />
              </Link>
              <Link href="/help" className="btn btn-ghost">
                Get help
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MagicLinkConsumePage() {
  return (
    <Suspense fallback={null}>
      <MagicLinkConsumer />
    </Suspense>
  );
}
