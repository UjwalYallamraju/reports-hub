/* CodeTantra Reports: micro-interactions for every page (loaded last; anime.js optional).
   - a soft light that follows the pointer across the page (dark mode)
   - spotlight glow inside cards under the pointer
   - gentle 3D tilt on small cards
   - magnetic pull on the main buttons
   - a ripple on every click of a button
   - a living aurora behind the tool pages, and a shine across the header when a report first opens
   - mini charts that play when they scroll into view ([data-fx-viz])
   Mouse and trackpad only for pointer effects; nothing moves with reduced motion.
   Never touches the Course Insights report sheet (.cip-page), which is photographed for its PDF. */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var A = window.anime;
  var root = document.documentElement;
  var isTool = !!document.querySelector('script[src*="skin/motion.js"]');
  var NO = '.cip-page, .ct-foot, .hubnav, .ctk, #offscreen';

  /* ---------- tool pages: living aurora behind everything ---------- */
  if (isTool) {
    var au = document.createElement('div');
    au.className = 'fx-aurora'; au.setAttribute('aria-hidden', 'true');
    au.innerHTML = '<i></i><i></i><i></i>';
    document.body.insertBefore(au, document.body.firstChild);
    root.classList.add('fx-tool');
  }

  /* ---------- page light that follows the pointer ---------- */
  if (fine && !reduce) {
    var light = document.createElement('div');
    light.className = 'fx-light'; light.setAttribute('aria-hidden', 'true');
    document.body.appendChild(light);
    var lx = innerWidth / 2, ly = innerHeight / 3, tx = lx, ty = ly, lraf = 0;
    var step = function () {
      lx += (tx - lx) * 0.12; ly += (ty - ly) * 0.12;
      light.style.transform = 'translate(' + (lx - 350).toFixed(1) + 'px,' + (ly - 350).toFixed(1) + 'px)';
      lraf = Math.abs(tx - lx) + Math.abs(ty - ly) > 0.5 ? requestAnimationFrame(step) : 0;
    };
    addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX; ty = e.clientY; light.classList.add('on');
      if (!lraf) lraf = requestAnimationFrame(step);
    }, {passive: true});
    document.addEventListener('pointerleave', function () { light.classList.remove('on'); });
  }

  /* ---------- spotlight inside cards ---------- */
  // landing pages draw their own glow on .panel/.tool/.tile; these get an injected glow layer
  var SPOT = isTool
    ? '.kpi, .kp, .card:not(.empty), section.blk, .sec, aside .panel, #settings, .settings, .rp-head, .titleblock, .hero, .cip-shell [data-fx-card]'
    : '.tl .st, .sd, .cta, .board, .sd-tools button';
  // small cards that tilt in 3D
  var TILT = isTool ? '.kpi, .kp' : '.tool, .tile, .tl .st, .panel, .fx-deck .fc2';

  function ok(el) { return el && !el.closest(NO); }
  function ensureGlow(el) {
    if (el.__fxGlow && el.__fxGlow.parentNode === el) return el.__fxGlow;   // re-created if the tool re-rendered the card
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    var g = document.createElement('span');
    g.className = 'fx-glow'; g.setAttribute('aria-hidden', 'true');
    el.appendChild(g);
    el.__fxGlow = g;
    return g;
  }
  if (fine) {
    var current = null, tiltEl = null;
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var t = e.target.closest ? e.target : null;
      if (!t) return;
      // spotlight
      var card = t.closest(SPOT);
      if (card && !ok(card)) card = null;
      if (card !== current) {
        if (current && current.__fxGlow) current.__fxGlow.classList.remove('on');
        current = card;
      }
      if (card) {
        var r = card.getBoundingClientRect(), g = ensureGlow(card);
        g.style.setProperty('--x', (e.clientX - r.left) + 'px');
        g.style.setProperty('--y', (e.clientY - r.top) + 'px');
        g.classList.add('on');
      }
      // tilt
      if (reduce) return;
      var tc = t.closest(TILT);
      if (tc && !ok(tc)) tc = null;
      if (tc !== tiltEl) { if (tiltEl) untilt(tiltEl); tiltEl = tc; }
      if (tc) {
        var b = tc.getBoundingClientRect();
        var px = (e.clientX - b.left) / b.width - 0.5, py = (e.clientY - b.top) / b.height - 0.5;
        var big = b.width > 420 ? 0.45 : 1;   // wide cards tilt less
        tc.style.transition = 'transform .12s ease-out';
        tc.style.transform = 'perspective(900px) rotateX(' + (-py * 7 * big).toFixed(2) + 'deg) rotateY(' + (px * 9 * big).toFixed(2) + 'deg) translateY(-4px)';
        tc.classList.add('fx-tilting');
      }
    }, {passive: true});
    var untilt = function (el) {
      el.style.transition = 'transform .5s cubic-bezier(.2,.8,.2,1)';
      el.style.transform = '';
      el.classList.remove('fx-tilting');
    };
    document.addEventListener('pointerleave', function () { if (tiltEl) untilt(tiltEl); tiltEl = null; if (current && current.__fxGlow) current.__fxGlow.classList.remove('on'); current = null; });
  }

  /* ---------- magnetic main buttons ---------- */
  var MAG = '.btn.sun, .btn.ghost, .btn.blue, .btn.mint, .ct-sample button, .sd-browse';
  if (fine && !reduce) {
    var magEl = null;
    document.addEventListener('pointermove', function (e) {
      var m = e.target.closest ? e.target.closest(MAG) : null;
      if (m !== magEl) {
        if (magEl) { magEl.style.transition = 'transform .45s cubic-bezier(.2,.8,.2,1)'; magEl.style.transform = ''; }
        magEl = m;
      }
      if (!m) return;
      var r = m.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      m.style.transition = 'transform .15s ease-out';
      m.style.transform = 'translate(' + (dx * 0.18).toFixed(1) + 'px,' + (dy * 0.28 - 2).toFixed(1) + 'px)';
    }, {passive: true});
  }

  /* ---------- click ripple ---------- */
  if (!reduce) {
    document.addEventListener('pointerdown', function (e) {
      var b = e.target.closest ? e.target.closest('button, .btn, a.tool, a.tile, .sd, .ct-back, [role="button"]') : null;
      if (!b || !ok(b) || b.closest('.ctk') || b.disabled) return;
      var r = b.getBoundingClientRect(), size = Math.max(r.width, r.height) * 2.2;
      var cs = getComputedStyle(b);
      if (cs.position === 'static') b.style.position = 'relative';
      if (cs.overflow === 'visible' && !b.matches('a.tool, a.tile, .sd')) b.style.overflow = 'hidden';
      var s = document.createElement('span');
      s.className = 'fx-ripple'; s.setAttribute('aria-hidden', 'true');
      s.style.width = s.style.height = size + 'px';
      s.style.left = (e.clientX - r.left - size / 2) + 'px';
      s.style.top = (e.clientY - r.top - size / 2) + 'px';
      b.appendChild(s);
      setTimeout(function () { s.remove(); }, 700);
    }, {passive: true});
  }

  /* ---------- tool pages: a shine across the header when a report first opens ---------- */
  if (isTool && !reduce) {
    var KPI = '.kpi .v, #report .kpi, #report .kpi b, #out .kp .v, .cip-kpi-v';
    var shone = false;
    var watch = new MutationObserver(function () {
      if (shone) return;
      var k = document.querySelector(KPI);
      if (!k || !k.offsetParent) return;
      shone = true; watch.disconnect();
      var bar = document.querySelector('.ct-bar');
      if (bar) { bar.classList.remove('fx-shine'); void bar.offsetWidth; bar.classList.add('fx-shine'); setTimeout(function () { bar.classList.remove('fx-shine'); shone = false; watch.observe(document.body, {childList: true, subtree: true}); }, 4000); }
    });
    watch.observe(document.body, {childList: true, subtree: true});
  }

  /* ---------- mini charts that play when they scroll into view ---------- */
  var vizzes = [].slice.call(document.querySelectorAll('[data-fx-viz]'));
  if (vizzes.length && A && !reduce) {
    var S = A.svg, play = function (el) {
      var q = function (s) { return [].slice.call(el.querySelectorAll(s)); };
      q('.vb').forEach(function (b) { b.style.transformBox = 'fill-box'; b.style.transformOrigin = '50% 100%'; });
      A.animate(q('.vb'), {scaleY: [0, 1], duration: 900, delay: A.stagger(50, {start: 150}), ease: 'outBack(1.4)'});
      A.animate(q('.vcut'), {opacity: [0, 1], duration: 500, delay: 800});
      q('.vh').forEach(function (b) { b.style.transformBox = 'fill-box'; b.style.transformOrigin = '0 50%'; });
      A.animate(q('.vh'), {scaleX: [0, 1], duration: 1000, delay: A.stagger(110, {start: 150}), ease: 'outExpo'});
      q('.vline').forEach(function (p, i) { A.animate(S.createDrawable(p), {draw: ['0 0', '0 1'], duration: 1300, delay: 200 + i * 180, ease: 'inOutQuart'}); });
      q('.rg').forEach(function (c, i) { var full = c.getAttribute('stroke-dasharray'); A.animate(c, {strokeDasharray: ['0 163.4', full], duration: 1300, delay: 200 + i * 140, ease: 'outExpo'}); });
    };
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); play(e.target); } });
    }, {rootMargin: '0px 0px -8% 0px'});
    vizzes.forEach(function (v) { io.observe(v); });
  }
})();
