'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Icon, type IconName } from '@/components/Icon';
import type { Ph } from '@/lib/design-data';
import { SectionHead } from './SectionHead';

/* ──────────────────────────────────────────────────────────────────────────
   Editorial primitives for the static brand pages — ported from
   design/CompuTicket/page-static.jsx so every footer link can ship as a
   dedicated, fully-content-rich page using the same vocabulary.
   ────────────────────────────────────────────────────────────────────── */

export function ContentHero({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
}) {
  return (
    <section className="nebula" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="stars" />
      <div
        style={{
          position: 'absolute',
          top: -200,
          right: -150,
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, var(--accent-glow), transparent 60%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      <div className="wrap" style={{ paddingTop: 80, paddingBottom: 72, position: 'relative' }}>
        <div style={{ maxWidth: 880 }}>
          <div className="eyebrow mb-4">{eyebrow}</div>
          <h1
            className="h-1"
            style={{ margin: 0, fontSize: 72, letterSpacing: '-0.04em', textWrap: 'balance' }}
          >
            {title}
          </h1>
          {lede ? (
            <p
              className="mt-6 serif"
              style={{
                fontSize: 24,
                lineHeight: 1.5,
                color: 'var(--ink-2)',
                maxWidth: 700,
                textWrap: 'pretty',
              }}
            >
              {lede}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function ImageCard({
  ph,
  caption,
  aspect = '4/5',
}: {
  ph: Ph;
  caption?: string;
  aspect?: string;
}) {
  return (
    <div>
      <div
        className={`ph ${ph} ph-noise`}
        style={{ aspectRatio: aspect, borderRadius: 'var(--r-5)', position: 'relative' }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, transparent 50%, oklch(0 0 0 / .4))',
          }}
        />
      </div>
      {caption ? (
        <p
          className="text-xs muted mt-3 mono"
          style={{ letterSpacing: '.06em', textTransform: 'uppercase' }}
        >
          {caption}
        </p>
      ) : null}
    </div>
  );
}

export function ContentBlock({
  eyebrow,
  title,
  body,
  image,
  imagePosition = 'right',
  imageCaption,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  body: React.ReactNode;
  image?: Ph;
  imagePosition?: 'left' | 'right';
  imageCaption?: string;
}) {
  const cols = image
    ? imagePosition === 'left'
      ? 'minmax(0, 1fr) minmax(0, 1.2fr)'
      : 'minmax(0, 1.2fr) minmax(0, 1fr)'
    : 'minmax(0, 1fr)';
  const text = (
    <div style={{ maxWidth: image ? 'none' : 760 }}>
      {eyebrow ? <div className="eyebrow mb-3">{eyebrow}</div> : null}
      <h2 className="h-2 mb-4" style={{ textWrap: 'pretty' }}>
        {title}
      </h2>
      <div style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--ink-2)', textWrap: 'pretty' }}>
        {body}
      </div>
    </div>
  );

  return (
    <section className="wrap section">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: cols,
          gap: 64,
          alignItems: 'center',
        }}
      >
        {image && imagePosition === 'left' ? (
          <ImageCard ph={image} caption={imageCaption} />
        ) : null}
        {text}
        {image && imagePosition === 'right' ? (
          <ImageCard ph={image} caption={imageCaption} />
        ) : null}
      </div>
    </section>
  );
}

export interface Pillar {
  icon: IconName;
  title: string;
  body: string;
  color: string;
}

export function PillarsBlock({
  eyebrow,
  title,
  sub,
  pillars,
  cols,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  pillars: Pillar[];
  cols?: number;
}) {
  const columns = cols ?? pillars.length;
  return (
    <section className="wrap section">
      <SectionHead eyebrow={eyebrow} title={title} sub={sub} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap: 20,
        }}
      >
        {pillars.map((p) => (
          <div
            key={p.title}
            className="card"
            style={{ padding: 28, position: 'relative', overflow: 'hidden' }}
          >
            <div
              style={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: p.color,
                opacity: 0.18,
                filter: 'blur(28px)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: p.color,
                color: 'white',
                display: 'grid',
                placeItems: 'center',
                boxShadow: `0 10px 24px -10px ${p.color}, inset 0 1px 0 oklch(1 0 0 / .25)`,
                marginBottom: 20,
                position: 'relative',
              }}
            >
              <Icon name={p.icon} size={22} stroke={1.8} />
            </div>
            <h3 className="h-3 mb-2">{p.title}</h3>
            <p
              className="text-sm"
              style={{ color: 'var(--ink-2)', lineHeight: 1.6, textWrap: 'pretty' }}
            >
              {p.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function StatsStrip({ stats }: { stats: Array<{ n: string; l: string }> }) {
  return (
    <section className="wrap" style={{ padding: '32px 0' }}>
      <div className="card" style={{ padding: '40px 32px', borderRadius: 'var(--r-4)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))`,
            gap: 32,
          }}
        >
          {stats.map((s, i) => (
            <div
              key={s.l}
              style={{
                borderLeft: i ? '1px solid var(--line)' : 'none',
                paddingLeft: i ? 32 : 0,
              }}
            >
              <div
                className="h-display tnum"
                style={{ fontSize: 52, lineHeight: 1, letterSpacing: '-0.04em' }}
              >
                {s.n}
              </div>
              <div className="text-sm muted mt-2" style={{ textWrap: 'pretty' }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TimelineBlock({
  eyebrow,
  title,
  sub,
  items,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  items: Array<{ year: string; title: string; body: string }>;
}) {
  return (
    <section className="wrap section">
      <SectionHead eyebrow={eyebrow} title={title} sub={sub} />
      <div style={{ display: 'grid', gridTemplateColumns: '200px minmax(0, 1fr)', gap: 48 }}>
        <div
          className="muted text-sm mono"
          style={{
            position: 'sticky',
            top: 96,
            alignSelf: 'flex-start',
            letterSpacing: '.08em',
          }}
        >
          {items.length} milestones
          <br />
          {items[0]?.year}—{items[items.length - 1]?.year}
        </div>
        <div className="col gap-3">
          {items.map((it) => (
            <div
              key={it.year + it.title}
              className="card"
              style={{
                padding: 28,
                display: 'grid',
                gridTemplateColumns: 'auto minmax(0, 1fr)',
                gap: 32,
                alignItems: 'flex-start',
              }}
            >
              <div
                className="h-display tnum accent-text"
                style={{ fontSize: 44, lineHeight: 1, letterSpacing: '-0.04em' }}
              >
                {it.year}
              </div>
              <div>
                <h4 className="h-3">{it.title}</h4>
                <p
                  className="text-sm muted mt-2"
                  style={{ lineHeight: 1.65, textWrap: 'pretty' }}
                >
                  {it.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TeamBlock({
  eyebrow,
  title,
  sub,
  people,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  people: Array<{ name: string; role: string; from?: string; ph: Ph }>;
}) {
  return (
    <section className="wrap section">
      <SectionHead eyebrow={eyebrow} title={title} sub={sub} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 20 }}>
        {people.map((p) => (
          <div key={p.name}>
            <div
              className={`ph ${p.ph} ph-noise`}
              style={{ aspectRatio: '1', borderRadius: 'var(--r-4)', position: 'relative' }}
            />
            <h4 className="h-4 mt-4">{p.name}</h4>
            <div className="text-sm muted mt-1">{p.role}</div>
            {p.from ? <div className="text-xs muted-2 mt-1">Previously · {p.from}</div> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function FAQBlock({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: Array<{ q: string; a: React.ReactNode }>;
}) {
  const [open, setOpen] = useState<number>(0);
  return (
    <section className="wrap section">
      <SectionHead eyebrow={eyebrow} title={title} />
      <div style={{ maxWidth: 820 }}>
        <div className="col gap-2">
          {items.map((q, i) => (
            <div key={q.q} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setOpen(open === i ? -1 : i)}
                aria-expanded={open === i}
                style={{
                  width: '100%',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 0,
                  cursor: 'pointer',
                  gap: 16,
                  color: 'inherit',
                }}
              >
                <span className="h-4">{q.q}</span>
                <Icon name={open === i ? 'minus' : 'plus'} size={18} stroke={2} />
              </button>
              {open === i ? (
                <div
                  style={{
                    padding: '0 24px 24px',
                    color: 'var(--ink-2)',
                    fontSize: 15,
                    lineHeight: 1.7,
                    textWrap: 'pretty',
                  }}
                >
                  {q.a}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ContentCTA({
  eyebrow,
  title,
  sub,
  primary,
  secondary,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <section className="wrap section">
      <div
        className="card"
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, oklch(0.16 0.10 152), oklch(0.14 0.10 180))',
          border: '1px solid oklch(1 0 0 / .08)',
          padding: '72px 56px',
          textAlign: 'center',
        }}
      >
        <div className="stars" style={{ opacity: 0.6 }} />
        <div
          style={{
            position: 'absolute',
            top: '-30%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 600,
            height: 600,
            background: 'radial-gradient(circle, var(--accent-glow), transparent 60%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto' }}>
          {eyebrow ? (
            <div className="eyebrow mb-4" style={{ color: 'var(--accent)' }}>
              {eyebrow}
            </div>
          ) : null}
          <h2
            className="h-1"
            style={{ color: 'white', fontSize: 56, margin: 0, textWrap: 'balance' }}
          >
            {title}
          </h2>
          {sub ? (
            <p
              className="mt-6"
              style={{
                color: 'oklch(1 0 0 / .75)',
                fontSize: 18,
                maxWidth: 520,
                margin: '24px auto 0',
                lineHeight: 1.6,
                textWrap: 'pretty',
              }}
            >
              {sub}
            </p>
          ) : null}
          <div className="row mt-8 gap-3" style={{ justifyContent: 'center' }}>
            {primary ? (
              <Link href={primary.href} className="btn btn-accent btn-lg">
                {primary.label} <Icon name="arrow" size={14} />
              </Link>
            ) : null}
            {secondary ? (
              <Link
                href={secondary.href}
                className="btn btn-glass btn-lg"
                style={{ color: 'white' }}
              >
                {secondary.label}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Sub-nav for grouped editorial pages ─────────────────────────────── */

export type SubNavGroup = 'company' | 'support' | 'organizer';

interface SubNavProps {
  group: SubNavGroup;
  active: string;
}

const SUBNAV_TABS: Record<SubNavGroup, Array<{ id: string; href: string; label: string }>> = {
  company: [
    { id: 'about',    href: '/about',    label: 'About' },
    { id: 'trust',    href: '/trust',    label: 'Trust & Safety' },
    { id: 'careers',  href: '/careers',  label: 'Careers' },
    { id: 'press',    href: '/press',    label: 'Press' },
    { id: 'partners', href: '/partners', label: 'Partners' },
    { id: 'contact',  href: '/contact',  label: 'Contact' },
  ],
  support: [
    { id: 'help',              href: '/help',              label: 'Help Centre' },
    { id: 'buyer-protection',  href: '/buyer-protection',  label: 'Buyer Protection' },
    { id: 'refunds',           href: '/refunds',           label: 'Refunds' },
    { id: 'privacy',           href: '/privacy',           label: 'Privacy' },
    { id: 'terms',             href: '/terms',             label: 'Terms' },
    { id: 'cookies',           href: '/cookies',           label: 'Cookies' },
  ],
  organizer: [
    { id: 'overview',     href: '/for-organizers',                label: 'Overview' },
    { id: 'sell-tickets', href: '/for-organizers/sell-tickets',   label: 'Sell Tickets' },
    { id: 'promoter-hub', href: '/for-organizers/promoter-hub',   label: 'Promoter Hub' },
    { id: 'api-access',   href: '/for-organizers/api-access',     label: 'API Access' },
    { id: 'payouts',      href: '/for-organizers/payouts',        label: 'Payouts' },
    { id: 'analytics',    href: '/for-organizers/analytics',      label: 'Analytics' },
    { id: 'onboarding',   href: '/for-organizers/onboarding',     label: 'Onboarding' },
  ],
};

export function ContentSubNav({ group, active }: SubNavProps) {
  const tabs = SUBNAV_TABS[group];
  return (
    <div
      style={{
        borderBottom: '1px solid var(--line)',
        background: 'var(--bg-deep)',
        position: 'sticky',
        top: 'var(--nav-h)',
        zIndex: 30,
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
      }}
    >
      <div className="wrap">
        <nav
          aria-label={`${group} navigation`}
          style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto' }}
        >
          {tabs.map((t) => {
            const isActive = t.id === active;
            return (
              <Link
                key={t.id}
                href={t.href}
                style={{
                  padding: '18px 4px',
                  marginRight: 28,
                  borderBottom: isActive
                    ? '2px solid var(--accent)'
                    : '2px solid transparent',
                  color: isActive ? 'var(--ink)' : 'var(--ink-3)',
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  whiteSpace: 'nowrap',
                  transition: 'color .15s',
                }}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
