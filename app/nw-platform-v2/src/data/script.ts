/**
 * script — SCRIPT data model (design_system_spec.md §4; demo_script_draft.md
 * §3 "SCRIPT data model (D4 — swappable script spec)")
 *
 * "One script = one JS array; presenter mode reads only the active array. A
 * future CPO persona-flow ships as a second array plus one registry entry —
 * no rework." This module ports that exact shape into a typed React-facing
 * module, plus the one `resolveTarget` helper the field contract names
 * ("target — a navigation token resolved by a single resolveTarget(t)
 * helper that maps onto the page's existing nav functions").
 *
 * AMBIGUITY RESOLVED — `say`/`do` content source: §3's own literal example
 * array leaves `say`/`do` as placeholder ellipses ("…"). demo_script_draft.md
 * has two candidate sources for the real text: §1's one-screen step table
 * (columns literally named "Say in one line" / "Do") and §2's per-step
 * prose (full presenter monologues, several sentences each, plus separate
 * "Do"/"See"/"Surface"/"Gap" blocks). The field contract describes `say` as
 * "the full spoken line" (singular — "line," not "monologue") and `do` as
 * "operator directions, human-readable; presenter mode displays them" next
 * to a `title` capped at "≤32 chars" — all three read as compact,
 * glance-at-a-rail-during-a-live-pitch content, not a paragraph script to
 * read verbatim off a small fixed-bottom widget. §1's own column headers are
 * literally "Say in one line" / "Do," matching that grain exactly, so this
 * file sources `say`/`do` from §1's table, verbatim, not §2's longer prose.
 * STOP-item / flagged for design-authority confirmation if the intent was
 * instead the full §2 monologue text.
 *
 * `id`/`title` values are copied character-for-character from §3's own
 * literal example array (not re-derived) — the spec already names these
 * exactly for `SCRIPT_CEO`. ONE authored correction (RAIL-07): step 5's
 * title carries the ™ — §3's example array itself omits it, but §1's step
 * table (line 37), §2's heading (line 163), and brand_doctrine.md line 59
 * ("Pilot Purgatory™", mandatory brand vocabulary) all carry it, and
 * InvestmentDesign.tsx already uses the ™ form; the doctrine doc is
 * internally inconsistent and the brand-vocabulary sources govern.
 * "Out of Pilot Purgatory™" is 23 chars, inside the ≤32 title cap.
 *
 * AMBIGUITY RESOLVED — `let ACTIVE_SCRIPT` (§3's plain-JS mutable global) in
 * a React shell: the source model's `let ACTIVE_SCRIPT = SCRIPTS.ceo` is a
 * non-reactive engine global; a live-mutated module-level binding doesn't
 * integrate with React's render model (importers cannot even reassign an
 * imported `let` binding from outside this module). This file exports the
 * registry (`SCRIPTS`) and a `DEFAULT_SCRIPT_KEY` instead; the consuming
 * shell (App.tsx) is expected to hold the active-script *selection* as
 * ordinary component state initialized from `DEFAULT_SCRIPT_KEY`, typed as
 * `ScriptKey = keyof typeof SCRIPTS`. This preserves swap rule 1's guarantee
 * exactly: "adding a script is one array + one SCRIPTS entry... no new nav
 * plumbing" — a second script still costs exactly one array literal plus one
 * registry entry; `ScriptKey` widens automatically, and no code path here or
 * in PresenterRail.tsx branches on which script is active.
 *
 * AMBIGUITY RESOLVED — `resolveTarget`'s screen-id space (updated by the
 * T6.7 fix wave; an earlier revision of this header claimed the
 * `onside:src:<id>`/`onside:case:<id>` deep-link forms "have no dedicated
 * screen file in this worktree" — stale since the parity-assembly wave
 * built both destinations): the token grammar (below, ported verbatim from
 * §3's field contract) is still broader than what this build can navigate
 * to (e.g. `studio:register` has no built screen; `go:<mod>` hub tokens
 * other than `go:home` resolve to `null` — some hub landing pages exist now
 * (e.g. Reporting) but no dispatch has ratified hub-token mappings, so the
 * safe no-op stands, flagged). `resolveTarget` parses the full grammar as
 * specified and returns a real screen id exactly where a built destination
 * exists — RAIL-10: `onside:src:<id>` routes to the feed (base onsideShow
 * routes src: to the source page under Sources & connectors, hosted by
 * 'onside.feed' in this build) and `onside:case:<id>` routes to 'cases'
 * (base routes case: to the Cases view) — every other grammatically-valid
 * token resolves to `null` (a safe no-op), never a fabricated or wrong
 * destination.
 *
 * `persona` field (§3 swap rule 3: "a CPO script may add an optional
 * `persona` field (applied on script load, ignored when absent) —
 * additive, non-breaking for the CEO script"): reserved on `ScriptStep`
 * from the start so a future CPO script costs zero type changes here, not
 * just zero *array*-shape changes. No consumer in this dispatch reads it
 * (`SCRIPT_CEO` never sets it) — out of scope until a persona-flow script
 * actually exists.
 *
 * TESTS (stale claim corrected by the T6.7 fix wave — an earlier header
 * revision said no test runner was installed): Vitest is installed; this
 * module is pinned by `src/__tests__/shell/presenter-rail.test.tsx`, plus
 * `npx tsc --noEmit` (strict, `exactOptionalPropertyTypes`).
 */

