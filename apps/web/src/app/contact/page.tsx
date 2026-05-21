import type { Metadata } from 'next';
import { Icon, type IconName } from '@/components/Icon';
import { CategoryHero } from '@/components/marketplace/CategoryHero';
import { SectionHead } from '@/components/marketplace/SectionHead';

export const metadata: Metadata = {
  title: 'Contact Computicket Nigeria',
  description:
    'Customer support, organizer success, partnerships, press and careers — pick a channel.',
};

const CHANNELS: Array<{
  icon: IconName;
  title: string;
  detail: string;
  cta: string;
  href: string;
  sub: string;
}> = [
  {
    icon: 'pulse',
    title: 'Customer support',
    detail: 'Buying, refunding, scanning, wallet, tickets.',
    cta: 'Open help centre',
    href: '/help',
    sub: 'Or chat 24/7 in-app',
  },
  {
    icon: 'chart',
    title: 'Organizer success',
    detail: 'For event organizers using the dashboard.',
    cta: 'success@computicket.ng',
    href: 'mailto:success@computicket.ng',
    sub: 'Reply within 4 business hours',
  },
  {
    icon: 'send',
    title: 'Press & media',
    detail: 'Interviews, statements, embargoed announcements.',
    cta: 'press@computicket.ng',
    href: 'mailto:press@computicket.ng',
    sub: 'Lagos timezone',
  },
  {
    icon: 'wallet',
    title: 'Partnerships',
    detail: 'Travel inventory, payments rails, brand sponsorships.',
    cta: 'partners@computicket.ng',
    href: 'mailto:partners@computicket.ng',
    sub: 'Pitch in one paragraph',
  },
  {
    icon: 'user',
    title: 'Careers',
    detail: 'Open roles, internships, speculative.',
    cta: 'careers@computicket.ng',
    href: 'mailto:careers@computicket.ng',
    sub: 'See open roles',
  },
  {
    icon: 'shield',
    title: 'Trust & safety',
    detail: 'Fraud reports, abuse, urgent venue incidents.',
    cta: 'trust@computicket.ng',
    href: 'mailto:trust@computicket.ng',
    sub: 'On-call 24/7',
  },
];

const ADDRESSES = [
  {
    city: 'Lagos · HQ',
    line1: 'Plot 12B, Adeola Odeku St.',
    line2: 'Victoria Island, Lagos 101241',
    hours: 'Mon–Fri 9:00–18:00',
    phone: '+234 700 268 425 38',
  },
  {
    city: 'Abuja',
    line1: '7 Aminu Kano Crescent',
    line2: 'Wuse 2, Abuja 904101',
    hours: 'Mon–Fri 9:00–17:00',
    phone: '+234 700 268 425 38',
  },
];

export default function ContactPage() {
  return (
    <div className="page-enter">
      <CategoryHero
        eyebrow="Contact"
        title="Talk to a real person."
        subtitle="Computicket Lagos answers messages in working hours. Pick the channel for your question — we route faster than the form."
        ph="ph-8"
        primaryCta={{ label: 'Open help centre', href: '/help' }}
        secondaryCta={{ label: 'Chat in-app', href: '/support' }}
        badges={[
          { icon: 'check', label: 'Response < 4h' },
          { icon: 'shield', label: '24/7 trust hotline' },
        ]}
      />

      <section className="wrap section-sm">
        <SectionHead eyebrow="Channels" title="Six ways to reach us." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {CHANNELS.map((c) => (
            <div key={c.title} className="card card-hover" style={{ padding: 24 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--r-2)',
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Icon name={c.icon} size={18} />
              </div>
              <div className="h-4 mt-3" style={{ fontSize: 16 }}>
                {c.title}
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--ink-3)',
                  lineHeight: 1.6,
                  marginTop: 8,
                }}
              >
                {c.detail}
              </p>
              <a href={c.href} className="btn btn-ghost btn-sm mt-4" style={{ width: '100%', justifyContent: 'center' }}>
                {c.cta}
              </a>
              <div className="text-xs muted mt-3">{c.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap section-sm" style={{ paddingTop: 0 }}>
        <SectionHead eyebrow="Offices" title="Two cities. Lagos answers first." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {ADDRESSES.map((a) => (
            <div key={a.city} className="card" style={{ padding: 28 }}>
              <div className="row gap-2" style={{ alignItems: 'center' }}>
                <Icon name="pin" size={14} stroke={2} />
                <span className="fw-600">{a.city}</span>
              </div>
              <p
                style={{
                  fontSize: 15,
                  color: 'var(--ink-2)',
                  marginTop: 14,
                  lineHeight: 1.6,
                }}
              >
                {a.line1}
                <br />
                {a.line2}
              </p>
              <div className="hr mt-4 mb-4" />
              <div className="row gap-2 text-sm">
                <Icon name="clock" size={13} />
                <span className="muted">{a.hours}</span>
              </div>
              <div className="row gap-2 text-sm mt-2">
                <Icon name="bell" size={13} />
                <span className="mono">{a.phone}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap section-sm" style={{ paddingTop: 0 }}>
        <div className="card" style={{ padding: 32 }}>
          <div className="row gap-3 mb-4">
            <Icon name="info" size={18} />
            <div>
              <div className="h-4">Don&apos;t see your question?</div>
              <p
                className="muted"
                style={{ fontSize: 14, marginTop: 6, lineHeight: 1.6 }}
              >
                Most questions are answered in the{' '}
                <a href="/help" className="accent-text">
                  Help Centre
                </a>{' '}
                or via in-app chat. For everything else, email{' '}
                <a href="mailto:hello@computicket.ng" className="accent-text">
                  hello@computicket.ng
                </a>{' '}
                and we&apos;ll route you.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
