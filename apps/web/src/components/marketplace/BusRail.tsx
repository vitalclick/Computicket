import Link from 'next/link';
import { DESIGN_BUSES, formatNaira } from '@/lib/design-data';
import { SectionHead } from './SectionHead';

export function BusRail() {
  return (
    <section className="wrap section-sm" style={{ paddingTop: 0 }}>
      <SectionHead
        eyebrow="Bus Travel"
        title="Comfort class, every major route."
        sub="GIGM, Chisco, ABC and 12 more — AC, WiFi, recliners."
        cta="All routes"
        ctaHref="/buses"
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {DESIGN_BUSES.map((b) => (
          <Link
            key={b.id}
            href="/buses"
            className="card card-hover"
            style={{ padding: 20, display: 'block' }}
          >
            <div className="between" style={{ alignItems: 'flex-start' }}>
              <span className="chip chip-accent">{b.operator}</span>
              <span className="text-xs muted">{b.seats} seats left</span>
            </div>
            <div
              className="mt-4"
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr)',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div>
                <div className="mono text-xs muted">FROM</div>
                <div className="h-4" style={{ fontSize: 15, marginTop: 2 }}>
                  {b.departure}
                </div>
                <div className="text-xs muted mt-1">{b.from}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="text-xs muted">{b.duration}</div>
                <div
                  style={{ height: 1, background: 'var(--line)', position: 'relative', marginTop: 4 }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      transform: 'translateY(-50%)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '50%',
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: 'var(--ink-3)',
                      transform: 'translateY(-50%)',
                    }}
                  />
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="mono text-xs muted">TO</div>
                <div className="h-4" style={{ fontSize: 15, marginTop: 2 }}>
                  {b.arrival}
                </div>
                <div className="text-xs muted mt-1">{b.to}</div>
              </div>
            </div>
            <div
              className="between mt-4"
              style={{ paddingTop: 12, borderTop: '1px solid var(--line)' }}
            >
              <div className="row gap-2">
                {b.vehicle.split('·').map((v, i) => (
                  <span key={i} className="text-xs muted">
                    {v.trim()}
                  </span>
                ))}
              </div>
              <span className="h-4 tnum">{formatNaira(b.price)}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
