import type { Metadata } from 'next';
import { Icon, type IconName } from '@/components/Icon';
import {
  ContentBlock,
  ContentCTA,
  ContentHero,
  ContentSubNav,
  PillarsBlock,
  StatsStrip,
  TeamBlock,
} from '@/components/marketplace/Editorial';
import { SectionHead } from '@/components/marketplace/SectionHead';

export const metadata: Metadata = {
  title: 'Careers at Computicket Nigeria',
  description:
    'Engineering, product, design, organizer success. Lagos, Abuja, Port Harcourt and remote. Build the platform Nigeria books on.',
};

interface Role {
  team: string;
  title: string;
  location: string;
  type: string;
  tag: string;
}

const ROLES: Role[] = [
  { team: 'Engineering', title: 'Senior Backend Engineer',  location: 'Lagos · Hybrid', type: 'Full-time', tag: 'NestJS · Postgres · Kafka' },
  { team: 'Engineering', title: 'Mobile Engineer (Flutter)', location: 'Remote NG',     type: 'Full-time', tag: 'Flutter · Offline-first' },
  { team: 'Engineering', title: 'Staff SRE',                 location: 'Lagos',          type: 'Full-time', tag: 'AWS · Observability' },
  { team: 'Engineering', title: 'ML Engineer · Compass AI',  location: 'Lagos · Hybrid', type: 'Full-time', tag: 'Personalisation · Search' },
  { team: 'Product',     title: 'Product Manager · Travel',  location: 'Lagos',          type: 'Full-time', tag: 'Flights, buses, hotels' },
  { team: 'Product',     title: 'Product Manager · Trust',   location: 'Lagos',          type: 'Full-time', tag: 'Fraud, payments, refunds' },
  { team: 'Design',      title: 'Senior Product Designer',   location: 'Lagos · Hybrid', type: 'Full-time', tag: 'Marketplace · Native' },
  { team: 'Design',      title: 'Brand Designer',            location: 'Lagos',          type: 'Full-time', tag: 'Editorial, video, motion' },
  { team: 'Operations',  title: 'Scanning Operations Lead',  location: 'Lagos',          type: 'Full-time', tag: 'Venue ops' },
  { team: 'Success',     title: 'Organizer Success Manager', location: 'Abuja',          type: 'Full-time', tag: 'Account management' },
  { team: 'Support',     title: 'Tier 2 Support Specialist', location: 'Remote NG',      type: 'Full-time', tag: 'Tier 1 → 2 · WhatsApp' },
  { team: 'Finance',     title: 'Treasury Manager',          location: 'Lagos',          type: 'Full-time', tag: 'Payouts · NGN/USD ops' },
];

const BENEFITS: Array<{ icon: IconName; title: string; body: string; color: string }> = [
  { icon: 'wallet',  title: 'Top-decile NG comp',    body: 'Above-market salary in NGN, with USD-pegged review every 12 months. Real equity for every full-time hire — 4-year vest, 1-year cliff.',                       color: 'oklch(0.62 0.18 152)' },
  { icon: 'shield',  title: 'Reliance HMO platinum', body: 'Private healthcare for you, your spouse and up to four dependents. Mental-health cover via 1Mind, optical and dental on the same plan.',                       color: 'oklch(0.60 0.16 230)' },
  { icon: 'sun',     title: 'Leave you actually take', body: '24 days paid leave + 12 public holidays. The whole company shuts down for one week at the end of December. We mean it — Slack is offline.',                color: 'oklch(0.65 0.15 75)' },
  { icon: 'sparkle', title: 'Learning stipend',      body: '₦300,000 per year for conferences, courses, books, coaching — whatever sharpens you. Sponsorship for African and global tech conferences.',                   color: 'oklch(0.55 0.18 305)' },
  { icon: 'heart',   title: 'Parental leave',        body: "16 weeks paid for primary caregivers, 8 weeks for partners. Flexible return-to-work arrangements — we'll fit life around the job, not the other way around.", color: 'oklch(0.65 0.20 25)' },
  { icon: 'pulse',   title: 'Wellness budget',       body: '₦40,000/month gym, yoga, therapy or coaching stipend. Two paid mental-health days per quarter, no questions asked.',                                          color: 'oklch(0.62 0.14 200)' },
];

const PROCESS = [
  { step: '01', title: 'Intro call · 30 min',        body: 'Quick chat with a hiring manager about your story and what you want next. Two-way — bring your questions.' },
  { step: '02', title: 'Exercise · 90 min',          body: 'Take-home or live, paid if take-home, capped at 4 hours. Designed to reflect real work — not riddles.' },
  { step: '03', title: 'Technical deep-dive · 90 min', body: 'System design, your previous work, edge cases. Two senior team members; collaborative not adversarial.' },
  { step: '04', title: 'Meet the team · 60 min',     body: 'Coffee or lunch in the Lagos office (we cover travel). Meet 3–4 future teammates outside of the interview frame.' },
];

