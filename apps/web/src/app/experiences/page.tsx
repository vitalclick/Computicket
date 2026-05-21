import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import { CategoryHero } from '@/components/marketplace/CategoryHero';
import { SectionHead } from '@/components/marketplace/SectionHead';
import { DESIGN_EXPERIENCES, formatNaira } from '@/lib/design-data';

export const metadata: Metadata = {
  title: 'Experiences in Nigeria — yacht cruises, gallery tours, brunch',
  description:
    'Curated lifestyle experiences across Lagos and Abuja. Sunset cruises, art tours, beach days, weekend brunch.',
};

const CATEGORIES = [
  { id: 'lifestyle', label: 'Lifestyle',  count: 38, hint: 'Yacht, beach, brunch' },
  { id: 'culture',   label: 'Culture',    count: 24, hint: 'Galleries, heritage tours' },
  { id: 'food',      label: 'Food',       count: 31, hint: 'Tastings, supper clubs' },
  { id: 'family',    label: 'Family',     count: 19, hint: 'Parks, kid-friendly' },
  { id: 'wellness',  label: 'Wellness',   count: 12, hint: 'Spa, yoga retreats' },
  { id: 'adventure', label: 'Adventure',  count: 8,  hint: 'Hikes, canopy walks' },
];

const TONIGHT = [
  { t: 'Quilox Brunch · Sunday 1pm',        n: 'Brunch · Lagos',   price: '₦28,000', sub: 'Bottomless mimosas, beach view' },
  { t: 'Nike Art Gallery Tour',              n: 'Culture · Lagos',  price: '₦8,000',  sub: 'Live with the curator' },
  { t: 'Lagoon Sunset Cruise',               n: 'Lifestyle · Lagos',price: '₦35,000', sub: 'Boards 5:30pm · 3 hours' },
  { t: 'Lekki Conservation Canopy Walk',     n: 'Adventure · Lagos',price: '₦5,000',  sub: 'Africa\'s longest canopy walk' },
];

export default function ExperiencesPage() {
  return (
    <div className="page-enter">
      <CategoryHero
        eyebrow="Experiences · Curated weekly"
        title="Aspirational, Naija-coded."
        subtitle="Curated escapes, getaways and lifestyle picks for the weekend ahead. The places editors are actually going to."
        ph="ph-5"
        primaryCta={{ label: 'Browse experiences', href: '/events?q=experiences' }}
        secondaryCta={{ label: 'Plan a getaway', href: '/getaways' }}
        badges={[
          { icon: 'sparkle', label: 'Curated' },
          { icon: 'star', label: 'Editor-vetted' },
        ]}
      />

      <section className="wrap section-sm">
        <SectionHead
          eyebrow="Categories"
          title="What's your weekend look like?"
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
          {CATEGORIES.map((c) => (
            <div key={c.id} className="card card-hover" style={{ padding: 18 }}>
              <div className="h-4">{c.label}</div>
              <div className="text-xs muted mt-1">{c.count} listings</div>
              <div className="text-xs accent-text mt-2">{c.hint}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap section-sm" style={{ paddingTop: 0 }}>
        <SectionHead
          eyebrow="This weekend"
          title="What we'd book if we had your weekend."
          sub="Editor picks from the next 72 hours — book ahead, the better ones fill by Wednesday."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {DESIGN_EXPERIENCES.map((x) => (
            <div key={x.id} className="card card-hover">
              <div className={`ph ${x.ph} ph-noise`} style={{ height: 200, position: 'relative' }}>
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
                  {x.category}
                </span>
              </div>
              <div style={{ padding: 18 }}>
                <div className="h-4" style={{ fontSize: 15 }}>
                  {x.title}
                </div>
                <div className="text-xs muted mt-1">{x.duration}</div>
                <div className="between mt-4">
                  <span className="h-4 tnum">{formatNaira(x.price)}</span>
                  <button type="button" className="btn btn-accent btn-sm">
                    Book <Icon name="arrow" size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap section-sm" style={{ paddingTop: 0 }}>
        <SectionHead
          eyebrow="Tonight"
          title="On for tonight."
          sub="Same-day bookings, instant confirmation."
        />
        <div className="col gap-3">
          {TONIGHT.map((t, i) => (
            <div
              key={i}
              className="card card-hover"
              style={{
                padding: 18,
                display: 'grid',
                gridTemplateColumns: 'minmax(0,1fr) auto auto',
                gap: 24,
                alignItems: 'center',
              }}
            >
              <div>
                <div className="fw-600" style={{ fontSize: 15 }}>
                  {t.t}
                </div>
                <div className="text-xs muted mt-1">
                  {t.n} · {t.sub}
                </div>
              </div>
              <div className="h-4 tnum">{t.price}</div>
              <button type="button" className="btn btn-accent btn-sm">
                Book <Icon name="arrow" size={12} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
