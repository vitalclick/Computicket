'use client';

import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { FilterGroup } from '@/components/marketplace/FilterGroup';
import { formatNaira } from '@/lib/design-data';

interface FlightResult {
  id: string;
  airline: string;
  dep: string;
  arr: string;
  from: string;
  to: string;
  duration: string;
  direct: boolean;
  price: number;
  prev: number;
  fare: string;
}

const RESULTS: FlightResult[] = [
  { id: 'f1', airline: 'Air Peace',    dep: '06:25', arr: '07:35', from: 'LOS', to: 'ABV', duration: '1h 10m', direct: true, price: 62500, prev: 71000, fare: 'Saver' },
  { id: 'f2', airline: 'Ibom Air',     dep: '09:10', arr: '10:25', from: 'LOS', to: 'ABV', duration: '1h 15m', direct: true, price: 68900, prev: 68900, fare: 'Standard' },
  { id: 'f3', airline: 'Arik Air',     dep: '13:40', arr: '14:55', from: 'LOS', to: 'ABV', duration: '1h 15m', direct: true, price: 71200, prev: 65000, fare: 'Standard' },
  { id: 'f4', airline: 'Green Africa', dep: '17:55', arr: '19:10', from: 'LOS', to: 'ABV', duration: '1h 15m', direct: true, price: 74500, prev: 74500, fare: 'Saver' },
  { id: 'f5', airline: 'Air Peace',    dep: '20:30', arr: '21:55', from: 'LOS', to: 'ABV', duration: '1h 25m', direct: true, price: 79200, prev: 82000, fare: 'Flex' },
];

const CALENDAR = [
  { day: 'Mon', n: 20, price: 55400 },
  { day: 'Tue', n: 21, price: 58900 },
  { day: 'Wed', n: 22, price: 48200, lowest: true },
  { day: 'Thu', n: 23, price: 54800 },
  { day: 'Fri', n: 24, price: 62500, selected: true },
  { day: 'Sat', n: 25, price: 71200 },
  { day: 'Sun', n: 26, price: 74900 },
];

