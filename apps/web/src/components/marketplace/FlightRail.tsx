import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { DESIGN_FLIGHTS, formatNaira } from '@/lib/design-data';
import { SectionHead } from './SectionHead';

export function FlightRail() {
  return (
    <section className="wrap section">
      <SectionHead
        eyebrow="Flight Deals"
        title="Domestic deals dropping today."
        sub="Prices fall fastest 4–6 weeks out. Compass tracks 38 carriers for you."
        cta="See all flights"
        ctaHref="/flights"
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
        {DESIGN_FLIGHTS.map((f) => (
          <Link
            key={f.id}
            href="/flights"
            className="card card-hover"
            style={{ padding: 0, display: 'block' }}
          >
            <div className={`ph ${f.ph} ph-noise`} style={{ height: 120, position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, transparent 50%, oklch(0 0 0 / .7))',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 12,
                  bottom: 10,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span className="h-3 mono">{f.from}</span>
                <Icon name="arrow" size={14} />
                <span className="h-3 mono">{f.to}</span>
              </div>
              {f.international ? (
                <span
                  className="badge"
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: 'oklch(0 0 0 / .5)',
                    color: 'white',
                  }}
                >
                  Intl
                </span>
              ) : null}
            </div>
            <div style={{ padding: '14px 16px' }}>
              <div className="text-xs muted">
                {f.airline} · {f.duration} · {f.direct ? 'Direct' : '1 stop'}
              </div>
              <div className="between mt-2">
                <span className="h-4 tnum">{formatNaira(f.price)}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    color:
                      f.trend === 'down'
                        ? 'var(--accent)'
                        : f.trend === 'up'
                          ? 'var(--danger)'
                          : 'var(--ink-3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <Icon
                    name={
                      f.trend === 'down' ? 'arrowDown' : f.trend === 'up' ? 'arrowUp' : 'minus'
                    }
                    size={11}
                  />
                  {f.change}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
