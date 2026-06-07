import type { Metadata } from 'next';
import {
  ContentBlock,
  ContentCTA,
  ContentHero,
  ContentSubNav,
  FAQBlock,
  PillarsBlock,
  StatsStrip,
} from '@/components/marketplace/Editorial';
import { SectionHead } from '@/components/marketplace/SectionHead';

export const metadata: Metadata = {
  title: 'Onboarding — Computicket for Organizers',
  description:
    'KYC in 24 hours. White-glove setup for orgs over ₦5M/month. Dedicated success manager from day one.',
};

const STEPS = [
  {
    step: '01',
    t: 'Create your account · 1 minute',
    body: 'Email, password, organizer name. No card required, no calls — you can start drafting an event before the first KYC document.',
  },
  {
    step: '02',
    t: 'Submit KYC · 24 hours',
    body: 'CAC certificate, director ID, proof of address. Upload from the dashboard. Median verification time: 11 hours. We don\'t kick the can — every submission gets a decision inside one business day.',
  },
  {
    step: '03',
    t: 'Connect your bank · 5 minutes',
    body: 'Pick your bank from the dropdown, enter the account number. Paystack verifies the account name in 5 seconds. You\'re ready to receive payouts.',
  },
  {
    step: '04',
    t: 'Publish your first event · Today',
    body: 'Draft, multi-tier pricing, seat map (optional), promo codes (optional). The Publish button goes live the moment KYC clears.',
  },
];

