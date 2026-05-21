'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { api, type Me } from '@/lib/api';
import { getToken, signOut } from '@/lib/auth';

/**
 * Cosmic-themed shell that wraps every /dashboard route. Mirrors the
 * organizer-context bar from design/CompuTicket/page-organizer.jsx:
 * brand badge + org name + chevron switcher, then a sticky sub-nav.
 *
 * Auth: every /dashboard page is gated. If there's no token we redirect
 * to /signin?next=<current path>. If the token resolves to a user with
 * no memberships, the org-list (/dashboard) is the only useful place
 * to go — the per-org tabs are visually disabled until they create one.
 */

interface NavTab {
  id: string;
  label: string;
  requiresOrg?: boolean;
  pathFor: (orgSlug: string | null) => string | null;
  isActive: (pathname: string, orgSlug: string | null) => boolean;
}

const TABS: NavTab[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    pathFor: (slug) => (slug ? `/dashboard/o/${slug}` : '/dashboard'),
    isActive: (path, slug) =>
      slug
        ? path === `/dashboard/o/${slug}`
        : path === '/dashboard',
  },
  {
    id: 'bus-routes',
    label: 'Bus routes',
    requiresOrg: true,
    pathFor: (slug) => (slug ? `/dashboard/o/${slug}/bus-routes` : null),
    isActive: (path, slug) =>
      Boolean(slug) && path.startsWith(`/dashboard/o/${slug}/bus-routes`),
  },
  {
    id: 'scan',
    label: 'Scan',
    pathFor: () => '/scan',
    isActive: (path) => path.startsWith('/scan'),
  },
  {
    id: 'team',
    label: 'Staff',
    requiresOrg: true,
    pathFor: (slug) => (slug ? `/dashboard/o/${slug}/team` : null),
    isActive: (path, slug) => Boolean(slug) && path.startsWith(`/dashboard/o/${slug}/team`),
  },
  {
    id: 'payouts',
    label: 'Payouts',
    requiresOrg: true,
    pathFor: (slug) => (slug ? `/dashboard/o/${slug}/payouts` : null),
    isActive: (path, slug) => Boolean(slug) && path.startsWith(`/dashboard/o/${slug}/payouts`),
  },
  {
    id: 'analytics',
    label: 'Reports',
    requiresOrg: true,
    pathFor: (slug) => (slug ? `/dashboard/o/${slug}/analytics` : null),
    isActive: (path, slug) => Boolean(slug) && path.startsWith(`/dashboard/o/${slug}/analytics`),
  },
  {
    id: 'promo-codes',
    label: 'Promos',
    requiresOrg: true,
    pathFor: (slug) => (slug ? `/dashboard/o/${slug}/promo-codes` : null),
    isActive: (path, slug) =>
      Boolean(slug) && path.startsWith(`/dashboard/o/${slug}/promo-codes`),
  },
  {
    id: 'developers',
    label: 'Developers',
    requiresOrg: true,
    pathFor: (slug) => (slug ? `/dashboard/o/${slug}/developers` : null),
    isActive: (path, slug) =>
      Boolean(slug) && path.startsWith(`/dashboard/o/${slug}/developers`),
  },
];

