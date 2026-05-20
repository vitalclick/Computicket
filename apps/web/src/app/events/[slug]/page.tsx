import { notFound } from 'next/navigation';
import { api, formatDate, formatNgn } from '@/lib/api';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await api.getEvent(slug).catch(() => null);
  if (!event) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-sm text-brand font-medium">{event.organizer.name}</div>
      <h1 className="mt-2 text-3xl md:text-4xl font-bold">{event.title}</h1>
      <div className="mt-3 text-gray-600">
        <div>{event.venue}, {event.city}</div>
        <div>{formatDate(event.startsAt)} — {formatDate(event.endsAt)}</div>
      </div>

      {event.description && (
        <p className="mt-6 text-gray-700 leading-relaxed">{event.description}</p>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Tickets</h2>
        <ul className="space-y-3">
          {event.ticketTypes.map((tt) => {
            const remaining = tt.capacity - tt.sold;
            const soldOut = remaining <= 0;
            return (
              <li
                key={tt.id}
                className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{tt.name}</div>
                  {tt.description && (
                    <div className="text-sm text-gray-600">{tt.description}</div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {soldOut ? 'Sold out' : `${remaining} remaining`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatNgn(tt.priceKobo)}</div>
                  <button
                    type="button"
                    disabled={soldOut}
                    className="mt-2 bg-brand text-white text-sm px-4 py-2 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-brand-dark"
                  >
                    {soldOut ? 'Sold out' : 'Buy'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
