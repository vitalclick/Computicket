import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-brand-dark">
            Computicket<span className="text-gray-500">.ng</span>{' '}
            <span className="ml-1 text-xs font-medium uppercase tracking-wide text-gray-500">Organizer</span>
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-brand-dark">View public site →</Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