export default function CareersPage() {
  return (
    <div className="page-enter">
      <ContentSubNav group="company" active="careers" />

      <ContentHero
        eyebrow="Careers · We're hiring"
        title="Build the platform Nigeria books on."
        lede="Twelve open roles across engineering, product, design and operations. Lagos and Abuja offices, full-remote for engineering, and a culture that takes craft as seriously as it takes the work."
      />

      <StatsStrip
        stats={[
          { n: '84',  l: 'People across NG and Cape Town' },
          { n: '12',  l: 'Open roles, all senior or staff' },
          { n: '4',   l: 'Days end-to-end interview' },
          { n: '₦300k', l: 'Per-year learning stipend' },
        ]}
      />

      <ContentBlock
        eyebrow="Why Computicket"
        title="The rare Nigerian tech company shipping real consumer infrastructure at scale."
        image="ph-7"
        imageCaption="Engineering room · Lagos HQ"
        body={
          <>
            <p>
              We are not a wrapper, an aggregator, or an arbitrage play. Every line of code,
              every pixel, every refund flow we ship reaches 1.2 million Nigerians within hours
              of merge.
            </p>
            <p className="mt-4">
              The hard problems are genuinely hard: concurrency-safe ticket inventory at scale,
              anti-fraud across 2G networks, payments routing that survives every Nigerian rail
              outage, AI search that&apos;s actually useful — not slop.
            </p>
            <p className="mt-4">
              Most of our engineers are senior or staff. We hire juniors only when we have the
              capacity to mentor — never to plug gaps.
            </p>
          </>
        }
      />

      <PillarsBlock
        eyebrow="Benefits"
        title="What you actually get."
        sub="Above-market comp, real ownership, and the kind of leave you'll feel uncomfortable taking — until you do."
        cols={3}
        pillars={BENEFITS}
      />

      <section className="wrap section">
        <SectionHead
          eyebrow="Open roles · 12"
          title="Pick your seat."
          sub="Don't see a fit? careers@computicket.ng — we keep candidates warm and reach back when the right role opens."
        />
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {ROLES.map((r, i) => (
            <div
              key={r.title}
              style={{
                padding: '20px 24px',
                display: 'grid',
                gridTemplateColumns: 'auto minmax(0,1fr) auto auto auto',
                gap: 18,
                alignItems: 'center',
                borderTop: i === 0 ? 'none' : '1px solid var(--line)',
              }}
            >
              <span className="chip chip-accent" style={{ minWidth: 120, justifyContent: 'center' }}>
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
              <a
                href={`mailto:careers@computicket.ng?subject=${encodeURIComponent(r.title)}`}
                className="btn btn-accent btn-sm"
              >
                Apply <Icon name="arrow" size={12} />
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap section">
        <SectionHead
          eyebrow="Hiring process"
          title="Four steps. Two weeks. No ghosting."
          sub="Decisions land within 48 hours of the final round. If we're a no, we say so — with feedback if you want it."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {PROCESS.map((s) => (
            <div key={s.step} className="card" style={{ padding: 24 }}>
              <div className="mono accent-text fw-600" style={{ fontSize: 24 }}>
                {s.step}
              </div>
              <div className="h-4 mt-3" style={{ fontSize: 15 }}>
                {s.title}
              </div>
              <p className="text-sm muted mt-2" style={{ lineHeight: 1.65 }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <TeamBlock
        eyebrow="Who you'll work with"
        title="A small bench, intentionally."
        people={[
          { name: 'Adaeze Okafor',  role: 'Co-founder, CEO',                from: 'Paystack',       ph: 'ph-2' },
          { name: 'Tobi Adesanya',  role: 'Co-founder, CTO',                from: 'Flutterwave',    ph: 'ph-7' },
          { name: 'Chika Nwankwo',  role: 'VP Product',                      from: 'Spotify',        ph: 'ph-3' },
          { name: 'Folake Adeyemi', role: 'Head of Design',                  from: 'Andela',         ph: 'ph-6' },
        ]}
      />

      <ContentCTA
        eyebrow="Apply"
        title="Cold email beats the form."
        sub="Write us a paragraph about the most ambitious thing you've shipped — careers@computicket.ng. We read every one inside 48 hours."
        primary={{ label: 'careers@computicket.ng', href: 'mailto:careers@computicket.ng' }}
        secondary={{ label: 'About Computicket', href: '/about' }}
      />
    </div>
  );
}
