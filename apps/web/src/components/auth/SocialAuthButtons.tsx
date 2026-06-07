'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { setToken } from '@/lib/auth';

interface GoogleCredentialResponse {
  credential: string;
}

interface AppleAuthResponse {
  authorization: { id_token: string; code: string; state?: string };
  user?: { name?: { firstName?: string; lastName?: string }; email?: string };
}

interface Props {
  /** Called on successful sign-in so the caller can route the user. */
  onSuccess: (next: string) => void;
  /** Where to land after sign-in. */
  next?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: {
            client_id: string;
            callback: (res: GoogleCredentialResponse) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            el: HTMLElement,
            opts: Record<string, string | number | boolean>,
          ) => void;
        };
      };
    };
    AppleID?: {
      auth: {
        init: (cfg: {
          clientId: string;
          scope: string;
          redirectURI: string;
          state?: string;
          usePopup?: boolean;
        }) => void;
        signIn: () => Promise<AppleAuthResponse>;
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;
const APPLE_CLIENT_ID = process.env.NEXT_PUBLIC_APPLE_OAUTH_CLIENT_ID;
const APPLE_REDIRECT =
  process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI ??
  (typeof window !== 'undefined' ? `${window.location.origin}/signin` : '');

export function SocialAuthButtons({ onSuccess, next = '/account' }: Props) {
  const googleBtnRef = useRef<HTMLDivElement | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [appleReady, setAppleReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'google' | 'apple' | null>(null);

  // Initialise Google Identity Services once the script has loaded and
  // the client id is configured.
  useEffect(() => {
    if (!googleReady || !GOOGLE_CLIENT_ID || !googleBtnRef.current) return;
    if (!window.google) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (res) => {
        setBusy('google');
        setError(null);
        try {
          const auth = await api.googleSignin(res.credential);
          setToken(auth.token);
          onSuccess(next);
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Google sign-in failed');
          setBusy(null);
        }
      },
    });
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'pill',
      logo_alignment: 'left',
      width: 320,
    });
  }, [googleReady, next, onSuccess]);

  // Initialise AppleID JS when the script has loaded.
  useEffect(() => {
    if (!appleReady || !APPLE_CLIENT_ID || !window.AppleID) return;
    window.AppleID.auth.init({
      clientId: APPLE_CLIENT_ID,
      scope: 'name email',
      redirectURI: APPLE_REDIRECT,
      usePopup: true,
    });
  }, [appleReady]);

  async function handleApple() {
    if (!APPLE_CLIENT_ID || !window.AppleID) return;
    setBusy('apple');
    setError(null);
    try {
      const res = await window.AppleID.auth.signIn();
      const fullName = [
        res.user?.name?.firstName,
        res.user?.name?.lastName,
      ]
        .filter(Boolean)
        .join(' ')
        .trim();
      const auth = await api.appleSignin(
        res.authorization.id_token,
        fullName || undefined,
      );
      setToken(auth.token);
      onSuccess(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Apple sign-in failed');
      setBusy(null);
    }
  }

  // Hide the whole block if neither provider is configured — saves
  // shipping dead "Continue with…" buttons in non-prod environments.
  if (!GOOGLE_CLIENT_ID && !APPLE_CLIENT_ID) return null;

  return (
    <div className="col gap-3" style={{ alignItems: 'center' }}>
      {GOOGLE_CLIENT_ID ? (
        <>
          <Script
            src="https://accounts.google.com/gsi/client"
            strategy="afterInteractive"
            onLoad={() => setGoogleReady(true)}
          />
          <div ref={googleBtnRef} aria-busy={busy === 'google'} style={{ minHeight: 44 }} />
        </>
      ) : null}

      {APPLE_CLIENT_ID ? (
        <>
          <Script
            src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
            strategy="afterInteractive"
            onLoad={() => setAppleReady(true)}
          />
          <button
            type="button"
            onClick={handleApple}
            disabled={busy !== null}
            className="btn btn-ghost"
            style={{
              width: 320,
              justifyContent: 'center',
              background: 'oklch(0 0 0)',
              color: 'oklch(0.99 0 0)',
              borderColor: 'oklch(0 0 0)',
              padding: '11px 18px',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.5 12.7c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.7-1.3-.1-2.6.8-3.3.8-.7 0-1.7-.8-2.9-.7-1.5 0-2.8.9-3.6 2.2-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.5 2.2 2.6 2.2 1.1 0 1.5-.7 2.8-.7 1.3 0 1.7.7 2.9.7 1.2 0 1.9-1 2.6-2 .8-1.2 1.2-2.3 1.2-2.4 0 0-2.2-.9-2.2-3.4zM15.3 6c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.6 1 .1 2-.5 2.5-1.2z"/>
            </svg>
            <span style={{ marginLeft: 4 }}>Continue with Apple</span>
          </button>
        </>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="text-sm"
          style={{ color: 'var(--danger)', marginTop: 4 }}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Visual "OR" divider for separating social / magic-link / password flows. */
export function AuthDivider({ label = 'or' }: { label?: string }) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        color: 'var(--ink-3)',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: '.16em',
        margin: '8px 0',
      }}
    >
      <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
      <span>{label}</span>
      <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
    </div>
  );
}
