import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import { CategoryHero } from '@/components/marketplace/CategoryHero';
import { SectionHead } from '@/components/marketplace/SectionHead';
import { formatNaira } from '@/lib/design-data';

export const metadata: Metadata = {
  title: 'Cinema showtimes — Lagos, Abuja, Port Harcourt',
  description:
    'IMAX, 3D and standard screenings across Filmhouse, Genesis, Silverbird and EbonyLife Place. Pick a movie, pick a seat, walk in.',
};

const NOW_SHOWING = [
  { id: 'm1', title: 'Anikulapo: Rise of the Spectre', tag: 'Nollywood', rating: '15', duration: '2h 18m', ph: 'ph-3', from: 4500 },
  { id: 'm2', title: 'The Black Book',                 tag: 'Action',    rating: '15', duration: '2h 5m',  ph: 'ph-4', from: 4500 },
  { id: 'm3', title: 'Jagun Jagun',                    tag: 'Epic',      rating: '18', duration: '2h 7m',  ph: 'ph-1', from: 4800 },
  { id: 'm4', title: 'Brotherhood',                    tag: 'Crime',     rating: '15', duration: '1h 57m', ph: 'ph-2', from: 4200 },
  { id: 'm5', title: 'Mami Wata',                      tag: 'Drama',     rating: '12', duration: '1h 47m', ph: 'ph-5', from: 4200 },
  { id: 'm6', title: 'Battle on Buka Street',          tag: 'Comedy',    rating: '12', duration: '2h 1m',  ph: 'ph-6', from: 4200 },
];

const CHAINS = [
  { name: 'Filmhouse Cinemas',  city: 'Lagos · Lekki, Surulere, Ikeja',   formats: 'IMAX · 4DX · 2D' },
  { name: 'Genesis Cinemas',     city: 'Lagos · Abuja · PH',                formats: '3D · 2D' },
  { name: 'Silverbird Cinemas',  city: 'V/Island · Ikeja · Abuja',          formats: '3D · 2D · Premium' },
  { name: 'EbonyLife Place',     city: 'V/Island, Lagos',                   formats: 'Premium recliner · 2D' },
  { name: 'Viva Cinemas',         city: 'Ibadan · Ilorin · Akure',          formats: '2D' },
];

export default function CinemaPage() {
  return (
    <div className="page-enter">
      <CategoryHero
        eyebrow="Cinema · Movies"
        title="What's showing tonight."
        subtitle="Nollywood premieres, Hollywood blockbusters, IMAX and 4DX — book your seat across Filmhouse, Genesis, Silverbird, EbonyLife Place and Viva."
        ph="ph-3"
        primaryCta={{ label: 'Pick a movie', href: '/events?q=cinema' }}
        secondaryCta={{ label: 'Theatre instead', href: '/theatre' }}
        badges={[
          { icon: 'film', label: 'IMAX · 3D · 2D' },
          { icon: 'pin', label: '24 screens in NG' },
        ]}
      />

      <section className="wrap section-sm">
        <SectionHead
          eyebrow="Now showing"
          title="In cinemas this weekend."
          sub="Walk-in tickets, premium recliners, IMAX. Pick a screening, choose your seat, scan in at the door."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {NOW_SHOWING.map((m) => (
            <div key={m.id} className="card card-hover">
              <div className={`ph ${m.ph} ph-noise`} style={{ height: 260, position: 'relative' }}>
                <span
                  className="badge badge-soon"
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    background: 'oklch(0 0 0 / .55)',
                    color: 'white',
                  }}
                >
                  {m.rating}
                </span>
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
                    bottom: 16,
                    color: 'white',
                  }}
                >
                  <div className="mono text-xs" style={{ opacity: 0.8, letterSpacing: '.18em' }}>
                    {m.tag.toUpperCase()} · {m.duration.toUpperCase()}
                  </div>
                  <div className="serif" style={{ fontSize: 22, marginTop: 4, lineHeight: 1.1 }}>
                    {m.title}
                  </div>
                </div>
              </div>
              <div style={{ padding: '14px 18px 18px' }}>
                <div className="between">
                  <div>
                    <div className="text-xs muted">From</div>
                    <div className="h-4 tnum">{formatNaira(m.from)}</div>
                  </div>
                  <button type="button" className="btn btn-accent btn-sm">
                    Pick showtime <Icon name="arrow" size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap section-sm" style={{ paddingTop: 0 }}>
        <SectionHead
          eyebrow="Chains"
          title="The cinemas in our network."
          sub="Five major chains, 28 locations across Nigeria — and counting."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
          {CHAINS.map((c) => (
            <div key={c.name} className="card" style={{ padding: 18 }}>
              <div className="h-4" style={{ fontSize: 14 }}>
                {c.name}
              </div>
              <div className="text-xs muted mt-2">{c.city}</div>
              <div className="text-xs accent-text mt-1">{c.formats}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="wrap" style={{ paddingBottom: 48 }}>
        <div className="card" style={{ padding: 20, textAlign: 'center' }}>
          <span className="badge badge-soon" style={{ fontSize: 9 }}>
            PREVIEW
          </span>{' '}
          <span className="text-sm muted">
            Cinema seat-picking launches with Filmhouse later this year.
          </span>
        </div>
      </div>
    </div>
  );
}
