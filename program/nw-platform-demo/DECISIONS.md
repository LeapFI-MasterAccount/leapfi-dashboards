# Decision log — nw-platform-demo

| ID | Decision | Status | Answer / owner |
|----|----------|--------|----------------|
| D1 | Revision scope | DECIDED 2026-08-18 | Cleaner/simpler UX + demo-script-driven flow derived from the thesis (CEO articulation, minimal steps) + content/data refresh + visual/brand polish + restructure flows. (User, via AskUserQuestion.) |
| D2 | Thesis source document | DECIDED 2026-08-18 | Google Doc `1Ba3xtEVvbdeSDJJZuiaoiB5Xn_tddyX1` — "LeapFI Platform Thesis & Business Plan", v14 DRAFT, 2026-08-13. Snapshot committed as THESIS-SNAPSHOT.md (stale-pin rule: re-snapshot if the doc revs before T6 completes). |
| D3 | Demo-script mechanism in the page | OPEN | Asked 2026-08-18: restructure IA around the script, add in-page presenter mode, both, or script-doc only. |
| D4 | CPO/GTM persona-flow script integration | OPEN — owner: CPO/GTM | Script still being written. Constraint adopted now: step data model must be swappable (second script array loads without rework). Revisit when the script lands. |
| D5 | Publish gate | OPEN | `publish.py --push` puts the revised page live on GitHub Pages (public URL, Google Sites embeds). Requires explicit user approval after T7 verification. |
