import Script from 'next/script';

export const metadata = {
  title: 'Widget demo — Computicket Nigeria',
  description:
    'Drop a Computicket buy button onto any website with a single script tag.',
};

export default function WidgetDemoPage() {
  return (
    <div className="page-enter wrap" style={{ paddingTop: 48, paddingBottom: 96, maxWidth: 820 }}>
      <div className="eyebrow mb-2">For developers</div>
      <h1 className="h-2" style={{ margin: 0 }}>
        Embeddable buy button
      </h1>
      <p
        className="mt-3"
        style={{ color: 'var(--ink-2)', lineHeight: 1.65, maxWidth: 640 }}
      >
        Add one script tag and a slug. Visitors click, get sent to Computicket checkout
        in a new tab, and tickets are emailed to them and added to their account.
      </p>

      <h2 className="h-3 mt-8">Snippet</h2>
      <pre
        className="mono mt-3"
        style={{
          background: 'oklch(0.10 0.04 285)',
          color: 'oklch(0.95 0.005 285)',
          padding: 18,
          borderRadius: 'var(--r-3)',
          fontSize: 13,
          lineHeight: 1.55,
          overflowX: 'auto',
        }}
      >
{`<script src="https://computicket.ng/widget.js" async></script>

<div data-computicket-event="davido-timeless-tour-lagos"
     data-computicket-text="Buy tickets"></div>`}
      </pre>

      <h2 className="h-3 mt-8">Live preview</h2>
      <p className="text-sm muted mt-2" style={{ lineHeight: 1.55 }}>
        The buttons below are real — they use the same /widget.js this site serves, and
        link to events on this domain.
      </p>
      <div
        className="card mt-4"
        style={{
          padding: 22,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          alignItems: 'center',
          background: 'var(--surface-2)',
          border: 0,
        }}
      >
        <div
          data-computicket-event="davido-timeless-tour-lagos"
          data-computicket-text="Get tickets — Davido"
          data-computicket-base=""
        />
        <div
          data-computicket-event="lagos-comedy-festival"
          data-computicket-text="Lagos Comedy Festival"
          data-computicket-base=""
        />
      </div>

      <Script src="/widget.js" strategy="afterInteractive" />

      <h2 className="h-3 mt-8">Attributes</h2>
      <div
        className="card mt-3"
        style={{ padding: 0, overflow: 'auto' }}
      >
        <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)' }}>
              {['Attribute', 'Required', 'Default'].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '.08em',
                    color: 'var(--ink-3)',
                    fontWeight: 600,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { attr: 'data-computicket-event', req: 'yes', def: '—' },
              { attr: 'data-computicket-text', req: 'no', def: 'Buy tickets' },
              { attr: 'data-computicket-base', req: 'no', def: "Derived from script's origin" },
            ].map((r, i) => (
              <tr
                key={r.attr}
                style={{
                  borderTop: i === 0 ? 0 : '1px solid var(--line)',
                }}
              >
                <td className="mono" style={{ padding: '12px 16px', fontSize: 13 }}>
                  {r.attr}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-2)' }}>{r.req}</td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-2)' }}>{r.def}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs muted mt-8" style={{ lineHeight: 1.6, maxWidth: 640 }}>
        The script weighs about 2 KB gzipped, scans the page on load, and watches for
        dynamic insertion so it works with SPAs and lazy-loaded content. No tracking,
        no third-party calls — just a link with our branding.
      </p>
    </div>
  );
}
