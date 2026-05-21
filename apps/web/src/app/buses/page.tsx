'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/components/Icon';
import { api } from '@/lib/api';

type Trip = Awaited<ReturnType<typeof api.searchBuses>>[number];

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatDateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('en-NG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m.toString().padStart(2, '0')}m` : `${h}h 00m`;
}

function formatNaira(kobo: number): string {
  return '₦' + Math.round(kobo / 100).toLocaleString('en-NG');
}

function Seat({ taken, selected }: { taken: boolean; selected: boolean }) {
  return (
    <span
      className={`seat ${taken ? 'sold' : ''} ${selected ? 'selected' : ''}`}
      style={{ width: 28, height: 28, borderRadius: 6 }}
    />
  );
}

export default function BusesPage() {
  const [cities, setCities] = useState<string[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<'cheapest' | 'fastest' | 'premium'>('cheapest');

  useEffect(() => {
    api.busCities().then((r) => setCities(r.cities)).catch(() => undefined);
    api
      .searchBuses({})
      .then((t) => {
        setTrips(t);
        if (t[0]) setSelected(t[0].slug);
      })
      .catch(() => undefined);
  }, []);

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const t = await api.searchBuses({
        from: from || undefined,
        to: to || undefined,
        date: date || undefined,
      });
      setTrips(t);
      setSelected(t[0]?.slug ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  const sorted = useMemo(() => {
    const arr = [...trips];
    const minPrice = (t: Trip) =>
      t.ticketTypes.length ? Math.min(...t.ticketTypes.map((tt) => tt.priceKobo)) : Infinity;
    if (sort === 'cheapest') arr.sort((a, b) => minPrice(a) - minPrice(b));
    else if (sort === 'fastest')
      arr.sort(
        (a, b) =>
          (a.route?.durationMinutes ?? Infinity) - (b.route?.durationMinutes ?? Infinity),
      );
    else arr.sort((a, b) => minPrice(b) - minPrice(a));
    return arr;
  }, [trips, sort]);

  const selectedTrip = sorted.find((t) => t.slug === selected) ?? sorted[0] ?? null;
  const selectedPrice = selectedTrip
    ? Math.min(...selectedTrip.ticketTypes.map((tt) => tt.priceKobo))
    : 0;

  return (
    <div className="page-enter">
      <section
        style={{ background: 'var(--bg-deep)', borderBottom: '1px solid var(--line)' }}
      >
        <div className="wrap" style={{ paddingTop: 32, paddingBottom: 32 }}>
          <div className="row gap-3 mb-4">
            <button type="button" className="chip active">
              Round trip
            </button>
            <button type="button" className="chip">
              One way
            </button>
          </div>
          <form
            onSubmit={search}
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr) auto',
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-4)',
              padding: 8,
            }}
          >
            <label className="search-field" style={{ borderRight: '1px solid var(--line)' }}>
              <span className="search-label">From</span>
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                aria-label="From city"
                style={{
                  background: 'transparent',
                  border: 0,
                  outline: 'none',
                  color: 'var(--ink)',
                  fontSize: 15,
                  marginTop: 4,
                }}
              >
                <option value="">All terminals</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="search-field" style={{ borderRight: '1px solid var(--line)' }}>
              <span className="search-label">To</span>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                aria-label="To city"
                style={{
                  background: 'transparent',
                  border: 0,
                  outline: 'none',
                  color: 'var(--ink)',
                  fontSize: 15,
                  marginTop: 4,
                }}
              >
                <option value="">All terminals</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="search-field" style={{ borderRight: '1px solid var(--line)' }}>
              <span className="search-label">Depart</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 0,
                  outline: 'none',
                  color: 'var(--ink)',
                  fontSize: 15,
                  marginTop: 4,
                }}
              />
            </label>
            <div className="search-field">
              <span className="search-label">Passengers</span>
              <span className="search-value">1 adult</span>
            </div>
            <button
              type="submit"
              className="btn btn-accent"
              style={{ padding: '18px 28px' }}
              disabled={loading}
            >
              <Icon name="search" size={16} />
            </button>
          </form>
          {error ? (
            <div className="mt-3 text-sm" style={{ color: 'var(--danger)' }}>
              {error}
            </div>
          ) : null}
        </div>
      </section>

      <section
        className="wrap"
        style={{
          paddingTop: 32,
          paddingBottom: 96,
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)',
          gap: 32,
          alignItems: 'flex-start',
        }}
      >
        <div>
          <div className="between mb-4">
            <span className="text-sm muted">
              <b className="text-gradient">
                {loading ? '…' : `${sorted.length} trip${sorted.length === 1 ? '' : 's'}`}
              </b>
            </span>
            <div className="row gap-2">
              {(['cheapest', 'fastest', 'premium'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`chip ${sort === s ? 'active' : ''}`}
                  onClick={() => setSort(s)}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {sorted.length === 0 && !loading ? (
            <div
              className="card"
              style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)' }}
            >
              <p>No trips match your search. Try widening the dates or operators.</p>
            </div>
          ) : (
            <div className="col gap-3">
              {sorted.map((r) => {
                const price = Math.min(...r.ticketTypes.map((tt) => tt.priceKobo));
                const totalCapacity = r.ticketTypes.reduce((acc, tt) => acc + tt.capacity, 0);
                const sold = r.ticketTypes.reduce((acc, tt) => acc + tt.sold, 0);
                const left = Math.max(0, totalCapacity - sold);
                const isSelected = selected === r.slug;
                const fromLabel = r.route?.fromCity ?? r.title;
                const toLabel = r.route?.toCity ?? '';
                const duration = r.route ? formatDuration(r.route.durationMinutes) : '';
                return (
                  <div
                    key={r.slug}
                    className="card card-hover"
                    style={{
                      padding: 0,
                      border: isSelected ? '1px solid var(--accent)' : '1px solid var(--line)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelected(r.slug)}
                  >
                    <div
                      style={{
                        padding: 20,
                        display: 'grid',
                        gridTemplateColumns: 'auto minmax(0,1fr) auto',
                        gap: 24,
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: 54,
                          height: 54,
                          borderRadius: 'var(--r-2)',
                          background:
                            'linear-gradient(135deg, oklch(0.15 0.08 285), oklch(0.25 0.10 285))',
                          display: 'grid',
                          placeItems: 'center',
                          color: 'var(--accent)',
                        }}
                      >
                        <Icon name="bus" size={26} />
                      </div>
                      <div>
                        <div className="row gap-2" style={{ alignItems: 'center' }}>
                          <span className="fw-600">{r.organizer.name}</span>
                        </div>
                        <div className="text-xs muted mt-1">
                          {r.boardingTerminal} · {formatDateLabel(r.departsAt)}
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'auto minmax(0,1fr) auto',
                            alignItems: 'center',
                            gap: 14,
                            marginTop: 14,
                          }}
                        >
                          <div>
                            <div className="h-4 tnum">{formatTime(r.departsAt)}</div>
                            <div className="text-xs muted mt-1">{fromLabel}</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div className="text-xs muted">{duration}</div>
                            <div
                              style={{
                                height: 1,
                                background: 'var(--line)',
                                position: 'relative',
                                marginTop: 6,
                              }}
                            >
                              <div
                                style={{
                                  position: 'absolute',
                                  left: 0,
                                  top: '50%',
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  background: 'var(--accent)',
                                  transform: 'translateY(-50%)',
                                }}
                              />
                              <div
                                style={{
                                  position: 'absolute',
                                  right: 0,
                                  top: '50%',
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  background: 'var(--ink-3)',
                                  transform: 'translateY(-50%)',
                                }}
                              />
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div className="h-4 tnum">{formatTime(r.arrivesAt)}</div>
                            <div className="text-xs muted mt-1">{toLabel}</div>
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="h-3 tnum">{formatNaira(price)}</div>
                        <div className="text-xs muted mt-1">{left} seats left</div>
                        <Link
                          href={`/events/${r.slug}`}
                          className="btn btn-accent btn-sm mt-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Select <Icon name="arrow" size={12} />
                        </Link>
                      </div>
                    </div>

                    {isSelected ? (
                      <div
                        style={{
                          padding: '16px 20px',
                          background: 'var(--surface-2)',
                          borderTop: '1px solid var(--line)',
                        }}
                      >
                        <div
                          className="row gap-3 muted text-xs"
                          style={{ flexWrap: 'wrap' }}
                        >
                          <span className="row gap-1">
                            <Icon name="ac" size={12} /> Air-conditioned
                          </span>
                          <span className="row gap-1">
                            <Icon name="wifi" size={12} /> Free WiFi
                          </span>
                          <span className="row gap-1">
                            <Icon name="shield" size={12} /> Live GPS tracking
                          </span>
                          <span className="row gap-1">
                            <Icon name="clock" size={12} /> Refund up to 6h before
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <aside
          style={{ position: 'sticky', top: 96, display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <div className="card" style={{ padding: 24 }}>
            <div className="between mb-4">
              <div>
                <div className="eyebrow">Pick your seat</div>
                <div className="h-4 mt-1">
                  {selectedTrip ? selectedTrip.organizer.name : 'Choose a trip'} · 22 seats
                </div>
              </div>
              <span className="text-xs muted">
                {selectedTrip
                  ? Math.max(
                      0,
                      selectedTrip.ticketTypes.reduce((a, t) => a + t.capacity, 0) -
                        selectedTrip.ticketTypes.reduce((a, t) => a + t.sold, 0),
                    )
                  : 0}{' '}
                available
              </span>
            </div>

            <div
              className="card"
              style={{
                padding: 20,
                background: 'var(--surface-2)',
                borderRadius: 'var(--r-3)',
              }}
            >
              <div className="between mb-4">
                <div className="row gap-2 text-xs muted">
                  <Icon name="user" size={12} /> Driver
                </div>
                <span className="mono text-xs muted">FRONT</span>
              </div>
              <div className="col gap-3">
                {Array.from({ length: 5 }).map((_, r) => (
                  <div
                    key={r}
                    className="row"
                    style={{ justifyContent: 'center', gap: 6 }}
                  >
                    {[0, 1].map((c) => (
                      <Seat
                        key={c}
                        taken={(r * 4 + c) % 7 < 2}
                        selected={r === 3 && c === 0}
                      />
                    ))}
                    <span style={{ width: 24 }} />
                    {[2, 3].map((c) => (
                      <Seat
                        key={c}
                        taken={(r * 4 + c) % 7 < 2}
                        selected={false}
                      />
                    ))}
                  </div>
                ))}
                <div
                  className="row"
                  style={{ justifyContent: 'center', gap: 6, marginTop: 8 }}
                >
                  {[0, 1, 2, 3].map((c) => (
                    <Seat key={c} taken={c === 1 || c === 3} selected={false} />
                  ))}
                </div>
              </div>

              <div
                className="row gap-3 mt-5"
                style={{
                  justifyContent: 'center',
                  fontSize: 11,
                  color: 'var(--ink-3)',
                  flexWrap: 'wrap',
                }}
              >
                <span className="row gap-1">
                  <span className="seat" style={{ width: 12, height: 12 }} /> Open
                </span>
                <span className="row gap-1">
                  <span className="seat selected" style={{ width: 12, height: 12 }} /> Yours
                </span>
                <span className="row gap-1">
                  <span className="seat sold" style={{ width: 12, height: 12 }} /> Taken
                </span>
              </div>
            </div>

            <div
              className="between mt-5"
              style={{ paddingTop: 16, borderTop: '1px solid var(--line)' }}
            >
              <div>
                <div className="text-xs muted">Seat 14A · window</div>
                <div className="h-4 tnum mt-1">
                  {selectedTrip ? formatNaira(selectedPrice) : '—'}
                </div>
              </div>
              {selectedTrip ? (
                <Link
                  href={`/events/${selectedTrip.slug}`}
                  className="btn btn-accent"
                >
                  Continue <Icon name="arrow" size={13} />
                </Link>
              ) : null}
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div className="eyebrow mb-4">Why book bus on Computicket</div>
            <ul
              style={{
                margin: 0,
                paddingLeft: 18,
                color: 'var(--ink-3)',
                fontSize: 12.5,
                lineHeight: 1.7,
              }}
            >
              <li>Verified operators only — GIGM, Chisco, ABC and 12 more</li>
              <li>QR boarding passes · scan at the terminal</li>
              <li>Free cancellation up to 6 hours before departure</li>
              <li>Pay with card, transfer, USSD, wallet</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}
