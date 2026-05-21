import { Icon } from '@/components/Icon';

export function AppPromo() {
  return (
    <section className="wrap section">
      <div
        className="card"
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: 0,
          background: 'linear-gradient(135deg, oklch(0.16 0.10 152), oklch(0.14 0.10 180))',
          border: '1px solid oklch(1 0 0 / .08)',
        }}
      >
        <div className="stars" style={{ opacity: 0.6 }} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)',
            gap: 0,
            position: 'relative',
          }}
        >
          <div style={{ padding: '64px 56px' }}>
            <div className="eyebrow mb-4" style={{ color: 'var(--accent)' }}>
              The mobile experience
            </div>
            <h2 className="h-1" style={{ fontSize: 56, color: 'white', margin: 0 }}>
              Your tickets live in your pocket — even{' '}
              <span className="serif" style={{ color: 'var(--accent)' }}>
                offline
              </span>
              .
            </h2>
            <p
              style={{
                color: 'oklch(1 0 0 / .75)',
                fontSize: 16,
                maxWidth: 480,
                marginTop: 24,
                lineHeight: 1.6,
              }}
            >
              Cached QR codes that scan without signal. Wallet-grade encryption. Apple Pay, Verve,
              USSD. Built for Naija data realities — works fluidly on 2G.
            </p>
            <div className="row mt-8 gap-3">
              <button type="button" className="btn btn-glass btn-lg" style={{ color: 'white' }}>
                App Store
              </button>
              <button type="button" className="btn btn-glass btn-lg" style={{ color: 'white' }}>
                Google Play
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-lg"
                style={{ color: 'white', borderColor: 'oklch(1 0 0 / .2)' }}
              >
                Get SMS link
              </button>
            </div>
            <div
              className="row mt-6 gap-4"
              style={{ color: 'oklch(1 0 0 / .7)', fontSize: 13 }}
            >
              <span>
                <Icon name="star" size={13} /> 4.9 · App Store
              </span>
              <span>·</span>
              <span>4.8 · Google Play</span>
              <span>·</span>
              <span>240k downloads in Nigeria</span>
            </div>
          </div>
          <div style={{ position: 'relative', minHeight: 480 }}>
            <div
              className="ph ph-4"
              style={{
                position: 'absolute',
                right: 60,
                top: 40,
                width: 240,
                height: 480,
                borderRadius: 36,
                border: '8px solid oklch(0 0 0 / .8)',
                boxShadow: '0 40px 80px -20px oklch(0 0 0 / .8)',
              }}
            >
              <div
                className="ph-noise"
                style={{ position: 'absolute', inset: 0, borderRadius: 28 }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  padding: 24,
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div className="row gap-2">
                  <Icon name="qr" size={18} />{' '}
                  <span className="mono text-xs">TICKET · 1 OF 2</span>
                </div>
                <div>
                  <div className="serif" style={{ fontSize: 24 }}>
                    Asake · Lungu Boy
                  </div>
                  <div
                    className="text-xs muted"
                    style={{ color: 'oklch(1 0 0 / .7)' }}
                  >
                    Tafawa Balewa Square · Sun 07 Jun
                  </div>
                </div>
              </div>
            </div>
            <div
              className="card glass"
              style={{
                position: 'absolute',
                left: 20,
                top: 80,
                padding: 14,
                width: 200,
                transform: 'rotate(-4deg)',
              }}
            >
              <div className="row gap-2">
                <span className="ai-dot" style={{ width: 18, height: 18 }} />
                <span className="text-xs fw-600">Compass tip</span>
              </div>
              <div
                className="text-xs muted mt-2"
                style={{ lineHeight: 1.5 }}
              >
                Doors open 90 min before. Park at Lot 3 for ₦2k flat.
              </div>
            </div>
            <div
              className="card glass"
              style={{
                position: 'absolute',
                right: 30,
                bottom: 60,
                padding: 14,
                width: 180,
                transform: 'rotate(3deg)',
              }}
            >
              <div className="row gap-2">
                <Icon name="shield" size={14} />
                <span className="text-xs fw-600">Verified at gate</span>
              </div>
              <div className="text-xs muted mt-2">QR scanned · Welcome, Adaeze</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
