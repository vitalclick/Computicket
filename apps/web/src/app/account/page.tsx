'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, formatDate, formatNgn, ticketQrUrl } from '@/lib/api';
import { getToken, signOut } from '@/lib/auth';

type Order = Awaited<ReturnType<typeof api.myOrders>>[number];

export default function AccountPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/signin?next=/account');
      return;
    }
    Promise.all([api.me(token), api.myOrders(token)])
      .then(([me, os]) => {
        setEmail(me.email);
        setOrders(os);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, [router]);

  function handleSignOut() {
    signOut();
    router.replace('/');
  }

  if (error) return <div className="max-w-3xl mx-auto px-4 py-16 text-red-600">{error}</div>;
  if (orders === null) return <div className="max-w-3xl mx-auto px-4 py-16 text-gray-500">Loading…</div>;

  const paid = orders.filter((o) => o.status === 'PAID');
  const other = orders.filter((o) => o.status !== 'PAID');

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your tickets</h1>
          <p className="text-sm text-gray-600 mt-1">Signed in as {email}</p>
        </div>
        <button onClick={handleSignOut} className="text-sm text-gray-500 hover:text-brand">
          Sign out
        </button>
      </div>

      <Link
        href="/account/wallet"
        className="mt-6 inline-flex items-center gap-2 text-sm text-brand hover:underline"
      >
        Manage wallet →
      </Link>

      {paid.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-600">You haven&apos;t booked anything yet.</p>
          <Link href="/events" className="mt-4 inline-block bg-brand text-white px-4 py-2 rounded-md hover:bg-brand-dark">
            Browse events
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-6">
          {paid.map((o) => (
            <li key={o.id} className="border border-gray-200 rounded-lg p-5 bg-white">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-semibold">{o.event.title}</h2>
                  <div className="text-sm text-gray-600 mt-0.5">
                    {o.event.venue}, {o.event.city} · {formatDate(o.event.startsAt)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {o.ticketCount} ticket{o.ticketCount === 1 ? '' : 's'} · {formatNgn(o.totalKobo)} · paid {o.paidAt ? new Date(o.paidAt).toLocaleDateString('en-NG') : '—'}
                  </div>
                </div>
              </div>
              <ul className="mt-4 grid sm:grid-cols-2 gap-3">
                {o.tickets.map((t) => (
                  <li key={t.id} className="flex gap-3 items-center border border-gray-100 rounded-md p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ticketQrUrl(t.code)} alt={t.code} width={96} height={96} className="w-24 h-24" />
                    <div className="min-w-0">
                      <div className="font-mono text-xs break-all">{t.code}</div>
                      <div className={`text-xs mt-1 ${t.status === 'SCANNED' ? 'text-gray-400' : t.status === 'VOIDED' ? 'text-red-600' : 'text-green-700'}`}>
                        {t.status}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      {other.length > 0 && (
        <details className="mt-10">
          <summary className="text-sm text-gray-500 cursor-pointer">Other orders ({other.length})</summary>
          <ul className="mt-4 space-y-2 text-sm">
            {other.map((o) => (
              <li key={o.id} className="border border-gray-200 rounded-lg p-3 bg-white flex justify-between">
                <span>{o.event.title} — <em className="text-gray-500">{o.status}</em></span>
                <span className="text-gray-500">{new Date(o.createdAt).toLocaleDateString('en-NG')}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
