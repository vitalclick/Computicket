import type { Metadata } from 'next';
import { CategoryHero } from '@/components/marketplace/CategoryHero';
import { EventCard } from '@/components/marketplace/EventCard';
import { SectionHead } from '@/components/marketplace/SectionHead';
import { DESIGN_TRENDING } from '@/lib/design-data';

export const metadata: Metadata = {
  title: 'Theatre in Nigeria',
  description:
    'Stage productions, classic Nigerian theatre, contemporary plays and musicals — book tickets to Terra Kulture, MUSON Centre and more.',
};

const STAGES = [
  { name: 'Terra Kulture',       city: 'Lagos',   note: 'Theatre Republic, Saturday night classics' },
  { name: 'MUSON Centre',        city: 'Onikan',  note: 'Concert hall — orchestral & musical theatre' },
  { name: 'Glover Hall',         city: 'Lagos',   note: 'Heritage venue, intimate runs' },
  { name: 'Freedom Park',        city: 'Lagos',   note: 'Open-air stages, jazz & festival theatre' },
  { name: 'National Theatre',    city: 'Iganmu',  note: 'Reopened — touring productions' },
  { name: 'Abuja Sheraton Hall', city: 'Abuja',   note: 'Diplomatic gala productions' },
];

export default function TheatrePage() {
  const theatreEvents = DESIGN_TRENDING.filter((e) =>
    ['Theatre', 'Jazz', 'Festival'].includes(e.tag),
  );

  return (
    <div className="page-enter">
      <CategoryHero
        eyebrow="Theatre · Stage productions"
        title="The lights go down. The story begins."
        subtitle="Nigerian playwrights, touring musicals, classical adaptations and gala nights — curated from the stages that matter."
        ph="ph-6"
        primaryCta={{ label: 'Browse productions', href: '/events' }}
        secondaryCta={{ label: 'Cinema instead', href: '/cinema' }}
        badges={[
          { icon: 'film', label: 'Live theatre' },
          { icon: 'star', label: 'Curated by editors' },
        ]}
      />

      <section className="wrap section-sm">
        <SectionHead
          eyebrow="On stage now"
          title="Currently running."
          sub="Productions across Lagos and Abuja — some run a single weekend, some a whole season. Book early; theatre houses are small."
        />
        {theatreEvents.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 20 }}>
            {theatreEvents.map((e) => (
              <EventCard key={e.id} event={e} href="/events" size="full" />
            ))}
          </div>
        ) : (
          <div
            className="card"
            style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)' }}
          >
            <p>No productions on stage right now. Check back soon — Terra Kulture refreshes monthly.</p>
          </div>
        )}
      </section>

      <section className="wrap section-sm" style={{ paddingTop: 0 }}>
        <SectionHead
          eyebrow="The stages"
          title="Where Nigerian theatre lives."
          sub="From Terra Kulture's intimate Saturday slots to the rebuilt National Theatre, here's the venue map."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {STAGES.map((s) => (
            <div key={s.name} className="card card-hover" style={{ padding: 20 }}>
              <div className="h-4">{s.name}</div>
              <div className="text-xs muted mt-1">{s.city}</div>
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--ink-3)',
                  marginTop: 10,
                  lineHeight: 1.55,
                }}
              >
                {s.note}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
