'use client';

import { useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import { Icon, type IconName } from '@/components/Icon';

type TabId = 'events' | 'concerts' | 'flights' | 'buses' | 'hotels' | 'cinema' | 'x';

interface Tab {
  id: TabId;
  label: string;
  icon: IconName;
  basePath: string;
}

const TABS: Tab[] = [
  { id: 'events',   label: 'Events',      icon: 'calendar', basePath: '/events' },
  { id: 'concerts', label: 'Concerts',    icon: 'music',    basePath: '/concerts' },
  { id: 'flights',  label: 'Flights',     icon: 'plane',    basePath: '/flights' },
  { id: 'buses',    label: 'Bus Travel',  icon: 'bus',      basePath: '/buses' },
  { id: 'hotels',   label: 'Stays',       icon: 'bed',      basePath: '/hotels' },
  { id: 'cinema',   label: 'Cinema',      icon: 'film',     basePath: '/cinema' },
  { id: 'x',        label: 'Experiences', icon: 'sparkle',  basePath: '/experiences' },
];

/* ── Field definitions ────────────────────────────────────────────────
   Each tab declares an ordered list of fields. The `key` becomes the
   URL query parameter on submit; `kind` drives the editor shown in the
   popover. */

type FieldKind = 'text' | 'select' | 'date' | 'counter';

interface FieldDef {
  key: string;
  label: string;
  /** Default visible value when nothing has been typed. Travels through
   *  to the submit unless we mark it `placeholderOnly`. */
  defaultValue: string;
  /** When true, the defaultValue is rendered in a placeholder style and
   *  is NOT submitted unless the user types something. */
  placeholderOnly?: boolean;
  kind: FieldKind;
  options?: string[];
  /** For counter fields: min/max. */
  min?: number;
  max?: number;
  /** Optional suffix appended to the counter display ("ticket", "guest"). */
  unit?: string;
}

const NG_CITIES = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'Calabar', 'Benin City', 'Owerri'];
const AIRPORTS = [
  'Lagos (LOS)',
  'Abuja (ABV)',
  'Port Harcourt (PHC)',
  'Kano (KAN)',
  'Enugu (ENU)',
  'Calabar (CBQ)',
  'Owerri (QOW)',
  'Accra (ACC)',
  'Dubai (DXB)',
  'London (LHR)',
];
const BUS_TERMINALS = [
  'Lagos (Jibowu)',
  'Lagos (Yaba)',
  'Lagos (Ojota)',
  'Lagos (Iyana-Ipaja)',
  'Abuja (Utako)',
  'Abuja (Wuse)',
  'Abuja (Mararaba)',
  'Benin City',
  'Port Harcourt',
  'Onitsha',
  'Owerri',
  'Kaduna',
];
const WHEN_QUICK = ['Tonight', 'This weekend', 'Next 7 days', 'This month'];
const CINEMA_FORMATS = ['IMAX', '3D', '2D', 'Premium recliner', '4DX'];
const TIERS = ['Any', 'Standard', 'Premium', 'VIP', 'Diamond'];

