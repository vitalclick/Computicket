'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

const ROLES = ['OWNER', 'MANAGER', 'FINANCE', 'MARKETING', 'SCANNER', 'READ_ONLY'] as const;

const ROLE_DESCRIPTIONS: Record<typeof ROLES[number], string> = {
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
  const [role, setRole] = useState<string>('MANAGER');
  const [inviteResult, setInviteResult] = useState<{ email: string; newAccount: boolean } | null>(null);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace('/signin?next=' + encodeURIComponent(`/dashboard/o/${params.slug}/team`));
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
    try {
      const res = await api.inviteTeam(getToken()!, params.slug, { email, role });
      setInviteResult({ email: res.user.email, newAccount: res.newAccount });
      setEmail('');
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(null);
    }
  }

  async function changeRole(memberId: string, newRole: string) {
    setBusy(memberId);
    try {
      await api.updateTeamRole(getToken()!, params.slug, memberId, newRole);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(null);
    }
  }

  async function remove(memberId: string, email: string) {
    if (!confirm(`Remove ${email} from this organizer?`)) return;
    setBusy(memberId);
    try {
      await api.removeTeamMember(getToken()!, params.slug, memberId);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-16 text-gray-500">Loading…</div>;
  if (error) return <div className="max-w-3xl mx-auto px-4 py-16 text-red-600">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href={`/dashboard/o/${params.slug}`} className="text-sm text-gray-500 hover:text-brand-dark">
        ← {params.slug}
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Team</h1>
      <p className="text-sm text-gray-600 mt-1">
        Only Owners can manage team members. New invitees get an account they finish by signing up at /signup.
      </p>

      <form onSubmit={invite} className="mt-8 border border-gray-200 rounded-lg p-4 bg-white space-y-3">
        <h2 className="font-semibold">Invite a teammate</h2>
        <div className="grid sm:grid-cols-[2fr,1fr,auto] gap-2 items-start">
          <input
            type="email" required placeholder="teammate@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <select
            value={role} onChange={(e) => setRole(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
          >
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <button
            type="submit" disabled={busy === 'invite'}
            className="bg-brand text-white px-4 py-2 rounded-md text-sm hover:bg-brand-dark disabled:bg-gray-300"
          >
            {busy === 'invite' ? 'Inviting…' : 'Invite'}
          </button>
        </div>
        <p className="text-xs text-gray-500">{ROLE_DESCRIPTIONS[role as typeof ROLES[number]]}</p>
        {inviteResult && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
            Invited <strong>{inviteResult.email}</strong>.{' '}
            {inviteResult.newAccount
              ? 'They will need to sign up at /signup with this email to set their password.'
              : 'They already have an account and can sign in immediately.'}
          </div>
        )}
      </form>

      <h2 className="mt-10 text-lg font-semibold">Members ({members.length})</h2>
      <ul className="mt-3 space-y-2">
        {members.map((m) => (
          <li key={m.id} className="border border-gray-200 rounded-lg p-4 bg-white flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-medium truncate">{m.user.name || m.user.email}</div>
              {m.user.name && <div className="text-xs text-gray-500">{m.user.email}</div>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={m.role}
                onChange={(e) => changeRole(m.id, e.target.value)}
                disabled={busy === m.id}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white"
              >
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <button
                onClick={() => remove(m.id, m.user.email)}
                disabled={busy === m.id}
                className="text-red-600 hover:underline text-xs disabled:text-gray-400"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