/** Presenter-HUD step contract (demo_script_draft.md §3 field contract). */
export interface ScriptStep {
  /** Stable slug `<script>-<nn>-<name>`, unique across all scripts. */
  id: string;
  /** Presenter-HUD step label, ≤32 chars. */
  title: string;
  /** The spoken line — see file header for the §1-vs-§2 source resolution. */
  say: string;
  /** Operator directions, human-readable; presenter mode displays them, never executes them. */
  do: string;
  /** Navigation token, grammar per file header / demo_script_draft.md §3. Resolved by `resolveTarget`, never interpreted here. */
  target: string;
  /** Optional CPO-script extension (§3 swap rule 3) — reserved, unused by SCRIPT_CEO. */
  persona?: string;
}

export interface ScriptDef {
  label: string;
  steps: ScriptStep[];
}

/**
 * SCRIPT_CEO — demo_script_draft.md §1 "One-screen step table" ported
 * verbatim (Say-in-one-line / Do columns; ids/titles from §3's own literal
 * example array).
 */
export const SCRIPT_CEO: ScriptStep[] = [
  {
    id: 'ceo-01-home',
    title: 'Day one',
    say: 'The era of the manual back office is ending — NorthWinds already freed $540,000/yr and 3.5 FTEs, straight out of the efficiency ratio.',
    do: 'Open on Home; gesture once down the full sidebar; no clicks.',
    target: 'go:home',
  },
  {
    id: 'ceo-02-feed',
    title: 'The treadmill',
    say: "220 regulatory alerts a day; OnSide's 6:12 AM scan already read and mapped every one — monitor and detect are no longer payroll.",
    do: 'OnSide → Regulatory feed; open one seeded signal.',
    target: 'onside:feed',
  },
  {
    id: 'ceo-03-adopt',
    title: 'Rules made executable',
    say: 'Every GRC tool digitized documents; none made the rules executable — watch one HITL approval close the gap and the obligation.',
    do: 'Open a redline, Adopt, follow the dom- deep link to watch statuses flip.',
    target: 'onside:docs',
  },
  {
    id: 'ceo-04-ask',
    title: 'One answer',
    say: 'Discovery ingested everything — 412 monitored docs, 11 of 12 interviews — so loan officer and examiner now get the same answer, from approved policy.',
    do: 'Studio → Ask; type the seeded auto-loan question; let the answer render.',
    target: 'studio:ask',
  },
  {
    id: 'ceo-05-design',
    // RAIL-07: ™ restored per demo_script_draft.md §1 (line 37) / §2 (line
    // 163) and brand_doctrine.md line 59 — see file header `id`/`title` note.
    title: 'Out of Pilot Purgatory™',
    say: 'Here is the revenue side: raise ambition and the funded portfolio recomputes live against the $450k envelope and 2.5x hurdle.',
    do: 'Studio → Investment Design; drag #amb, nudge #tol; open one play drawer.',
    target: 'studio:design',
  },
  {
    id: 'ceo-06-builtnow',
    title: 'Built now',
    say: 'Sprint 1 is live on this screen; Connect and AllRailz are next — whoever owns the policy layer owns the integration point for 8,400 institutions.',
    do: "Studio → Roadmap; then Connect's Soon splash.",
    target: 'studio:roadmap',
  },
  {
    id: 'ceo-07-board',
    title: 'The ask',
    say: '$4.5M a year of value at adoption on a $180k platform — how many hours did you spend last quarter, and what did any of it earn you?',
    do: 'Open the board deck; end on the economics slide; deliver the ask.',
    target: 'deck:board',
  },
];

