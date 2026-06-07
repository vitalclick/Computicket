'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from './Icon';

interface Tab {
  id: string;
  label: string;
  href: string;
  icon: IconName;
  match: (path: string) => boolean;
}

const TABS: Tab[] = [
  {
    id: 'discover',
    label: 'Discover',
    href: '/',
    icon: 'sparkle',
    match: (p) => p === '/',
  },
  {
    id: 'explore',
    label: 'Explore',
    href: '/events',
    icon: 'search',
    match: (p) =>
      p.startsWith('/events') ||
      p.startsWith('/concerts') ||
      p.startsWith('/cinema') ||
      p.startsWith('/theatre') ||
      p.startsWith('/festivals') ||
      p.startsWith('/experiences') ||
      p.startsWith('/flights') ||
      p.startsWith('/buses') ||
      p.startsWith('/hotels') ||
      p.startsWith('/getaways'),
  },
  {
    id: 'compass',
    label: 'Compass',
    href: '/support',
    icon: 'sparkle',
    match: (p) => p.startsWith('/support') || p.startsWith('/help'),
  },
  {
    id: 'tickets',
    label: 'Tickets',
    href: '/account?tab=tickets',
    icon: 'qr',
    match: (p) => p.startsWith('/tickets'),
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/account',
    icon: 'user',
    match: (p) => p.startsWith('/account') || p.startsWith('/dashboard'),
  },
];

const HIDDEN_PREFIXES = [
  '/checkout',
  '/scan',
  '/dashboard',
  '/admin',
  '/signin',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/oauth',
];

export function MobileTabBar() {
  const pathname = usePathname() ?? '/';
  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p) && pathname !== '/')) {
    return null;
  }

  return (
    <nav className="mobile-tabbar" aria-label="Primary mobile navigation">
      {TABS.map((t) => {
        const active = t.match(pathname);
        return (
          <Link
            key={t.id}
            href={t.href}
            aria-current={active ? 'page' : undefined}
            className={`mobile-tab ${active ? 'active' : ''}`}
          >
            {t.id === 'compass' ? (
              <span className="mobile-tab-compass-dot" aria-hidden="true" />
            ) : (
              <Icon name={t.icon} size={22} stroke={active ? 2.2 : 1.7} />
            )}
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
