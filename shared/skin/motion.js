/* CodeTantra Reports: entrance motion for tool pages (anime.js v4).
   <script src="../shared/skin/motion.js" data-items=".kpi,.sec"></script>
   When report cards first appear (after a file is loaded), they rise in with a stagger.
   Re-renders while typing or filtering do not animate again; loading a new file does. */
(function () {
  var me = document.currentScript;
  var A = window.anime;
  if (!me || !A || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var sel = me.getAttribute('data-items');
  if (!sel) return;
  var shown = false, queued = false;

  function check() {
    queued = false;
    var items = [].slice.call(document.querySelectorAll(sel)).filter(function (el) {
      return el.offsetParent !== null && !el.closest('[data-no-motion]');
    });
    if (!items.length) { shown = false; return; }
    if (shown) return;
    shown = true;
    var top = items.filter(function (el) { return el.getBoundingClientRect().top < innerHeight * 1.2; }).slice(0, 24);
    if (!top.length) return;
    A.animate(top, {
      opacity: [0, 1], translateY: [22, 0], duration: 750,
      delay: A.stagger(55), ease: 'outExpo',
      onComplete: function () { top.forEach(function (el) { el.style.transform = ''; }); }
    });
  }
  new MutationObserver(function () { if (!queued) { queued = true; requestAnimationFrame(check); } })
    .observe(document.body, {childList: true, subtree: true});
  check();
})();
