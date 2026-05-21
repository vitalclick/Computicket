import Link from 'next/link';

export const metadata = {
  title: 'Admin — Computicket Nigeria',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-bold">
              Computicket<span className="text-gray-400">.ng</span>{' '}
              <span className="ml-1 text-xs uppercase tracking-wide text-amber-300">Admin</span>
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-sm">
              <Link href="/admin" className="text-gray-300 hover:text-white">Organizers</Link>
              <Link href="/admin/audit-log" className="text-gray-300 hover:text-white">Audit log</Link>
            </nav>
          </div>
          <Link href="/" className="text-sm text-gray-300 hover:text-white">Public site →</Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
