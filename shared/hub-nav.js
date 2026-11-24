/* Reports Hub: shared top bar added to every tool page.
   Usage: <script src="RELATIVE/shared/hub-nav.js" data-root="RELATIVE/" data-section="tests|courses"></script>
   Place it as the first element inside <body>. */
(function () {
  var me = document.currentScript;
  if (!me) return;
  var root = me.getAttribute('data-root') || './';
  var section = me.getAttribute('data-section') || '';

  var css =
    '.hubnav{all:initial;display:block;background:#fff;color:#1A1F2B;border-bottom:1px solid #E4E7EC;font:500 14px/1.4 "Instrument Sans","Segoe UI",system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased}' +
    '.hubnav *{box-sizing:border-box;font:inherit}' +
    '.hubnav-in{max-width:1240px;margin:0 auto;padding:0 24px;min-height:44px;display:flex;align-items:center;gap:20px;flex-wrap:wrap}' +
    '.hubnav a{color:#5B6475;text-decoration:none;padding:6px 10px;border-radius:6px;white-space:nowrap}' +
    '.hubnav a:hover{color:#1A1F2B;background:#F1F3F6}' +
    '.hubnav a:focus-visible{outline:2px solid #99B3FF;outline-offset:2px}' +
    '.hubnav a.hub-brand{color:#1A1F2B;font-weight:700;font-size:15px;padding-left:0;display:inline-flex;align-items:center;gap:8px}' +
    '.hubnav a.hub-brand:hover{background:none}' +
    '.hubnav .hub-links{display:flex;gap:4px;margin-left:auto}' +
    '.hubnav a[aria-current="page"]{color:#3366FF;background:#EBF0FF;font-weight:600}' +
    '.hubnav a.hub-courses[aria-current="page"]{color:#0F936C;background:#E3F6EF}' +
    '.hubnav .hub-brand svg{color:#3366FF}' +
    '@media print{.hubnav{display:none!important}}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var logo = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>';
  var nav = document.createElement('nav');
  nav.className = 'hubnav';
  nav.setAttribute('aria-label', 'Reports Hub');
  nav.innerHTML =
    '<div class="hubnav-in">' +
      '<a class="hub-brand" href="' + root + 'index.html">' + logo + 'Reports Hub</a>' +
      '<div class="hub-links">' +
        '<a class="hub-courses" href="' + root + 'courses/index.html"' + (section === 'courses' ? ' aria-current="page"' : '') + '>Courses</a>' +
        '<a href="' + root + 'tests/index.html"' + (section === 'tests' ? ' aria-current="page"' : '') + '>Tests</a>' +
      '</div>' +
    '</div>';
  me.parentNode.insertBefore(nav, me);
})();
