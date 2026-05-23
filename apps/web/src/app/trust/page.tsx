import type { Metadata } from 'next';
import {
  ContentBlock,
  ContentCTA,
  ContentHero,
  ContentSubNav,
  FAQBlock,
  PillarsBlock,
  StatsStrip,
} from '@/components/marketplace/Editorial';

export const metadata: Metadata = {
  title: 'Trust & Safety — Computicket Nigeria',
  description:
    'Your booking is protected end-to-end. Every payment is insured, every ticket is QR-verified, every refund is guaranteed.',
};

export default function TrustPage() {
  return (
    <div className="page-enter">
      <ContentSubNav group="company" active="trust" />

      <ContentHero
        eyebrow="Trust & Safety"
        title="Your booking is protected end-to-end."
        lede="Every payment is insured, every ticket is QR-verified, every refund is guaranteed. Here's exactly how we keep your money, your data, and your night out safe."
      />

      <StatsStrip
        stats={[
          { n: '₦0',      l: 'Lost to fraud in 2025' },
          { n: '<48h',    l: 'Median refund time' },
          { n: 'AES-256', l: 'Encryption at rest & transit' },
          { n: '24/7',    l: 'WhatsApp support response' },
        ]}
      />

      <PillarsBlock
        eyebrow="Six layers of protection"
        title="Defence in depth — from your phone to the venue gate."
        cols={3}
        pillars={[
          {
            icon: 'shield',
            title: 'Buyer Protection',
            body:
              '100% refund if an event is cancelled or significantly changed. No questions asked, no forms to fill — just one tap in your wallet.',
            color: 'oklch(0.62 0.18 152)',
          },
          {
            icon: 'qr',
            title: 'Verified QR tickets',
            body:
              "Each ticket carries a rotating, device-bound QR. Scalpers can't duplicate it. Bots can't farm it. Every scan is logged in real time.",
            color: 'oklch(0.60 0.16 230)',
          },
          {
            icon: 'lock',
            title: 'Bank-grade payments',
            body:
              'PCI-DSS Level 1 certified. 3-D Secure on every card. OTP and biometric verification. Nothing leaves your phone unencrypted.',
            color: 'oklch(0.65 0.15 75)',
          },
          {
            icon: 'wallet',
            title: 'Escrow & NDIC cover',
            body:
              "Organizer payouts sit in NDIC-insured escrow until the event delivers. Your money is never co-mingled with anyone's runway.",
            color: 'oklch(0.55 0.18 305)',
          },
          {
            icon: 'check',
            title: 'NDPR compliant',
            body:
              'We are registered with the Nigerian Data Protection Bureau. Your data is yours — we never sell it, and you can export or delete it anytime.',
            color: 'oklch(0.62 0.14 200)',
          },
          {
            icon: 'sparkle',
            title: 'AI fraud sentinel',
            body:
              'Compass watches every transaction in real time. Suspicious patterns are flagged in under 200ms — without slowing legitimate buyers.',
            color: 'oklch(0.65 0.20 25)',
          },
        ]}
      />

      <ContentBlock
        eyebrow="Buyer Protection"
        title="If your event cancels, we refund — instantly."
        image="ph-3"
        imageCaption="QR ticket vault · Compass app"
        body={
          <>
            <p>
              You should never have to chase a refund. When an organizer cancels or significantly
              changes an event, we automatically credit your Computicket wallet within 48 hours —
              usually within minutes.
            </p>
            <p className="mt-4">
              <strong>What&apos;s covered:</strong> Full ticket value, including service fees and
              VAT. Travel and hotel bookings purchased through Computicket bundles are covered up
              to ₦500,000.
            </p>
            <p className="mt-4">
              <strong>What&apos;s not:</strong> Personal change-of-mind. Acts of God impacting
              individual ticket use (we recommend the optional ₦600 travel insurance add-on at
              checkout).
            </p>
          </>
        }
      />

      <ContentBlock
        eyebrow="Reporting & response"
        title="A real human responds in under 5 minutes — on WhatsApp."
        imagePosition="left"
        image="ph-4"
        imageCaption="Trust & Safety operations · Lagos"
        body={
          <>
            <p>
              We staff our Trust &amp; Safety operations 24/7 across Lagos and Abuja. Report a
              problem via the in-app shield icon, WhatsApp <span className="mono">+234 802
              COMPASS</span>, or email <span className="mono">trust@computicket.ng</span>.
            </p>
            <p className="mt-4">
              Our median first-response time on WhatsApp is 4 minutes 20 seconds. Median resolution
              time is 12 hours for ticket issues, 48 hours for refund cases.
            </p>
            <p className="mt-4">
              If we cannot resolve your issue, the Lagos State Consumer Protection Council and the
              FCCPC have escalation paths we proactively support.
            </p>
          </>
        }
      />

      <FAQBlock
        eyebrow="Frequently asked"
        title="Common questions about safety."
        items={[
          {
            q: 'How do I know a ticket is real?',
            a: (
              <>
                Every Computicket ticket has a rotating QR that only validates against our server
                in real time. If you bought outside Computicket, look for the green verification
                badge in the wallet — if it&apos;s missing, the ticket is not legitimate.
                We&apos;ll never charge you to &ldquo;verify&rdquo; a ticket.
              </>
            ),
          },
          {
            q: "What happens if my QR doesn't scan at the gate?",
            a: (
              <>
                Open your ticket in the app — the QR auto-refreshes every 30 seconds. If it still
                won&apos;t scan, the gate staff have a backup lookup via your phone number. Worst
                case, our 24/7 WhatsApp line will release a one-time bypass code in under 60
                seconds.
              </>
            ),
          },
          {
            q: 'Are organizer payouts safe?',
            a: (
              <>
                Yes. All organizer revenue sits in NDIC-insured escrow with Wema Bank until the
                event delivers. Payouts release automatically 24 hours after gates close, after we
                reconcile scan counts. This protects buyers from fly-by-night operators.
              </>
            ),
          },
          {
            q: 'How is my personal data used?',
            a: (
              <>
                We use your data only to power your bookings and personalisation. We never sell it.
                You can export everything we hold on you from Settings → Privacy → Export, and
                delete your account permanently from the same screen. We are registered with the
                NDPB (registration #NDPB-2023-04812).
              </>
            ),
          },
          {
            q: "What if I'm scammed off-platform?",
            a: (
              <>
                If someone sells you a ticket via DM, WhatsApp or social media claiming it&apos;s a
                Computicket ticket — it almost certainly isn&apos;t. Send us a screenshot via the
                in-app shield and we&apos;ll investigate. Note: tickets bought off-platform
                aren&apos;t covered by Buyer Protection.
              </>
            ),
          },
        ]}
      />

      <ContentCTA
        eyebrow="Report something"
        title="See something off? Tell us in one tap."
        sub="Suspicious organizer, fake ticket on social media, account compromise — we move fast and we keep you informed every step."
        primary={{ label: 'Report on WhatsApp', href: '/contact' }}
        secondary={{ label: 'Email Trust & Safety', href: 'mailto:trust@computicket.ng' }}
      />
    </div>
  );
}
