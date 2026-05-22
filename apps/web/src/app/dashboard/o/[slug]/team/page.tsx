'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import {
  DashboardError,
  DashboardLoading,
  DashboardPageHeader,
} from '@/components/dashboard/DashboardPageHeader';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

const ROLES = ['OWNER', 'MANAGER', 'FINANCE', 'MARKETING', 'SCANNER', 'READ_ONLY'] as const;
type Role = (typeof ROLES)[number];

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  OWNER: 'Full control, including team and payouts',
  MANAGER: 'Create and publish events, issue refunds',
  FINANCE: 'View revenue, issue refunds',
  MARKETING: 'View sales and orders, send broadcasts',
  SCANNER: 'Scan tickets at the gate',
  READ_ONLY: 'Read-only access to events and sales',
};

export default function TeamPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [members, setMembers] = useState<Awaited<ReturnType<typeof api.listTeam>>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('MANAGER');
  const [inviteResult, setInviteResult] = useState<
    { email: string; newAccount: boolean } | null
  >(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace(`/signin?next=${encodeURIComponent(`/dashboard/o/${params.slug}/team`)}`);
      return;
    }
    try {
      setMembers(await api.listTeam(token, params.slug));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }, [router, params.slug]);

  useEffect(() => {
    load();
  }, [load]);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setBusy('invite');
    setInviteResult(null);
    setInviteError(null);
    try {
      const res = await api.inviteTeam(getToken()!, params.slug, { email, role });
      setInviteResult({ email: res.user.email, newAccount: res.newAccount });
      setEmail('');
      await load();
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(null);
    }
  }

  async function changeRole(memberId: string, newRole: Role) {
    setBusy(memberId);
    try {
      await api.updateTeamRole(getToken()!, params.slug, memberId, newRole);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(null);
    }
  }

  async function remove(memberId: string, memberEmail: string) {
    if (
      !confirm(
        `Remove ${memberEmail} from this organizer? They lose access immediately.`,
      )
    )
      return;
    setBusy(memberId);
    try {
      await api.removeTeamMember(getToken()!, params.slug, memberId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <DashboardLoading />;
  if (error && members.length === 0) return <DashboardError message={error} />;

  return (
    <div className="page-enter">
      <DashboardPageHeader
        orgSlug={params.slug}
        eyebrow="Staff"
        title="Team"
        sub="Only Owners can manage team members. New invitees get an account they finish by signing up at /signup."
      />

      <section className="wrap" style={{ paddingBottom: 24 }}>
        <form onSubmit={invite} className="card" style={{ padding: 24 }}>
          <div className="row gap-3 mb-4" style={{ alignItems: 'center' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--r-2)',
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Icon name="user" size={16} />
            </div>
            <div>
              <h2 className="h-4" style={{ margin: 0 }}>
                Invite a teammate
              </h2>
              <p className="text-xs muted mt-1">
                We send an invitation email; if they already have an account, they can sign in
                immediately.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr auto',
              gap: 10,
              alignItems: 'flex-start',
            }}
          >
            <input
              type="email"
              required
              placeholder="teammate@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              aria-label="Teammate email"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="input"
              aria-label="Role"
              style={{ cursor: 'pointer' }}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={busy === 'invite'}
              className="btn btn-accent"
              style={{ height: 'fit-content' }}
            >
              {busy === 'invite' ? 'Inviting…' : 'Invite'}
              <Icon name="arrow" size={13} />
            </button>
          </div>
          <p className="text-xs muted mt-3">{ROLE_DESCRIPTIONS[role]}</p>

          {inviteResult ? (
            <div
              role="status"
              className="card mt-4"
              style={{
                padding: 16,
                background: 'var(--accent-soft)',
                borderColor: 'oklch(0.68 0.18 152 / .3)',
              }}
            >
              <div className="row gap-2" style={{ alignItems: 'center' }}>
                <Icon name="check" size={14} stroke={2.5} />
                <span className="fw-600">Invited {inviteResult.email}</span>
              </div>
              <p className="text-sm muted mt-2" style={{ lineHeight: 1.6 }}>
                {inviteResult.newAccount
                  ? 'They will need to sign up at /signup with this email to set their password.'
                  : 'They already have an account and can sign in immediately.'}
              </p>
            </div>
          ) : null}

          {inviteError ? (
            <p role="alert" className="text-sm mt-3" style={{ color: 'var(--danger)' }}>
              {inviteError}
            </p>
          ) : null}
        </form>
      </section>

      <section className="wrap" style={{ paddingBottom: 64 }}>
        <div className="between mb-4">
          <h2 className="h-3" style={{ margin: 0 }}>
            Members
          </h2>
          <span className="text-sm muted">{members.length} total</span>
        </div>
        {error ? (
          <p role="alert" className="text-sm mb-3" style={{ color: 'var(--danger)' }}>
            {error}
          </p>
        ) : null}
        <div className="col gap-2">
          {members.map((m) => (
            <div
              key={m.id}
              className="card"
              style={{
                padding: 18,
                display: 'grid',
                gridTemplateColumns: 'auto minmax(0,1fr) auto auto',
                gap: 16,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background:
                    'linear-gradient(135deg, var(--accent), oklch(0.55 0.18 180))',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 13,
                }}
                aria-hidden="true"
              >
                {(m.user.name || m.user.email).slice(0, 1).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="fw-600" style={{ fontSize: 14 }}>
                  {m.user.name || m.user.email}
                </div>
                {m.user.name ? (
                  <div className="text-xs muted mt-1 mono">{m.user.email}</div>
                ) : null}
              </div>
              <select
                value={m.role}
                onChange={(e) => changeRole(m.id, e.target.value as Role)}
                disabled={busy === m.id}
                aria-label={`Role for ${m.user.email}`}
                className="input"
                style={{ width: 'auto', padding: '6px 10px', fontSize: 13 }}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => remove(m.id, m.user.email)}
                disabled={busy === m.id}
                className="text-xs"
                style={{
                  color: 'var(--danger)',
                  background: 'transparent',
                  border: 0,
                  padding: '6px 10px',
                  cursor: 'pointer',
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
