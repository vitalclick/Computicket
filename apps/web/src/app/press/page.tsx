import type { Metadata } from 'next';
import { Icon, type IconName } from '@/components/Icon';
import {
  ContentBlock,
  ContentCTA,
  ContentHero,
  ContentSubNav,
  StatsStrip,
} from '@/components/marketplace/Editorial';
import { SectionHead } from '@/components/marketplace/SectionHead';

export const metadata: Metadata = {
  title: 'Press & Newsroom — Computicket Nigeria',
  description:
    "Press releases, brand assets, exec bios and media contacts for Nigeria's all-in-one ticketing platform.",
};

const RELEASES = [
  {
    date: '12 May 2026',
    title: 'Computicket crosses 1.2M tickets sold in 12 months',
    cat: 'Milestone',
    summary:
      'A 4.2× year-on-year increase, driven by Detty December bookings and the addition of bus, flight and hotel inventory.',
  },
  {
    date: '03 Apr 2026',
    title: 'Computicket partners with Air Peace for domestic flight booking',
    cat: 'Partnership',
    summary:
      'Air Peace is the first Nigerian carrier to integrate directly with the Computicket marketplace, with same-day issuance for domestic flights.',
  },
  {
    date: '18 Mar 2026',
    title: '$14M Series B to expand pan-African',
    cat: 'Funding',
    summary:
      'Series B led by Ventures Platform with participation from Future Africa and TLcom Capital, to fund expansion into Ghana, Kenya and South Africa through 2027.',
  },
  {
    date: '02 Feb 2026',
    title: 'Compass AI launches in-app',
    cat: 'Product',
    summary:
      'A conversational planner that bundles flight, hotel and event tickets in a single cart, with live price tracking and bundle savings.',
  },
  {
    date: '14 Dec 2025',
    title: 'Detty December scan-throughput passes 1M',
    cat: 'Operations',
    summary:
      'In December 2025, the scanner network processed over 1 million entries across 280 events without a single double-issuance.',
  },
  {
    date: '20 Oct 2025',
    title: 'NDPB certification awarded',
    cat: 'Compliance',
    summary:
      'Computicket Nigeria becomes one of the first NDPR-certified consumer marketplaces, with quarterly third-party audits of data handling.',
  },
];

const ASSETS: Array<{ icon: IconName; title: string; sub: string }> = [
  { icon: 'gift',   title: 'Logo pack',         sub: '12 files · SVG · PNG · light/dark · cropped/wordmark' },
  { icon: 'eye',    title: 'Product shots',     sub: '38 hi-res screenshots · iPhone + Android + web' },
  { icon: 'shield', title: 'Brand guidelines',  sub: '24-page PDF · colour, typography, voice' },
  { icon: 'user',   title: 'Executive bios',    sub: 'CEO, CTO, CPO, COO · headshots and approved copy' },
  { icon: 'film',   title: 'B-roll footage',    sub: '4K clips · Lagos office, scan ops, venue gates' },
  { icon: 'send',   title: 'Fact sheet',        sub: 'Latest GMV, headcount, region coverage, milestones' },
];

const COVERAGE = [
  { src: 'TechCrunch',        line: '“The most polished Nigerian consumer marketplace this year.”',  date: 'Apr 2026' },
  { src: 'BusinessDay',       line: '“Computicket has quietly become the default ticketing rail for Lagos.”', date: 'Mar 2026' },
  { src: 'TechCabal',         line: "“Nigeria's first all-in-one entertainment + travel marketplace.”", date: 'Feb 2026' },
  { src: 'The Guardian (NG)', line: '“The platform powering Detty December.”',                       date: 'Jan 2026' },
  { src: 'Rest of World',     line: '“A rare African consumer marketplace at the scale of its ambition.”', date: 'Dec 2025' },
  { src: 'Quartz Africa',     line: '“Built on Lagos energy, with infrastructure that finally matches the city.”', date: 'Nov 2025' },
];

