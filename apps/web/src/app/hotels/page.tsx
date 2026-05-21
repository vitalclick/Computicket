'use client';

import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { DESIGN_HOTELS, formatNaira } from '@/lib/design-data';

const FILTERS = [
  'Lagos', 'Abuja', 'Port Harcourt', 'Calabar', 'Lekki', 'Victoria Island', 'Ikoyi', 'Maitama',
];
const FEATURES = ['5★', 'Pool', 'Beach', 'Spa', 'Pet-friendly', 'Free cancel'];

const MAP_PINS = [
  { x: 30, y: 35, price: '₦185k', selected: true },
  { x: 55, y: 55, price: '₦142k' },
  { x: 72, y: 38, price: '₦135k' },
  { x: 42, y: 72, price: '₦128k' },
  { x: 80, y: 75, price: '₦98k' },
];

export default function HotelsPage() {
  const [selected, setSelected] = useState('h1');
  const hotel = DESIGN_HOTELS.find((h) => h.id === selected) ?? DESIGN_HOTELS[0]!;

  return (
    <div className="page-enter">
      <section style={{ background: 'var(--bg-deep)', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap" style={{ paddingTop: 32, paddingBottom: 32 }}>
          <div className="between mb-4">
            <div>
              <div className="eyebrow mb-1">Stays</div>
              <h1 className="h-2">Lagos · 23 May – 25 May · 2 guests</h1>
            </div>
            <span className="ai-pill">
              <span className="ai-dot" />
              <span>Compass: rates dropping Thursday — wait?</span>
            </span>
          </div>

          <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
            {FILTERS.map((c) => (
              <button
                key={c}
                type="button"
                className={`chip ${c === 'Lagos' ? 'active' : ''}`}
              >
                {c}
              </button>
            ))}
            <span className="vhr" style={{ margin: '0 6px' }} />
            {FEATURES.map((c) => (
              <button key={c} type="button" className="chip">
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section
        className="wrap"
        style={{
          paddingTop: 24,
          paddingBottom: 96,
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)',
          gap: 24,
          alignItems: 'flex-start',
        }}
      >
        <div>
          <div className="between mb-4">
            <span className="text-sm muted">
              <b className="text-gradient">{DESIGN_HOTELS.length} stays</b> in Lagos
            </span>
            <button type="button" className="chip">
              Best match <Icon name="chevronDown" size={11} />
            </button>
          </div>

          <div className="col gap-4">
            {DESIGN_HOTELS.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => setSelected(h.id)}
                className="card card-hover"
                style={{
                  padding: 0,
                  display: 'grid',
                  gridTemplateColumns: '260px minmax(0,1fr)',
                  overflow: 'hidden',
                  textAlign: 'left',
                  cursor: 'pointer',
                  border:
                    selected === h.id ? '1px solid var(--accent)' : '1px solid var(--line)',
                }}
              >
                <div
                  className={`ph ${h.ph} ph-noise`}
                  style={{ minHeight: 200, position: 'relative' }}
                >
                  {h.badge ? (
                    <span
                      className="badge badge-vip"
                      style={{ position: 'absolute', top: 12, left: 12 }}
                    >
                      {h.badge}
                    </span>
                  ) : null}
                  <span
                    className="icon-btn"
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: 'oklch(0 0 0 / .4)',
                      border: 0,
                      color: 'white',
                    }}
                  >
                    <Icon name="heart" size={14} />
                  </span>
                </div>
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
                  <div className="between" style={{ alignItems: 'flex-start' }}>
                    <div>
                      <div className="h-4" style={{ fontSize: 18 }}>
                        {h.name}
                      </div>
                      <div className="text-xs muted mt-1">{h.city}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div
                        className="row gap-1"
                        style={{ justifyContent: 'flex-end', alignItems: 'center', fontSize: 13 }}
                      >
                        <Icon name="star" size={12} /> <b>{h.rating}</b>
                      </div>
                      <div className="text-xs muted">{h.reviews.toLocaleString()} reviews</div>
                    </div>
                  </div>
                  <div className="row gap-2 mt-3" style={{ flexWrap: 'wrap' }}>
                    {h.tags.map((t) => (
                      <span
                        key={t}
                        className="chip"
                        style={{ fontSize: 11, padding: '4px 10px' }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div style={{ flex: 1 }} />
                  <div className="between mt-4">
                    <div>
                      <div className="text-xs muted">2 nights · taxes included</div>
                      <div className="row gap-1 mt-1" style={{ alignItems: 'baseline' }}>
                        <span className="h-3 tnum">{formatNaira(h.price)}</span>
                        <span className="text-xs muted">/ night</span>
                      </div>
                    </div>
                    <span className="btn btn-accent btn-sm">
                      See rooms <Icon name="arrow" size={13} />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <aside
          style={{ position: 'sticky', top: 96, display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <div
            className="card"
            style={{ padding: 0, overflow: 'hidden', position: 'relative', height: 280 }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `
                  radial-gradient(circle at 30% 40%, oklch(0.18 0.07 285), oklch(0.10 0.05 285)),
                  linear-gradient(45deg, transparent 48%, oklch(0.30 0.05 285) 49%, oklch(0.30 0.05 285) 51%, transparent 52%)
                `,
                backgroundSize: 'cover, 80px 80px',
              }}
            />
            <svg
              viewBox="0 0 400 280"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            >
              <path
                d="M0,80 Q120,60 200,100 T400,140"
                stroke="oklch(0.30 0.05 285)"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M0,180 Q160,200 240,160 T400,200"
                stroke="oklch(0.30 0.05 285)"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M120,0 L160,280"
                stroke="oklch(0.30 0.05 285)"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M280,0 Q260,140 300,280"
                stroke="oklch(0.30 0.05 285)"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
            {MAP_PINS.map((m, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${m.x}%`,
                  top: `${m.y}%`,
                  transform: 'translate(-50%,-100%)',
                  padding: '6px 10px',
                  borderRadius: 'var(--r-pill)',
                  background: m.selected ? 'var(--accent)' : 'var(--ink)',
                  color: m.selected ? 'oklch(0.2 0.05 152)' : 'var(--bg-void)',
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  boxShadow: '0 4px 12px oklch(0 0 0 / .4)',
                  zIndex: m.selected ? 2 : 1,
                }}
              >
                {m.price}
              </div>
            ))}
            <div style={{ position: 'absolute', top: 12, right: 12 }}>
              <button type="button" className="btn btn-glass btn-sm">
                View full map
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className={`ph ${hotel.ph} ph-noise`} style={{ height: 200, position: 'relative' }}>
              <div className="row" style={{ position: 'absolute', top: 12, left: 12, gap: 6 }}>
                <span className="badge badge-vip">{hotel.badge ?? '5★'}</span>
              </div>
              <button
                type="button"
                className="btn btn-glass btn-sm"
                style={{
                  position: 'absolute',
                  bottom: 12,
                  right: 12,
                  color: 'white',
                }}
              >
                <Icon name="grid" size={13} /> 24 photos
              </button>
            </div>
            <div style={{ padding: 24 }}>
              <div className="h-3">{hotel.name}</div>
              <div className="row gap-2 mt-1 muted text-sm">
                <Icon name="pin" size={13} /> {hotel.city}
              </div>

              <div className="row gap-4 mt-4" style={{ flexWrap: 'wrap' }}>
                {hotel.tags.map((t) => (
                  <span key={t} className="row gap-1 text-xs">
                    <Icon name="check" size={12} /> {t}
                  </span>
                ))}
                <span className="row gap-1 text-xs">
                  <Icon name="wifi" size={12} /> Free WiFi
                </span>
                <span className="row gap-1 text-xs">
                  <Icon name="ac" size={12} /> 24/7 AC
                </span>
              </div>

              <div className="card mt-5" style={{ padding: 14, background: 'var(--surface-2)' }}>
                <div className="between">
                  <div>
                    <div className="row gap-2">
                      <Icon name="star" size={14} />
                      <b>{hotel.rating} Exceptional</b>
                    </div>
                    <div className="text-xs muted mt-1">
                      {hotel.reviews.toLocaleString()} verified reviews
                    </div>
                  </div>
                  <button type="button" className="text-xs accent-text">
                    Read reviews
                  </button>
                </div>
              </div>

              <div className="eyebrow mt-6 mb-3">Available rooms · 23–25 May</div>
              <div className="col gap-2">
                {[
                  { n: 'Deluxe Lagoon View', b: 'King bed · 38m²',         p: hotel.price,                 cancel: true },
                  { n: 'Executive Suite',    b: 'King + lounge · 56m²',    p: Math.round(hotel.price * 1.7), cancel: true, popular: true },
                  { n: 'Presidential',       b: '2 bedrooms · 110m²',      p: Math.round(hotel.price * 3.4), cancel: false },
                ].map((r) => (
                  <div
                    key={r.n}
                    className="between"
                    style={{
                      padding: 14,
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--r-3)',
                    }}
                  >
                    <div>
                      <div className="row gap-2">
                        <span className="fw-600" style={{ fontSize: 14 }}>
                          {r.n}
                        </span>
                        {r.popular ? (
                          <span className="badge badge-vip">Most booked</span>
                        ) : null}
                      </div>
                      <div className="text-xs muted mt-1">{r.b}</div>
                      {r.cancel ? (
                        <div className="text-xs accent-text mt-1">
                          Free cancel until 22 May
                        </div>
                      ) : null}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="h-4 tnum">{formatNaira(r.p)}</div>
                      <div className="text-xs muted">/ night</div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="btn btn-accent btn-lg mt-5"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Reserve from {formatNaira(hotel.price)} <Icon name="arrow" size={14} />
              </button>
              <div className="text-xs muted text-c mt-3">
                You won&apos;t be charged yet · Pay at property option available
              </div>
              <div className="text-xs muted text-c mt-2">
                <span className="badge badge-soon" style={{ fontSize: 9 }}>
                  PREVIEW
                </span>{' '}
                Hotel bookings launching soon — join the waitlist.
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
