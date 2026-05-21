import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import { CategoryHero } from '@/components/marketplace/CategoryHero';
import { SectionHead } from '@/components/marketplace/SectionHead';

export const metadata: Metadata = {
  title: 'Press & Newsroom — Computicket Nigeria',
  description:
    "Press releases, brand assets, executive bios and media contacts for Nigeria's all-in-one ticketing platform.",
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
    title: 'Series B raise to expand pan-African',
    cat: 'Funding',
    summary:
      'Computicket announces a $14M Series B led by Ventures Platform, to fund expansion into Ghana, Kenya and South Africa through 2027.',
  },
  {
    date: '02 Feb 2026',
    title: "Compass AI launches in-app",
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
];

const ASSETS = [
  { t: 'Logo pack',      n: '12 files · SVG · PNG · light/dark',  i: 'gift' as const },
  { t: 'Product shots',  n: '38 hi-res screenshots',               i: 'eye' as const },
  { t: 'Brand guidelines',n: '24-page PDF',                        i: 'shield' as const },
  { t: 'Executive bios', n: 'CEO, CTO, CPO, COO',                   i: 'user' as const },
];

const COVERAGE = [
  { src: 'TechCrunch',         line: '"The most polished Nigerian consumer marketplace this year."', date: 'Apr 2026' },
  { src: 'BusinessDay',        line: '"Computicket has quietly become the default ticketing rail for Lagos."', date: 'Mar 2026' },
  { src: 'TechCabal',          line: "\"Nigeria's first all-in-one entertainment + travel marketplace.\"", date: 'Feb 2026' },
  { src: 'The Guardian (NG)',  line: '"The platform powering Detty December."', date: 'Jan 2026' },
];

export default function PressPage() {
  return (
    <div className="page-enter">
      <CategoryHero
        eyebrow="Press & Newsroom"
        title="The platform powering Detty December."
        subtitle="Press releases, brand assets, exec bios and media contacts — everything you need to write about Computicket."
        ph="ph-1"
        primaryCta={{ label: 'Latest release', href: '#releases' }}
        secondaryCta={{ label: 'Email the team', href: 'mailto:press@computicket.ng' }}
        badges={[{ icon: 'send', label: 'press@computicket.ng' }]}
      />

      <section id="releases" className="wrap section-sm">
        <SectionHead eyebrow="Press releases" title="The last twelve months." />
        <div className="col gap-3">
          {RELEASES.map((r) => (
            <article
              key={r.title}
              className="card card-hover"
              style={{
                padding: 22,
                display: 'grid',
                gridTemplateColumns: '120px minmax(0,1fr) auto',
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
                <div className="h-4" style={{ fontSize: 17 }}>
                  {r.title}
                </div>
                <p
                  style={{
                    fontSize: 13.5,
                    color: 'var(--ink-3)',
                    lineHeight: 1.6,
                    marginTop: 8,
                  }}
                >
                  {r.summary}
                </p>
              </div>
              <button type="button" className="btn btn-ghost btn-sm">
                Read <Icon name="arrow" size={12} />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="wrap section-sm" style={{ paddingTop: 0 }}>
        <SectionHead
          eyebrow="Brand kit"
          title="Logos, screenshots, bios."
          sub="Everything writers need to ship. Hosted as a single zip — no form gates."
          cta="Download brand kit"
          ctaHref="mailto:press@computicket.ng"
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {ASSETS.map((a) => (
            <div key={a.t} className="card card-hover" style={{ padding: 22 }}>
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
                <Icon name={a.i} size={18} />
              </div>
              <div className="h-4 mt-3" style={{ fontSize: 14 }}>
                {a.t}
              </div>
              <div className="text-xs muted mt-1">{a.n}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap section-sm" style={{ paddingTop: 0 }}>
        <SectionHead eyebrow="Coverage" title="What they're saying." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {COVERAGE.map((c) => (
            <div key={c.src} className="card" style={{ padding: 24 }}>
              <div className="serif" style={{ fontSize: 22, lineHeight: 1.35 }}>
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

      <section className="wrap" style={{ paddingBottom: 96 }}>
        <div
          className="card"
          style={{
            padding: 32,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 32,
          }}
        >
          <div>
            <div className="eyebrow mb-2">Media contact</div>
            <div className="h-3">Aisha Okonkwo · Head of Communications</div>
            <p
              style={{
                fontSize: 14,
                color: 'var(--ink-3)',
                marginTop: 10,
                lineHeight: 1.65,
              }}
            >
              For interview requests, founder availability, exclusives and embargoed
              announcements. Lagos timezone, typically responds within 4 working hours.
            </p>
            <a href="mailto:press@computicket.ng" className="btn btn-accent mt-4">
              press@computicket.ng
            </a>
          </div>
          <div>
            <div className="eyebrow mb-2">Investor relations</div>
            <div className="h-3">Tunde Akinfemiwa · CFO</div>
            <p
              style={{
                fontSize: 14,
                color: 'var(--ink-3)',
                marginTop: 10,
                lineHeight: 1.65,
              }}
            >
              For institutional investors, financial data and pre-IPO inquiries.
            </p>
            <a href="mailto:ir@computicket.ng" className="btn btn-ghost mt-4">
              ir@computicket.ng
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
