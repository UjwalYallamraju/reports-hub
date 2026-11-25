/* CodeTantra Reports: landing-page visuals and motion (anime.js v4).
   - Draws the hero results board (bars, trend line, pass mark) from the arrays below.
   - Animates entrances, counters and scroll reveals when motion is allowed.
   - Pages stay complete without it: content is only hidden while an animation is about to run. */
(() => {
  'use strict';
  const root = document.documentElement;
  const A = window.anime;
  const motion = !!(A && root.classList.contains('anim-ready'));
  root.dataset.animOk = '1';

  /* ---------- hero results board (sample data, marked on the page) ---------- */
  const PASS = [58, 64, 61, 70, 67, 74, 72, 79, 76, 83];          // pass rate % by test
  const TREND = [41, 46, 49, 53, 57, 60, 64, 67, 71, 75];         // course completion %
  const W = 560, H = 290, L = 34, R = 10, T = 16, B = 30, PW = W - L - R, PH = H - T - B;
  const yOf = v => T + PH - (v / 100) * PH;
  const svgNS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => { const n = document.createElementNS(svgNS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };

  function buildBoard(svg) {
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const defs = el('defs', {}, svg);
    const bg = el('linearGradient', {id: 'barGrad', x1: 0, y1: 0, x2: 0, y2: 1}, defs);
    el('stop', {offset: '0%', 'stop-color': '#7C9CFF'}, bg); el('stop', {offset: '100%', 'stop-color': '#3A5DE0', 'stop-opacity': '.55'}, bg);
    const tg = el('linearGradient', {id: 'trendGrad', x1: 0, y1: 0, x2: 1, y2: 0}, defs);
    el('stop', {offset: '0%', 'stop-color': '#5FE0BF'}, tg); el('stop', {offset: '100%', 'stop-color': '#9BF0D9'}, tg);
    [0, 25, 50, 75, 100].forEach(v => {
      el('line', {class: v ? 'gridline' : 'axis', x1: L, x2: W - R, y1: yOf(v), y2: yOf(v)}, svg);
      el('text', {class: 'xl', x: L - 8, y: yOf(v) + 4, 'text-anchor': 'end'}, svg).textContent = v;
    });
    const step = PW / PASS.length, bw = step * 0.56;
    const bars = el('g', {}, svg);
    PASS.forEach((v, i) => {
      const x = L + i * step + (step - bw) / 2;
      el('rect', {class: 'bar', x: x.toFixed(1), y: yOf(v).toFixed(1), width: bw.toFixed(1), height: (PH * v / 100).toFixed(1), rx: 5, fill: 'url(#barGrad)'}, bars);
      el('text', {class: 'xl', x: (x + bw / 2).toFixed(1), y: H - 10, 'text-anchor': 'middle'}, svg).textContent = 'T' + (i + 1);
    });
    el('line', {class: 'pass', x1: L, x2: W - R, y1: yOf(50), y2: yOf(50)}, svg);
    // smooth trend line through the completion points
    const pts = TREND.map((v, i) => [L + i * step + step / 2, yOf(v)]);
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], cx = (x0 + x1) / 2;
      d += ` C${cx.toFixed(1)},${y0.toFixed(1)} ${cx.toFixed(1)},${y1.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
    }
    el('path', {class: 'trend', d}, svg);
    const nodes = el('g', {}, svg);
    pts.forEach(([x, y]) => el('circle', {class: 'node', cx: x.toFixed(1), cy: y.toFixed(1), r: 4.5}, nodes));
    return {bars: [...bars.children], trend: svg.querySelector('.trend'), nodes: [...nodes.children], pass: svg.querySelectorAll('.pass')};
  }

  const svg = document.getElementById('heroChart');
  const board = svg ? buildBoard(svg) : null;

  /* ---------- pointer glow on panels and tool cards (CSS does the drawing) ---------- */
  document.querySelectorAll('.panel,.tool').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  const counters = [...document.querySelectorAll('[data-count]')];
  const setCount = (n, v) => { n.textContent = Math.round(v) + (n.dataset.suffix || ''); };

  if (!motion) { root.classList.remove('anim-ready'); counters.forEach(n => setCount(n, +n.dataset.count)); return; }

  const {animate, stagger, svg: S} = A;

  /* ---------- hero entrance ---------- */
  const heroItems = [...document.querySelectorAll('[data-reveal="hero"]')];
  animate(heroItems, {opacity: [0, 1], translateY: [26, 0], duration: 800, delay: stagger(90), ease: 'outExpo'});

  counters.forEach((n, i) => {
    const o = {v: 0};
    animate(o, {v: +n.dataset.count, duration: 1600, delay: 300 + i * 120, ease: 'outExpo', onUpdate: () => setCount(n, o.v)});
  });

  if (board) {
    animate(board.bars, {scaleY: [0, 1], duration: 1000, delay: stagger(70, {start: 350}), ease: 'outBack(1.4)'});
    animate(board.pass, {opacity: [0, 1], duration: 600, delay: 900, ease: 'outQuad'});
    animate(S.createDrawable(board.trend), {draw: ['0 0', '0 1'], duration: 1500, delay: 800, ease: 'inOutQuart'});
    animate(board.nodes, {scale: [0, 1], opacity: [0, 1], duration: 500, delay: stagger(110, {start: 900}), ease: 'outBack(2)'});

    // living data: every few seconds the bars settle on new results
    let timer = null;
    const shuffle = () => {
      board.bars.forEach((bar, i) => {
        const v = Math.max(38, Math.min(92, PASS[i] + (Math.random() * 16 - 8)));
        animate(bar, {y: yOf(v), height: PH * v / 100, duration: 1200, ease: 'inOutQuart'});
      });
      animate(board.nodes, {scale: [1, 1.5, 1], duration: 700, delay: stagger(60), ease: 'inOutSine'});
    };
    const start = () => { if (!timer) timer = setInterval(shuffle, 4200); };
    const stop = () => { clearInterval(timer); timer = null; };
    new IntersectionObserver(es => es.forEach(e => (e.isIntersecting && !document.hidden ? start() : stop()))).observe(svg);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  }

  /* ---------- scroll reveals ---------- */
  // Reveal anything that has reached the lower part of the screen, or that the page has already
  // scrolled past (a fast jump or an anchor link can skip an element without it ever being on screen).
  let pending = [...document.querySelectorAll('[data-reveal="scroll"]')], queued = false;
  const check = () => {
    queued = false;
    const limit = innerHeight * 0.92;
    const shown = pending.filter(t => t.getBoundingClientRect().top < limit);
    if (!shown.length) return;
    pending = pending.filter(t => !shown.includes(t));
    // rise out of a soft blur; inline styles are cleared afterwards so hover effects (fx.js tilt) own the transform
    animate(shown, {opacity: [0, 1], translateY: [40, 0], scale: [0.96, 1], filter: ['blur(10px)', 'blur(0px)'], duration: 1000, delay: stagger(110), ease: 'outExpo',
      onComplete: () => shown.forEach(t => { t.style.transform = ''; t.style.filter = ''; })});
    const meters = shown.flatMap(t => [...t.querySelectorAll('.meter i')]);
    if (meters.length) animate(meters, {width: [0, el => el.style.width], duration: 1300, delay: stagger(140, {start: 350}), ease: 'outExpo'});
    if (!pending.length) { removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); }
  };
  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(check); } };
  addEventListener('scroll', onScroll, {passive: true});
  addEventListener('resize', onScroll);
  check();
})();
