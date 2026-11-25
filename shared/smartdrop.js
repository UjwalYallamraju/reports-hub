/* CodeTantra Reports: smart drop on the home page.
   Drop (or choose) any CodeTantra export: it is recognised from its header row (shared/detect.js),
   the matching tool lights up, and that tool opens with the file already loaded.
   A sectional export can go to two tools, so it asks; an unknown file asks which report it is for.
   Dragging a file anywhere on the page shows a full-page drop target. */
(() => {
  'use strict';
  const D = window.CTDetect, sd = document.getElementById('sd');
  if (!D || !sd) return;
  const A = window.anime;
  const motion = !!A && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const input = document.getElementById('sdIn'), say = sd.querySelector('.sd-say'), bar = sd.querySelector('.sd-bar i');
  const chips = [...sd.querySelectorAll('.sd-tools button')], stay = sd.querySelector('.sd-stay');
  const over = document.querySelector('.sd-over');
  const idleText = say.textContent;
  let pending = null, timer = 0, run = 0;

  const setState = (s, lit = []) => {
    sd.dataset.state = s;
    chips.forEach(c => c.classList.toggle('on', lit.includes(c.dataset.k)));
  };
  const reset = () => {
    clearTimeout(timer); pending = null; run++;
    setState('idle'); say.textContent = idleText; stay.hidden = true; bar.style.transform = '';
  };
  const label = files => files.length > 1 ? `these ${files.length} files` : `“${files[0].name}”`;
  const looks = files => (files.length > 1 ? `These ${files.length} files look` : `“${files[0].name}” looks`) + ' like';

  async function handle(list) {
    const files = [...list].filter(f => /\.(xlsx|xls|csv)$/i.test(f.name));
    clearTimeout(timer);
    const me = ++run;
    if (!files.length) { setState('unknown'); say.textContent = 'That doesn’t look like an Excel or CSV export. Drop the .xlsx file you downloaded from CodeTantra.'; return; }
    pending = files;
    setState('reading'); stay.hidden = true;
    say.textContent = `Reading ${label(files)}…`;
    if (motion) A.animate(sd, {scale: [1, 1.012, 1], duration: 450, ease: 'outQuad', onComplete: () => { sd.style.transform = ''; }});
    const kinds = await Promise.all(files.slice(0, 6).map(D.sniff));
    if (me !== run) return;
    const kind = kinds.find(Boolean) || null;
    const K = kind && D.KIND[kind];
    if (!K) {
      setState('unknown', chips.map(c => c.dataset.k));
      say.textContent = files.length > 1 ? `We couldn’t tell what these ${files.length} files are. Pick the report they’re for:` : `We couldn’t tell what ${label(files)} is. Pick the report it’s for:`;
      stay.hidden = false;
      return;
    }
    if (K.go.length > 1) {
      setState('choose', K.go);
      say.textContent = `${looks(files)} ${K.what} (${K.why}). Which report would you like?`;
      stay.hidden = false;
      return;
    }
    const tool = K.go[0];
    setState('found', [tool]);
    say.textContent = `${looks(files)} ${K.what}. Opening the ${D.TOOLS[tool].name}…`;
    stay.hidden = false;
    const wait = motion ? 1400 : 900;
    if (motion) A.animate(bar, {scaleX: [0, 1], duration: wait, ease: 'linear'});
    else bar.style.transform = 'scaleX(1)';
    timer = setTimeout(() => { if (me === run) D.send(files, tool); }, wait);
  }

  // chips: with a file waiting they open that tool with it; otherwise they are plain links
  chips.forEach(c => c.addEventListener('click', e => {
    e.stopPropagation();
    const k = c.dataset.k;
    if (pending) { clearTimeout(timer); setState('found', [k]); say.textContent = `Opening the ${D.TOOLS[k].name}…`; D.send(pending, k); }
    else location.href = D.base + D.TOOLS[k].path;
  }));
  stay.addEventListener('click', e => { e.stopPropagation(); reset(); });
  sd.querySelector('.sd-browse').addEventListener('click', e => { e.stopPropagation(); input.click(); });
  sd.addEventListener('click', e => { if (!e.target.closest('button')) input.click(); });
  input.addEventListener('change', () => { if (input.files.length) handle(input.files); input.value = ''; });

  // drag anywhere on the page
  const hasFiles = e => e.dataTransfer && [...(e.dataTransfer.types || [])].includes('Files');
  let depth = 0;
  const showOver = on => { document.documentElement.classList.toggle('sd-dragging', on); };
  addEventListener('dragenter', e => { if (!hasFiles(e)) return; e.preventDefault(); depth++; showOver(true); });
  addEventListener('dragover', e => { if (!hasFiles(e)) return; e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
  addEventListener('dragleave', e => { if (!hasFiles(e)) return; depth = Math.max(0, depth - 1); if (!depth) showOver(false); });
  addEventListener('drop', e => {
    if (!hasFiles(e)) return;
    e.preventDefault(); depth = 0; showOver(false);
    if (e.dataTransfer.files.length) {
      sd.scrollIntoView({block: 'center', behavior: motion ? 'smooth' : 'auto'});
      handle(e.dataTransfer.files);
    }
  });
  addEventListener('pageshow', e => { if (e.persisted) reset(); });   // back button from a tool
  if (over) over.addEventListener('click', () => showOver(false));
})();
