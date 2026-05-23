'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, type Me } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { Icon } from './Icon';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function MobileGreetingStrip() {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    api.me(token).then(setMe).catch(() => undefined);
  }, []);

  const firstName = me?.name?.split(' ')[0] ?? null;

  return (
    <div className="mobile-greeting-strip" role="region" aria-label="Greeting">
      <div className="wrap" style={{ padding: '12px 16px 4px' }}>
        <div className="row" style={{ alignItems: 'center', gap: 12 }}>
          <span className="mobile-greeting-mark" aria-hidden="true">
            <span style={{ display: 'block', width: 14, height: 14, borderRadius: 4, background: 'oklch(1 0 0 / .92)' }} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="text-xs muted">
              {greeting()}
              {firstName ? `, ${firstName}` : ''}
            </div>
            <button
              type="button"
              className="row"
              style={{
                gap: 4,
                alignItems: 'center',
                background: 'transparent',
                border: 0,
                padding: 0,
                fontWeight: 600,
                fontSize: 15,
                color: 'var(--ink)',
                cursor: 'pointer',
              }}
              aria-label="Change city"
            >
              <Icon name="pin" size={14} /> Lagos <Icon name="chevronDown" size={13} />
            </button>
          </div>
          {me ? (
            <Link
              href="/account"
              className="icon-btn"
              aria-label="Notifications"
              style={{ position: 'relative', width: 38, height: 38 }}
            >
              <Icon name="bell" size={16} />
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 7,
                  right: 9,
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: 'var(--danger)',
                }}
              />
            </Link>
          ) : (
            <Link
              href="/signin"
              className="btn btn-ghost btn-sm"
              style={{ padding: '8px 12px', fontSize: 12 }}
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
