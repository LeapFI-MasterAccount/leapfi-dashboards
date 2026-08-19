# PLAN — NorthWinds Platform Demo Revamp (`nw-platform-demo`)

**Program**: Revise `src/leapfi-platform.html` (NorthWinds CU demo subsite) for a
cleaner, simpler UX organized around a demo script derived from the LeapFI
Platform Thesis — the arc CEO Adam Schlesinger uses to articulate the value
prop in a minimal number of steps.

- **Branch**: `revamp/nw-platform-demo` · **Worktree**: `~/projects/github/leapfi/wt/nw-platform-demo`
- **Base pin**: `main@1c230fe` (Publish rev 63, 2026-08-18)
- **Target**: `src/leapfi-platform.html` (4,511 lines, self-contained SPA — see SURVEY-MAP.md)
- **Source doc**: LeapFI Platform Thesis v14 DRAFT (2026-08-13) — see THESIS-SNAPSHOT.md
- **Orchestrator**: Devon Okafor (sop-orchestrator). GitHub is the system of record.

## Goal (user, 2026-08-18)

> Align with a cleaner simpler UX and the ability to follow a demo script that
> is generated from the thesis document (this is how our CEO Adam explains the
> platform; we want to articulate the value prop in a minimal number of steps).
> CPO/GTM is also working a more specific script on a persona flow.
> Plus: content/data refresh, visual/brand polish, restructure flows.

Design constraint: the demo-script mechanism must be **script-swappable** so
the CPO/GTM persona-flow script can slot in later without rework.

## Queue (RETE order)

| ID | Task | State | Blocked by |
|----|------|-------|-----------|
| T1 | Survey target page (line-anchored map) | DONE | — |
| T2 | Program setup: branch, worktree, thesis snapshot, artifacts | DONE | — |
| T3 | Derive demo script from thesis (draft panel → judges → synthesis) | DISPATCHED | — |
| T4 | Gap analysis: script vs current page (what to add/cut/simplify) | QUEUED | T3, D3 |
| T5 | Revision plan ratified by user (scope of edits, per section) | QUEUED | T4 |
| T6 | Implementation dispatches (worktree-isolated edits, implementer personas) | QUEUED | T5 |
| T7 | Verification: browser walkthrough of script + hostile review of edits | QUEUED | T6 |
| T8 | Publish gate: user-approved `publish.py --push` (goes live on Pages) | QUEUED | T7, D5 |

## Dispatch log

| Dispatch | Task | Mechanism | Evidence |
|----------|------|-----------|----------|
| 2026-08-18 survey | T1 | Workflow `wf_aec9bdf8-53a` (6 agents, 4 range readers + context + synthesis) | SURVEY-MAP.md |
| 2026-08-18 script derivation | T3 | Workflow (3 lens drafts → 2 judges → synthesizer writes DEMO-SCRIPT-DRAFT.md) | run id in LEDGER on completion |

## Notes

- The `leapfi-dashboards` clone at `~/projects/github/leapfi/leapfi-dashboards`
  stays on `main` untouched (it serves the published-baseline browser preview).
  All edits happen in this worktree only.
- Publishing model: edit `src/`, `python3 publish.py` builds `docs/`;
  `--push` goes live on GitHub Pages (T8 is user-gated — outward-facing).
- Editing hazards (from survey): play-name string coupling, `recompute()` id
  coupling, redline→gap→obligation cascade, DEMO_SEED snapshot scope, single
  shared drawer, fixed demo-date fabric. See SURVEY-MAP.md §(d).
