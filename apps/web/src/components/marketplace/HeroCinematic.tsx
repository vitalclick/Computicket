'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Icon, type IconName } from '@/components/Icon';

type TabId = 'events' | 'concerts' | 'flights' | 'buses' | 'hotels' | 'cinema' | 'x';

interface Tab {
  id: TabId;
  label: string;
  icon: IconName;
  href: string;
}

const TABS: Tab[] = [
  { id: 'events',   label: 'Events',      icon: 'calendar', href: '/events' },
  { id: 'concerts', label: 'Concerts',    icon: 'music',    href: '/concerts' },
  { id: 'flights',  label: 'Flights',     icon: 'plane',    href: '/flights' },
  { id: 'buses',    label: 'Bus Travel',  icon: 'bus',      href: '/buses' },
  { id: 'hotels',   label: 'Stays',       icon: 'bed',      href: '/hotels' },
  { id: 'cinema',   label: 'Cinema',      icon: 'film',     href: '/cinema' },
  { id: 'x',        label: 'Experiences', icon: 'sparkle',  href: '/experiences' },
];

interface Field {
  label: string;
  value: string;
  placeholder?: boolean;
}

const FIELDS: Record<TabId, Field[]> = {
  events: [
    { label: 'Find', value: 'Concerts, comedy, theatre…', placeholder: true },
    { label: 'City', value: 'Lagos' },
    { label: 'When', value: 'This weekend' },
    { label: 'Guests', value: '2 tickets' },
  ],
  concerts: [
    { label: 'Artist or show', value: 'Asake, Burna, Tems…', placeholder: true },
    { label: 'City', value: 'Lagos' },
    { label: 'When', value: 'Next 30 days' },
    { label: 'Tier', value: 'Any · VIP available' },
  ],
  flights: [
    { label: 'From', value: 'Lagos (LOS)' },
    { label: 'To', value: 'Abuja (ABV)' },
    { label: 'Depart', value: 'Fri 23 May' },
    { label: 'Passengers', value: '1 adult, Economy' },
  ],
  buses: [
    { label: 'From', value: 'Lagos (Jibowu)' },
    { label: 'To', value: 'Benin City' },
    { label: 'Depart', value: 'Sat 24 May, 07:00' },
    { label: 'Passengers', value: '1 adult' },
  ],
  hotels: [
    { label: 'Destination', value: 'Victoria Island, Lagos' },
    { label: 'Check-in', value: 'Fri 23 May' },
    { label: 'Check-out', value: 'Sun 25 May' },
    { label: 'Guests', value: '2 guests, 1 room' },
  ],
  cinema: [
    { label: 'Movie', value: "What's showing?", placeholder: true },
    { label: 'City', value: 'Lagos' },
    { label: 'Date', value: 'Today' },
    { label: 'Format', value: 'IMAX, 3D, 2D' },
  ],
  x: [
    { label: 'What', value: 'Yacht cruises, tours…', placeholder: true },
    { label: 'Where', value: 'Lagos' },
    { label: 'When', value: 'This weekend' },
    { label: 'Guests', value: '4 guests' },
  ],
};

const QUICK_PROMPTS = [
  'Burna Boy Lagos',
  'Cheap flights LOS→ABV',
  'Eko Hotel weekend',
  'Sunset cruise',
  'Asake VIP',
  'Bus to Benin',
];

const STATS = [
  { n: '1.2M+', l: 'Tickets sold this year' },
  { n: '2,400+', l: 'Events on-platform' },
  { n: '38', l: 'Airlines & operators' },
  { n: '4.9', l: 'App rating · 84k reviews' },
  { n: '99.97%', l: 'Booking success rate' },
];

