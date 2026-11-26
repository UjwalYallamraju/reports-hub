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

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* light / dark mode. Light ("report paper") is the default; dark is charcoal.
     Remembered per browser (localStorage "ctr.mode"); ?mode=dark previews.
     On tool pages the dark skin sheets (shared/skin/*.css) step aside, so each tool's own
     light design comes back; drop.css stays and carries both looks. */
  var MODE_KEY = 'ctr.mode';
  function storedMode() { try { return localStorage.getItem(MODE_KEY); } catch (e) { return null; } }
  function wantedMode() {
    var f = (/[?&]mode=(light|dark)\b/.exec(location.search) || [])[1];
    return f || (storedMode() === 'dark' ? 'dark' : 'light');
  }
  function applyMode(m) {
    var html = document.documentElement;
    html.setAttribute('data-mode', m);
    html.style.colorScheme = m;
    [].forEach.call(document.querySelectorAll('link[rel="stylesheet"][href*="skin/"]'), function (l) {
      if (!/(drop|tool)\.css/.test(l.getAttribute('href'))) l.disabled = m === 'light';
    });
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', m === 'light' ? '#F7F5F0' : '#15171C');
    var b = document.querySelector('.hubnav .hub-mode');
    if (b) {
      b.innerHTML = m === 'light' ? ICON.moon : ICON.sun;
      b.setAttribute('aria-label', m === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
      b.title = b.getAttribute('aria-label');
    }
    try { document.dispatchEvent(new CustomEvent('ct:mode', {detail: m})); } catch (e) {}
  }
  function setMode(m) {
    try { localStorage.setItem(MODE_KEY, m); } catch (e) {}
    if (document.startViewTransition && !reduce) document.startViewTransition(function () { applyMode(m); });
    else applyMode(m);
  }
  var ICON = {
    sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>',
    moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></svg>'
  };
  applyMode(wantedMode());
  // page-to-page transitions (Chrome, Edge, Safari 18.2+); other browsers keep the gentle fade
  var vt = 'onpagereveal' in window;
  // a transition that is cut short (another navigation, a quick history change) is harmless: keep it quiet
  var hush = function (t) { if (t) [t.ready, t.finished, t.updateCallbackDone].forEach(function (pr) { if (pr && pr.catch) pr.catch(function () {}); }); };
  if (vt) {
    addEventListener('pagereveal', function (e) { hush(e.viewTransition); window.__ctVT = e.viewTransition || null; });
    addEventListener('pageswap', function (e) { hush(e.viewTransition); });
  }

  var css =
    '.hubnav{all:initial;display:block;position:' + (sticky ? 'sticky' : 'relative') + ';top:0;z-index:50;' +
      'background:#15171C;' +
      'border-bottom:1px solid #2C3038;color:#ECEAE4;font:500 14px/1.4 Inter,"Segoe UI",system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased}' +
    '.hubnav *{box-sizing:border-box;font:inherit}' +
    '.hubnav-in{max-width:1200px;margin:0 auto;padding:0 24px;min-height:58px;display:flex;align-items:center;gap:16px;flex-wrap:wrap}' +
    '.hubnav a{color:#A3A7AE;text-decoration:none;padding:8px 14px;border-radius:10px;white-space:nowrap;transition:color .2s ease,background .2s ease}' +
    '.hubnav a:hover{color:#ECEAE4;background:rgba(255,255,255,.07)}' +
    '.hubnav a:focus-visible{outline:2px solid #F08A4B;outline-offset:2px}' +
    '.hubnav a.hub-brand{display:inline-flex;align-items:center;gap:10px;padding:6px 6px 6px 0;color:#ECEAE4;font-weight:700;font-size:16px;letter-spacing:-.01em}' +
    '.hubnav a.hub-brand:hover{background:none}' +
    '.hubnav .hub-mark{width:34px;height:34px;display:block;transition:transform .6s cubic-bezier(.2,.8,.2,1)}' +
    '.hubnav a.hub-brand:hover .hub-mark{transform:rotate(45deg)}' +
    '@media(prefers-reduced-motion:reduce){.hubnav .hub-mark{transition:none}}' +
    '.hubnav .hub-name b{color:inherit;font-weight:700}' +
    '.hubnav .hub-links{display:flex;gap:4px;margin-left:auto}' +
    '.hubnav a[aria-current="page"]{color:#ECEAE4;background:#23262D;box-shadow:inset 0 0 0 1px #3A3F48}' +
    '@media(max-width:600px){.hubnav-in{padding:0 14px}.hubnav a{padding:8px 10px}}' +
    '.hubnav .hub-tools{display:flex;align-items:center;gap:6px;margin-left:6px}' +
    '.hubnav button{all:unset;box-sizing:border-box;display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 10px;border-radius:10px;cursor:pointer;color:#A3A7AE;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);font:500 13px/1 Inter,system-ui,sans-serif;transition:color .2s,background .2s,border-color .2s}' +
    '.hubnav button:hover{color:#ECEAE4;background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18)}' +
    '.hubnav button:focus-visible{outline:2px solid #F08A4B;outline-offset:2px}' +
    '.hubnav button svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
    '.hubnav .hub-mode{width:36px;padding:0;justify-content:center}' +
    '.hubnav kbd{font:600 11px/1 Inter,system-ui,sans-serif;padding:3px 6px;border-radius:6px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);color:inherit}' +
    '@media(max-width:600px){.hubnav .hub-k span,.hubnav .hub-k kbd{display:none}.hubnav .hub-k{width:36px;padding:0;justify-content:center}.hubnav .hub-tools{margin-left:2px}}' +
    '@media(max-width:480px){.hubnav .hub-k{display:none}.hubnav-in{gap:8px;flex-wrap:nowrap}.hubnav .hub-links a{padding:8px 8px}.hubnav a.hub-brand{gap:8px;font-size:15px}.hubnav .hub-mark{width:30px;height:30px}}' +
    /* light mode bar */
    '[data-mode="light"] .hubnav{background:#F7F5F0;color:#1C1F26;border-bottom-color:#E3E0D8}' +
    '[data-mode="light"] .hubnav a{color:#5E6470}[data-mode="light"] .hubnav a:hover{color:#1C1F26;background:#F1EEE7}' +
    '[data-mode="light"] .hubnav a.hub-brand{color:#1C1F26}' +
    '[data-mode="light"] .hubnav a[aria-current="page"]{color:#1C1F26;background:#FFFFFF;box-shadow:inset 0 0 0 1px #D6D2C8}' +
    '[data-mode="light"] .hubnav button{color:#5E6470;border-color:#E3E0D8;background:#F1EEE7}[data-mode="light"] .hubnav button:hover{color:#1C1F26;background:#F1EEE7}' +
    '[data-mode="light"] .hubnav kbd{background:#fff;border-color:#D6D2C8}' +
    /* page transitions: the bar and the sun stay put, the page slides softly */
    (vt ? '@view-transition{navigation:auto}' +
      '.hubnav{view-transition-name:ct-nav}.hubnav .hub-mark{view-transition-name:ct-sun}' +
      '::view-transition-old(root){animation:ctVtOut .2s ease-in both}::view-transition-new(root){animation:ctVtIn .34s cubic-bezier(.2,.8,.2,1) both}' +
      '::view-transition-group(ct-sun){animation-duration:.5s}' +
      '@keyframes ctVtOut{to{opacity:0;transform:translateY(-8px)}}@keyframes ctVtIn{from{opacity:0;transform:translateY(12px)}}' +
      '@media(prefers-reduced-motion:reduce){::view-transition-group(*),::view-transition-old(*),::view-transition-new(*){animation:none!important}}' : '') +
    /* slim footer on tool pages, laid out like the landing pages' footer and aligned with the bar above.
       Every box sets its own size and spacing so no tool's styles can shift it. */
    '.ct-foot{all:initial;display:block;box-sizing:border-box;margin-top:32px;border-top:1px solid rgba(255,255,255,.08);color:#878C94;font:400 13.5px/1.5 Inter,"Segoe UI",system-ui,sans-serif;-webkit-font-smoothing:antialiased}' +
    '.ct-foot *{box-sizing:border-box!important;margin:0!important;padding:0;border:0!important;background:none!important;box-shadow:none!important;font:inherit;line-height:inherit;letter-spacing:normal;text-transform:none;position:static}' +
    '.ct-foot .ct-foot-in{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px 24px;width:100%;max-width:1200px;margin:0 auto!important;padding:18px 24px 22px!important}' +
    '.ct-foot .ct-foot-l{display:flex;flex-wrap:wrap;align-items:center;gap:6px 18px}' +
    '.ct-foot .ct-foot-b{display:inline-flex;align-items:center;gap:8px;font-weight:600;color:#A3A7AE}' +
    '.ct-foot img{display:block;width:18px;height:18px}' +
    '.ct-foot nav{display:flex;gap:16px}' +
    '.ct-foot a{color:#A3A7AE;text-decoration:none}.ct-foot a:hover{color:#ECEAE4}.ct-foot a:focus-visible{outline:2px solid #F08A4B;outline-offset:2px;border-radius:4px}' +
    '[data-mode="light"] .ct-foot{border-top-color:#E3E0D8;color:#686D76}[data-mode="light"] .ct-foot .ct-foot-b,[data-mode="light"] .ct-foot a{color:#5E6470}[data-mode="light"] .ct-foot a:hover{color:#1C1F26}' +
    '@media(max-width:600px){.ct-foot .ct-foot-in{flex-direction:column;align-items:flex-start;padding:16px 14px 20px!important}}' +
    '@media print{.hubnav,.ct-foot{display:none!important}}' +
    (fade && !vt ? '@keyframes hubIn{from{opacity:0}to{opacity:1}}@media(prefers-reduced-motion:no-preference){body>*:not(.hubnav):not(script):not(style){animation:hubIn .5s ease-out both}}' : '');

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
      '<div class="hub-tools">' +
        '<button type="button" class="hub-k" aria-label="Search pages and actions" title="Search pages and actions">' + ICON.search + '<span>Search</span><kbd>' + (/Mac|iP/.test(navigator.platform) ? '\u2318K' : 'Ctrl K') + '</kbd></button>' +
        '<button type="button" class="hub-mode"></button>' +
      '</div>' +
    '</div>';
  me.parentNode.insertBefore(nav, me);
  if (!sticky) {
    var addFoot = function () {
      if (document.querySelector('.ct-foot')) return;
      var f = document.createElement('footer'); f.className = 'ct-foot';
      f.innerHTML = '<div class="ct-foot-in"><div class="ct-foot-l"><span class="ct-foot-b"><img src="' + root + 'shared/brand/logo-96.png" alt="">CodeTantra Reports</span>' +
        '<nav aria-label="Footer"><a href="' + root + 'tests/index.html">Tests</a><a href="' + root + 'courses/index.html">Courses</a></nav></div>' +
        '<span>Files are read in your browser and never uploaded to a server.</span></div>';
      document.body.appendChild(f);
      // short page: the footer sits at the bottom of the window; long page: 32px after the content
      var base = 32, queued = false;
      var place = function () {
        queued = false;
        var cur = parseFloat(f.style.marginTop) || base;
        var bottom = f.getBoundingClientRect().bottom + scrollY - cur + base;   // where it would end with the normal gap
        var m = base + Math.max(0, Math.floor(innerHeight - bottom));
        if (Math.abs(m - cur) > 0.5) f.style.marginTop = m + 'px';
      };
      var later = function () { if (!queued) { queued = true; requestAnimationFrame(place); } };
      place();
      addEventListener('resize', later);
      addEventListener('load', later);
      if (window.ResizeObserver) new ResizeObserver(later).observe(document.body);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addFoot); else addFoot();
  }
  applyMode(document.documentElement.getAttribute('data-mode') || 'light');   // fills the toggle's icon
  nav.querySelector('.hub-mode').addEventListener('click', function () {
    setMode(document.documentElement.getAttribute('data-mode') === 'light' ? 'dark' : 'light');
  });
  nav.querySelector('.hub-k').addEventListener('click', function () { palette.open(); });
  addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase();
    if ((e.metaKey || e.ctrlKey) && k === 'k') { e.preventDefault(); palette.toggle(); return; }
    if (k === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      var t = e.target, tag = (t && t.tagName) || '';
      if (/INPUT|TEXTAREA|SELECT/.test(tag) || (t && t.isContentEditable)) return;
      e.preventDefault(); palette.open();
    }
  });

  /* ---------- command palette (Ctrl/Cmd+K or "/") ----------
     Go to any page or tool, run this page's download/copy buttons, switch light/dark. */
  var palette = (function () {
    var PAGES = [
      ['Home', 'index.html', 'Overview of every tool', 'home'],
      ['Tests', 'tests/index.html', 'All test report tools', 'grid'],
      ['Courses', 'courses/index.html', 'All course report tools', 'grid'],
      ['Single test report', 'tests/single-tests-report.html', 'One test: Attempted and Not Attempted files', 'test'],
      ['Group-wise tests report', 'tests/group-tests-report.html', 'Several tests compared across groups', 'test'],
      ['Section-wise test analysis', 'tests/section-report.html', 'Sections, groups, findings and a PDF', 'test'],
      ['Sectional cut-off report', 'tests/sectional-cutoff-report.html', 'Qualification by section cut-offs, any company', 'test'],
      ['Course progress insights', 'courses/insights/index.html', 'Course completion by section', 'course']
    ];
    var IC = {
      home: '<path d="M4 11l8-7 8 7v8.5a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H5.5A1.5 1.5 0 0 1 4 19.5z"/>',
      grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
      test: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
      course: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5"/>',
      run: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
      mode: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 0 0 16z" fill="currentColor"/>'
    };
    var el, input, list, items = [], shown = [], sel = 0, lastFocus = null;
    var here = location.pathname.replace(/\/index\.html$/, '/');

    function build() {
      var s = document.createElement('style');
      s.textContent =
        '.ctk{position:fixed;inset:0;z-index:10050;display:none;align-items:flex-start;justify-content:center;padding:12vh 16px 16px;background:rgba(5,8,18,.55);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);font:400 14px/1.4 Inter,system-ui,sans-serif}' +
        '.ctk.on{display:flex}' +
        '.ctk-box{width:min(600px,100%);border-radius:18px;background:rgba(16,23,44,.97);border:1px solid #3A3F48;color:#ECEAE4;box-shadow:0 40px 100px -30px rgba(0,0,0,.9),0 0 0 1px rgba(240,138,75,.12);overflow:hidden}' +
        '.ctk-in{display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid #2C3038}' +
        '.ctk-in svg{width:19px;height:19px;flex:none;fill:none;stroke:#F08A4B;stroke-width:2;stroke-linecap:round}' +
        '.ctk-in input{all:unset;flex:1;font:500 16px/1.4 Inter,system-ui,sans-serif;color:inherit;outline:none!important;box-shadow:none!important;border:0!important;background:none!important}' +
        '.ctk-in input::placeholder{color:#878C94}' +
        '.ctk-in kbd,.ctk-foot kbd{font:600 11px/1 Inter,system-ui,sans-serif;padding:3px 6px;border-radius:6px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);color:#A3A7AE}' +
        '.ctk-list{list-style:none;margin:0;padding:6px;max-height:min(56vh,420px);overflow:auto}' +
        '.ctk-h{padding:10px 10px 4px;font-size:11.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#878C94}' +
        '.ctk-o{display:flex;align-items:center;gap:12px;padding:9px 10px;border-radius:11px;cursor:pointer}' +
        '.ctk-o i{width:32px;height:32px;flex:none;border-radius:9px;display:grid;place-items:center;background:rgba(240,138,75,.13);color:#F08A4B}' +
        '.ctk-o i.c{background:rgba(109,190,149,.13);color:#6DBE95}.ctk-o i.a{background:rgba(240,138,75,.14);color:#F08A4B}' +
        '.ctk-o svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
        '.ctk-o b{display:block;font-weight:600}.ctk-o small{display:block;color:#A3A7AE;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
        '.ctk-o span{min-width:0;flex:1}.ctk-o em{font-style:normal;font-size:11.5px;color:#878C94}' +
        '.ctk-o[aria-selected="true"]{background:rgba(240,138,75,.16);box-shadow:inset 0 0 0 1px rgba(240,138,75,.35)}' +
        '.ctk-o[aria-selected="true"] em{color:#F08A4B}' +
        '.ctk-none{padding:26px 10px;text-align:center;color:#A3A7AE}' +
        '.ctk-foot{display:flex;gap:16px;padding:10px 16px;border-top:1px solid #2C3038;color:#878C94;font-size:12px}' +
        '.ctk-foot span{display:inline-flex;align-items:center;gap:6px}' +
        '[data-mode="light"] .ctk{background:rgba(28,31,38,.28)}' +
        '[data-mode="light"] .ctk-box{background:#fff;border-color:#E3E0D8;color:#1C1F26;box-shadow:0 40px 100px -30px rgba(28,31,38,.45)}' +
        '[data-mode="light"] .ctk-in,[data-mode="light"] .ctk-foot{border-color:#F1EEE7}[data-mode="light"] .ctk-in svg{stroke:#C2410C}' +
        '[data-mode="light"] .ctk-o small,[data-mode="light"] .ctk-none{color:#5E6470}[data-mode="light"] .ctk-h,[data-mode="light"] .ctk-foot{color:#686D76}' +
        '[data-mode="light"] .ctk-o i{background:#FBEDE4;color:#C2410C}[data-mode="light"] .ctk-o i.c{background:#E4EFE8;color:#2E7D5B}[data-mode="light"] .ctk-o i.a{background:#FBEDE4;color:#A8380A}' +
        '[data-mode="light"] .ctk-o[aria-selected="true"]{background:#FBEDE4;box-shadow:inset 0 0 0 1px #EBC3A8}' +
        '[data-mode="light"] .ctk-in kbd,[data-mode="light"] .ctk-foot kbd{background:#F1EEE7;border-color:#E3E0D8;color:#5E6470}' +
        '@media print{.ctk{display:none!important}}';
      document.head.appendChild(s);
      el = document.createElement('div');
      el.className = 'ctk';
      el.innerHTML =
        '<div class="ctk-box" role="dialog" aria-modal="true" aria-label="Search pages and actions">' +
          '<div class="ctk-in">' + ICON.search + '<input type="text" role="combobox" aria-expanded="true" aria-controls="ctk-list" aria-autocomplete="list" placeholder="Go to a tool or run an action…" spellcheck="false" autocomplete="off"><kbd>Esc</kbd></div>' +
          '<ul class="ctk-list" id="ctk-list" role="listbox"></ul>' +
          '<div class="ctk-foot"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span></div>' +
        '</div>';
      document.body.appendChild(el);
      input = el.querySelector('input'); list = el.querySelector('.ctk-list');
      el.addEventListener('mousedown', function (e) { if (e.target === el) close(); });
      input.addEventListener('input', function () { sel = 0; render(); });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
        else if (e.key === 'Enter') { e.preventDefault(); if (shown[sel]) run(shown[sel]); }
        else if (e.key === 'Escape') { e.preventDefault(); close(); }
        else if (e.key === 'Tab') { e.preventDefault(); move(e.shiftKey ? -1 : 1); }
      });
      list.addEventListener('mousemove', function (e) {
        var o = e.target.closest && e.target.closest('.ctk-o'); if (!o) return;
        var i = +o.getAttribute('data-i'); if (i !== sel) { sel = i; mark(); }
      });
      list.addEventListener('click', function (e) {
        var o = e.target.closest && e.target.closest('.ctk-o'); if (o) run(shown[+o.getAttribute('data-i')]);
      });
    }

    function collect() {
      var out = [];
      var mode = document.documentElement.getAttribute('data-mode');
      out.push({g: 'Actions', t: mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode', d: mode === 'light' ? 'The glowing night look' : 'Crisp and bright, good for projectors', ic: 'mode', k: 'theme light dark mode appearance', fn: function () { setMode(mode === 'light' ? 'dark' : 'light'); }});
      // this page's own download / copy buttons
      var seen = {};
      [].forEach.call(document.querySelectorAll('button, a.btn, [role="button"]'), function (b) {
        if (b.closest('.hubnav,.ctk') || b.disabled || b.getAttribute('aria-disabled') === 'true' || !b.offsetParent) return;
        var t = (b.textContent || '').replace(/\s+/g, ' ').trim();
        if (!t || t.length > 48 || !/download|copy|export|zip|pdf|excel|print/i.test(t) || seen[t]) return;
        seen[t] = 1;
        out.push({g: 'On this page', t: t, d: 'Runs the button on this page', ic: 'run', k: t, fn: function () { b.scrollIntoView({block: 'center', behavior: reduce ? 'auto' : 'smooth'}); b.click(); }});
      });
      PAGES.forEach(function (p) {
        var url = root + p[1], cur = new URL(url, location.href).pathname.replace(/\/index\.html$/, '/') === here;
        out.push({g: 'Go to', t: p[0], d: p[2], ic: p[3], k: p[0] + ' ' + p[2], cur: cur, fn: function () { location.href = url; }});
      });
      return out;
    }

    // forgiving match: every typed word must appear (prefix of a word scores higher)
    function score(it, q) {
      if (!q) return 1;
      var hay = (it.t + ' ' + it.k).toLowerCase(), s = 0;
      var words = q.toLowerCase().split(/\s+/).filter(Boolean);
      for (var i = 0; i < words.length; i++) {
        var w = words[i], at = hay.indexOf(w);
        if (at < 0) return 0;
        s += (at === 0 || /\W/.test(hay.charAt(at - 1)) ? 3 : 1) + (it.t.toLowerCase().indexOf(w) >= 0 ? 2 : 0);
      }
      return s;
    }

    function render() {
      var q = input.value.trim();
      shown = items.map(function (it) { return {it: it, s: score(it, q)}; }).filter(function (x) { return x.s > 0; });
      if (q) shown.sort(function (a, b) { return b.s - a.s; });
      shown = shown.map(function (x) { return x.it; });
      var html = '', g = null;
      shown.forEach(function (it, i) {
        if (!q && it.g !== g) { g = it.g; html += '<li class="ctk-h" role="presentation">' + g + '</li>'; }
        var cls = it.ic === 'course' ? 'c' : (it.ic === 'run' || it.ic === 'mode') ? 'a' : '';
        html += '<li class="ctk-o" role="option" id="ctk-o' + i + '" data-i="' + i + '"><i class="' + cls + '"><svg viewBox="0 0 24 24">' + IC[it.ic] + '</svg></i>' +
          '<span><b></b><small></small></span>' + (it.cur ? '<em>You are here</em>' : '') + '</li>';
      });
      list.innerHTML = html || '<li class="ctk-none">Nothing matches “<span></span>”</li>';
      if (!html) list.querySelector('.ctk-none span').textContent = q;
      // names go in as text, never as HTML
      [].forEach.call(list.querySelectorAll('.ctk-o'), function (o) {
        var it = shown[+o.getAttribute('data-i')];
        o.querySelector('b').textContent = it.t; o.querySelector('small').textContent = it.d;
      });
      if (sel >= shown.length) sel = 0;
      mark();
    }
    function mark() {
      [].forEach.call(list.querySelectorAll('.ctk-o'), function (o) {
        var on = +o.getAttribute('data-i') === sel;
        o.setAttribute('aria-selected', on ? 'true' : 'false');
        if (on) { input.setAttribute('aria-activedescendant', o.id); o.scrollIntoView({block: 'nearest'}); }
      });
    }
    function move(d) { if (!shown.length) return; sel = (sel + d + shown.length) % shown.length; mark(); }
    function run(it) { if (!it) return; close(); setTimeout(it.fn, 10); }
    function open() {
      if (!el) build();
      if (el.classList.contains('on')) return;
      lastFocus = document.activeElement;
      items = collect(); sel = 0; input.value = '';
      render();
      el.classList.add('on');
      input.focus();
      var box = el.firstChild;
      if (window.anime && !reduce) window.anime.animate(box, {opacity: [0, 1], translateY: [-12, 0], scale: [0.98, 1], duration: 260, ease: 'outCubic'});
    }
    function close() {
      if (!el || !el.classList.contains('on')) return;
      el.classList.remove('on');
      if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {}
    }
    return {open: open, close: close, toggle: function () { el && el.classList.contains('on') ? close() : open(); }};
  })();
})();
