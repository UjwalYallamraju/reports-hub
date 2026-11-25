/* CodeTantra Reports: shared top bar added to every page.
   Usage: <script src="RELATIVE/shared/hub-nav.js" data-root="RELATIVE/" data-section="tests|courses"></script>
   Place it as the first element inside <body>. Optional: data-sticky="on" keeps it pinned (landing pages),
   data-fade="off" skips the gentle page fade (landing pages animate themselves). */
(function () {
  var me = document.currentScript;
  if (!me) return;
  var root = me.getAttribute('data-root') || './';
  var section = me.getAttribute('data-section') || '';
  var sticky = me.getAttribute('data-sticky') === 'on';
  var fade = me.getAttribute('data-fade') !== 'off';

  var css =
    '.hubnav{all:initial;display:block;position:' + (sticky ? 'sticky' : 'relative') + ';top:0;z-index:50;' +
      (sticky ? 'background:rgba(11,16,32,.86);-webkit-backdrop-filter:saturate(160%) blur(14px);backdrop-filter:saturate(160%) blur(14px);' : 'background:#0B1020;') +
      'border-bottom:1px solid rgba(255,255,255,.08);color:#E8ECF8;font:500 14px/1.4 Inter,"Segoe UI",system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased}' +
    '.hubnav *{box-sizing:border-box;font:inherit}' +
    '.hubnav::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:1px;background:linear-gradient(90deg,transparent,rgba(79,124,255,.7),rgba(25,195,156,.7),transparent);opacity:.7}' +
    '.hubnav-in{max-width:1200px;margin:0 auto;padding:0 24px;min-height:58px;display:flex;align-items:center;gap:16px;flex-wrap:wrap}' +
    '.hubnav a{color:#98A3C2;text-decoration:none;padding:8px 14px;border-radius:10px;white-space:nowrap;transition:color .2s ease,background .2s ease}' +
    '.hubnav a:hover{color:#E8ECF8;background:rgba(255,255,255,.07)}' +
    '.hubnav a:focus-visible{outline:2px solid #8FA9FF;outline-offset:2px}' +
    '.hubnav a.hub-brand{display:inline-flex;align-items:center;gap:10px;padding:6px 6px 6px 0;color:#E8ECF8;font-weight:700;font-size:16px;letter-spacing:-.01em}' +
    '.hubnav a.hub-brand:hover{background:none}' +
    '.hubnav .hub-mark{width:34px;height:34px;display:block;filter:drop-shadow(0 0 10px rgba(242,140,40,.55));transition:transform .6s cubic-bezier(.2,.8,.2,1)}' +
    '.hubnav a.hub-brand:hover .hub-mark{transform:rotate(45deg)}' +
    '@media(prefers-reduced-motion:reduce){.hubnav .hub-mark{transition:none}}' +
    '.hubnav .hub-name b{background:linear-gradient(100deg,#8FA9FF,#5FE0BF);-webkit-background-clip:text;background-clip:text;color:transparent;font-weight:700}' +
    '.hubnav .hub-links{display:flex;gap:4px;margin-left:auto}' +
    '.hubnav a[aria-current="page"]{color:#fff;background:rgba(79,124,255,.18);box-shadow:inset 0 0 0 1px rgba(79,124,255,.45)}' +
    '.hubnav a.hub-courses[aria-current="page"]{background:rgba(25,195,156,.16);box-shadow:inset 0 0 0 1px rgba(25,195,156,.45)}' +
    '@media(max-width:600px){.hubnav-in{padding:0 14px}.hubnav a{padding:8px 10px}}' +
    '@media print{.hubnav{display:none!important}}' +
    (fade ? '@keyframes hubIn{from{opacity:0}to{opacity:1}}@media(prefers-reduced-motion:no-preference){body>*:not(.hubnav):not(script):not(style){animation:hubIn .5s ease-out both}}' : '');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var mark = '<img class="hub-mark" src="' + root + 'shared/brand/logo-96.png" width="34" height="34" alt="">';

  // Same browser-tab icon on every page, tools included.
  [].forEach.call(document.querySelectorAll('link[rel~="icon"],link[rel="apple-touch-icon"]'), function (l) { l.parentNode.removeChild(l); });
  [['icon', 'shared/brand/favicon-32.png', '32x32'], ['icon', 'shared/brand/favicon-64.png', '64x64'], ['apple-touch-icon', 'shared/brand/apple-touch-icon.png', '180x180']].forEach(function (f) {
    var l = document.createElement('link'); l.rel = f[0]; l.type = 'image/png'; l.sizes = f[2]; l.href = root + f[1]; document.head.appendChild(l);
  });
  var nav = document.createElement('nav');
  nav.className = 'hubnav';
  nav.setAttribute('aria-label', 'CodeTantra Reports');
  nav.innerHTML =
    '<div class="hubnav-in">' +
      '<a class="hub-brand" href="' + root + 'index.html">' + mark + '<span class="hub-name">CodeTantra <b>Reports</b></span></a>' +
      '<div class="hub-links">' +
        '<a class="hub-courses" href="' + root + 'courses/index.html"' + (section === 'courses' ? ' aria-current="page"' : '') + '>Courses</a>' +
        '<a href="' + root + 'tests/index.html"' + (section === 'tests' ? ' aria-current="page"' : '') + '>Tests</a>' +
      '</div>' +
    '</div>';
  me.parentNode.insertBefore(nav, me);
})();
