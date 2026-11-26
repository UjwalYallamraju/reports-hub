/* CodeTantra Reports: landing-page visuals and motion (anime.js v4).
   - Fades the hero in and reveals sections quietly as they scroll into view.
   - Pages stay complete without it: content is only hidden while an animation is about to run. */
(() => {
  'use strict';
  const root = document.documentElement;
  const A = window.anime;
  const motion = !!(A && root.classList.contains('anim-ready'));
  root.dataset.animOk = '1';

  const counters = [...document.querySelectorAll('[data-count]')];
  const setCount = (n, v) => { n.textContent = Math.round(v) + (n.dataset.suffix || ''); };

  if (!motion) { root.classList.remove('anim-ready'); counters.forEach(n => setCount(n, +n.dataset.count)); return; }

  const {animate, stagger} = A;

  /* ---------- hero entrance ---------- */
  const heroItems = [...document.querySelectorAll('[data-reveal="hero"]')];
  animate(heroItems, {opacity: [0, 1], translateY: [26, 0], duration: 800, delay: stagger(90), ease: 'outExpo'});

  counters.forEach((n, i) => {
    const o = {v: 0};
    animate(o, {v: +n.dataset.count, duration: 1600, delay: 300 + i * 120, ease: 'outExpo', onUpdate: () => setCount(n, o.v)});
  });

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
    // a short, quiet fade-in; inline styles are cleared afterwards
    animate(shown, {opacity: [0, 1], translateY: [12, 0], duration: 500, delay: stagger(60), ease: 'outQuad',
      onComplete: () => shown.forEach(t => { t.style.transform = ''; })});
    const meters = shown.flatMap(t => [...t.querySelectorAll('.meter i')]);
    if (meters.length) animate(meters, {width: [0, el => el.style.width], duration: 1300, delay: stagger(140, {start: 350}), ease: 'outExpo'});
    if (!pending.length) { removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); }
  };
  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(check); } };
  addEventListener('scroll', onScroll, {passive: true});
  addEventListener('resize', onScroll);
  check();
})();
