'use client';

import { useCallback, useEffect, useState } from 'react';
import { Icon } from './Icon';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

type State = 'unsupported' | 'denied' | 'granted' | 'default' | 'loading';

const FCM_VAPID_KEY = process.env.NEXT_PUBLIC_FCM_VAPID_KEY ?? '';
const FCM_PROJECT_ID = process.env.NEXT_PUBLIC_FCM_PROJECT_ID ?? '';

/**
 * Web push subscribe / unsubscribe control. Uses the Notifications API
 * for permission and PushManager for the subscription endpoint. The
 * endpoint URL (a Firebase-style FCM-Web token, or a generic WebPush
 * one when VAPID is configured) is sent to the API as a `WEB` device.
 *
 * In environments without VAPID config the button still renders and
 * explains why it can't enable — useful so the surface doesn't appear
 * broken in dev.
 */
export function PushNotificationToggle() {
  const [state, setState] = useState<State>('loading');
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setState('unsupported');
      return;
    }
    const perm = Notification.permission;
    setState(perm as State);
    navigator.serviceWorker
      .getRegistration()
      .then((reg) => reg?.pushManager.getSubscription())
      .then((sub) => setEndpoint(sub?.endpoint ?? null))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function enable() {
    setBusy(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) throw new Error('Sign in required');
      if (!FCM_VAPID_KEY) {
        throw new Error('Push not configured (NEXT_PUBLIC_FCM_VAPID_KEY missing)');
      }
      const perm = await Notification.requestPermission();
      setState(perm as State);
      if (perm !== 'granted') return;

      const reg =
        (await navigator.serviceWorker.getRegistration('/push-sw.js')) ??
        (await navigator.serviceWorker.register('/push-sw.js'));
      // Wait until active so the push manager can subscribe immediately.
      if (!reg.active) await navigator.serviceWorker.ready;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        // Cast to BufferSource — TS5 narrows ArrayBufferLike to forbid
        // SharedArrayBuffer here, but PushManager accepts any view.
        applicationServerKey: urlBase64ToUint8(FCM_VAPID_KEY) as BufferSource,
      });
      setEndpoint(sub.endpoint);
      await api.registerPushDevice(token, {
        token: sub.endpoint,
        platform: 'WEB',
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to enable');
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setError(null);
    try {
      const token = getToken();
      const reg = await navigator.serviceWorker.getRegistration('/push-sw.js');
      const sub = await reg?.pushManager.getSubscription();
      const endpointToRemove = sub?.endpoint ?? endpoint;
      if (sub) await sub.unsubscribe();
      if (token && endpointToRemove) {
        await api.unregisterPushDevice(token, endpointToRemove).catch(() => undefined);
      }
      setEndpoint(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to disable');
    } finally {
      setBusy(false);
    }
  }

  if (state === 'loading') return null;

  const enabled = state === 'granted' && Boolean(endpoint);

  return (
    <section className="card mt-3" style={{ padding: 22 }}>
      <div className="row gap-3" style={{ alignItems: 'flex-start' }}>
        <span
          aria-hidden="true"
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--r-2)',
            background: 'var(--accent-soft)',
            color: 'var(--accent)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name="bell" size={16} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="h-4">Push notifications</h2>
          <p className="text-sm muted mt-2" style={{ lineHeight: 1.55 }}>
            Get gate-open reminders, set-list shuffles and price drops for events
            you bookmark. Web Push works while the browser is closed on Chrome,
            Firefox, Edge and Android. iOS Safari needs the app on your home
            screen.
          </p>
          {state === 'unsupported' ? (
            <p className="text-sm muted mt-3">
              This browser doesn&apos;t support web push.
            </p>
          ) : state === 'denied' ? (
            <p className="text-sm mt-3" style={{ color: 'var(--danger)' }}>
              Notifications are blocked. Re-enable in your browser&apos;s site
              settings, then refresh.
            </p>
          ) : enabled ? (
            <button
              type="button"
              onClick={disable}
              disabled={busy}
              className="btn btn-ghost btn-sm mt-3"
              style={{ color: 'var(--danger)' }}
            >
              {busy ? 'Disabling…' : 'Disable notifications'}
            </button>
          ) : (
            <button
              type="button"
              onClick={enable}
              disabled={busy || !FCM_PROJECT_ID}
              className="btn btn-accent btn-sm mt-3"
            >
              {busy ? 'Enabling…' : 'Enable notifications'}
            </button>
          )}
          {error ? (
            <p className="text-sm mt-3" style={{ color: 'var(--danger)' }}>
              {error}
            </p>
          ) : null}
        </div>
        {enabled ? (
          <span
            className="badge"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
          >
            On
          </span>
        ) : null}
      </div>
    </section>
  );
}

function urlBase64ToUint8(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