const FIELDS: Record<TabId, FieldDef[]> = {
  events: [
    { key: 'q',      label: 'Find',   defaultValue: 'Concerts, comedy, theatre…', placeholderOnly: true, kind: 'text' },
    { key: 'city',   label: 'City',   defaultValue: 'Lagos',         kind: 'select', options: NG_CITIES },
    { key: 'when',   label: 'When',   defaultValue: 'This weekend',  kind: 'date' },
    { key: 'guests', label: 'Guests', defaultValue: '2',             kind: 'counter', min: 1, max: 50, unit: 'ticket' },
  ],
  concerts: [
    { key: 'q',     label: 'Artist or show', defaultValue: 'Asake, Burna, Tems…', placeholderOnly: true, kind: 'text' },
    { key: 'city',  label: 'City',           defaultValue: 'Lagos',               kind: 'select', options: NG_CITIES },
    { key: 'when',  label: 'When',           defaultValue: 'Next 30 days',        kind: 'date' },
    { key: 'tier',  label: 'Tier',           defaultValue: 'Any',                 kind: 'select', options: TIERS },
  ],
  flights: [
    { key: 'from',       label: 'From',       defaultValue: 'Lagos (LOS)',     kind: 'select', options: AIRPORTS },
    { key: 'to',         label: 'To',         defaultValue: 'Abuja (ABV)',     kind: 'select', options: AIRPORTS },
    { key: 'depart',     label: 'Depart',     defaultValue: '',                kind: 'date' },
    { key: 'passengers', label: 'Passengers', defaultValue: '1',               kind: 'counter', min: 1, max: 9, unit: 'adult' },
  ],
  buses: [
    { key: 'from',       label: 'From',       defaultValue: 'Lagos (Jibowu)',  kind: 'select', options: BUS_TERMINALS },
    { key: 'to',         label: 'To',         defaultValue: 'Benin City',      kind: 'select', options: BUS_TERMINALS },
    { key: 'depart',     label: 'Depart',     defaultValue: '',                kind: 'date' },
    { key: 'passengers', label: 'Passengers', defaultValue: '1',               kind: 'counter', min: 1, max: 9, unit: 'adult' },
  ],
  hotels: [
    { key: 'destination', label: 'Destination', defaultValue: 'Victoria Island, Lagos', kind: 'text' },
    { key: 'checkin',     label: 'Check-in',    defaultValue: '',                       kind: 'date' },
    { key: 'checkout',    label: 'Check-out',   defaultValue: '',                       kind: 'date' },
    { key: 'guests',      label: 'Guests',      defaultValue: '2',                      kind: 'counter', min: 1, max: 16, unit: 'guest' },
  ],
  cinema: [
    { key: 'q',      label: 'Movie',  defaultValue: "What's showing?", placeholderOnly: true, kind: 'text' },
    { key: 'city',   label: 'City',   defaultValue: 'Lagos',           kind: 'select', options: NG_CITIES },
    { key: 'date',   label: 'Date',   defaultValue: '',                kind: 'date' },
    { key: 'format', label: 'Format', defaultValue: 'Any',             kind: 'select', options: ['Any', ...CINEMA_FORMATS] },
  ],
  x: [
    { key: 'q',      label: 'What',   defaultValue: 'Yacht cruises, tours…', placeholderOnly: true, kind: 'text' },
    { key: 'where',  label: 'Where',  defaultValue: 'Lagos',                 kind: 'select', options: NG_CITIES },
    { key: 'when',   label: 'When',   defaultValue: 'This weekend',          kind: 'date' },
    { key: 'guests', label: 'Guests', defaultValue: '4',                     kind: 'counter', min: 1, max: 30, unit: 'guest' },
  ],
};

const QUICK_PROMPTS: Array<{ label: string; tab: TabId; q: string }> = [
  { label: 'Burna Boy Lagos',         tab: 'concerts', q: 'Burna Boy' },
  { label: 'Cheap flights LOS→ABV',   tab: 'flights',  q: 'LOS→ABV' },
  { label: 'Eko Hotel weekend',       tab: 'hotels',   q: 'Eko Hotel' },
  { label: 'Sunset cruise',           tab: 'x',        q: 'Sunset cruise' },
  { label: 'Asake VIP',               tab: 'concerts', q: 'Asake' },
  { label: 'Bus to Benin',            tab: 'buses',    q: 'Benin City' },
];

const STATS = [
  { n: '1.2M+', l: 'Tickets sold this year' },
  { n: '2,400+', l: 'Events on-platform' },
  { n: '38', l: 'Airlines & operators' },
  { n: '4.9', l: 'App rating · 84k reviews' },
  { n: '99.97%', l: 'Booking success rate' },
];

/* ── Helpers ─────────────────────────────────────────────────────── */

