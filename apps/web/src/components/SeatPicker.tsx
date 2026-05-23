'use client';

import { useEffect, useState } from 'react';
import { Icon } from './Icon';
import { api } from '@/lib/api';

interface Props {
  ticketTypeId: string;
  /** Max seats the buyer can pick (typically capped at 10). */
  max: number;
  /** Already-selected seat ids — used when re-opening to edit a pick. */
  initialSelected?: string[];
  onClose: () => void;
  /** Returns `(seatIds, seatLabels)` so BuyForm can display "A12, A13". */
  onConfirm: (seatIds: string[], labels: string[]) => void;
}

type Seat = Awaited<ReturnType<typeof api.listSeats>>[number];

/**
 * Modal seat-map picker. Fetches the seat list for a ticket type
 * (server marks each as AVAILABLE | HELD | SOLD), renders rows of seat
 * dots, and returns the chosen ids on confirm. The order endpoint
 * holds the seats during the Paystack hop; if the buyer abandons
 * checkout the holds release on a TTL.
 */
export function SeatPicker({
  ticketTypeId,
  max,
  initialSelected = [],
  onClose,
  onConfirm,
}: Props) {
  const [seats, setSeats] = useState<Seat[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>(initialSelected);

  useEffect(() => {
    api
      .listSeats(ticketTypeId)
      .then((s) => setSeats(s))
      .catch((e) =>
        setError(e instanceof Error ? e.message : 'Failed to load seats'),
      );
  }, [ticketTypeId]);

  // Group seats by row, preserving the seat order returned by the API
  // (the dashboard tool inserts them row-by-row in label order).
  const rows = (() => {
    if (!seats) return [];
    const byRow = new Map<string, Seat[]>();
    for (const s of seats) {
      const list = byRow.get(s.row) ?? [];
      list.push(s);
      byRow.set(s.row, list);
    }
    return Array.from(byRow.entries()).map(([row, list]) => ({ row, list }));
  })();

  function toggle(seat: Seat) {
    if (seat.status !== 'AVAILABLE') return;
    setSelected((curr) => {
      if (curr.includes(seat.id)) return curr.filter((id) => id !== seat.id);
      if (curr.length >= max) return curr;
      return [...curr, seat.id];
    });
  }

  function confirm() {
    if (!seats) return;
    const labels = selected
      .map((id) => seats.find((s) => s.id === id))
      .filter(Boolean)
      .map((s) => `${s!.row}${s!.label}`);
    onConfirm(selected, labels);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="seat-picker-title"
      className="transfer-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="transfer-modal-card"
        style={{ maxWidth: 560, padding: 24 }}
      >
        <div className="between" style={{ alignItems: 'flex-start' }}>
          <div>
            <h2 id="seat-picker-title" className="h-4" style={{ margin: 0 }}>
              Pick your seats
            </h2>
            <p className="text-xs muted mt-1">
              {selected.length} of {max} selected · tap a seat to toggle
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close seat picker"
            className="icon-btn"
            style={{ width: 32, height: 32 }}
          >
            <Icon name="close" size={14} />
          </button>
        </div>

        {/* Stage indicator */}
        <div
          className="mt-4"
          style={{
            background: 'var(--surface-2)',
            color: 'var(--ink-3)',
            textAlign: 'center',
            padding: '8px 12px',
            borderRadius: 'var(--r-2)',
            fontSize: 11,
            letterSpacing: '.2em',
            textTransform: 'uppercase',
          }}
        >
          ◤ Stage / Screen ◥
        </div>

        {error ? (
          <p className="text-sm mt-3" style={{ color: 'var(--danger)' }}>
            {error}
          </p>
        ) : null}

        <div
          className="mt-4"
          style={{
            maxHeight: 360,
            overflow: 'auto',
            padding: '8px 4px',
            background: 'var(--surface-2)',
            borderRadius: 'var(--r-3)',
          }}
        >
          {seats === null ? (
            <p className="muted text-sm" style={{ textAlign: 'center', padding: 24 }}>
              Loading seats…
            </p>
          ) : rows.length === 0 ? (
            <p
              className="muted text-sm"
              style={{ textAlign: 'center', padding: 24 }}
            >
              This tier doesn&apos;t have a seat map yet.
            </p>
          ) : (
            <div className="col gap-2" style={{ alignItems: 'center', padding: 8 }}>
              {rows.map(({ row, list }) => (
                <div
                  key={row}
                  className="row gap-1"
                  style={{ alignItems: 'center' }}
                >
                  <span
                    className="mono text-xs muted"
                    style={{ width: 18, textAlign: 'right' }}
                  >
                    {row}
                  </span>
                  {list.map((s) => {
                    const isSelected = selected.includes(s.id);
                    const taken = s.status !== 'AVAILABLE';
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggle(s)}
                        disabled={taken}
                        aria-label={`Seat ${row}${s.label}${taken ? ' unavailable' : isSelected ? ' selected' : ''}`}
                        aria-pressed={isSelected}
                        className={`seat ${isSelected ? 'selected' : ''} ${taken ? 'sold' : ''}`}
                        title={`${row}${s.label}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div
          className="row gap-3 mt-3"
          style={{ fontSize: 11, color: 'var(--ink-3)', flexWrap: 'wrap' }}
        >
          <span className="row gap-1" style={{ alignItems: 'center' }}>
            <span className="seat" /> available
          </span>
          <span className="row gap-1" style={{ alignItems: 'center' }}>
            <span className="seat selected" /> selected
          </span>
          <span className="row gap-1" style={{ alignItems: 'center' }}>
            <span className="seat sold" /> taken
          </span>
        </div>

        <div className="row gap-2 mt-4">
          <button
            type="button"
            onClick={confirm}
            disabled={selected.length === 0}
            className="btn btn-accent btn-lg"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            Confirm {selected.length || ''}
          </button>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-lg">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
