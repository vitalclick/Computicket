'use client';

import { useState } from 'react';
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
  const [tiers, setTiers] = useState<TierForm[]>([{ name: 'Regular', priceNgn: '', capacity: '' }]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateTier(i: number, patch: Partial<TierForm>) {
    setTiers((arr) => arr.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const token = getToken()!;
      await api.createEvent(token, {
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
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-5 bg-white space-y-4">
      <h3 className="font-semibold">New event</h3>

      <div className="grid sm:grid-cols-2 gap-3">
        <Input label="Title" value={title} onChange={setTitle} required />
        <Input label="URL slug" value={slug} onChange={setSlug} required mono pattern="[a-z0-9-]+" />
        <Input label="Venue" value={venue} onChange={setVenue} required />
        <Input label="City" value={city} onChange={setCity} required />
        <Input label="Starts at" type="datetime-local" value={startsAt} onChange={setStartsAt} required />
        <Input label="Ends at" type="datetime-local" value={endsAt} onChange={setEndsAt} required />
      </div>

      <label className="block">
        <span className="text-xs text-gray-600">Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </label>

      <div>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Ticket tiers</h4>
          <button
            type="button"
            onClick={() => setTiers((t) => [...t, { name: '', priceNgn: '', capacity: '' }])}
            className="text-xs text-brand-dark hover:underline"
          >
            + Add tier
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {tiers.map((t, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-start">
              <input
                required
                placeholder="Name (e.g. VIP)"
                value={t.name}
                onChange={(e) => updateTier(i, { name: e.target.value })}
                className="col-span-5 border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <input
                required
                type="number"
                min="0"
                step="0.01"
                placeholder="Price (NGN)"
                value={t.priceNgn}
                onChange={(e) => updateTier(i, { priceNgn: e.target.value })}
                className="col-span-3 border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <input
                required
                type="number"
                min="1"
                placeholder="Capacity"
                value={t.capacity}
                onChange={(e) => updateTier(i, { capacity: e.target.value })}
                className="col-span-3 border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => setTiers((arr) => arr.filter((_, idx) => idx !== i))}
                disabled={tiers.length === 1}
                className="col-span-1 text-gray-400 hover:text-red-600 disabled:text-gray-200 disabled:cursor-not-allowed text-lg"
                aria-label="Remove tier"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <button
          type="submit"
          disabled={submitting}
          className="bg-brand text-white px-4 py-2 rounded-md hover:bg-brand-dark disabled:bg-gray-300"
        >
          {submitting ? 'Creating…' : 'Create as draft'}
        </button>
        <span className="self-center text-xs text-gray-500">
          Drafts aren&apos;t visible publicly until you publish.
        </span>
      </div>
    </form>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  required,
  mono,
  pattern,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  mono?: boolean;
  pattern?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs text-gray-600">{label}</span>
      <input
        type={type}
        required={required}
        pattern={pattern}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm ${mono ? 'font-mono' : ''}`}
      />
    </label>
  );
}
