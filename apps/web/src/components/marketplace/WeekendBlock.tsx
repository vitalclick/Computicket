import { Icon } from '@/components/Icon';
import { DESIGN_EXPERIENCES, formatNaira } from '@/lib/design-data';
import { SectionHead } from './SectionHead';

export function WeekendBlock() {
  const picks = DESIGN_EXPERIENCES.slice(0, 2);
  return (
    <section className="wrap section">
      <SectionHead
        eyebrow="Weekend Experiences"
        title="Aspirational, Naija-coded."
        sub="Curated escapes, getaways and lifestyle picks for the weekend ahead."
        cta="View all"
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr) minmax(0,1fr)',
          gap: 24,
        }}
      >
        <div className="card card-hover" style={{ position: 'relative', minHeight: 520, overflow: 'hidden' }}>
          <div className="ph ph-5 ph-noise" style={{ position: 'absolute', inset: 0 }} />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, transparent 40%, oklch(0 0 0 / .85))',
            }}
          />
          <div
            style={{
              position: 'relative',
              padding: 32,
              height: 520,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              color: 'white',
            }}
          >
            <div className="row gap-2">
              <span className="badge badge-vip">Editor&apos;s pick</span>
              <span
                className="badge badge-soon"
                style={{ background: 'oklch(1 0 0 / .12)', color: 'white' }}
              >
                4-night package
              </span>
            </div>
            <div>
              <div className="mono text-xs" style={{ opacity: 0.8, letterSpacing: '.16em' }}>
                LA CAMPAGNE TROPICANA · LEKKI
              </div>
              <div className="serif" style={{ fontSize: 48, lineHeight: 1.0, marginTop: 8, maxWidth: 480 }}>
                Sleep where the ocean meets the lagoon.
              </div>
              <div className="row mt-6 gap-6" style={{ alignItems: 'center' }}>
                <div>
                  <div className="text-xs" style={{ opacity: 0.7 }}>
                    From
                  </div>
                  <div className="h-2 tnum">
                    {formatNaira(98000)}{' '}
                    <span className="text-sm" style={{ opacity: 0.7 }}>
                      / night
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs" style={{ opacity: 0.7 }}>
                    Includes
                  </div>
                  <div className="fw-500">Yacht ride · Spa · Breakfast</div>
                </div>
                <button type="button" className="btn btn-accent" style={{ marginLeft: 'auto' }}>
                  Plan trip <Icon name="arrow" size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col gap-4">
          {picks.map((x) => (
            <div
              key={x.id}
              className="card card-hover"
              style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
            >
              <div className={`ph ${x.ph} ph-noise`} style={{ position: 'absolute', inset: 0 }} />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, transparent 50%, oklch(0 0 0 / .8))',
                }}
              />
              <div
                style={{
                  position: 'relative',
                  padding: 20,
                  minHeight: 248,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  color: 'white',
                }}
              >
                <span
                  className="badge badge-soon"
                  style={{
                    background: 'oklch(1 0 0 / .15)',
                    color: 'white',
                    alignSelf: 'flex-start',
                  }}
                >
                  {x.category}
                </span>
                <div>
                  <div className="serif" style={{ fontSize: 22, lineHeight: 1.1 }}>
                    {x.title}
                  </div>
                  <div className="between mt-3">
                    <span className="text-xs" style={{ opacity: 0.7 }}>
                      {x.duration}
                    </span>
                    <span className="h-4 tnum">{formatNaira(x.price)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card card-hover" style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="ph ph-2 ph-noise" style={{ position: 'absolute', inset: 0 }} />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, transparent 30%, oklch(0 0 0 / .85))',
            }}
          />
          <div
            style={{
              position: 'relative',
              padding: 24,
              minHeight: 520,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              color: 'white',
            }}
          >
            <div>
              <span className="badge badge-vip">Bundle save 18%</span>
            </div>
            <div>
              <div className="mono text-xs" style={{ opacity: 0.8, letterSpacing: '.18em' }}>
                FLIGHT + HOTEL + EVENT
              </div>
              <div className="serif" style={{ fontSize: 32, lineHeight: 1.05, marginTop: 8 }}>
                Abuja → Lagos for Asake VIP weekend
              </div>
              <p className="text-sm mt-3" style={{ opacity: 0.8, lineHeight: 1.5 }}>
                Round-trip Air Peace · 2 nights at Eko Hotel · Asake VIP table for 4.
              </p>
              <div className="between mt-4">
                <div>
                  <div className="text-xs" style={{ opacity: 0.6 }}>
                    Bundle
                  </div>
                  <div className="h-3 tnum">
                    {formatNaira(285000)}{' '}
                    <span
                      className="text-xs muted"
                      style={{ textDecoration: 'line-through', opacity: 0.6 }}
                    >
                      {formatNaira(348000)}
                    </span>
                  </div>
                </div>
                <button type="button" className="btn btn-accent btn-sm">
                  Book bundle
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
