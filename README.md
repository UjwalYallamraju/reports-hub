# CodeTantra Reports

One website for all course and test report tools. Upload an export, review the analytics, download a PDF.
Everything runs in the browser; no files are uploaded to a server.

## Sections

| Section | Tool | Page | Came from |
|---|---|---|---|
| Courses | Course progress insights | `courses/insights/` | COURSE-INSIGHTS |
| Tests | Single test report | `tests/single-tests-report.html` | Test-Reports (newer copy of CT-Test-Reports) |
| Tests | Group-wise tests report | `tests/group-tests-report.html` | Test-Reports (newer copy of CT-Test-Reports) |
| Tests | Section-wise test analysis | `tests/section-report.html` | section-report (includes everything in segregation-test-report) |
| Tests | Sectional cut-off report | `tests/sectional-cutoff-report.html` | Mock Test Analytics (Infosys) artifact, made company-neutral |

## Sectional cut-off report

Works for any company's mock test. Type the company name on the page; it is used in the title and PDF file names.

- Section columns are found from headers with max marks in brackets: `Coding (20M)`, `Coding (20)`, `Coding (20 Marks)`. Total columns are ignored.
- Recognised columns: Name / Student Name, Member Id / Roll No / Student Id, Email, Groups / Batch / Class / Branch, Status.
- Without a Status column, students with any section score count as attempted.
- Growth view: name files with the test number (`Test-01.xlsx`, `Test-02.xlsx`) so they sort in order.

## Handy features

- **PDF cover page:** each tool's main PDF starts with a cover (title, headline number, four key figures,
  three findings, prepared by, cut-offs, date). The **Cover page** button in the tool's header opens an editor
  with a live preview; college name, department line, college logo and "prepared by" are remembered for every
  tool, the company logo and report type per tool, and it can be switched off. `shared/cover.js` adds the page
  with pdf-lib when the tool saves its PDF; batch, per-group and not-attempted PDFs and ZIPs are left as they are.
- **Smart drop (home page):** drop any export on the home page. `shared/detect.js` recognises it from the header row
  and opens the right tool with the file already loaded (handed over through IndexedDB in this browser; never uploaded).
  Sectional exports ask which report; unknown files ask which tool.
- **Try it with sample data:** every tool has a button under its upload box that loads the demo files in
  `shared/samples/` (made-up students, `example.edu` emails).
- **Search (Ctrl+K or /):** jump to any page or tool, run the current page's download buttons, or switch light/dark.
- **Light / dark mode:** the sun/moon button in the top bar. Remembered per browser; `?mode=light` previews it.
  On tool pages the dark skin sheets (`shared/skin/*.css`) are switched off, so each tool's own light design shows.
  PDFs are the same in both modes.
- **Page transitions:** the top bar and sun stay put while pages slide (Chrome, Edge, Safari 18.2+).
- **Wrong file?** Each tool peeks at the header row of a dropped file; if it is a different kind of export,
  a card names it and links to the tool that reads it (`shared/detect.js` + `shared/skin/motion.js`).
- **Time of day:** the sun's colour follows the clock; `?tod=night` (morning, midday, evening) previews it.

## Folder layout

```
index.html              Home page (Courses | Tests)
courses/index.html      Courses landing page
courses/insights/       Built Course Insights app (generated, do not edit by hand)
tests/index.html        Tests landing page
tests/*.html            Test report tools (plain HTML, edit directly)
shared/hub-nav.js       Top bar shown on every page
shared/hub.css          Styles for the home and landing pages (dark theme)
shared/hub.js           Landing-page chart and animations (anime.js)
shared/vendor/          anime.js 4.5.0 (MIT), saved with the site
shared/skin/            Dark skin for the tools: base.css + one file per tool, motion.js (entrance animation)
shared/brand/           Logo and favicons
apps/course-insights/   React source for Course Insights
```

## Deploy on Vercel

1. Push this folder to a GitHub repo.
2. In Vercel: **Add New → Project → Import** the repo.
3. Framework Preset: **Other**. Leave Build Command and Output Directory empty. Click **Deploy**.

`vercel.json` adds security headers and long caching for the Course Insights build files.
`.vercelignore` keeps the React source in `apps/` out of the deployment. After changing
Course Insights, rebuild it (see below) and commit `courses/insights/` before pushing.

## Publish on GitHub Pages

1. Push this folder to a new repo (for example `reports-hub`).
2. Repo **Settings → Pages → Deploy from a branch → main / (root)**.
3. The site is at `https://<your-username>.github.io/reports-hub/`.

## Editing Course Insights

The React source lives in `apps/course-insights`. After a change, rebuild it into `courses/insights/`:

```bash
cd apps/course-insights
npm install
npm run build      # writes to ../../courses/insights
```

Commit the rebuilt `courses/insights/` folder along with the source.

For local development: `npm run dev` (the hub top bar won't resolve on the dev server; that's expected).

## Adding a new tool

1. Put the page in `courses/` or `tests/`.
2. Add this line right after its `<body>` tag so it gets the shared top bar:
   ```html
   <script src="../shared/hub-nav.js" data-root="../" data-section="tests"></script>
   ```
3. Add a card for it in `courses/index.html` or `tests/index.html`, and a row on the home page.
