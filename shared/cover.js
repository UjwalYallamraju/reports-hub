/* CodeTantra Reports: a cover page for each tool's main PDF ("Option A · Clean").
   <script src="RELATIVE/shared/cover.js"></script>  (after motion.js and fx.js on tool pages)

   How it works
   - When the tool saves its main PDF (single: college summary; group: the report; section: complete report;
     cut-off: complete / growth report; courses: the report), the download is caught here, a cover page is
     drawn with pdf-lib and inserted as page 1, and the new file is downloaded instead. Other PDFs and ZIPs
     are left alone. If anything fails, the original PDF downloads unchanged.
   - The cover's numbers come from the report on screen (adapters below). Every text on it can be edited in
     the "Cover page" drawer (button in the tool's header bar), with a live preview drawn by the same code.
   - College name, department line, college logo and "prepared by" are remembered for every tool; the report
     type, company logo and on/off are remembered per tool; title, subtitle, headline, findings, cut-offs and
     date follow the report and reset when a different report is opened.
   Text uses the standard PDF font Helvetica (no font files to load). */
(function () {
  'use strict';
  var D = window.CTDetect;
  var here = D ? D.here : '';
  if (!here) return;
  var base = D.base;
  var PDFLIB_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
  var TOOL_NAME = {single: 'Single test report', group: 'Group-wise tests report', section: 'Section-wise test analysis', cutoff: 'Sectional cut-off report', course: 'Course progress insights'}[here];

  /* ===================== settings ===================== */
  var ID_KEY = 'ctr.cover.id', TOOL_KEY = 'ctr.cover.' + here;
  var load = function (k) { try { return JSON.parse(localStorage.getItem(k) || '{}') || {}; } catch (e) { return {}; } };
  var save = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  var ident = load(ID_KEY);                       // collegeName, collegeSub, collegeLogo, preparedBy
  var toolS = load(TOOL_KEY);                     // enabled, kicker, companyLogo
  if (toolS.enabled === undefined) toolS.enabled = true;
  var report = {sig: '', o: {}};                  // per-report edits: title, subtitle, line, g0..g2, cutoffs, date

  /* ===================== reading the report on screen ===================== */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var txt = function (el) { return el ? (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim() : ''; };
  var val = function (s) { var e = $(s); return e ? (e.value || '').trim() : ''; };
  var NUM = /^[\d.,]+\s*%?$|^[\d.,]+\s*\/\s*[\d.,]+$/;
  function cards(sel) {
    return $$(sel).filter(function (e) { return e.offsetParent; }).map(function (e) {
      var lines = (e.innerText || '').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
      var vi = lines.findIndex(function (l) { return NUM.test(l.replace(/\s+%/, '%')); });
      if (vi < 0) return null;
      var value = lines[vi].replace(/\s+%/, '%'), rest = lines.filter(function (_, i) { return i !== vi; });
      return {label: rest[0] || '', value: value, sub: rest.slice(1).join(' ')};
    }).filter(Boolean);
  }
  var find = function (cs, re) { for (var i = 0; i < cs.length; i++) if (re.test(cs[i].label)) return cs[i]; return null; };
  var n = function (c) { return c ? parseFloat(String(c.value).replace(/,/g, '')) : NaN; };
  // the list under a "Key insights / observations / findings" heading
  function findings(scope) {
    var root = typeof scope === 'string' ? $(scope) : scope || document.body;
    if (!root) return [];
    var heads = $$('h1,h2,h3,h4,h5,strong,b,div,span', root).filter(function (h) { var t = txt(h); return t.length < 40 && /^key (insights|observations|findings)$/i.test(t); });
    for (var i = 0; i < heads.length; i++) {
      var p = heads[i];
      for (var up = 0; up < 4 && p; up++, p = p.parentElement) {
        var lis = $$('li', p);
        if (lis.length >= 2) return rank(lis.map(function (li) { return txt(li).replace(/^[A-Za-z ]{2,24}:\s*/, ''); }));
      }
    }
    return [];
  }
  // prefer findings that say something specific (strongest, weakest, leads, bottleneck...)
  function rank(list) {
    var good = /strongest|weakest|highest|lowest|leads|trails|bottleneck|focus|fell|rose|improv|gap|miss|best|worst/i;
    var a = list.filter(function (s) { return good.test(s); }), b = list.filter(function (s) { return !good.test(s); });
    return a.concat(b).slice(0, 3);
  }
  var pct = function (a, b) { return b > 0 ? Math.round(a / b * 1000) / 10 : 0; };
  var today = function () { return new Date().toLocaleDateString('en-GB', {day: 'numeric', month: 'long', year: 'numeric'}); };

  var ADAPT = {
    single: function () {
      var cs = cards('.kpi'); if (!cs.length) return null;
      var reg = find(cs, /registered/i), att = find(cs, /^attempted/i), pr = find(cs, /pass rate/i), avg = find(cs, /average/i);
      var pass = pr ? (pr.sub.match(/(\d+)\s+at or above/) || [])[1] : '';
      var name = val('#m-testName') || txt($('.titleblock h1, .titleblock h2')).replace(/\s*report$/i, '');
      var meta = [val('#m-batch') ? 'Batch ' + val('#m-batch') : '', reg ? reg.value + ' registered' : '', val('#m-max') ? val('#m-max') + ' marks' : ''].filter(Boolean).join(' · ');
      return {
        kicker: 'Scheduled test · Performance report', title: name || 'Test report', subtitle: meta,
        ring: pr ? n(pr) : NaN, ringLabel: 'pass rate',
        big: pass || (pr ? pr.value : ''), bigOf: att ? 'of ' + att.value + ' attempted passed' : 'passed',
        line: (val('#m-pass') ? 'Scored ' + val('#m-pass') + ' or more (the pass mark). ' : '') + (find(cs, /not attempted/i) ? find(cs, /not attempted/i).value + ' registered students did not attempt.' : ''),
        kpis: [reg, att, pr, avg],
        glance: findings(document.body),
        cutoffs: val('#m-pass') ? 'Pass mark ' + val('#m-pass') + (val('#m-max') ? ' of ' + val('#m-max') : '') : '',
        college: val('#m-college'), preparedBy: val('#m-preparedBy')
      };
    },
    group: function () {
      var cs = cards('#report .kpi'); if (!cs.length) return null;
      var st = find(cs, /students/i), part = find(cs, /participation/i), avg = find(cs, /average/i), pr = find(cs, /pass rate/i), every = find(cs, /every test/i);
      var head = txt($('#report .rp-head'));
      var tests = (head.match(/Tests\s+(\d+)/) || [])[1], showing = (head.match(/Showing\s+(.+?)\s+Tests/) || [])[1];
      var ev = every ? every.value.split('/') : [];
      return {
        kicker: 'Group-wise tests · Analysis report', title: val('#fTitle') || 'Test analysis report',
        subtitle: [showing, tests ? tests + ' tests' : '', st ? st.value + ' students' : ''].filter(Boolean).join(' · '),
        ring: part ? n(part) : NaN, ringLabel: 'participation',
        big: ev[0] || '', bigOf: ev[1] ? 'of ' + ev[1] + ' attempted every test' : '',
        line: (avg ? 'Average score on attempted tests: ' + avg.value + '. ' : '') + (pr ? pr.value + ' of students averaged 50% or more.' : ''),
        kpis: [st && {label: 'Students', value: st.value}, part && {label: 'Participation', value: part.value}, avg && {label: 'Average score', value: avg.value}, pr && {label: 'Pass rate', value: pr.value, sub: '50% or more'}],
        glance: findings('#report'),
        cutoffs: 'Pass mark ' + ((($('input[type=range]') || {}).value || 50) + '%'),
        college: val('#fOrg'), preparedBy: val('#fBy')
      };
    },
    section: function () {
      var cs = cards('#report .kpi'); if (!cs.length) return null;
      var reg = find(cs, /registered/i), att = find(cs, /^attempted/i), q = find(cs, /qualified/i), pr = find(cs, /pass rate/i), avg = find(cs, /average/i);
      var secs = (txt($('#fmeta')).match(/(\d+)\s+scored sections?/) || [])[1], marks = (txt($('#fmeta')).match(/(\d+)\s+total marks/) || [])[1];
      return {
        kicker: 'Section-wise test · Analysis report', title: val('#mTest') || val('#mTitle') || 'Test analysis',
        subtitle: [val('#mDate'), reg ? reg.value + ' registered' : '', marks ? marks + ' marks' : '', secs ? secs + ' sections' : ''].filter(Boolean).join(' · '),
        ring: pr ? n(pr) : NaN, ringLabel: 'pass rate',
        big: q ? q.value : '', bigOf: att ? 'of ' + att.value + ' attempted qualified' : 'qualified',
        line: (val('#mCut') ? 'Scored ' + val('#mCut') + ' or more (the cut-off). ' : '') + (avg ? 'Average ' + avg.value + ' ' + (avg.sub || '') + '.' : ''),
        kpis: [reg, att, q, avg],
        glance: findings('#report'),
        cutoffs: (val('#mCut') ? 'Cut-off ' + val('#mCut') + ' marks' : '') + (($('#oSecCut') || {}).checked && val('#mSecPct') ? ' · ' + val('#mSecPct') + '% per section' : ''),
        college: '', preparedBy: val('#mOrg')
      };
    },
    cutoff: function () {
      var cs = cards('#out .kp'); if (!cs.length) return null;
      var growth = ($('#modes button.on') || {}).dataset && $('#modes button.on').dataset.m === 'multi';
      var co = val('#co'), sub = txt($('#ttl') && $('#ttl').nextElementSibling);
      var m = sub.match(/^(.*?)\s+(\d{1,2}-\d{1,2}-\d{4})?\s*-\s*(\d+)\s+registered,\s*(\d+)\s+marks,\s*(\d+)\s+sections/i);
      var testName = m ? m[1] : (sub.split(' - ')[0] || '');
      var tn = (testName.match(/test\s*0*(\d+)/i) || [])[1];
      var title = growth ? (co ? co + ' mock tests' : 'Mock tests') + ': growth report'
        : (co ? co + ' ' : '') + (tn ? 'Mock Test ' + (tn.length < 2 ? '0' + tn : tn) : testName || 'Mock test');
      var reg = find(cs, /registered/i), att = find(cs, /^attempted/i), q = find(cs, /^qualified/i), lost = find(cs, /lost to sectional/i), avg = find(cs, /average/i);
      var secMins = $$('#cfg input').filter(function (i) { return i.id !== 'co' && i.id !== 'ov' && i.id !== 'gl' && i.value !== ''; }).map(function (i) { return +i.value; });
      var uniq = secMins.filter(function (v, i, a) { return a.indexOf(v) === i; });
      var cut = (val('#ov') ? val('#ov') + ' marks overall' : '') + (secMins.length ? ' · ' + (uniq.length === 1 ? uniq[0] + '% per section' : 'sections ' + Math.min.apply(null, secMins) + '-' + Math.max.apply(null, secMins) + '%') : '');
      if (growth || !reg || !q) {
        var c4 = cs.slice(0, 4);
        return {kicker: 'Company mock tests · Growth report', title: title, subtitle: sub.split('Click the title')[0], ring: NaN, ringLabel: '',
          big: c4[0] ? c4[0].value : '', bigOf: c4[0] ? c4[0].label.toLowerCase() : '', line: '', kpis: c4, glance: findings('#out'), cutoffs: cut, college: '', preparedBy: ''};
      }
      return {
        kicker: (co ? co + ' mock test' : 'Company mock test') + ' · Performance report', title: title,
        subtitle: m ? [m[2] ? fmtDate(m[2]) : '', m[5] + ' sections', m[4] + ' marks', m[3] + ' students registered'].filter(Boolean).join(' · ') : sub,
        ring: pct(n(q), n(reg)), ringLabel: 'qualified',
        big: q.value, bigOf: 'of ' + reg.value + ' qualified',
        line: 'Cleared the overall cut-off and every sectional cut-off.' + (lost ? ' ' + lost.value + ' more reached the overall mark but missed a section.' : ''),
        kpis: [att, q, lost && {label: 'Lost to sectionals', value: lost.value, sub: 'passed overall only'}, avg],
        glance: findings('#out'), cutoffs: cut, college: '', preparedBy: ''
      };
    },
    course: function () {
      var cs = $$('.cip-kpi-v').filter(function (v) { return v.offsetParent; }).map(function (v) { return cardsOf(v.parentElement); }).filter(Boolean);
      if (!cs.length) return null;
      var tot = find(cs, /total students/i), secs = find(cs, /sections/i), avg = find(cs, /avg/i), risk = find(cs, /^at risk/i), pw = find(cs, /password/i), cr = find(cs, /courses at risk/i);
      var head = txt($('.cip-page')).slice(0, 300);
      var cut = (head.match(/at-risk cutoff:\s*([^·\n]+?average)/i) || [])[1];
      return {
        kicker: 'Course progress · Insights report', title: 'Course progress report',
        subtitle: [secs ? secs.value + ' sections' : '', tot ? tot.value + ' students' : ''].filter(Boolean).join(' · '),
        ring: avg ? n(avg) : NaN, ringLabel: 'avg. completion',
        big: risk ? risk.value : '', bigOf: tot ? 'of ' + tot.value + ' students at risk' : 'students at risk',
        line: (risk && risk.label ? risk.label.replace(/^At Risk/i, 'At risk means average completion') + '. ' : '') + (cr ? cr.value + ' course instances are below 50% average completion.' : ''),
        kpis: [tot && {label: 'Students', value: tot.value}, avg && {label: 'Avg. completion', value: avg.value}, risk && {label: 'At risk', value: risk.value, sub: risk.sub}, pw && {label: 'Passwords not set', value: pw.value}],
        glance: findings('.cip-page'),
        cutoffs: cut ? 'At risk: ' + cut.trim() : '',
        college: (($$('input').filter(function (i) { return /institute/i.test(i.placeholder || ''); })[0]) || {}).value || '', preparedBy: ''
      };
    }
  };
  function cardsOf(el) {
    var lines = (el.innerText || '').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    var vi = lines.findIndex(function (l) { return NUM.test(l.replace(/\s+%/, '%')); });
    if (vi < 0) return null;
    var rest = lines.filter(function (_, i) { return i !== vi; });
    return {label: rest[0] || '', value: lines[vi].replace(/\s+%/, '%'), sub: rest.slice(1).join(' ')};
  }
  function fmtDate(dmy) {
    var p = dmy.split('-'); var d = new Date(+p[2], +p[1] - 1, +p[0]);
    return isNaN(d) ? dmy : d.toLocaleDateString('en-GB', {day: 'numeric', month: 'long', year: 'numeric'});
  }

  // the cover's content: what the report says, overlaid with what was typed in the drawer
  function content() {
    var a = null;
    try { a = ADAPT[here](); } catch (e) { a = null; }
    if (!a) return null;
    var sig = here + '|' + a.title + '|' + a.subtitle + '|' + a.big;
    if (sig !== report.sig) { report = {sig: sig, o: {}}; }
    var o = report.o, g = a.glance || [];
    var pick = function (k, d) { return o[k] !== undefined ? o[k] : d; };
    return {
      collegeName: ident.collegeName !== undefined ? ident.collegeName : (a.college || ''),
      collegeSub: ident.collegeSub || '',
      collegeLogo: ident.collegeLogo || '', companyLogo: toolS.companyLogo || '',
      preparedBy: ident.preparedBy !== undefined ? ident.preparedBy : (a.preparedBy || ''),
      kicker: toolS.kicker !== undefined ? toolS.kicker : a.kicker,
      title: pick('title', a.title), subtitle: pick('subtitle', a.subtitle), line: pick('line', a.line),
      g0: pick('g0', g[0] || ''), g1: pick('g1', g[1] || ''), g2: pick('g2', g[2] || ''),
      cutoffs: pick('cutoffs', a.cutoffs || ''), date: pick('date', today()),
      ring: a.ring, ringLabel: a.ringLabel, big: a.big, bigOf: a.bigOf,
      kpis: (a.kpis || []).filter(Boolean).slice(0, 4), defaults: a
    };
  }

  /* ===================== drawing (shared by the PDF and the preview) ===================== */
  var C = {ink: '#1A1F2B', ink2: '#3A4254', mut: '#5B6475', dim: '#8A93A6', line: '#E4E7EC', soft: '#F6F8FC', blue: '#3366FF', green: '#12A87B', red: '#E0524F', amber: '#E8A33D', navy: '#0B1020'};
  var KPI_COL = [C.blue, C.green, C.red, C.amber];
  // WinAnsi only (standard PDF fonts): swap anything else for a close character or drop it
  function clean(s) {
    return String(s == null ? '' : s).replace(/[‐-‒]/g, '-').replace(/\s*—\s*/g, ', ').replace(/[≥]/g, '>=').replace(/[≤]/g, '<=').replace(/→/g, '->')
      .replace(/[^\x20-\x7E\xA0-\xFF–—‘’“”•…€™ŒœŠšŸŽžƒˆ˜†‡‰‹›]/g, '');
  }
  function wrap(P, s, size, bold, maxW, maxLines) {
    var words = clean(s).split(/\s+/).filter(Boolean), lines = [], cur = '';
    words.forEach(function (w) {
      var t = cur ? cur + ' ' + w : w;
      if (P.width(t, size, bold) <= maxW || !cur) cur = t; else { lines.push(cur); cur = w; }
    });
    if (cur) lines.push(cur);
    if (maxLines && lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      var last = lines[maxLines - 1];
      while (last.length > 1 && P.width(last + '…', size, bold) > maxW) last = last.slice(0, -1);
      lines[maxLines - 1] = last.replace(/[\s,.;:]+$/, '') + '…';
    }
    return lines;
  }
  function fit(P, s, size, bold, maxW) { s = clean(s); while (s.length > 1 && P.width(s, size, bold) > maxW) s = s.slice(0, -1); return s; }
  function mix(a, b, t) {
    var pa = [1, 3, 5].map(function (i) { return parseInt(a.substr(i, 2), 16); }), pb = [1, 3, 5].map(function (i) { return parseInt(b.substr(i, 2), 16); });
    return '#' + pa.map(function (v, i) { return ('0' + Math.round(v + (pb[i] - v) * t).toString(16)).slice(-2); }).join('');
  }

  // P = painter: rect(x,y,w,h,{fill,stroke,r,lw}), text(s,x,y,size,bold,color,align), width(s,size,bold), image(key,x,y,w,h), ring(cx,cy,r,lw,pct,color,track), circle(cx,cy,r,fill)
  // (x, y) from the top-left, in points; y of text is the baseline.
  // spread spare height through the page: a dry run measures the content, then the real pass adds the space
  function draw(P, W, H, c) {
    if (W > H) return layout(P, W, H, c, 0);
    var dry = {}; Object.keys(P).forEach(function (k) { dry[k] = P[k]; });
    ['rect', 'text', 'image', 'circle', 'ring'].forEach(function (k) { dry[k] = function () {}; });
    var bottom = layout(dry, W, H, c, 0), free = (H - 34 - 66) - 34 - bottom;
    return layout(P, W, H, c, Math.max(0, Math.min(free, 240)));
  }
  function layout(P, W, H, c, e) {
    var land = W > H, M = land ? 40 : 42, R = W - M;
    // header: college on the left, CodeTantra on the right
    var y0 = 34, hx = M;
    if (c.collegeLogo && P.has('collegeLogo')) {
      var lg = P.size('collegeLogo'), s = Math.min(40 / lg.w, 40 / lg.h);
      P.image('collegeLogo', M, y0 + (40 - lg.h * s) / 2, lg.w * s, lg.h * s); hx = M + lg.w * s + 12;
    }
    if (c.collegeName) P.text(fit(P, c.collegeName, 13, true, R - hx - 150), hx, y0 + (c.collegeSub ? 18 : 25), 13, true, C.ink);
    if (c.collegeSub) P.text(fit(P, c.collegeSub, 9, false, R - hx - 150), hx, y0 + 32, 9, false, C.mut);
    var ctw = P.width('CodeTantra Reports', 8.6, true);
    P.text('CodeTantra Reports', R, y0 + 23, 8.6, true, C.mut, 'right');
    if (P.has('sun')) P.image('sun', R - ctw - 24, y0 + 9, 19, 19);
    // gradient rule
    var ry = y0 + 54, segs = 60;
    for (var i = 0; i < segs; i++) {
      var t = i / (segs - 1), col = t < 0.6 ? mix(C.blue, C.green, t / 0.6) : mix(C.green, '#F28C28', (t - 0.6) / 0.4);
      P.rect(M + (R - M) * i / segs, ry, (R - M) / segs + 1.5, 3, {fill: col});
    }
    // title block (left column in landscape)
    var colR = land ? M + (R - M) * 0.56 : R, cy = ry + (land ? 42 : 56) + e * 0.3;
    var logoW = 0;
    if (c.companyLogo && P.has('companyLogo')) {
      var cl = P.size('companyLogo'), cs = Math.min(110 / cl.w, 54 / cl.h); logoW = cl.w * cs + 18;
      P.image('companyLogo', colR - cl.w * cs, cy - 8, cl.w * cs, cl.h * cs);
    }
    P.text(fit(P, String(c.kicker || '').toUpperCase(), 9.5, true, colR - M - logoW), M, cy, 9.5, true, C.blue);
    var tSize = 32, tl = wrap(P, c.title, tSize, true, colR - M - logoW, 0);
    if (tl.length > 2) { tSize = 25; tl = wrap(P, c.title, tSize, true, colR - M - logoW, 2); }
    var ty = cy + 10 + tSize;
    tl.forEach(function (l, k) { P.text(l, M, ty + k * tSize * 1.08, tSize, true, C.ink); });
    ty += (tl.length - 1) * tSize * 1.08;
    var sl = wrap(P, c.subtitle, 11, false, colR - M, 2);
    sl.forEach(function (l, k) { P.text(l, M, ty + 22 + k * 15, 11, false, C.mut); });
    // headline card
    var hy = ty + 22 + (sl.length - 1) * 15 + (land ? 26 : 34) + e * 0.25, hw = colR - M, hh = land ? 150 : 140 + e * 0.1;
    P.rect(M, hy, hw, hh, {fill: C.soft, stroke: C.line, r: 14});
    var rx = M + 22, ringR = land ? 46 : 44, hasRing = isFinite(c.ring);
    if (hasRing) {
      P.ring(rx + ringR, hy + hh / 2, ringR, 10, Math.max(0, Math.min(100, c.ring)), C.green, C.line);
      var rp = (Math.round(c.ring * 10) / 10) + '%';
      P.text(rp, rx + ringR, hy + hh / 2 + 7, rp.length > 5 ? 17 : 21, true, '#0F936C', 'center');
      if (c.ringLabel) P.text(c.ringLabel, rx + ringR, hy + hh / 2 + 21, 7.5, false, C.dim, 'center');
    }
    var bx = hasRing ? rx + ringR * 2 + 22 : rx, bw = M + hw - 18 - bx;
    var big = clean(c.big || ''), bigS = 44;
    if (big) {
      P.text(big, bx, hy + 58, bigS, true, C.ink);
      var bwid = P.width(big, bigS, true);
      P.text(fit(P, c.bigOf || '', 15, true, bw - bwid - 8), bx + bwid + 8, hy + 58, 15, true, C.dim);
    }
    wrap(P, c.line, 10.5, false, bw, land ? 4 : 3).forEach(function (l, k) { P.text(l, bx, hy + (big ? 84 : 46) + k * 14.5, 10.5, false, C.ink2); });
    // KPI tiles: a row of four (portrait) or a 2 x 2 grid on the right (landscape)
    var ks = c.kpis, kx, ky, kw, kh = 66, gap = 9;
    function tile(k, i, x, y, w) {
      P.rect(x, y, w, kh, {fill: '#FFFFFF', stroke: C.line, r: 10});
      P.rect(x + 0.5, y + 0.5, w - 1, 3, {fill: KPI_COL[i % 4], r: 1.5});
      P.text(fit(P, k.label, 8.5, false, w - 22), x + 12, y + 20, 8.5, false, C.mut);
      P.text(fit(P, k.value, 19, true, w - 22), x + 12, y + 43, 19, true, C.ink);
      if (k.sub) P.text(fit(P, k.sub, 7.8, false, w - 22), x + 12, y + 57, 7.8, false, C.dim);
    }
    var gy;
    if (!land) {
      ky = hy + hh + 18 + e * 0.1; kw = (R - M - gap * 3) / 4;
      ks.forEach(function (k, i) { tile(k, i, M + i * (kw + gap), ky, kw); });
      gy = ky + kh + 30 + e * 0.15;
    } else {
      kx = colR + 26; kw = (R - kx - gap) / 2; ky = ry + 30;
      ks.forEach(function (k, i) { tile(k, i, kx + (i % 2) * (kw + gap), ky + Math.floor(i / 2) * (kh + gap), kw); });
      gy = ky + (kh + gap) * 2 + 22;
    }
    // at a glance
    var gx = land ? colR + 26 : M, gw = R - gx, items = [c.g0, c.g1, c.g2].filter(function (s) { return clean(s).trim(); });
    if (items.length) {
      P.text('AT A GLANCE', gx, gy, 9, true, C.dim);
      var yy = gy + 18, dots = [C.red, C.green, C.blue];
      items.forEach(function (s, i) {
        var ls = wrap(P, s, 10.3, false, gw - 16, land ? 3 : 3);
        P.circle(gx + 3.5, yy - 3.4, 3, dots[i % 3]);
        ls.forEach(function (l, k) { P.text(l, gx + 14, yy + k * 13.5, 10.3, false, '#2A3142'); });
        yy += ls.length * 13.5 + 7 + e * 0.03;
      });
    }
    var contentBottom = items.length ? yy : gy;
    // details and footer
    var fy = H - 34, my = fy - (land ? 58 : 66);
    P.rect(M, my, R - M, 0.8, {fill: C.line});
    var cols = [['PREPARED BY', c.preparedBy], ['CUT-OFFS', c.cutoffs], ['GENERATED', c.date]].filter(function (x) { return clean(x[1]).trim(); });
    var cw = (R - M) / 3;
    cols.forEach(function (x, i) {
      P.text(x[0], M + i * cw, my + 20, 7.6, false, C.dim);
      P.text(fit(P, x[1], 10, true, cw - 12), M + i * cw, my + 35, 10, true, C.ink);
    });
    P.rect(0, fy, W, 34, {fill: C.navy});
    P.text('CodeTantra Reports', M, fy + 21, 8.2, true, '#E8ECF8');
    var cw2 = P.width('CodeTantra Reports', 8.2, true);
    P.text(' · ' + TOOL_NAME, M + cw2, fy + 21, 8.2, false, '#98A3C2');
    P.text('Cover', R, fy + 21, 8.2, false, '#98A3C2', 'right');
    return contentBottom;
  }

  /* ===================== pdf-lib and canvas painters ===================== */
  var libLoading = null;
  function needLib() {
    if (window.PDFLib && window.PDFLib.PDFDocument) return Promise.resolve(window.PDFLib);
    if (!libLoading) libLoading = new Promise(function (ok, no) {
      var s = document.createElement('script'); s.src = PDFLIB_URL;
      s.onload = function () { window.PDFLib ? ok(window.PDFLib) : no(new Error('pdf-lib missing')); };
      s.onerror = function () { libLoading = null; no(new Error('pdf-lib failed to load')); };
      document.head.appendChild(s);
    });
    return libLoading;
  }
  var sunBytes = null;
  function getSun() { return sunBytes ? Promise.resolve(sunBytes) : fetch(base + 'shared/brand/logo-96.png').then(function (r) { return r.arrayBuffer(); }).then(function (b) { sunBytes = b; return b; }).catch(function () { return null; }); }
  function dataBytes(u) { var b = atob(u.split(',')[1]); var a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
  var hex = function (lib, h) { return lib.rgb(parseInt(h.substr(1, 2), 16) / 255, parseInt(h.substr(3, 2), 16) / 255, parseInt(h.substr(5, 2), 16) / 255); };
  function rrPath(x, y, w, h, r) {
    r = Math.min(r || 0, w / 2, h / 2);
    if (!r) return 'M' + x + ',' + y + ' h' + w + ' v' + h + ' h' + (-w) + ' Z';
    return 'M' + (x + r) + ',' + y + ' H' + (x + w - r) + ' A' + r + ',' + r + ' 0 0 1 ' + (x + w) + ',' + (y + r) + ' V' + (y + h - r) + ' A' + r + ',' + r + ' 0 0 1 ' + (x + w - r) + ',' + (y + h) +
      ' H' + (x + r) + ' A' + r + ',' + r + ' 0 0 1 ' + x + ',' + (y + h - r) + ' V' + (y + r) + ' A' + r + ',' + r + ' 0 0 1 ' + (x + r) + ',' + y + ' Z';
  }
  function arcPath(cx, cy, r, p) {
    if (p >= 99.95) p = 99.95;
    var a0 = -Math.PI / 2, a1 = a0 + Math.PI * 2 * p / 100;
    var x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    return 'M' + x0.toFixed(2) + ',' + y0.toFixed(2) + ' A' + r + ',' + r + ' 0 ' + (p > 50 ? 1 : 0) + ' 1 ' + x1.toFixed(2) + ',' + y1.toFixed(2);
  }
  function pdfPainter(lib, page, fonts, imgs) {
    var H = page.getHeight();
    var F = function (b) { return b ? fonts.b : fonts.r; };
    return {
      width: function (s, size, b) { return F(b).widthOfTextAtSize(clean(s), size); },
      has: function (k) { return !!imgs[k]; },
      size: function (k) { return {w: imgs[k].width, h: imgs[k].height}; },
      rect: function (x, y, w, h, o) {
        var opt = {x: 0, y: H}; if (o.fill) opt.color = hex(lib, o.fill); if (o.stroke) { opt.borderColor = hex(lib, o.stroke); opt.borderWidth = o.lw || 0.8; }
        page.drawSvgPath(rrPath(x, y, w, h, o.r), opt);
      },
      text: function (s, x, y, size, b, color, align) {
        s = clean(s); if (!s) return;
        var w = F(b).widthOfTextAtSize(s, size), xx = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
        page.drawText(s, {x: xx, y: H - y, size: size, font: F(b), color: hex(lib, color)});
      },
      image: function (k, x, y, w, h) { page.drawImage(imgs[k], {x: x, y: H - y - h, width: w, height: h}); },
      circle: function (cx, cy, r, fill) { page.drawCircle({x: cx, y: H - cy, size: r, color: hex(lib, fill)}); },
      ring: function (cx, cy, r, lw, p, color, track) {
        page.drawCircle({x: cx, y: H - cy, size: r, borderColor: hex(lib, track), borderWidth: lw});
        if (p > 0) page.drawSvgPath(arcPath(cx, cy, r, p), {x: 0, y: H, borderColor: hex(lib, color), borderWidth: lw, borderLineCap: lib.LineCapStyle.Round});
      }
    };
  }
  function canvasPainter(ctx, fonts, imgs) {
    var family = 'Helvetica, Arial, "Liberation Sans", sans-serif';
    var F = function (b) { return b ? fonts.b : fonts.r; };
    return {
      width: function (s, size, b) { return F(b).widthOfTextAtSize(clean(s), size); },   // same metrics as the PDF
      has: function (k) { return !!imgs[k]; },
      size: function (k) { return {w: imgs[k].naturalWidth, h: imgs[k].naturalHeight}; },
      rect: function (x, y, w, h, o) {
        ctx.beginPath(); var p = new Path2D(rrPath(x, y, w, h, o.r));
        if (o.fill) { ctx.fillStyle = o.fill; ctx.fill(p); }
        if (o.stroke) { ctx.strokeStyle = o.stroke; ctx.lineWidth = o.lw || 0.8; ctx.stroke(p); }
      },
      text: function (s, x, y, size, b, color, align) {
        s = clean(s); if (!s) return;
        ctx.font = (b ? 'bold ' : '') + size + 'px ' + family; ctx.fillStyle = color;
        var w = F(b).widthOfTextAtSize(s, size), xx = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
        // squeeze or stretch to the PDF font's width so line breaks match the real file
        var real = ctx.measureText(s).width || w;
        ctx.save(); ctx.translate(xx, y); ctx.scale(w / real, 1); ctx.fillText(s, 0, 0); ctx.restore();
      },
      image: function (k, x, y, w, h) { ctx.drawImage(imgs[k], x, y, w, h); },
      circle: function (cx, cy, r, fill) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); },
      ring: function (cx, cy, r, lw, p, color, track) {
        ctx.lineWidth = lw; ctx.strokeStyle = track; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
        if (p > 0) { ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(p, 99.95) / 100); ctx.stroke(); }
      }
    };
  }
  // insert the cover as page 1 of a PDF (Blob or bytes); resolves to the new bytes
  function addCover(bytes) {
    var c = content();
    if (!c) return Promise.reject(new Error('no report on screen'));
    return Promise.all([needLib(), getSun()]).then(function (r) {
      var lib = r[0], sun = r[1];
      return lib.PDFDocument.load(bytes).then(function (doc) {
        var first = doc.getPage(0), sz = first.getSize();
        var page = doc.insertPage(0, [sz.width, sz.height]);
        var emb = function (u) { if (!u) return Promise.resolve(null); return (/^data:image\/jpe?g/i.test(u) ? doc.embedJpg(dataBytes(u)) : doc.embedPng(dataBytes(u))).catch(function () { return null; }); };
        return Promise.all([doc.embedFont(lib.StandardFonts.Helvetica), doc.embedFont(lib.StandardFonts.HelveticaBold), sun ? doc.embedPng(sun).catch(function () { return null; }) : null, emb(c.collegeLogo), emb(c.companyLogo)])
          .then(function (e) {
            var imgs = {}; if (e[2]) imgs.sun = e[2]; if (e[3]) imgs.collegeLogo = e[3]; if (e[4]) imgs.companyLogo = e[4];
            draw(pdfPainter(lib, page, {r: e[0], b: e[1]}, imgs), sz.width, sz.height, c);
            return doc.save();
          });
      });
    });
  }

  /* ===================== catch the tool's own PDF download ===================== */
  var WANT = {
    single: function (name) { return /_College_Summary\.pdf$/i.test(name); },
    group: function (name) { return /\.pdf$/i.test(name); },
    section: function (name) { return /_analysis_report\.pdf$/i.test(name); },
    cutoff: function (name, btn) { return /(^|_)(Performance|Growth)_Report_/i.test(name) && !/Not_Attempted/i.test(name) && btn !== 'pdfB' && btn !== 'pdfN'; },   // a company name is added in front
    course: function (name) { return /course-progress-report.*\.pdf$/i.test(name); }
  }[here];
  var blobs = new Map(), nativeCreate = URL.createObjectURL;
  URL.createObjectURL = function (o) { var u = nativeCreate.apply(URL, arguments); if (o instanceof Blob) blobs.set(u, o); return u; };
  var lastBtn = '', lastBtnAt = 0;
  document.addEventListener('click', function (e) {
    if (!e.isTrusted || !e.target.closest) return;
    var b = e.target.closest('button'); if (b) { lastBtn = b.id || ''; lastBtnAt = Date.now(); }
  }, true);
  var AP = HTMLAnchorElement.prototype, prevClick = AP.click, prevDispatch = AP.dispatchEvent;
  function eligible(a) {
    if (!toolS.enabled || a.__ctCover) return false;
    var name = a.getAttribute('download') || '';
    return !!name && blobs.has(a.href) && WANT(name, Date.now() - lastBtnAt < 600000 ? lastBtn : '') && !!content();
  }
  function handle(a) {
    var name = a.getAttribute('download'), blob = blobs.get(a.href);
    var finish = function (data, covered) {
      var url = nativeCreate.call(URL, data instanceof Blob ? data : new Blob([data], {type: 'application/pdf'}));
      var b = document.createElement('a'); b.href = url; b.download = name; b.__ctCover = true; b.style.display = 'none';
      if (covered) b.setAttribute('data-ct-cover', '1');
      document.body.appendChild(b); b.click(); b.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
    };
    blob.arrayBuffer().then(addCover).then(function (out) { finish(out, true); }, function (err) {
      if (window.console) console.warn('Cover page skipped:', err && err.message);
      finish(blob, false);
    });
  }
  AP.click = function () { if (eligible(this)) { handle(this); return; } return prevClick.apply(this, arguments); };
  AP.dispatchEvent = function (ev) {
    if (ev && ev.type === 'click' && !ev.isTrusted && eligible(this)) { handle(this); return true; }
    return prevDispatch.call(this, ev);
  };

  /* ===================== the "Cover page" drawer ===================== */
  var css = document.createElement('style');
  css.textContent =
    '.ct-cover-btn{all:unset;box-sizing:border-box;cursor:pointer;display:inline-flex;align-items:center;gap:7px;height:34px;padding:0 12px;border-radius:10px;margin-left:auto;' +
      'font:600 13px/1 Inter,system-ui,sans-serif;color:#FFC94D;background:rgba(242,140,40,.12);box-shadow:inset 0 0 0 1px rgba(242,140,40,.4);white-space:nowrap;transition:background .2s}' +
    '.ct-cover-btn:hover{background:rgba(242,140,40,.2)}.ct-cover-btn:focus-visible{outline:2px solid #FFC94D;outline-offset:2px}.ct-cover-btn[hidden]{display:none}' +
    '.ct-cover-btn svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
    '.ct-cover-btn i{font-style:normal;font-size:11px;font-weight:600;padding:2px 6px;border-radius:6px;background:rgba(255,255,255,.08);color:#98A3C2}' +
    '[data-mode="light"] .ct-cover-btn{color:#B45F06;background:#FFF4E6;box-shadow:inset 0 0 0 1px #F5C98A}[data-mode="light"] .ct-cover-btn i{background:#fff;color:#5B6475}' +
    '.ccd{position:fixed;inset:0;z-index:10060;display:none;font:400 14px/1.45 Inter,system-ui,sans-serif}.ccd.on{display:block}' +
    '.ccd-bg{position:absolute;inset:0;background:rgba(5,8,18,.55);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}' +
    '.ccd-p{position:absolute;top:0;right:0;bottom:0;width:min(520px,100%);display:flex;flex-direction:column;background:#10172C;color:#E8ECF8;border-left:1px solid #2E3A5E;box-shadow:-30px 0 80px -30px rgba(0,0,0,.8)}' +
    '.ccd-h{display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid #232C48}.ccd-h b{flex:1;font:600 16px/1.2 Sora,Inter,sans-serif}' +
    '.ccd-x{all:unset;cursor:pointer;width:32px;height:32px;display:grid;place-items:center;border-radius:9px;color:#98A3C2;font-size:22px}.ccd-x:hover{background:rgba(255,255,255,.06);color:#fff}' +
    '.ccd-s{flex:1;overflow:auto;padding:16px 18px 24px}' +
    '.ccd-prev{display:block;width:100%;border-radius:10px;background:#fff;box-shadow:0 16px 40px -20px rgba(0,0,0,.8);margin-bottom:6px}' +
    '.ccd-note{font-size:12px;color:#6B7596;margin:0 0 14px}' +
    '.ccd-on{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid #232C48;margin-bottom:16px;font-weight:600}' +
    '.ccd-on input{width:18px;height:18px;accent-color:#F28C28}' +
    '.ccd fieldset{border:0;margin:0 0 16px;padding:0}.ccd legend{font:600 11.5px/1 Inter,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#8FA9FF;margin-bottom:10px}' +
    '.ccd label{display:block;font-size:12.5px;color:#98A3C2;margin:0 0 10px}' +
    '.ccd input[type=text],.ccd textarea{display:block;width:100%;box-sizing:border-box;margin-top:5px;padding:8px 10px;border-radius:9px;border:1px solid #2E3A5E;background:#0E1529;color:#E8ECF8;font:400 13.5px/1.4 Inter,system-ui,sans-serif;resize:vertical}' +
    '.ccd input[type=text]:focus,.ccd textarea:focus{outline:2px solid #4F7CFF;outline-offset:0;border-color:transparent}' +
    '.ccd .two{display:grid;grid-template-columns:1fr 1fr;gap:10px}' +
    '.ccd .logo{display:flex;align-items:center;gap:10px;margin:5px 0 10px}.ccd .logo img{max-width:90px;max-height:44px;border-radius:6px;background:#fff;padding:3px}' +
    '.ccd .logo button,.ccd-f button{all:unset;cursor:pointer;font:600 12.5px/1 Inter,sans-serif;padding:8px 11px;border-radius:9px;border:1px solid #2E3A5E;color:#C9D1E8}' +
    '.ccd .logo button:hover,.ccd-f button:hover{background:rgba(255,255,255,.06)}' +
    '.ccd-f{display:flex;gap:10px;justify-content:space-between;align-items:center;padding:12px 18px;border-top:1px solid #232C48}' +
    '.ccd-f .go{background:linear-gradient(135deg,#FFB547,#F28C28);color:#1A1004;border:0}' +
    '[data-mode="light"] .ccd-bg{background:rgba(26,31,43,.3)}[data-mode="light"] .ccd-p{background:#fff;color:#1A1F2B;border-left-color:#E4E7EC}' +
    '[data-mode="light"] .ccd-h,[data-mode="light"] .ccd-f{border-color:#EEF0F4}[data-mode="light"] .ccd label{color:#5B6475}' +
    '[data-mode="light"] .ccd input[type=text],[data-mode="light"] .ccd textarea{background:#F7F8FB;border-color:#E4E7EC;color:#1A1F2B}' +
    '[data-mode="light"] .ccd legend{color:#2952D9}[data-mode="light"] .ccd-on{background:#F7F8FB;border-color:#E4E7EC}' +
    '[data-mode="light"] .ccd .logo button,[data-mode="light"] .ccd-f button{border-color:#E4E7EC;color:#3A4254}[data-mode="light"] .ccd-prev{box-shadow:0 10px 30px -16px rgba(26,31,43,.5);outline:1px solid #E4E7EC}' +
    '@media print{.ct-cover-btn,.ccd{display:none!important}}';
  document.head.appendChild(css);

  var ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/></svg>';
  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'ct-cover-btn'; btn.hidden = true;
  btn.innerHTML = ICON + '<span>Cover page</span><i></i>';
  var setBtn = function () { btn.lastChild.textContent = toolS.enabled ? 'On' : 'Off'; };
  setBtn();
  btn.addEventListener('click', function () { open(); });
  var placeBtn = function () {
    var bar = document.querySelector('.ct-bar'); if (!bar) return;
    var host = bar.querySelector('.ct-bar-in') || bar.querySelector(':scope > .wrap') || bar;
    if (btn.parentNode !== host) host.appendChild(btn);
    var has = !!content();
    if (btn.hidden === has) btn.hidden = !has;
  };
  var pq = false;
  new MutationObserver(function () { if (!pq) { pq = true; setTimeout(function () { pq = false; placeBtn(); }, 250); } }).observe(document.body, {childList: true, subtree: true});
  placeBtn();

  var dlg = null, cv = null, previewQ = 0, imgCache = {};
  var F = [
    ['College', [['collegeName', 'College name', 'id'], ['collegeSub', 'Line under the name (department, cell)', 'id'], ['collegeLogo', 'College logo', 'logo:id']]],
    ['Report', [['kicker', 'Report type (small line above the title)', 'tool'], ['title', 'Title', 'rep'], ['subtitle', 'Line under the title', 'rep'], ['companyLogo', 'Company or exam logo (shown beside the title)', 'logo:tool'], ['line', 'Headline sentence (beside the big number)', 'rep:area']]],
    ['At a glance', [['g0', 'Finding 1', 'rep:area'], ['g1', 'Finding 2', 'rep:area'], ['g2', 'Finding 3', 'rep:area']]],
    ['Details', [['preparedBy', 'Prepared by', 'id'], ['cutoffs', 'Cut-offs', 'rep'], ['date', 'Date', 'rep']]]
  ];
  function build() {
    dlg = document.createElement('div'); dlg.className = 'ccd';
    var h = '<div class="ccd-bg"></div><div class="ccd-p" role="dialog" aria-modal="true" aria-labelledby="ccd-t">' +
      '<div class="ccd-h"><b id="ccd-t">Cover page</b><button type="button" class="ccd-x" aria-label="Close">×</button></div><div class="ccd-s">' +
      '<canvas class="ccd-prev" aria-label="Preview of the cover page"></canvas><p class="ccd-note">Preview. The cover is added as page 1 of the main PDF. Numbers come from the report.</p>' +
      '<label class="ccd-on"><input type="checkbox" data-k="enabled"> Add this cover to the PDF</label>';
    F.forEach(function (grp) {
      h += '<fieldset><legend>' + grp[0] + '</legend>';
      grp[1].forEach(function (f) {
        if (/^logo/.test(f[2])) h += '<label>' + f[1] + '<span class="logo" data-logo="' + f[0] + '"><img alt="" hidden><button type="button" data-up="' + f[0] + '">Upload</button><button type="button" data-rm="' + f[0] + '" hidden>Remove</button><input type="file" accept="image/*" hidden data-file="' + f[0] + '"></span></label>';
        else if (/area/.test(f[2])) h += '<label>' + f[1] + '<textarea rows="2" data-k="' + f[0] + '"></textarea></label>';
        else h += '<label>' + f[1] + '<input type="text" data-k="' + f[0] + '" autocomplete="off"></label>';
      });
      h += '</fieldset>';
    });
    h += '</div><div class="ccd-f"><button type="button" data-reset>Reset to report values</button><button type="button" class="go" data-done>Done</button></div></div>';
    dlg.innerHTML = h;
    document.body.appendChild(dlg);
    cv = dlg.querySelector('canvas');
    dlg.querySelector('.ccd-bg').onclick = close; dlg.querySelector('.ccd-x').onclick = close; dlg.querySelector('[data-done]').onclick = close;
    dlg.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    dlg.querySelector('[data-reset]').onclick = function () {
      report.o = {}; delete toolS.kicker; delete ident.collegeSub; save(TOOL_KEY, toolS); fill(); preview();
    };
    dlg.addEventListener('input', function (e) {
      var k = e.target.getAttribute('data-k'); if (!k) return;
      var v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setField(k, v); preview();
    });
    dlg.addEventListener('change', function (e) {
      var k = e.target.getAttribute('data-file'); if (!k || !e.target.files[0]) return;
      readLogo(e.target.files[0]).then(function (u) { setField(k, u); fill(); preview(); });
      e.target.value = '';
    });
    dlg.addEventListener('click', function (e) {
      var up = e.target.getAttribute && e.target.getAttribute('data-up'), rm = e.target.getAttribute && e.target.getAttribute('data-rm');
      if (up) dlg.querySelector('[data-file="' + up + '"]').click();
      if (rm) { setField(rm, ''); fill(); preview(); }
    });
  }
  function kind(k) { for (var i = 0; i < F.length; i++) for (var j = 0; j < F[i][1].length; j++) if (F[i][1][j][0] === k) return F[i][1][j][2]; return ''; }
  function setField(k, v) {
    if (k === 'enabled') { toolS.enabled = !!v; save(TOOL_KEY, toolS); setBtn(); return; }
    var t = kind(k);
    if (/id/.test(t)) { ident[k] = v; save(ID_KEY, ident); }
    else if (/tool/.test(t)) { toolS[k] = v; save(TOOL_KEY, toolS); }
    else report.o[k] = v;
  }
  function fill() {
    var c = content() || {};
    dlg.querySelector('[data-k="enabled"]').checked = !!toolS.enabled;
    [].forEach.call(dlg.querySelectorAll('[data-k]'), function (el) { var k = el.getAttribute('data-k'); if (k !== 'enabled') el.value = c[k] || ''; });
    [].forEach.call(dlg.querySelectorAll('[data-logo]'), function (box) {
      var k = box.getAttribute('data-logo'), u = c[k], img = box.querySelector('img');
      img.hidden = !u; if (u) img.src = u; box.querySelector('[data-rm]').hidden = !u; box.querySelector('[data-up]').textContent = u ? 'Replace' : 'Upload';
    });
  }
  // any image becomes a PNG (or JPEG for photos) no larger than 600 px, ready to embed
  function readLogo(file) {
    return new Promise(function (ok, no) {
      var r = new FileReader();
      r.onload = function () {
        var im = new Image();
        im.onload = function () {
          var s = Math.min(1, 600 / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas');
          c.width = Math.max(1, Math.round(im.naturalWidth * s)); c.height = Math.max(1, Math.round(im.naturalHeight * s));
          c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
          ok(c.toDataURL(/jpe?g/i.test(file.type) ? 'image/jpeg' : 'image/png', 0.92));
        };
        im.onerror = no; im.src = r.result;
      };
      r.onerror = no; r.readAsDataURL(file);
    });
  }
  function imgEl(u) {
    if (!u) return Promise.resolve(null);
    if (imgCache[u]) return Promise.resolve(imgCache[u]);
    return new Promise(function (ok) { var i = new Image(); i.onload = function () { imgCache[u] = i; ok(i); }; i.onerror = function () { ok(null); }; i.src = u; });
  }
  function preview() {
    var me = ++previewQ;
    setTimeout(function () {
      if (me !== previewQ || !dlg || !dlg.classList.contains('on')) return;
      var c = content(); if (!c) return;
      Promise.all([needLib(), imgEl(base + 'shared/brand/logo-96.png'), imgEl(c.collegeLogo), imgEl(c.companyLogo)]).then(function (r) {
        var lib = r[0];
        return lib.PDFDocument.create().then(function (doc) { return Promise.all([doc.embedFont(lib.StandardFonts.Helvetica), doc.embedFont(lib.StandardFonts.HelveticaBold)]); })
          .then(function (fonts) {
            if (me !== previewQ) return;
            var land = here === 'cutoff', W = land ? 841.89 : 595.28, H = land ? 595.28 : 841.89;
            var scale = (cv.clientWidth || 480) / W * (window.devicePixelRatio || 1);
            cv.width = Math.round(W * scale); cv.height = Math.round(H * scale);
            var ctx = cv.getContext('2d'); ctx.setTransform(scale, 0, 0, scale, 0, 0);
            ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
            var imgs = {}; if (r[1]) imgs.sun = r[1]; if (r[2]) imgs.collegeLogo = r[2]; if (r[3]) imgs.companyLogo = r[3];
            draw(canvasPainter(ctx, {r: fonts[0], b: fonts[1]}, imgs), W, H, c);
          });
      }).catch(function () { var p = dlg.querySelector('.ccd-note'); p.textContent = 'The preview needs the pdf-lib library, which could not load. Check the internet connection.'; });
    }, 60);
  }
  var lastFocus = null;
  function open() {
    if (!dlg) build();
    lastFocus = document.activeElement;
    fill(); dlg.classList.add('on'); preview();
    var f = dlg.querySelector('[data-k="title"]'); if (f) f.focus();
  }
  function close() { if (!dlg) return; dlg.classList.remove('on'); if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {} }

  window.CTCover = {content: content, addCover: addCover, open: open, draw: draw};
})();
