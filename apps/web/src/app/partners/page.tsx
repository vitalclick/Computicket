import type { Metadata } from 'next';
import { Icon, type IconName } from '@/components/Icon';
import { CategoryHero } from '@/components/marketplace/CategoryHero';
import { PillarGrid } from '@/components/marketplace/ContentPage';
import { SectionHead } from '@/components/marketplace/SectionHead';

export const metadata: Metadata = {
  title: 'Partners — payments, travel, venues, media',
  description:
    'The companies, venues, carriers and platforms that make Computicket work — Paystack, Air Peace, Eko Hotel, GIGM and more.',
};

interface Partner {
  name: string;
  category: string;
}

const PAYMENTS: Partner[] = [
  { name: 'Paystack',     category: 'Card · transfer · USSD' },
  { name: 'Flutterwave',  category: 'Card · mobile money' },
  { name: 'Moniepoint',   category: 'PoS · agent network' },
  { name: 'OPay',          category: 'Wallet · QR' },
  { name: 'PalmPay',       category: 'Wallet' },
  { name: 'Verve',         category: 'Domestic card scheme' },
];

const TRAVEL: Partner[] = [
  { name: 'Air Peace',     category: 'Domestic + Regional flights' },
  { name: 'Ibom Air',      category: 'Domestic flights' },
  { name: 'United Nigeria',category: 'Domestic flights' },
  { name: 'GIGM',          category: 'Inter-city bus' },
  { name: 'Chisco',        category: 'Inter-city bus' },
  { name: 'ABC Transport', category: 'Inter-city bus' },
];

const HOSPITALITY: Partner[] = [
  { name: 'Eko Hotel & Suites',       category: 'V/Island, Lagos' },
  { name: 'The Wheatbaker',            category: 'Ikoyi, Lagos' },
  { name: 'Transcorp Hilton',          category: 'Maitama, Abuja' },
  { name: 'Radisson Blu Anchorage',    category: 'V/Island, Lagos' },
  { name: 'La Campagne Tropicana',     category: 'Lekki, Lagos' },
  { name: 'Lagos Continental',         category: 'V/Island, Lagos' },
];

const VENUES: Partner[] = [
  { name: 'Eko Convention Centre',     category: 'Concert venue' },
  { name: 'Landmark Centre',            category: 'Multi-purpose · Lagos' },
  { name: 'Tafawa Balewa Square',       category: 'Open-air · Lagos' },
  { name: 'Muri Okunola Park',          category: 'Festival ground' },
  { name: 'Terra Kulture',              category: 'Theatre Republic' },
  { name: 'MUSON Centre',                category: 'Concert hall · Onikan' },
];

const TIERS: Array<{ icon: IconName; title: string; body: string; cta: string }> = [
  {
    icon: 'send',
    title: 'Ticketing & event partners',
    body:
      'Organizers using Computicket as their primary ticketing rail. White-label subdomain available; full dashboard with payouts, analytics and team management.',
    cta: 'Become an organizer',
  },
  {
    icon: 'plane',
    title: 'Travel inventory partners',
    body:
      'Airlines, bus operators and hotels listing inventory on the marketplace. Direct integration via our partner API, or managed onboarding.',
    cta: 'Apply to integrate',
  },
  {
    icon: 'wallet',
    title: 'Payment partners',
    body:
      'Acquirers and PSPs routing transactions through Computicket. Settlement support, reconciliation tooling, fraud signals.',
    cta: 'Talk to payments team',
  },
  {
    icon: 'eye',
    title: 'Media & brand partners',
    body:
      'Brand sponsorships, native event placements, exclusive bundle promotions. Reach 1.2M monthly active bookers across Nigeria.',
    cta: 'Brand partnerships',
  },
];

function PartnerGroup({ title, sub, partners }: { title: string; sub: string; partners: Partner[] }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div className="between mb-3">
        <div>
          <div className="eyebrow">{title}</div>
          <div className="h-4 mt-1">{sub}</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
        {partners.map((p) => (
          <div
            key={p.name}
            className="card"
            style={{
              padding: 18,
              minHeight: 92,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div className="fw-600" style={{ fontSize: 14 }}>
              {p.name}
            </div>
            <div className="text-xs muted mt-1">{p.category}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PartnersPage() {
  return (
    <div className="page-enter">
      <CategoryHero
        eyebrow="Partners"
        title="The companies that make Computicket work."
        subtitle="Payments rails, airlines, bus operators, hotels, venues and media — every booking we ship is a partnership in motion."
        ph="ph-9"
        primaryCta={{ label: 'Partner with us', href: '/contact' }}
        secondaryCta={{ label: 'See API access', href: '/for-organizers' }}
        badges={[
          { icon: 'shield', label: 'PCI-DSS certified' },
          { icon: 'check', label: 'NDPR compliant' },
        ]}
      />

      <section className="wrap section-sm">
        <SectionHead eyebrow="Partner tiers" title="Four ways to work with us." />
        <PillarGrid columns={2} items={TIERS} />
      </section>

      <section className="wrap section-sm" style={{ paddingTop: 0 }}>
        <SectionHead
          eyebrow="The roster"
          title="Some of who we work with."
          sub="A selection. The full partner list runs into the hundreds; this is the tip."
        />
        <PartnerGroup
          title="Payments"
          sub="Six acquirers, every Nigerian rail."
          partners={PAYMENTS}
        />
        <PartnerGroup
          title="Travel"
          sub="Airlines & inter-city bus operators."
          partners={TRAVEL}
        />
        <PartnerGroup
          title="Hospitality"
          sub="Hotels and resorts across Nigeria."
          partners={HOSPITALITY}
        />
        <PartnerGroup
          title="Venues"
          sub="The places we ticket most."
          partners={VENUES}
        />
      </section>

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
          <div className="eyebrow accent-text mb-2">Partner program</div>
          <h2 className="h-2" style={{ margin: '4px 0 8px' }}>
            Want to integrate?
          </h2>
          <p className="muted" style={{ maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
            We onboard partners in three categories: ticketing, travel inventory, and payments.
            Send a one-line note describing your business — we&apos;ll point you at the right team.
          </p>
          <a href="/contact" className="btn btn-accent btn-lg mt-6">
            Get in touch <Icon name="arrow" size={14} />
          </a>
        </div>
      </section>
    </div>
  );
}
