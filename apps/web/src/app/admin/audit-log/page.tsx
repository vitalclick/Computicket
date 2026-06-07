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
    <div className="page-enter wrap" style={{ paddingTop: 32, paddingBottom: 96, maxWidth: 1200 }}>
      <div
        className="between"
        style={{ alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}
      >
        <div>
          <div className="eyebrow mb-2">Platform admin</div>
          <h1 className="h-2" style={{ margin: 0 }}>
            Audit log
          </h1>
        </div>
        <div className="row gap-2" style={{ alignItems: 'stretch' }}>
          <label htmlFor="audit-filter" className="sr-only">
            Filter by action
          </label>
          <input
            id="audit-filter"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="Filter by action (e.g. admin.organizer.approved)"
            className="input mono"
            style={{ width: 360 }}
          />
          <button
            type="button"
            onClick={() => void load(action || undefined)}
            className="btn btn-ghost"
          >
            Filter
          </button>
        </div>
      </div>
      {error ? (
        <p className="text-sm mt-4" role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      ) : null}
      {rows === null ? (
        <p className="muted mt-6">Loading…</p>
      ) : rows.length === 0 ? (
        <div
          className="card mt-6"
          style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)' }}
        >
          No entries.
        </div>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="mobile-only col gap-2 mt-6">
            {rows.map((r) => (
              <div key={r.id} className="card" style={{ padding: 14 }}>
                <div className="between" style={{ alignItems: 'flex-start' }}>
                  <div className="mono text-xs muted">
                    {new Date(r.createdAt).toLocaleString('en-NG')}
                  </div>
                  {r.actorEmail ? (
                    <span className="text-xs muted">{r.actorEmail}</span>
                  ) : null}
                </div>
                <div className="mono text-sm mt-2" style={{ wordBreak: 'break-all' }}>
                  {r.action}
                </div>
                <div className="text-xs muted mt-1">
                  {r.targetType && r.targetId
                    ? `${r.targetType}:${r.targetId}`
                    : 'No target'}
                </div>
                {r.metadata ? (
                  <pre
                    className="mono text-xs mt-2"
                    style={{
                      background: 'var(--surface-2)',
                      padding: 8,
                      borderRadius: 'var(--r-1)',
                      overflowX: 'auto',
                      margin: 0,
                      maxWidth: '100%',
                    }}
                  >
                    {JSON.stringify(r.metadata)}
                  </pre>
                ) : null}
                {r.ip ? (
                  <div className="mono text-xs muted mt-2">IP {r.ip}</div>
                ) : null}
              </div>
            ))}
          </div>

          <div
            className="card desktop-only mt-6"
            style={{ padding: 0, overflow: 'auto' }}
          >
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  {['When', 'Actor', 'Action', 'Target', 'IP', 'Metadata'].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        padding: '10px 14px',
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '.08em',
                        color: 'var(--ink-3)',
                        fontWeight: 600,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td
                      style={{ padding: '10px 14px', whiteSpace: 'nowrap', color: 'var(--ink-2)' }}
                    >
                      {new Date(r.createdAt).toLocaleString('en-NG')}
                    </td>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      {r.actorEmail ?? <span className="muted">—</span>}
                    </td>
                    <td className="mono" style={{ padding: '10px 14px', fontSize: 12 }}>
                      {r.action}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--ink-2)' }}>
                      {r.targetType && r.targetId
                        ? `${r.targetType}:${r.targetId}`
                        : '—'}
                    </td>
                    <td
                      className="mono"
                      style={{ padding: '10px 14px', fontSize: 12, color: 'var(--ink-3)' }}
                    >
                      {r.ip ?? '—'}
                    </td>
                    <td
                      className="mono"
                      style={{
                        padding: '10px 14px',
                        fontSize: 12,
                        color: 'var(--ink-3)',
                        maxWidth: 320,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {r.metadata ? JSON.stringify(r.metadata) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
