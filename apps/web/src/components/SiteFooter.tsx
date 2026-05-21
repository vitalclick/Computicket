import Link from 'next/link';
import { Icon } from './Icon';
import { Wordmark } from './Wordmark';

type Item = { label: string; href?: string };
type Column = { heading: string; items: Item[] };

const COLUMNS: Column[] = [
  {
    heading: 'Discover',
    items: [
      { label: 'Events', href: '/events' },
      { label: 'Concerts', href: '/events' },
      { label: 'Theatre' },
      { label: 'Cinema' },
      { label: 'Festivals' },
      { label: 'Experiences' },
    ],
  },
  {
    heading: 'Travel',
    items: [
      { label: 'Flights' },
      { label: 'Bus Travel', href: '/buses' },
      { label: 'Hotels' },
      { label: 'Weekend Getaways' },
      { label: 'Vouchers' },
      { label: 'Package Deals' },
    ],
  },
  {
    heading: 'Organizers',
    items: [
      { label: 'Sell Tickets', href: '/for-organizers' },
      { label: 'Promoter Hub', href: '/for-organizers' },
      { label: 'API Access', href: '/for-organizers' },
      { label: 'Payouts', href: '/dashboard' },
      { label: 'Analytics', href: '/dashboard' },
      { label: 'Onboarding', href: '/signup' },
    ],
  },
  {
    heading: 'Company',
    items: [
      { label: 'About Us' },
      { label: 'Careers' },
      { label: 'Press' },
      { label: 'Trust & Safety', href: '/support' },
      { label: 'Partners' },
      { label: 'Contact', href: '/support' },
    ],
  },
  {
    heading: 'Support',
    items: [
      { label: 'Help Centre', href: '/support' },
      { label: 'Buyer Protection', href: '/support' },
      { label: 'Refunds', href: '/support' },
      { label: 'Privacy' },
      { label: 'Terms' },
      { label: 'Cookie Policy' },
    ],
  },
];

const PAYMENTS = ['Paystack', 'Flutterwave', 'Verve', 'Mastercard', 'Visa', 'USSD'];

function FooterLink({ item }: { item: Item }) {
  const style: React.CSSProperties = { fontSize: 13.5, color: 'var(--ink-2)' };
  if (item.href) {
    return (
      <Link href={item.href} style={style}>
        {item.label}
      </Link>
    );
  }
  return (
    <span style={{ ...style, cursor: 'pointer' }} aria-disabled="true">
      {item.label}
    </span>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="stars" style={{ opacity: 0.4 }} />
      <div className="wrap" style={{ position: 'relative' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr repeat(5, 1fr)',
            gap: 48,
            marginBottom: 64,
          }}
        >
          <div>
            <Wordmark size={20} />
            <p
              style={{
                color: 'var(--ink-3)',
                fontSize: 14,
                marginTop: 16,
                maxWidth: 280,
                lineHeight: 1.55,
              }}
            >
              Nigeria's premium digital ecosystem for entertainment, travel and experiences.
              Trusted by 1.2M+ Nigerians across Lagos, Abuja, Port Harcourt and beyond.
            </p>
            <div className="row mt-6 gap-2">
              <span className="pill-stat">
                <Icon name="shield" size={13} /> PCI-DSS certified
              </span>
              <span className="pill-stat">
                <Icon name="check" size={13} /> NDPR compliant
              </span>
            </div>
          </div>
          {COLUMNS.map((c) => (
            <div key={c.heading}>
              <div className="eyebrow mb-4">{c.heading}</div>
              <div className="col" style={{ gap: 10 }}>
                {c.items.map((item) => (
                  <FooterLink key={item.label} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 24,
            borderTop: '1px solid var(--line)',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div className="row gap-4" style={{ alignItems: 'center' }}>
            <span className="mono text-xs muted">
              © {new Date().getFullYear()} Computicket Nigeria Ltd. RC 2,847,193
            </span>
            <span className="muted-2">·</span>
            <span className="mono text-xs muted">
              Plot 12B, Adeola Odeku St., Victoria Island, Lagos
            </span>
          </div>
          <div className="row gap-3" style={{ alignItems: 'center' }}>
            <span className="mono text-xs muted">Payment partners</span>
            {PAYMENTS.map((p) => (
              <span key={p} className="chip" style={{ padding: '4px 10px', fontSize: 11 }}>
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
