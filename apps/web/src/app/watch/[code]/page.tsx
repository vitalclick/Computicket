'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';

interface PlaybackResponse {
  eventTitle: string;
  streamUrl: string;
  playbackToken: string;
  expiresAt: string;
}

export default function WatchPage() {
  const params = useParams<{ code: string }>();
  const [data, setData] = useState<PlaybackResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/tickets/${params.code}/playback`, { cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).message ?? `HTTP ${r.status}`);
        return r.json() as Promise<PlaybackResponse>;
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [params.code]);

  if (error) {
    return (
      <div className="watch-screen">
        <div style={{ maxWidth: 460, textAlign: 'center', padding: 32 }}>
          <h1 className="h-3">Can&apos;t play this stream</h1>
          <p className="muted text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="watch-screen">
        <p className="muted">Loading stream…</p>
      </div>
    );
  }

  return (
    <div
      className="watch-screen"
      style={{ flexDirection: 'column', alignItems: 'stretch', padding: 0 }}
    >
      <header
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid oklch(1 0 0 / .08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: 1080,
          margin: '0 auto',
          width: '100%',
        }}
      >
        <h1 className="fw-600" style={{ fontSize: 15, margin: 0 }}>
          {data.eventTitle}
        </h1>
        <span
          className="row gap-1 mono text-xs"
          style={{ alignItems: 'center', color: 'oklch(0.85 0.18 25)' }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'oklch(0.65 0.22 25)',
              boxShadow: '0 0 0 4px oklch(0.65 0.22 25 / .25)',
            }}
          />
          LIVE
        </span>
      </header>
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 1080,
            aspectRatio: '16 / 9',
            background: 'oklch(0 0 0 / .5)',
            borderRadius: 'var(--r-3)',
            overflow: 'hidden',
            boxShadow: '0 30px 80px -20px oklch(0 0 0 / .8)',
          }}
        >
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src={data.streamUrl}
            controls
            autoPlay
            playsInline
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>
      </main>
      <footer
        style={{
          padding: '10px 20px',
          borderTop: '1px solid oklch(1 0 0 / .08)',
          maxWidth: 1080,
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          color: 'oklch(1 0 0 / .6)',
        }}
      >
        <span className="mono">{params.code}</span>
        <span>Playback expires {new Date(data.expiresAt).toLocaleTimeString('en-NG')}</span>
      </footer>
    </div>
  );
}
