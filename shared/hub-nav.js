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

  /* time of day: the sun shifts colour through the day (html[data-tod]).
     morning 5-11 gold · midday 11-16 white-hot · evening 16-19 amber · night 19-5 ember.
     ?tod=night (etc.) in the URL previews a phase. */
  var TOD = ['morning', 'midday', 'evening', 'night'];
  function tod() {
    var f = (/[?&]tod=(\w+)/.exec(location.search) || [])[1];
    if (TOD.indexOf(f) >= 0) return f;
    var h = new Date().getHours();
    return h >= 5 && h < 11 ? 'morning' : h >= 11 && h < 16 ? 'midday' : h >= 16 && h < 19 ? 'evening' : 'night';
  }
  function setTod() { var t = tod(); if (document.documentElement.getAttribute('data-tod') !== t) document.documentElement.setAttribute('data-tod', t); }
  setTod(); setInterval(setTod, 5 * 60 * 1000);

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* light / dark mode. Dark is the signature look; light suits projectors and print-outs.
     Remembered per browser (localStorage "ctr.mode"); ?mode=light previews.
     On tool pages the dark skin sheets (shared/skin/*.css) step aside, so each tool's own
     light design comes back; drop.css stays and carries both looks. */
  var MODE_KEY = 'ctr.mode';
  function storedMode() { try { return localStorage.getItem(MODE_KEY); } catch (e) { return null; } }
  function wantedMode() {
    var f = (/[?&]mode=(light|dark)\b/.exec(location.search) || [])[1];
    return f || (storedMode() === 'light' ? 'light' : 'dark');
  }
  function applyMode(m) {
    var html = document.documentElement;
    html.setAttribute('data-mode', m);
    html.style.colorScheme = m;
    [].forEach.call(document.querySelectorAll('link[rel="stylesheet"][href*="skin/"]'), function (l) {
      if (!/drop\.css/.test(l.getAttribute('href'))) l.disabled = m === 'light';
    });
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', m === 'light' ? '#F6F8FC' : '#0B1020');
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
    '[data-tod="midday"] .hubnav .hub-mark{filter:brightness(1.12) saturate(.9) drop-shadow(0 0 12px rgba(255,230,170,.7))}' +
    '[data-tod="evening"] .hubnav .hub-mark{filter:hue-rotate(-10deg) saturate(1.2) drop-shadow(0 0 10px rgba(240,110,40,.65))}' +
    '[data-tod="night"] .hubnav .hub-mark{filter:hue-rotate(-18deg) saturate(1.15) brightness(.9) drop-shadow(0 0 10px rgba(220,80,40,.6))}' +
    '@media(prefers-reduced-motion:reduce){.hubnav .hub-mark{transition:none}}' +
    '.hubnav .hub-name b{background:linear-gradient(100deg,#8FA9FF,#5FE0BF);-webkit-background-clip:text;background-clip:text;color:transparent;font-weight:700}' +
    '.hubnav .hub-links{display:flex;gap:4px;margin-left:auto}' +
    '.hubnav a[aria-current="page"]{color:#fff;background:rgba(79,124,255,.18);box-shadow:inset 0 0 0 1px rgba(79,124,255,.45)}' +
    '.hubnav a.hub-courses[aria-current="page"]{background:rgba(25,195,156,.16);box-shadow:inset 0 0 0 1px rgba(25,195,156,.45)}' +
    '@media(max-width:600px){.hubnav-in{padding:0 14px}.hubnav a{padding:8px 10px}}' +
    '.hubnav .hub-tools{display:flex;align-items:center;gap:6px;margin-left:6px}' +
    '.hubnav button{all:unset;box-sizing:border-box;display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 10px;border-radius:10px;cursor:pointer;color:#98A3C2;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);font:500 13px/1 Inter,system-ui,sans-serif;transition:color .2s,background .2s,border-color .2s}' +
    '.hubnav button:hover{color:#E8ECF8;background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18)}' +
    '.hubnav button:focus-visible{outline:2px solid #8FA9FF;outline-offset:2px}' +
    '.hubnav button svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
    '.hubnav .hub-mode{width:36px;padding:0;justify-content:center}' +
    '.hubnav kbd{font:600 11px/1 Inter,system-ui,sans-serif;padding:3px 6px;border-radius:6px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);color:inherit}' +
    '@media(max-width:600px){.hubnav .hub-k span,.hubnav .hub-k kbd{display:none}.hubnav .hub-k{width:36px;padding:0;justify-content:center}.hubnav .hub-tools{margin-left:2px}}' +
    '@media(max-width:480px){.hubnav .hub-k{display:none}.hubnav-in{gap:8px;flex-wrap:nowrap}.hubnav .hub-links a{padding:8px 8px}.hubnav a.hub-brand{gap:8px;font-size:15px}.hubnav .hub-mark{width:30px;height:30px}}' +
    /* light mode bar */
    '[data-mode="light"] .hubnav{background:' + (sticky ? 'rgba(255,255,255,.82)' : '#FFFFFF') + ';color:#1A1F2B;border-bottom-color:#E4E7EC}' +
    '[data-mode="light"] .hubnav a{color:#5B6475}[data-mode="light"] .hubnav a:hover{color:#1A1F2B;background:#F1F4FA}' +
    '[data-mode="light"] .hubnav a.hub-brand{color:#1A1F2B}' +
    '[data-mode="light"] .hubnav .hub-name b{background-image:linear-gradient(100deg,#3366FF,#0F936C)}' +
    '[data-mode="light"] .hubnav a[aria-current="page"]{color:#1F4FE0;background:#EBF0FF;box-shadow:inset 0 0 0 1px #C9D6FF}' +
    '[data-mode="light"] .hubnav a.hub-courses[aria-current="page"]{color:#0B7A5A;background:#E6F6F0;box-shadow:inset 0 0 0 1px #B5E6D5}' +
    '[data-mode="light"] .hubnav button{color:#5B6475;border-color:#E4E7EC;background:#F7F8FB}[data-mode="light"] .hubnav button:hover{color:#1A1F2B;background:#EEF1F7}' +
    '[data-mode="light"] .hubnav kbd{background:#fff;border-color:#DDE1E8}' +
    /* page transitions: the bar and the sun stay put, the page slides softly */
    (vt ? '@view-transition{navigation:auto}' +
      '.hubnav{view-transition-name:ct-nav}.hubnav .hub-mark{view-transition-name:ct-sun}' +
      '::view-transition-old(root){animation:ctVtOut .2s ease-in both}::view-transition-new(root){animation:ctVtIn .34s cubic-bezier(.2,.8,.2,1) both}' +
      '::view-transition-group(ct-sun){animation-duration:.5s}' +
      '@keyframes ctVtOut{to{opacity:0;transform:translateY(-8px)}}@keyframes ctVtIn{from{opacity:0;transform:translateY(12px)}}' +
      '@media(prefers-reduced-motion:reduce){::view-transition-group(*),::view-transition-old(*),::view-transition-new(*){animation:none!important}}' : '') +
    '@media print{.hubnav{display:none!important}}' +
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
  applyMode(document.documentElement.getAttribute('data-mode') || 'dark');   // fills the toggle's icon
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
        '.ctk-box{width:min(600px,100%);border-radius:18px;background:rgba(16,23,44,.97);border:1px solid #2E3A5E;color:#E8ECF8;box-shadow:0 40px 100px -30px rgba(0,0,0,.9),0 0 0 1px rgba(79,124,255,.12);overflow:hidden}' +
        '.ctk-in{display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid #232C48}' +
        '.ctk-in svg{width:19px;height:19px;flex:none;fill:none;stroke:#8FA9FF;stroke-width:2;stroke-linecap:round}' +
        '.ctk-in input{all:unset;flex:1;font:500 16px/1.4 Inter,system-ui,sans-serif;color:inherit;outline:none!important;box-shadow:none!important;border:0!important;background:none!important}' +
        '.ctk-in input::placeholder{color:#6B7596}' +
        '.ctk-in kbd,.ctk-foot kbd{font:600 11px/1 Inter,system-ui,sans-serif;padding:3px 6px;border-radius:6px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);color:#98A3C2}' +
        '.ctk-list{list-style:none;margin:0;padding:6px;max-height:min(56vh,420px);overflow:auto}' +
        '.ctk-h{padding:10px 10px 4px;font-size:11.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#6B7596}' +
        '.ctk-o{display:flex;align-items:center;gap:12px;padding:9px 10px;border-radius:11px;cursor:pointer}' +
        '.ctk-o i{width:32px;height:32px;flex:none;border-radius:9px;display:grid;place-items:center;background:rgba(79,124,255,.13);color:#8FA9FF}' +
        '.ctk-o i.c{background:rgba(25,195,156,.13);color:#5FE0BF}.ctk-o i.a{background:rgba(242,140,40,.14);color:#FFC94D}' +
        '.ctk-o svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
        '.ctk-o b{display:block;font-weight:600}.ctk-o small{display:block;color:#98A3C2;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
        '.ctk-o span{min-width:0;flex:1}.ctk-o em{font-style:normal;font-size:11.5px;color:#6B7596}' +
        '.ctk-o[aria-selected="true"]{background:rgba(79,124,255,.16);box-shadow:inset 0 0 0 1px rgba(79,124,255,.35)}' +
        '.ctk-o[aria-selected="true"] em{color:#8FA9FF}' +
        '.ctk-none{padding:26px 10px;text-align:center;color:#98A3C2}' +
        '.ctk-foot{display:flex;gap:16px;padding:10px 16px;border-top:1px solid #232C48;color:#6B7596;font-size:12px}' +
        '.ctk-foot span{display:inline-flex;align-items:center;gap:6px}' +
        '[data-mode="light"] .ctk{background:rgba(26,31,43,.28)}' +
        '[data-mode="light"] .ctk-box{background:#fff;border-color:#E4E7EC;color:#1A1F2B;box-shadow:0 40px 100px -30px rgba(26,31,43,.45)}' +
        '[data-mode="light"] .ctk-in,[data-mode="light"] .ctk-foot{border-color:#EEF0F4}[data-mode="light"] .ctk-in svg{stroke:#3366FF}' +
        '[data-mode="light"] .ctk-o small,[data-mode="light"] .ctk-none{color:#5B6475}[data-mode="light"] .ctk-h,[data-mode="light"] .ctk-foot{color:#8A93A6}' +
        '[data-mode="light"] .ctk-o i{background:#EBF0FF;color:#3366FF}[data-mode="light"] .ctk-o i.c{background:#E6F6F0;color:#0F936C}[data-mode="light"] .ctk-o i.a{background:#FFF1E0;color:#C46A0A}' +
        '[data-mode="light"] .ctk-o[aria-selected="true"]{background:#F0F4FF;box-shadow:inset 0 0 0 1px #C9D6FF}' +
        '[data-mode="light"] .ctk-in kbd,[data-mode="light"] .ctk-foot kbd{background:#F7F8FB;border-color:#E4E7EC;color:#5B6475}' +
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
