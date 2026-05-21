'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { EventCard } from '@/components/marketplace/EventCard';
import { FilterGroup } from '@/components/marketplace/FilterGroup';
import { API_URL, type EventSummary } from '@/lib/api';
import { DESIGN_HOTELS, formatNaira } from '@/lib/design-data';
import { toDesignEvent } from '@/lib/event-adapter';

async function fetchEvents(q: string): Promise<EventSummary[]> {
  const url = q.trim()
    ? `${API_URL}/events/search?q=${encodeURIComponent(q.trim())}`
    : `${API_URL}/events`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    return (await res.json()) as EventSummary[];
  } catch {
    return [];
  }
}

const FACETS = [
  { id: 'all',      label: 'All results', count: 124 },
  { id: 'events',   label: 'Events',      count: 46 },
  { id: 'concerts', label: 'Concerts',    count: 18 },
  { id: 'flights',  label: 'Flights',     count: 12 },
  { id: 'hotels',   label: 'Stays',       count: 24 },
  { id: 'buses',    label: 'Bus travel',  count: 8 },
  { id: 'cinema',   label: 'Cinema',      count: 6 },
  { id: 'x',        label: 'Experiences', count: 10 },
];

export default function EventsPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [events, setEvents] = useState<EventSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    setLoading(true);
    debounce.current = setTimeout(async () => {
      const rows = await fetchEvents(query);
      setEvents(rows);
      setLoading(false);
    }, 200);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [query]);

  const designed = useMemo(
    () => (events ?? []).map((e) => ({ event: toDesignEvent(e), href: `/events/${e.slug}` })),
    [events],
  );
  const top = designed[0];
  const rest = designed.slice(1);

  return (
    <div className="page-enter">
      <section
        style={{ background: 'var(--bg-deep)', borderBottom: '1px solid var(--line)', padding: '40px 0 0' }}
      >
        <div className="wrap">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 8px 8px 22px',
              borderRadius: 'var(--r-pill)',
              background: 'var(--surface)',
              border: '1px solid var(--line-strong)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <Icon name="search" size={20} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by event, venue or city…"
              aria-label="Search events"
              style={{
                flex: 1,
                background: 'transparent',
                border: 0,
                outline: 'none',
                fontSize: 18,
                padding: '12px 0',
                color: 'var(--ink)',
              }}
            />
            <span className="ai-pill">
              <span className="ai-dot" />
              <span>Compass interpreting</span>
            </span>
            <button type="button" className="icon-btn" aria-label="Voice search">
              <Icon name="mic" size={16} />
            </button>
            <button type="button" className="btn btn-accent">
              Search
            </button>
          </div>

          <div
            className="card mt-6"
            style={{
              padding: 20,
              background: 'linear-gradient(135deg, var(--accent-soft), transparent)',
              border: '1px solid oklch(0.68 0.18 152 / .3)',
            }}
          >
            <div className="row gap-3" style={{ alignItems: 'flex-start' }}>
              <div className="ai-dot" style={{ width: 24, height: 24, flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <div className="row gap-2" style={{ alignItems: 'center' }}>
                  <span className="eyebrow accent-text">Compass answers</span>
                </div>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: 'var(--ink-2)',
                    marginTop: 6,
                    textWrap: 'pretty',
                  }}
                >
                  {query.trim().length === 0
                    ? `Showing ${events?.length ?? 0} live events. Try "Burna Boy Lagos", "Comedy this weekend", or filter by city to narrow down.`
                    : `I found ${designed.length} match${designed.length === 1 ? '' : 'es'} for "${query.trim()}". The closest event is at the top — open it for full details, or tighten the search with filters on the left.`}
                </p>
              </div>
            </div>
          </div>

          <div
            className="row mt-6"
            style={{ borderBottom: '1px solid var(--line)', overflowX: 'auto' }}
          >
            {FACETS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                style={{
                  padding: '14px 18px',
                  borderBottom: `2px solid ${filter === f.id ? 'var(--accent)' : 'transparent'}`,
                  background: 'transparent',
                  border: 0,
                  cursor: 'pointer',
                  color: filter === f.id ? 'var(--ink)' : 'var(--ink-3)',
                  fontSize: 13,
                  fontWeight: filter === f.id ? 600 : 500,
                  whiteSpace: 'nowrap',
                }}
              >
                {f.label}{' '}
                <span className="muted-2 mono" style={{ fontSize: 11, marginLeft: 4 }}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section
        className="wrap"
        style={{
          paddingTop: 32,
          paddingBottom: 96,
          display: 'grid',
          gridTemplateColumns: '260px minmax(0,1fr)',
          gap: 32,
          alignItems: 'flex-start',
        }}
      >
        <aside style={{ position: 'sticky', top: 96 }}>
          <div className="between mb-4">
            <div className="eyebrow">Filters</div>
            <button type="button" className="text-xs muted">
              Clear all
            </button>
          </div>

          <FilterGroup title="Price range">
            <div className="between text-xs mono">
              <span>₦0</span>
              <span>₦500k+</span>
            </div>
            <div style={{ position: 'relative', height: 32, marginTop: 4 }}>
              <div
                style={{
                  position: 'absolute',
                  top: 15,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: 'var(--surface-2)',
                  borderRadius: 99,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 15,
                  left: '8%',
                  right: '40%',
                  height: 2,
                  background: 'var(--accent)',
                  borderRadius: 99,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  left: '8%',
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: 'var(--ink)',
                  border: '3px solid var(--accent)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  left: '60%',
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: 'var(--ink)',
                  border: '3px solid var(--accent)',
                }}
              />
            </div>
            <div className="between mt-2 text-sm tnum">
              <span>₦15,000</span> – <span>₦300,000</span>
            </div>
          </FilterGroup>

          <FilterGroup title="When">
            {['Tonight', 'This weekend', 'Next 7 days', 'This month', 'Pick dates'].map((d) => (
              <label
                key={d}
                className="row gap-2 mt-2"
                style={{ alignItems: 'center', cursor: 'pointer' }}
              >
                <input
                  type="checkbox"
                  defaultChecked={d === 'This weekend'}
                  style={{ accentColor: 'var(--accent)' }}
                />
                <span className="text-sm">{d}</span>
              </label>
            ))}
          </FilterGroup>

          <FilterGroup title="City">
            {['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'Calabar'].map((c) => (
              <label
                key={c}
                className="row gap-2 mt-2"
                style={{ alignItems: 'center', cursor: 'pointer' }}
              >
                <input
                  type="checkbox"
                  defaultChecked={c === 'Lagos'}
                  style={{ accentColor: 'var(--accent)' }}
                />
                <span className="text-sm">{c}</span>
              </label>
            ))}
          </FilterGroup>

          <FilterGroup title="Genre">
            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
              {['Afrobeats', 'Comedy', 'Theatre', 'Jazz', 'Festival', 'Gospel', 'Hip-hop'].map(
                (g) => (
                  <span key={g} className={`chip ${g === 'Afrobeats' ? 'active' : ''}`}>
                    {g}
                  </span>
                ),
              )}
            </div>
          </FilterGroup>

          <FilterGroup title="Features" last>
            {['VIP available', 'Group seating', 'Wheelchair access', 'Refundable', 'Verified organizer'].map(
              (f) => (
                <label
                  key={f}
                  className="row gap-2 mt-2"
                  style={{ alignItems: 'center', cursor: 'pointer' }}
                >
                  <input type="checkbox" style={{ accentColor: 'var(--accent)' }} />
                  <span className="text-sm">{f}</span>
                </label>
              ),
            )}
          </FilterGroup>
        </aside>

        <div>
          <div className="between mb-6">
            <div className="text-sm muted">
              Showing{' '}
              <b className="text-gradient">
                {loading ? '…' : `${designed.length} result${designed.length === 1 ? '' : 's'}`}
              </b>
              {query.trim() ? (
                <>
                  {' '}
                  for &ldquo;<span className="accent-text">{query}</span>&rdquo;
                </>
              ) : null}
            </div>
            <div className="row gap-2">
              <button type="button" className="chip">
                Best match <Icon name="chevronDown" size={11} />
              </button>
              <button type="button" className="icon-btn" aria-label="Grid view">
                <Icon name="grid" size={15} />
              </button>
              <button type="button" className="icon-btn" aria-label="Map view">
                <Icon name="map" size={15} />
              </button>
            </div>
          </div>

          {loading && designed.length === 0 ? (
            <p className="muted">Loading…</p>
          ) : designed.length === 0 ? (
            <div
              className="card"
              style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)' }}
            >
              <p>
                {query.trim()
                  ? `No events match "${query.trim()}".`
                  : 'No events available right now. Seed the database with `pnpm db:seed`.'}
              </p>
            </div>
          ) : (
            <>
              {top ? (
                <Link
                  href={top.href}
                  className="card card-hover mb-6"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '400px minmax(0,1fr)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    className={`ph ${top.event.ph} ph-noise`}
                    style={{ minHeight: 280, position: 'relative' }}
                  >
                    <span
                      className="badge"
                      style={{
                        position: 'absolute',
                        top: 14,
                        left: 14,
                        background: 'var(--accent)',
                        color: 'oklch(0.2 0.05 152)',
                      }}
                    >
                      ★ Top result
                    </span>
                  </div>
                  <div style={{ padding: 32 }}>
                    <div className="row gap-2 mb-3">
                      <span className="chip chip-accent">{top.event.tag}</span>
                      {top.event.vip ? <span className="badge badge-vip">VIP</span> : null}
                      <span className="text-xs muted">
                        · {top.event.attending.toLocaleString()} attending
                      </span>
                    </div>
                    <h3 className="h-3" style={{ fontSize: 28 }}>
                      {top.event.title}
                    </h3>
                    <div className="row gap-3 mt-2 muted text-sm">
                      <span>
                        <Icon name="pin" size={13} /> {top.event.venue} · {top.event.city}
                      </span>
                      <span>
                        <Icon name="calendar" size={13} /> {top.event.date}
                        {top.event.time ? ` · ${top.event.time}` : ''}
                      </span>
                    </div>
                    <div className="between mt-6">
                      <div>
                        <div className="text-xs muted">From</div>
                        <div className="h-3 tnum">{formatNaira(top.event.priceFrom)}</div>
                      </div>
                      <div>
                        <div className="text-xs muted">Sold</div>
                        <div className="h-4 tnum accent-text">
                          {Math.round((top.event.attending / top.event.capacity) * 100)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs muted">Time left</div>
                        <div className="h-4 tnum">{top.event.countdown}</div>
                      </div>
                      <span className="btn btn-accent">
                        View event <Icon name="arrow" size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              ) : null}

              {rest.length > 0 ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: 20,
                  }}
                >
                  {rest.map((p) => (
                    <EventCard key={p.event.id} event={p.event} href={p.href} size="full" />
                  ))}
                </div>
              ) : null}
            </>
          )}

          <div className="card mt-8" style={{ padding: 24 }}>
            <div className="between mb-4">
              <div>
                <div className="eyebrow mb-2">Also matching your search</div>
                <div className="h-4">Stays near the action</div>
              </div>
              <Link href="/hotels" className="btn btn-ghost btn-sm">
                See all hotels
              </Link>
            </div>
            <div className="rail">
              {DESIGN_HOTELS.slice(0, 4).map((h) => (
                <Link
                  key={h.id}
                  href="/hotels"
                  className="card card-hover"
                  style={{ width: 240, display: 'block' }}
                >
                  <div className={`ph ${h.ph} ph-noise`} style={{ height: 120, position: 'relative' }}>
                    {h.badge ? (
                      <span
                        className="badge badge-vip"
                        style={{ position: 'absolute', top: 10, left: 10 }}
                      >
                        {h.badge}
                      </span>
                    ) : null}
                  </div>
                  <div style={{ padding: 14 }}>
                    <div className="h-4" style={{ fontSize: 14 }}>
                      {h.name}
                    </div>
                    <div className="text-xs muted mt-1">{h.city}</div>
                    <div className="between mt-3">
                      <span className="text-xs">
                        <Icon name="star" size={11} /> {h.rating} · {h.reviews.toLocaleString()}
                      </span>
                      <span className="text-sm fw-600 tnum">{formatNaira(h.price)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
