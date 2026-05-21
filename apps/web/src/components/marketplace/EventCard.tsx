import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { formatNaira, type DesignEvent } from '@/lib/design-data';

type Size = 'sm' | 'md' | 'lg' | 'full';

interface Props {
  event: DesignEvent;
  href: string;
  size?: Size;
}

export function EventCard({ event: e, href, size = 'md' }: Props) {
  const w = size === 'lg' ? 380 : size === 'sm' ? 240 : size === 'full' ? '100%' : 300;
  const h = size === 'lg' ? 480 : size === 'sm' ? 300 : 380;
  const headerHeight = h * 0.6;

  return (
    <Link
      href={href}
      className="card card-hover"
      style={{ width: w, display: 'block' }}
    >
      <div className={`ph ${e.ph} ph-noise`} style={{ height: headerHeight, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
          {e.live ? (
            <span className="badge badge-live">
              <span className="dot" style={{ background: 'white' }} /> Live
            </span>
          ) : null}
          {e.vip ? <span className="badge badge-vip">VIP</span> : null}
          {e.almostSold ? (
            <span className="badge" style={{ background: 'var(--danger)', color: 'white' }}>
              Almost sold out
            </span>
          ) : null}
          {e.soon ? <span className="badge badge-soon">On sale</span> : null}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 14,
            left: 14,
            right: 14,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div>
            <div
              className="mono text-xs"
              style={{
                color: 'oklch(1 0 0 / .8)',
                letterSpacing: '.16em',
                textTransform: 'uppercase',
              }}
            >
              {e.tag}
            </div>
            <div
              className="serif"
              style={{
                color: 'white',
                fontSize: size === 'lg' ? 30 : 22,
                lineHeight: 1.05,
                marginTop: 4,
                maxWidth: 280,
              }}
            >
              {e.title}
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: '18px 18px 20px' }}>
        <div className="between mb-3">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-2)' }}>
            <Icon name="pin" size={13} /> {e.venue} · {e.city}
          </div>
          <div className="mono text-xs muted">{e.date}</div>
        </div>
        <div className="between">
          <div>
            <div className="text-xs muted">From</div>
            <div className="h-4 tnum" style={{ marginTop: 2 }}>
              {formatNaira(e.priceFrom)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="text-xs muted">Countdown</div>
            <div className="mono text-sm accent-text" style={{ marginTop: 2 }}>
              {e.countdown}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <div
            style={{
              height: 4,
              background: 'var(--surface-2)',
              borderRadius: 99,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.min(100, (e.attending / e.capacity) * 100)}%`,
                height: '100%',
                background: e.almostSold
                  ? 'var(--danger)'
                  : 'linear-gradient(90deg, var(--accent), oklch(0.65 0.18 180))',
              }}
            />
          </div>
          <div className="between mt-2">
            <span className="text-xs muted">{e.attending.toLocaleString()} attending</span>
            <span className="text-xs muted-2">
              {Math.round((e.attending / e.capacity) * 100)}% sold
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
