'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Me } from '@/lib/api';
import { getToken, signOut } from '@/lib/auth';

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
      router.replace('/dashboard/signin');
      return;
    }
    api
      .me(token)
      .then((m) => setMe(m))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleCreateOrg(e: React.FormEvent) {
    e.preventDefault();
    setNewOrgError(null);
    setCreating(true);
    try {
      const token = getToken()!;
      await api.createOrganizer(token, { name: newOrgName, slug: newOrgSlug });
      const refreshed = await api.me(token);
      setMe(refreshed);
      setShowNewOrg(false);
      setNewOrgName('');
      setNewOrgSlug('');
    } catch (err) {
      setNewOrgError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setCreating(false);
    }
  }

  function handleSignOut() {
    signOut();
    router.replace('/dashboard/signin');
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-16 text-gray-500">Loading…</div>;
  if (error) return <div className="max-w-4xl mx-auto px-4 py-16 text-red-600">{error}</div>;
  if (!me) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your organizers</h1>
          <p className="text-sm text-gray-600 mt-1">Signed in as {me.email}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/scan" className="text-sm text-brand-dark hover:underline">
            Open scanner →
          </Link>
          <button onClick={handleSignOut} className="text-sm text-gray-500 hover:text-brand-dark">
            Sign out
          </button>
        </div>
      </div>

      {me.memberships.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-600">You don&apos;t belong to any organizer yet.</p>
          <button
            onClick={() => setShowNewOrg(true)}
            className="mt-4 bg-brand text-white px-4 py-2 rounded-md hover:bg-brand-dark"
          >
            Create your first organizer
          </button>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {me.memberships.map((m) => (
            <li key={m.organizer.id}>
              <Link
                href={`/dashboard/o/${m.organizer.slug}`}
                className="block border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{m.organizer.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {m.organizer.slug} · {m.organizer.status} · You are {m.role}
                    </div>
                  </div>
                  <span className="text-brand-dark">→</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {me.memberships.length > 0 && !showNewOrg && (
        <button
          onClick={() => setShowNewOrg(true)}
          className="mt-6 text-sm text-brand-dark hover:underline"
        >
          + New organizer
        </button>
      )}

      {showNewOrg && (
        <form onSubmit={handleCreateOrg} className="mt-6 border border-gray-200 rounded-lg p-4 bg-white space-y-3">
          <h2 className="font-semibold">New organizer</h2>
          <input
            type="text"
            required
            placeholder="Organizer name (e.g. LiveNation Nigeria)"
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
          <input
            type="text"
            required
            pattern="[a-z0-9-]+"
            placeholder="URL slug (lowercase, dashes only)"
            value={newOrgSlug}
            onChange={(e) => setNewOrgSlug(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
          />
          {newOrgError && <div className="text-sm text-red-600">{newOrgError}</div>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creating}
              className="bg-brand text-white px-4 py-2 rounded-md hover:bg-brand-dark disabled:bg-gray-300"
            >
              {creating ? 'Creating…' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setShowNewOrg(false)}
              className="text-gray-500 px-4 py-2 hover:text-brand-dark"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
