'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { api, type Me } from '@/lib/api';
import { getToken } from '@/lib/auth';

/**
 * Organizer list / first-run wizard. The DashboardLayout above already
 * gates auth and shows the org switcher + sub-nav, so this page only
 * needs to render the org cards (or the empty-state wizard).
 */
export default function DashboardHome() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showNewOrg, setShowNewOrg] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgSlug, setNewOrgSlug] = useState('');
  const [newOrgError, setNewOrgError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/signin?next=/dashboard');
      return;
    }
    api
      .me(token)
      .then((m) => setMe(m))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [router]);

  function suggestSlug(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 32);
  }

  async function handleCreateOrg(e: React.FormEvent) {
    e.preventDefault();
    setNewOrgError(null);
    setCreating(true);
    try {
      const token = getToken()!;
      const slug = newOrgSlug.trim() || suggestSlug(newOrgName);
      const org = await api.createOrganizer(token, { name: newOrgName, slug });
      // Land directly inside the new organizer — that's almost always
      // what the user wants next (KYC, payouts setup, first event).
      router.push(`/dashboard/o/${org.slug}`);
    } catch (err) {
      setNewOrgError(err instanceof Error ? err.message : 'Failed');
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="wrap" style={{ paddingTop: 64, paddingBottom: 96 }}>
        <p className="muted">Loading…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="wrap" style={{ paddingTop: 64, paddingBottom: 96 }}>
        <p style={{ color: 'var(--danger)' }}>{error}</p>
      </div>
    );
  }
  if (!me) return null;

  const hasOrgs = me.memberships.length > 0;

  return (
    <div className="page-enter">
      <section
        className="nebula"
        style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--line)' }}
      >
        <div
          className="wrap"
          style={{ paddingTop: 48, paddingBottom: 40, position: 'relative' }}
        >
          <div className="eyebrow mb-2">Promoter Hub</div>
          <h1 className="h-1" style={{ margin: 0, fontSize: 48 }}>
            {hasOrgs ? (
              <>
                Hey <span className="serif accent-text">{me.name?.split(' ')[0] ?? 'there'}</span>,
                pick where to work today.
              </>
            ) : (
              <>
                Welcome to Computicket.{' '}
                <span className="serif">Let&apos;s create your first organizer.</span>
              </>
            )}
          </h1>
          <p
            className="mt-4 muted"
            style={{ fontSize: 16, maxWidth: 640, lineHeight: 1.55 }}
          >
            Signed in as <span className="mono">{me.email}</span>.{' '}
            {hasOrgs
              ? 'Open an organizer below to see events, payouts, staff, and analytics.'
              : 'An organizer is the workspace you publish events under. You can run more than one — promoter, venue and brand all separately.'}
          </p>
        </div>
      </section>

      <section className="wrap" style={{ paddingTop: 32, paddingBottom: 96 }}>
        {hasOrgs ? (
          <div className="col gap-4">
            {me.memberships.map((m) => (
              <Link
                key={m.organizer.id}
                href={`/dashboard/o/${m.organizer.slug}`}
                className="card card-hover"
                style={{
                  padding: 24,
                  display: 'grid',
                  gridTemplateColumns: 'auto minmax(0,1fr) auto',
                  gap: 24,
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 'var(--r-2)',
                    background:
                      'linear-gradient(135deg, var(--accent), oklch(0.55 0.18 180))',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: 22,
                  }}
                  aria-hidden="true"
                >
                  {m.organizer.name.slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <div className="h-3" style={{ fontSize: 20 }}>
                    {m.organizer.name}
                  </div>
                  <div className="text-xs muted mt-1">
                    <span className="mono">{m.organizer.slug}</span> ·{' '}
                    <StatusBadge status={m.organizer.status} /> · You are{' '}
                    <span className="fw-600">{m.role}</span>
                  </div>
                </div>
                <span className="btn btn-accent btn-sm">
                  Open <Icon name="arrow" size={13} />
                </span>
              </Link>
            ))}

            {!showNewOrg ? (
              <button
                type="button"
                onClick={() => setShowNewOrg(true)}
                className="card card-hover"
                style={{
                  padding: 24,
                  border: '1px dashed var(--line-strong)',
                  background: 'transparent',
                  color: 'var(--ink)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  justifyContent: 'center',
                }}
              >
                <Icon name="plus" size={16} />
                <span className="fw-600">New organizer</span>
              </button>
            ) : null}
          </div>
        ) : (
          <EmptyState onCreate={() => setShowNewOrg(true)} />
        )}

        {(showNewOrg || !hasOrgs) ? (
          <form
            onSubmit={handleCreateOrg}
            className="card mt-6"
            style={{ padding: 28 }}
          >
            <div className="eyebrow mb-2">New organizer</div>
            <h2 className="h-3" style={{ margin: 0 }}>
              Set up your workspace
            </h2>
            <p className="text-sm muted mt-2" style={{ lineHeight: 1.6 }}>
              Choose a public-facing name and a URL slug. You can change the
              name later; the slug becomes your white-label subdomain (
              <span className="mono">your-org.computicket.ng</span>) and is
              harder to change once you start selling tickets.
            </p>

            <div className="col gap-3 mt-5">
              <label className="col gap-1" style={{ flex: 1 }}>
                <span className="text-xs muted">Organizer name</span>
                <input
                  required
                  type="text"
                  value={newOrgName}
                  onChange={(e) => {
                    setNewOrgName(e.target.value);
                    if (!newOrgSlug) setNewOrgSlug(suggestSlug(e.target.value));
                  }}
                  placeholder="e.g. LiveNation Nigeria"
                  className="input"
                />
              </label>
              <label className="col gap-1" style={{ flex: 1 }}>
                <span className="text-xs muted">URL slug</span>
                <div className="row" style={{ alignItems: 'center', gap: 8 }}>
                  <span className="text-sm muted mono">computicket.ng/o/</span>
                  <input
                    required
                    pattern="[a-z0-9-]+"
                    type="text"
                    value={newOrgSlug}
                    onChange={(e) => setNewOrgSlug(e.target.value)}
                    placeholder="livenation-ng"
                    className="input mono"
                    style={{ flex: 1, textTransform: 'lowercase' }}
                  />
                </div>
              </label>
            </div>

            {newOrgError ? (
              <p
                role="alert"
                className="text-sm mt-3"
                style={{ color: 'var(--danger)' }}
              >
                {newOrgError}
              </p>
            ) : null}

            <div className="row gap-3 mt-5">
              <button
                type="submit"
                disabled={creating}
                className="btn btn-accent"
              >
                {creating ? 'Creating…' : 'Create organizer'}{' '}
                <Icon name="arrow" size={13} />
              </button>
              {hasOrgs ? (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowNewOrg(false);
                    setNewOrgError(null);
                  }}
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        ) : null}
      </section>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div
      className="card"
      style={{
        padding: 48,
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--accent-soft), transparent)',
        border: '1px solid oklch(0.68 0.18 152 / .3)',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 'var(--r-2)',
          background: 'var(--accent)',
          color: 'oklch(0.15 0.04 152)',
          display: 'inline-grid',
          placeItems: 'center',
          marginBottom: 16,
        }}
      >
        <Icon name="sparkle" size={26} />
      </div>
      <h2 className="h-3" style={{ margin: 0 }}>
        No organizer yet
      </h2>
      <p
        className="muted mt-3"
        style={{ maxWidth: 520, margin: '12px auto 0', lineHeight: 1.6 }}
      >
        Set up an organizer to publish your first event, take payments and
        scan tickets at the door. Free to create — we only charge when
        tickets sell.
      </p>
      <button type="button" onClick={onCreate} className="btn btn-accent btn-lg mt-6">
        Create your first organizer <Icon name="arrow" size={14} />
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === 'APPROVED'
      ? 'var(--accent)'
      : status === 'SUSPENDED'
        ? 'var(--danger)'
        : 'var(--ink-3)';
  return (
    <span style={{ color, fontWeight: 600 }}>{status.toLowerCase()}</span>
  );
}
