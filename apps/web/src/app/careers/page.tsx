import type { Metadata } from 'next';
import { Icon, type IconName } from '@/components/Icon';
import { CategoryHero } from '@/components/marketplace/CategoryHero';
import { PillarGrid } from '@/components/marketplace/ContentPage';
import { SectionHead } from '@/components/marketplace/SectionHead';

export const metadata: Metadata = {
  title: 'Careers at Computicket Nigeria',
  description:
    'Engineering, product, design, organizer success — open roles in Lagos, Abuja and remote.',
};

const ROLES = [
  { team: 'Engineering', title: 'Senior Backend Engineer', location: 'Lagos · Hybrid',  type: 'Full-time', tag: 'NestJS · Postgres' },
  { team: 'Engineering', title: 'Mobile Engineer (Flutter)', location: 'Remote NG',      type: 'Full-time', tag: 'Flutter · Offline-first' },
  { team: 'Engineering', title: 'Staff SRE',                 location: 'Lagos',           type: 'Full-time', tag: 'AWS · Observability' },
  { team: 'Product',     title: 'Product Manager · Travel',  location: 'Lagos',           type: 'Full-time', tag: 'Flights & buses' },
  { team: 'Design',      title: 'Senior Product Designer',   location: 'Lagos · Hybrid',  type: 'Full-time', tag: 'Marketplace · Native' },
  { team: 'Operations',  title: 'Scanning Operations Lead',  location: 'Lagos',           type: 'Full-time', tag: 'Venue ops' },
  { team: 'Success',     title: 'Organizer Success Manager', location: 'Abuja',           type: 'Full-time', tag: 'Account management' },
  { team: 'Support',     title: 'Customer Support Specialist', location: 'Remote NG',     type: 'Full-time', tag: 'Tier 1 / 2 · WhatsApp' },
];

const BENEFITS: Array<{ icon: IconName; title: string; body: string }> = [
  { icon: 'wallet',  title: 'Above-market salary',  body: 'Top-decile NG comp, paid in NGN with USD-pegged review.' },
  { icon: 'shield', title: 'Private healthcare',   body: 'Reliance HMO for you, your spouse and up to four dependents.' },
  { icon: 'gift',    title: 'Equity',               body: 'Real equity for every full-time hire — 4-year vest, 1-year cliff.' },
  { icon: 'sun',     title: 'Leave that means it',  body: '24 days paid leave + 12 public holidays + a paid week at year-end.' },
  { icon: 'sparkle', title: 'Learning stipend',     body: '₦300k/year for conferences, courses, books — whatever sharpens you.' },
  { icon: 'pulse',   title: 'Wellness',             body: 'Therapy access via 1Mind, gym stipend, mental-health days.' },
];

export default function CareersPage() {
  return (
    <div className="page-enter">
      <CategoryHero
        eyebrow="Careers"
        title="Build the platform Nigeria books on."
        subtitle="Eight open roles across engineering, product, design and operations. Lagos and Abuja offices, full-remote welcome for engineering."
        ph="ph-7"
        primaryCta={{ label: 'See open roles', href: '#roles' }}
        secondaryCta={{ label: 'About Computicket', href: '/about' }}
        badges={[
          { icon: 'fire', label: '8 open roles' },
          { icon: 'pin', label: 'Lagos · Abuja · Remote' },
        ]}
      />

      <section className="wrap section-sm">
        <SectionHead
          eyebrow="The work"
          title="Why this place is different."
          sub="Computicket is the rare Nigerian tech company shipping real, complex consumer infrastructure at scale. Real users, real money, real venues."
        />
        <PillarGrid
          columns={3}
          items={[
            {
              icon: 'pulse',
              title: 'Real users, real money',
              body:
                '1.2M tickets sold this year. Every line of code you ship touches actual buyers and organizers within hours.',
            },
            {
              icon: 'chart',
              title: 'Hard problems',
              body:
                'Concurrency-safe ticket inventory at scale, anti-fraud across 2G networks, AI search, payments routing — the genuinely interesting stuff.',
            },
            {
              icon: 'check',
              title: 'Senior bar, junior welcome',
              body:
                'Most engineers here are senior or staff. We hire juniors when we have the capacity to actually mentor — never to plug gaps.',
            },
          ]}
        />
      </section>

      <section id="roles" className="wrap section-sm" style={{ paddingTop: 0 }}>
        <SectionHead
          eyebrow="Open roles"
          title="Eight ways to join."
          sub="Don't see a fit? Email careers@computicket.ng — we keep candidates warm."
        />
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {ROLES.map((r, i) => (
            <div
              key={r.title}
              style={{
                padding: '18px 22px',
                display: 'grid',
                gridTemplateColumns: 'auto minmax(0,1fr) auto auto auto',
                gap: 18,
                alignItems: 'center',
                borderTop: i === 0 ? 'none' : '1px solid var(--line)',
              }}
            >
              <span className="chip chip-accent" style={{ minWidth: 110, justifyContent: 'center' }}>
                {r.team}
              </span>
              <div>
                <div className="h-4" style={{ fontSize: 15 }}>
                  {r.title}
                </div>
                <div className="text-xs muted mt-1">{r.tag}</div>
              </div>
              <div className="text-xs muted">
                <Icon name="pin" size={12} /> {r.location}
              </div>
              <div className="text-xs muted">{r.type}</div>
              <a href="/contact" className="btn btn-accent btn-sm">
                Apply <Icon name="arrow" size={12} />
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap section-sm" style={{ paddingTop: 0 }}>
        <SectionHead
          eyebrow="Benefits"
          title="What you actually get."
        />
        <PillarGrid items={BENEFITS} />
      </section>

      <section className="wrap" style={{ paddingBottom: 96 }}>
        <div
          className="card"
          style={{
            padding: 32,
            background: 'linear-gradient(135deg, var(--accent-soft), transparent)',
            border: '1px solid oklch(0.68 0.18 152 / .3)',
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) auto',
            gap: 24,
            alignItems: 'center',
          }}
        >
          <div>
            <div className="eyebrow accent-text mb-2">Hiring process</div>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.7, maxWidth: 640 }}>
              30-minute intro call → take-home or live exercise (capped at 4 hours) →
              technical deep-dive (90 min) → meet the team. Two weeks end to end. Decisions
              within 48 hours of the final round.
            </p>
          </div>
          <a href="mailto:careers@computicket.ng" className="btn btn-accent">
            careers@computicket.ng
          </a>
        </div>
      </section>
    </div>
  );
}
