import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { NavAuthLink } from '@/components/Nav';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://computicket.ng';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Computicket Nigeria — Tickets, Travel & Experiences',
    template: '%s · Computicket Nigeria',
  },
  description:
    "Nigeria's all-in-one ticketing platform. Book events, concerts, bus travel, flights and more.",
  applicationName: 'Computicket Nigeria',
  authors: [{ name: 'Computicket Nigeria' }],
  keywords: ['Nigeria', 'tickets', 'events', 'concerts', 'buses', 'flights', 'hotels'],
  openGraph: {
    type: 'website',
    siteName: 'Computicket Nigeria',
    title: 'Computicket Nigeria — Tickets, Travel & Experiences',
    description:
      "Nigeria's all-in-one ticketing platform. Book events, concerts, bus travel, flights and more.",
    locale: 'en_NG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Computicket Nigeria',
    description: "Nigeria's all-in-one ticketing platform.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG">
      <body className="min-h-screen flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-brand-dark focus:px-3 focus:py-1.5 focus:rounded-md focus:shadow"
        >
          Skip to main content
        </a>
        <header className="border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-brand-dark" aria-label="Computicket Nigeria home">
              <Image
                src="/logo.png"
                alt=""
                width={32}
                height={32}
                priority
                className="h-8 w-8 rounded"
              />
              <span>Computicket<span className="text-gray-500">.ng</span></span>
            </Link>
            <nav className="flex gap-6 text-sm items-center" aria-label="Primary">
              <Link href="/events" className="hover:text-brand-dark">Events</Link>
              <Link href="/buses" className="hover:text-brand-dark">Buses</Link>
              <Link href="/for-organizers" className="hover:text-brand-dark">For organizers</Link>
              <NavAuthLink />
            </nav>
          </div>
        </header>
        <main id="main-content" className="flex-1">{children}</main>
        <footer className="border-t border-gray-200 mt-16">
          <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-500 flex justify-between">
            <span>© {new Date().getFullYear()} Computicket Nigeria</span>
            <span>Phase 1 preview</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
