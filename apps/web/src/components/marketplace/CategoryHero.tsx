import Link from 'next/link';
import { Icon, type IconName } from '@/components/Icon';
import type { Ph } from '@/lib/design-data';

interface Props {
  eyebrow: string;
  title: string;
  subtitle?: string;
  ph?: Ph;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  badges?: Array<{ icon?: IconName; label: string }>;
  preview?: boolean;
}

export function CategoryHero({
  eyebrow,
  title,
  subtitle,
  ph = 'ph-3',
  primaryCta,
  secondaryCta,
  badges,
  preview,
}: Props) {
  return (
    <section style={{ position: 'relative', overflow: 'hidden' }}>
      <div className={`ph ${ph} ph-noise`} style={{ position: 'absolute', inset: 0, height: 480 }} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          height: 480,
          background:
            'linear-gradient(180deg, oklch(0.06 0.03 285 / .35), oklch(0.06 0.03 285 / .92) 80%, var(--bg-void))',
        }}
      />
      <div
        className="wrap"
        style={{ position: 'relative', paddingTop: 72, paddingBottom: 48, minHeight: 480 }}
      >
        <div className="row gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
          {preview ? (
            <span
              className="badge"
              style={{ background: 'oklch(0.80 0.16 75)', color: 'oklch(0.18 0.05 60)' }}
            >
              Preview
            </span>
          ) : null}
          {badges?.map((b) => (
            <span
              key={b.label}
              className="badge badge-soon"
              style={{ background: 'oklch(0 0 0 / .4)', color: 'white' }}
            >
              {b.icon ? <Icon name={b.icon} size={11} /> : null} {b.label}
            </span>
          ))}
        </div>
        <div
          className="mono text-xs"
          style={{ letterSpacing: '.2em', color: 'oklch(1 0 0 / .8)' }}
        >
          {eyebrow.toUpperCase()}
        </div>
        <h1
          className="h-1"
          style={{ margin: '14px 0 14px', maxWidth: 920, color: 'white' }}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            style={{
              fontSize: 18,
              color: 'oklch(1 0 0 / .85)',
              maxWidth: 640,
              lineHeight: 1.55,
              textWrap: 'pretty',
            }}
          >
            {subtitle}
          </p>
        ) : null}
        {primaryCta || secondaryCta ? (
          <div className="row gap-3 mt-6">
            {primaryCta ? (
              <Link href={primaryCta.href} className="btn btn-accent btn-lg">
                {primaryCta.label} <Icon name="arrow" size={14} />
              </Link>
            ) : null}
            {secondaryCta ? (
              <Link
                href={secondaryCta.href}
                className="btn btn-glass btn-lg"
                style={{ color: 'white' }}
              >
                {secondaryCta.label}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
