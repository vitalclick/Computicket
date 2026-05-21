'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export default function SupportPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [turns, setTurns] = useState<ChatTurn[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m the Computicket support assistant. Ask about your orders, tickets, or QR codes.',
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

  async function send() {
    const msg = input.trim();
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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold">Support</h1>
      <p className="text-sm text-gray-500 mt-1">
        Chat with our AI assistant — it can look up your orders and tickets in real time.
      </p>

      <div
        ref={scrollRef}
        className="mt-6 h-[60vh] overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 space-y-3"
      >
        {turns.map((t, i) => (
          <div
            key={i}
            className={t.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
          >
            <div
              className={
                t.role === 'user'
                  ? 'max-w-[80%] rounded-2xl rounded-br-sm bg-emerald-600 text-white px-4 py-2 text-sm whitespace-pre-wrap'
                  : 'max-w-[80%] rounded-2xl rounded-bl-sm bg-gray-100 text-gray-900 px-4 py-2 text-sm whitespace-pre-wrap'
              }
            >
              {t.content}
            </div>
          </div>
        ))}
        {sending ? (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-gray-100 text-gray-500 px-4 py-2 text-sm">
              Thinking…
            </div>
          </div>
        ) : null}
      </div>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      <div className="mt-3 flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask about your orders, ticket QR, refunds…"
          rows={2}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
          disabled={!token || sending}
        />
        <button
          onClick={send}
          disabled={!token || sending || !input.trim()}
          className="rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
