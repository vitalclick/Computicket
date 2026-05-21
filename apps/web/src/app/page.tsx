import Link from 'next/link';
import { AppPromo } from '@/components/marketplace/AppPromo';
import { BusRail } from '@/components/marketplace/BusRail';
import { CategoryTiles } from '@/components/marketplace/CategoryTiles';
import { ConcertCard } from '@/components/marketplace/ConcertCard';
import { EventCard } from '@/components/marketplace/EventCard';
import { FlightRail } from '@/components/marketplace/FlightRail';
import { ForYouRail } from '@/components/marketplace/ForYouRail';
import { HeroCinematic } from '@/components/marketplace/HeroCinematic';
import { LiveTicker } from '@/components/marketplace/LiveTicker';
import { SectionHead } from '@/components/marketplace/SectionHead';
import { TrustStrip } from '@/components/marketplace/TrustStrip';
import { WeekendBlock } from '@/components/marketplace/WeekendBlock';
import { api, type EventSummary } from '@/lib/api';
import { DESIGN_CONCERTS, DESIGN_TRENDING } from '@/lib/design-data';
import { toDesignEvent } from '@/lib/event-adapter';

export default async function HomePage() {
  let liveEvents: EventSummary[] = [];
  try {
    liveEvents = await api.listEvents();
  } catch {
    /* API not reachable in build/dev — fall back to design data */
  }

  // Prefer real events; pad with design mocks so the rail looks full.
  const designLive = liveEvents.slice(0, 4).map((e) => ({
    event: toDesignEvent(e),
    href: `/events/${e.slug}`,
  }));
  const padded = [
    ...designLive,
    ...DESIGN_TRENDING.slice(0, Math.max(0, 4 - designLive.length)).map((e) => ({
      event: e,
      href: `/events`,
    })),
  ].slice(0, 4);

  return (
    <div className="page-enter">
      <HeroCinematic />
      <LiveTicker />
      <CategoryTiles />

      <section className="wrap section-sm">
        <SectionHead
          eyebrow="Trending tonight"
          title="Lagos is loud this weekend."
          sub="Real-time demand across events, comedy and theatre. Don't sleep — half are 80%+ sold."
          cta="See all events"
          ctaHref="/events"
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 20 }}>
          {padded.map((p) => (
            <EventCard key={p.event.id} event={p.event} href={p.href} size="full" />
          ))}
        </div>
        {liveEvents.length === 0 ? (
          <p className="text-xs muted mt-4">
            API offline — showing curated picks.{' '}
            <Link href="/events" className="accent-text">
              Browse all events →
            </Link>
          </p>
        ) : null}
      </section>

      <ForYouRail />

      <section className="wrap section-sm" style={{ paddingTop: 0 }}>
        <SectionHead
          eyebrow="Featured Concerts"
          title="The tour bus is parked here."
          sub="Cinema-grade ticketing for the artists Nigeria moves for."
          cta="All concerts"
          ctaHref="/events?q=concert"
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 20 }}>
          {DESIGN_CONCERTS.slice(0, 4).map((c) => (
            <ConcertCard key={c.id} concert={c} href="/events" size="full" />
          ))}
        </div>
      </section>

      <FlightRail />
      <BusRail />
      <WeekendBlock />
      <TrustStrip />
      <AppPromo />
    </div>
  );
}
