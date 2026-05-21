import type { Metadata } from 'next';
import { Bricolage_Grotesque, Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { THEME_INIT_SCRIPT } from '@/components/ThemeToggle';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://computicket.ng';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bricolage',
  display: 'swap',
});
const geist = Geist({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-geist',
  display: 'swap',
});
const geistMono = Geist_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-geist-mono',
  display: 'swap',
});
const instrument = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument',
  display: 'swap',
});

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
  const fontClasses = `${bricolage.variable} ${geist.variable} ${geistMono.variable} ${instrument.variable}`;
  return (
    <html
      lang="en-NG"
      data-theme="light"
      data-accent="naija"
      data-density="comfortable"
      className={fontClasses}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="shell" style={{ display: 'flex', flexDirection: 'column' }}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-brand-dark focus:px-3 focus:py-1.5 focus:rounded-md focus:shadow"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main-content" style={{ flex: 1 }}>
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
