import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';

const HOTELBEDS_BASE = 'https://api.test.hotelbeds.com';

interface HotelBedsAvailability {
  hotels?: {
    hotels?: Array<{
      code: number;
      name: string;
      destinationName: string;
      categoryName?: string;
      minRate: string;
      currency: string;
      rooms?: Array<{ rates?: Array<{ rateKey: string; net: string }> }>;
    }>;
  };
}

export interface ExternalHotelOffer {
  source: 'hotelbeds';
  externalId: string;
  name: string;
  city: string;
  category?: string;
  rateKey: string;
  priceMinor: number;
  currency: string;
}

@Injectable()
export class HotelBedsClient {
  private readonly logger = new Logger(HotelBedsClient.name);

  isConfigured(): boolean {
    return !!(process.env.HOTELBEDS_API_KEY && process.env.HOTELBEDS_API_SECRET);
  }

  /**
   * HotelBeds authenticates via Api-key + Signature (SHA256 of
   * apikey + secret + epoch-seconds). Token expires every minute so we
   * sign on every call.
   */
  private headers(): Record<string, string> {
    const apiKey = process.env.HOTELBEDS_API_KEY!;
    const secret = process.env.HOTELBEDS_API_SECRET!;
    const ts = Math.floor(Date.now() / 1000).toString();
    const signature = createHash('sha256').update(apiKey + secret + ts).digest('hex');
    return {
      'Api-key': apiKey,
      'X-Signature': signature,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
  }

  /**
   * Free-text search by destination code (e.g. "LAG" for Lagos). The
   * HotelBeds catalogue uses its own destination codes — callers can
   * pass the city name and we'll let the API resolve it via a
   * destinations cache (the cache is out of scope here; this method
   * only handles the API call).
   */
  async availability(input: {
    destinationCode: string;
    checkIn: string;
    checkOut: string;
    occupants?: number;
  }): Promise<ExternalHotelOffer[]> {
    if (!this.isConfigured()) return [];
    try {
      const res = await fetch(`${HOTELBEDS_BASE}/hotel-api/1.0/hotels`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({
          stay: { checkIn: input.checkIn, checkOut: input.checkOut },
          occupancies: [{ rooms: 1, adults: input.occupants ?? 2, children: 0 }],
          destination: { code: input.destinationCode },
        }),
      });
      if (!res.ok) {
        this.logger.warn(`HotelBeds availability failed (${res.status})`);
        return [];
      }
      const body = (await res.json()) as HotelBedsAvailability;
      const hotels = body.hotels?.hotels ?? [];
      return hotels
        .map((h): ExternalHotelOffer | null => {
          const rateKey = h.rooms?.[0]?.rates?.[0]?.rateKey;
          if (!rateKey) return null;
          return {
            source: 'hotelbeds',
            externalId: String(h.code),
            name: h.name,
            city: h.destinationName,
            category: h.categoryName,
            rateKey,
            priceMinor: Math.round(parseFloat(h.minRate) * 100),
            currency: h.currency,
          };
        })
        .filter((h): h is ExternalHotelOffer => h !== null);
    } catch (err) {
      this.logger.warn(
        `HotelBeds threw — falling back to local-only: ${err instanceof Error ? err.message : String(err)}`,
      );
      return [];
    }
  }
}
