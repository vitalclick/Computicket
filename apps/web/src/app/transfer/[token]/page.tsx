'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

type Describe = Awaited<ReturnType<typeof api.describeTicketTransfer>>;

export default function ClaimTransferPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const [info, setInfo] = useState<Describe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState<{ code: string; eventTitle?: string } | null>(
    null,
  );

  useEffect(() => {
    api
      .describeTicketTransfer(params.token)
      .then(setInfo)
      .catch((e) =>
        setError(e instanceof Error ? e.message : 'Couldn\'t open this transfer'),
      );
  }, [params.token]);

  const claim = useCallback(async () => {
    const tok = getToken();
    if (!tok) {
      router.replace(`/signin?next=${encodeURIComponent(`/transfer/${params.token}`)}`);
      return;
    }
    setClaiming(true);
    setError(null);
    try {
      const res = await api.claimTicketTransfer(tok, params.token);
      setClaimed({ code: res.ticketCode, eventTitle: res.eventTitle });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to claim');
    } finally {
      setClaiming(false);
    }
  }, [router, params.token]);

  if (error && !info) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <h1 className="auth-card-title">Couldn&apos;t open transfer</h1>
          <p className="auth-card-sub" style={{ color: 'var(--danger)' }}>
            {error}
          </p>
          <Link href="/" className="btn btn-ghost mt-6" style={{ justifyContent: 'center' }}>
            Back home
          </Link>
        </div>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <p className="muted">Loading transfer…</p>
        </div>
      </div>
    );
  }

  if (claimed) {
    return (
      <div className="auth-shell">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div
            aria-hidden="true"
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--accent)',
              color: 'white',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Icon name="check" size={28} stroke={3} />
          </div>
          <h1 className="auth-card-title">Ticket claimed</h1>
          <p className="auth-card-sub">
            {claimed.eventTitle ? `You're going to ${claimed.eventTitle}.` : 'The ticket is yours.'}
          </p>
          <div className="row gap-3 mt-6">
            <Link
              href={`/tickets/${claimed.code}/collectible`}
              className="btn btn-accent btn-lg"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Open boarding pass <Icon name="arrow" size={13} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (info.state !== 'pending') {
    const messages: Record<'expired' | 'claimed' | 'cancelled', string> = {
      expired: 'This transfer link has expired. Ask the sender to share a new one.',
      claimed: 'This transfer has already been claimed.',
      cancelled: 'This transfer was cancelled.',
    };
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <h1 className="auth-card-title">Transfer unavailable</h1>
          <p className="auth-card-sub">{messages[info.state]}</p>
          <Link href="/" className="btn btn-ghost mt-6" style={{ justifyContent: 'center' }}>
            Back home
          </Link>
        </div>
      </div>
    );
  }

  const eventDate = new Date(info.ticket.event.startsAt).toLocaleDateString('en-NG', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="eyebrow mb-2">Ticket transfer</div>
        <h1 className="auth-card-title">{info.ticket.event.title}</h1>
        <p className="auth-card-sub">
          Someone is sending you a <strong>{info.ticket.ticketTypeName}</strong> ticket.
          Accept below to take ownership — the sender&apos;s copy stops working the
          moment you claim.
        </p>
        <div
          className="card mt-5"
          style={{ padding: 16, background: 'var(--surface-2)', border: 0 }}
        >
          <div className="row gap-3" style={{ flexWrap: 'wrap', fontSize: 13 }}>
            <span className="row gap-1" style={{ alignItems: 'center', color: 'var(--ink-2)' }}>
              <Icon name="calendar" size={13} /> {eventDate}
            </span>
            <span className="row gap-1" style={{ alignItems: 'center', color: 'var(--ink-2)' }}>
              <Icon name="pin" size={13} /> {info.ticket.event.venue}, {info.ticket.event.city}
            </span>
          </div>
          <div className="text-xs muted mt-2 mono">{info.ticket.code}</div>
        </div>

        {error ? (
          <p className="text-sm mt-3" style={{ color: 'var(--danger)' }}>
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={claim}
          disabled={claiming}
          className="btn btn-accent btn-lg mt-5"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {claiming ? 'Claiming…' : 'Accept ticket'}
        </button>
        <p className="text-xs muted mt-3" style={{ textAlign: 'center', lineHeight: 1.55 }}>
          Need an account? You&apos;ll be sent to sign in or sign up and bounced
          straight back here.
        </p>
      </div>
    </div>
  );
}
