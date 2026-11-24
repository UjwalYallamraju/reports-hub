/* Reports Hub: shared top bar added to every tool page.
   Usage: <script src="RELATIVE/shared/hub-nav.js" data-root="RELATIVE/" data-section="tests|courses"></script>
   Place it as the first element inside <body>. */
(function () {
  var me = document.currentScript;
  if (!me) return;
  var root = me.getAttribute('data-root') || './';
  var section = me.getAttribute('data-section') || '';

  var css =
    '.hubnav{all:initial;display:block;background:#0E1730;color:#fff;font:500 14px/1.4 "Instrument Sans","Segoe UI",system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased}' +
    '.hubnav *{box-sizing:border-box;font:inherit}' +
    '.hubnav-in{max-width:1240px;margin:0 auto;padding:0 24px;min-height:44px;display:flex;align-items:center;gap:20px;flex-wrap:wrap}' +
    '.hubnav a{color:#C9D2F0;text-decoration:none;padding:6px 10px;border-radius:6px;white-space:nowrap}' +
    '.hubnav a:hover{color:#fff;background:rgba(255,255,255,.1)}' +
    '.hubnav a:focus-visible{outline:2px solid #8FA2FF;outline-offset:2px}' +
    '.hubnav a.hub-brand{color:#fff;font-weight:700;font-size:15px;padding-left:0;display:inline-flex;align-items:center;gap:8px}' +
    '.hubnav a.hub-brand:hover{background:none}' +
    '.hubnav .hub-links{display:flex;gap:4px;margin-left:auto}' +
    '.hubnav a[aria-current="page"]{color:#fff;background:rgba(255,255,255,.14)}' +
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
        '<a href="' + root + 'courses/index.html"' + (section === 'courses' ? ' aria-current="page"' : '') + '>Courses</a>' +
        '<a href="' + root + 'tests/index.html"' + (section === 'tests' ? ' aria-current="page"' : '') + '>Tests</a>' +
      '</div>' +
    '</div>';
  me.parentNode.insertBefore(nav, me);
})();
