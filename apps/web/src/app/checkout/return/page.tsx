import Link from 'next/link';
import { api, formatNgn, ticketQrUrl } from '@/lib/api';

interface PageProps {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}

export default async function CheckoutReturnPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const reference = params.reference ?? params.trxref;

  if (!reference) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Missing reference</h1>
        <p className="mt-2 text-gray-600">We couldn&apos;t find your transaction.</p>
        <Link href="/" className="mt-6 inline-block text-brand-dark hover:underline">Back home</Link>
      </div>
    );
  }

  const order = await api.getOrderByReference(reference).catch(() => null);

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Order not found</h1>
        <p className="mt-2 text-gray-600">Reference: <code>{reference}</code></p>
      </div>
    );
  }

  if (order.status !== 'PAID') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-2xl font-bold text-amber-900">Confirming your payment…</h1>
          <p className="mt-2 text-amber-800">
            Status: <strong>{order.status}</strong>. This page updates once we receive
            Paystack&apos;s confirmation. If this takes more than a minute, refresh.
          </p>
          <form action="" className="mt-4">
            <button type="submit" className="bg-amber-700 text-white px-4 py-2 rounded-md">
              Refresh
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="rounded-lg border border-green-200 bg-green-50 p-6">
        <div className="text-sm font-medium text-green-700">Payment received</div>
        <h1 className="mt-1 text-2xl font-bold text-green-900">You&apos;re going to {order.event.title}</h1>
        <div className="mt-2 text-green-800 text-sm">
          {order.event.venue}, {order.event.city} · Total {formatNgn(order.totalKobo)}
        </div>
      </div>

      <h2 className="mt-10 text-lg font-semibold">Your tickets ({order.tickets.length})</h2>
      <ul className="mt-4 space-y-4">
        {order.tickets.map((t) => (
          <li key={t.id} className="border border-gray-200 rounded-lg p-4 flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ticketQrUrl(t.code)} alt={`QR code for ticket ${t.code}`} className="w-32 h-32" />
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">{t.status}</div>
              <div className="font-mono text-sm mt-1">{t.code}</div>
              <div className="text-sm text-gray-600 mt-2">
                Show this QR at the gate. One scan only.
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
