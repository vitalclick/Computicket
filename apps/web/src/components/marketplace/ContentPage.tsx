import { Icon, type IconName } from '@/components/Icon';

interface Props {
  eyebrow: string;
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

/**
 * Long-form content shell used by legal, policy and help pages.
 * Renders the cosmic page header + a contained reading column.
 */
export function ContentPage({ eyebrow, title, subtitle, lastUpdated, children }: Props) {
  return (
    <div className="page-enter">
      <section
        className="nebula"
        style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--line)' }}
      >
        <div className="stars" />
        <div
          className="wrap"
          style={{ position: 'relative', paddingTop: 64, paddingBottom: 56, maxWidth: 880 }}
        >
          <div className="eyebrow mb-3">{eyebrow}</div>
          <h1 className="h-1" style={{ margin: 0 }}>
            <span className="text-gradient">{title}</span>
          </h1>
          {subtitle ? (
            <p
              className="mt-4"
              style={{ fontSize: 18, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 700 }}
            >
              {subtitle}
            </p>
          ) : null}
          {lastUpdated ? (
            <div className="text-xs muted mt-6 mono">Last updated: {lastUpdated}</div>
          ) : null}
        </div>
      </section>

      <section
        className="wrap"
        style={{
          paddingTop: 64,
          paddingBottom: 96,
          maxWidth: 880,
          color: 'var(--ink-2)',
          fontSize: 15.5,
          lineHeight: 1.75,
        }}
      >
        {children}
      </section>
    </div>
  );
}

interface SectionProps {
  id?: string;
  title: string;
  children: React.ReactNode;
}

export function ContentSection({ id, title, children }: SectionProps) {
  return (
    <section id={id} style={{ marginTop: 40 }}>
      <h2
        className="h-3"
        style={{ fontSize: 22, marginBottom: 12, color: 'var(--ink)' }}
      >
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

interface PillarItem {
  icon: IconName;
  title: string;
  body: string;
}

export function PillarGrid({ items, columns = 3 }: { items: PillarItem[]; columns?: number }) {
  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 20, marginTop: 16 }}
    >
      {items.map((it) => (
        <div key={it.title} className="card" style={{ padding: 24 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--r-2)',
              background: 'var(--accent-soft)',
              color: 'var(--accent)',
              display: 'grid',
              placeItems: 'center',
              marginBottom: 14,
            }}
          >
            <Icon name={it.icon} size={18} />
          </div>
          <div className="h-4" style={{ fontSize: 16 }}>
            {it.title}
          </div>
          <p
            style={{
              color: 'var(--ink-3)',
              fontSize: 14,
              lineHeight: 1.6,
              marginTop: 8,
            }}
          >
            {it.body}
          </p>
        </div>
      ))}
    </div>
  );
}
