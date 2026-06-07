'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { api, formatNgn } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { phForId } from '@/lib/design-data';

type Listing = Awaited<ReturnType<typeof api.listResaleMarketplace>>[number];

export default function ResaleMarketplacePage() {
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(Boolean(getToken()));
    api
      .listResaleMarketplace()
      .then(setListings)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, []);

  async function buy(id: string) {
    const token = getToken();
    if (!token) {
      window.location.href = `/signin?next=${encodeURIComponent('/resale')}`;
      return;
    }
    setBusy(id);
    setError(null);
    try {
      const res = await api.buyResaleListing(token, id);
      // Land them directly on the boarding pass.
      window.location.href = `/tickets/${res.ticketCode}/collectible`;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Buy failed');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="page-enter">
      <section className="nebula" style={{ position: 'relative' }}>
        <div className="wrap" style={{ position: 'relative', paddingTop: 64, paddingBottom: 48 }}>
          <div className="eyebrow mb-3">Verified resale</div>
          <h1 className="h-1" style={{ margin: 0, maxWidth: 880 }}>
            <span className="text-gradient">Sold out? Try the resale floor.</span>
          </h1>
          <p
            className="mt-4"
            style={{
              fontSize: 17,
              color: 'var(--ink-2)',
              maxWidth: 680,
              lineHeight: 1.6,
            }}
          >
            Tickets handed back by their original buyers — same QR-verified
            entry, same buyer protection, payable from your wallet. Sellers
            are capped at face value so no scalper spread.
          </p>
          <div className="row gap-3 mt-6" style={{ flexWrap: 'wrap' }}>
            <Link
              href="/account?tab=tickets"
              className="btn btn-accent"
              style={{ alignItems: 'center' }}
            >
              <Icon name="send" size={13} /> List a ticket I own
            </Link>
            <Link href="/buyer-protection" className="btn btn-ghost">
              <Icon name="shield" size={13} /> How buyer protection works
            </Link>
          </div>
        </div>
      </section>

      <section
        className="wrap"
        style={{ paddingTop: 24, paddingBottom: 96, maxWidth: 1240 }}
      >
        {error ? (
          <div
            role="alert"
            className="card mb-4"
            style={{
              padding: 14,
              background: 'oklch(0.65 0.22 25 / .12)',
              border: '1px solid var(--danger)',
              color: 'var(--danger)',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        ) : null}

        {listings === null ? (
          <p className="muted">Loading…</p>
        ) : listings.length === 0 ? (
          <div
            className="card"
            style={{ padding: 56, textAlign: 'center', color: 'var(--ink-3)' }}
          >
            <h2 className="h-3" style={{ margin: 0, color: 'var(--ink)' }}>
              No active resale listings right now.
            </h2>
            <p
              className="mt-3"
              style={{ maxWidth: 460, margin: '12px auto 0', lineHeight: 1.6 }}
            >
              When buyers re-list a ticket they can&apos;t use, it shows up
              here instantly. Check back close to event date.
            </p>
            <Link
              href="/events"
              className="btn btn-accent mt-6"
              style={{ display: 'inline-flex' }}
            >
              Browse events
            </Link>
          </div>
        ) : (
          <div className="between mb-4">
            <h2 className="h-3" style={{ margin: 0 }}>
              {listings.length} listing{listings.length === 1 ? '' : 's'} live
            </h2>
            <span className="text-sm muted">
              Wallet-only · instant transfer · 10% platform fee paid by buyer
            </span>
          </div>
        )}

        {listings && listings.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {listings.map((l) => {
              const ph = phForId(l.event.slug);
              const startsAt = new Date(l.event.startsAt);
              const date = startsAt.toLocaleDateString('en-NG', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
              });
              const savings = l.ticket.originalPriceKobo - l.askKobo;
              return (
                <article key={l.id} className="card card-hover" style={{ padding: 0 }}>
                  <div
                    className={`ph ${ph} ph-noise`}
                    style={{ height: 160, position: 'relative' }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(180deg, transparent 35%, oklch(0 0 0 / .65))',
                      }}
                    />
                    <span
                      className="badge"
                      style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        background: 'oklch(0.66 0.20 295 / .85)',
                        color: 'white',
                      }}
                    >
                      Resale
                    </span>
                    <div
                      style={{
                        position: 'absolute',
                        left: 14,
                        right: 14,
                        bottom: 12,
                        color: 'white',
                      }}
                    >
                      <div
                        className="mono text-xs"
                        style={{ opacity: 0.85, letterSpacing: '.14em' }}
                      >
                        {date.toUpperCase()} · {l.event.city.toUpperCase()}
                      </div>
                      <div
                        className="serif"
                        style={{ fontSize: 19, lineHeight: 1.1, marginTop: 4 }}
                      >
                        {l.event.title}
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: 16 }}>
                    <div className="between">
                      <span className="text-xs muted">{l.ticket.tierName}</span>
                      <span className="mono text-xs muted-2">
                        Face {formatNgn(l.ticket.originalPriceKobo)}
                      </span>
                    </div>
                    <div className="between mt-2" style={{ alignItems: 'flex-end' }}>
                      <div>
                        <div className="text-xs muted">Ask</div>
                        <div className="h-3 tnum mt-1">{formatNgn(l.askKobo)}</div>
                      </div>
                      {savings > 0 ? (
                        <span className="text-xs accent-text fw-600">
                          Save {formatNgn(savings)}
                        </span>
                      ) : savings < 0 ? (
                        <span
                          className="text-xs fw-600"
                          style={{ color: 'oklch(0.55 0.16 50)' }}
                        >
                          {formatNgn(-savings)} over face
                        </span>
                      ) : (
                        <span className="text-xs muted">At face value</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => buy(l.id)}
                      disabled={busy === l.id}
                      className="btn btn-accent mt-4"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      {busy === l.id ? 'Confirming…' : signedIn ? 'Buy with wallet' : 'Sign in to buy'}
                      <Icon name="arrow" size={13} />
                    </button>
                    <Link
                      href={`/events/${l.event.slug}`}
                      className="text-xs accent-text mt-3"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      View event <Icon name="arrow" size={11} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </section>
    </div>
  );
}
