# LeapFI Dashboards

Publish self-contained HTML dashboards to the web and embed them into Google Sites.
Google Sites has **no editing API**, so we host the dashboards on GitHub Pages and each
Sites page embeds its dashboard **by URL** (iframe). Update = replace the file + push;
Sites reflects the change automatically. You never re-edit Sites after initial setup.

## One-time setup (already done)
- GitHub repo: `LeapFI-MasterAccount/leapfi-dashboards`, GitHub Pages serving from `main` branch `/docs`.
- Base URL: https://leapfi-masteraccount.github.io/leapfi-dashboards
- Each Google Sites page has one **Embed > By URL** block pointing at a dashboard URL.

## Current state (PI-3, rev-88)

- The NorthWinds v2 demo app lives at `app/nw-platform-v2/` (React 18 + TypeScript strict,
  Vite single-file build). Its build output is the generated artifact
  `src/leapfi-platform-v2.html` — never hand-edit it.
- `src/leapfi-platform.html` (v1) is READ-ONLY; every publish verifies it byte-identical.
- Publishing runs `publish.py --push` ONLY in an isolated worktree of `main`
  (`wt/publish-rev73`), sourcing from committed origin state. Each publish is tagged `rev-N`;
  rollback is forward-only: `git checkout rev-<N> -- src docs`, republish.
- Tests: `cd app/nw-platform-v2 && npx vitest run && npx tsc --noEmit`.
- Program records (plans, ledgers, decisions, writeups) live in the `leapfi-documentation`
  repo under `08_Programs/` — GitHub is the system of record.

## Everyday workflow
1. Put your latest dashboard HTML files in `src/` (one file per dashboard).
   Keep the **filename stable** so the published URL stays stable.
2. Build + publish:
   ```
   cd ~/LeapFI-Dashboards
   python3 publish.py --push
   ```
3. Done. Live in ~1-2 min. Updates to an existing page can take up to ~10 min
   (GitHub Pages CDN cache). The Sites embed URL never changes.

`python3 publish.py` (no `--push`) builds into `docs/` and prints URLs without publishing.

## Naming / titles / order
Slugs are auto-derived from filenames. To pin a title, stable slug, or order, edit
`dashboards.config.json`:
```json
{
  "base_url": "https://leapfi-masteraccount.github.io/leapfi-dashboards",
  "dashboards": {
    "my-report.html": { "title": "Quarterly Risk Report", "slug": "risk-report", "order": 1 }
  }
}
```

## Live URLs
- Index of all dashboards: https://leapfi-masteraccount.github.io/leapfi-dashboards/index.html
- Each dashboard: https://leapfi-masteraccount.github.io/leapfi-dashboards/<slug>.html

## Important: these URLs are PUBLIC
GitHub Pages serves to anyone with the URL. Google Sites embed-by-URL requires that,
because the visitor's browser fetches the dashboard directly. Do not publish anything
that must stay private on a public URL. If a dashboard is sensitive, use a long
unguessable slug (set it in the config) or move hosting to an access-gated host.
