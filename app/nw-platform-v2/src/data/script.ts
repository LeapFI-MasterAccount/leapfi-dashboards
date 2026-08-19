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

export const SCRIPTS = {
  ceo: { label: 'CEO — NorthWinds day one', steps: SCRIPT_CEO },
  // future: cpo: { label: 'CPO — persona flow', steps: SCRIPT_CPO } — swap
  // rule 1 (§3): this is the entire cost of a second script. No other
  // export in this file, and no line in PresenterRail.tsx, changes.
} satisfies Record<string, ScriptDef>;

export type ScriptKey = keyof typeof SCRIPTS;

/** Consumer (App.tsx) seeds its own active-script state from this. See file header "let ACTIVE_SCRIPT" note. */
export const DEFAULT_SCRIPT_KEY: ScriptKey = 'ceo';

/** Screen ids this build can actually resolve a script target onto (see file header). */
export type ScriptTargetId =
  | 'home'
  | 'onside.feed'
  | 'onside.documents'
  | 'studio.ask'
  | 'studio.investment-design'
  | 'studio.roadmap'
  | 'cases' // RAIL-10: onside:case:<id> deep links land on the built Cases screen
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
  // resolution for the genuinely missing domain-view screen (Documents owns
  // the in-page "Domain impact" section).
  if (target.startsWith('onside:src:')) return 'onside.feed';
  if (target.startsWith('onside:case:')) return 'cases';
  if (target.startsWith('onside:dom-')) return 'onside.documents';
  if (target.startsWith('onside:')) return null;

  if (target === 'deck:board') return 'board-deck';

  if (target.startsWith('drawer:')) return null; // optional extension — no screen-level nav target

  return null;
}
