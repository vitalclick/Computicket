import type { Metadata } from 'next';
import { CategoryHero } from '@/components/marketplace/CategoryHero';
import { ConcertCard } from '@/components/marketplace/ConcertCard';
import { EventCard } from '@/components/marketplace/EventCard';
import { SectionHead } from '@/components/marketplace/SectionHead';
import { DESIGN_CONCERTS, DESIGN_TRENDING } from '@/lib/design-data';

export const metadata: Metadata = {
  title: 'Concerts in Nigeria',
  description:
    'Afrobeats arenas, gospel nights, hip-hop festivals — every concert worth booking in Lagos, Abuja, Port Harcourt and beyond.',
};

export default function ConcertsPage() {
  const afrobeats = DESIGN_TRENDING.filter((e) => e.tag === 'Afrobeats');

  return (
    <div className="page-enter">
      <CategoryHero
        eyebrow="Concerts · Live music"
        title="The tour bus is parked here."
        subtitle="Cinema-grade ticketing for the artists Nigeria moves for. Asake to Tems to Davido — VIP tables, group seating, real-time inventory."
        ph="ph-2"
        primaryCta={{ label: 'Browse all concerts', href: '/events' }}
        secondaryCta={{ label: 'Set artist alerts', href: '/signup' }}
        badges={[
          { icon: 'music', label: '2,184 live' },
          { icon: 'star', label: 'VIP tiers' },
        ]}
      />

      <section className="wrap section-sm">
        <SectionHead
          eyebrow="Featured tours"
          title="Headline acts on sale."
          sub="The artists every promoter is chasing — book before the diamond booths go."
          cta="See all events"
          ctaHref="/events"
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 20 }}>
          {DESIGN_CONCERTS.slice(0, 4).map((c) => (
            <ConcertCard key={c.id} concert={c} href="/events" size="full" />
          ))}
        </div>
      </section>

      {afrobeats.length > 0 ? (
        <section className="wrap section-sm" style={{ paddingTop: 0 }}>
          <SectionHead
            eyebrow="Afrobeats"
            title="The sound of Naija weekends."
            sub="Wizkid, Burna, Asake, Rema — and the next wave waiting to break."
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 20 }}>
            {afrobeats.map((e) => (
              <EventCard key={e.id} event={e} href="/events" size="full" />
            ))}
          </div>
        </section>
      ) : null}

      <section className="wrap section-sm" style={{ paddingTop: 0 }}>
        <SectionHead
          eyebrow="Genres"
          title="Find your sound."
          sub="Every genre Nigeria turns up for — pick one and we'll surface the tour calendar."
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 14,
          }}
        >
          {[
            { g: 'Afrobeats',   c: '320 events' },
            { g: 'Gospel',      c: '92 events' },
            { g: 'Hip-hop',     c: '146 events' },
            { g: 'Jazz',        c: '38 events' },
            { g: 'Highlife',    c: '52 events' },
            { g: 'Amapiano',    c: '74 events' },
            { g: 'R&B / Soul',  c: '61 events' },
            { g: 'Alté',        c: '29 events' },
          ].map((g) => (
            <div key={g.g} className="card card-hover" style={{ padding: 20 }}>
              <div className="h-4">{g.g}</div>
              <div className="text-xs muted mt-1">{g.c}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
