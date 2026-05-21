import type { Metadata } from 'next';
import { Icon, type IconName } from '@/components/Icon';
import { CategoryHero } from '@/components/marketplace/CategoryHero';
import { SectionHead } from '@/components/marketplace/SectionHead';
import { formatNaira } from '@/lib/design-data';

export const metadata: Metadata = {
  title: 'Gift cards & vouchers — restaurants, spa, travel, shopping',
  description:
    'Send Computicket vouchers to friends in seconds. Redeemable at every event, flight, hotel and partner restaurant.',
};

const CATEGORIES: Array<{ id: string; label: string; sub: string; icon: IconName }> = [
  { id: 'restaurants',  label: 'Restaurants & dining', sub: 'Hard Rock, Quilox, Cactus', icon: 'gift' },
  { id: 'spa',           label: 'Spa & wellness',       sub: 'Anya, Maison Fahrenheit', icon: 'sparkle' },
  { id: 'travel',        label: 'Travel',               sub: 'Use on any flight or bus', icon: 'plane' },
  { id: 'shopping',      label: 'Shopping',             sub: 'Ikoyi, Lekki retail',     icon: 'wallet' },
  { id: 'entertainment', label: 'Entertainment',        sub: 'Any event, any cinema',    icon: 'film' },
  { id: 'computicket',   label: 'Computicket credit',   sub: 'Use anywhere on the app',  icon: 'shield' },
];

const DENOMS = [10000, 25000, 50000, 100000, 250000, 500000];

const FEATURES = [
  { i: 'qr' as const,       t: 'Delivered instantly',  s: 'Sent via email, WhatsApp and SMS within seconds.' },
  { i: 'lock' as const,     t: 'Single-use codes',     s: 'Cryptographically unique. Replay-protected at redemption.' },
  { i: 'wallet' as const,   t: 'Top up the wallet',    s: 'Recipients can load the value straight to their Computicket wallet.' },
  { i: 'refresh' as const,  t: 'Refundable, 12-month',  s: '12-month expiry; refundable to sender for 30 days if unredeemed.' },
];

export default function VouchersPage() {
  return (
    <div className="page-enter">
      <CategoryHero
        eyebrow="Vouchers & gift cards"
        title="The best gift in Nigeria isn't always a gift."
        subtitle="Send Computicket vouchers — for events, flights, stays, or any partner restaurant. Delivered in seconds via email or WhatsApp."
        ph="ph-6"
        primaryCta={{ label: 'Send a voucher', href: '/signup' }}
        secondaryCta={{ label: 'Bulk for corporates', href: '/contact' }}
        badges={[
          { icon: 'gift', label: 'Personalised' },
          { icon: 'send', label: 'Instant delivery' },
        ]}
        preview
      />

      <section className="wrap section-sm">
        <SectionHead
          eyebrow="Where vouchers work"
          title="Spend them anywhere."
          sub="A Computicket voucher is wallet credit. Spend it on a ticket, a stay, a partner dinner — anywhere on the marketplace."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {CATEGORIES.map((c) => (
            <div key={c.id} className="card card-hover" style={{ padding: 22 }}>
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
              <div className="h-4 mt-3">{c.label}</div>
              <div className="text-xs muted mt-1">{c.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap section-sm" style={{ paddingTop: 0 }}>
        <SectionHead
          eyebrow="Denominations"
          title="Pick an amount, write a note."
          sub="Or punch in a custom amount up to ₦5,000,000 for executive gifting."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
          {DENOMS.map((d) => (
            <button
              key={d}
              type="button"
              className="card card-hover"
              style={{
                padding: 22,
                cursor: 'pointer',
                textAlign: 'left',
                background: 'var(--surface)',
              }}
            >
              <div className="eyebrow">Gift</div>
              <div className="h-2 tnum mt-2" style={{ fontSize: 26 }}>
                {formatNaira(d)}
              </div>
              <div className="text-xs muted mt-1">12-month expiry</div>
            </button>
          ))}
        </div>
      </section>

      <section className="wrap section-sm" style={{ paddingTop: 0 }}>
        <SectionHead eyebrow="How it works" title="Three taps, one gift." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {FEATURES.map((f) => (
            <div key={f.t} className="card" style={{ padding: 22 }}>
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
                <Icon name={f.i} size={18} />
              </div>
              <div className="h-4 mt-3" style={{ fontSize: 14 }}>
                {f.t}
              </div>
              <p className="text-xs muted mt-2" style={{ lineHeight: 1.6 }}>
                {f.s}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap section-sm" style={{ paddingTop: 0 }}>
        <div
          className="card"
          style={{
            padding: 32,
            background: 'linear-gradient(135deg, var(--accent-soft), transparent)',
            border: '1px solid oklch(0.68 0.18 152 / .3)',
          }}
        >
          <div className="row gap-3" style={{ alignItems: 'flex-start' }}>
            <span className="ai-dot" style={{ width: 28, height: 28, flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <div className="eyebrow accent-text mb-1">Corporate gifting</div>
              <div className="h-3">100+ vouchers, one invoice.</div>
              <p className="mt-2 muted" style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 640 }}>
                Branded vouchers for staff appreciation, end-of-year bonuses, customer loyalty.
                Volume pricing from ₦25,000 per voucher, optional name personalisation,
                bulk CSV upload.
              </p>
              <a href="/contact" className="btn btn-accent mt-4">
                Talk to corporate sales <Icon name="arrow" size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