/**
 * SCRIPT_EXAMINER — the L12 demo re-script (call-17-demo-flow-nist-riskead-
 * tprm.md; DECISIONS.md D16-D24), authored by Marisol Vance. Proves swap
 * rule 1 for real (script.ts's own header, above): this second script cost
 * exactly one array literal plus one `SCRIPTS` registry entry below — no
 * other export in this file, and no line in `PresenterRail.tsx`, changed.
 *
 * SOURCE: call-17 has no §1 "Say in one line"/"Do" table of its own (that
 * table only exists for the CEO script, `demo_script_draft.md` §1) — its
 * source is prose requirement statements (call-17 "Requirement statement"
 * + `DECISIONS.md` D16-D24). `say`/`do` below are authored fresh at this
 * file's own established grain (one spoken line; short imperative `do`
 * clauses), in the same presenter register `SCRIPT_CEO` already ships —
 * never a longer monologue.
 *
 * ARC: presenter-driven, single fixed sequence, 3 beats (D24; no
 * interaction-mode build). "Risk Lead" in step 2 is Rachel Fischer, CRO —
 * the shell's already-default persona; zero persona-switch beats anywhere
 * (D19, D20).
 *
 * CLICK-PATH FIDELITY — every target/do claim below is walked against the
 * shipped build at this lane's base commit (68f5127 + grammar commit
 * f2e8191). Per-step citations:
 *
 * Step 1 (`onside:overview`, D17): lands on the already-shipped
 * `OnSideOverview.tsx` — KPI strip + all-domain posture grid, the
 * "multiple frameworks and domains" view call-17 asks for (no dedicated
 * NIST screen exists or is needed — NIST is a crosswalk annotation on the
 * AI-gov domain's own `inst` field, `data/onside.ts:87`, not a standalone
 * module). The gap-KPI sub-click (D21) is real and wired:
 * `OnSideOverview.tsx:685` — `KpiNavCard label="Gaps to your targets"
 * ... onOpen={() => onNavigate('onside.documents')}` — a genuine
 * `onside.documents` navigation, not a placeholder. The two example gap
 * figures are read off the live domain data, not invented: `data/onside.ts`
 * tprm `appl: 33, tot: 33, met: 24` (line 106) and aigov `appl: 214,
 * tot: 230, met: 110` (line 88) — both domains this arc's own step 3
 * revisits, so the gap named here pays off at the close (D21).
 *
 * Step 2 (`onside:case:<id>`, D18, D19): `resolveTarget` drops the `<id>`
 * segment at the RAIL-10 seam and lands generically on `'cases'` — the
 * `do` field is therefore the explicit, VERIFIED click call-17 Step 2
 * names ("Cases → open the CRO-routed case at the top of the list"), not a
 * deep link the grammar can't carry. RE-WALKED against the now-shipped L2
 * CRO/Priya routing rule (closing D18's own gap-flag): `data/cases.ts`'s
 * `seedCases()` assigns ids in doc-array order (`irp`=CASE-2026-001,
 * `tprm-program`=002, ..., lines 476-486) and routes every board/exec-tier
 * case to `stage: 'cro'` (lines 552-591, `CASE_TIER`, lines 68-76) —
 * `irp` is tier `'exec'`, so CASE-2026-001 IS one of the CRO-routed cases.
 * `screens/Cases.tsx`'s "Open cases" table is unfiltered by role
 * (`openCases`, line 733) and always sorts ascending by id
 * (`defaultSortColumnId="id"`, line 825; ascending is `DataTable.tsx`'s own
 * un-set default, line 462) — so CASE-2026-001 renders as literally the
 * first row, and it is CRO-routed: the do-field's claim holds against the
 * shipped build. Target below names that real, verified id explicitly.
 * Rachel Fischer is `USERS[0]`/`CURRENT`, roleKey `'cro'`
 * (`data/studio.ts:37`) and the shell's already-default persona
 * (`App.tsx`, "PERSONA/USER-SWITCHER WIRING" note) — no switch beat.
 *
 * Step 3 (`onside:dom-tprm`, D16, D23): resolves via the existing RAIL-10
 * `dom-` rule (`target.startsWith('onside:dom-')`, this file, the branch
 * above) onto `'onside.documents'`. CORRECTION found during this walk,
 * disclosed rather than silently routed around: `OBL` (`data/onside.ts:311`)
 * — the source `OnSideDocuments.tsx`'s "Domain impact" section iterates
 * (line 1047) — has ONLY `tprm` and `mrm` keys (the two `deep: true`
 * domains); AI-gov has no obligation register there, so D23's "same close
 * beat...one step, two names" cannot mean a single-screen reveal — no such
 * screen ships. The real, shipped AI-gov "flagship" content instead lives
 * on `OnSideOverview.tsx`'s Domains accordion (`views/DomainsAccordion.tsx`,
 * reachable via Sidebar's already-wired `'onside.overview'` child,
 * `Sidebar.tsx:300`): clicking the "AI Governance" domain-posture card
 * (`OnSideOverview.tsx:604-612`, `openDomain`) expands its accordion row,
 * which — since `aigov` is absent from `OBL` — renders the `DOM_OPEN`
 * "Top open items" branch (`DomainsAccordion.tsx:428-441`, real content:
 * `data/onside.ts:372-375`, the IRP-escalation/governance-charter/"104 of
 * 214 controls" items) plus the domain's own footer line, which carries
 * the literal ratified vocabulary — `data/onside.ts:87`'s `inst` field,
 * "CRI FS AI RMF (flagship framework · 230 controls)" — plus two SEPARATE
 * rendered figures, never one composite: `DomainsAccordion.tsx:388` renders
 * "110 of 214 obligations met at required maturity" and
 * `DomainsAccordion.tsx:446` renders "214 of 230 obligations in scope · 110
 * at required maturity" (HR-ARC-05 fix wave correction — no rendered string
 * anywhere pairs 110 directly with 230; the `do` fields below name exactly
 * these two real figures, not the invented composite). This keeps D23's
 * substance (one
 * close beat, TPRM = full deep-dive register, AI-gov = a lighter,
 * real-content callout, not a second parallel deep-dive) while being
 * honest that it spans two already-visited screens via one real, existing
 * click (Sidebar), not an invented same-page reveal — flagged here for the
 * owning authority (Marisol Vance's own prior D23 ruling) in case the
 * one-screen framing was load-bearing for a reason this walk doesn't see;
 * not silently resolved as an invented screen.
 */
