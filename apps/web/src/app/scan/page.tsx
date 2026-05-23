'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

type ScanSuccess = Awaited<ReturnType<typeof api.scanTicket>>;
type ScanResult = ScanSuccess | { error: string };
type RecentEntry = { code: string; outcome: 'admit' | 'used' | 'voided' | 'error' };

export default function ScannerPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<{ stop: () => void; destroy: () => void } | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ admitted: 0, denied: 0 });
  const [recent, setRecent] = useState<RecentEntry[]>([]);
  const lastScanRef = useRef<{ code: string; at: number } | null>(null);

  const handleCode = useCallback(
    async (code: string) => {
      const now = Date.now();
      if (
        lastScanRef.current &&
        lastScanRef.current.code === code &&
        now - lastScanRef.current.at < 2500
      ) {
        return;
      }
      lastScanRef.current = { code, at: now };

      const token = getToken();
      if (!token) {
        router.replace('/dashboard/signin');
        return;
      }
      try {
        const res = await api.scanTicket(token, code);
        setResult(res);
        const outcome: RecentEntry['outcome'] =
          res.ok ? 'admit' : res.reason === 'voided' ? 'voided' : 'used';
        setRecent((r) =>
          [{ code, outcome }, ...r.filter((x) => x.code !== code)].slice(0, 6),
        );
        setStats((s) => ({
          admitted: s.admitted + (res.ok ? 1 : 0),
          denied: s.denied + (res.ok ? 0 : 1),
        }));
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Scan failed';
        setResult({ error: message });
        setRecent((r) =>
          [
            { code, outcome: 'error' as const },
            ...r.filter((x) => x.code !== code),
          ].slice(0, 6),
        );
      }
    },
    [router],
  );

  useEffect(() => {
    if (!getToken()) {
      router.replace('/dashboard/signin');
      return;
    }
    let cancelled = false;
    let qrScanner: { stop: () => void; destroy: () => void } | null = null;

    (async () => {
      try {
        const QrScannerMod = (await import('qr-scanner')).default;
        if (cancelled || !videoRef.current) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        qrScanner = new (QrScannerMod as any)(
          videoRef.current,
          (r: { data: string }) => handleCode(r.data),
          { highlightScanRegion: true, highlightCodeOutline: true, maxScansPerSecond: 4 },
        );
        scannerRef.current = qrScanner;
        await (qrScanner as unknown as { start: () => Promise<void> }).start();
        if (!cancelled) setScanning(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Camera unavailable');
      }
    })();

    return () => {
      cancelled = true;
      qrScanner?.stop();
      qrScanner?.destroy();
    };
  }, [handleCode, router]);

  return (
    <div className="scan-screen">
      <div className="scan-topbar">
        <button
          type="button"
          onClick={() => router.back()}
          className="icon-btn"
          aria-label="Back"
          style={{ background: 'oklch(0 0 0 / .35)', color: 'white', border: 0 }}
        >
          <Icon name="chevron" size={18} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <div className="scan-topbar-title">
          <div className="text-xs" style={{ opacity: 0.7 }}>
            Live scanning
          </div>
          <div className="fw-600">Gate entry</div>
        </div>
        <div className="row gap-2" style={{ fontSize: 12 }}>
          <span className="scan-stat-pill scan-stat-admit">
            <Icon name="check" size={12} stroke={3} /> {stats.admitted}
          </span>
          <span className="scan-stat-pill scan-stat-deny">
            <Icon name="close" size={12} /> {stats.denied}
          </span>
        </div>
      </div>

      <div className="scan-viewport">
        <video ref={videoRef} muted playsInline className="scan-video" />
        <div className="scan-frame" aria-hidden="true">
          <span className="scan-corner tl" />
          <span className="scan-corner tr" />
          <span className="scan-corner bl" />
          <span className="scan-corner br" />
          {scanning && !result ? <span className="scan-pulse" /> : null}
        </div>
        {!scanning && !error ? (
          <div className="scan-message">
            <div className="scan-spinner" aria-hidden="true" />
            Requesting camera…
          </div>
        ) : null}
        {error ? (
          <div className="scan-message scan-message-error">
            <Icon name="info" size={20} />
            <div>
              <div className="fw-600 text-sm">{error}</div>
              <div className="text-xs mt-1" style={{ opacity: 0.85 }}>
                Use manual entry below or check camera permissions.
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {result ? <ResultBanner result={result} onDismiss={() => setResult(null)} /> : null}

      <div className="scan-controls">
        <ManualEntry onSubmit={handleCode} />

        {recent.length > 0 ? (
          <div className="mt-4">
            <div className="eyebrow mb-2">Recent scans</div>
            <ul className="col gap-1" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {recent.map((r) => (
                <li
                  key={`${r.code}-${r.outcome}`}
                  className="row"
                  style={{
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 'var(--r-2)',
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    fontSize: 13,
                  }}
                >
                  <RecentIcon outcome={r.outcome} />
                  <span className="mono" style={{ flex: 1 }}>
                    {r.code}
                  </span>
                  <span className="text-xs muted">{labelFor(r.outcome)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function labelFor(o: 'admit' | 'used' | 'voided' | 'error'): string {
  if (o === 'admit') return 'admitted';
  if (o === 'voided') return 'voided';
  if (o === 'used') return 'already scanned';
  return 'error';
}

function RecentIcon({ outcome }: { outcome: 'admit' | 'used' | 'voided' | 'error' }) {
  if (outcome === 'admit') {
    return (
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: 'var(--accent)',
          display: 'grid',
          placeItems: 'center',
          color: 'white',
        }}
      >
        <Icon name="check" size={12} stroke={3} />
      </span>
    );
  }
  if (outcome === 'voided' || outcome === 'error') {
    return (
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: 'var(--danger)',
          display: 'grid',
          placeItems: 'center',
          color: 'white',
        }}
      >
        <Icon name="close" size={12} stroke={3} />
      </span>
    );
  }
  return (
    <span
      style={{
        width: 22,
        height: 22,
        borderRadius: '50%',
        background: 'oklch(0.80 0.16 75)',
        display: 'grid',
        placeItems: 'center',
        color: 'oklch(0.2 0.05 60)',
      }}
    >
      <Icon name="info" size={12} stroke={2.5} />
    </span>
  );
}

function ResultBanner({
  result,
  onDismiss,
}: {
  result: ScanResult;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  if ('error' in result) {
    return (
      <div className="scan-banner scan-banner-error" role="alert">
        <Icon name="info" size={28} stroke={2.5} />
        <div>
          <div className="fw-600" style={{ fontSize: 18 }}>
            Error
          </div>
          <div className="text-sm mt-1">{result.error}</div>
        </div>
      </div>
    );
  }
  const { ok, reason, ticket } = result;
  if (ok) {
    return (
      <div className="scan-banner scan-banner-admit" role="status">
        <div className="scan-banner-icon">
          <Icon name="check" size={32} stroke={3} />
        </div>
        <div>
          <div className="fw-600" style={{ fontSize: 22 }}>
            ADMIT
          </div>
          <div className="text-sm mt-1" style={{ opacity: 0.95 }}>
            {ticket.ticketTypeName} · {ticket.eventTitle}
          </div>
          <div className="mono text-xs mt-1" style={{ opacity: 0.75 }}>
            {ticket.code}
          </div>
        </div>
      </div>
    );
  }
  const voided = reason === 'voided';
  return (
    <div
      className={`scan-banner ${voided ? 'scan-banner-voided' : 'scan-banner-used'}`}
      role="alert"
    >
      <div className="scan-banner-icon">
        <Icon name={voided ? 'close' : 'info'} size={28} stroke={2.5} />
      </div>
      <div>
        <div className="fw-600" style={{ fontSize: 20 }}>
          {voided ? 'VOIDED' : 'ALREADY SCANNED'}
        </div>
        <div className="text-sm mt-1" style={{ opacity: 0.95 }}>
          {ticket.ticketTypeName} · {ticket.eventTitle}
        </div>
        <div className="mono text-xs mt-1" style={{ opacity: 0.75 }}>
          {ticket.code}
        </div>
      </div>
    </div>
  );
}

function ManualEntry({ onSubmit }: { onSubmit: (code: string) => void }) {
  const [code, setCode] = useState('');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (code.trim()) {
          onSubmit(code.trim().toUpperCase());
          setCode('');
        }
      }}
      className="row gap-2"
      style={{ alignItems: 'stretch' }}
    >
      <input
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCapitalize="characters"
        placeholder="Or type ticket code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="input mono"
        style={{ flex: 1, textTransform: 'uppercase' }}
        aria-label="Manual ticket code"
      />
      <button type="submit" className="btn btn-accent" style={{ flexShrink: 0 }}>
        Check <Icon name="arrow" size={13} />
      </button>
    </form>
  );
}
