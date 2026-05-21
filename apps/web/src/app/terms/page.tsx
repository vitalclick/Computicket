import type { Metadata } from 'next';
import { ContentPage, ContentSection } from '@/components/marketplace/ContentPage';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    "The terms you agree to when you book a ticket or sell tickets on Computicket Nigeria.",
};

const LAST_UPDATED = '21 May 2026';

export default function TermsPage() {
  return (
    <ContentPage
      eyebrow="Legal · Terms"
      title="Terms of Service"
      subtitle="The agreement between you and Computicket. Plain language, contract-grade. By using the platform, you agree to these terms."
      lastUpdated={LAST_UPDATED}
    >
      <p>
        These terms govern your use of Computicket Nigeria Ltd&apos;s ticketing marketplace
        (computicket.ng, the mobile apps, the public API, and any branded subdomain).
        &ldquo;You&rdquo; means the buyer, the organizer, or any party using the platform.
      </p>

      <ContentSection title="1. The marketplace, in brief">
        <p>
          Computicket is a multi-vendor marketplace. Buyers purchase tickets, travel and
          experiences. Organizers list events and inventory. We facilitate the transaction,
          handle payments, and provide tooling — including the public site, mobile apps, scanners,
          public API and webhooks.
        </p>
      </ContentSection>

      <ContentSection title="2. Your account">
        <p>
          You must be 18 or older to create an account. You are responsible for keeping your
          credentials safe and for activity on your account. We can suspend accounts that violate
          these terms or applicable law — usually after warning, immediately for severe abuse.
        </p>
      </ContentSection>

      <ContentSection title="3. Buying tickets">
        <p>
          When you buy a ticket you enter into a contract with the listed organizer; Computicket
          processes the payment, issues the ticket and holds the funds in escrow until they are
          earned. Tickets are personal, single-use, and bound to your account. Reselling outside
          our resale marketplace voids the ticket.
        </p>
        <p>
          We back every paid order with{' '}
          <a className="accent-text" href="/buyer-protection">Buyer Protection</a> —
          full terms there.
        </p>
      </ContentSection>

      <ContentSection title="4. Refunds">
        <p>
          Refund eligibility, timing and process are governed by our{' '}
          <a className="accent-text" href="/refunds">Refunds Policy</a>.
          Refunds to wallet are instant; card refunds depend on the issuing bank.
        </p>
      </ContentSection>

      <ContentSection title="5. Organizer obligations">
        <p>If you list events on Computicket, you agree to:</p>
        <ul>
          <li>List accurate event details — venue, date, capacity, age restrictions, refund terms.</li>
          <li>Be the actual organizer or the authorised representative; not list events you have no rights to.</li>
          <li>Complete KYC (CAC, ID, payout bank) before publishing.</li>
          <li>Honour every paid ticket. If you cancel, refund.</li>
          <li>Comply with all applicable safety, licensing and tax obligations.</li>
        </ul>
      </ContentSection>

      <ContentSection title="6. Fees and commissions">
        <p>
          We charge a transparent percentage commission per transaction, agreed with the organizer
          at onboarding (default 7%, configurable). Buyers see a service fee (capped at 3.5%)
          itemised at checkout. We never add surprise fees after the order is placed.
        </p>
      </ContentSection>

      <ContentSection title="7. Wallet, vouchers and loyalty">
        <p>
          Computicket wallet credit, voucher value and loyalty points are non-cash, non-transferable
          and have no intrinsic monetary value. Wallet refunds and voucher redemptions are
          governed by the corresponding feature pages. Wallet balances expire after 24 months of
          inactivity — we email at 18 months as a warning.
        </p>
      </ContentSection>

      <ContentSection title="8. Acceptable use">
        <p>You agree not to:</p>
        <ul>
          <li>Scrape the site or API beyond the limits posted on the API documentation.</li>
          <li>Bot-buy or use automated tools to corner inventory.</li>
          <li>Tamper with the QR ticket format or attempt to clone tickets.</li>
          <li>Impersonate other users, organizers or Computicket staff.</li>
          <li>Use the platform for any unlawful purpose under Nigerian law.</li>
        </ul>
        <p>Violation results in account termination and, where appropriate, escalation to regulators.</p>
      </ContentSection>

      <ContentSection title="9. Intellectual property">
        <p>
          All trademarks, code, design and content on the platform are owned by Computicket or our
          licensors. Organizers retain ownership of their event content; by listing it, they grant
          us a non-exclusive licence to display and promote it on the marketplace.
        </p>
      </ContentSection>

      <ContentSection title="10. Limitation of liability">
        <p>
          To the maximum extent permitted by Nigerian law, our aggregate liability to you for any
          claim related to the platform is limited to the amount you have paid to us in the 12
          months preceding the event giving rise to the claim. We do not exclude liability for
          fraud, death, personal injury, or anything else that cannot be lawfully excluded.
        </p>
      </ContentSection>

      <ContentSection title="11. Disputes">
        <p>
          We&apos;d rather solve a dispute than litigate one. Email{' '}
          <a className="accent-text" href="mailto:legal@computicket.ng">legal@computicket.ng</a> first.
          If unresolved within 30 days, disputes are governed by the laws of the Federal Republic
          of Nigeria and the exclusive jurisdiction of the courts of Lagos State.
        </p>
      </ContentSection>

      <ContentSection title="12. Changes to these terms">
        <p>
          We update these terms occasionally — we&apos;ll email registered users at least 14 days
          before material changes take effect. Continued use after the effective date constitutes
          acceptance.
        </p>
      </ContentSection>

      <ContentSection title="13. Contact">
        <p>
          Computicket Nigeria Ltd, RC 2,847,193.
          <br />
          Plot 12B, Adeola Odeku St., Victoria Island, Lagos.
          <br />
          <a className="accent-text" href="mailto:legal@computicket.ng">legal@computicket.ng</a>
        </p>
      </ContentSection>
    </ContentPage>
  );
}
