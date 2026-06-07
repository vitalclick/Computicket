'use client';

import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface Props {
  organizerSlug: string;
  onCreated: () => void;
}

interface TierForm {
  name: string;
  priceNgn: string;
  capacity: string;
}

export function NewEventForm({ organizerSlug, onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [description, setDescription] = useState('');
  const [tiers, setTiers] = useState<TierForm[]>([
    { name: 'Regular', priceNgn: '', capacity: '' },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function suggestSlug(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48);
  }

  function updateTier(i: number, patch: Partial<TierForm>) {
    setTiers((arr) => arr.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.createEvent(getToken()!, {
        organizerSlug,
        slug,
        title,
        description: description || undefined,
        venue,
        city,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        ticketTypes: tiers.map((t) => ({
          name: t.name,
          priceKobo: Math.round(parseFloat(t.priceNgn) * 100),
          capacity: parseInt(t.capacity, 10),
        })),
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: 24 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}
      >
        <Field label="Title" required>
          <input
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slug) setSlug(suggestSlug(e.target.value));
            }}
            placeholder="Asake — Lungu Boy Tour"
            className="input"
          />
        </Field>
        <Field label="URL slug" required hint="lowercase, dashes only">
          <input
            required
            pattern="[a-z0-9-]+"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="asake-lungu-boy"
            className="input mono"
            style={{ textTransform: 'lowercase' }}
          />
        </Field>
        <Field label="Venue" required>
          <input
            required
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="Eko Convention Centre"
            className="input"
          />
        </Field>
        <Field label="City" required>
          <input
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Lagos"
            className="input"
          />
        </Field>
        <Field label="Starts at" required>
          <input
            required
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Ends at" required>
          <input
            required
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className="input"
          />
        </Field>
      </div>

      <div className="mt-3">
        <Field label="Description (optional)">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What buyers can expect — set list, lineup, dress code, age policy…"
            className="input"
            style={{ resize: 'vertical' }}
          />
        </Field>
      </div>

      <div className="mt-5">
        <div className="between mb-3">
          <h3 className="h-4" style={{ fontSize: 14, margin: 0 }}>
            Ticket tiers
          </h3>
          <button
            type="button"
            onClick={() =>
              setTiers((t) => [...t, { name: '', priceNgn: '', capacity: '' }])
            }
            className="text-xs accent-text"
            style={{ background: 'transparent', border: 0, cursor: 'pointer' }}
          >
            + Add tier
          </button>
        </div>
        <div className="col gap-2">
          {tiers.map((t, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr auto',
                gap: 8,
                alignItems: 'flex-start',
              }}
            >
              <input
                required
                placeholder="Name (e.g. VIP)"
                value={t.name}
                onChange={(e) => updateTier(i, { name: e.target.value })}
                aria-label={`Tier ${i + 1} name`}
                className="input"
              />
              <input
                required
                type="number"
                min="0"
                step="0.01"
                placeholder="Price (NGN)"
                value={t.priceNgn}
                onChange={(e) => updateTier(i, { priceNgn: e.target.value })}
                aria-label={`Tier ${i + 1} price in NGN`}
                className="input"
              />
              <input
                required
                type="number"
                min="1"
                placeholder="Capacity"
                value={t.capacity}
                onChange={(e) => updateTier(i, { capacity: e.target.value })}
                aria-label={`Tier ${i + 1} capacity`}
                className="input"
              />
              <button
                type="button"
                onClick={() =>
                  setTiers((arr) => arr.filter((_, idx) => idx !== i))
                }
                disabled={tiers.length === 1}
                aria-label="Remove tier"
                className="icon-btn"
                style={{ height: 'fit-content' }}
              >
                <Icon name="minus" size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-sm mt-4" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      ) : null}

      <div
        className="row mt-5"
        style={{
          gap: 12,
          paddingTop: 16,
          borderTop: '1px solid var(--line)',
          alignItems: 'center',
        }}
      >
        <button type="submit" disabled={submitting} className="btn btn-accent">
          {submitting ? 'Creating…' : 'Create as draft'}
          <Icon name="arrow" size={13} />
        </button>
        <span className="text-xs muted">
          Drafts aren&apos;t visible publicly until you publish.
        </span>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="col gap-1">
      <span className="text-xs muted">
        {label}
        {required ? ' *' : ''}
        {hint ? <span className="muted-2 ml-1">· {hint}</span> : null}
      </span>
      {children}
    </label>
  );
}
