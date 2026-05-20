import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1';
// Hosts we never treat as white-label (the marketplace itself + local dev).
const APEX_HOSTS = new Set([
  'computicket.ng', 'www.computicket.ng',
  'localhost', '127.0.0.1', '0.0.0.0',
  '192.0.2.2', // CI-style placeholders
]);

export async function middleware(req: NextRequest) {
  const host = (req.headers.get('host') ?? '').split(':')[0]?.toLowerCase();
  if (!host || APEX_HOSTS.has(host)) return NextResponse.next();

  // Only attempt resolution on the root path — once we rewrite, downstream
  // navigation stays inside the organizer's space.
  if (req.nextUrl.pathname !== '/') return NextResponse.next();

  try {
    const res = await fetch(`${API_URL}/whitelabel/resolve?host=${encodeURIComponent(host)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return NextResponse.next();
    const data = (await res.json()) as { slug?: string } | null;
    if (data?.slug) {
      const url = req.nextUrl.clone();
      url.pathname = `/o/${data.slug}`;
      return NextResponse.rewrite(url);
    }
  } catch {
    /* fall through */
  }
  return NextResponse.next();
}

export const config = {
  // Only run on top-level routes; skip _next, api, favicon, widget.js
  matcher: ['/((?!_next|api|favicon.ico|widget.js).*)'],
};
