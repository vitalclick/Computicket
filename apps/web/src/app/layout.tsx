import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Computicket Nigeria — Tickets, Travel & Experiences',
  description:
    "Nigeria's all-in-one ticketing platform. Book events, concerts, bus travel, flights and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-brand">
              Computicket<span className="text-gray-400">.ng</span>
            </Link>
            <nav className="flex gap-6 text-sm">
              <Link href="/events" className="hover:text-brand">Events</Link>
              <Link href="/buses" className="text-gray-400 cursor-not-allowed">Buses</Link>
              <Link href="/organizers" className="hover:text-brand">For organizers</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
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
