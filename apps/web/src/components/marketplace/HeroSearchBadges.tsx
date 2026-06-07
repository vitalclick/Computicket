'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Icon, type IconName } from '@/components/Icon';

interface BadgeSpec {
  /** Query param key on the URL. */
  key: string;
  /** Icon to show next to the value. */
  icon: IconName;
  /** Optional prefix label rendered before the value (e.g. "From"). */
  prefix?: string;
  /** Optional suffix appended to the value (e.g. " guests" / "tickets"). */
  suffix?: string;
}

interface Props {
  /** Section heading prefix — defaults to "Searched for:". */
  label?: string;
  /** Ordered specs; only those whose param is present in the URL render. */
  specs: BadgeSpec[];
}

/**
 * Surfaces the hero's `?param=value` query parameters as a chip row so
 * the user sees their search reflected on the destination page even
 * when the page itself isn't filtering on those fields server-side.
 * Drops in cleanly to server components via the standard Suspense
 * boundary required by Next 15's useSearchParams.
 */
export function HeroSearchBadges(props: Props) {
  return (
    <Suspense fallback={null}>
      <HeroSearchBadgesInner {...props} />
    </Suspense>
  );
}

function HeroSearchBadgesInner({ label = 'Searched for:', specs }: Props) {
  const sp = useSearchParams();
  const present = specs
    .map((s) => ({ ...s, value: sp.get(s.key)?.trim() ?? '' }))
    .filter((s) => s.value);
  if (present.length === 0) return null;
  return (
    <section className="wrap" style={{ paddingTop: 24, paddingBottom: 0 }}>
      <div className="row gap-2" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
        <span className="text-xs muted" style={{ alignSelf: 'center' }}>
          {label}
        </span>
        {present.map((s) => (
          <span key={s.key} className="chip chip-accent">
            <Icon name={s.icon} size={11} />{' '}
            {s.prefix ? `${s.prefix} ` : ''}
            {s.value}
            {s.suffix ?? ''}
          </span>
        ))}
      </div>
    </section>
  );
}
