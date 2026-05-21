import { Icon, type IconName } from '@/components/Icon';

interface Item {
  icon: IconName;
  title: string;
  sub: string;
}

const ITEMS: Item[] = [
  { icon: 'shield', title: 'Buyer protection',   sub: '100% refund if event cancels' },
  { icon: 'qr',     title: 'Verified QR tickets', sub: 'Anti-fraud at every venue gate' },
  { icon: 'wallet', title: 'Wallet & escrow',     sub: 'NDIC-protected funds' },
  { icon: 'lock',   title: 'Bank-grade security', sub: 'AES-256 · OTP · biometrics' },
  { icon: 'check',  title: '24/7 support',        sub: 'Lagos · Abuja · WhatsApp' },
];

export function TrustStrip() {
  return (
    <section className="wrap" style={{ paddingTop: 32, paddingBottom: 32 }}>
      <div
        className="card"
        style={{ padding: 24, background: 'var(--surface)', borderRadius: 'var(--r-4)' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 32 }}>
          {ITEMS.map((i) => (
            <div key={i.title} className="row gap-3" style={{ alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--r-2)',
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon name={i.icon} size={18} />
              </div>
              <div>
                <div className="h-4" style={{ fontSize: 14 }}>
                  {i.title}
                </div>
                <div className="text-xs muted mt-1">{i.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
