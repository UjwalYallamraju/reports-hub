/* CodeTantra Reports: recognise an export, and pass files between pages.
   <script src="RELATIVE/shared/detect.js"></script>  (before motion.js on tool pages; on the home page too)

   window.CTDetect
     classify(rows, fileName) -> 'single' | 'group' | 'section' | 'course' | null   (rows = first rows of sheet 1)
     sniff(file)              -> Promise of the same, reading only the first rows
     TOOLS, KIND, here        the five tools, what each export kind is, and which tool this page is
     send(files, tool)        keep the files in this browser (IndexedDB) and open the tool, which loads them
     inject(files, tool)      put files into this page's tool, as if they were chosen in its file picker
     samples(tool)            load the bundled demo files into this page's tool

   Files never leave the browser: the hand-over uses IndexedDB on this site and is cleared as soon as it is read. */
(function () {
  'use strict';
  var me = document.currentScript;
  var base = me ? me.src.replace(/shared\/detect\.js(\?.*)?$/, '') : '';

  var TOOLS = {
    single: {name: 'Single test report', path: 'tests/single-tests-report.html', input: '#fileInput', zone: '#drop'},
    group: {name: 'Group-wise tests report', path: 'tests/group-tests-report.html', input: '#file', zone: '#drop'},
    section: {name: 'Section-wise test analysis', path: 'tests/section-report.html', input: '#file', zone: '#drop'},
    cutoff: {name: 'Sectional cut-off report', path: 'tests/sectional-cutoff-report.html', input: '#fi', zone: '#dz'},
    course: {name: 'Course progress insights', path: 'courses/insights/index.html', input: 'input[type=file][multiple]', zone: '.cip-drop'}
  };
  var KIND = {
    single: {what: 'a single test export', why: 'one total score per student', go: ['single']},
    group: {what: 'a group tests export', why: 'several tests side by side', go: ['group']},
    section: {what: 'a sectional test export', why: 'marks for each section and a total', go: ['section', 'cutoff']},
    course: {what: 'a course progress export', why: 'completion for each course', go: ['course']}
  };
  // demo files in shared/samples/, made up for the demo (no real students)
  var SAMPLES = {
    single: ['1_2027-2028-AptitudeMock-Test-03_Attempted_20-11-2026.xlsx', '1_2027-2028-AptitudeMock-Test-03_Not Attempted_20-11-2026.xlsx'],
    group: ['Group Tests Results - Aptitude Training.xlsx'],
    section: ['Assessment - Coding and Aptitude.xlsx'],
    cutoff: ['Mock-Test-02 12-11-2026.xlsx'],
    cutoffGrowth: ['Mock-Test-01 11-11-2026.xlsx', 'Mock-Test-02 12-11-2026.xlsx'],
    course: ['Course Progress - All Sections.xlsx']
  };
  var p = location.pathname;
  var here = /single-tests-report/.test(p) ? 'single' : /group-tests-report/.test(p) ? 'group'
    : /sectional-cutoff-report/.test(p) ? 'cutoff' : /section-report/.test(p) ? 'section' : /\/insights\//.test(p) ? 'course' : '';

  /* ---------- recognise ---------- */
  function classify(rows, name) {
    var hdr = null;
    for (var i = 0; i < rows.length && !hdr; i++) {
      var r = rows[i] || [], strs = r.filter(function (c) { return typeof c === 'string' && c.trim(); });
      if (strs.length >= 3 && strs.some(function (s) { return /name/i.test(s); })) hdr = r;
    }
    if (!hdr) return null;
    var H = hdr.map(function (c) { return String(c == null ? '' : c).trim(); }).filter(Boolean);
    var isMark = function (h) { return /\(\s*\d+(\.\d+)?\s*(m|marks?)?\s*\)\s*$/i.test(h); };
    var marks = H.filter(isMark), total = marks.filter(function (h) { return /^total\b/i.test(h); });
    var parts = marks.filter(function (h) { return !/^total\b/i.test(h); });
    var tests = parts.filter(function (h) { return /^\d+\s*-\s*\S/.test(h); });
    var courses = H.filter(function (h) { return /^\d+\s*-\s*\S/.test(h) && !isMark(h); });
    if (H.some(function (h) { return /created\s*time|password/i.test(h); })) return 'course';
    if (courses.length && !marks.length) return 'course';
    if (tests.length && !total.length) return 'group';
    if (parts.length >= 2) return 'section';
    if (total.length) return 'single';
    if (/attempted/i.test(name || '') || (H.some(function (h) { return /^groups?$/i.test(h); }) && H.some(function (h) { return /name/i.test(h); }))) return 'single';
    return null;
  }
  var xlsxLoading = null;
  function needXLSX() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    if (!xlsxLoading) xlsxLoading = new Promise(function (ok, no) {
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      s.onload = function () { window.XLSX ? ok(window.XLSX) : no(new Error('XLSX missing')); };
      s.onerror = function () { xlsxLoading = null; no(new Error('XLSX failed to load')); };
      document.head.appendChild(s);
    });
    return xlsxLoading;
  }
  function sniff(file) {
    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) return Promise.resolve(null);
    return file.arrayBuffer().then(function (buf) {
      return needXLSX().then(function (X) {
        var wb = X.read(buf, {type: 'array', sheetRows: 15});
        var ws = wb.Sheets[wb.SheetNames[0]];
        return classify(X.utils.sheet_to_json(ws, {header: 1, raw: true, defval: null}), file.name);
      });
    }).catch(function () { return null; });
  }

  /* ---------- hand files to another page (IndexedDB, this browser only) ---------- */
  function db() {
    return new Promise(function (ok, no) {
      var r = indexedDB.open('ct-handoff', 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('f'); };
      r.onsuccess = function () { ok(r.result); };
      r.onerror = function () { no(r.error); };
    });
  }
  function put(files) {
    return db().then(function (d) {
      return new Promise(function (ok, no) {
        var tx = d.transaction('f', 'readwrite');
        tx.objectStore('f').put({files: [].slice.call(files), at: Date.now()}, 'pending');
        tx.oncomplete = function () { d.close(); ok(); };
        tx.onerror = function () { d.close(); no(tx.error); };
      });
    });
  }
  function take() {
    return db().then(function (d) {
      return new Promise(function (ok) {
        var tx = d.transaction('f', 'readwrite'), st = tx.objectStore('f'), rec = null;
        var g = st.get('pending');
        g.onsuccess = function () { rec = g.result || null; st.delete('pending'); };
        tx.oncomplete = function () { d.close(); ok(rec); };
        tx.onerror = function () { d.close(); ok(null); };
      });
    }).catch(function () { return null; });
  }
  function send(files, tool) {
    var go = function () { location.href = base + TOOLS[tool].path + '?from=home'; };
    return put(files).then(go, go);
  }

  /* ---------- load files into this page's tool ---------- */
  function waitFor(sel, ms) {
    return new Promise(function (ok) {
      var t0 = Date.now();
      (function poll() {
        var el = document.querySelector(sel);
        if (el) return ok(el);
        if (Date.now() - t0 > ms) return ok(null);
        setTimeout(poll, 80);
      })();
    });
  }
  function inject(files, tool) {
    tool = tool || here;
    var T = TOOLS[tool];
    if (!T || !files || !files.length) return Promise.resolve(false);
    files = [].slice.call(files);
    var prep = Promise.resolve();
    // the cut-off report compares several tests in its growth mode
    if (tool === 'cutoff' && files.length > 1) {
      var g = document.querySelector('#modes button[data-m="multi"]');
      if (g && !g.classList.contains('on')) g.click();
    }
    return prep.then(function () { return waitFor(T.input, 8000); }).then(function (input) {
      if (!input) return false;
      var dt = new DataTransfer();
      (input.multiple ? files : files.slice(0, 1)).forEach(function (f) { dt.items.add(f); });
      input.files = dt.files;
      input.dispatchEvent(new Event('input', {bubbles: true}));
      input.dispatchEvent(new Event('change', {bubbles: true}));
      return true;
    });
  }
  var TYPES = {xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', csv: 'text/csv', xls: 'application/vnd.ms-excel'};
  function samples(tool) {
    tool = tool || here;
    var key = tool;
    if (tool === 'cutoff') { var g = document.querySelector('#modes button[data-m="multi"]'); if (g && g.classList.contains('on')) key = 'cutoffGrowth'; }
    var names = SAMPLES[key] || [];
    return Promise.all(names.map(function (n) {
      return fetch(base + 'shared/samples/' + encodeURIComponent(n)).then(function (r) {
        if (!r.ok) throw new Error('missing sample ' + n);
        return r.blob();
      }).then(function (b) { return new File([b], n, {type: TYPES[n.split('.').pop()] || ''}); });
    })).then(function (fs) { return inject(fs, tool); });
  }

  /* ---------- on a tool page: pick up files sent from home, offer sample data ---------- */
  if (here) {
    if (/[?&]from=home\b/.test(location.search)) {
      take().then(function (rec) {
        // tidy the address bar once any page transition has finished
        var vt = window.__ctVT, tidy = function () { try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {} };
        if (vt && vt.finished) vt.finished.then(tidy, tidy); else setTimeout(tidy, 600);
        if (rec && rec.files && rec.files.length && Date.now() - rec.at < 10 * 60 * 1000) inject(rec.files, here);
      });
    }
    // "Try with sample data" under the upload box (Course Insights draws its own button in React)
    {
      var css = document.createElement('style');
      css.textContent =
        '.ct-sample{display:flex;justify-content:center;align-items:center;gap:8px;margin:12px 0 0;font:500 13.5px/1.4 Inter,system-ui,sans-serif;color:#98A3C2}' +
        '.ct-sample button{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:7px;padding:6px 12px;border-radius:999px;font-weight:600;color:#FFC94D;background:rgba(242,140,40,.12);box-shadow:inset 0 0 0 1px rgba(242,140,40,.38);transition:background .2s,transform .2s}' +
        '.ct-sample button:hover{background:rgba(242,140,40,.2);transform:translateY(-1px)}' +
        '.ct-sample button:focus-visible{outline:2px solid #FFC94D;outline-offset:2px}' +
        '.ct-sample svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
        '[data-mode="light"] .ct-sample{color:#5B6475}[data-mode="light"] .ct-sample button{color:#B45F06;background:#FFF4E6;box-shadow:inset 0 0 0 1px #F5C98A}' +
        '@media print{.ct-sample{display:none!important}}';
      document.head.appendChild(css);
      var addBtn = function () {
        var z = document.querySelector(TOOLS[here].zone);
        if (!z || !z.parentNode || (z.nextElementSibling && z.nextElementSibling.classList.contains('ct-sample'))) return;
        var row = document.createElement('div');
        row.className = 'ct-sample';
        row.innerHTML = '<span>No file handy?</span><button type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.9 5.3L19 10l-5.1 1.7L12 17l-1.9-5.3L5 10l5.1-1.7z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>Try it with sample data</button>';
        row.querySelector('button').addEventListener('click', function () { samples(here); });
        z.parentNode.insertBefore(row, z.nextSibling);
      };
      var queued = false;
      if (here !== 'course') new MutationObserver(function () { if (!queued) { queued = true; requestAnimationFrame(function () { queued = false; addBtn(); }); } })
        .observe(document.documentElement, {childList: true, subtree: true});
      if (here !== 'course') { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addBtn); else addBtn(); }
    }
  }

  window.CTDetect = {classify: classify, sniff: sniff, TOOLS: TOOLS, KIND: KIND, here: here, send: send, inject: inject, samples: samples, base: base};
})();
