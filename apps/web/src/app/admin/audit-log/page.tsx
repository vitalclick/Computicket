'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { API_URL, api } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface AuditRow {
  id: string;
  actorUserId: string | null;
  actorEmail: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  ip: string | null;
  createdAt: string;
}

export default function AuditLogPage() {
  const router = useRouter();
  const [rows, setRows] = useState<AuditRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState('');

  const load = useCallback(async (filter?: string) => {
    const token = getToken();
    if (!token) {
      router.replace('/signin?next=/admin/audit-log');
      return;
    }
    try {
      const me = await api.me(token);
      if (!me.isAdmin) {
        router.replace('/');
        return;
      }
      const qs = filter ? `?action=${encodeURIComponent(filter)}` : '';
      const res = await fetch(`${API_URL}/admin/audit-log${qs}`, {
        headers: { authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error((await res.json()).message ?? `HTTP ${res.status}`);
      setRows((await res.json()) as AuditRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  }, [router]);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Audit log</h1>
        <div className="flex gap-2">
          <input
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="Filter by action (e.g. admin.organizer.approved)"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm w-80"
          />
          <button
            onClick={() => void load(action || undefined)}
            className="rounded-md bg-gray-900 text-white px-4 py-2 text-sm"
          >
            Filter
          </button>
        </div>
      </div>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {rows === null ? (
        <p className="mt-6 text-sm text-gray-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">No entries.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-3 py-2 text-left">When</th>
                <th className="px-3 py-2 text-left">Actor</th>
                <th className="px-3 py-2 text-left">Action</th>
                <th className="px-3 py-2 text-left">Target</th>
                <th className="px-3 py-2 text-left">IP</th>
                <th className="px-3 py-2 text-left">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                    {new Date(r.createdAt).toLocaleString('en-NG')}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {r.actorEmail ?? <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{r.action}</td>
                  <td className="px-3 py-2 text-xs text-gray-600">
                    {r.targetType && r.targetId ? `${r.targetType}:${r.targetId}` : '—'}
                  </td>
                  <td className="px-3 py-2 text-xs font-mono text-gray-500">{r.ip ?? '—'}</td>
                  <td className="px-3 py-2 text-xs font-mono text-gray-500">
                    {r.metadata ? JSON.stringify(r.metadata) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
