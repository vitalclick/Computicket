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
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold">Can&apos;t play this stream</h1>
          <p className="mt-2 text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }
  if (!data) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-gray-400">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="px-4 py-3 border-b border-gray-800">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="font-semibold">{data.eventTitle}</h1>
          <span className="text-xs uppercase tracking-wide text-red-400">● Live</span>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl aspect-video bg-gray-900 rounded-lg overflow-hidden">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src={data.streamUrl}
            controls
            autoPlay
            playsInline
            className="w-full h-full"
          />
        </div>
      </main>
      <footer className="px-4 py-2 text-xs text-gray-500 border-t border-gray-800">
        <div className="max-w-5xl mx-auto flex justify-between">
          <span className="font-mono">{params.code}</span>
          <span>Playback expires {new Date(data.expiresAt).toLocaleTimeString('en-NG')}</span>
        </div>
      </footer>
    </div>
  );
}
