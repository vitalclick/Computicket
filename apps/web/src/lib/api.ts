const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1';

export interface TicketType {
  id: string;
  name: string;
  description?: string | null;
  priceKobo: number;
  capacity: number;
  sold: number;
}

export interface EventSummary {
  id: string;
  slug: string;
  title: string;
  venue: string;
  city: string;
  startsAt: string;
  endsAt: string;
  coverUrl?: string | null;
  organizer: { slug: string; name: string };
  ticketTypes: TicketType[];
}

export interface EventDetail extends EventSummary {
  description?: string | null;
  organizer: { slug: string; name: string; description?: string | null };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  listEvents: (city?: string) =>
    request<EventSummary[]>(`/events${city ? `?city=${encodeURIComponent(city)}` : ''}`),
  getEvent: (slug: string) => request<EventDetail>(`/events/${slug}`),
};

export function formatNgn(kobo: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-NG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
