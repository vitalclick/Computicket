import Link from 'next/link';
import { formatNaira, type DesignConcert } from '@/lib/design-data';

interface Props {
  concert: DesignConcert;
  href: string;
  size?: 'md' | 'full';
}

export function ConcertCard({ concert: c, href, size = 'md' }: Props) {
  const w = size === 'full' ? '100%' : 320;
  return (
    <Link href={href} className="card card-hover" style={{ width: w, display: 'block' }}>
      <div className={`ph ${c.ph} ph-noise`} style={{ height: 420, position: 'relative' }}>
        {c.vip ? (
          <span className="badge badge-vip" style={{ position: 'absolute', top: 12, right: 12 }}>
            VIP tier
          </span>
        ) : null}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, transparent 50%, oklch(0 0 0 / .85) 100%)',
          }}
        />
        <div style={{ position: 'absolute', left: 18, right: 18, bottom: 18, color: 'white' }}>
          <div className="mono text-xs" style={{ opacity: 0.8, letterSpacing: '.18em' }}>
            {c.date.toUpperCase()} · {c.city.toUpperCase()}
          </div>
          <div className="h-1" style={{ fontSize: 38, marginTop: 6, letterSpacing: '-0.04em' }}>
            {c.artist}
          </div>
          <div className="serif" style={{ fontSize: 18, opacity: 0.85, marginTop: 2 }}>
            {c.tour}
          </div>
          <div className="between mt-4">
            <span className="text-sm" style={{ opacity: 0.8 }}>
              {c.venue}
            </span>
            <span className="h-4 tnum">{formatNaira(c.priceFrom)}+</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
