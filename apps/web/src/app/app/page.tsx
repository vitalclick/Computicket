import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = {
  title: 'Get the app',
  description:
    'Computicket Nigeria for iOS and Android. Faster checkout with Face ID, offline boarding passes, and live event alerts.',
  alternates: { canonical: '/app' },
};

const FEATURES: Array<{ icon: 'bolt' | 'qr' | 'shield' | 'bell' | 'wallet' | 'sparkle'; title: string; body: string }> = [
  {
    icon: 'bolt',
    title: 'Checkout in one tap',
    body: 'Saved cards, biometric auth, USSD fallback. Most purchases finish in under 12 seconds.',
  },
  {
    icon: 'qr',
    title: 'Tickets work offline',
    body: 'Boarding passes cache to your device so spotty venue Wi-Fi never blocks the gate.',
  },
  {
    icon: 'bell',
    title: 'Live event alerts',
    body: 'Gate openings, weather changes, set-list shuffles. Opt in per event — silent by default.',
  },
  {
    icon: 'wallet',
    title: 'Wallet & rewards',
    body: 'Top up once, pay anywhere on Computicket. Earn Compass points on every booking.',
  },
  {
    icon: 'shield',
    title: 'Buyer protection',
    body: 'Refunds for cancelled events, fraud cover on every order, NDPR-safe by default.',
  },
  {
    icon: 'sparkle',
    title: 'Compass picks',
    body: 'AI suggestions that learn from what you actually attend — not what you scrolled past.',
  },
];

export default function GetTheAppPage() {
  return (
    <div className="page-enter">
      <section className="nebula" style={{ position: 'relative', overflow: 'hidden' }}>
        <div
          className="wrap"
          style={{
            position: 'relative',
            paddingTop: 80,
            paddingBottom: 64,
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) 320px',
            gap: 48,
            alignItems: 'center',
          }}
        >
          <div>
            <div className="eyebrow mb-3">Computicket mobile</div>
            <h1 className="h-1" style={{ margin: '0 0 18px', maxWidth: 720 }}>
              <span className="text-gradient">Every ticket. Every event.</span>
              <br />
              <span className="serif" style={{ fontSize: '0.92em', color: 'var(--ink-2)' }}>
                in your pocket.
              </span>
            </h1>
            <p
              style={{
                fontSize: 17,
                color: 'var(--ink-2)',
                maxWidth: 580,
                lineHeight: 1.6,
              }}
            >
              The Computicket app pairs Face ID checkout with offline-first boarding
              passes, so the only thing you bring to the gate is your phone. Built for
              Nigeria — Verve, USSD, slow networks, all handled.
            </p>
            <div className="row gap-3 mt-6" style={{ flexWrap: 'wrap' }}>
              <a
                href="https://apps.apple.com/ng/app/computicket"
                className="btn store-badge"
                aria-label="Download on the App Store"
              >
                <Icon name="play" size={16} />
                <span className="col" style={{ gap: 0, alignItems: 'flex-start' }}>
                  <span className="text-xs muted" style={{ lineHeight: 1 }}>
                    Download on the
                  </span>
                  <span className="fw-600" style={{ lineHeight: 1.2 }}>
                    App Store
                  </span>
                </span>
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=ng.computicket.app"
                className="btn store-badge"
                aria-label="Get it on Google Play"
              >
                <Icon name="play" size={16} />
                <span className="col" style={{ gap: 0, alignItems: 'flex-start' }}>
                  <span className="text-xs muted" style={{ lineHeight: 1 }}>
                    Get it on
                  </span>
                  <span className="fw-600" style={{ lineHeight: 1.2 }}>
                    Google Play
                  </span>
                </span>
              </a>
            </div>
            <div className="row gap-3 mt-6" style={{ flexWrap: 'wrap', color: 'var(--ink-3)' }}>
              <span className="row gap-1" style={{ alignItems: 'center', fontSize: 13 }}>
                <Icon name="star" size={13} /> 4.8 average · 12,400+ ratings
              </span>
              <span className="row gap-1" style={{ alignItems: 'center', fontSize: 13 }}>
                <Icon name="shield" size={13} /> NDPR-compliant
              </span>
            </div>
          </div>

          <div className="app-phone-mock" aria-hidden="true">
            <div className="app-phone-frame">
              <div className="app-phone-notch" />
              <div className="app-phone-screen ph ph-1 ph-noise">
                <div className="app-phone-overlay" />
                <div className="app-phone-content">
                  <div className="eyebrow" style={{ color: 'oklch(1 0 0 / .8)' }}>
                    SUN 07 JUN · LAGOS
                  </div>
                  <div className="serif" style={{ fontSize: 22, lineHeight: 1.05, marginTop: 6 }}>
                    Asake — Lungu Boy Tour
                  </div>
                  <div className="app-phone-row">
                    <span className="app-phone-pill">
                      <Icon name="qr" size={11} /> Ready
                    </span>
                    <span className="app-phone-pill">
                      <Icon name="shield" size={11} /> Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap" style={{ paddingTop: 56, paddingBottom: 56, maxWidth: 1240 }}>
        <div className="eyebrow mb-3">What you get</div>
        <h2 className="h-2" style={{ margin: 0, maxWidth: 720 }}>
          Designed for the way Nigerians actually book.
        </h2>
        <div
          className="mt-8"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}
        >
          {FEATURES.map((f) => (
            <article key={f.title} className="card" style={{ padding: 22 }}>
              <span
                aria-hidden="true"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--r-2)',
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Icon name={f.icon} size={17} />
              </span>
              <h3 className="h-4 mt-3" style={{ fontSize: 16 }}>
                {f.title}
              </h3>
              <p className="text-sm muted mt-2" style={{ lineHeight: 1.6 }}>
                {f.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="wrap" style={{ paddingTop: 32, paddingBottom: 96, maxWidth: 1240 }}>
        <div
          className="card"
          style={{
            padding: 40,
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)',
            gap: 32,
            alignItems: 'center',
            background: 'linear-gradient(135deg, var(--accent-soft), oklch(0.55 0.18 180 / .15))',
            border: '1px solid var(--accent)',
          }}
        >
          <div>
            <div className="eyebrow mb-3">Heads-up</div>
            <h2 className="h-3" style={{ margin: 0 }}>
              Compass — your AI concierge — lives in the app.
            </h2>
            <p className="text-sm mt-3" style={{ color: 'var(--ink-2)', lineHeight: 1.65 }}>
              Ask &ldquo;what&apos;s near my Burna Boy show?&rdquo; and Compass pulls a
              hotel pick, an Uber estimate, and a 7pm dinner — all bookable in one
              flow. Try it on the web too — opens in any signed-in browser.
            </p>
            <Link
              href="/support"
              className="btn btn-accent mt-5"
              style={{ display: 'inline-flex' }}
            >
              Try Compass on web <Icon name="arrow" size={13} />
            </Link>
          </div>
          <ul
            className="col gap-2"
            style={{ listStyle: 'none', margin: 0, padding: 0 }}
          >
            {['"Where is my QR for Sunday?"', '"Refund my Davido tickets."', '"Find me a hotel near the venue."'].map((q) => (
              <li
                key={q}
                style={{
                  padding: 12,
                  background: 'var(--surface)',
                  borderRadius: 'var(--r-3)',
                  border: '1px solid var(--line)',
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontSize: 15,
                  color: 'var(--ink-2)',
                }}
              >
                {q}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
