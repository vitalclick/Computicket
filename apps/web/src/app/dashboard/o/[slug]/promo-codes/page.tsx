'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { api, formatNgn } from '@/lib/api';
import { getToken } from '@/lib/auth';

export default function PromoCodesPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [codes, setCodes] = useState<Awaited<ReturnType<typeof api.listPromoCodes>>>([]);
  const [overview, setOverview] = useState<Awaited<ReturnType<typeof api.dashboardOverview>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [type, setType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [valueInput, setValueInput] = useState('');
  const [eventSlug, setEventSlug] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace('/signin?next=' + encodeURIComponent(`/dashboard/o/${params.slug}/promo-codes`));
      return;
    }
    try {
      const [c, o] = await Promise.all([
        api.listPromoCodes(token, params.slug),
        api.dashboardOverview(token, params.slug),
      ]);
      setCodes(c);
      setOverview(o);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }, [router, params.slug]);

  useEffect(() => {
    load();
  }, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy('create');
    try {
      const numericValue = type === 'PERCENTAGE'
        ? Math.round(parseFloat(valueInput) * 100) // % to basis points
        : Math.round(parseFloat(valueInput) * 100); // NGN to kobo
      await api.createPromoCode(getToken()!, params.slug, {
        code,
        type,
        value: numericValue,
        eventSlug: eventSlug || undefined,
        maxUses: maxUses ? parseInt(maxUses, 10) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      });
      setCode(''); setValueInput(''); setMaxUses(''); setExpiresAt(''); setEventSlug('');
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(null);
    }
  }

  async function deactivate(id: string) {
    if (!confirm('Deactivate this promo code? It will no longer be usable.')) return;
    setBusy(id);
    try {
      await api.deactivatePromoCode(getToken()!, params.slug, id);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-16 text-gray-500">Loading…</div>;
  if (error) return <div className="max-w-4xl mx-auto px-4 py-16 text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link href={`/dashboard/o/${params.slug}`} className="text-sm text-gray-500 hover:text-brand-dark">
        ← {params.slug}
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Promo codes</h1>
      <p className="text-sm text-gray-600 mt-1">
        Discounts apply to the subtotal, before fees. Codes are case-insensitive.
      </p>

      <form onSubmit={create} className="mt-8 border border-gray-200 rounded-lg p-5 bg-white space-y-3">
        <h2 className="font-semibold">New code</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="block text-xs text-gray-600 mb-1">Code</span>
            <input required pattern="[A-Za-z0-9-]{2,32}" placeholder="EARLYBIRD"
              value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm uppercase" />
          </label>
          <label className="text-sm">
            <span className="block text-xs text-gray-600 mb-1">Discount type</span>
            <select value={type} onChange={(e) => setType(e.target.value as 'PERCENTAGE' | 'FIXED')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm">
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED">Fixed (NGN)</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="block text-xs text-gray-600 mb-1">
              {type === 'PERCENTAGE' ? 'Percentage off (1-100)' : 'NGN off'}
            </span>
            <input required type="number" step="0.01" min="0.01"
              max={type === 'PERCENTAGE' ? 100 : undefined}
              value={valueInput} onChange={(e) => setValueInput(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </label>
          <label className="text-sm">
            <span className="block text-xs text-gray-600 mb-1">Scope</span>
            <select value={eventSlug} onChange={(e) => setEventSlug(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm">
              <option value="">All events</option>
              {overview?.events.map((e) => (
                <option key={e.slug} value={e.slug}>{e.title}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="block text-xs text-gray-600 mb-1">Max uses (optional)</span>
            <input type="number" min="1" value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </label>
          <label className="text-sm">
            <span className="block text-xs text-gray-600 mb-1">Expires at (optional)</span>
            <input type="datetime-local" value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </label>
        </div>
        <button type="submit" disabled={busy === 'create'}
          className="bg-brand text-white px-4 py-2 rounded-md hover:bg-brand-dark disabled:bg-gray-300 text-sm">
          {busy === 'create' ? 'Creating…' : 'Create promo code'}
        </button>
      </form>

      <h2 className="mt-10 text-lg font-semibold">All codes ({codes.length})</h2>
      {codes.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">No promo codes yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {codes.map((c) => (
            <li key={c.id} className="border border-gray-200 rounded-lg p-3 bg-white flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-mono font-semibold">{c.code}</div>
                <div className="text-xs text-gray-600 mt-0.5">
                  {c.type === 'PERCENTAGE'
                    ? `${(c.value / 100).toFixed(2)}% off`
                    : `${formatNgn(c.value)} off`}{' '}
                  · {c.event ? `Event: ${c.event.title}` : 'All events'}
                  {c.maxUses ? ` · ${c.usesCount}/${c.maxUses} used` : ` · ${c.usesCount} used`}
                  {c.expiresAt ? ` · expires ${new Date(c.expiresAt).toLocaleDateString('en-NG')}` : ''}
                </div>
              </div>
              {c.active ? (
                <button onClick={() => deactivate(c.id)} disabled={busy === c.id}
                  className="text-red-600 hover:underline text-xs disabled:text-gray-400">
                  Deactivate
                </button>
              ) : (
                <span className="text-xs text-gray-400">inactive</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