export default function OnboardingPage() {
  return (
    <div className="page-enter">
      <ContentSubNav group="organizer" active="onboarding" />

      <ContentHero
        eyebrow="Organizer · Onboarding"
        title="From sign-up to first sale in 24 hours."
        lede="KYC in under a day. Bank connection in five minutes. A dedicated success manager from day one for organizers over ₦5M/month. We've onboarded 2,400+ organizers — we know what slows people down, and we've removed it."
      />

      <StatsStrip
        stats={[
          { n: '11h',    l: 'Median KYC verification time' },
          { n: '24h',    l: 'SLA, all KYC submissions' },
          { n: 'Free',    l: 'White-glove setup over ₦5M/mo' },
          { n: '2,400+', l: 'Organizers onboarded to date' },
        ]}
      />

      <section className="wrap section">
        <SectionHead
          eyebrow="Onboarding steps"
          title="Four steps. One business day."
          sub="The whole process is designed so that you can be selling tickets by close-of-business on the day you sign up. No surprises, no hidden review queues."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {STEPS.map((s) => (
            <div key={s.step} className="card" style={{ padding: 24 }}>
              <div className="mono accent-text fw-600" style={{ fontSize: 28 }}>
                {s.step}
              </div>
              <div className="h-4 mt-3" style={{ fontSize: 15 }}>
                {s.t}
              </div>
              <p className="text-sm muted mt-2" style={{ lineHeight: 1.65 }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <PillarsBlock
        eyebrow="What we need from you"
        title="The documents that unlock KYC."
        cols={3}
        pillars={[
          {
            icon: 'shield',
            title: 'CAC certificate',
            body:
              "Your business's CAC registration. Sole proprietorships, LLCs and non-profits all welcome. Upload as PDF; we OCR the RC number against the CAC public registry automatically.",
            color: 'oklch(0.62 0.18 152)',
          },
          {
            icon: 'user',
            title: 'Director ID',
            body:
              "Government-issued ID for the listed director — NIN slip, driver's licence, international passport or voter's card. We verify against the NIMC database in real time.",
            color: 'oklch(0.60 0.16 230)',
          },
          {
            icon: 'pin',
            title: 'Proof of address',
            body:
              "Utility bill (PHCN, water, internet) under 3 months old, or bank statement. Tied to either the business address on your CAC or the director's home address.",
            color: 'oklch(0.65 0.15 75)',
          },
        ]}
      />

      <ContentBlock
        eyebrow="White-glove setup"
        title="Organizers over ₦5M/month: we come to you."
        image="ph-7"
        imageCaption="Onboarding workshop · Lagos HQ"
        body={
          <>
            <p>
              Forecasting more than ₦5M GMV in your first month? Our organizer success team
              handles your setup end-to-end. We come to your office (or you to ours), help you
              model your event tiers, build the seat map, draft the buyer copy, and run a paid
              dress rehearsal with your team.
            </p>
            <p className="mt-4">
              The same team stays attached for your first 90 days. Daily check-ins during sale
              windows, weekly reviews during steady-state. They sit in your Slack or WhatsApp
              group, not behind a ticket queue.
            </p>
            <p className="mt-4">
              We&apos;ve white-gloved every promoter doing &gt; ₦100M annual GMV on the platform.
              You&apos;d recognise the names; we don&apos;t list them here out of respect.
            </p>
          </>
        }
      />

      <ContentBlock
        eyebrow="Migration"
        title="Moving from another platform? We do the hard part."
        imagePosition="left"
        image="ph-4"
        imageCaption="Data migration · Lagos engineering"
        body={
          <>
            <p>
              Coming from another ticketing platform? Our migration team will import your
              historical events, ticket types, customer email list (with consent), and outstanding
              orders into Computicket. Single-day migration for organizers under 10,000 historical
              orders; phased for larger.
            </p>
            <p className="mt-4">
              We pull from Ticketing Africa, Nairabox, Tix Africa, Eventbrite, and direct
              spreadsheet imports. Existing QR tickets remain valid through their original
              platform until expiry — there&apos;s no buyer-facing cutover. From your side, you
              just publish on the new platform.
            </p>
            <p className="mt-4">
              Migration is included free for any organizer with a 12-month commitment.
            </p>
          </>
        }
      />

      <FAQBlock
        eyebrow="Frequently asked"
        title="Onboarding questions."
        items={[
          {
            q: "What if I'm an individual promoter without a CAC?",
            a: (
              <>
                You can register a Business Name with CAC for ₦10,000 and a 2–3 day turnaround.
                Our partner CAC officer (referenced in the dashboard) can do it for you. If
                you&apos;d rather wait, we can onboard you under a draft-only account — you can
                build events but can&apos;t publish until registration completes.
              </>
            ),
          },
          {
            q: "How long does KYC really take?",
            a: (
              <>
                Median verification time is 11 hours. 90th percentile is 22 hours. We commit to a
                24-hour SLA — if we haven&apos;t come back in 24 hours,{' '}
                <a className="accent-text" href="mailto:success@computicket.ng">
                  success@computicket.ng
                </a>{' '}
                and we&apos;ll escalate within the hour.
              </>
            ),
          },
          {
            q: 'Can I publish before KYC clears?',
            a: (
              <>
                You can draft, build seat maps, set prices and even invite your team to review.
                The Publish button is greyed out until KYC clears — once it does (usually overnight)
                you can publish immediately, no extra approval.
              </>
            ),
          },
          {
            q: 'Do you onboard non-Nigerian organizers?',
            a: (
              <>
                Today, we onboard Nigerian-registered organizers only. We&apos;re expanding to
                Ghana and Kenya in Q4 2026, with South Africa to follow. International promoters
                can partner with a Nigerian co-promoter today — many of our biggest UK
                concert-tour onboardings work this way.
              </>
            ),
          },
          {
            q: "What's the cost to get started?",
            a: (
              <>
                Free. No signup fee, no monthly fee, no listing fee. We charge a commission only
                when tickets sell — 7% standard, 5% volume, custom enterprise. Setup support,
                migration help and the dedicated success manager (where you qualify) are all
                included.
              </>
            ),
          },
        ]}
      />

      <ContentCTA
        eyebrow="Get started"
        title="Account in a minute. KYC in a day. Live by tomorrow."
        sub="No card to enter, no demo gate. Sign up, draft your event, upload your CAC. We'll be in your inbox before the day is out."
        primary={{ label: 'Create organizer account', href: '/dashboard/signup' }}
        secondary={{ label: 'Talk to onboarding', href: 'mailto:success@computicket.ng?subject=Onboarding' }}
      />
    </div>
  );
}
