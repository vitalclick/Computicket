import type { Metadata } from 'next';
import { ContentPage, ContentSection } from '@/components/marketplace/ContentPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    "How Computicket Nigeria collects, uses and protects your data. NDPR-compliant.",
};

const LAST_UPDATED = '21 May 2026';

export default function PrivacyPage() {
  return (
    <ContentPage
      eyebrow="Legal · Privacy"
      title="Privacy Policy"
      subtitle="What we collect, why, how long we keep it, and how to ask us to delete it. Written by humans, not by lawyers — but reviewed by both."
      lastUpdated={LAST_UPDATED}
    >
      <p>
        Computicket Nigeria Ltd (&ldquo;Computicket&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is the data controller
        for the information collected through computicket.ng and its mobile apps. We are registered
        with the Nigeria Data Protection Commission (NDPC) and operate in line with the Nigeria
        Data Protection Regulation (NDPR, 2019) and the Nigeria Data Protection Act (NDPA, 2023).
      </p>

      <ContentSection title="1. What we collect">
        <p>We collect three kinds of data:</p>
        <ul>
          <li>
            <strong>You give us:</strong> name, email, phone, payment instrument, and any details
            you add to your account (date of birth, identification documents for organizer KYC,
            payout bank).
          </li>
          <li>
            <strong>We derive:</strong> order history, ticket history, wallet ledger, points
            balance, device fingerprint, IP address, app and browser metadata.
          </li>
          <li>
            <strong>We receive from partners:</strong> payment confirmation from Paystack and
            Flutterwave, identity verification results, fraud signals from upstream rails.
          </li>
        </ul>
      </ContentSection>

      <ContentSection title="2. Why we collect it">
        <p>
          To run the marketplace: process bookings, issue tickets, prevent fraud, settle organizer
          payouts, surface relevant recommendations, comply with our obligations as a regulated
          fintech, and answer support requests. We do not sell your personal data to third parties.
        </p>
      </ContentSection>

      <ContentSection title="3. How long we keep it">
        <p>
          Order, ticket and wallet data are retained for seven years to satisfy financial-reporting
          obligations. Marketing communications, browsing history and recommendation signals are
          retained for two years from your last interaction, or until you delete the account.
          KYC documents are retained while the organizer remains active, and for five years after
          deactivation.
        </p>
      </ContentSection>

      <ContentSection title="4. Who we share it with">
        <p>We share data with:</p>
        <ul>
          <li>Payment processors (Paystack, Flutterwave) to complete and settle transactions.</li>
          <li>Organizers, but only for events you have bought tickets to — name, email and phone for entry verification.</li>
          <li>SMS and email providers (Termii, Postmark) for transactional notifications.</li>
          <li>Regulators, when lawfully required (NDPC, EFCC, NPF) — we respond only to validly served orders.</li>
        </ul>
        <p>
          We do <strong>not</strong> share data with third-party advertising networks or data
          brokers. We never sell personal data.
        </p>
      </ContentSection>

      <ContentSection title="5. Cookies and similar tech">
        <p>
          We use first-party cookies for authentication, session state and theme preferences;
          analytics cookies (PostHog, self-hosted in NG) for product improvement;
          and a single anti-fraud cookie set by Paystack at checkout. We do not run third-party
          advertising trackers. Full detail is in our{' '}
          <a className="accent-text" href="/cookies">Cookie Policy</a>.
        </p>
      </ContentSection>

      <ContentSection title="6. Your rights">
        <p>You have the right to:</p>
        <ul>
          <li>Access a copy of all personal data we hold about you.</li>
          <li>Correct or update any inaccurate data.</li>
          <li>Delete your account and all associated personal data — subject to the seven-year financial-retention obligation.</li>
          <li>Withdraw consent for marketing communications (the &ldquo;Unsubscribe&rdquo; link in every email).</li>
          <li>Object to automated decision-making, including fraud-scoring of your transactions.</li>
          <li>Lodge a complaint with the NDPC.</li>
        </ul>
        <p>
          To exercise any of these, email{' '}
          <a className="accent-text" href="mailto:privacy@computicket.ng">privacy@computicket.ng</a>.
          We respond within 30 days, typically faster.
        </p>
      </ContentSection>

      <ContentSection title="7. Security">
        <p>
          All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Card details never
          touch our infrastructure; Paystack and Flutterwave hold the rails and we hold tokens.
          We are PCI-DSS certified at SAQ-A level. Access to production data is role-gated,
          audit-logged, and reviewed quarterly.
        </p>
      </ContentSection>

      <ContentSection title="8. Where data lives">
        <p>
          Personal data is primarily hosted in Nigeria — AWS af-south-1 (Cape Town) and
          NG-based co-located backup. Some metadata routes through AWS eu-west-1 (Dublin) for
          observability tools (DataDog), under appropriate Standard Contractual Clauses.
        </p>
      </ContentSection>

      <ContentSection title="9. Contact">
        <p>
          Data Protection Officer:{' '}
          <a className="accent-text" href="mailto:dpo@computicket.ng">dpo@computicket.ng</a>
          <br />
          Computicket Nigeria Ltd, Plot 12B, Adeola Odeku St., Victoria Island, Lagos.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
