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

export type CreateOrderResponse =
  | {
      order: { id: string; paystackRef: string; totalKobo: number };
      paystack: { reference: string; authorizationUrl: string; publicKey: string };
    }
  | {
      order: {
        id: string;
        paystackRef: string;
        totalKobo: number;
        status: 'PAID';
        paidFromWallet: true;
      };
      paidFromWallet: true;
      walletBalanceAfterKobo: number;
    };

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
  isAdmin: boolean;
  memberships: Membership[];
}

export interface AdminOrganizer {
  id: string;
  slug: string;
  name: string;
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED';
  description: string | null;
  createdAt: string;
  approvedAt: string | null;
  commissionBps: number;
  eventCount: number;
  owner: { email: string; name: string | null } | null;
  payout: {
    bankCode: string | null;
    accountNumber: string | null;
    accountName: string | null;
    subaccountCode: string | null;
  };
  kycNotes: string | null;
}

export interface AdminStats {
  organizers: number;
  events: number;
  paidOrders: number;
  refundedOrders: number;
  grossKobo: number;
  buyerFeesKobo: number;
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
  refundedKobo: number;
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
    promoCode?: string;
    payFromWallet?: boolean;
    items: Array<{ ticketTypeId: string; quantity: number }>;
  }, token?: string) =>
    request<CreateOrderResponse>('/orders', {
      method: 'POST',
      body: JSON.stringify(body),
      ...(token ? { token } : {}),
    }),
  getOrderByReference: (reference: string) =>
    request<Order>(`/orders/by-reference/${reference}`),

  signup: (body: { email: string; password: string; name?: string }) =>
    request<AuthResponse>('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  signin: (body: { email: string; password: string }) =>
    request<AuthResponse>('/auth/signin', { method: 'POST', body: JSON.stringify(body) }),
  me: (token: string) => request<Me>('/auth/me', { token }),

  walletOverview: (token: string) =>
    request<{
      balanceKobo: number;
      transactions: Array<{
        id: string;
        amountKobo: number;
        type: 'TOP_UP' | 'PURCHASE' | 'REFUND' | 'ADJUSTMENT';
        balanceAfterKobo: number;
        note: string | null;
        createdAt: string;
      }>;
    }>('/me/wallet', { token }),
  walletTopUp: (token: string, body: { amountKobo: number; callbackUrl?: string }) =>
    request<{
      topUp: { id: string; amountKobo: number; paystackRef: string };
      paystack: { reference: string; authorizationUrl: string; publicKey: string };
    }>('/me/wallet/top-ups', { method: 'POST', token, body: JSON.stringify(body) }),

  myOrders: (token: string) =>
    request<Array<{
      id: string;
      status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'EXPIRED';
      totalKobo: number;
      paystackRef: string;
      paidAt: string | null;
      createdAt: string;
      event: { slug: string; title: string; venue: string; city: string; startsAt: string };
      ticketCount: number;
      tickets: Array<{ id: string; code: string; status: 'ISSUED' | 'SCANNED' | 'VOIDED' }>;
    }>>('/me/orders', { token }),

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
  listTeam: (token: string, organizerSlug: string) =>
    request<Array<{
      id: string;
      role: 'OWNER' | 'MANAGER' | 'FINANCE' | 'MARKETING' | 'SCANNER' | 'READ_ONLY';
      createdAt: string;
      user: { email: string; name: string | null };
    }>>(`/dashboard/organizers/${organizerSlug}/members`, { token }),
  inviteTeam: (token: string, organizerSlug: string, body: { email: string; role: string }) =>
    request<{
      id: string;
      role: string;
      user: { email: string; name: string | null };
      newAccount: boolean;
    }>(`/dashboard/organizers/${organizerSlug}/members`, {
      method: 'POST', token, body: JSON.stringify(body),
    }),
  updateTeamRole: (token: string, organizerSlug: string, memberId: string, role: string) =>
    request<{ id: string; role: string }>(
      `/dashboard/organizers/${organizerSlug}/members/${memberId}`,
      { method: 'PATCH', token, body: JSON.stringify({ role }) },
    ),
  removeTeamMember: (token: string, organizerSlug: string, memberId: string) =>
    request<{ id: string; removed: true }>(
      `/dashboard/organizers/${organizerSlug}/members/${memberId}`,
      { method: 'DELETE', token },
    ),

  listPromoCodes: (token: string, organizerSlug: string) =>
    request<Array<{
      id: string;
      code: string;
      type: 'PERCENTAGE' | 'FIXED';
      value: number;
      maxUses: number | null;
      usesCount: number;
      expiresAt: string | null;
      active: boolean;
      createdAt: string;
      event: { slug: string; title: string } | null;
    }>>(`/dashboard/organizers/${organizerSlug}/promo-codes`, { token }),
  createPromoCode: (
    token: string,
    organizerSlug: string,
    body: {
      code: string;
      type: 'PERCENTAGE' | 'FIXED';
      value: number;
      eventSlug?: string;
      maxUses?: number;
      expiresAt?: string;
    },
  ) =>
    request<{ id: string; code: string }>(
      `/dashboard/organizers/${organizerSlug}/promo-codes`,
      { method: 'POST', token, body: JSON.stringify(body) },
    ),
  deactivatePromoCode: (token: string, organizerSlug: string, id: string) =>
    request<{ id: string; active: false }>(
      `/dashboard/organizers/${organizerSlug}/promo-codes/${id}`,
      { method: 'DELETE', token },
    ),

  listBusRoutes: (token: string, organizerSlug: string) =>
    request<Array<{
      id: string;
      fromCity: string;
      toCity: string;
      durationMinutes: number;
      active: boolean;
      createdAt: string;
      _count: { trips: number };
    }>>(`/dashboard/organizers/${organizerSlug}/bus-routes`, { token }),
  createBusRoute: (
    token: string,
    organizerSlug: string,
    body: { fromCity: string; toCity: string; durationMinutes: number },
  ) =>
    request<{ id: string; fromCity: string; toCity: string }>(
      `/dashboard/organizers/${organizerSlug}/bus-routes`,
      { method: 'POST', token, body: JSON.stringify(body) },
    ),
  deactivateBusRoute: (token: string, organizerSlug: string, id: string) =>
    request<{ id: string; active: false }>(
      `/dashboard/organizers/${organizerSlug}/bus-routes/${id}`,
      { method: 'DELETE', token },
    ),

  searchBuses: (params: { from?: string; to?: string; date?: string }) => {
    const qs = new URLSearchParams();
    if (params.from) qs.set('from', params.from);
    if (params.to) qs.set('to', params.to);
    if (params.date) qs.set('date', params.date);
    return request<Array<{
      slug: string;
      title: string;
      departsAt: string;
      arrivesAt: string;
      boardingTerminal: string;
      organizer: { slug: string; name: string };
      route: { fromCity: string; toCity: string; durationMinutes: number } | null;
      ticketTypes: Array<{ id: string; name: string; priceKobo: number; capacity: number; sold: number }>;
    }>>(`/buses${qs.toString() ? `?${qs}` : ''}`);
  },
  busCities: () => request<{ cities: string[] }>('/buses/cities'),
  listEventOrders: (token: string, organizerSlug: string, eventSlug: string) =>
    request<DashboardOrdersResponse>(
      `/dashboard/organizers/${organizerSlug}/events/${eventSlug}/orders`,
      { token },
    ),
  scanTicket: (token: string, code: string) =>
    request<{
      ok: boolean;
      reason?: 'already_scanned' | 'voided';
      ticket: {
        id: string;
        code: string;
        status: 'ISSUED' | 'SCANNED' | 'VOIDED';
        scannedAt: string | null;
        ticketTypeName: string;
        eventTitle: string;
      };
    }>('/tickets/scan', { method: 'POST', token, body: JSON.stringify({ code }) }),

  listBanks: () => request<{ banks: Array<{ code: string; name: string }> }>('/payouts/banks'),
  getPayouts: (token: string, organizerSlug: string) =>
    request<{
      slug: string;
      name: string;
      commissionBps: number;
      commissionPercent: number;
      paystackSubaccountCode: string | null;
      payoutBankCode: string | null;
      payoutAccountNumber: string | null;
      payoutAccountName: string | null;
      bankName: string | null;
      isSetUp: boolean;
    }>(`/dashboard/organizers/${organizerSlug}/payouts`, { token }),
  setPayouts: (
    token: string,
    organizerSlug: string,
    body: { bankCode: string; accountNumber: string },
  ) =>
    request<{
      subaccountCode: string;
      bankCode: string;
      accountNumber: string;
      accountName: string;
      bankName: string | null;
    }>(`/dashboard/organizers/${organizerSlug}/payouts`, {
      method: 'POST',
      token,
      body: JSON.stringify(body),
    }),

  listApiKeys: (token: string, organizerSlug: string) =>
    request<Array<{
      id: string;
      name: string;
      prefix: string;
      lastUsedAt: string | null;
      revokedAt: string | null;
      createdAt: string;
    }>>(`/dashboard/organizers/${organizerSlug}/api-keys`, { token }),
  createApiKey: (token: string, organizerSlug: string, name: string) =>
    request<{ id: string; name: string; prefix: string; createdAt: string; key: string }>(
      `/dashboard/organizers/${organizerSlug}/api-keys`,
      { method: 'POST', token, body: JSON.stringify({ name }) },
    ),
  revokeApiKey: (token: string, organizerSlug: string, id: string) =>
    request<{ id: string; revoked: true }>(
      `/dashboard/organizers/${organizerSlug}/api-keys/${id}`,
      { method: 'DELETE', token },
    ),

  listWebhookEndpoints: (token: string, organizerSlug: string) =>
    request<Array<{
      id: string;
      url: string;
      eventTypes: string[];
      active: boolean;
      createdAt: string;
      signingSecretSuffix: string;
    }>>(`/dashboard/organizers/${organizerSlug}/webhook-endpoints`, { token }),
  createWebhookEndpoint: (
    token: string,
    organizerSlug: string,
    body: { url: string; eventTypes: string[] },
  ) =>
    request<{
      id: string;
      url: string;
      eventTypes: string[];
      active: boolean;
      createdAt: string;
      signingSecretSuffix: string;
      signingSecret: string;
    }>(`/dashboard/organizers/${organizerSlug}/webhook-endpoints`, {
      method: 'POST',
      token,
      body: JSON.stringify(body),
    }),
  deleteWebhookEndpoint: (token: string, organizerSlug: string, id: string) =>
    request<{ id: string; deleted: true }>(
      `/dashboard/organizers/${organizerSlug}/webhook-endpoints/${id}`,
      { method: 'DELETE', token },
    ),

  adminStats: (token: string) => request<AdminStats>('/admin/stats', { token }),
  adminListOrganizers: (token: string) =>
    request<AdminOrganizer[]>('/admin/organizers', { token }),
  adminApprove: (token: string, slug: string) =>
    request<{ slug: string; status: string; approvedAt: string }>(
      `/admin/organizers/${slug}/approve`, { method: 'POST', token },
    ),
  adminSuspend: (token: string, slug: string) =>
    request<{ slug: string; status: string }>(
      `/admin/organizers/${slug}/suspend`, { method: 'POST', token },
    ),
  adminSetCommission: (token: string, slug: string, bps: number) =>
    request<{ slug: string; commissionBps: number }>(
      `/admin/organizers/${slug}/commission`,
      { method: 'PATCH', token, body: JSON.stringify({ bps }) },
    ),
  adminSetKycNotes: (token: string, slug: string, notes: string) =>
    request<{ slug: string; kycNotes: string }>(
      `/admin/organizers/${slug}/kyc-notes`,
      { method: 'PATCH', token, body: JSON.stringify({ notes }) },
    ),

  refundOrder: (
    token: string,
    orderId: string,
    body?: { amountKobo?: number; reason?: string },
  ) =>
    request<{
      orderId: string;
      refundId?: string;
      status: 'REFUNDED' | 'PARTIAL';
      refundedAmountKobo: number;
      remainingKobo: number;
      partial: boolean;
      alreadyRefunded: boolean;
    }>(`/dashboard/orders/${orderId}/refund`, {
      method: 'POST',
      token,
      body: JSON.stringify(body ?? {}),
    }),
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
