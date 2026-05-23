'use client';

import Link from 'next/link';
import { Icon } from '@/components/Icon';

interface Props {
  /** Org slug — drives the back link to /dashboard/o/[slug]. */
  orgSlug: string;
  /** Eyebrow text above the title — usually the section name. */
  eyebrow?: string;
  /** Page title (h1). */
  title: string;
  /** Optional sub-paragraph (≤ 480 char). */
  sub?: React.ReactNode;
  /** Right-side action button(s). */
  actions?: React.ReactNode;
}

/**
 * Consistent header for every per-org dashboard sub-page (team,
 * payouts, promo codes, …) so they share the back-link + title +
 * action-row treatment without each page reinventing it.
 */
export function DashboardPageHeader({ orgSlug, eyebrow, title, sub, actions }: Props) {
  return (
    <section className="wrap" style={{ paddingTop: 32, paddingBottom: 24 }}>
      <Link
        href={`/dashboard/o/${orgSlug}`}
        className="row gap-1 text-sm muted"
        style={{ alignItems: 'center', width: 'fit-content' }}
      >
        <Icon name="chevron" size={13} stroke={2} style={{ transform: 'rotate(180deg)' }} />
        <span>Back to {orgSlug}</span>
      </Link>
      <div
        className="between mt-3"
        style={{ alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}
      >
        <div>
          {eyebrow ? <div className="eyebrow mb-2">{eyebrow}</div> : null}
          <h1 className="h-2" style={{ margin: 0 }}>
            {title}
          </h1>
          {sub ? (
            <p
              className="muted mt-2"
              style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 640 }}
            >
              {sub}
            </p>
          ) : null}
        </div>
        {actions ? <div className="row gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}

/** Reusable cosmic "loading…" placeholder for dashboard pages. */
export function DashboardLoading() {
  return (
    <div className="wrap" style={{ paddingTop: 64, paddingBottom: 96 }}>
      <p className="muted">Loading…</p>
    </div>
  );
}

/** Reusable error placeholder. */
export function DashboardError({ message }: { message: string }) {
  return (
    <div className="wrap" style={{ paddingTop: 64, paddingBottom: 96 }}>
      <div
        className="card"
        style={{
          padding: 24,
          borderColor: 'oklch(0.65 0.22 25 / 0.4)',
          color: 'var(--danger)',
        }}
      >
        {message}
      </div>
    </div>
  );
}
