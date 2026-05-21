/**
 * Mock content for design surfaces that don't yet have a real data source.
 * Mirrors design/CompuTicket/data.jsx so the marketplace pages can render
 * the cinematic layout end-to-end before every feed is wired up.
 */

export type Ph =
  | 'ph-1' | 'ph-2' | 'ph-3' | 'ph-4' | 'ph-5' | 'ph-6' | 'ph-7' | 'ph-8' | 'ph-9';

export interface DesignEvent {
  id: string;
  title: string;
  venue: string;
  city: string;
  date: string;
  time?: string;
  priceFrom: number;
  attending: number;
  capacity: number;
  ph: Ph;
  tag: string;
  live?: boolean;
  vip?: boolean;
  soon?: boolean;
  almostSold?: boolean;
  countdown: string;
  organizer?: string;
  verified?: boolean;
}

export interface DesignConcert {
  id: string;
  artist: string;
  tour: string;
  venue: string;
  city: string;
  date: string;
  priceFrom: number;
  ph: Ph;
  vip?: boolean;
}

export interface DesignFlight {
  id: string;
  from: string;
  to: string;
  fromCity: string;
  toCity: string;
  airline: string;
  duration: string;
  price: number;
  trend: 'up' | 'down' | 'flat';
  change: string;
  direct: boolean;
  international?: boolean;
  ph: Ph;
}

export interface DesignBus {
  id: string;
  from: string;
  to: string;
  operator: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  seats: number;
  vehicle: string;
}

export interface DesignHotel {
  id: string;
  name: string;
  city: string;
  rating: number;
  reviews: number;
  price: number;
  ph: Ph;
  tags: string[];
  badge?: string;
}

export interface DesignExperience {
  id: string;
  title: string;
  duration: string;
  price: number;
  ph: Ph;
  category: string;
}

export const DESIGN_TRENDING: DesignEvent[] = [
  { id: 'e1', title: 'Burna Boy — African Giant Returns', venue: 'Eko Convention Centre', city: 'Lagos', date: 'Sat 23 May', time: '9:00 PM', priceFrom: 25000, attending: 14820, capacity: 18000, ph: 'ph-1', tag: 'Afrobeats', live: true, vip: true, countdown: '02 days · 14h', organizer: 'Livespot360', verified: true },
  { id: 'e2', title: 'Basketmouth Live — Lord of the Mics', venue: 'Landmark Centre', city: 'Lagos', date: 'Fri 29 May', time: '7:30 PM', priceFrom: 15000, attending: 3200, capacity: 4500, ph: 'ph-3', tag: 'Comedy', soon: true, countdown: '08 days · 03h', organizer: 'BasketmouthLive', verified: true },
  { id: 'e3', title: 'Asake — Lungu Boy World Tour', venue: 'Tafawa Balewa Square', city: 'Lagos', date: 'Sun 07 Jun', time: '8:00 PM', priceFrom: 30000, attending: 21030, capacity: 22000, ph: 'ph-2', tag: 'Afrobeats', almostSold: true, vip: true, countdown: '17 days · 11h', organizer: 'YBNL Nation', verified: true },
  { id: 'e4', title: 'Lagos International Jazz Festival', venue: 'Muri Okunola Park', city: 'Lagos', date: 'Sat 14 Jun', time: '6:00 PM', priceFrom: 8000, attending: 2890, capacity: 6000, ph: 'ph-5', tag: 'Jazz', countdown: '24 days', organizer: 'InspiroAfrica' },
  { id: 'e5', title: 'The Lion & The Jewel — Theatre Republic', venue: 'Terra Kulture', city: 'Lagos', date: 'Fri 30 May', time: '7:00 PM', priceFrom: 6500, attending: 412, capacity: 520, ph: 'ph-6', tag: 'Theatre', almostSold: true, countdown: '09 days · 07h', organizer: 'Terra Kulture' },
  { id: 'e6', title: 'Detty December Reunion', venue: 'Hard Rock Cafe Beach', city: 'Lagos', date: 'Wed 24 Dec', time: '10:00 PM', priceFrom: 20000, attending: 1100, capacity: 3000, ph: 'ph-4', tag: 'Festival', countdown: '217 days', organizer: 'Smade Entertainment' },
];

export const DESIGN_CONCERTS: DesignConcert[] = [
  { id: 'c1', artist: 'Tems', tour: 'Born In The Wild', venue: 'Eko Hotel Beach', city: 'Lagos', date: '21 Jun', priceFrom: 45000, ph: 'ph-2', vip: true },
  { id: 'c2', artist: 'Ayra Starr', tour: 'The Year I Turned 21', venue: 'Landmark Centre', city: 'Lagos', date: '05 Jul', priceFrom: 22000, ph: 'ph-6', vip: true },
  { id: 'c3', artist: 'Davido', tour: 'Timeless Tour', venue: 'MKO Abiola Stadium', city: 'Abuja', date: '12 Jul', priceFrom: 18000, ph: 'ph-4', vip: true },
  { id: 'c4', artist: 'Rema', tour: 'HEIS World Tour', venue: 'Eko Convention', city: 'Lagos', date: '02 Aug', priceFrom: 25000, ph: 'ph-3' },
  { id: 'c5', artist: 'Wizkid', tour: 'Morayo World Tour', venue: 'Teslim Balogun', city: 'Lagos', date: '15 Aug', priceFrom: 30000, ph: 'ph-1', vip: true },
];

