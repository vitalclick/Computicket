import { Injectable, Logger } from '@nestjs/common';

const DUFFEL_BASE = 'https://api.duffel.com';
const DUFFEL_VERSION = 'v2';

interface DuffelSlice { origin: string; destination: string; departure_date: string }
interface DuffelOfferRequest {
  data: { id: string; offers?: DuffelOffer[]; slices: DuffelSlice[] };
}
interface DuffelSegment {
  origin: { iata_code: string; name: string };
  destination: { iata_code: string; name: string };
  departing_at: string;
  arriving_at: string;
  marketing_carrier: { iata_code: string; name: string };
  marketing_carrier_flight_number: string;
}
interface DuffelOfferSlice { segments: DuffelSegment[] }
interface DuffelOffer {
  id: string;
  total_amount: string; // string-encoded decimal
  total_currency: string;
  slices: DuffelOfferSlice[];
}

export interface ExternalFlightOffer {
  source: 'duffel';
  externalId: string;
  carrier: string;
  flightNumber: string;
  fromAirport: string;
  toAirport: string;
  departsAt: Date;
  arrivesAt: Date;
  priceKobo: number;
  currency: string;
}

@Injectable()
export class DuffelClient {
  private readonly logger = new Logger(DuffelClient.name);

  isConfigured(): boolean {
    return !!process.env.DUFFEL_API_KEY;
  }

  /**
   * Single-slice (one-way) search. Returns mapped offers in our internal
   * shape; converts Duffel's NGN/USD/etc. to kobo so callers can mix
   * external and local results in one list.
   */
  async searchOneWay(input: {
    from: string;
    to: string;
    date: string;
    passengers?: number;
  }): Promise<ExternalFlightOffer[]> {
    if (!this.isConfigured()) return [];

    try {
      // 1. Create an offer request
      const orRes = await fetch(`${DUFFEL_BASE}/air/offer_requests?return_offers=true`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({
          data: {
            slices: [{ origin: input.from, destination: input.to, departure_date: input.date }],
            passengers: Array.from({ length: input.passengers ?? 1 }, () => ({ type: 'adult' })),
            cabin_class: 'economy',
          },
        }),
      });
      if (!orRes.ok) {
        this.logger.warn(`Duffel offer_requests failed (${orRes.status}); returning empty results`);
        return [];
      }
      const orBody = (await orRes.json()) as DuffelOfferRequest;
      const offers = orBody.data.offers ?? [];
      return offers
        .map((o) => this.mapOffer(o))
        .filter((o): o is ExternalFlightOffer => o !== null);
    } catch (err) {
      this.logger.warn(
        `Duffel call threw — falling back to local-only results: ${err instanceof Error ? err.message : String(err)}`,
      );
      return [];
    }
  }

  private headers(): Record<string, string> {
    return {
      authorization: `Bearer ${process.env.DUFFEL_API_KEY}`,
      'duffel-version': DUFFEL_VERSION,
      'content-type': 'application/json',
      accept: 'application/json',
    };
  }

  private mapOffer(o: DuffelOffer): ExternalFlightOffer | null {
    const slice = o.slices[0];
    if (!slice) return null;
    const first = slice.segments[0];
    const last = slice.segments[slice.segments.length - 1];
    if (!first || !last) return null;
    // Duffel returns decimal strings (e.g. "150000.00") in the offer's
    // currency. We persist amounts in NGN kobo; for non-NGN currencies
    // we still convert to integer minor units and tag the currency so
    // the UI can decide what to render.
    const minorUnits = Math.round(parseFloat(o.total_amount) * 100);
    return {
      source: 'duffel',
      externalId: o.id,
      carrier: first.marketing_carrier.name,
      flightNumber: `${first.marketing_carrier.iata_code}${first.marketing_carrier_flight_number}`,
      fromAirport: first.origin.iata_code,
      toAirport: last.destination.iata_code,
      departsAt: new Date(first.departing_at),
      arrivesAt: new Date(last.arriving_at),
      priceKobo: minorUnits,
      currency: o.total_currency,
    };
  }
}
