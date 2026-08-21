---
purpose: Agent operating guide for leapfi-dashboards — binds every session to the ai-skills orchestration doctrine and this repo's hard invariants
load_when: Always — read this first, every session in this repo
sources: [.claude/skills (ai-skills submodule — the operative doctrine)]
related:
  - .claude/skills/sop-orchestrator/SKILL.md — orchestration doctrine (Devon Okafor)
  - .claude/skills/sop-pi-lifecycle/SKILL.md — PI program shape
  - .claude/skills/PERSONAS.md — the ONLY roster of record
last_reviewed: 2026-08-20
---

# LeapFI Dashboards — Agent Operating Guide

## Orchestration doctrine is BINDING here, not advisory

Multi-step work in this repo runs under `/sop-orchestrator`
(`.claude/skills/sop-orchestrator/SKILL.md`) and, for PI work,
`/sop-pi-lifecycle`. The personas are doctrine, not recommendations —
unless the user overrides a specific decision in-session.

**Doctrine by path, never by paraphrase.** Quote a rule from the operative
submodule or point at it (`file:line`). A paraphrased rule in a brief or a
doc is how this program shipped a wrong gate verdict from a stale clone.
This file therefore restates nothing — it binds and points:

| Rule | Lives at |
|---|---|
| Conductor doesn't play; dispatch, never "quick fix" | `sop-orchestrator/SKILL.md` (Core principles) |
| 7-part dispatch contract; evidence returns; mutation venue; filesystem allowlists | `sop-orchestrator/dispatch-contract.md` |
| Model@effort rubric (least-capable-accurate; `opus`-class PROHIBITED); escalate-on-2nd-failure | `sop-orchestrator/control-doctrine.md` (rule 3, 4) |
| Sprint sign-off is HOSTILE REVIEW, never a human gate | `sop-orchestrator/dispatch-contract.md:83` |
| Worktree isolation; queues; artifact SDLC; decision Q&A; resume protocol | `sop-orchestrator/execution-sdlc.md` |
| Readiness gate G1–G6 (fail closed) | `sop-orchestrator/readiness-gate.md` |
| New personas: author via `sop-authoring`; roster in ONE place | `sop-authoring/SKILL.md` + `PERSONAS.md` |

Standing session rules agents here break most — each redirects to its owner:
ledger row AT dispatch, never on return → `sop-orchestrator/execution-sdlc.md` ·
author ≠ validator, always → `sop-orchestrator/SKILL.md` + every persona's
"never verifies own work" clause · scan inventory or it didn't happen
(empty = FAILED) → `sop-orchestrator/dispatch-contract.md` · sweep the
CLASS by concept-grep, never named sites or one literal spelling →
`sop-orchestrator/control-doctrine.md` (decomposition) · a persona must be
a REGISTERED agent type, not merely a SKILL file →
`sop-authoring/SKILL.md` (registration checklist) · STOP on a spec gap,
never resolve an ambiguity inline → the implementer SOPs
(`sop-console-implementer`, `sop-backend-implementer`,
`sop-platform-implementer`, `sop-data-implementer`).

## This repo's hard invariants — repo FACTS, each owned by a SOP or persona

1. **`src/leapfi-platform.html` (v1) is READ-ONLY — the D8 invariant.**
   Every publish verifies it byte-identical across revisions.
   `scripts/rename-output.mjs` refuses to overwrite it; do not defeat that.
   Owner: the orchestrator's publish lane (`sop-orchestrator/dispatch-contract.md`,
   mutation venue).
2. **`src/leapfi-platform-v2.html` is a GENERATED artifact.** Never
   hand-edit it; never commit a rebuild on a feature branch (it turns
   every parallel lane into a guaranteed merge conflict — realized
   2026-08-20). It is rebuilt at publish time. **Publish must rebuild
   when source is newer than the committed artifact and verify the byte
   size changed** (rev-74 shipped stale; rev-75 corrected it).
   Owner: `sop-orchestrator/execution-sdlc.md` (artifact SDLC).
3. **`publish.py` does `rmtree(docs/)` + `git add -A` + pushes the
   current branch.** It runs ONLY in an isolated worktree of `main`, with
   the artifact sourced from committed origin state — never in a working
   tree, never from local trees. Owner: the orchestrator MAIN session only
   (`sop-orchestrator/dispatch-contract.md`, mutation venue — live applies
   never dispatch).
4. **Tests: Vitest + RTL + jsdom** (`app/nw-platform-v2/`). A test that is
   collected but SKIPPED is a FAIL, not a pass. New tests are proven
   discriminating: revert the fix in a scratch copy, watch them go red.
   Owner: `sop-console-implementer/SKILL.md` (TDD, proven-executed) +
   `sop-pi-lifecycle/SKILL.md` rule 4.
5. **Commits: NAMED paths only, never `git add -A`** (a `-A` here swept an
   in-flight rewrite into an unrelated commit once, and see rule 3).
   Owner: `sop-orchestrator/dispatch-contract.md` (filesystem scope).
6. **The design-system spec governs shared components.** A change to any
   shared primitive/composite/token/structural invariant is not
   implementable until the spec carries the amendment by its owner
   (`ux-designer` — structure; `brand-steward` — token values; the seam
   is theirs, never an implementer's or orchestrator's).
7. **Skill submodule pin**: bump `.claude/skills` deliberately (one
   commit, named), never as a side effect. Registration files in
   `.claude/agents/` must each point at a SKILL directory that exists at
   the pin. Owner: `sop-authoring/SKILL.md` (registration checklist +
   submodule doctrine).

## Where things are

- App source: `app/nw-platform-v2/` (React 18 + TS strict + Vite
  single-file build). Suite/typecheck: `npx vitest run`, `npx tsc --noEmit`.
- Published site: GitHub Pages from `main:/docs`; revisions are `rev-N`
  tags (forward-only revert: `git checkout rev-<N> -- src docs`, republish).
- Program records (plans, ledgers, decisions): the `leapfi-documentation`
  repo, `08_Programs/` — GitHub is the system of record; a decision that
  lives only in chat does not exist.
