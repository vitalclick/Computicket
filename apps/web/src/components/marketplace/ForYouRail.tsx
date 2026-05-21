import { Icon } from '@/components/Icon';
import { SectionHead } from './SectionHead';

const PICKS = [
  { title: 'Tems Live · Eko Beach',     sub: 'Trending · 18k attending',     ph: 'ph-2', price: 'From ₦45,000',       match: 'Trending' },
  { title: 'Weekend at La Campagne',    sub: 'Top-booked resort this month', ph: 'ph-5', price: 'From ₦98,000/night', match: 'Popular' },
  { title: 'Lagos → Abuja · Air Peace', sub: 'Most-booked route in NG',      ph: 'ph-7', price: 'From ₦62,500',       match: 'Hot deal' },
  { title: 'Sunset Yacht Cruise',       sub: 'This weekend in Lagos',        ph: 'ph-3', price: 'From ₦35,000',       match: 'Featured' },
];

export function ForYouRail() {
  return (
    <section className="wrap section">
      <SectionHead
        eyebrow="✦ Trending in Nigeria"
        title="What everyone's booking right now."
        sub="Real-time picks across events, stays and travel — based on what 1.2M Nigerians are booking this week."
        cta="Sign up for personal picks"
        ctaHref="/signup"
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        {PICKS.map((p) => (
          <div
            key={p.title}
            className="card card-hover"
            style={{ position: 'relative', overflow: 'hidden' }}
          >
            <div className={`ph ${p.ph} ph-noise`} style={{ height: 200, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 12, left: 12 }}>
                <span
                  className="ai-pill"
                  style={{
                    background: 'oklch(0 0 0 / .55)',
                    border: '1px solid oklch(1 0 0 / .15)',
                  }}
                >
                  <span className="ai-dot" />
                  <span style={{ color: 'white' }}>{p.match}</span>
                </span>
              </div>
            </div>
            <div style={{ padding: '16px 18px' }}>
              <div className="h-4">{p.title}</div>
              <div className="text-xs muted mt-1">{p.sub}</div>
              <div className="between mt-4">
                <span className="text-sm fw-500">{p.price}</span>
                <button type="button" className="icon-btn" style={{ width: 32, height: 32 }}>
                  <Icon name="arrow" size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