export const SCRIPT_EXAMINER: ScriptStep[] = [
  {
    id: 'examiner-01-overview',
    title: 'Full posture, one glance',
    say: 'Every framework, every regulator, one posture — judged against the targets we set, gaps named out loud instead of buried in a binder.',
    do: "OnSide → Overview; scan the domain-posture grid across every framework and body; click 'Gaps to your targets' in the KPI strip and name one real gap on record — TPRM 24 of 33 obligations met, or AI-gov 110 of 214 obligations met (214 of 230 in scope).",
    target: 'onside:overview',
  },
  {
    id: 'examiner-02-risklead',
    title: "The Risk Lead's queue",
    say: "Rachel, the CRO, didn't have to go looking — the system already routed this to her queue and logged who sent it, and why.",
    do: 'Cases → open the CRO-routed case at the top of the list.',
    target: 'onside:case:CASE-2026-001',
  },
  {
    id: 'examiner-03-tprm',
    title: 'TPRM deep-dive, AI-gov flagship',
    say: 'Third-party risk gets the full obligation register, gaps and all — and right beside it, the flagship AI-governance framework, judged the identical way.',
    do: "OnSide → Documents → Domain impact; open Third-Party Risk Management's obligation register (the deep-dive). Then Sidebar → OnSide → Overview → click 'AI Governance' to expand its flagship-framework callout (110 of 214 obligations met; 214 of 230 in scope).",
    target: 'onside:dom-tprm',
  },
];

