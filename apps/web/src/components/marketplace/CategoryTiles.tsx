import Link from 'next/link';
import { Icon, type IconName } from '@/components/Icon';

interface Tile {
  id: string;
  icon: IconName;
  title: string;
  sub: string;
  color: string;
  href: string;
}

const TILES: Tile[] = [
  { id: 'events',   icon: 'calendar', title: 'Events',      sub: 'This weekend',   color: 'oklch(0.62 0.20 350)', href: '/events' },
  { id: 'concerts', icon: 'music',    title: 'Concerts',    sub: '2,184 live',     color: 'oklch(0.62 0.18 152)', href: '/concerts' },
  { id: 'flights',  icon: 'plane',    title: 'Flights',     sub: '38 airlines',    color: 'oklch(0.60 0.16 230)', href: '/flights' },
  { id: 'hotels',   icon: 'bed',      title: 'Stays',       sub: '4,920 hotels',   color: 'oklch(0.65 0.15 75)',  href: '/hotels' },
  { id: 'buses',    icon: 'bus',      title: 'Bus Travel',  sub: 'All NG routes',  color: 'oklch(0.62 0.14 200)', href: '/buses' },
  { id: 'cinema',   icon: 'film',     title: 'Cinema',      sub: 'IMAX · 3D · 2D', color: 'oklch(0.55 0.18 305)', href: '/cinema' },
  { id: 'x',        icon: 'sparkle',  title: 'Experiences', sub: 'Curated weekly', color: 'oklch(0.65 0.20 25)',  href: '/experiences' },
];

export function CategoryTiles() {
  return (
    <section className="wrap" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 14 }}>
        {TILES.map((t) => (
          <Link
            key={t.id}
            href={t.href}
            className="card card-hover"
            style={{ padding: 0, textAlign: 'left', position: 'relative', overflow: 'hidden' }}
          >
            <div
              style={{
                position: 'absolute',
                top: -32,
                right: -32,
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: t.color,
                opacity: 0.15,
                filter: 'blur(28px)',
                pointerEvents: 'none',
              }}
            />
            <div style={{ padding: '20px 18px 18px', position: 'relative' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: t.color,
                  color: 'white',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: `0 10px 24px -10px ${t.color}, inset 0 1px 0 oklch(1 0 0 / .25)`,
                }}
              >
                <Icon name={t.icon} size={26} stroke={1.8} />
              </div>
              <div className="h-4 mt-4">{t.title}</div>
              <div className="text-xs muted mt-1">{t.sub}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
