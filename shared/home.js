/* CodeTantra Reports: home page motion (anime.js v4). Loaded after hub.js.
   The sun system enters, cards float and lean toward the pointer, tool tiles play their
   mini charts as they scroll into view, and the timeline line draws itself in. */
(() => {
  'use strict';
  const A = window.anime;
  const motion = !!A && !matchMedia('(prefers-reduced-motion: reduce)').matches;

  // pointer glow on tiles (works without motion too; CSS draws it)
  document.querySelectorAll('.tile').forEach(t => t.addEventListener('pointermove', e => {
    const r = t.getBoundingClientRect();
    t.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    t.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));
  if (!motion) return;
  const {animate, stagger, svg: S} = A;

  /* ---------- the sun system ---------- */
  const orbit = document.getElementById('orbit');
  if (orbit) {
    const q = s => [...orbit.querySelectorAll(s)];
    animate(q('.ring'), {scale: [0.6, 1], opacity: [0, 1], duration: 1200, delay: stagger(120, {start: 200}), ease: 'outExpo'});
    animate(q('.sun-in'), {scale: [0.4, 1], opacity: [0, 1], duration: 1400, delay: 250, ease: 'outElastic(1, .6)'});
    animate(q('.fc .inner'), {opacity: [0, 1], scale: [0.7, 1], duration: 900, delay: stagger(140, {start: 650}), ease: 'outBack(1.7)'});
    animate(q('.fb'), {scaleY: [0, 1], duration: 900, delay: stagger(80, {start: 1100}), ease: 'outBack(1.5)'});
    q('.fb').forEach(b => { b.style.transformBox = 'fill-box'; b.style.transformOrigin = '50% 100%'; });
    q('.spk').forEach(p => animate(S.createDrawable(p), {draw: ['0 0', '0 1'], duration: 1300, delay: 1000, ease: 'inOutQuad'}));
    q('.dn').forEach(c => animate(c, {strokeDasharray: ['0 100', '72 28'], duration: 1400, delay: 1100, ease: 'outExpo'}));

    // gentle float, each card on its own rhythm
    q('.fc .inner').forEach((el, i) => animate(el, {
      translateY: [-(5 + i % 3 * 2), 5 + i % 2 * 3], duration: 2600 + i * 450, delay: 1500 + i * 200,
      ease: 'inOutSine', loop: true, alternate: true
    }));

    // lean toward the pointer (smoothed)
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const step = () => {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      orbit.style.setProperty('--px', cx.toFixed(3)); orbit.style.setProperty('--py', cy.toFixed(3));
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(step) : 0;
    };
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const r = orbit.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (innerWidth / 2)));
      ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (innerHeight / 2)));
      if (!raf) raf = requestAnimationFrame(step);
    }, {passive: true});
  }

  /* ---------- tile mini charts and timeline, when they scroll into view ---------- */
  const play = el => {
    const q = s => [...el.querySelectorAll(s)];
    animate(q('.vb'), {scaleY: [0, 1], duration: 900, delay: stagger(55, {start: 250}), ease: 'outBack(1.4)'});
    animate(q('.vcut'), {opacity: [0, 1], duration: 500, delay: 900, ease: 'outQuad'});
    animate(q('.vh'), {scaleX: [0, 1], duration: 1000, delay: stagger(120, {start: 250}), ease: 'outExpo'});
    q('.vline').forEach((p, i) => animate(S.createDrawable(p), {draw: ['0 0', '0 1'], duration: 1400, delay: 300 + i * 200, ease: 'inOutQuart'}));
    q('.rg').forEach((c, i) => {
      const full = c.getAttribute('stroke-dasharray');
      animate(c, {strokeDasharray: ['0 163.4', full], duration: 1300, delay: 300 + i * 150, ease: 'outExpo'});
    });
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    if (e.target.classList.contains('tl')) {
      const line = e.target.querySelector('.line');
      if (line) animate(line, {scaleX: [0, 1], duration: 1600, delay: 200, ease: 'inOutQuart'});
    } else play(e.target);
  }), {rootMargin: '0px 0px -10% 0px'});
  document.querySelectorAll('.tile, .tl').forEach(el => io.observe(el));
})();
