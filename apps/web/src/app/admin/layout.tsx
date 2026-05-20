import Link from 'next/link';

export const metadata = {
  title: 'Admin — Computicket Nigeria',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin" className="font-bold">
            Computicket<span className="text-gray-400">.ng</span>{' '}
            <span className="ml-1 text-xs uppercase tracking-wide text-amber-300">Admin</span>
          </Link>
          <Link href="/" className="text-sm text-gray-300 hover:text-white">Public site →</Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
