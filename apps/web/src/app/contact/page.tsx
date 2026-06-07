import type { Metadata } from 'next';
import { Icon, type IconName } from '@/components/Icon';
import {
  ContentBlock,
  ContentHero,
  ContentSubNav,
  StatsStrip,
} from '@/components/marketplace/Editorial';
import { SectionHead } from '@/components/marketplace/SectionHead';

export const metadata: Metadata = {
  title: 'Contact Computicket Nigeria',
  description:
    'Customer support, organizer success, partnerships, press and careers — pick a channel, talk to a real person.',
};

interface Channel {
  icon: IconName;
  title: string;
  detail: string;
  cta: string;
  href: string;
  sub: string;
}

const CHANNELS: Channel[] = [
  {
    icon: 'pulse',
    title: 'Customer support',
    detail: 'Buying, refunding, scanning, wallet, tickets — anything as a buyer.',
    cta: 'Open in-app chat',
    href: '/support',
    sub: '24/7 · Avg first response 4 min 20 s on WhatsApp',
  },
  {
    icon: 'chart',
    title: 'Organizer success',
    detail: 'For event organizers using the dashboard, payouts, scanning, refunds.',
    cta: 'success@computicket.ng',
    href: 'mailto:success@computicket.ng',
    sub: 'Reply within 4 business hours · Lagos timezone',
  },
  {
    icon: 'send',
    title: 'Press & media',
    detail: 'Interviews, statements, embargoed announcements, brand kit requests.',
    cta: 'press@computicket.ng',
    href: 'mailto:press@computicket.ng',
    sub: 'Aisha Okonkwo · Head of Communications',
  },
  {
    icon: 'wallet',
    title: 'Partnerships',
    detail: 'Travel inventory, payments rails, brand sponsorships, white-label deals.',
    cta: 'partners@computicket.ng',
    href: 'mailto:partners@computicket.ng',
    sub: 'Pitch in one paragraph · reply inside one working day',
  },
  {
    icon: 'user',
    title: 'Careers',
    detail: 'Open roles, internships, speculative — write us a paragraph.',
    cta: 'careers@computicket.ng',
    href: 'mailto:careers@computicket.ng',
    sub: 'Every cold email is read inside 48 hours',
  },
  {
    icon: 'shield',
    title: 'Trust & safety',
    detail: 'Fraud reports, abuse, urgent venue incidents, account compromise.',
    cta: 'trust@computicket.ng',
    href: 'mailto:trust@computicket.ng',
    sub: '24/7 on-call · WhatsApp +234 802 COMPASS',
  },
  {
    icon: 'lock',
    title: 'Security disclosure',
    detail: 'Responsible disclosure for security researchers. Bug bounty active.',
    cta: 'security@computicket.ng',
    href: 'mailto:security@computicket.ng',
    sub: 'PGP key on request · paid bounties up to ₦5M',
  },
  {
    icon: 'info',
    title: 'Investor relations',
    detail: 'Institutional investors, financial data, pre-IPO inquiries.',
    cta: 'ir@computicket.ng',
    href: 'mailto:ir@computicket.ng',
    sub: 'Tunde Akinfemiwa, CFO',
  },
];

const OFFICES = [
  {
    city: 'Lagos · HQ',
    line1: 'Plot 12B, Adeola Odeku St.',
    line2: 'Victoria Island, Lagos 101241',
    hours: 'Mon–Fri 09:00–18:00 WAT',
    phone: '+234 700 268 425 38',
    primary: true,
  },
  {
    city: 'Abuja',
    line1: '7 Aminu Kano Crescent',
    line2: 'Wuse 2, Abuja 904101',
    hours: 'Mon–Fri 09:00–17:00 WAT',
    phone: '+234 700 268 425 38',
  },
  {
    city: 'Port Harcourt',
    line1: '12 Forces Avenue',
    line2: 'Old GRA, Port Harcourt',
    hours: 'Mon–Fri 09:00–17:00 WAT',
    phone: '+234 700 268 425 38',
  },
  {
    city: 'Remote',
    line1: '24 contributors across NG',
    line2: 'and Cape Town, South Africa',
    hours: 'Async-first',
    phone: '—',
  },
];

export default function ContactPage() {
  return (
    <div className="page-enter">
      <ContentSubNav group="company" active="contact" />

      <ContentHero
        eyebrow="Contact"
        title="Talk to a real person."
        lede="Pick the channel that fits the question — we route faster than the form. Lagos answers first, but every channel is staffed during local business hours."
      />

      <StatsStrip
        stats={[
          { n: '< 4 min', l: 'In-app chat first response' },
          { n: '24/7',     l: 'Trust hotline on-call' },
          { n: '4',         l: 'NG offices · Lagos, Abuja, PH, remote' },
          { n: '8',         l: 'Direct channels by topic' },
        ]}
      />

      <section className="wrap section">
        <SectionHead
          eyebrow="Channels"
          title="Eight ways to reach us."
          sub="Each channel has a specific team behind it — no shared mailbox, no auto-replies, no chatbots."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
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
              <div className="h-4 mt-3" style={{ fontSize: 15 }}>
                {c.title}
              </div>
              <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6, marginTop: 8 }}>
                {c.detail}
              </p>
              <a
                href={c.href}
                className="btn btn-ghost btn-sm mt-4"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {c.cta}
              </a>
              <div className="text-xs muted mt-3">{c.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap section">
        <SectionHead eyebrow="Offices" title="Four locations. Lagos answers first." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {OFFICES.map((o) => (
            <div
              key={o.city}
              className="card"
              style={{
                padding: 24,
                border: o.primary ? '1px solid var(--accent)' : '1px solid var(--line)',
              }}
            >
              <div className="row gap-2" style={{ alignItems: 'center' }}>
                <Icon name="pin" size={14} stroke={2} />
                <span className="fw-600">{o.city}</span>
                {o.primary ? <span className="badge badge-vip">HQ</span> : null}
              </div>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 14, lineHeight: 1.6 }}>
                {o.line1}
                <br />
                {o.line2}
              </p>
              <div className="hr mt-4 mb-4" />
              <div className="row gap-2 text-sm">
                <Icon name="clock" size={13} />
                <span className="muted">{o.hours}</span>
              </div>
              <div className="row gap-2 text-sm mt-2">
                <Icon name="bell" size={13} />
                <span className="mono">{o.phone}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ContentBlock
        eyebrow="Walk-ins"
        title="The Lagos office takes walk-ins."
        image="ph-3"
        imageCaption="Lobby · 12B Adeola Odeku, Victoria Island"
        body={
          <>
            <p>
              The HQ lobby is open Monday to Friday, 9:00 to 18:00 WAT. We don&apos;t take a
              meeting blind — but if you&apos;ve emailed and we&apos;ve scheduled, you&apos;re on
              the list at reception.
            </p>
            <p className="mt-4">
              Visiting investors, partners and press: we&apos;ll cover the trip from MMA2 or
              Abuja-Lagos shuttle. Tell us 48 hours ahead and we&apos;ll send a driver.
            </p>
            <p className="mt-4">
              <strong>General switchboard:</strong> +234 700 268 425 38 · <strong>WhatsApp:</strong>{' '}
              +234 802 COMPASS · <strong>Email:</strong>{' '}
              <a className="accent-text" href="mailto:hello@computicket.ng">
                hello@computicket.ng
              </a>
            </p>
          </>
        }
      />
    </div>
  );
}
