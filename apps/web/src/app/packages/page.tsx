import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import { CategoryHero } from '@/components/marketplace/CategoryHero';
import { SectionHead } from '@/components/marketplace/SectionHead';
import { formatNaira, type Ph } from '@/lib/design-data';

export const metadata: Metadata = {
  title: 'Package deals — flight + hotel + event bundles',
  description:
    'Bundle a flight, hotel and event in a single checkout. Compass finds the cheapest combination automatically.',
};

interface Bundle {
  id: string;
  title: string;
  legs: string[];
  ph: Ph;
  bundle: number;
  separate: number;
  perks: string[];
}

const BUNDLES: Bundle[] = [
  {
    id: 'b1',
    title: 'Asake VIP · The Abuja → Lagos weekend',
    legs: ['LOS ↔ ABV · Air Peace', '2 nights at Eko Hotel', 'Asake VIP table for 4'],
    ph: 'ph-2',
    bundle: 285000,
    separate: 348000,
    perks: ['Free seat selection', 'Hotel breakfast included', 'Airport pickup'],
  },
  {
    id: 'b2',
    title: 'Detty December · 5 nights, 3 shows',
    legs: ['1 way LOS · 5 nights Lagos Continental', '3 Detty events + brunch', 'Yacht cruise upgrade'],
    ph: 'ph-4',
    bundle: 685000,
    separate: 820000,
    perks: ['Skip-the-line on all shows', 'Free cancellation 14 days', 'Concierge'],
  },
  {
    id: 'b3',
    title: 'Calabar Carnival quick hit',
    legs: ['LOS → CBQ · Ibom Air', '2 nights Marina Resort', 'Carnival grandstand pass'],
    ph: 'ph-3',
    bundle: 295000,
    separate: 358000,
    perks: ['Reserved grandstand seat', 'Hotel transfers', 'Carnival map'],
  },
  {
    id: 'b4',
    title: 'Tems · Eko Beach weekend',
    legs: ['ABV → LOS Friday · 2 nights Radisson Blu', 'Tems concert', 'Sunday brunch at Quilox'],
    ph: 'ph-5',
    bundle: 318000,
    separate: 385000,
    perks: ['Brunch reservation included', 'Late checkout', 'Saturday spa add-on'],
  },
];

export default function PackagesPage() {
  return (
    <div className="page-enter">
      <CategoryHero
        eyebrow="Package deals · Bundle & save"
        title="One cart. One total. Real savings."
        subtitle="Compass finds the cheapest combination of flight, hotel and event so you don't have to. Five bundles to start — book the whole weekend in one tap."
        ph="ph-2"
        primaryCta={{ label: 'Browse bundles', href: '#bundles' }}
        secondaryCta={{ label: 'Build your own', href: '/events' }}
        badges={[
          { icon: 'gift', label: 'Save up to 18%' },
          { icon: 'sparkle', label: 'AI-priced' },
        ]}
        preview
      />

      <section id="bundles" className="wrap section-sm">
        <SectionHead
          eyebrow="Featured bundles"
          title="The combinations Compass is recommending right now."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {BUNDLES.map((b) => {
            const savings = b.separate - b.bundle;
            const pct = Math.round((savings / b.separate) * 100);
            return (
              <div key={b.id} className="card card-hover" style={{ display: 'grid', gridTemplateColumns: '180px minmax(0,1fr)' }}>
                <div
                  className={`ph ${b.ph} ph-noise`}
                  style={{ minHeight: 240, position: 'relative' }}
                >
                  <span
                    className="badge badge-vip"
                    style={{ position: 'absolute', top: 12, left: 12 }}
                  >
                    Save {pct}%
                  </span>
                </div>
                <div style={{ padding: 22 }}>
                  <div className="serif" style={{ fontSize: 22, lineHeight: 1.15 }}>
                    {b.title}
                  </div>
                  <ul
                    style={{
                      margin: '12px 0 0',
                      paddingLeft: 18,
                      color: 'var(--ink-3)',
                      fontSize: 12.5,
                      lineHeight: 1.7,
                    }}
                  >
                    {b.legs.map((leg) => (
                      <li key={leg}>{leg}</li>
                    ))}
                  </ul>
                  <div className="row gap-2 mt-3" style={{ flexWrap: 'wrap' }}>
                    {b.perks.map((p) => (
                      <span key={p} className="chip" style={{ fontSize: 11 }}>
                        <Icon name="check" size={11} /> {p}
                      </span>
                    ))}
                  </div>
                  <div className="between mt-4">
                    <div>
                      <div className="text-xs muted">Bundle</div>
                      <div className="row gap-2" style={{ alignItems: 'baseline' }}>
                        <span className="h-3 tnum">{formatNaira(b.bundle)}</span>
                        <span
                          className="text-xs muted"
                          style={{ textDecoration: 'line-through' }}
                        >
                          {formatNaira(b.separate)}
                        </span>
                      </div>
                    </div>
                    <button type="button" className="btn btn-accent btn-sm">
                      See bundle <Icon name="arrow" size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0,1fr) auto',
              gap: 24,
              alignItems: 'center',
            }}
          >
            <div>
              <div className="eyebrow accent-text mb-2">Build your own</div>
              <div className="h-3">Pick an event. We&apos;ll bundle the rest.</div>
              <p className="mt-2 muted" style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 640 }}>
                Open any event detail page and we&apos;ll surface the matching flight and hotel
                options as a single bundle. Add, remove or swap any leg before checkout.
              </p>
            </div>
            <a href="/events" className="btn btn-accent">
              Browse events <Icon name="arrow" size={14} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
