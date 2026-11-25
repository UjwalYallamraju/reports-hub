/* CodeTantra Reports: motion for tool pages (anime.js v4).
   <script src="../shared/skin/motion.js"
           data-items=".kpi,.sec"        report cards that rise in when a report first appears
           data-count=".kpi .v"          numbers that count up at the same moment
           data-drop=".drop"></script>   upload zones that react to drag and drop
   Also shows a small spinning-sun badge while a PDF or ZIP is being built, and celebrates
   each finished download with sparks from the button and a "Downloaded" chip.
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
    '[data-ct-drag]{box-shadow:0 0 0 1px rgba(79,124,255,.5),0 0 40px -6px rgba(79,124,255,.65)!important}' +
    '[data-ct-drag]>.ct-ants{opacity:1}' +
    '.ct-scan{position:absolute;top:0;bottom:0;left:0;width:38%;pointer-events:none;z-index:3;border-radius:inherit;' +
      'background:linear-gradient(90deg,transparent,rgba(95,224,191,.35),rgba(143,169,255,.45),transparent)}' +
    '@keyframes ctAnts{to{stroke-dashoffset:-18}}' +
    '.ct-busy{position:fixed;right:20px;bottom:20px;z-index:9999;display:flex;align-items:center;gap:12px;padding:10px 18px 10px 10px;' +
      'border-radius:999px;background:rgba(14,21,41,.92);border:1px solid #2E3A5E;color:#E8ECF8;font:600 14px/1.3 Inter,system-ui,sans-serif;' +
      'box-shadow:0 18px 50px -18px rgba(0,0,0,.8),0 0 0 1px rgba(242,140,40,.15);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);max-width:calc(100vw - 40px)}' +
    '.ct-busy img{width:34px;height:34px;flex:none;filter:drop-shadow(0 0 10px rgba(242,140,40,.7));animation:ctSpin 2.4s linear infinite}' +
    '.ct-busy span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '@keyframes ctSpin{to{transform:rotate(360deg)}}' +
    '.ct-done{position:fixed;right:20px;bottom:20px;z-index:10000;display:flex;align-items:center;gap:12px;padding:10px 18px 10px 10px;' +
      'border-radius:999px;background:rgba(10,34,30,.94);border:1px solid rgba(95,224,191,.45);color:#E8ECF8;font:600 14px/1.3 Inter,system-ui,sans-serif;' +
      'box-shadow:0 18px 50px -18px rgba(0,0,0,.8),0 0 30px -8px rgba(25,195,156,.6);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);max-width:calc(100vw - 40px)}' +
    '.ct-done i{width:34px;height:34px;flex:none;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#5FE0BF,#19C39C);color:#05261D;box-shadow:0 0 16px rgba(25,195,156,.7)}' +
    '.ct-done i svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}' +
    '.ct-done span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ct-done small{display:block;font-weight:500;font-size:12px;color:#98A3C2}' +
    '.ct-spark{position:fixed;left:0;top:0;z-index:10001;pointer-events:none;border-radius:50%}' +
    '.ct-ring{position:fixed;left:0;top:0;z-index:10001;pointer-events:none;border-radius:50%;border:2px solid rgba(255,201,77,.85);box-shadow:0 0 20px rgba(242,140,40,.6)}' +
    '.ct-hint{position:fixed;left:50%;bottom:22px;z-index:10002;width:min(560px,calc(100vw - 28px));margin-left:max(-280px,calc(-50vw + 14px));display:flex;gap:14px;align-items:flex-start;padding:16px 18px;border-radius:18px;' +
      'background:rgba(16,23,44,.97);border:1px solid rgba(255,201,77,.4);color:#E8ECF8;font:400 14px/1.5 Inter,system-ui,sans-serif;box-shadow:0 30px 80px -24px rgba(0,0,0,.85),0 0 40px -14px rgba(242,140,40,.55)}' +
    '.ct-hint img{width:42px;height:42px;flex:none;filter:drop-shadow(0 0 10px rgba(242,140,40,.6))}' +
    '.ct-hint-b{flex:1;min-width:0}.ct-hint b{display:block;font:600 15.5px/1.3 Sora,Inter,system-ui,sans-serif;margin-bottom:3px}.ct-hint p{margin:0 0 10px;color:#98A3C2;overflow-wrap:anywhere}' +
    '.ct-hint-a{display:flex;flex-wrap:wrap;gap:8px}' +
    '.ct-hint-a a,.ct-hint-a .keep{display:inline-flex;align-items:center;min-height:34px;padding:0 13px;border-radius:10px;font:600 13px/1 Inter,system-ui,sans-serif;text-decoration:none;cursor:pointer}' +
    '.ct-hint-a a{background:linear-gradient(135deg,#FFB547,#F28C28);color:#1A1004}.ct-hint-a a.alt{background:rgba(79,124,255,.16);color:#B9C8FF;box-shadow:inset 0 0 0 1px rgba(79,124,255,.4)}' +
    '.ct-hint-a .keep{background:none;border:1px solid #2E3A5E;color:#98A3C2}.ct-hint-a .keep:hover{color:#E8ECF8}' +
    '.ct-hint-x{all:unset;cursor:pointer;width:28px;height:28px;display:grid;place-items:center;border-radius:8px;color:#6B7596;font-size:20px}.ct-hint-x:hover{color:#E8ECF8;background:rgba(255,255,255,.06)}' +
    '[data-mode="light"] .ct-hint{background:#fff;color:#1A1F2B;border-color:#F5C98A;box-shadow:0 30px 80px -30px rgba(26,31,43,.45)}' +
    '[data-mode="light"] .ct-hint p,[data-mode="light"] .ct-hint-a .keep{color:#5B6475}[data-mode="light"] .ct-hint-a .keep{border-color:#E4E7EC}' +
    '[data-mode="light"] .ct-hint-a a.alt{background:#EBF0FF;color:#2952D9;box-shadow:inset 0 0 0 1px #C9D6FF}' +
    '@media(prefers-reduced-motion:reduce){.ct-ants rect,.ct-busy img{animation:none}}' +
    '@media print{.ct-busy,.ct-ants,.ct-scan,.ct-done,.ct-spark,.ct-ring,.ct-hint{display:none!important}}';
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
  function setOver(z) { if (over === z) return; if (over) over.removeAttribute('data-ct-drag'); over = z; if (z) z.setAttribute('data-ct-drag', ''); }
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
  var badge = null, leaving = null;
  function syncBusy() {
    var src = Date.now() < doneUntil ? null : all('button,[role="status"]').filter(function (el) { return !el.closest('.ct-busy') && BUSY.test((el.textContent || '').trim()); })[0];
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
      var b = badge; badge = null; leaving = b;
      if (moving) A.animate(b, {opacity: [1, 0], translateY: [0, 10], duration: 300, ease: 'inQuad', onComplete: function () { b.remove(); }});
      else b.remove();
    }
  }

  /* ---------- 4. celebrate a finished download ----------
     Every tool saves through an <a download> (a.click() or a dispatched click, as jsPDF does),
     so watching those catches PDFs, ZIPs and Excel files alike. Sparks fly from the button you
     pressed and a "Downloaded" chip replaces the busy badge for a moment. */
  var doneUntil = 0, lastBtn = null, lastBtnAt = 0, toast = null, toastTimer = 0, burstAt = 0, files = [];
  document.addEventListener('click', function (e) {
    if (!e.isTrusted || !e.target.closest) return;
    var a = e.target.closest('a[download]');
    if (a) { downloaded(a); return; }
    var b = e.target.closest('button,[role="button"],.btn');
    if (b) { lastBtn = b; lastBtnAt = Date.now(); }
  }, true);
  var AP = HTMLAnchorElement.prototype, nativeClick = AP.click;
  AP.click = function () { downloaded(this); return nativeClick.apply(this, arguments); };
  AP.dispatchEvent = function (ev) {
    if (ev && ev.type === 'click' && !ev.isTrusted) downloaded(this);
    return EventTarget.prototype.dispatchEvent.call(this, ev);
  };

  function downloaded(a) {
    if (!a || !a.hasAttribute || !a.hasAttribute('download')) return;
    var name = a.getAttribute('download') || 'file';
    var now = Date.now();
    if (now - burstAt > 2500) files = [];
    if (files.indexOf(name) < 0) files.push(name);
    showToast();
    if (now - burstAt > 1500) { burstAt = now; sparks(); }
  }

  function originRect() {
    var b = lastBtn;
    if (b && b.isConnected && Date.now() - lastBtnAt < 120000) {
      var r = b.getBoundingClientRect();
      if (r.width && r.bottom > 0 && r.top < innerHeight) return r;
    }
    return null;
  }

  function sparks() {
    if (!moving) return;
    var r = originRect(), cx, cy;
    if (r) { cx = r.left + r.width / 2; cy = r.top + r.height / 2; }
    else { cx = innerWidth - 60; cy = innerHeight - 40; }
    // a glow ring that hugs the button's own shape and grows out ~18px on every side
    var ring = document.createElement('span'); ring.className = 'ct-ring';
    var rw = r ? r.width : 48, rh = r ? r.height : 48;
    ring.style.width = rw + 'px'; ring.style.height = rh + 'px';
    ring.style.left = (cx - rw / 2) + 'px'; ring.style.top = (cy - rh / 2) + 'px';
    ring.style.borderRadius = r && lastBtn ? (getComputedStyle(lastBtn).borderRadius || '12px') : '50%';
    document.body.appendChild(ring);
    A.animate(ring, {scaleX: [1, 1 + 36 / rw], scaleY: [1, 1 + 36 / rh], opacity: [1, 0], duration: 750, ease: 'outCubic', onComplete: function () { ring.remove(); }});
    var cols = ['#FFC94D', '#F28C28', '#FFB547', '#5FE0BF', '#8FA9FF', '#FFFFFF'];
    for (var i = 0; i < 30; i++) {
      var s = document.createElement('span'); s.className = 'ct-spark';
      var size = 5 + Math.random() * 5, ang = Math.random() * Math.PI * 2, dist = 60 + Math.random() * 100;
      var c = cols[i % cols.length];
      s.style.width = size + 'px'; s.style.height = (i % 3 ? size : size * 2.2) + 'px';
      if (!(i % 3)) s.style.borderRadius = '2px';
      s.style.background = c; s.style.boxShadow = '0 0 8px ' + c;
      s.style.left = (cx - size / 2) + 'px'; s.style.top = (cy - size / 2) + 'px';
      document.body.appendChild(s);
      (function (el) {
        A.animate(el, {
          translateX: [0, Math.cos(ang) * dist], translateY: [0, Math.sin(ang) * dist + 30],
          rotate: [0, (Math.random() - .5) * 540], scale: [1, 0.2], opacity: [1, 0],
          duration: 800 + Math.random() * 600, ease: 'outExpo', onComplete: function () { el.remove(); }
        });
      })(s);
    }
    if (r && lastBtn) A.animate(lastBtn, {scale: [1, 0.95, 1.05, 1], duration: 520, ease: 'outQuad', onComplete: function () { lastBtn.style.transform = ''; }});
  }

  function showToast() {
    doneUntil = Date.now() + 2800;
    var fresh = !toast;
    if (fresh) {
      toast = document.createElement('div'); toast.className = 'ct-done'; toast.setAttribute('role', 'status');
      toast.innerHTML = '<i><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></i><span></span>';
      document.body.appendChild(toast);
    }
    if (badge) { badge.remove(); badge = null; }  // the chip takes the badge's place at once
    if (leaving) { leaving.remove(); leaving = null; }
    var label = toast.lastChild;
    label.textContent = '';
    label.appendChild(document.createTextNode(files.length > 1 ? 'Downloaded ' + files.length + ' files' : 'Downloaded'));
    var sm = document.createElement('small'); sm.textContent = files.length > 1 ? files[files.length - 1] : files[0];
    label.appendChild(sm);
    syncBusy();
    if (fresh && moving) {
      A.animate(toast, {opacity: [0, 1], translateY: [16, 0], scale: [0.9, 1], duration: 500, ease: 'outBack(1.8)'});
      A.animate(toast.firstChild, {scale: [0, 1], rotate: [-90, 0], duration: 650, delay: 120, ease: 'outBack(2.2)'});
    }
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      var t = toast; toast = null; doneUntil = 0;
      var done = function () { t.remove(); check(); };
      if (moving) A.animate(t, {opacity: [1, 0], translateY: [0, 10], duration: 300, ease: 'inQuad', onComplete: done});
      else done();
    }, 2800);
  }

  /* ---------- 5. wrong file? point to the right tool ----------
     Every file dropped or chosen here is read just far enough to see its header row. When it is
     clearly a different kind of export, a friendly card names it and links to the tool that reads it. */
  // recognising exports lives in shared/detect.js (also used by the home page's smart drop)
  var D = window.CTDetect, base = D ? D.base : '';
  var TOOLS = {}, KIND = D ? D.KIND : {}, here = D ? D.here : '';
  if (D) Object.keys(D.TOOLS).forEach(function (k) { TOOLS[k] = [D.TOOLS[k].name, D.TOOLS[k].path]; });
  var READS = D ? {single: ['single', 'section'], group: ['group'], section: ['section'], cutoff: ['section'], course: ['course']}[here] : null;
  var sniff = D ? D.sniff : null;
  var hint = null, sniffRun = 0;
  function closeHint() { if (hint) { var h = hint; hint = null; h.remove(); } }
  function check2(files) {
    if (!READS || !files || !files.length) return;
    var run = ++sniffRun;
    closeHint();
    var list = [].slice.call(files, 0, 4);
    Promise.all(list.map(sniff)).then(function (kinds) {
      if (run !== sniffRun) return;
      for (var i = 0; i < kinds.length; i++) {
        var k = kinds[i];
        if (k && READS.indexOf(k) < 0) { showHint(k, list[i].name); return; }
      }
    });
  }
  function showHint(kind, fname) {
    var K = KIND[kind], me2 = TOOLS[here][0];
    hint = document.createElement('div');
    hint.className = 'ct-hint'; hint.setAttribute('role', 'status');
    hint.innerHTML = '<img alt="" src="' + base + 'shared/brand/logo-96.png"><div class="ct-hint-b"><b></b><p></p><div class="ct-hint-a"></div></div>' +
      '<button type="button" class="ct-hint-x" aria-label="Dismiss">×</button>';
    hint.querySelector('b').textContent = 'This looks like ' + K.what;
    hint.querySelector('p').textContent = '“' + fname + '” has ' + K.why + '. The ' + me2 + ' reads a different file. Try:';
    K.go.forEach(function (t, i) {
      var a = document.createElement('a'); a.href = base + TOOLS[t][1]; a.textContent = TOOLS[t][0] + ' →';
      if (i) a.className = 'alt';
      hint.querySelector('.ct-hint-a').appendChild(a);
    });
    var keep = document.createElement('button'); keep.type = 'button'; keep.className = 'keep'; keep.textContent = 'It’s the right file';
    hint.querySelector('.ct-hint-a').appendChild(keep);
    hint.querySelector('.ct-hint-x').onclick = keep.onclick = closeHint;
    document.body.appendChild(hint);
    if (moving) A.animate(hint, {opacity: [0, 1], translateY: [24, 0], duration: 520, ease: 'outBack(1.4)'});
  }
  if (READS) {
    document.addEventListener('change', function (e) { var t = e.target; if (t && t.type === 'file') check2(t.files); }, true);
    document.addEventListener('drop', function (e) { if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) check2(e.dataTransfer.files); }, true);
  }

  new MutationObserver(function () { if (!queued) { queued = true; requestAnimationFrame(check); } })
    .observe(document.body, {childList: true, subtree: true, characterData: true});
  check();
})();