function makeInitialValues(): Record<TabId, Record<string, string>> {
  const out = {} as Record<TabId, Record<string, string>>;
  (Object.keys(FIELDS) as TabId[]).forEach((tab) => {
    out[tab] = {};
    FIELDS[tab].forEach((f) => {
      out[tab][f.key] = f.placeholderOnly ? '' : f.defaultValue;
    });
  });
  return out;
}

function isFieldFilled(field: FieldDef, value: string): boolean {
  if (!value.trim()) return false;
  if (field.placeholderOnly && value.trim() === field.defaultValue.trim()) return false;
  return true;
}

/* ── Field popover editor ────────────────────────────────────────── */

interface PopoverProps {
  field: FieldDef;
  value: string;
  onChange: (next: string) => void;
  onClose: () => void;
}

function FieldPopover({ field, value, onChange, onClose }: PopoverProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={field.label}
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        left: 0,
        right: 0,
        zIndex: 30,
        padding: 16,
        background: 'var(--surface)',
        border: '1px solid var(--line-strong)',
        borderRadius: 'var(--r-3)',
        boxShadow: 'var(--shadow-lg)',
        minWidth: 240,
      }}
    >
      {field.kind === 'text' ? (
        <input
          autoFocus
          type="text"
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          placeholder={field.placeholderOnly ? field.defaultValue : field.label}
          aria-label={field.label}
          className="input"
        />
      ) : null}

      {field.kind === 'select' ? (
        <div className="col gap-1" role="listbox" aria-label={field.label}>
          {field.options?.map((opt) => {
            const selected = opt === value;
            return (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(opt);
                  onClose();
                }}
                style={{
                  padding: '10px 12px',
                  textAlign: 'left',
                  borderRadius: 'var(--r-2)',
                  background: selected ? 'var(--accent-soft)' : 'transparent',
                  color: selected ? 'var(--accent)' : 'var(--ink)',
                  border: 0,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: selected ? 600 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {selected ? <Icon name="check" size={13} stroke={2.5} /> : <span style={{ width: 13 }} />}
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {field.kind === 'date' ? (
        <div className="col gap-2">
          <input
            autoFocus
            type="date"
            value={value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
            aria-label={`${field.label} — pick a date`}
            className="input"
          />
          <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
            {WHEN_QUICK.map((q) => (
              <button
                key={q}
                type="button"
                className={`chip ${value === q ? 'active' : ''}`}
                onClick={() => {
                  onChange(q);
                  onClose();
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {field.kind === 'counter' ? (
        <CounterEditor
          field={field}
          value={value}
          onChange={onChange}
        />
      ) : null}
    </div>
  );
}

function CounterEditor({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: string;
  onChange: (next: string) => void;
}) {
  const min = field.min ?? 1;
  const max = field.max ?? 10;
  // Counter values are stored as bare numbers; the trigger label
  // appends the unit.
  const parsed = Number.parseInt(value, 10);
  const n = Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : min;
  const set = (next: number) => onChange(String(Math.min(max, Math.max(min, next))));
  return (
    <div
      className="row"
      style={{ alignItems: 'center', justifyContent: 'space-between', gap: 16 }}
    >
      <div>
        <div className="fw-600" style={{ fontSize: 15 }}>
          {n} {field.unit}
          {n === 1 ? '' : 's'}
        </div>
        <div className="text-xs muted mt-1">
          Up to {max} per booking
        </div>
      </div>
      <div className="row gap-2" style={{ alignItems: 'center' }}>
        <button
          type="button"
          className="icon-btn"
          aria-label={`Decrease ${field.label}`}
          disabled={n <= min}
          onClick={() => set(n - 1)}
        >
          <Icon name="minus" size={14} />
        </button>
        <span className="fw-600 tnum" style={{ minWidth: 20, textAlign: 'center' }}>
          {n}
        </span>
        <button
          type="button"
          className="icon-btn"
          aria-label={`Increase ${field.label}`}
          disabled={n >= max}
          onClick={() => set(n + 1)}
        >
          <Icon name="plus" size={14} />
        </button>
      </div>
    </div>
  );
}

/* ── Hero ────────────────────────────────────────────────────────── */

export function HeroCinematic() {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>('events');
  const [values, setValues] = useState(makeInitialValues);
  const [openField, setOpenField] = useState<string | null>(null);
  const fields = FIELDS[tab];
  const activeTab = TABS.find((t) => t.id === tab)!;

  const setFieldValue = useCallback(
    (key: string, next: string) => {
      setValues((prev) => ({
        ...prev,
        [tab]: { ...prev[tab], [key]: next },
      }));
    },
    [tab],
  );

  const displayValue = useCallback(
    (field: FieldDef): { text: string; isPlaceholder: boolean } => {
      const raw = values[tab][field.key] ?? '';
      if (!raw) {
        return { text: field.defaultValue, isPlaceholder: Boolean(field.placeholderOnly) };
      }
      if (field.kind === 'counter') {
        const n = Number.parseInt(raw, 10) || (field.min ?? 1);
        return {
          text: `${n} ${field.unit}${n === 1 ? '' : 's'}`,
          isPlaceholder: false,
        };
      }
      return { text: raw, isPlaceholder: false };
    },
    [tab, values],
  );

  const buildHref = useCallback((): string => {
    const params = new URLSearchParams();
    for (const field of fields) {
      const v = values[tab][field.key] ?? '';
      if (isFieldFilled(field, v)) params.set(field.key, v.trim());
    }
    const qs = params.toString();
    return qs ? `${activeTab.basePath}?${qs}` : activeTab.basePath;
  }, [fields, values, tab, activeTab.basePath]);

  function handleSearch() {
    setOpenField(null);
    router.push(buildHref());
  }

  // When the user switches tab, dismiss any open popover so the next
  // tab's fields render in their default closed state.
  const switchTab = (next: TabId) => {
    setOpenField(null);
    setTab(next);
  };

  const liveHref = useMemo(buildHref, [buildHref]);

  return (
    <section
      className="nebula"
      style={{ position: 'relative', overflow: 'hidden', paddingTop: 32, paddingBottom: 80 }}
    >
      <div className="stars" />
      <div
        style={{
          position: 'absolute',
          top: -200,
          right: -150,
          width: 700,
          height: 700,
          background: 'radial-gradient(circle, oklch(0.55 0.22 152 / .45), transparent 60%)',
          pointerEvents: 'none',
          filter: 'blur(20px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -300,
          left: -200,
          width: 800,
          height: 800,
          background: 'radial-gradient(circle, oklch(0.50 0.18 180 / .35), transparent 60%)',
          pointerEvents: 'none',
          filter: 'blur(20px)',
        }}
      />

      <div className="wrap" style={{ position: 'relative', paddingTop: 60, paddingBottom: 60 }}>
        <div className="between mb-6" style={{ alignItems: 'center' }}>
          <div className="ai-pill">
            <span className="ai-dot" />
            <span>
              Sign in for AI-personalised picks —{' '}
              <b style={{ color: 'var(--accent)' }}>free</b>
            </span>
          </div>
          <div className="row gap-2" style={{ alignItems: 'center' }}>
            <span className="pill-stat">
              <span className="dot dot-live" /> 4,812 booking now
            </span>
            <span className="pill-stat">
              <Icon name="shield" size={12} /> Buyer protection on every order
            </span>
          </div>
        </div>

        <div style={{ maxWidth: 1100 }}>
          <h1 className="h-1" style={{ margin: '0 0 18px' }}>
            <span className="text-gradient">Everywhere you&apos;d rather be —</span>
            <br />
            <span className="serif" style={{ fontSize: '0.92em', color: 'var(--ink-2)' }}>
              booked in one tap.
            </span>
          </h1>
          <p
            style={{
              fontSize: 18,
              color: 'var(--ink-2)',
              maxWidth: 880,
              lineHeight: 1.55,
              textWrap: 'pretty',
            }}
          >
            Concerts, flights, stays and experiences across Nigeria — curated and AI-personalised by
            <span className="accent-text"> Compass</span>. From Lagos rooftops to Abuja take-offs,
            your weekend starts here.
          </p>
        </div>

        <div className="search-tabs mt-8" role="tablist" aria-label="Search categories">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`search-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => switchTab(t.id)}
            >
              <Icon name={t.icon} size={14} /> {t.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          role="search"
          aria-label={`${activeTab.label} search`}
          className="search-bar"
          style={{ gridTemplateColumns: `repeat(${fields.length}, 1fr) auto` }}
        >
          {fields.map((field, i) => {
            const isOpen = openField === field.key;
            const { text, isPlaceholder } = displayValue(field);
            return (
              <div
                key={field.key}
                style={{
                  position: 'relative',
                  borderRight: i < fields.length - 1 ? '1px solid var(--line)' : 'none',
                }}
              >
                <button
                  type="button"
                  className="search-field"
                  aria-haspopup="dialog"
                  aria-expanded={isOpen}
                  aria-controls={`hero-pop-${field.key}`}
                  onClick={() => setOpenField(isOpen ? null : field.key)}
                  style={{
                    width: '100%',
                    background: isOpen ? 'var(--surface-2)' : 'transparent',
                    border: 0,
                    textAlign: 'left',
                    color: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  <div className="search-label">{field.label}</div>
                  <div className={`search-value ${isPlaceholder ? 'placeholder' : ''}`}>
                    {text}
                  </div>
                </button>
                {isOpen ? (
                  <div id={`hero-pop-${field.key}`}>
                    <FieldPopover
                      field={field}
                      value={values[tab][field.key] ?? ''}
                      onChange={(v) => setFieldValue(field.key, v)}
                      onClose={() => setOpenField(null)}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
          <button
            type="submit"
            className="btn btn-accent btn-lg"
            style={{ margin: 6, padding: '18px 28px' }}
            aria-label={`Search ${activeTab.label}`}
            // Keep the resolved href visible on hover for the
            // bookmarklet crowd and accessibility readouts.
            data-search-href={liveHref}
          >
            <Icon name="search" size={16} /> Search
          </button>
        </form>

        <div className="row mt-4 gap-2" style={{ flexWrap: 'wrap' }}>
          <span
            className="text-xs muted"
            style={{ alignSelf: 'center', marginRight: 4 }}
          >
            Try:
          </span>
          {QUICK_PROMPTS.map((prompt) => {
            const target = TABS.find((t) => t.id === prompt.tab)!;
            const href = `${target.basePath}?q=${encodeURIComponent(prompt.q)}`;
            return (
              <button
                key={prompt.label}
                type="button"
                className="chip"
                style={{ fontSize: 12 }}
                onClick={() => {
                  // Pre-fill the matching tab + field so the user sees
                  // their click reflected in the search bar before the
                  // route change kicks in (and so the back button
                  // returns to a populated state).
                  switchTab(prompt.tab);
                  const firstField = FIELDS[prompt.tab][0];
                  if (firstField) {
                    setValues((prev) => ({
                      ...prev,
                      [prompt.tab]: { ...prev[prompt.tab], [firstField.key]: prompt.q },
                    }));
                  }
                  router.push(href);
                }}
              >
                <Icon name="sparkle" size={11} /> {prompt.label}
              </button>
            );
          })}
        </div>

        <div
          className="row mt-8"
          style={{
            gap: 48,
            paddingTop: 32,
            borderTop: '1px solid var(--line)',
            flexWrap: 'wrap',
          }}
        >
          {STATS.map((s) => (
            <div key={s.l} style={{ flex: 1, minWidth: 140 }}>
              <div className="h-2 tnum" style={{ fontSize: 32 }}>
                {s.n}
              </div>
              <div className="text-xs muted mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