export const DESIGN_FLIGHTS: DesignFlight[] = [
  { id: 'f1', from: 'LOS', to: 'ABV', fromCity: 'Lagos', toCity: 'Abuja', airline: 'Air Peace', duration: '1h 10m', price: 62500, trend: 'down', change: '-12%', direct: true, ph: 'ph-7' },
  { id: 'f2', from: 'LOS', to: 'PHC', fromCity: 'Lagos', toCity: 'Port Harcourt', airline: 'Ibom Air', duration: '1h 5m', price: 58000, trend: 'flat', change: '0%', direct: true, ph: 'ph-2' },
  { id: 'f3', from: 'ABV', to: 'KAN', fromCity: 'Abuja', toCity: 'Kano', airline: 'Arik Air', duration: '1h 20m', price: 71200, trend: 'up', change: '+6%', direct: true, ph: 'ph-5' },
  { id: 'f4', from: 'LOS', to: 'ACC', fromCity: 'Lagos', toCity: 'Accra', airline: 'Air Peace', duration: '1h 5m', price: 185000, trend: 'down', change: '-9%', direct: true, international: true, ph: 'ph-9' },
  { id: 'f5', from: 'LOS', to: 'DXB', fromCity: 'Lagos', toCity: 'Dubai', airline: 'Emirates', duration: '7h 50m', price: 725000, trend: 'down', change: '-14%', direct: true, international: true, ph: 'ph-8' },
];

export const DESIGN_BUSES: DesignBus[] = [
  { id: 'b1', from: 'Lagos (Jibowu)', to: 'Abuja (Utako)', operator: 'GIGM', departure: '06:30', arrival: '15:45', duration: '9h 15m', price: 18500, seats: 18, vehicle: 'Toyota Coaster · AC' },
  { id: 'b2', from: 'Lagos (Yaba)', to: 'Benin City', operator: 'Chisco', departure: '07:00', arrival: '13:30', duration: '6h 30m', price: 12000, seats: 6, vehicle: 'Marcopolo · WiFi' },
  { id: 'b3', from: 'Lagos (Ojota)', to: 'Port Harcourt', operator: 'ABC Transport', departure: '05:00', arrival: '15:00', duration: '10h 00m', price: 21500, seats: 22, vehicle: 'Coaster · AC · WiFi' },
  { id: 'b4', from: 'Abuja (Utako)', to: 'Kaduna', operator: 'GIGM', departure: '08:30', arrival: '11:30', duration: '3h 00m', price: 8000, seats: 14, vehicle: 'Sienna · AC' },
];

export const DESIGN_HOTELS: DesignHotel[] = [
  { id: 'h1', name: 'The Wheatbaker', city: 'Ikoyi, Lagos', rating: 4.9, reviews: 1284, price: 185000, ph: 'ph-1', tags: ['Pool', 'Spa', 'Fine dining'], badge: "Editor's pick" },
  { id: 'h2', name: 'Eko Hotel & Suites', city: 'Victoria Island, Lagos', rating: 4.7, reviews: 8932, price: 142000, ph: 'ph-2', tags: ['Beach access', 'Casino', '5★'] },
  { id: 'h3', name: 'Transcorp Hilton Abuja', city: 'Maitama, Abuja', rating: 4.8, reviews: 5410, price: 165000, ph: 'ph-4', tags: ['Pool', 'Business', 'Spa'] },
  { id: 'h4', name: 'Lagos Continental', city: 'Victoria Island, Lagos', rating: 4.6, reviews: 3120, price: 128000, ph: 'ph-3', tags: ['Pool', 'Gym', '5★'] },
  { id: 'h5', name: 'Radisson Blu Anchorage', city: 'Victoria Island, Lagos', rating: 4.7, reviews: 2856, price: 135000, ph: 'ph-5', tags: ['Waterfront', 'Pool'] },
  { id: 'h6', name: 'La Campagne Tropicana', city: 'Lekki, Lagos', rating: 4.5, reviews: 1903, price: 98000, ph: 'ph-6', tags: ['Resort', 'Beach', 'Family'], badge: 'Weekend favorite' },
];

export const DESIGN_EXPERIENCES: DesignExperience[] = [
  { id: 'x1', title: 'Sunset Yacht Cruise — Lagos Lagoon', duration: '3 hours', price: 35000, ph: 'ph-2', category: 'Lifestyle' },
  { id: 'x2', title: 'Nike Art Gallery Curated Tour', duration: '2 hours', price: 8000, ph: 'ph-6', category: 'Culture' },
  { id: 'x3', title: 'Lekki Conservation Centre Canopy Walk', duration: '4 hours', price: 5000, ph: 'ph-5', category: 'Family' },
  { id: 'x4', title: 'Detty Brunch at Quilox Beach', duration: '5 hours', price: 28000, ph: 'ph-3', category: 'Food' },
];

export const LIVE_TICKER: string[] = [
  'Maryam booked Burna Boy · Eko Centre',
  'Tobi reserved LOS → ABV · Air Peace',
  'Chika picked seat B14 · Asake Tour',
  'Emeka booked The Wheatbaker · 2 nights',
  'Fatima paid for Basketmouth · VIP',
  'Adebayo just won 5,000 reward points',
  'Ngozi booked yacht cruise · Sat 7pm',
];

const PH_POOL: Ph[] = ['ph-1', 'ph-2', 'ph-3', 'ph-4', 'ph-5', 'ph-6', 'ph-7', 'ph-8', 'ph-9'];

export function phForId(id: string): Ph {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return PH_POOL[hash % PH_POOL.length] ?? 'ph-1';
}

export function formatNaira(naira: number): string {
  return '₦' + naira.toLocaleString('en-NG');
}
