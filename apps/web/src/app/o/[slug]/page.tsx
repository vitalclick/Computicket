import { notFound } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { EventCard } from '@/components/marketplace/EventCard';
import { SectionHead } from '@/components/marketplace/SectionHead';
import { API_URL, formatDate, formatNgn } from '@/lib/api';
import { phForId, type DesignEvent } from '@/lib/design-data';

interface WlResponse {
  organizer: {
    slug: string;
    name: string;
    description: string | null;
    logoUrl: string | null;
    website: string | null;
    customDomain: string | null;
    brandColor: string | null;
  };
  events: Array<{
    id: string;
    slug: string;
    title: string;
    venue: string;
    city: string;
    startsAt: string;
    ticketTypes: Array<{ priceKobo: number; capacity: number; sold: number }>;
  }>;
}

async function fetchWhitelabel(slug: string): Promise<WlResponse | null> {
  try {
    const res = await fetch(`${API_URL}/whitelabel/by-slug/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as WlResponse;
  } catch {
    return null;
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function OrganizerPublicPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await fetchWhitelabel(slug);
  if (!data) notFound();

  const totalCapacity = data.events.reduce(
    (acc, e) => acc + e.ticketTypes.reduce((a, t) => a + t.capacity, 0),
    0,
  );
  const totalSold = data.events.reduce(
    (acc, e) => acc + e.ticketTypes.reduce((a, t) => a + t.sold, 0),
    0,
  );
  const totalRevenue = data.events.reduce(
    (acc, e) => acc + e.ticketTypes.reduce((a, t) => a + t.priceKobo * t.sold, 0),
    0,
  );
  const pctSold = totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0;

  const hero = data.events[0];

  const designedEvents: Array<{ event: DesignEvent; href: string }> = data.events.map((e) => {
    const capacity = e.ticketTypes.reduce((a, t) => a + t.capacity, 0);
    const sold = e.ticketTypes.reduce((a, t) => a + t.sold, 0);
    const priceFrom = e.ticketTypes.length
      ? Math.min(...e.ticketTypes.map((t) => t.priceKobo)) / 100
      : 0;
    const startsAt = new Date(e.startsAt);
    const dateStr = startsAt.toLocaleDateString('en-NG', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
    const msToEvent = startsAt.getTime() - Date.now();
    const days = Math.max(0, Math.floor(msToEvent / 86400000));
    const hours = Math.max(0, Math.floor((msToEvent % 86400000) / 3600000));
    const countdown =
      msToEvent <= 0
        ? 'happening now'
        : days > 0
          ? `${String(days).padStart(2, '0')}d ${hours}h`
          : `${hours}h`;
    return {
      event: {
        id: e.id,
        title: e.title,
        venue: e.venue,
        city: e.city,
        date: dateStr,
        time: startsAt.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
        priceFrom,
        attending: sold,
        capacity: capacity || 1,
        ph: phForId(e.slug),
        tag: data.organizer.name,
        almostSold: capacity > 0 && sold / capacity >= 0.85,
        countdown,
        organizer: data.organizer.name,
        verified: true,
      },
      href: `/events/${e.slug}`,
    };
  });

  return (
    <div className="page-enter">
      <div style={{ background: 'var(--bg-deep)', borderBottom: '1px solid var(--line)' }}>
        <div
          className="wrap"
          style={{ display: 'flex', alignItems: 'center', height: 56, gap: 24 }}
        >
          <div className="row gap-2">
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 'var(--r-1)',
                background:
                  data.organizer.brandColor ??
                  'linear-gradient(135deg, var(--accent), oklch(0.55 0.18 180))',
              }}
            />
            <span className="fw-600">{data.organizer.name}</span>
            <Icon name="check" size={13} stroke={2} />
          </div>
          <div style={{ flex: 1 }} />
          {data.organizer.website ? (
            <a
              href={data.organizer.website}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
            >
              Visit site <Icon name="arrow" size={12} />
            </a>
          ) : null}
        </div>
      </div>

      <section className="wrap" style={{ paddingTop: 32, paddingBottom: 32 }}>
        <div className="between mb-6">
          <div>
            <div className="eyebrow mb-2">Promoter Hub</div>
            <h1 className="h-2">{data.organizer.name}</h1>
            {data.organizer.description ? (
              <p
                className="mt-3"
                style={{ color: 'var(--ink-2)', maxWidth: 640, lineHeight: 1.6 }}
              >
                {data.organizer.description}
              </p>
            ) : null}
          </div>
          <div className="row gap-2">
            <span className="pill-stat">
              <Icon name="shield" size={12} /> Verified organizer
            </span>
            <span className="pill-stat">
              <Icon name="check" size={12} /> {data.events.length} live events
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4,1fr)',
            gap: 16,
            marginBottom: 24,
          }}
        >
          {[
            { label: 'Events on sale',  value: String(data.events.length), sub: 'live & upcoming' },
            { label: 'Tickets sold',    value: totalSold.toLocaleString(), sub: `of ${totalCapacity.toLocaleString()} capacity` },
            { label: 'Sold-through',    value: `${pctSold}%`,              sub: 'across catalog' },
            { label: 'Gross revenue',   value: formatNgn(totalRevenue),    sub: 'lifetime' },
          ].map((k) => (
            <div key={k.label} className="card" style={{ padding: 20 }}>
              <div className="between">
                <div className="eyebrow">{k.label}</div>
              </div>
              <div className="h-1 tnum mt-3" style={{ fontSize: 28 }}>
                {k.value}
              </div>
              <div className="text-xs muted">{k.sub}</div>
            </div>
          ))}
        </div>

        {hero ? (
          <div
            className="card"
            style={{ padding: 0, overflow: 'hidden', position: 'relative', marginBottom: 32 }}
          >
            <div
              className={`ph ${phForId(hero.slug)} ph-noise`}
              style={{ height: 360, position: 'relative' }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(180deg, transparent 30%, oklch(0 0 0 / .85))',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 32,
                  right: 32,
                  bottom: 32,
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  gap: 24,
                }}
              >
                <div>
                  <div
                    className="mono text-xs"
                    style={{ opacity: 0.85, letterSpacing: '.18em' }}
                  >
                    FEATURED · {hero.city.toUpperCase()}
                  </div>
                  <div
                    className="serif"
                    style={{ fontSize: 48, lineHeight: 1.05, marginTop: 6, maxWidth: 640 }}
                  >
                    {hero.title}
                  </div>
                  <div className="text-sm mt-2" style={{ opacity: 0.85 }}>
                    {hero.venue} · {formatDate(hero.startsAt)}
                  </div>
                </div>
                <a
                  href={`/events/${hero.slug}`}
                  className="btn btn-accent btn-lg"
                  style={{ alignSelf: 'flex-end' }}
                >
                  Get tickets <Icon name="arrow" size={14} />
                </a>
              </div>
            </div>
          </div>
        ) : null}

        <SectionHead
          eyebrow="All events"
          title="From this organizer"
          sub={
            data.events.length > 0
              ? `${data.events.length} on sale right now`
              : 'No events on sale yet.'
          }
        />

        {data.events.length === 0 ? (
          <div
            className="card"
            style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)' }}
          >
            <p>
              No events on sale right now. Check back soon or follow{' '}
              <b>{data.organizer.name}</b> for drops.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 20,
            }}
          >
            {designedEvents.map((p) => (
              <EventCard
                key={p.event.id}
                event={p.event}
                href={p.href}
                size="full"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
