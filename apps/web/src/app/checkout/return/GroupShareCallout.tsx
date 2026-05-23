'use client';

import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface Props {
  tickets: { code: string }[];
}

/**
 * Lets a multi-ticket buyer transfer extras to friends inline without
 * opening each boarding pass. One-tap per ticket: enter their email,
 * click Share — we generate a single-use claim link, email it, and
 * mark the slot as sent. The original ticket only switches owner once
 * the recipient claims; until then the buyer can scan it themselves.
 */
export function GroupShareCallout({ tickets }: Props) {
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [shared, setShared] = useState<Record<string, { link: string }>>({});
  const [error, setError] = useState<string | null>(null);

  async function share(code: string) {
    const token = getToken();
    if (!token) return;
    setError(null);
    setBusy(code);
    try {
      const recipientEmail = emails[code]?.trim() || undefined;
      const res = await api.createTicketTransfer(token, code, { recipientEmail });
      setShared((s) => ({ ...s, [code]: { link: res.link } }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to share');
    } finally {
      setBusy(null);
    }
  }

  async function copy(link: string) {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className="card mt-6"
      style={{
        padding: 22,
        background:
          'linear-gradient(135deg, oklch(0.66 0.20 295 / .14), oklch(0.55 0.18 180 / .10))',
        border: '1px solid oklch(0.66 0.20 295 / .35)',
      }}
    >
      <div className="row gap-3" style={{ alignItems: 'flex-start' }}>
        <span
          aria-hidden="true"
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--r-2)',
            background: 'oklch(0.66 0.20 295 / .25)',
            color: 'oklch(0.66 0.20 295)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name="send" size={16} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="h-4">Going as a group?</h2>
          <p className="text-sm muted mt-2" style={{ lineHeight: 1.55 }}>
            Share extras with friends now. Each link is single-use, expires
            after 72 hours, and instantly transfers ownership the moment they
            accept. You keep one ticket — your friends each get their own QR.
          </p>
          {error ? (
            <p className="text-sm mt-3" style={{ color: 'var(--danger)' }}>
              {error}
            </p>
          ) : null}
          <ul
            className="col gap-2 mt-4"
            style={{ listStyle: 'none', margin: 0, padding: 0 }}
          >
            {tickets.map((t, i) => {
              const isFirst = i === 0;
              const result = shared[t.code];
              return (
                <li
                  key={t.code}
                  className="row gap-2"
                  style={{ alignItems: 'center', flexWrap: 'wrap' }}
                >
                  <span
                    className="mono text-xs"
                    style={{ color: 'var(--ink-3)', minWidth: 140 }}
                  >
                    {isFirst ? 'Keep' : t.code}
                  </span>
                  {isFirst ? (
                    <span className="text-xs muted">— your scan ticket</span>
                  ) : result ? (
                    <>
                      <span className="text-xs accent-text fw-600">
                        <Icon name="check" size={11} stroke={3} /> Sent
                      </span>
                      <button
                        type="button"
                        onClick={() => copy(result.link)}
                        className="btn btn-ghost btn-sm"
                        style={{ marginLeft: 'auto' }}
                      >
                        Copy link
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type="email"
                        value={emails[t.code] ?? ''}
                        onChange={(e) =>
                          setEmails((m) => ({ ...m, [t.code]: e.target.value }))
                        }
                        placeholder="friend@example.com (optional)"
                        className="input"
                        style={{ flex: 1, minWidth: 200, fontSize: 13 }}
                        aria-label={`Recipient email for ticket ${t.code}`}
                      />
                      <button
                        type="button"
                        onClick={() => share(t.code)}
                        disabled={busy === t.code}
                        className="btn btn-accent btn-sm"
                      >
                        {busy === t.code ? 'Sharing…' : 'Share'}
                      </button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
