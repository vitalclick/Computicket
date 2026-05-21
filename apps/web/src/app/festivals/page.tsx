import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import { CategoryHero } from '@/components/marketplace/CategoryHero';
import { SectionHead } from '@/components/marketplace/SectionHead';
import { formatNaira, type Ph } from '@/lib/design-data';

export const metadata: Metadata = {
  title: 'Nigerian festivals — Detty December, Calabar Carnival, Felabration',
  description:
    'Music, culture, food and arts festivals across Nigeria. Multi-day passes, VIP booths, group bookings.',
};

interface Festival {
  id: string;
  name: string;
  city: string;
  dates: string;
  ph: Ph;
  days: number;
  from: number;
  sub: string;
  vibe: string;
  hot?: boolean;
}

const FESTIVALS: Festival[] = [
  { id: 'f1', name: 'Detty December', city: 'Lagos',     dates: '20 Dec – 02 Jan', ph: 'ph-4', days: 14, from: 8000,  sub: 'Two weeks. Every party. The diaspora comes home.', vibe: 'Music · Beach · Fashion · Food', hot: true },
  { id: 'f2', name: 'Felabration',    city: 'Lagos',     dates: '13 – 19 Oct',     ph: 'ph-6', days: 7,  from: 5000,  sub: 'A week of Afrobeat at the New Afrika Shrine, in tribute to Fela.', vibe: 'Afrobeat · Heritage' },
  { id: 'f3', name: 'Calabar Carnival', city: 'Calabar', dates: '01 – 31 Dec',     ph: 'ph-3', days: 31, from: 12000, sub: "Africa's biggest street carnival. Bands compete; the city dances.", vibe: 'Street · Culture · Dance' },
  { id: 'f4', name: 'Lagos Jazz Festival', city: 'Lagos', dates: '14 – 16 Jun',    ph: 'ph-5', days: 3,  from: 15000, sub: 'Three nights of Nigerian and global jazz under the Muri Okunola sky.', vibe: 'Jazz · Open-air' },
  { id: 'f5', name: 'Eyo Festival',   city: 'Lagos',     dates: '04 May',          ph: 'ph-1', days: 1,  from: 0,     sub: 'The white-robed Eyo masquerades parade Lagos Island. Spectator pass.', vibe: 'Heritage · Free entry' },
  { id: 'f6', name: 'Rhythm Unplugged', city: 'Lagos',   dates: '23 Dec',          ph: 'ph-2', days: 1,  from: 35000, sub: 'Nigeria\'s longest-running concert series — comedy, music, surprise headliners.', vibe: 'Comedy · Music · VIP' },
];

export default function FestivalsPage() {
  return (
    <div className="page-enter">
      <CategoryHero
        eyebrow="Festivals · Multi-day"
        title="When Nigeria turns up, it turns all the way up."
        subtitle="Detty December, Calabar Carnival, Felabration, jazz under the stars — the festivals that define the calendar. Multi-day passes, group bookings, VIP."
        ph="ph-4"
        primaryCta={{ label: 'Browse festivals', href: '/events?q=festival' }}
        secondaryCta={{ label: 'Concerts instead', href: '/concerts' }}
        badges={[
          { icon: 'fire', label: 'Trending' },
          { icon: 'calendar', label: 'Multi-day passes' },
        ]}
      />

      <section className="wrap section-sm">
        <SectionHead
          eyebrow="Marquee festivals"
          title="The calendar in one view."
          sub="From the diaspora reunion that is Detty December to the heritage processions of Eyo — these are the can't-miss dates."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {FESTIVALS.map((f) => (
            <div key={f.id} className="card card-hover">
              <div className={`ph ${f.ph} ph-noise`} style={{ height: 280, position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, transparent 40%, oklch(0 0 0 / .88))',
                  }}
                />
                {f.hot ? (
                  <span
                    className="badge"
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: 'var(--danger)',
                      color: 'white',
                    }}
                  >
                    Trending
                  </span>
                ) : null}
                <div
                  style={{
                    position: 'absolute',
                    left: 18,
                    right: 18,
                    bottom: 16,
                    color: 'white',
                  }}
                >
                  <div className="mono text-xs" style={{ opacity: 0.85, letterSpacing: '.18em' }}>
                    {f.dates.toUpperCase()} · {f.city.toUpperCase()}
                  </div>
                  <div className="serif" style={{ fontSize: 28, marginTop: 4, lineHeight: 1.05 }}>
                    {f.name}
                  </div>
                  <div className="text-xs mt-2" style={{ opacity: 0.85 }}>
                    {f.vibe}
                  </div>
                </div>
              </div>
              <div style={{ padding: 20 }}>
                <p
                  style={{
                    fontSize: 13.5,
                    color: 'var(--ink-2)',
                    lineHeight: 1.6,
                  }}
                >
                  {f.sub}
                </p>
                <div className="between mt-4">
                  <div>
                    <div className="text-xs muted">From</div>
                    <div className="h-4 tnum">
                      {f.from === 0 ? 'Free' : formatNaira(f.from)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="text-xs muted">Length</div>
                    <div className="mono text-sm">{f.days} day{f.days === 1 ? '' : 's'}</div>
                  </div>
                  <button type="button" className="btn btn-accent btn-sm">
                    Tickets <Icon name="arrow" size={12} />
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
          }}
        >
          <div className="row gap-3" style={{ alignItems: 'flex-start' }}>
            <span className="ai-dot" style={{ width: 28, height: 28, flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <div className="eyebrow accent-text mb-1">Compass bundle</div>
              <div className="h-3">Detty December weekend in one tap</div>
              <p
                className="mt-2 muted"
                style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 640 }}
              >
                Round-trip flight from Abuja, three nights at Eko Hotel, festival pass and one Sunday brunch.
                Save ₦64,000 vs. booking it piece by piece.
              </p>
              <button type="button" className="btn btn-accent mt-4">
                Plan my December <Icon name="arrow" size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