export default function PressPage() {
  return (
    <div className="page-enter">
      <ContentSubNav group="company" active="press" />

      <ContentHero
        eyebrow="Press & Newsroom"
        title="The platform powering Detty December."
        lede="Press releases, brand assets, executive bios and media contacts — everything you need to write about Computicket Nigeria."
      />

      <StatsStrip
        stats={[
          { n: '1.2M+', l: 'Tickets sold this year' },
          { n: '6',     l: 'Press releases · 12 months' },
          { n: '< 4h',  l: 'Average response, Lagos hours' },
          { n: 'NDPR',  l: 'Certified · audited quarterly' },
        ]}
      />

      <section className="wrap section">
        <SectionHead
          eyebrow="Press releases"
          title="The last twelve months."
          sub="All releases hosted under press.computicket.ng with RSS for syndication."
        />
        <div className="col gap-3">
          {RELEASES.map((r) => (
            <article
              key={r.title}
              className="card card-hover"
              style={{
                padding: 24,
                display: 'grid',
                gridTemplateColumns: '128px minmax(0,1fr) auto',
                gap: 24,
                alignItems: 'flex-start',
              }}
            >
              <div className="mono text-xs muted" style={{ paddingTop: 4 }}>
                {r.date}
              </div>
              <div>
                <div className="row gap-2 mb-2">
                  <span className="chip chip-accent">{r.cat}</span>
                </div>
                <div className="h-4" style={{ fontSize: 18 }}>
                  {r.title}
                </div>
                <p style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.6, marginTop: 8 }}>
                  {r.summary}
                </p>
              </div>
              <a
                href={`mailto:press@computicket.ng?subject=${encodeURIComponent(r.title)}`}
                className="btn btn-ghost btn-sm"
              >
                Read <Icon name="arrow" size={12} />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="wrap section" style={{ paddingTop: 0 }}>
        <SectionHead
          eyebrow="Brand kit"
          title="Logos, screenshots, bios."
          sub="No form gates. Single zip download — email us and we send it inside an hour."
          cta="Email for the kit"
          ctaHref="mailto:press@computicket.ng?subject=Brand%20kit"
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {ASSETS.map((a) => (
            <div key={a.title} className="card card-hover" style={{ padding: 22 }}>
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
                <Icon name={a.icon} size={18} />
              </div>
              <div className="h-4 mt-3" style={{ fontSize: 15 }}>
                {a.title}
              </div>
              <div className="text-xs muted mt-1">{a.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap section" style={{ paddingTop: 0 }}>
        <SectionHead eyebrow="Coverage" title="What they're saying." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {COVERAGE.map((c) => (
            <div key={c.src + c.date} className="card" style={{ padding: 28 }}>
              <div className="serif" style={{ fontSize: 24, lineHeight: 1.35 }}>
                {c.line}
              </div>
              <div className="row gap-2 mt-4 muted text-xs">
                <span className="fw-600">{c.src}</span>
                <span>·</span>
                <span>{c.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ContentBlock
        eyebrow="Media contact"
        title="Aisha Okonkwo · Head of Communications"
        body={
          <>
            <p>
              For interview requests, founder availability, exclusives and embargoed
              announcements. Lagos timezone (WAT, GMT+1), typically responds within 4 working
              hours.
            </p>
            <p className="mt-4">
              <strong>Press inquiries:</strong>{' '}
              <a className="accent-text" href="mailto:press@computicket.ng">
                press@computicket.ng
              </a>
            </p>
            <p className="mt-2">
              <strong>Investor relations:</strong>{' '}
              <a className="accent-text" href="mailto:ir@computicket.ng">
                ir@computicket.ng
              </a>{' '}
              · Tunde Akinfemiwa, CFO
            </p>
            <p className="mt-2">
              <strong>Trust &amp; safety media:</strong>{' '}
              <a className="accent-text" href="mailto:trust-press@computicket.ng">
                trust-press@computicket.ng
              </a>
            </p>
          </>
        }
      />

      <ContentCTA
        eyebrow="Newsroom updates"
        title="Get the next release the moment it ships."
        sub="Subscribe to the press list — releases, embargoed previews, exec calendar windows for interviews."
        primary={{ label: 'Subscribe by email', href: 'mailto:press@computicket.ng?subject=Subscribe' }}
        secondary={{ label: 'RSS feed', href: 'mailto:press@computicket.ng?subject=RSS' }}
      />
    </div>
  );
}
