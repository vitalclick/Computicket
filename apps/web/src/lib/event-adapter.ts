import type { EventSummary } from './api';
import {
  type DesignEvent,
  phForId,
} from './design-data';

/**
 * Synthesise a `DesignEvent` from the live API `EventSummary` so the
 * cinematic card layout from the design system can render against real data.
 * Fields the API doesn't have yet (attending, tag, countdown) get sensible
 * defaults derived from the available data.
 */
export function toDesignEvent(e: EventSummary): DesignEvent {
  const capacity = e.ticketTypes.reduce((acc, t) => acc + t.capacity, 0);
  const sold = e.ticketTypes.reduce((acc, t) => acc + t.sold, 0);
  const priceFrom = e.ticketTypes.length
    ? Math.min(...e.ticketTypes.map((t) => t.priceKobo)) / 100
    : 0;

  const startsAt = new Date(e.startsAt);
  const dateStr = startsAt.toLocaleDateString('en-NG', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
  const timeStr = startsAt.toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const msToEvent = startsAt.getTime() - Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.max(0, Math.floor(msToEvent / dayMs));
  const hours = Math.max(0, Math.floor((msToEvent % dayMs) / (60 * 60 * 1000)));
  const countdown =
    msToEvent <= 0
      ? 'happening now'
      : days > 0
        ? `${String(days).padStart(2, '0')} days · ${hours}h`
        : `${hours}h`;

  const pctSold = capacity > 0 ? sold / capacity : 0;

  return {
    id: e.id,
    title: e.title,
    venue: e.venue,
    city: e.city,
    date: dateStr,
    time: timeStr,
    priceFrom,
    attending: sold,
    capacity: capacity || 1,
    ph: phForId(e.slug),
    tag: e.organizer.name,
    almostSold: pctSold >= 0.85,
    countdown,
    organizer: e.organizer.name,
    verified: true,
  };
}