export function HeroCinematic() {
  const [tab, setTab] = useState<TabId>('events');
  const fields = FIELDS[tab];
  const activeTab = TABS.find((t) => t.id === tab)!;

  return (
    <section
      className="nebula"
      style={{ position: 'relative', overflow: 'hidden', paddingTop: 32, paddingBottom: 80 }}
    >
      <div className="stars" />
      <div
        style={{
          position: 'absolute',
          top: -200,
          right: -150,
          width: 700,
          height: 700,
          background: 'radial-gradient(circle, oklch(0.55 0.22 152 / .45), transparent 60%)',
          pointerEvents: 'none',
          filter: 'blur(20px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -300,
          left: -200,
          width: 800,
          height: 800,
          background: 'radial-gradient(circle, oklch(0.50 0.18 180 / .35), transparent 60%)',
          pointerEvents: 'none',
          filter: 'blur(20px)',
        }}
      />

      <div className="wrap" style={{ position: 'relative', paddingTop: 60, paddingBottom: 60 }}>
        <div className="between mb-6" style={{ alignItems: 'center' }}>
          <div className="ai-pill">
            <span className="ai-dot" />
            <span>
              Sign in for AI-personalised picks —{' '}
              <b style={{ color: 'var(--accent)' }}>free</b>
            </span>
          </div>
          <div className="row gap-2" style={{ alignItems: 'center' }}>
            <span className="pill-stat">
              <span className="dot dot-live" /> 4,812 booking now
            </span>
            <span className="pill-stat">
              <Icon name="shield" size={12} /> Buyer protection on every order
            </span>
          </div>
        </div>

        <div style={{ maxWidth: 880 }}>
          <h1 className="h-1" style={{ margin: '0 0 28px' }}>
            <span className="text-gradient" style={{ display: 'block' }}>
              Everywhere you&apos;d rather be —
            </span>
            <span
              className="serif"
              style={{
                display: 'block',
                fontSize: '0.92em',
                color: 'var(--ink-2)',
                /* Instrument Serif italic has tall descenders that
                   overflow .h-1's tight 0.95 line-height and collide
                   with the paragraph below. Give it a roomier
                   line-box on its own line. */
                lineHeight: 1.15,
                marginTop: 4,
              }}
            >
              booked in one tap.
            </span>
          </h1>
          <p
            style={{
              fontSize: 18,
              color: 'var(--ink-2)',
              maxWidth: 620,
              lineHeight: 1.55,
              textWrap: 'pretty',
            }}
          >
            Concerts, flights, stays and experiences across Nigeria — curated and AI-personalised by
            <span className="accent-text"> Compass</span>. From Lagos rooftops to Abuja take-offs,
            your weekend starts here.
          </p>
        </div>

        <div className="search-tabs mt-8">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`search-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <Icon name={t.icon} size={14} /> {t.label}
            </button>
          ))}
        </div>

        <div
          className="search-bar"
          style={{ gridTemplateColumns: `repeat(${fields.length}, 1fr) auto` }}
        >
          {fields.map((f, i) => (
            <div
              key={f.label}
              className="search-field"
              style={{
                borderRight: i < fields.length - 1 ? '1px solid var(--line)' : 'none',
              }}
            >
              <div className="search-label">{f.label}</div>
              <div className={`search-value ${f.placeholder ? 'placeholder' : ''}`}>
                {f.value}
              </div>
            </div>
          ))}
          <Link
            href={activeTab.href}
            className="btn btn-accent btn-lg"
            style={{ margin: 6, padding: '18px 28px' }}
          >
            <Icon name="search" size={16} /> Search
          </Link>
        </div>

        <div className="row mt-4 gap-2" style={{ flexWrap: 'wrap' }}>
          <span
            className="text-xs muted"
            style={{ alignSelf: 'center', marginRight: 4 }}
          >
            Try:
          </span>
          {QUICK_PROMPTS.map((s) => (
            <Link
              key={s}
              href={`/events?q=${encodeURIComponent(s)}`}
              className="chip"
              style={{ fontSize: 12 }}
            >
              <Icon name="sparkle" size={11} /> {s}
            </Link>
          ))}
        </div>

        <div
          className="row mt-8"
          style={{
            gap: 48,
            paddingTop: 32,
            borderTop: '1px solid var(--line)',
            flexWrap: 'wrap',
          }}
        >
          {STATS.map((s) => (
            <div key={s.l} style={{ flex: 1, minWidth: 140 }}>
              <div className="h-2 tnum" style={{ fontSize: 32 }}>
                {s.n}
              </div>
              <div className="text-xs muted mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