export const SCRIPTS = {
  ceo: { label: 'CEO — NorthWinds day one', steps: SCRIPT_CEO },
  examiner: { label: 'Examiner — NIST posture · Risk Lead · TPRM/AI-gov', steps: SCRIPT_EXAMINER },
  // future: cpo: { label: 'CPO — persona flow', steps: SCRIPT_CPO } — swap
  // rule 1 (§3): this is the entire cost of a second script, now proven
  // twice over (examiner, above, was the first proof). No other export in
  // this file, and no line in PresenterRail.tsx, changes.
} satisfies Record<string, ScriptDef>;

export type ScriptKey = keyof typeof SCRIPTS;

/**
 * Consumer (App.tsx) seeds its own active-script state from this. See file
 * header "let ACTIVE_SCRIPT" note.
 *
 * HR-ARC-01 (hostile-review fix wave): the finalized, sign-off-ratified demo
 * arc IS the presenter-driven NIST-posture / Risk-Lead / TPRM-AI-gov walk
 * (DECISIONS.md D16-D24, closing all ten of Marisol Vance's
 * q4-narrative-questions.md items) — D24 in particular rules the format
 * "presenter-driven, decisively" and names Dan or Josh as the presenter for
 * exactly this arc. `SCRIPT_EXAMINER` is that arc; shipping it means this
 * key must select it, not `SCRIPT_CEO`. `SCRIPT_CEO` stays fully live in the
 * `SCRIPTS` registry (swap rule 1 — "one array + one registry entry, no
 * rework") for a future presenter who wants the original NorthWinds walk;
 * only the ACTIVE selection changed, never the registry shape.
 */
export const DEFAULT_SCRIPT_KEY: ScriptKey = 'examiner';

/** Screen ids this build can actually resolve a script target onto (see file header). */
export type ScriptTargetId =
  | 'home'
  | 'onside.feed'
  | 'onside.documents'
  | 'studio.ask'
  | 'studio.investment-design'
  | 'studio.roadmap'
  | 'cases' // RAIL-10: onside:case:<id> deep links land on the built Cases screen
  | 'onside.overview' // D17: onside:overview → the already-shipped OnSideOverview screen
  | 'board-deck';

