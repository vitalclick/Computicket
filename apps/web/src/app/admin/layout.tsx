import Link from 'next/link';
import { Icon } from '@/components/Icon';

export const metadata = {
  title: 'Admin — Computicket Nigeria',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          background: 'var(--bg-deep)',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <div
          className="wrap"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 56,
            gap: 16,
          }}
        >
          <div className="row gap-4" style={{ alignItems: 'center' }}>
            <Link
              href="/admin"
              className="row gap-2"
              style={{ alignItems: 'center', textDecoration: 'none', fontWeight: 600 }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 'var(--r-1)',
                  background:
                    'linear-gradient(135deg, oklch(0.80 0.16 75), oklch(0.65 0.22 25))',
                }}
              />
              <span>Computicket Admin</span>
            </Link>
            <nav
              aria-label="Admin sections"
              className="row gap-1 desktop-only"
              style={{ alignItems: 'center' }}
            >
              <Link href="/admin" className="chip">
                Organizers
              </Link>
              <Link href="/admin/audit-log" className="chip">
                Audit log
              </Link>
            </nav>
          </div>
          <Link
            href="/"
            className="row gap-1 text-sm muted"
            style={{ alignItems: 'center', textDecoration: 'none' }}
          >
            Public site
            <Icon name="arrow" size={12} />
          </Link>
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}
