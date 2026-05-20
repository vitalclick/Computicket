import Script from 'next/script';

export const metadata = {
  title: 'Widget demo — Computicket Nigeria',
  description:
    'Drop a Computicket buy button onto any website with a single script tag.',
};

export default function WidgetDemoPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">Embeddable buy button</h1>
      <p className="mt-3 text-gray-700 leading-relaxed">
        Add one script tag and a slug. Visitors click, get sent to Computicket checkout in a new tab,
        and tickets are emailed to them and added to their account.
      </p>

      <h2 className="mt-10 text-lg font-semibold">Snippet</h2>
      <pre className="mt-3 bg-gray-900 text-gray-100 rounded-md p-4 text-sm overflow-x-auto">
{`<script src="https://computicket.ng/widget.js" async></script>

<div data-computicket-event="davido-timeless-tour-lagos"
     data-computicket-text="Buy tickets"></div>`}
      </pre>

      <h2 className="mt-10 text-lg font-semibold">Live preview</h2>
      <p className="mt-2 text-sm text-gray-600">
        The buttons below are real — they use the same /widget.js this site serves, and link to events on this domain.
      </p>

      <div className="mt-6 flex flex-wrap gap-4 items-center">
        <div
          data-computicket-event="davido-timeless-tour-lagos"
          data-computicket-text="Get tickets — Davido"
          data-computicket-base="" />
        <div
          data-computicket-event="lagos-comedy-festival"
          data-computicket-text="Lagos Comedy Festival"
          data-computicket-base="" />
      </div>

      <Script src="/widget.js" strategy="afterInteractive" />

      <h2 className="mt-12 text-lg font-semibold">Attributes</h2>
      <table className="mt-3 w-full text-sm border border-gray-200 rounded-md overflow-hidden">
        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="p-3">Attribute</th>
            <th className="p-3">Required</th>
            <th className="p-3">Default</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          <tr className="border-t border-gray-200">
            <td className="p-3 font-mono">data-computicket-event</td>
            <td className="p-3">yes</td>
            <td className="p-3 text-gray-400">—</td>
          </tr>
          <tr className="border-t border-gray-200">
            <td className="p-3 font-mono">data-computicket-text</td>
            <td className="p-3">no</td>
            <td className="p-3">Buy tickets</td>
          </tr>
          <tr className="border-t border-gray-200">
            <td className="p-3 font-mono">data-computicket-base</td>
            <td className="p-3">no</td>
            <td className="p-3">Derived from script&apos;s origin</td>
          </tr>
        </tbody>
      </table>

      <p className="mt-10 text-xs text-gray-500">
        The script weighs about 2 KB gzipped, scans the page on load, and watches for dynamic insertion so it works
        with SPAs and lazy-loaded content. No tracking, no third-party calls — just a link with our branding.
      </p>
    </div>
  );
}
