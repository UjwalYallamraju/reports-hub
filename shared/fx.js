/* CodeTantra Reports: quiet background and small chart animations, shared by every page.
   - tool pages: a slow, soft colour background behind the page
   - mini charts ([data-fx-viz]) draw themselves once when they scroll into view
   Nothing follows the pointer, and nothing moves with reduced motion. */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var A = window.anime;
  var root = document.documentElement;
  var isTool = !!document.querySelector('script[src*="skin/motion.js"]');

  /* ---------- tool pages: soft background behind everything ---------- */
  if (isTool) {
    var au = document.createElement('div');
    au.className = 'fx-aurora'; au.setAttribute('aria-hidden', 'true');
    au.innerHTML = '<i></i><i></i><i></i>';
    document.body.insertBefore(au, document.body.firstChild);
    root.classList.add('fx-tool');
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
