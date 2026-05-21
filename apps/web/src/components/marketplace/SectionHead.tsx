import Link from 'next/link';
import { Icon } from '@/components/Icon';

interface Props {
  eyebrow?: string;
  title: string;
  sub?: string;
  cta?: string;
  ctaHref?: string;
}

export function SectionHead({ eyebrow, title, sub, cta, ctaHref }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: 28,
        gap: 24,
        flexWrap: 'wrap',
      }}
    >
      <div>
        {eyebrow ? <div className="eyebrow mb-2">{eyebrow}</div> : null}
        <h2 className="h-2 text-gradient" style={{ margin: 0 }}>
          {title}
        </h2>
        {sub ? (
          <p style={{ color: 'var(--ink-3)', fontSize: 15, marginTop: 8, maxWidth: 520 }}>
            {sub}
          </p>
        ) : null}
      </div>
      {cta ? (
        ctaHref ? (
          <Link href={ctaHref} className="btn btn-ghost btn-sm">
            {cta} <Icon name="arrow" size={14} />
          </Link>
        ) : (
          <button type="button" className="btn btn-ghost btn-sm">
            {cta} <Icon name="arrow" size={14} />
          </button>
        )
      ) : null}
    </div>
  );
}
