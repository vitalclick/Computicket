import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { api, formatDate } from '@/lib/api';
import { phForId } from '@/lib/design-data';
import { BuyForm } from './BuyForm';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await api.getEvent(slug).catch(() => null);
  if (!event) return { title: 'Event not found' };
  const description =
    event.description?.slice(0, 200) ??
    `${event.title} at ${event.venue}, ${event.city} on ${formatDate(event.startsAt)}. Get tickets on Computicket Nigeria.`;
  return {
    title: event.title,
    description,
    openGraph: {
      type: 'article',
      title: event.title,
      description,
      images: event.coverUrl ? [{ url: event.coverUrl }] : undefined,
    },
    twitter: {
      card: event.coverUrl ? 'summary_large_image' : 'summary',
      title: event.title,
      description,
      images: event.coverUrl ? [event.coverUrl] : undefined,
    },
    alternates: {
      canonical: `/events/${event.slug}`,
    },
  };
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs" style={{ opacity: 0.7 }}>
        {label}
      </div>
      <div className="h-3 tnum" style={{ fontSize: 22, marginTop: 2 }}>
        {value}
      </div>
    </div>
  );
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await api.getEvent(slug).catch(() => null);
  if (!event) notFound();

  const capacity = event.ticketTypes.reduce((acc, t) => acc + t.capacity, 0);
  const sold = event.ticketTypes.reduce((acc, t) => acc + t.sold, 0);
  const pctSold = capacity > 0 ? Math.round((sold / capacity) * 100) : 0;
  const startsAt = new Date(event.startsAt);
  const dateLabel = startsAt
    .toLocaleDateString('en-NG', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();
  const timeLabel = startsAt.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
  const ph = phForId(event.slug);

  const msToEvent = startsAt.getTime() - Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.max(0, Math.floor(msToEvent / dayMs));
  const hours = Math.max(0, Math.floor((msToEvent % dayMs) / (60 * 60 * 1000)));
  const countdown = msToEvent <= 0 ? 'live' : days > 0 ? `${days}d ${hours}h` : `${hours}h`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description ?? undefined,
    startDate: event.startsAt,
    endDate: event.endsAt,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.venue,
      address: { '@type': 'PostalAddress', addressLocality: event.city, addressCountry: 'NG' },
    },
    organizer: { '@type': 'Organization', name: event.organizer.name },
    offers: event.ticketTypes.map((t) => ({
      '@type': 'Offer',
      name: t.name,
      price: (t.priceKobo / 100).toFixed(2),
      priceCurrency: 'NGN',
      availability: t.sold < t.capacity ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
    })),
  };

  return (
    <div className="page-enter">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div
          className={`ph ${ph} ph-noise`}
          style={{ position: 'absolute', inset: 0, height: 640 }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            height: 640,
            background:
              'linear-gradient(180deg, oklch(0.06 0.03 285 / .4), oklch(0.06 0.03 285 / .95) 80%, var(--bg-void))',
          }}
        />
        <div
          className="wrap"
          style={{ position: 'relative', paddingTop: 80, paddingBottom: 60, minHeight: 640 }}
        >
          <div className="row gap-2 mb-6">
            <span
              className="badge badge-soon"
              style={{ background: 'oklch(0 0 0 / .4)', color: 'white' }}
            >
              {event.organizer.name}
            </span>
          </div>
          <div
            className="mono text-xs"
            style={{ letterSpacing: '.2em', color: 'oklch(1 0 0 / .8)' }}
          >
            {dateLabel} · {timeLabel} · {event.city.toUpperCase()}
          </div>
          <h1
            className="h-1"
            style={{ margin: '14px 0 8px', maxWidth: 920, fontSize: 88, color: 'white' }}
          >
            {event.title}
          </h1>
          <div className="row gap-4" style={{ color: 'oklch(1 0 0 / .85)' }}>
            <span>
              <Icon name="pin" size={14} /> {event.venue}
            </span>
            <span>·</span>
            <span>
              <Icon name="clock" size={14} /> {timeLabel}
            </span>
            <span>·</span>
            <span>
              Organizer: <b style={{ color: 'var(--accent)' }}>{event.organizer.name}</b>{' '}
              <Icon name="check" size={13} />
            </span>
          </div>

          <div
            style={{
              marginTop: 48,
              display: 'grid',
              gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)',
              gap: 32,
            }}
          >
            <div className="card glass" style={{ padding: 24, color: 'white' }}>
              <div className="between mb-4">
                <div className="row gap-3">
                  <span
                    className="icon-btn"
                    style={{
                      width: 56,
                      height: 56,
                      background: 'var(--accent)',
                      border: 0,
                      color: 'oklch(0.2 0.05 152)',
                    }}
                  >
                    <Icon name="play" size={22} />
                  </span>
                  <div>
                    <div className="h-4">Watch the trailer</div>
                    <div className="text-xs muted">Coming soon</div>
                  </div>
                </div>
                <button type="button" className="btn btn-glass btn-sm">
                  <Icon name="heart" size={13} /> Save
                </button>
              </div>
              <div className="hr" />
              <div className="row gap-6 mt-4" style={{ flexWrap: 'wrap' }}>
                <Stat label="Attending" value={sold.toLocaleString()} />
                <Stat label="Capacity" value={capacity.toLocaleString()} />
                <Stat label="Sold" value={`${pctSold}%`} />
                <Stat label="Time left" value={countdown} />
              </div>
            </div>

            <div className="card glass" style={{ padding: 20, color: 'white' }}>
              <div className="eyebrow mb-3" style={{ color: 'oklch(1 0 0 / .7)' }}>
                Why book on Computicket
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  color: 'oklch(1 0 0 / .85)',
                  fontSize: 13.5,
                  lineHeight: 1.75,
                }}
              >
                <li>Verified organizer &amp; QR ticket</li>
                <li>Refund if event is cancelled</li>
                <li>Pay with Verve, Mastercard, USSD, wallet</li>
                <li>Resale-protected — no scalper bots</li>
              </ul>
              <div
                className="row gap-2 mt-4"
                style={{ color: 'oklch(1 0 0 / .8)', fontSize: 12 }}
              >
                <Icon name="shield" size={13} /> Buyer protection on every order
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="wrap"
        style={{
          paddingTop: 48,
          paddingBottom: 96,
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)',
          gap: 48,
          alignItems: 'flex-start',
        }}
      >
        <div>
          <div className="card" style={{ padding: 32 }}>
            <div className="eyebrow mb-3">About the show</div>
            <h3 className="h-3">{event.title}</h3>
            {event.description ? (
              <p
                style={{
                  color: 'var(--ink-2)',
                  fontSize: 15,
                  lineHeight: 1.7,
                  marginTop: 12,
                  textWrap: 'pretty',
                  whiteSpace: 'pre-line',
                }}
              >
                {event.description}
              </p>
            ) : (
              <p style={{ color: 'var(--ink-3)', fontSize: 14, marginTop: 12 }}>
                No description yet — full details from {event.organizer.name} coming soon.
              </p>
            )}
            <div className="row mt-6 gap-3" style={{ flexWrap: 'wrap' }}>
              <span className="chip">
                <Icon name="pin" size={12} /> {event.venue}
              </span>
              <span className="chip">
                <Icon name="calendar" size={12} /> {formatDate(event.startsAt)}
              </span>
              <span className="chip">
                <Icon name="shield" size={12} /> Verified organizer
              </span>
            </div>
          </div>

          <div className="card mt-6" style={{ padding: 32 }}>
            <div className="between mb-4">
              <div className="eyebrow">Tier breakdown · live inventory</div>
              <div className="row gap-1" style={{ alignItems: 'center', fontSize: 13 }}>
                <span className="dot dot-live" /> {pctSold}% sold
              </div>
            </div>
            <div className="col gap-4">
              {event.ticketTypes.map((t) => {
                const remaining = t.capacity - t.sold;
                const pct = t.capacity > 0 ? Math.round((t.sold / t.capacity) * 100) : 0;
                return (
                  <div key={t.id}>
                    <div className="between mb-2">
                      <span className="fw-500" style={{ fontSize: 14 }}>
                        {t.name}
                      </span>
                      <span className="text-xs muted tnum">
                        {t.sold.toLocaleString()} / {t.capacity.toLocaleString()}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: 'var(--surface-2)',
                        borderRadius: 99,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background:
                            pct >= 90
                              ? 'var(--danger)'
                              : 'linear-gradient(90deg, var(--accent), oklch(0.65 0.18 180))',
                        }}
                      />
                    </div>
                    <div className="between mt-1 mono text-xs muted-2">
                      <span>
                        ₦{Math.round(t.priceKobo / 100).toLocaleString('en-NG')} · {pct}% sold
                      </span>
                      <span>{remaining > 0 ? `${remaining} left` : 'Sold out'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <aside
          style={{ position: 'sticky', top: 96, display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <BuyForm event={event} />

          <div
            className="card"
            style={{
              padding: 20,
              border: '1px solid var(--accent-soft)',
              background: 'linear-gradient(135deg, var(--accent-soft), transparent)',
            }}
          >
            <div className="row gap-2 mb-3">
              <span className="ai-dot" style={{ width: 18, height: 18 }} />
              <div className="eyebrow accent-text">Compass smart bundle</div>
            </div>
            <div className="fw-500" style={{ fontSize: 14 }}>
              Add a night at a nearby hotel
            </div>
            <p className="text-xs muted mt-2" style={{ lineHeight: 1.5 }}>
              Save up to ₦18k vs booking separately. Free cancellation up to 24h.
            </p>
            <a
              href="/hotels"
              className="btn btn-ghost btn-sm mt-3"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Preview bundle
            </a>
          </div>
        </aside>
      </section>
    </div>
  );
}
