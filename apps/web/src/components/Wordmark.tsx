import Image from 'next/image';

export function Wordmark({ size = 22 }: { size?: number }) {
  const img = size + 12;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <Image
        src="/app-icon.png"
        alt=""
        width={img}
        height={img}
        priority
        style={{
          width: img,
          height: img,
          borderRadius: img * 0.22,
          display: 'block',
          boxShadow: '0 2px 8px oklch(0.40 0.15 152 / .25)',
        }}
      />
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 0.95 }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: size,
            fontWeight: 600,
            letterSpacing: '-0.04em',
          }}
        >
          Computicket<span style={{ color: 'var(--accent)' }}>.</span>
        </span>
        <span
          className="mono"
          style={{
            fontSize: 9,
            letterSpacing: '.22em',
            color: 'var(--ink-3)',
            textTransform: 'uppercase',
            marginTop: 1,
          }}
        >
          Nigeria
        </span>
      </span>
    </div>
  );
}
