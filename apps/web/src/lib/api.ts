export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1';

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

async function request<T>(path: string, init?: RequestInit & { token?: string }): Promise<T> {
  const { token, headers, ...rest } = init ?? {};
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    let message = `API ${res.status}`;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      const msg = Array.isArray(body.message) ? body.message.join('; ') : body.message;
      if (msg) message = msg;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export interface Ticket {
  id: string;
  code: string;
  status: 'ISSUED' | 'SCANNED' | 'VOIDED';
}

export interface Order {
  id: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'EXPIRED';
  buyerEmail: string;
  buyerName?: string | null;
  totalKobo: number;
  paystackRef: string;
  event: { slug: string; title: string; venue: string; city: string; startsAt: string };
  tickets: Ticket[];
}

export interface CreateOrderResponse {
  order: { id: string; paystackRef: string; totalKobo: number };
  paystack: { reference: string; authorizationUrl: string; publicKey: string };
}

export interface AuthResponse {
  token: string;
  user: { id: string; email: string; name?: string | null };
}

export interface Membership {
  role: 'OWNER' | 'MANAGER' | 'FINANCE' | 'MARKETING' | 'SCANNER' | 'READ_ONLY';
  organizer: { id: string; slug: string; name: string; status: string };
}

export interface Me {
  id: string;
  email: string;
  name: string | null;
  memberships: Membership[];
}

export interface DashboardEvent {
  id: string;
  slug: string;
  title: string;
  venue: string;
  city: string;
  startsAt: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  capacity: number;
  sold: number;
  held: number;
  revenueKobo: number;
  paidOrders: number;
  ticketTypes: Array<{
    id: string;
    name: string;
    priceKobo: number;
    capacity: number;
    sold: number;
    held: number;
  }>;
}

export interface DashboardOverview {
  organizer: { id: string; slug: string; name: string; status: string; description: string | null };
  events: DashboardEvent[];
}

export interface DashboardOrder {
  id: string;
  status: 'PAID' | 'REFUNDED';
  buyerEmail: string;
  buyerName: string | null;
  totalKobo: number;
  paystackRef: string;
  paidAt: string | null;
  ticketCount: number;
  items: Array<{ ticketTypeName: string; quantity: number; unitPriceKobo: number }>;
}

export interface DashboardOrdersResponse {
  event: { id: string; slug: string; title: string };
  orders: DashboardOrder[];
}

export const api = {
  listEvents: (city?: string) =>
    request<EventSummary[]>(`/events${city ? `?city=${encodeURIComponent(city)}` : ''}`),
  getEvent: (slug: string) => request<EventDetail>(`/events/${slug}`),
  createOrder: (body: {
    eventSlug: string;
    buyerEmail: string;
    buyerName?: string;
    buyerPhone?: string;
    callbackUrl?: string;
    items: Array<{ ticketTypeId: string; quantity: number }>;
  }) => request<CreateOrderResponse>('/orders', { method: 'POST', body: JSON.stringify(body) }),
  getOrderByReference: (reference: string) =>
    request<Order>(`/orders/by-reference/${reference}`),

  signup: (body: { email: string; password: string; name?: string }) =>
    request<AuthResponse>('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  signin: (body: { email: string; password: string }) =>
    request<AuthResponse>('/auth/signin', { method: 'POST', body: JSON.stringify(body) }),
  me: (token: string) => request<Me>('/auth/me', { token }),

  createOrganizer: (token: string, body: { name: string; slug: string; description?: string }) =>
    request<{ id: string; slug: string; name: string }>('/organizers', {
      method: 'POST',
      token,
      body: JSON.stringify(body),
    }),
  dashboardOverview: (token: string, organizerSlug: string) =>
    request<DashboardOverview>(`/dashboard/organizers/${organizerSlug}`, { token }),
  createEvent: (
    token: string,
    body: {
      organizerSlug: string;
      slug: string;
      title: string;
      description?: string;
      venue: string;
      city: string;
      startsAt: string;
      endsAt: string;
      ticketTypes: Array<{ name: string; priceKobo: number; capacity: number }>;
    },
  ) =>
    request<{ id: string; slug: string }>('/events', {
      method: 'POST',
      token,
      body: JSON.stringify(body),
    }),
  publishEvent: (token: string, slug: string) =>
    request<{ id: string; status: string }>(`/events/${slug}/publish`, {
      method: 'POST',
      token,
    }),
  listEventOrders: (token: string, organizerSlug: string, eventSlug: string) =>
    request<DashboardOrdersResponse>(
      `/dashboard/organizers/${organizerSlug}/events/${eventSlug}/orders`,
      { token },
    ),
  refundOrder: (token: string, orderId: string) =>
    request<{
      orderId: string;
      status: 'REFUNDED';
      refundedAmountKobo: number;
      voidedTickets: number;
      alreadyRefunded: boolean;
    }>(`/dashboard/orders/${orderId}/refund`, { method: 'POST', token }),
};

export function ticketQrUrl(code: string): string {
  return `${API_URL}/tickets/${code}/qr.png`;
}

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
