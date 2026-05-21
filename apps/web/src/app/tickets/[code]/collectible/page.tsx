'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { getToken } from '@/lib/auth';

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
  ticket: { code: string; event: string; tokenId: string; tokenURI: string; claimedWallet: string };
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
      setData((prev) => (prev ? { ...prev, claimedWallet: wallet, claimedAt: new Date().toISOString() } : prev));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Claim failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (error) return <div className="max-w-2xl mx-auto px-4 py-16 text-red-600">{error}</div>;
  if (!data) return <div className="max-w-2xl mx-auto px-4 py-16 text-gray-500">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold">Your collectible</h1>
      <p className="text-sm text-gray-500 mt-1">
        Every paid Computicket ticket has a deterministic NFT identity. Attach an
        EVM wallet to claim a signed mint voucher you can redeem later.
      </p>

      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.imageUrl} alt={`QR code for ticket ${data.code}`} className="w-full aspect-square object-contain bg-gray-50" />
          <div className="p-4 space-y-1 text-sm">
            <div className="font-semibold">{data.event.title}</div>
            <div className="text-gray-600">{data.event.venue}, {data.event.city}</div>
            <div className="text-gray-600">{new Date(data.event.startsAt).toLocaleString('en-NG')}</div>
            <div className="text-gray-500 text-xs">Tier: {data.ticketType}</div>
            <div className="text-gray-500 text-xs">Status: {data.status}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm">
            <div className="text-gray-500 text-xs uppercase tracking-wide">Token ID</div>
            <div className="font-mono break-all mt-1">{data.tokenId}</div>
            <div className="text-gray-500 text-xs uppercase tracking-wide mt-3">Metadata URI</div>
            <a href={data.tokenURI} target="_blank" rel="noreferrer" className="text-emerald-600 break-all text-xs">
              {data.tokenURI}
            </a>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <label className="text-xs uppercase tracking-wide text-gray-500" htmlFor="wallet">
              EVM wallet address
            </label>
            <input
              id="wallet"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="0x…"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono"
            />
            <button
              onClick={claim}
              disabled={!wallet || submitting}
              className="mt-3 w-full rounded-lg bg-emerald-600 text-white py-2 text-sm font-medium disabled:opacity-50"
            >
              {data.claimedWallet ? 'Re-issue voucher' : 'Claim collectible'}
            </button>
            {data.claimedWallet ? (
              <p className="mt-2 text-xs text-gray-500">
                Already claimed to <span className="font-mono">{data.claimedWallet}</span>
                {data.claimedAt ? ` on ${new Date(data.claimedAt).toLocaleDateString('en-NG')}` : ''}.
              </p>
            ) : null}
          </div>

          {voucher ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
              <div className="font-semibold text-emerald-900">Mint voucher</div>
              <p className="text-emerald-800 text-xs mt-1">
                Save this voucher. A future lazy-mint contract will verify the
                signature and mint <span className="font-mono">tokenId {voucher.voucher.tokenId}</span> to your wallet.
              </p>
              <pre className="mt-2 text-[10px] bg-white border border-emerald-200 rounded p-2 overflow-x-auto font-mono">
{JSON.stringify(voucher.voucher, null, 2)}
              </pre>
              <p className="text-[11px] text-emerald-800 mt-2">{voucher.note}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
