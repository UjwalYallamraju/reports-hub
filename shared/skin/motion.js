/* CodeTantra Reports: motion for tool pages (anime.js v4).
   <script src="../shared/skin/motion.js"
           data-items=".kpi,.sec"        report cards that rise in when a report first appears
           data-count=".kpi .v"          numbers that count up at the same moment
           data-drop=".drop"></script>   upload zones that react to drag and drop
   Also shows a small spinning-sun badge while a PDF or ZIP is being built.
   Re-renders while typing or filtering do not replay anything; loading a new file does.
   With reduced motion: no movement, but the busy badge still appears (without spinning). */
(function () {
  var me = document.currentScript;
  if (!me) return;
  var A = window.anime;
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var moving = !!A && !still;
  var attr = function (n) { return me.getAttribute(n) || ''; };
  var itemsSel = attr('data-items'), countSel = attr('data-count'), dropSel = attr('data-drop');
  var logo = me.src.replace(/skin\/motion\.js(\?.*)?$/, 'brand/logo-96.png');

  var css = document.createElement('style');
  css.textContent =
    '.ct-ants{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;opacity:0;transition:opacity .2s ease;z-index:2}' +
    '.ct-ants rect{fill:none;stroke:#8FA9FF;stroke-width:2;stroke-dasharray:10 8;animation:ctAnts .7s linear infinite}' +
    '.ct-drag-on{box-shadow:0 0 0 1px rgba(79,124,255,.5),0 0 40px -6px rgba(79,124,255,.65)!important}' +
    '.ct-drag-on>.ct-ants{opacity:1}' +
    '.ct-scan{position:absolute;top:0;bottom:0;left:0;width:38%;pointer-events:none;z-index:3;border-radius:inherit;' +
      'background:linear-gradient(90deg,transparent,rgba(95,224,191,.35),rgba(143,169,255,.45),transparent)}' +
    '@keyframes ctAnts{to{stroke-dashoffset:-18}}' +
    '.ct-busy{position:fixed;right:20px;bottom:20px;z-index:9999;display:flex;align-items:center;gap:12px;padding:10px 18px 10px 10px;' +
      'border-radius:999px;background:rgba(14,21,41,.92);border:1px solid #2E3A5E;color:#E8ECF8;font:600 14px/1.3 Inter,system-ui,sans-serif;' +
      'box-shadow:0 18px 50px -18px rgba(0,0,0,.8),0 0 0 1px rgba(242,140,40,.15);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);max-width:calc(100vw - 40px)}' +
    '.ct-busy img{width:34px;height:34px;flex:none;filter:drop-shadow(0 0 10px rgba(242,140,40,.7));animation:ctSpin 2.4s linear infinite}' +
    '.ct-busy span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '@keyframes ctSpin{to{transform:rotate(360deg)}}' +
    '@media(prefers-reduced-motion:reduce){.ct-ants rect,.ct-busy img{animation:none}}' +
    '@media print{.ct-busy,.ct-ants,.ct-scan{display:none!important}}';
  document.head.appendChild(css);

  var visible = function (el) { return el.offsetParent !== null || getComputedStyle(el).position === 'fixed'; };
  var all = function (sel) { return sel ? [].slice.call(document.querySelectorAll(sel)) : []; };

  /* ---------- 1. report entrance + KPI count-up (first appearance only) ---------- */
  function countUp(el, i) {
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), node;
    while ((node = w.nextNode()) && !/\d/.test(node.data)) {}
    if (!node) return;
    var orig = node.data, m = /-?\d[\d,]*(\.\d+)?/.exec(orig);
    if (!m) return;
    var target = parseFloat(m[0].replace(/,/g, ''));
    if (!isFinite(target) || target === 0) return;
    var dec = m[1] ? m[1].length - 1 : 0, commas = m[0].indexOf(',') >= 0;
    var pre = orig.slice(0, m.index), post = orig.slice(m.index + m[0].length), o = {v: 0};
    var fmt = function (v) { var s = v.toFixed(dec); return commas ? Number(s).toLocaleString('en-IN', {minimumFractionDigits: dec, maximumFractionDigits: dec}) : s; };
    node.data = pre + fmt(0) + post;
    A.animate(o, {
      v: target, duration: 1300, delay: 120 + i * 60, ease: 'outExpo',
      onUpdate: function () { if (node.data !== orig) node.data = pre + fmt(o.v) + post; },
      onComplete: function () { node.data = orig; }
    });
  }

  var shown = false, queued = false;
  function check() {
    queued = false;
    syncBusy();
    syncAnts();
    if (!itemsSel) return;
    var items = all(itemsSel).filter(visible);
    if (!items.length) { shown = false; return; }
    if (shown) return;
    shown = true;
    if (!moving) return;
    var top = items.filter(function (el) { return el.getBoundingClientRect().top < innerHeight * 1.2; }).slice(0, 24);
    if (top.length) {
      A.animate(top, {
        opacity: [0, 1], translateY: [22, 0], duration: 750, delay: A.stagger(55), ease: 'outExpo',
        onComplete: function () { top.forEach(function (el) { el.style.transform = ''; }); }
      });
    }
    all(countSel).filter(visible).slice(0, 16).forEach(countUp);
  }

  /* ---------- 2. upload zones: marching ants while dragging, scan sweep on drop ---------- */
  var zones = function () { return all(dropSel); };
  function ensureAnts(z) {
    if (z.querySelector(':scope>.ct-ants')) return;
    if (getComputedStyle(z).position === 'static') z.style.position = 'relative';
    var r = parseFloat(getComputedStyle(z).borderTopLeftRadius) || 12;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'ct-ants'); svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = '<rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="' + r + '" ry="' + r + '"/>';
    var rect = svg.firstChild; // calc() isn't valid for SVG attributes everywhere: size it in px
    var size = function () { rect.setAttribute('width', Math.max(0, z.clientWidth - 2)); rect.setAttribute('height', Math.max(0, z.clientHeight - 2)); };
    size(); new ResizeObserver(size).observe(z);
    z.appendChild(svg);
  }
  function syncAnts() { if (dropSel) zones().filter(visible).forEach(ensureAnts); }
  var over = null, lastZone = null;
  function setOver(z) { if (over === z) return; if (over) over.classList.remove('ct-drag-on'); over = z; if (z) z.classList.add('ct-drag-on'); }
  function sweep(z) {
    if (!z || !moving || !z.isConnected) return;
    if (getComputedStyle(z).position === 'static') z.style.position = 'relative';
    var bar = document.createElement('span'); bar.className = 'ct-scan';
    var prevOverflow = z.style.overflow; z.style.overflow = 'hidden';
    z.appendChild(bar);
    A.animate(bar, {translateX: ['-110%', (z.clientWidth / bar.offsetWidth * 100 + 10) + '%'], duration: 750, ease: 'inOutQuad',
      onComplete: function () { bar.remove(); z.style.overflow = prevOverflow; }});
    A.animate(z, {scale: [1, 1.012, 1], duration: 450, ease: 'outQuad', onComplete: function () { z.style.transform = ''; }});
  }
  if (dropSel) {
    var zoneOf = function (t) { return t && t.closest ? t.closest(dropSel) : null; };
    document.addEventListener('dragover', function (e) { setOver(zoneOf(e.target)); }, true);
    document.addEventListener('dragleave', function (e) { if (!e.relatedTarget || !zoneOf(e.relatedTarget)) setOver(null); }, true);
    document.addEventListener('drop', function (e) { var z = zoneOf(e.target); setOver(null); sweep(z); }, true);
    addEventListener('dragend', function () { setOver(null); });
    document.addEventListener('click', function (e) { var z = zoneOf(e.target); if (z) lastZone = z; }, true);
    document.addEventListener('change', function (e) {
      if (e.target && e.target.type === 'file' && e.target.files && e.target.files.length) sweep(zoneOf(e.target) || lastZone);
    }, true);
  }

  /* ---------- 3. busy badge while PDFs / ZIPs are built ---------- */
  var BUSY = /^(Preparing|Building|Generating|Adding)\b/;
  var badge = null;
  function syncBusy() {
    var src = all('button,[role="status"]').filter(function (el) { return !el.closest('.ct-busy') && BUSY.test((el.textContent || '').trim()); })[0];
    if (src) {
      var text = src.textContent.trim().replace(/\.\.\.$/, '…');
      if (!badge) {
        badge = document.createElement('div'); badge.className = 'ct-busy'; badge.setAttribute('role', 'status');
        badge.innerHTML = '<img alt="" src="' + logo + '"><span></span>';
        document.body.appendChild(badge);
        if (moving) A.animate(badge, {opacity: [0, 1], translateY: [16, 0], scale: [0.95, 1], duration: 450, ease: 'outBack(1.6)'});
      }
      if (badge.lastChild.textContent !== text) badge.lastChild.textContent = text;
    } else if (badge) {
      var b = badge; badge = null;
      if (moving) A.animate(b, {opacity: [1, 0], translateY: [0, 10], duration: 300, ease: 'inQuad', onComplete: function () { b.remove(); }});
      else b.remove();
    }
  }

  new MutationObserver(function () { if (!queued) { queued = true; requestAnimationFrame(check); } })
    .observe(document.body, {childList: true, subtree: true, characterData: true});
  check();
})();
