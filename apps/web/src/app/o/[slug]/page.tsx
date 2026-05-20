import Link from 'next/link';
import { notFound } from 'next/navigation';
import { API_URL, formatDate, formatNgn } from '@/lib/api';

interface WlResponse {
  organizer: {
    slug: string;
    name: string;
    description: string | null;
    logoUrl: string | null;
    website: string | null;
    customDomain: string | null;
    brandColor: string | null;
  };
  events: Array<{
    id: string;
    slug: string;
    title: string;
    venue: string;
    city: string;
    startsAt: string;
    ticketTypes: Array<{ priceKobo: number }>;
  }>;
}

async function fetchWhitelabel(slug: string): Promise<WlResponse | null> {
  const res = await fetch(`${API_URL}/whitelabel/by-slug/${slug}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function WhitelabelPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await fetchWhitelabel(slug);
  if (!data) notFound();
  const brand = data.organizer.brandColor ?? '#008751';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#ffffff' }}>
      <header style={{ background: brand }} className="text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-xs uppercase tracking-wide opacity-80">Powered by Computicket</div>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold">{data.organizer.name}</h1>
          {data.organizer.description && (
            <p className="mt-3 max-w-2xl opacity-90">{data.organizer.description}</p>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full">
        <h2 className="text-xl font-semibold">Upcoming events</h2>
        {data.events.length === 0 ? (
          <p className="mt-4 text-gray-500">No events on sale right now.</p>
        ) : (
          <ul className="mt-4 grid md:grid-cols-2 gap-4">
            {data.events.map((e) => {
              const minPrice = Math.min(...e.ticketTypes.map((t) => t.priceKobo));
              return (
                <li key={e.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                  <Link href={`/events/${e.slug}`} className="block">
                    <h3 className="font-semibold">{e.title}</h3>
                    <div className="text-sm text-gray-600 mt-1">{e.venue}, {e.city}</div>
                    <div className="text-sm text-gray-600">{formatDate(e.startsAt)}</div>
                    <div className="mt-3 text-sm">From <span className="font-semibold">{formatNgn(minPrice)}</span></div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <footer className="border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 text-xs text-gray-500 flex justify-between">
          <span>© {new Date().getFullYear()} {data.organizer.name}</span>
          <a href="https://computicket.ng" className="hover:text-brand">Powered by Computicket Nigeria</a>
        </div>
      </footer>
    </div>
  );
}
