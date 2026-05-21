'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { API_URL } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  'Where is my ticket QR?',
  "Refund my last order",
  'Transfer a ticket to a friend',
  'Why was I not allowed in?',
];

export default function SupportPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [turns, setTurns] = useState<ChatTurn[]>([
    {
      role: 'assistant',
      content:
        "Hi — I'm Compass support. I can look up your orders, regenerate QR codes, issue refunds, and answer questions about your tickets. What's up?",
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = getToken();
    if (!t) {
      router.replace('/signin?next=/support');
      return;
    }
    setToken(t);
  }, [router]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || !token || sending) return;
    setError(null);
    setInput('');
    const history = turns;
    const nextTurns: ChatTurn[] = [...turns, { role: 'user', content: msg }];
    setTurns(nextTurns);
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/me/support`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: msg, history }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message ?? `HTTP ${res.status}`);
      }
      const body = (await res.json()) as { reply: string; fallback?: boolean };
      setTurns([...nextTurns, { role: 'assistant', content: body.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reach support.');
      setTurns(history);
      setInput(msg);
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <div className="page-enter">
      <section
        className="nebula"
        style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--line)' }}
      >
        <div className="stars" />
        <div
          className="wrap"
          style={{ position: 'relative', paddingTop: 48, paddingBottom: 40 }}
        >
          <div className="between">
            <div>
              <div className="row gap-2 mb-3">
                <span className="ai-pill">
                  <span className="ai-dot" />
                  <span>Compass support</span>
                </span>
                <span className="pill-stat">
                  <span className="dot dot-live" /> Online · avg &lt; 4 min
                </span>
              </div>
              <h1 className="h-1" style={{ margin: 0, fontSize: 48 }}>
                Talk to support. Now.
              </h1>
              <p
                className="mt-3 muted"
                style={{ fontSize: 16, maxWidth: 560, lineHeight: 1.55 }}
              >
                I have access to your orders, wallet and tickets. Ask me to find, refund, regenerate
                or transfer — or just describe what went wrong.
              </p>
            </div>
            <div className="row gap-2">
              <Link href="/help" className="btn btn-ghost btn-sm">
                <Icon name="info" size={13} /> Help centre
              </Link>
              <Link href="/refunds" className="btn btn-ghost btn-sm">
                Refunds policy
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        className="wrap"
        style={{
          paddingTop: 32,
          paddingBottom: 96,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
          gap: 32,
          alignItems: 'flex-start',
        }}
      >
        <div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              ref={scrollRef}
              style={{
                height: '58vh',
                minHeight: 420,
                overflowY: 'auto',
                padding: 20,
                background: 'var(--surface)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {turns.map((t, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: t.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '78%',
                      padding: '12px 16px',
                      borderRadius:
                        t.role === 'user' ? 'var(--r-4) var(--r-1) var(--r-4) var(--r-4)' : 'var(--r-1) var(--r-4) var(--r-4) var(--r-4)',
                      background: t.role === 'user' ? 'var(--accent)' : 'var(--surface-2)',
                      color: t.role === 'user' ? 'oklch(0.15 0.04 152)' : 'var(--ink)',
                      fontSize: 14,
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      fontWeight: t.role === 'user' ? 500 : 400,
                    }}
                  >
                    {t.content}
                  </div>
                </div>
              ))}
              {sending ? (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div
                    className="row gap-2"
                    style={{
                      padding: '10px 16px',
                      borderRadius: 'var(--r-1) var(--r-4) var(--r-4) var(--r-4)',
                      background: 'var(--surface-2)',
                      color: 'var(--ink-3)',
                      fontSize: 13,
                      alignItems: 'center',
                    }}
                  >
                    <span className="ai-dot" style={{ width: 14, height: 14 }} />
                    <span>Compass is thinking…</span>
                  </div>
                </div>
              ) : null}
            </div>

            {error ? (
              <div
                style={{
                  padding: '10px 20px',
                  background: 'oklch(0.65 0.22 25 / 0.1)',
                  borderTop: '1px solid var(--line)',
                  color: 'var(--danger)',
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            ) : null}

            <div
              style={{
                padding: 14,
                borderTop: '1px solid var(--line)',
                background: 'var(--surface-2)',
                display: 'grid',
                gridTemplateColumns: 'minmax(0,1fr) auto',
                gap: 10,
                alignItems: 'flex-end',
              }}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask about your orders, refunds, QR codes, transfers…"
                rows={2}
                disabled={!token || sending}
                style={{
                  resize: 'none',
                  padding: '12px 14px',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-3)',
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={!token || sending || !input.trim()}
                className="btn btn-accent"
                style={{ height: 'fit-content' }}
              >
                Send <Icon name="send" size={13} />
              </button>
            </div>
          </div>

          {turns.length <= 1 ? (
            <div className="mt-4">
              <div className="eyebrow mb-3">Try one of these</div>
              <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className="chip"
                    onClick={() => void send(p)}
                  >
                    <Icon name="sparkle" size={11} /> {p}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <aside className="col gap-4">
          <div className="card" style={{ padding: 22 }}>
            <div className="eyebrow mb-2">Self-service</div>
            <div className="h-4">Fix it in your account</div>
            <p className="muted" style={{ fontSize: 13, lineHeight: 1.6, marginTop: 8 }}>
              Most issues can be resolved without chat — open the order in your account, tap
              the action, done.
            </p>
            <Link href="/account" className="btn btn-ghost btn-sm mt-3" style={{ width: '100%', justifyContent: 'center' }}>
              Open my account <Icon name="arrow" size={13} />
            </Link>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <div className="eyebrow mb-2">Read first</div>
            <div className="col gap-2 mt-2">
              <Link href="/help" className="row gap-2 text-sm" style={{ color: 'var(--ink-2)' }}>
                <Icon name="info" size={13} /> Help Centre
              </Link>
              <Link href="/refunds" className="row gap-2 text-sm" style={{ color: 'var(--ink-2)' }}>
                <Icon name="refresh" size={13} /> Refunds policy
              </Link>
              <Link href="/buyer-protection" className="row gap-2 text-sm" style={{ color: 'var(--ink-2)' }}>
                <Icon name="shield" size={13} /> Buyer protection
              </Link>
              <Link href="/trust" className="row gap-2 text-sm" style={{ color: 'var(--ink-2)' }}>
                <Icon name="lock" size={13} /> Trust &amp; safety
              </Link>
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: 22,
              background: 'linear-gradient(135deg, var(--accent-soft), transparent)',
              border: '1px solid oklch(0.68 0.18 152 / .3)',
            }}
          >
            <div className="row gap-2 mb-2">
              <Icon name="shield" size={14} />
              <span className="fw-600 text-sm">Trust hotline · 24/7</span>
            </div>
            <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.6 }}>
              For venue incidents, suspected fraud or account compromise, call the on-call line.
            </p>
            <a href="tel:+2347002684253" className="btn btn-accent btn-sm mt-3" style={{ width: '100%', justifyContent: 'center' }}>
              +234 700 268 425 38
            </a>
          </div>
        </aside>
      </section>
    </div>
  );
}