export default function FlightsPage() {
  const [selected, setSelected] = useState('f1');

  return (
    <div className="page-enter">
      <section style={{ background: 'var(--bg-deep)', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap" style={{ paddingTop: 32, paddingBottom: 32 }}>
          <div className="row gap-3 mb-4">
            <button type="button" className="chip active">Round trip</button>
            <button type="button" className="chip">One way</button>
            <button type="button" className="chip">Multi-city</button>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'minmax(0,1.2fr) minmax(0,1.2fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) auto',
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-4)',
              padding: 8,
              gap: 0,
            }}
          >
            {[
              { l: 'From',       v: 'Lagos (LOS)' },
              { l: 'To',         v: 'Abuja (ABV)' },
              { l: 'Depart',     v: 'Fri 23 May' },
              { l: 'Return',     v: 'Sun 25 May' },
              { l: 'Passengers', v: '1 adult · Economy' },
            ].map((f, i, a) => (
              <div
                key={f.l}
                className="search-field"
                style={{
                  borderRight: i < a.length - 1 ? '1px solid var(--line)' : 'none',
                }}
              >
                <div className="search-label">{f.l}</div>
                <div className="search-value">{f.v}</div>
              </div>
            ))}
            <button type="button" className="btn btn-accent" style={{ padding: '18px 28px' }}>
              <Icon name="search" size={16} />
            </button>
          </div>
        </div>
      </section>

      <section className="wrap" style={{ paddingTop: 24, paddingBottom: 96 }}>
        <div className="card mb-6" style={{ padding: 20 }}>
          <div className="between mb-3">
            <div className="eyebrow">Price calendar · LOS → ABV</div>
            <span className="ai-pill">
              <span className="ai-dot" />
              <span>Wed is ₦14k cheaper than Fri</span>
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
            {CALENDAR.map((d) => (
              <button
                key={d.day}
                type="button"
                style={{
                  padding: 12,
                  borderRadius: 'var(--r-2)',
                  background: d.selected ? 'var(--accent-soft)' : 'var(--surface-2)',
                  border: `1px solid ${d.selected ? 'var(--accent)' : 'transparent'}`,
                  textAlign: 'left',
                  color: 'inherit',
                  cursor: 'pointer',
                }}
              >
                <div className="text-xs muted">{d.day}</div>
                <div className="fw-600 mt-1">May {d.n}</div>
                <div
                  className={`text-xs tnum mt-2 ${d.lowest ? 'accent-text fw-600' : 'muted'}`}
                >
                  {formatNaira(d.price)}
                </div>
                {d.lowest ? <div className="text-xs accent-text mt-1">Lowest</div> : null}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '240px minmax(0,1fr) 360px',
            gap: 24,
            alignItems: 'flex-start',
          }}
        >
          <aside style={{ position: 'sticky', top: 96 }}>
            <div className="eyebrow mb-4">Filter results</div>
            <FilterGroup title="Stops">
              {['Direct', '1 stop', '2+ stops'].map((s) => (
                <label key={s} className="row gap-2 mt-2">
                  <input
                    type="checkbox"
                    defaultChecked={s === 'Direct'}
                    style={{ accentColor: 'var(--accent)' }}
                  />{' '}
                  <span className="text-sm">{s}</span>
                </label>
              ))}
            </FilterGroup>
            <FilterGroup title="Airlines">
              {['Air Peace', 'Ibom Air', 'Arik Air', 'Green Africa', 'Emirates', 'Qatar'].map((a) => (
                <label key={a} className="row gap-2 mt-2">
                  <input
                    type="checkbox"
                    defaultChecked
                    style={{ accentColor: 'var(--accent)' }}
                  />{' '}
                  <span className="text-sm">{a}</span>
                </label>
              ))}
            </FilterGroup>
            <FilterGroup title="Times">
              <div className="text-xs muted mt-2">Departure window</div>
              <div className="row mt-3 gap-1">
                {['00–06', '06–12', '12–18', '18–24'].map((t, i) => (
                  <button
                    key={t}
                    type="button"
                    className={`chip ${i === 1 ? 'active' : ''}`}
                    style={{ flex: 1, justifyContent: 'center', fontSize: 11 }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </FilterGroup>
            <FilterGroup title="Fare type" last>
              {['Saver', 'Standard', 'Flex', 'Business'].map((f) => (
                <label key={f} className="row gap-2 mt-2">
                  <input
                    type="checkbox"
                    defaultChecked={f !== 'Business'}
                    style={{ accentColor: 'var(--accent)' }}
                  />{' '}
                  <span className="text-sm">{f}</span>
                </label>
              ))}
            </FilterGroup>
          </aside>

          <div>
            <div className="between mb-4">
              <span className="text-sm muted">
                <b className="text-gradient">{RESULTS.length} flights</b> on Fri 23 May
              </span>
              <div className="row gap-2">
                <button type="button" className="chip active">Cheapest</button>
                <button type="button" className="chip">Fastest</button>
                <button type="button" className="chip">Best</button>
              </div>
            </div>
            <div className="col gap-3">
              {RESULTS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelected(r.id)}
                  className="card card-hover"
                  style={{
                    padding: 20,
                    textAlign: 'left',
                    border: selected === r.id ? '1px solid var(--accent)' : '1px solid var(--line)',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '160px minmax(0,1fr) auto',
                      gap: 24,
                      alignItems: 'center',
                    }}
                  >
                    <div className="row gap-3" style={{ alignItems: 'center' }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 'var(--r-2)',
                          background:
                            'linear-gradient(135deg, var(--accent), oklch(0.55 0.18 180))',
                          display: 'grid',
                          placeItems: 'center',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        {r.airline
                          .split(' ')
                          .map((w) => w[0])
                          .join('')}
                      </div>
                      <div>
                        <div className="fw-600 text-sm">{r.airline}</div>
                        <div className="text-xs muted">{r.fare}</div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto minmax(0,1fr) auto',
                        alignItems: 'center',
                        gap: 14,
                      }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <div className="h-3 tnum">{r.dep}</div>
                        <div className="text-xs muted mt-1 mono">{r.from}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div className="text-xs muted">{r.duration}</div>
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
                              left: '50%',
                              top: '50%',
                              transform: 'translate(-50%, -50%)',
                              background: 'var(--bg-base)',
                              padding: '2px 8px',
                            }}
                          >
                            <Icon name="plane" size={12} stroke={2} />
                          </div>
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
                        <div className="text-xs accent-text mt-2">
                          {r.direct ? 'Direct' : '1 stop'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div className="h-3 tnum">{r.arr}</div>
                        <div className="text-xs muted mt-1 mono">{r.to}</div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div className="h-3 tnum">{formatNaira(r.price)}</div>
                      {r.prev > r.price ? (
                        <div className="text-xs accent-text">
                          Was {formatNaira(r.prev)}
                        </div>
                      ) : null}
                      <span className="btn btn-accent btn-sm mt-2">
                        Select <Icon name="arrow" size={12} />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div
              className="card mt-6"
              style={{
                padding: 24,
                background: 'linear-gradient(135deg, var(--accent-soft), transparent)',
                border: '1px solid var(--accent)',
              }}
            >
              <div className="row gap-3" style={{ alignItems: 'flex-start' }}>
                <div className="ai-dot" style={{ width: 24, height: 24 }} />
                <div style={{ flex: 1 }}>
                  <div className="fw-600">Bundle this flight with a hotel</div>
                  <p className="text-sm muted mt-1" style={{ maxWidth: 520 }}>
                    2 nights at Eko Hotel + this flight ={' '}
                    <b className="accent-text">save ₦24,300</b>. Compass found it for you.
                  </p>
                </div>
                <button type="button" className="btn btn-accent btn-sm">
                  See bundle
                </button>
              </div>
            </div>

            <div className="text-xs muted mt-6 text-c">
              <span className="badge badge-soon" style={{ fontSize: 9 }}>PREVIEW</span>{' '}
              Flight bookings launching soon — pricing &amp; inventory shown is indicative.
            </div>
          </div>

          <aside style={{ position: 'sticky', top: 96 }}>
            <div className="card" style={{ padding: 24 }}>
              <div className="eyebrow mb-3">Trip summary</div>
              <div className="col gap-4">
                <div>
                  <div className="text-xs muted">Outbound · Fri 23 May</div>
                  <div className="row gap-3 mt-2" style={{ alignItems: 'center' }}>
                    <Icon name="plane" size={14} />
                    <div>
                      <div className="fw-500" style={{ fontSize: 14 }}>
                        06:25 LOS → 07:35 ABV
                      </div>
                      <div className="text-xs muted">Air Peace · Direct · 1h 10m</div>
                    </div>
                  </div>
                </div>
                <div className="hr" />
                <div>
                  <div className="text-xs muted">Return · Sun 25 May</div>
                  <div className="row gap-3 mt-2" style={{ alignItems: 'center' }}>
                    <Icon name="plane" size={14} style={{ transform: 'rotate(180deg)' }} />
                    <div>
                      <div className="fw-500" style={{ fontSize: 14 }}>
                        18:25 ABV → 19:35 LOS
                      </div>
                      <div className="text-xs muted">Air Peace · Direct · 1h 10m</div>
                    </div>
                  </div>
                </div>
                <div className="hr" />
                <div className="col gap-2">
                  <div className="between text-sm">
                    <span>Fare (1 adult)</span>
                    <span className="tnum">{formatNaira(115400)}</span>
                  </div>
                  <div className="between text-sm">
                    <span>Taxes &amp; fees</span>
                    <span className="tnum">{formatNaira(9600)}</span>
                  </div>
                </div>
                <div className="hr" />
                <div className="between">
                  <span className="fw-600">Total</span>
                  <span className="h-3 tnum">{formatNaira(125000)}</span>
                </div>
                <button
                  type="button"
                  className="btn btn-accent btn-lg"
                  style={{ justifyContent: 'center' }}
                  disabled
                >
                  Continue <Icon name="arrow" size={14} />
                </button>
              </div>
            </div>

            <div className="card mt-4" style={{ padding: 16 }}>
              <div className="row gap-2 mb-2">
                <Icon name="info" size={14} />
                <span className="fw-600 text-sm">Good to know</span>
              </div>
              <ul
                style={{
                  paddingLeft: 18,
                  margin: 0,
                  color: 'var(--ink-3)',
                  fontSize: 12,
                  lineHeight: 1.7,
                }}
              >
                <li>Check-in opens 24h before</li>
                <li>1 cabin bag (7kg) free</li>
                <li>Free cancellation within 24h</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
