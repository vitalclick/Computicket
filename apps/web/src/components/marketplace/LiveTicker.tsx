import { LIVE_TICKER } from '@/lib/design-data';

export function LiveTicker() {
  const items = [...LIVE_TICKER, ...LIVE_TICKER];
  return (
    <div
      style={{
        overflow: 'hidden',
        borderTop: '1px solid var(--line)',
        borderBottom: '1px solid var(--line)',
        padding: '10px 0',
        background: 'var(--bg-deep)',
      }}
    >
      <div className="marquee">
        {items.map((t, i) => (
          <span
            key={i}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 12.5,
              color: 'var(--ink-2)',
            }}
          >
            <span className="dot dot-live" style={{ color: 'var(--accent)' }} />
            <span>{t}</span>
            <span className="muted-2" style={{ margin: '0 12px' }}>
              ·
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
