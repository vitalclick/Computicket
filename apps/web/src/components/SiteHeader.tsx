'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getToken } from '@/lib/auth';
import { Icon } from './Icon';
import { ThemeToggle } from './ThemeToggle';
import { Wordmark } from './Wordmark';

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setSignedIn(Boolean(getToken()));
    const sync = () => setSignedIn(Boolean(getToken()));
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: scrolled ? '1px solid var(--line)' : '1px solid transparent',
        background: scrolled ? 'color-mix(in oklch, var(--bg-void) 78%, transparent)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(140%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(140%)' : 'none',
        transition: 'all .25s',
      }}
    >
      <div
        className="wrap"
        style={{ display: 'flex', alignItems: 'center', gap: 14, height: 'var(--nav-h)' }}
      >
        <Link href="/" style={{ flexShrink: 0, marginRight: 18 }} aria-label="Computicket Nigeria home">
          <Wordmark />
        </Link>

        <button
          type="button"
          className="btn btn-glass btn-sm"
          style={{ flexShrink: 0, padding: '8px 14px' }}
        >
          <Icon name="pin" size={14} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>Lagos</span>
          <Icon name="chevronDown" size={12} />
        </button>

        <nav
          aria-label="Primary"
          style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 8, flexShrink: 0 }}
        >
          {(
            [
              { label: 'Events', href: '/events' },
              { label: 'Concerts', href: '/concerts' },
              { label: 'Travel', href: '/flights' },
              { label: 'Stays', href: '/hotels' },
            ] as const
          ).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink-2)' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div style={{ flex: 1, minWidth: 0 }} />

        <Link
          href="/events"
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 16px',
            borderRadius: 'var(--r-pill)',
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            color: 'var(--ink-3)',
            whiteSpace: 'nowrap',
            transition: 'all .15s',
          }}
        >
          <Icon name="search" size={15} />
          <span style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>
            Search events, flights, stays…
          </span>
          <span
            className="mono text-xs muted-2"
            style={{ paddingLeft: 8, borderLeft: '1px solid var(--line)' }}
          >
            ⌘K
          </span>
        </Link>

        <Link href="/for-organizers" className="org-pill" title="Promoter Hub" style={{ flexShrink: 0 }}>
          <span className="org-dot" />
          <span>For Organizers</span>
        </Link>

        <Link href="/support" className="ai-pill" title="Ask Compass AI" style={{ flexShrink: 0 }}>
          <span className="ai-dot" />
          <span>Ask Compass</span>
        </Link>

        {signedIn ? (
          <Link
            href="/account"
            aria-label="Notifications"
            className="icon-btn"
            style={{ flexShrink: 0 }}
          >
            <Icon name="bell" size={16} />
          </Link>
        ) : null}

        <ThemeToggle />

        {signedIn === null ? (
          <span className="muted text-sm" aria-hidden="true">…</span>
        ) : signedIn ? (
          <Link
            href="/account"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 12px 4px 4px',
              borderRadius: 'var(--r-pill)',
              border: '1px solid var(--line)',
              background: 'var(--surface)',
              flexShrink: 0,
              textDecoration: 'none',
            }}
          >
            <span
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), oklch(0.55 0.18 180))',
                display: 'grid',
                placeItems: 'center',
                color: 'white',
                fontWeight: 600,
                fontSize: 11,
              }}
            >
              ME
            </span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Account</span>
          </Link>
        ) : (
          <div className="row" style={{ gap: 6, flexShrink: 0 }}>
            <Link href="/signin" className="btn btn-ghost btn-sm" style={{ padding: '10px 14px' }}>
              Sign in
            </Link>
            <Link href="/signup" className="btn btn-accent btn-sm" style={{ padding: '10px 16px' }}>
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
