import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import { ContentSection, PillarGrid } from '@/components/marketplace/ContentPage';
import { CategoryHero } from '@/components/marketplace/CategoryHero';
import { SectionHead } from '@/components/marketplace/SectionHead';

export const metadata: Metadata = {
  title: 'About Computicket Nigeria',
  description:
    "Nigeria's all-in-one ticketing platform. The story, the team, the mission.",
};

const NUMBERS = [
  { n: '1.2M+', l: 'Tickets sold this year' },
  { n: '2,400+', l: 'Events on-platform' },
  { n: '38',    l: 'Airlines & operators' },
  { n: '94',    l: 'Team members across NG' },
  { n: '99.97%', l: 'Booking success rate' },
];

const TIMELINE = [
  { y: '2021', t: 'Founded in Lagos',          s: 'Started as a single-organizer ticketing tool for one Lagos venue.' },
  { y: '2022', t: 'Multi-vendor marketplace',   s: 'Opened to 50 organizers. Launched in-app QR scanning.' },
  { y: '2023', t: 'Wallet & loyalty',           s: 'Built the Compass wallet, points and refunds-to-wallet system.' },
  { y: '2024', t: 'Travel verticals',           s: 'Added bus, flight and hotel inventory. Public API + webhooks.' },
  { y: '2025', t: 'Phase 3',                    s: 'AI search, white-label organizer subdomains, OAuth 2.0 for partners.' },
  { y: '2026', t: 'Pan-African',                s: 'Expanding to Ghana, Kenya and South Africa.' },
];

const OFFICES = [
  { city: 'Lagos',  region: 'Victoria Island',  staff: '54 staff', primary: true },
  { city: 'Abuja',  region: 'Maitama',           staff: '22 staff' },
  { city: 'Port Harcourt', region: 'GRA',         staff: '11 staff' },
  { city: 'Remote', region: 'Across NG',         staff: '7 contributors' },
];

export default function AboutPage() {
  return (
    <div className="page-enter">
      <CategoryHero
        eyebrow="About Computicket"
        title="We sell access. To events, to travel, to weekends Nigerians remember."
        subtitle="Founded in 2021 in Lagos. Built mobile-first, Naija-coded, and obsessively focused on the things that actually break in Nigerian commerce — payments, fraud, connectivity, trust."
        ph="ph-3"
        primaryCta={{ label: 'Browse the platform', href: '/' }}
        secondaryCta={{ label: 'Join the team', href: '/careers' }}
      />

      <section className="wrap section-sm">
        <SectionHead eyebrow="The mission" title="One marketplace for everywhere you'd rather be." />
        <div
          className="card"
          style={{
            padding: 32,
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 32,
          }}
        >
          {NUMBERS.map((n) => (
            <div key={n.l}>
              <div className="h-1 tnum" style={{ fontSize: 36 }}>
                {n.n}
              </div>
              <div className="text-xs muted mt-1" style={{ lineHeight: 1.45 }}>
                {n.l}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap section-sm" style={{ paddingTop: 0 }}>
        <SectionHead
          eyebrow="What we believe"
          title="Four principles, every product decision."
        />
        <PillarGrid
          columns={4}
          items={[
            {
              icon: 'shield',
              title: 'Trust at scale',
              body:
                'Buyer protection on every order. Verified organizers. Refundable funds. Computicket is the receipt when something goes wrong.',
            },
            {
              icon: 'wallet',
              title: 'Local payments first',
              body:
                "Paystack, Flutterwave, Moniepoint, Opay, USSD, bank transfer, wallet — built around how Nigerians actually pay.",
            },
            {
              icon: 'qr',
              title: 'Anti-fraud by default',
              body:
                "Rotating QR codes, device fingerprinting, anti-screenshot validation. Resale is regulated, not policed by venue staff.",
            },
            {
              icon: 'pulse',
              title: 'Built for 2G',
              body:
                'Offline ticket caches, lean payloads, USSD fallbacks. The booking flow works on the Lagos Mainland-Ikeja third-mainland-bridge.',
            },
          ]}
        />
      </section>

      <section className="wrap section-sm" style={{ paddingTop: 0 }}>
        <SectionHead eyebrow="Timeline" title="Five years, six chapters." />
        <div className="card" style={{ padding: 32 }}>
          <div className="col">
            {TIMELINE.map((step, i) => (
              <div
                key={step.y}
                className="row"
                style={{
                  gap: 28,
                  alignItems: 'flex-start',
                  paddingBottom: 24,
                  borderBottom:
                    i < TIMELINE.length - 1 ? '1px solid var(--line)' : 'none',
                  marginBottom: 16,
                }}
              >
                <div
                  className="mono"
                  style={{
                    minWidth: 64,
                    fontSize: 16,
                    color: 'var(--accent)',
                    fontWeight: 600,
                  }}
                >
                  {step.y}
                </div>
                <div>
                  <div className="h-4">{step.t}</div>
                  <p
                    style={{
                      fontSize: 14,
                      color: 'var(--ink-3)',
                      lineHeight: 1.6,
                      marginTop: 6,
                    }}
                  >
                    {step.s}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap section-sm" style={{ paddingTop: 0 }}>
        <SectionHead
          eyebrow="Where we work"
          title="Lagos HQ. Abuja, Port Harcourt, and 100% remote."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {OFFICES.map((o) => (
            <div
              key={o.city}
              className="card"
              style={{
                padding: 22,
                border: o.primary ? '1px solid var(--accent)' : '1px solid var(--line)',
              }}
            >
              <div className="row gap-2" style={{ alignItems: 'center' }}>
                <Icon name="pin" size={14} stroke={2} />
                <span className="fw-600">{o.city}</span>
                {o.primary ? <span className="badge badge-vip">HQ</span> : null}
              </div>
              <div className="text-xs muted mt-2">{o.region}</div>
              <div className="text-xs accent-text mt-1">{o.staff}</div>
            </div>
          ))}
        </div>
      </section>

      <ContentSection title="">
        <></>
      </ContentSection>

      <section className="wrap" style={{ paddingBottom: 96 }}>
        <div
          className="card"
          style={{
            padding: 40,
            background: 'linear-gradient(135deg, var(--accent-soft), transparent)',
            border: '1px solid oklch(0.68 0.18 152 / .3)',
            textAlign: 'center',
          }}
        >
          <div className="eyebrow accent-text mb-2">We&apos;re hiring</div>
          <h2 className="h-2" style={{ margin: '4px 0 8px' }}>
            Want to build with us?
          </h2>
          <p className="muted" style={{ maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
            Engineering, product, design, organizer success, scanning ops. Lagos, Abuja, remote.
          </p>
          <a href="/careers" className="btn btn-accent btn-lg mt-6">
            See open roles <Icon name="arrow" size={14} />
          </a>
        </div>
      </section>
    </div>
  );
}