/**
 * Token grammar (demo_script_draft.md §3 field contract, ported verbatim):
 *
 *   go:<mod>        → go(mod) — home / reporting / onside / studio / connect / allrailz / vantage / settings
 *   studio:<view>    → studioShow — ask / design / register / roadmap
 *   onside:<view>    → onsideShow — feed / docs, incl. deep links onside:src:<id> / onside:case:<id> / onside:dom-<id>
 *   deck:board       → boardDeck()
 *   drawer:<kind>:<id> — optional extension (kind ∈ signal / play / doc)
 *
 * Returns `null` for any grammatically-valid token this program has no
 * built screen for (see file header) — callers treat `null` as a no-op,
 * never a crash or a fabricated destination.
 */
export function resolveTarget(target: string): ScriptTargetId | null {
  if (target === 'go:home') return 'home';
  if (target.startsWith('go:')) return null; // reporting/onside/studio/connect/allrailz/vantage/settings hubs — no single-screen destination in this 7-screen build

  if (target === 'studio:ask') return 'studio.ask';
  if (target === 'studio:design') return 'studio.investment-design';
  if (target === 'studio:roadmap') return 'studio.roadmap';
  if (target.startsWith('studio:')) return null; // e.g. studio:register — no built screen

  if (target === 'onside:feed') return 'onside.feed';
  if (target === 'onside:docs') return 'onside.documents';
  // Deep links (RAIL-10): route to the screens the base onsideShow routes
  // them to — src: → the feed's sources surface (base 3021–3046 routes src:
  // to osSourcePage under Sources & connectors; 'onside.feed' hosts
  // RegulatoryFeedSources in this build) and case: → the Cases view
  // ('cases', a first-class screen since the parity-assembly wave). The
  // <id> segment is dropped at this seam: the shell's nav is screen-level
  // (`navigateToScreen(id)`), so the token lands on the correct SCREEN but
  // not the specific source/case page — carrying the id through is flagged
  // follow-up shell wiring; landing on the wrong screen entirely (the old
  // blanket 'onside.documents' mapping) was the RAIL-10 defect. Only dom-
  // keeps the Documents landing — design_system_spec.md §5.3's own
  // resolution for what THIS RAIL-10 rule was written to reach.
  // HR-ARC-05 (hostile-review fix wave) CORRECTION: this branch's own prior
  // comment called Documents "the genuinely missing domain-view screen" —
  // that was already false when written. `screens/TprmDomain.tsx` (a real,
  // dedicated, purpose-built TPRM domain screen — Sidebar's 8th top-level
  // entry, DECISIONS.md D3) shipped 2h14m before this file's `examiner`
  // script was authored (commit 59154a3 vs 0d84e7b), so no domain-view
  // screen was "missing" at authoring time. `onside:dom-tprm` still resolves
  // here to `onside.documents` because DECISIONS.md D16 deliberately ruled
  // that exact target ("already-built real domain data... never a new
  // locked SoonSplash placeholder," explicitly reusing D3's TPRM
  // content-depth grounding) — a considered choice this rule implements
  // faithfully, not a staleness bug. Whether D16's venue ruling itself
  // should now point at `TprmDomain.tsx` instead, given that screen exists,
  // is a question for D16's owning authority (Marisol Vance) to re-rule, not
  // this implementer — flagged in this dispatch's `stops`, not resolved
  // here.
  if (target.startsWith('onside:src:')) return 'onside.feed';
  if (target.startsWith('onside:case:')) return 'cases';
  if (target.startsWith('onside:dom-')) return 'onside.documents';
  // D17: onside:overview → the already-shipped OnSideOverview screen (its
  // own region map — KPI strip + all-domain posture grid — IS the
  // "at-a-glance view of multiple frameworks and domains" call-17 asks for;
  // no dedicated NIST screen needed). RAIL-10-style: one additive branch
  // resolving a grammatically-valid onside:<view> token onto a real, built
  // screen id, nothing fabricated.
  if (target === 'onside:overview') return 'onside.overview';
  if (target.startsWith('onside:')) return null;

  if (target === 'deck:board') return 'board-deck';

  if (target.startsWith('drawer:')) return null; // optional extension — no screen-level nav target

  return null;
}
