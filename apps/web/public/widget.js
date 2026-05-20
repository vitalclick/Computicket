/*!
 * Computicket Nigeria embeddable buy button.
 *
 * Drop in:
 *   <script src="https://computicket.ng/widget.js" async></script>
 *   <div data-computicket-event="davido-timeless-tour-lagos"
 *        data-computicket-text="Get tickets"></div>
 *
 * The script scans the page on load (and on DOMNodeInserted, throttled)
 * and replaces matching elements with a styled, accessible button that
 * links to the event's checkout. New events can be added dynamically;
 * the script picks them up automatically.
 *
 * Attributes:
 *   data-computicket-event   (required) — event slug
 *   data-computicket-text                  — button label (default: "Buy tickets")
 *   data-computicket-base                  — checkout origin (default: derived from script src)
 */
(function () {
  'use strict';

  var SCRIPT = document.currentScript || (function () {
    var s = document.getElementsByTagName('script');
    return s[s.length - 1];
  })();

  // Derive marketplace origin from the script's src, e.g. "https://computicket.ng/widget.js"
  // becomes "https://computicket.ng".
  var DEFAULT_BASE = (function () {
    try {
      return new URL(SCRIPT.src).origin;
    } catch (e) {
      return 'https://computicket.ng';
    }
  })();

  var STYLE_ID = 'computicket-widget-style';
  if (!document.getElementById(STYLE_ID)) {
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '.ctng-buy{display:inline-flex;align-items:center;gap:8px;background:#008751;color:#fff;' +
      'font:600 14px/1.2 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;' +
      'padding:10px 16px;border-radius:6px;text-decoration:none;cursor:pointer;border:0;' +
      'transition:background .15s ease}' +
      '.ctng-buy:hover{background:#005a35}' +
      '.ctng-buy:focus{outline:2px solid #008751;outline-offset:2px}' +
      '.ctng-buy::before{content:"";width:14px;height:14px;background:no-repeat center/contain;' +
      "background-image:url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'><path d='M4 6h16v3a2 2 0 000 4v3H4v-3a2 2 0 000-4V6zm6 0v12'/></svg>\")}";
    document.head.appendChild(style);
  }

  function render(el) {
    if (el.getAttribute('data-computicket-rendered') === '1') return;
    var slug = el.getAttribute('data-computicket-event');
    if (!slug) return;
    var text = el.getAttribute('data-computicket-text') || 'Buy tickets';
    var base = el.getAttribute('data-computicket-base') || DEFAULT_BASE;

    var a = document.createElement('a');
    a.href = base + '/events/' + encodeURIComponent(slug);
    a.className = 'ctng-buy';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', text + ' for ' + slug + ' on Computicket');
    a.textContent = text;

    el.innerHTML = '';
    el.appendChild(a);
    el.setAttribute('data-computicket-rendered', '1');
  }

  function scan() {
    var els = document.querySelectorAll('[data-computicket-event]:not([data-computicket-rendered="1"])');
    for (var i = 0; i < els.length; i++) render(els[i]);
  }

  // Initial pass + observe for dynamically-added elements.
  function init() {
    scan();
    if (typeof MutationObserver !== 'undefined') {
      var pending = false;
      var obs = new MutationObserver(function () {
        if (pending) return;
        pending = true;
        setTimeout(function () { pending = false; scan(); }, 50);
      });
      obs.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
