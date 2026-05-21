import Link from 'next/link';

export const metadata = {
  title: 'For organizers — Computicket Nigeria',
  description:
    'An event management app like Computicket is essential for modern event planning. It centralizes control, automates ticket sales, and provides real-time analytics — saving you time and maximizing revenue.',
};

const PILLARS = [
  {
    title: 'Centralizes control',
    body: 'Run every event, ticket tier, promo code, refund, and door scan from a single dashboard. Add your team with scoped roles — Owner, Manager, Finance, Marketing, Scanner, Read-only.',
  },
  {
    title: 'Automates ticket sales',
    body: 'Buyers pay with Paystack — cards, bank transfer, USSD, Apple Pay, Google Pay. Inventory holds prevent overselling under load. Funds settle directly to your bank via a Paystack sub-account, minus a transparent commission.',
  },
  {
    title: 'Real-time analytics',
    body: 'Sold counts, gross revenue, and paid-order totals update on every transaction. See per-event performance the moment money lands; refund a buyer and watch capacity free up immediately.',
  },
];

const FEATURES = [
  ['Multi-tier ticketing', 'Unlimited tiers per event, per-tier capacity, scheduled price changes — all from the dashboard.'],
  ['QR ticketing & scanning', 'Tickets ship with signed QR codes; the in-browser scanner at /scan validates them with replay protection at the gate.'],
  ['Refunds in one click', 'Refunds hit Paystack and void the tickets atomically. Replays are idempotent; sold counts roll back so seats can resell.'],
  ['Built-in payouts', 'Connect your bank once. Each transaction routes directly to you minus the platform commission — no monthly settlement runs.'],
  ['Public API & webhooks', 'Per-organizer API keys for server-to-server access, plus signed outbound webhooks for order.paid, order.refunded, ticket.scanned.'],
  ['Built for Nigerian payments', 'NGN-native, kobo-precise accounting, USSD and bank transfer at checkout — designed for how Nigerians actually pay.'],
];

export default function ForOrganizersPage() {
  return (
    <div>
      <section className="bg-brand text-white">
        <div className="max-w-5xl mx-auto px-4 py-20">
          <p className="text-sm uppercase tracking-wide ">For organizers</p>
          <h1 className="mt-3 text-3xl md:text-5xl font-bold leading-tight max-w-3xl">
            An event management app like Computicket is essential for modern event planning.
          </h1>
          <p className="mt-5 text-lg max-w-2xl">
            It centralizes control, automates ticket sales, and provides real-time analytics —
            saving you time and maximizing revenue.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              href="/dashboard/signup"
              className="bg-white text-brand-dark font-medium px-6 py-3 rounded-md hover:bg-gray-100"
            >
              Start selling tickets
            </Link>
            <Link
              href="/dashboard/signin"
              className="border border-white/40 text-white font-medium px-6 py-3 rounded-md hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <ul className="grid md:grid-cols-3 gap-6">
          {PILLARS.map((p) => (
            <li key={p.title} className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold">{p.title}</h2>
              <p className="mt-2 text-gray-700 leading-relaxed">{p.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold">What you get on day one</h2>
          <ul className="mt-8 grid md:grid-cols-2 gap-x-10 gap-y-6">
            {FEATURES.map(([title, body]) => (
              <li key={title}>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-gray-700 mt-1 leading-relaxed">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">Ready to run your next event on Computicket?</h2>
        <p className="mt-3 text-gray-600 max-w-xl mx-auto">
          Sign up free in under a minute. Connect your bank when you&apos;re ready to publish — buyers can&apos;t pay until you do.
        </p>
        <Link
          href="/dashboard/signup"
          className="inline-block mt-6 bg-brand text-white font-medium px-6 py-3 rounded-md hover:bg-brand-dark"
        >
          Create your organizer account
        </Link>
      </section>
    </div>
  );
}
