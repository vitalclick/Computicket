'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { Wordmark } from '@/components/Wordmark';
import { API_URL, api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { phForId } from '@/lib/design-data';

interface CollectibleStatus {
  code: string;
  status: 'ISSUED' | 'SCANNED' | 'VOIDED';
  orderStatus: string;
  event: { title: string; venue: string; city: string; startsAt: string };
  ticketType: string;
  tokenId: string;
  tokenURI: string;
  imageUrl: string;
  claimedWallet: string | null;
  claimedAt: string | null;
}

interface VoucherResponse {
  voucher: {
    recipient: string;
    tokenId: string;
    tokenURI: string;
    expiresAt: number;
    scheme: string;
    signature: string;
  };
  ticket: {
    code: string;
    event: string;
    tokenId: string;
    tokenURI: string;
    claimedWallet: string;
  };
  note: string;
}

export default function CollectiblePage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<CollectibleStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState('');
  const [voucher, setVoucher] = useState<VoucherResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const t = getToken();
    if (!t) {
      router.replace(`/signin?next=/tickets/${params.code}/collectible`);
      return;
    }
    setToken(t);
    fetch(`${API_URL}/tickets/${params.code}/collectible`, {
      headers: { authorization: `Bearer ${t}` },
      cache: 'no-store',
    })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).message ?? `HTTP ${r.status}`);
        return r.json() as Promise<CollectibleStatus>;
      })
      .then((d) => {
        setData(d);
        if (d.claimedWallet) setWallet(d.claimedWallet);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, [params.code, router]);

  async function claim() {
    if (!token || !wallet || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/tickets/${params.code}/claim-nft`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ wallet }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message ?? `HTTP ${res.status}`);
      }
      const body = (await res.json()) as VoucherResponse;
      setVoucher(body);
      setData((prev) =>
        prev
          ? { ...prev, claimedWallet: wallet, claimedAt: new Date().toISOString() }
          : prev,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Claim failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (error && !data) {
    return (
      <div className="wrap" style={{ paddingTop: 64, paddingBottom: 64 }}>
        <p style={{ color: 'var(--danger)' }}>{error}</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="wrap" style={{ paddingTop: 64 }}>
        <p className="muted">Loading…</p>
      </div>
    );
  }

  const scanned = data.status === 'SCANNED';
  const startsAt = new Date(data.event.startsAt);
  const dateLabel = startsAt.toLocaleDateString('en-NG', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
  const timeLabel = startsAt.toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const ph = phForId(data.code);

  return (
    <div className={`pass-screen ${scanned ? 'pass-scanned' : ''}`}>
      <div className="wrap pass-wrap">
        <div className="pass-progress" aria-hidden="true">
          <span className="active" />
          <span />
          <span />
        </div>
        <div className="text-xs pass-progress-label">1 of 1 active pass</div>

        {/* The pass */}
        <div className="pass-card">
          {/* Header band */}
          <div className={`ph ${ph} ph-noise pass-header`}>
            <div className="stars" />
            <div className="pass-header-shade" />
            <div className="pass-header-top">
              <span className="pass-brand">
                <Wordmark />
              </span>
              <span className="badge badge-vip">{data.ticketType}</span>
            </div>
            <div className="pass-header-meta">
              <div className="mono text-xs" style={{ opacity: 0.85, letterSpacing: '.14em' }}>
                EVENT
              </div>
              <div
                className="serif"
                style={{ fontSize: 24, lineHeight: 1.05, marginTop: 4, textWrap: 'pretty' }}
              >
                {data.event.title}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="pass-details">
            <div className="pass-row">
              <div>
                <div className="text-xs muted">Date</div>
                <div className="fw-600 mt-1" style={{ fontSize: 14, color: 'oklch(0.18 0.04 152)' }}>
                  {dateLabel}
                </div>
                <div className="text-xs muted mt-1">{timeLabel}</div>
              </div>
              <div>
                <div className="text-xs muted">Venue</div>
                <div className="fw-600 mt-1" style={{ fontSize: 14, color: 'oklch(0.18 0.04 152)' }}>
                  {data.event.venue}
                </div>
                <div className="text-xs muted mt-1">{data.event.city}</div>
              </div>
            </div>
            <div className="pass-row mt-3">
              <div>
                <div className="text-xs muted">Tier</div>
                <div className="fw-600 mt-1" style={{ fontSize: 14, color: 'oklch(0.18 0.04 152)' }}>
                  {data.ticketType}
                </div>
              </div>
              <div>
                <div className="text-xs muted">Status</div>
                <div
                  className="fw-600 mt-1 mono"
                  style={{ fontSize: 13, color: scanned ? 'var(--accent)' : 'oklch(0.18 0.04 152)' }}
                >
                  {data.status}
                </div>
              </div>
              <div>
                <div className="text-xs muted">Code</div>
                <div className="fw-600 mt-1 mono" style={{ fontSize: 13, color: 'oklch(0.18 0.04 152)' }}>
                  {data.code}
                </div>
              </div>
            </div>
          </div>

          {/* Perforation */}
          <div className="pass-perf" aria-hidden="true">
            <span className="pass-perf-notch left" />
            <span className="pass-perf-notch right" />
            <span className="pass-perf-line" />
          </div>

          {/* QR */}
          <div className="pass-qr-wrap">
            <div className="pass-qr">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.imageUrl}
                alt={`QR code for ticket ${data.code}`}
                style={{ display: 'block', width: '100%', height: 'auto' }}
              />
              {!scanned ? <span className="pass-scanline" aria-hidden="true" /> : null}
              {scanned ? (
                <div className="pass-success">
                  <div className="pass-success-circle">
                    <Icon name="check" size={36} stroke={3} />
                  </div>
                  <div className="serif mt-3" style={{ fontSize: 22 }}>
                    Welcome to the show
                  </div>
                  <div className="mono text-xs mt-1" style={{ opacity: 0.85, letterSpacing: '.12em' }}>
                    SCANNED
                  </div>
                </div>
              ) : null}
            </div>
            <div className="between mt-3" style={{ color: 'oklch(0.40 0.04 152)' }}>
              <div className="text-xs muted">Ticket ID</div>
              <div className="mono text-xs">{data.code}</div>
            </div>
          </div>
        </div>

        {/* Compass tip */}
        <div className="pass-glass-card mt-4">
          <div className="row gap-2">
            <span className="ai-dot" style={{ width: 18, height: 18 }} />
            <span className="fw-600 text-sm">Compass tip</span>
          </div>
          <p className="text-xs mt-2" style={{ opacity: 0.9, lineHeight: 1.5 }}>
            Bring an ID matching the buyer name. The QR refreshes if you re-open this
            page — always show this screen at the gate, not a screenshot.
          </p>
        </div>

        {/* Actions */}
        <div className="row gap-2 mt-4 pass-actions">
          <TransferButton code={data.code} />
          <ResellButton code={data.code} ticketType={data.ticketType} />
        </div>

        {/* NFT collectible (secondary, opt-in) */}
        <details className="pass-collectible mt-6">
          <summary>
            <span className="row gap-2" style={{ alignItems: 'center' }}>
              <Icon name="sparkle" size={14} /> Claim the on-chain collectible
            </span>
            <span className="text-xs muted">Optional</span>
          </summary>
          <div className="pass-collectible-body">
            <p className="text-xs muted" style={{ lineHeight: 1.55 }}>
              Every paid ticket has a deterministic NFT identity. Attach an EVM wallet
              to receive a signed mint voucher you can redeem later — your ticket QR
              stays valid either way.
            </p>
            <div className="mt-3">
              <div className="text-xs muted">Token ID</div>
              <div className="mono text-xs mt-1" style={{ wordBreak: 'break-all' }}>
                {data.tokenId}
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xs muted">Metadata URI</div>
              <a
                href={data.tokenURI}
                target="_blank"
                rel="noreferrer"
                className="accent-text mono text-xs"
                style={{ wordBreak: 'break-all' }}
              >
                {data.tokenURI}
              </a>
            </div>
            <label className="mt-4" style={{ display: 'block' }}>
              <span className="text-xs muted">EVM wallet address</span>
              <input
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                placeholder="0x…"
                className="input mono mt-1"
              />
            </label>
            <button
              type="button"
              onClick={claim}
              disabled={!wallet || submitting}
              className="btn btn-accent mt-3"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {submitting
                ? 'Signing voucher…'
                : data.claimedWallet
                  ? 'Re-issue voucher'
                  : 'Claim collectible'}
            </button>
            {data.claimedWallet ? (
              <p className="text-xs muted mt-2">
                Already claimed to <span className="mono">{data.claimedWallet}</span>
                {data.claimedAt
                  ? ` on ${new Date(data.claimedAt).toLocaleDateString('en-NG')}`
                  : ''}
                .
              </p>
            ) : null}
            {error ? (
              <p className="text-xs mt-2" style={{ color: 'var(--danger)' }}>
                {error}
              </p>
            ) : null}
            {voucher ? (
              <div
                className="card mt-3"
                style={{
                  padding: 12,
                  background: 'var(--accent-soft)',
                  border: '1px solid var(--accent)',
                }}
              >
                <div className="fw-600 text-sm">Mint voucher</div>
                <p className="text-xs muted mt-1" style={{ lineHeight: 1.5 }}>
                  Save this. A future lazy-mint contract will verify the signature
                  and mint <span className="mono">tokenId {voucher.voucher.tokenId}</span>.
                </p>
                <pre
                  className="mono mt-2"
                  style={{
                    fontSize: 10,
                    background: 'var(--surface)',
                    padding: 8,
                    borderRadius: 6,
                    overflowX: 'auto',
                  }}
                >
                  {JSON.stringify(voucher.voucher, null, 2)}
                </pre>
                <p className="text-xs muted mt-2">{voucher.note}</p>
              </div>
            ) : null}
          </div>
        </details>
      </div>
    </div>
  );
}

function TransferButton({ code }: { code: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.createTicketTransfer(token, code, {
        recipientEmail: email || undefined,
      });
      setLink(res.link);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user can copy manually */
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-glass"
        style={{ flex: 1, justifyContent: 'center' }}
      >
        <Icon name="send" size={14} /> Transfer
      </button>
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="transfer-dialog-title"
          className="transfer-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="transfer-modal-card">
            <div className="between" style={{ alignItems: 'center' }}>
              <h2 id="transfer-dialog-title" className="h-4" style={{ margin: 0 }}>
                Transfer this ticket
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="icon-btn"
                style={{ width: 32, height: 32 }}
              >
                <Icon name="close" size={14} />
              </button>
            </div>
            {!link ? (
              <form onSubmit={generate} className="mt-4">
                <p className="text-sm muted" style={{ lineHeight: 1.55 }}>
                  Send a single-use claim link. If you add an email, we&apos;ll send
                  them an invite too. The moment they accept, your copy stops
                  scanning.
                </p>
                <label htmlFor="transfer-email" className="sr-only">
                  Recipient email
                </label>
                <input
                  id="transfer-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Recipient email (optional)"
                  autoComplete="email"
                  className="input mt-4"
                />
                {error ? (
                  <p className="text-sm mt-3" style={{ color: 'var(--danger)' }}>
                    {error}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={busy}
                  className="btn btn-accent btn-lg mt-4"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {busy ? 'Generating link…' : 'Generate transfer link'}
                </button>
                <p className="text-xs muted mt-3" style={{ lineHeight: 1.55 }}>
                  Link is single-use, expires in 72 hours, and replaces any
                  previous pending transfer for this ticket.
                </p>
              </form>
            ) : (
              <div className="mt-4">
                <div className="eyebrow accent-text">Share this link</div>
                <div
                  className="card mt-2"
                  style={{
                    padding: 12,
                    background: 'var(--surface-2)',
                    border: 0,
                    wordBreak: 'break-all',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                  }}
                >
                  {link}
                </div>
                <div className="row gap-2 mt-3">
                  <button
                    type="button"
                    onClick={copyLink}
                    className="btn btn-accent"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    {copied ? 'Copied' : 'Copy link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="btn btn-ghost"
                  >
                    Done
                  </button>
                </div>
                {email ? (
                  <p className="text-xs muted mt-3" style={{ lineHeight: 1.55 }}>
                    We also emailed {email}. They have 72 hours to accept.
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

function ResellButton({ code, ticketType }: { code: string; ticketType: string }) {
  const [open, setOpen] = useState(false);
  const [ask, setAsk] = useState('');
  const [busy, setBusy] = useState(false);
  const [listed, setListed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    const ngn = parseFloat(ask);
    if (!isFinite(ngn) || ngn < 100) {
      setError('Ask must be at least ₦100.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.createResaleListing(token, {
        ticketCode: code,
        askKobo: Math.round(ngn * 100),
      });
      setListed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to list');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-glass"
        style={{ flex: 1, justifyContent: 'center' }}
      >
        <Icon name="wallet" size={14} /> Resell
      </button>
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="resell-dialog-title"
          className="transfer-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
              setListed(false);
            }
          }}
        >
          <div className="transfer-modal-card">
            <div className="between" style={{ alignItems: 'center' }}>
              <h2 id="resell-dialog-title" className="h-4" style={{ margin: 0 }}>
                List this ticket for resale
              </h2>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setListed(false);
                }}
                aria-label="Close"
                className="icon-btn"
                style={{ width: 32, height: 32 }}
              >
                <Icon name="close" size={14} />
              </button>
            </div>
            {!listed ? (
              <form onSubmit={submit} className="mt-4">
                <p className="text-sm muted" style={{ lineHeight: 1.55 }}>
                  Set your ask price in Naira. Buyers pay from their wallet;
                  you receive the ask minus a 10% platform fee. Cancel any
                  time before someone buys.
                </p>
                <div className="text-xs muted mt-3">
                  Tier: <span className="fw-600" style={{ color: 'var(--ink)' }}>{ticketType}</span>
                </div>
                <label htmlFor="resell-ask" className="sr-only">
                  Ask price (NGN)
                </label>
                <input
                  id="resell-ask"
                  type="number"
                  min={100}
                  step={50}
                  required
                  placeholder="Ask price (NGN)"
                  value={ask}
                  onChange={(e) => setAsk(e.target.value)}
                  className="input mt-4"
                />
                {error ? (
                  <p className="text-sm mt-3" style={{ color: 'var(--danger)' }}>
                    {error}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={busy}
                  className="btn btn-accent btn-lg mt-4"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {busy ? 'Listing…' : 'List on resale floor'}
                </button>
                <p className="text-xs muted mt-3" style={{ lineHeight: 1.55 }}>
                  Listings are public and capped at face value. Your QR stops
                  scanning the moment a buyer pays.
                </p>
              </form>
            ) : (
              <div className="mt-4" style={{ textAlign: 'center' }}>
                <div
                  aria-hidden="true"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    color: 'white',
                    display: 'grid',
                    placeItems: 'center',
                    margin: '0 auto 12px',
                  }}
                >
                  <Icon name="check" size={26} stroke={3} />
                </div>
                <h3 className="h-4">Listed</h3>
                <p className="text-sm muted mt-2" style={{ lineHeight: 1.55 }}>
                  Your ticket is now on the resale floor. We&apos;ll credit
                  your wallet the moment it sells.
                </p>
                <Link
                  href="/resale"
                  className="btn btn-ghost mt-4"
                  style={{ justifyContent: 'center' }}
                >
                  View resale marketplace <Icon name="arrow" size={13} />
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
