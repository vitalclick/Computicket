import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import { CategoryHero } from '@/components/marketplace/CategoryHero';
import { SectionHead } from '@/components/marketplace/SectionHead';
import { formatNaira, type Ph } from '@/lib/design-data';

export const metadata: Metadata = {
  title: 'Weekend getaways — Nigerian resorts, beach bundles, escape ideas',
  description:
    'Curated weekend escapes: La Campagne, Inagbe, Obudu, Tinapa, Yankari. Flight + hotel + activity bundles.',
};

interface Getaway {
  id: string;
  name: string;
  region: string;
  duration: string;
  ph: Ph;
  price: number;
  badge?: string;
  sub: string;
}

const GETAWAYS: Getaway[] = [
  { id: 'g1', name: 'La Campagne Tropicana',     region: 'Lekki, Lagos',         duration: '3 nights · 4 days', ph: 'ph-5', price: 285000, sub: 'Where the ocean meets the lagoon. Yacht day, spa, beach.', badge: "Editor's pick" },
  { id: 'g2', name: 'Inagbe Grand Resort',       region: 'Lagos Lagoon',         duration: '2 nights',          ph: 'ph-2', price: 198000, sub: 'Boat-access only. Private beach, infinity pool, sunset rituals.' },
  { id: 'g3', name: 'Obudu Mountain Resort',     region: 'Cross River',          duration: '4 nights',          ph: 'ph-3', price: 420000, sub: 'Cable-car arrivals. 5,200 ft above sea level. Cool weather all year.' },
  { id: 'g4', name: 'Tinapa Lakeside Adventure', region: 'Calabar',              duration: '3 nights',          ph: 'ph-6', price: 235000, sub: 'Free-zone shopping, water park, jungle treks.' },
  { id: 'g5', name: 'Yankari Safari',             region: 'Bauchi',                duration: '4 nights',          ph: 'ph-4', price: 395000, sub: 'Nigeria\'s largest game reserve. Wikki warm springs, elephant tracking.' },
  { id: 'g6', name: 'Whispering Palms Badagry',  region: 'Badagry, Lagos State', duration: '2 nights',          ph: 'ph-1', price: 168000, sub: 'Beach resort with chapel-on-the-water. Quiet, romantic, classic Lagos.' },
];

const VIBES = [
  { t: 'Beach',     c: '24 properties', i: 'pin' as const },
  { t: 'Mountain',  c: '4 properties',  i: 'arrowUp' as const },
  { t: 'Safari',    c: '3 properties',  i: 'fire' as const },
  { t: 'Lakeside',  c: '6 properties',  i: 'pulse' as const },
  { t: 'City spa',  c: '11 properties', i: 'sparkle' as const },
  { t: 'Eco-retreat',c: '5 properties', i: 'shield' as const },
];

export default function GetawaysPage() {
  return (
    <div className="page-enter">
      <CategoryHero
        eyebrow="Weekend getaways · Bundles"
        title="Sleep where the ocean meets the lagoon."
        subtitle="Flight + hotel + activity, bundled and discounted. Curated escapes within reach of Lagos and Abuja — no spreadsheets, no calls, just go."
        ph="ph-5"
        primaryCta={{ label: 'Browse getaways', href: '/hotels' }}
        secondaryCta={{ label: 'Flight + stay bundles', href: '/packages' }}
        badges={[
          { icon: 'gift', label: 'Bundle savings' },
          { icon: 'star', label: 'Editor-vetted resorts' },
        ]}
        preview
      />

      <section className="wrap section-sm">
        <SectionHead
          eyebrow="Vibes"
          title="What's the energy?"
          sub="Pick a vibe; we'll surface the right escape."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
          {VIBES.map((v) => (
            <div key={v.t} className="card card-hover" style={{ padding: 18 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--r-2)',
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Icon name={v.i} size={16} />
              </div>
              <div className="h-4 mt-3" style={{ fontSize: 14 }}>
                {v.t}
              </div>
              <div className="text-xs muted mt-1">{v.c}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap section-sm" style={{ paddingTop: 0 }}>
        <SectionHead
          eyebrow="Curated escapes"
          title="The ones we'd actually book."
          sub="Each one's a bundle — flight or transfer, stay, an activity. Add or remove pieces; we'll re-price live."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {GETAWAYS.map((g) => (
            <div key={g.id} className="card card-hover">
              <div className={`ph ${g.ph} ph-noise`} style={{ height: 260, position: 'relative' }}>
                {g.badge ? (
                  <span
                    className="badge badge-vip"
                    style={{ position: 'absolute', top: 12, left: 12 }}
                  >
                    {g.badge}
                  </span>
                ) : null}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, transparent 50%, oklch(0 0 0 / .85))',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: 16,
                    right: 16,
                    bottom: 14,
                    color: 'white',
                  }}
                >
                  <div className="mono text-xs" style={{ opacity: 0.85, letterSpacing: '.18em' }}>
                    {g.region.toUpperCase()}
                  </div>
                  <div className="serif" style={{ fontSize: 24, marginTop: 4, lineHeight: 1.1 }}>
                    {g.name}
                  </div>
                </div>
              </div>
              <div style={{ padding: 20 }}>
                <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>{g.sub}</p>
                <div className="between mt-4">
                  <div>
                    <div className="text-xs muted">Bundle from</div>
                    <div className="h-4 tnum">{formatNaira(g.price)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="text-xs muted">{g.duration}</div>
                  </div>
                  <button type="button" className="btn btn-accent btn-sm">
                    Plan trip <Icon name="arrow" size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap section-sm" style={{ paddingTop: 0 }}>
        <div
          className="card"
          style={{
            padding: 32,
            background: 'linear-gradient(135deg, var(--accent-soft), transparent)',
            border: '1px solid oklch(0.68 0.18 152 / .3)',
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) auto',
            gap: 24,
            alignItems: 'center',
          }}
        >
          <div>
            <div className="eyebrow accent-text mb-2">Getaways preview</div>
            <div className="h-3">Bundled checkout launches Q3.</div>
            <p
              className="mt-2 muted"
              style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 640 }}
            >
              Today, book individual hotel rooms, flights and experiences. Soon, book all three
              in one cart with bundle pricing. Get on the early list — we&apos;ll email you the day it ships.
            </p>
          </div>
          <a href="/signup" className="btn btn-accent">
            Notify me <Icon name="arrow" size={14} />
          </a>
        </div>
      </section>
    </div>
  );
}
