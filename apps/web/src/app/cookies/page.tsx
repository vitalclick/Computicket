import type { Metadata } from 'next';
import { ContentPage, ContentSection } from '@/components/marketplace/ContentPage';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: "How Computicket Nigeria uses cookies and similar technologies.",
};

const LAST_UPDATED = '21 May 2026';

const COOKIES = [
  { name: 'ctng_session',     purpose: 'Authentication & session state',       type: 'First-party', expiry: '30 days' },
  { name: 'ctng_token',       purpose: 'JWT bearer token (localStorage)',      type: 'First-party', expiry: 'Until sign-out' },
  { name: 'ctng_theme',       purpose: 'Light/dark theme preference',          type: 'First-party', expiry: '1 year' },
  { name: 'ctng_analytics',   purpose: 'Anonymous product analytics (PostHog)', type: 'First-party', expiry: '90 days' },
  { name: 'ctng_referrer',    purpose: 'Affiliate / referral tracking',        type: 'First-party', expiry: '30 days' },
  { name: '__paystack_*',      purpose: 'Paystack anti-fraud at checkout',       type: 'Third-party', expiry: 'Session' },
];

export default function CookiesPage() {
  return (
    <ContentPage
      eyebrow="Legal · Cookies"
      title="Cookie Policy"
      subtitle="What we store on your device, why, and how to opt out. We try to keep this list short."
      lastUpdated={LAST_UPDATED}
    >
      <ContentSection title="1. What we use cookies for">
        <p>
          We use cookies and similar storage (localStorage, sessionStorage) for four reasons:
        </p>
        <ul>
          <li><strong>Strictly necessary:</strong> session state, authentication, anti-CSRF tokens.</li>
          <li><strong>Functional:</strong> theme preference, last-used currency, region defaults.</li>
          <li><strong>Analytics:</strong> anonymous, aggregated product usage — entirely self-hosted in NG.</li>
          <li><strong>Anti-fraud (third-party):</strong> Paystack drops a session cookie at checkout for fraud scoring.</li>
        </ul>
        <p>
          We do <strong>not</strong> use third-party advertising cookies. We do not run Google
          Analytics, Facebook Pixel, or any cross-site tracking SDK.
        </p>
      </ContentSection>

      <ContentSection title="2. The full list">
        <div
          className="card"
          style={{ padding: 0, overflow: 'hidden', marginTop: 12 }}
        >
          <div
            style={{
              padding: '14px 22px',
              display: 'grid',
              gridTemplateColumns: '180px minmax(0,1fr) 120px 110px',
              gap: 18,
              background: 'var(--surface-2)',
              borderBottom: '1px solid var(--line)',
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '.16em',
              color: 'var(--ink-3)',
            }}
          >
            <span>Name</span>
            <span>Purpose</span>
            <span>Type</span>
            <span>Expiry</span>
          </div>
          {COOKIES.map((c, i) => (
            <div
              key={c.name}
              style={{
                padding: '14px 22px',
                display: 'grid',
                gridTemplateColumns: '180px minmax(0,1fr) 120px 110px',
                gap: 18,
                alignItems: 'center',
                borderBottom: i < COOKIES.length - 1 ? '1px solid var(--line)' : 'none',
                fontSize: 13.5,
              }}
            >
              <code className="mono" style={{ color: 'var(--ink)' }}>
                {c.name}
              </code>
              <span style={{ color: 'var(--ink-2)' }}>{c.purpose}</span>
              <span className="muted">{c.type}</span>
              <span className="muted mono">{c.expiry}</span>
            </div>
          ))}
        </div>
      </ContentSection>

      <ContentSection title="3. Controlling cookies">
        <p>
          You can clear or block cookies via your browser settings — typically under Settings →
          Privacy. Blocking strictly-necessary cookies will break authentication; everything else
          is safe to clear.
        </p>
        <p>
          To opt out of analytics specifically, toggle{' '}
          <em>&ldquo;Analytics&rdquo;</em> off in{' '}
          <a className="accent-text" href="/account">Account → Preferences</a>.
        </p>
      </ContentSection>

      <ContentSection title="4. Updates">
        <p>
          When we add or change a cookie, we update this page and post a note in the changelog.
          Material changes get an email to registered users.
        </p>
      </ContentSection>

      <ContentSection title="5. Contact">
        <p>
          Questions? Email{' '}
          <a className="accent-text" href="mailto:privacy@computicket.ng">privacy@computicket.ng</a>.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
