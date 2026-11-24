# Reports Hub

One website for all course and test report tools. Upload an export, review the analytics, download a PDF.
Everything runs in the browser; no files are uploaded to a server.

## Sections

| Section | Tool | Page | Came from |
|---|---|---|---|
| Courses | Course progress insights | `courses/insights/` | COURSE-INSIGHTS |
| Tests | Single test report | `tests/single-tests-report.html` | Test-Reports (newer copy of CT-Test-Reports) |
| Tests | Group-wise tests report | `tests/group-tests-report.html` | Test-Reports (newer copy of CT-Test-Reports) |
| Tests | Section-wise test analysis | `tests/section-report.html` | section-report (includes everything in segregation-test-report) |

## Folder layout

```
index.html              Home page (Courses | Tests)
courses/index.html      Courses landing page
courses/insights/       Built Course Insights app (generated, do not edit by hand)
tests/index.html        Tests landing page
tests/*.html            Test report tools (plain HTML, edit directly)
shared/hub-nav.js       Top bar shown on every page
shared/hub.css          Styles for the home and landing pages
apps/course-insights/   React source for Course Insights
```

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
