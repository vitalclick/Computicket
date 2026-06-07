import type { Metadata } from 'next';
import { Icon, type IconName } from '@/components/Icon';
import {
  ContentBlock,
  ContentCTA,
  ContentHero,
  ContentSubNav,
  PillarsBlock,
  StatsStrip,
} from '@/components/marketplace/Editorial';
import { SectionHead } from '@/components/marketplace/SectionHead';

export const metadata: Metadata = {
  title: 'Partners — Computicket Nigeria',
  description:
    'Payments rails, airlines, bus operators, hotels, venues and media. The companies that make Computicket work.',
};

interface Partner {
  name: string;
  category: string;
}

const PAYMENTS: Partner[] = [
  { name: 'Paystack',     category: 'Card · transfer · USSD · settlement' },
  { name: 'Flutterwave',  category: 'Card · mobile money · multi-currency' },
  { name: 'Moniepoint',   category: 'PoS · agent network · in-person scanning' },
  { name: 'OPay',          category: 'Wallet · QR top-ups' },
  { name: 'PalmPay',       category: 'Wallet · USSD fallback' },
  { name: 'Verve',         category: 'Domestic card scheme' },
];

const TRAVEL: Partner[] = [
  { name: 'Air Peace',      category: 'Domestic + Regional flights, direct NDC' },
  { name: 'Ibom Air',       category: 'Domestic flights, direct NDC' },
  { name: 'United Nigeria', category: 'Domestic flights, GDS via Amadeus' },
  { name: 'GIGM',           category: 'Inter-city bus · GPS-tracked fleet' },
  { name: 'Chisco',         category: 'Inter-city bus · 18 terminals' },
  { name: 'ABC Transport',  category: 'Inter-city bus · cross-border services' },
];

const HOSPITALITY: Partner[] = [
  { name: 'Eko Hotel & Suites',     category: 'V/Island, Lagos · 800 keys' },
  { name: 'The Wheatbaker',          category: 'Ikoyi, Lagos · 102 keys' },
  { name: 'Transcorp Hilton',        category: 'Maitama, Abuja · 670 keys' },
  { name: 'Radisson Blu Anchorage',  category: 'V/Island, Lagos · 170 keys' },
  { name: 'La Campagne Tropicana',   category: 'Lekki Beach Resort · 240 keys' },
  { name: 'Lagos Continental',       category: 'V/Island, Lagos · 358 keys' },
];

const VENUES: Partner[] = [
  { name: 'Eko Convention Centre',  category: 'Concert venue · 22,000 capacity' },
  { name: 'Landmark Centre',         category: 'Multi-purpose · 4,500 capacity' },
  { name: 'Tafawa Balewa Square',    category: 'Open-air · 50,000 capacity' },
  { name: 'Muri Okunola Park',       category: 'Festival ground · 30,000' },
  { name: 'Terra Kulture',           category: 'Theatre Republic · 250' },
  { name: 'MUSON Centre',             category: 'Concert hall · 1,000 capacity' },
];

const TIERS: Array<{ icon: IconName; title: string; body: string; color: string }> = [
  {
    icon: 'send',
    title: 'Ticketing & event partners',
    body:
      'Organizers using Computicket as their primary ticketing rail. White-label subdomain available; full dashboard with payouts, analytics and team management.',
    color: 'oklch(0.62 0.18 152)',
  },
  {
    icon: 'plane',
    title: 'Travel inventory partners',
    body:
      'Airlines, bus operators and hotels listing inventory on the marketplace. Direct integration via the partner API, NDC for carriers, or managed onboarding.',
    color: 'oklch(0.60 0.16 230)',
  },
  {
    icon: 'wallet',
    title: 'Payment partners',
    body:
      'Acquirers and PSPs routing transactions through Computicket. Settlement support, reconciliation tooling, fraud signal sharing, joint chargeback ops.',
    color: 'oklch(0.65 0.15 75)',
  },
  {
    icon: 'eye',
    title: 'Media & brand partners',
    body:
      'Brand sponsorships, native event placements, exclusive bundle promotions. Reach 1.2M monthly active bookers across Lagos, Abuja, PH, Ibadan, Calabar, Kano.',
    color: 'oklch(0.55 0.18 305)',
  },
];

function PartnerGroup({
  title,
  sub,
  partners,
}: {
  title: string;
  sub: string;
  partners: Partner[];
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div className="between mb-3">
        <div>
          <div className="eyebrow">{title}</div>
          <div className="h-4 mt-1">{sub}</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {partners.map((p) => (
          <div
            key={p.name}
            className="card"
            style={{
              padding: 22,
              minHeight: 92,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div className="fw-600" style={{ fontSize: 16 }}>
              {p.name}
            </div>
            <div className="text-xs muted mt-2">{p.category}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PartnersPage() {
  return (
    <div className="page-enter">
      <ContentSubNav group="company" active="partners" />

      <ContentHero
        eyebrow="Partners"
        title="The companies that make Computicket work."
        lede="Payments rails, airlines, bus operators, hotels, venues, and media. Every booking we ship is a partnership in motion — and every partnership rests on the same shared standards."
      />

      <StatsStrip
        stats={[
          { n: '38',  l: 'Travel inventory partners' },
          { n: '6',   l: 'Payments rails integrated' },
          { n: '120+', l: 'Hospitality & venue partners' },
          { n: 'PCI-DSS', l: 'L1 certified · NDPR compliant' },
        ]}
      />

      <PillarsBlock
        eyebrow="Partner tiers"
        title="Four ways to work with us."
        cols={2}
        pillars={TIERS}
      />

      <section className="wrap section">
        <SectionHead
          eyebrow="The roster · a selection"
          title="Some of who we work with."
          sub="The full partner list runs into the hundreds; this is the tip of it."
        />
        <PartnerGroup title="Payments" sub="Six acquirers, every Nigerian rail." partners={PAYMENTS} />
        <PartnerGroup title="Travel"   sub="Airlines &amp; inter-city bus operators." partners={TRAVEL} />
        <PartnerGroup title="Hospitality" sub="Hotels and resorts across Nigeria." partners={HOSPITALITY} />
        <PartnerGroup title="Venues"   sub="The places we ticket most." partners={VENUES} />
      </section>

      <ContentBlock
        eyebrow="How we partner"
        title="One contract. One integration. One support channel."
        image="ph-9"
        imageCaption="Partner ops review · Lagos HQ"
        body={
          <>
            <p>
              Computicket runs a single partner agreement that covers commercial terms,
              integration scope, support SLAs and dispute handling. No second-tier legal review,
              no surprise change-of-terms emails.
            </p>
            <p className="mt-4">
              Our partner API ships with idempotency on every write, signed webhooks, sandbox
              data that mirrors production schema, and a Postman collection that runs the
              happy-path inside 5 minutes.
            </p>
            <p className="mt-4">
              Median partner-onboarding time, signed agreement to first live booking: <strong>11
              days</strong>.
            </p>
          </>
        }
      />

      <ContentCTA
        eyebrow="Partner program"
        title="Want to integrate?"
        sub="One paragraph describing your business, your inventory, and the audience you serve. We'll route you to the right team and reply inside one working day."
        primary={{ label: 'partners@computicket.ng', href: 'mailto:partners@computicket.ng' }}
        secondary={{ label: 'API documentation', href: '/for-organizers/api-access' }}
      />
    </div>
  );
}