// The /dashboard/signin and /dashboard/signup routes are server-side
// redirects to the global /signin and /signup pages, so they should
// render passthrough (no auth check, no chrome).
const NO_CHROME_PATHS = new Set(['/dashboard/signin', '/dashboard/signup']);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/dashboard';
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [authState, setAuthState] = useState<'loading' | 'ok' | 'unauth'>('loading');
  const [error, setError] = useState<string | null>(null);

  const orgSlug = extractOrgSlug(pathname);
  const showChrome = !NO_CHROME_PATHS.has(pathname);

  useEffect(() => {
    if (!showChrome) {
      setAuthState('ok');
      return;
    }
    const token = getToken();
    if (!token) {
      router.replace(`/signin?next=${encodeURIComponent(pathname)}`);
      setAuthState('unauth');
      return;
    }
    api
      .me(token)
      .then((m) => {
        setMe(m);
        setAuthState('ok');
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Failed to load');
        router.replace(`/signin?next=${encodeURIComponent(pathname)}`);
        setAuthState('unauth');
      });
  }, [router, pathname, showChrome]);

  if (!showChrome) return <>{children}</>;

  if (authState === 'loading') {
    return (
      <div className="wrap" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <p className="muted">Loading dashboard…</p>
      </div>
    );
  }
  if (authState === 'unauth') return null;

  const currentMembership =
    orgSlug && me ? me.memberships.find((m) => m.organizer.slug === orgSlug) : null;
  const displayOrgName =
    currentMembership?.organizer.name ??
    me?.memberships[0]?.organizer.name ??
    'Choose organizer';
  const resolvedSlug =
    orgSlug ?? me?.memberships[0]?.organizer.slug ?? null;

  return (
    <div>
      {/* Org context bar */}
      <div style={{ background: 'var(--bg-deep)', borderBottom: '1px solid var(--line)' }}>
        <div
          className="wrap"
          style={{ display: 'flex', alignItems: 'center', height: 56, gap: 24 }}
        >
          <OrgSwitcher me={me} currentSlug={orgSlug} displayName={displayOrgName} />
          <div style={{ flex: 1 }} />
          <Link href="/help" className="btn btn-ghost btn-sm">
            Help
          </Link>
          {resolvedSlug ? (
            <Link
              href={`/dashboard/o/${resolvedSlug}#new-event`}
              className="btn btn-accent btn-sm"
            >
              <Icon name="plus" size={13} /> Create event
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => {
              signOut();
              router.replace('/');
            }}
            className="btn btn-ghost btn-sm"
            style={{ padding: '8px 12px' }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Sticky sub-nav */}
      <div
        style={{
          background: 'var(--bg-deep)',
          borderBottom: '1px solid var(--line)',
          position: 'sticky',
          top: 'var(--nav-h)',
          zIndex: 30,
          backdropFilter: 'blur(20px) saturate(140%)',
          WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        }}
      >
        <div className="wrap">
          <nav
            aria-label="Organizer navigation"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 0,
              overflowX: 'auto',
            }}
          >
            {TABS.map((tab) => {
              const href = tab.pathFor(resolvedSlug);
              const isActive = tab.isActive(pathname, resolvedSlug);
              const disabled = tab.requiresOrg && !resolvedSlug;
              const styleProps: React.CSSProperties = {
                padding: '14px 16px',
                marginRight: 4,
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                color: disabled
                  ? 'var(--ink-4)'
                  : isActive
                    ? 'var(--ink)'
                    : 'var(--ink-3)',
                borderBottom: isActive
                  ? '2px solid var(--accent)'
                  : '2px solid transparent',
                whiteSpace: 'nowrap',
                cursor: disabled ? 'not-allowed' : 'pointer',
                textDecoration: 'none',
              };
              if (disabled || !href) {
                return (
                  <span key={tab.id} aria-disabled="true" style={styleProps}>
                    {tab.label}
                  </span>
                );
              }
              return (
                <Link key={tab.id} href={href} style={styleProps}>
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {error ? (
        <div className="wrap" style={{ paddingTop: 16 }}>
          <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>
        </div>
      ) : null}

      {children}
    </div>
  );
}

function extractOrgSlug(pathname: string): string | null {
  const m = pathname.match(/^\/dashboard\/o\/([^/]+)/);
  return m?.[1] ?? null;
}

function OrgSwitcher({
  me,
  currentSlug,
  displayName,
}: {
  me: Me | null;
  currentSlug: string | null;
  displayName: string;
}) {
  const [open, setOpen] = useState(false);
  const memberships = me?.memberships ?? [];
  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        className="row gap-2"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{
          alignItems: 'center',
          background: 'transparent',
          border: 0,
          padding: '6px 8px',
          borderRadius: 'var(--r-2)',
          cursor: 'pointer',
          color: 'inherit',
        }}
      >
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 'var(--r-1)',
            background:
              'linear-gradient(135deg, var(--accent), oklch(0.55 0.18 180))',
            display: 'inline-block',
          }}
          aria-hidden="true"
        />
        <span className="fw-600">{displayName}</span>
        <Icon name="chevronDown" size={13} />
      </button>
      {open ? (
        <div
          role="menu"
          aria-label="Switch organizer"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 40,
            background: 'var(--surface)',
            border: '1px solid var(--line-strong)',
            borderRadius: 'var(--r-3)',
            boxShadow: 'var(--shadow-lg)',
            padding: 8,
            minWidth: 240,
          }}
          onMouseLeave={() => setOpen(false)}
        >
          {memberships.length === 0 ? (
            <p
              className="text-xs muted"
              style={{ padding: '8px 12px', lineHeight: 1.55 }}
            >
              No organizers yet — head to the dashboard to create one.
            </p>
          ) : (
            memberships.map((m) => {
              const isCurrent = m.organizer.slug === currentSlug;
              return (
                <Link
                  key={m.organizer.id}
                  href={`/dashboard/o/${m.organizer.slug}`}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 'var(--r-2)',
                    background: isCurrent ? 'var(--accent-soft)' : 'transparent',
                    color: isCurrent ? 'var(--accent)' : 'var(--ink)',
                    fontSize: 13,
                    fontWeight: isCurrent ? 600 : 500,
                    textDecoration: 'none',
                  }}
                >
                  {isCurrent ? (
                    <Icon name="check" size={13} stroke={2.5} />
                  ) : (
                    <span style={{ width: 13 }} />
                  )}
                  <span style={{ flex: 1 }}>{m.organizer.name}</span>
                  <span className="text-xs muted">{m.role}</span>
                </Link>
              );
            })
          )}
          <div className="hr" style={{ margin: '8px 0' }} />
          <Link
            href="/dashboard"
            role="menuitem"
            onClick={() => setOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 12px',
              borderRadius: 'var(--r-2)',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--ink)',
              textDecoration: 'none',
            }}
          >
            <Icon name="plus" size={13} />
            <span>New organizer</span>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
