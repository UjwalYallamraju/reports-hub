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
  // greeting that follows the clock (the sun's colour follows html[data-tod], set by hub-nav.js)
  const kicker = document.querySelector('.hx .kicker');
  const greet = () => {
    if (!kicker) return;
    const f = (/[?&]tod=(\w+)/.exec(location.search) || [])[1];
    const h = {morning: 8, midday: 14, evening: 18, night: 22}[f] ?? new Date().getHours();
    const msg = h >= 5 && h < 12 ? ['Good morning', 'ready for this week\u2019s results?']
      : h >= 12 && h < 17 ? ['Good afternoon', 'let\u2019s turn exports into reports']
      : h >= 17 && h < 21 ? ['Good evening', 'ready for this week\u2019s results?']
      : ['Working late?', 'reports in a minute, then rest'];
    const text = msg[0] + ' \u00b7 ' + msg[1];
    const node = [...kicker.childNodes].find(n => n.nodeType === 3 && n.data.trim());
    if (node && node.data !== text) node.data = text;
  };
  greet(); setInterval(greet, 5 * 60 * 1000);

  if (!motion) return;
  const {animate, stagger, svg: S} = A;

  /* ---------- the sun system: a live demo loop ----------
     An export drops into the sun, the sun pulses, and the report cards burst out of it.
     Then it holds, folds the cards back in and plays again. Paused while off screen. */
  const orbit = document.getElementById('orbit');
  if (orbit) {
    const q = s => [...orbit.querySelectorAll(s)];
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const cards = q('.fc'), pdf = orbit.querySelector('.fc.pdf'), xl = orbit.querySelector('.xl');
    const main = cards.filter(c => c !== pdf);
    const steps = [...document.querySelectorAll('.steps li')];
    const setStep = n => steps.forEach((li, i) => { li.classList.toggle('on', i === n); li.classList.toggle('done', i < n); });
    q('.fb').forEach(b => { b.style.transformBox = 'fill-box'; b.style.transformOrigin = '50% 100%'; });

    // offset from a card's centre to the sun's centre, in px
    // layout positions (offset*) ignore transforms, so this is right even mid-animation
    const toSun = el => ({x: orbit.clientWidth / 2 - (el.offsetLeft + el.offsetWidth / 2),
                          y: orbit.clientHeight / 2 - (el.offsetTop + el.offsetHeight / 2)});
    const count = n => { const o = {v: 0}, end = +n.dataset.demo, suf = n.dataset.suffix || '';
      animate(o, {v: end, duration: 1300, ease: 'outExpo', onUpdate: () => { n.textContent = Math.round(o.v) + suf; }}); };
    const charts = () => {
      q('[data-demo]').forEach(count);
      animate(q('.fb'), {scaleY: [0, 1], duration: 900, delay: stagger(70, {start: 200}), ease: 'outBack(1.5)'});
      q('.spk').forEach(p => animate(S.createDrawable(p), {draw: ['0 0', '0 1'], duration: 1200, delay: 150, ease: 'inOutQuad'}));
      q('.dn').forEach(c => animate(c, {strokeDasharray: ['0 100', '72 28'], duration: 1300, delay: 200, ease: 'outExpo'}));
    };
    const burst = (els, gap) => els.forEach((el, i) => { const d = toSun(el);
      animate(el, {translateX: [d.x, 0], translateY: [d.y, 0], scale: [0.15, 1], opacity: [0, 1], duration: 850, delay: i * gap, ease: 'outBack(1.4)'}); });
    const fold = els => els.forEach((el, i) => { const d = toSun(el);
      animate(el, {translateX: d.x * 0.9, translateY: d.y * 0.9, scale: 0.15, opacity: 0, duration: 520, delay: i * 50, ease: 'inQuart'}); });

    cards.forEach(c => { c.style.opacity = 0; });
    animate(q('.ring'), {scale: [0.6, 1], opacity: [0, 1], duration: 1200, delay: stagger(120, {start: 200}), ease: 'outExpo'});
    animate(q('.sun-in'), {scale: [0.4, 1], opacity: [0, 1], duration: 1400, delay: 250, ease: 'outElastic(1, .6)'});

    // gentle float on the inner content, each card on its own rhythm
    q('.fc .inner').forEach((el, i) => animate(el, {
      translateY: [-(4 + i % 3 * 2), 4 + i % 2 * 3], duration: 2600 + i * 450,
      ease: 'inOutSine', loop: true, alternate: true
    }));

    let onScreen = true;
    new IntersectionObserver(es => { onScreen = es[0].isIntersecting; }).observe(orbit);
    const ready = async () => { while (!onScreen || document.hidden) await wait(400); };

    (async function loop(first) {
      await ready();
      setStep(0);
      if (!first) { fold([...cards].reverse()); await wait(700); }
      else await wait(900);
      // the export appears at the left and is carried into the sun
      const W = orbit.clientWidth, Hh = orbit.clientHeight;
      const sx = W * 0.02, sy = Hh * 0.4, cx = W / 2 - xl.offsetWidth / 2, cy = Hh / 2 - xl.offsetHeight / 2;
      animate(xl, {translateX: [sx - 30, sx], translateY: [sy + 24, sy], scale: 1, opacity: [0, 1], duration: 520, ease: 'outExpo'});
      await wait(750);
      animate(xl, {translateX: cx, translateY: cy, scale: 0.3, duration: 820, ease: 'inOutQuart'});
      animate(xl, {opacity: 0, duration: 220, delay: 620, ease: 'linear'});
      await wait(780);
      // the sun takes it in
      setStep(1);
      animate(q('.sun-in'), {scale: [1, 1.16, 1], duration: 760, ease: 'outQuad'});
      q('.wave').forEach((w, i) => animate(w, {scale: [0.6, 2.7], opacity: [0.95, 0], duration: 1150, delay: i * 200, ease: 'outCubic'}));
      await wait(380);
      burst(main, 110);
      charts();
      await wait(1100);
      // the report is built, then ready
      setStep(2);
      pdf.classList.add('busy');
      pdf.querySelector('.pt').textContent = 'Building report…';
      burst([pdf], 0);
      await wait(1200);
      pdf.classList.remove('busy');
      pdf.querySelector('.pt').textContent = 'Report.pdf ready';
      animate(pdf.querySelector('.ok'), {scale: [0.4, 1], duration: 600, ease: 'outBack(2.5)'});
      await wait(5200);
      loop(false);
    })(true);

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
