import Link from 'next/link';
import { Icon } from './Icon';
import { Wordmark } from './Wordmark';

type Item = { label: string; href: string };
type Column = { heading: string; items: Item[] };

const COLUMNS: Column[] = [
  {
    heading: 'Discover',
    items: [
      { label: 'Events', href: '/events' },
      { label: 'Concerts', href: '/concerts' },
      { label: 'Theatre', href: '/theatre' },
      { label: 'Cinema', href: '/cinema' },
      { label: 'Festivals', href: '/festivals' },
      { label: 'Experiences', href: '/experiences' },
    ],
  },
  {
    heading: 'Travel',
    items: [
      { label: 'Flights', href: '/flights' },
      { label: 'Bus Travel', href: '/buses' },
      { label: 'Hotels', href: '/hotels' },
      { label: 'Weekend Getaways', href: '/getaways' },
      { label: 'Vouchers', href: '/vouchers' },
      { label: 'Package Deals', href: '/packages' },
    ],
  },
  {
    heading: 'Organizers',
    items: [
      { label: 'Sell Tickets', href: '/for-organizers#sell-tickets' },
      { label: 'Promoter Hub', href: '/for-organizers#promoter-hub' },
      { label: 'API Access', href: '/for-organizers#api-access' },
      { label: 'Payouts', href: '/for-organizers#payouts' },
      { label: 'Analytics', href: '/for-organizers#analytics' },
      { label: 'Onboarding', href: '/for-organizers#onboarding' },
    ],
  },
  {
    heading: 'Company',
    items: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Trust & Safety', href: '/trust' },
      { label: 'Partners', href: '/partners' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    heading: 'Support',
    items: [
      { label: 'Help Centre', href: '/help' },
      { label: 'Buyer Protection', href: '/buyer-protection' },
      { label: 'Refunds', href: '/refunds' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  },
];

const PAYMENTS = ['Paystack', 'Flutterwave', 'Verve', 'Mastercard', 'Visa', 'USSD'];

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
                  <Link
                    key={item.label}
                    href={item.href}
                    style={{ fontSize: 13.5, color: 'var(--ink-2)' }}
                  >
                    {item.label}
                  </Link>
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
