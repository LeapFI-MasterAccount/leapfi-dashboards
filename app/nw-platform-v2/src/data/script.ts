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
 * exactly for `SCRIPT_CEO`.
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
 * AMBIGUITY RESOLVED — `resolveTarget`'s screen-id space: the token grammar
 * (below, ported verbatim from §3's field contract) is broader than the
 * 7 screens this program has actually built (e.g. `studio:register`,
 * `go:reporting`, and the `onside:src:<id>`/`onside:case:<id>` deep-link
 * forms have no dedicated screen file in this worktree). `resolveTarget`
 * parses the full grammar as specified, but only returns a real screen id
 * for tokens this build can actually navigate to — every other
 * grammatically-valid token resolves to `null` (a safe no-op for whichever
 * caller asked), rather than a fabricated destination. This keeps the
 * parser faithful to the full spec'd grammar (so a second script using a
 * token this file already understands needs zero changes here) without
 * inventing navigation this program never built.
 *
 * `persona` field (§3 swap rule 3: "a CPO script may add an optional
 * `persona` field (applied on script load, ignored when absent) —
 * additive, non-breaking for the CEO script"): reserved on `ScriptStep`
 * from the start so a future CPO script costs zero type changes here, not
 * just zero *array*-shape changes. No consumer in this dispatch reads it
 * (`SCRIPT_CEO` never sets it) — out of scope until a persona-flow script
 * actually exists.
 *
 * STOP-item — no executable test run: this worktree's `package.json` (out
 * of this dispatch's ALLOWLIST) has no test runner installed, matching
 * every sibling data/screen file already landed here. Verified via
 * `npx tsc --noEmit` against the whole `src/` tree instead (strict mode,
 * `exactOptionalPropertyTypes`).
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
    title: 'Out of Pilot Purgatory',
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
  if (target.startsWith('onside:src:') || target.startsWith('onside:case:') || target.startsWith('onside:dom-')) {
    // Deep links land on Documents — the screen that owns the in-page
    // "Domain impact" section (design_system_spec.md §5.3's own resolution
    // for the same "no dedicated domain-view screen" gap OnSideDocuments.tsx
    // already documents).
    return 'onside.documents';
  }
  if (target.startsWith('onside:')) return null;

  if (target === 'deck:board') return 'board-deck';

  if (target.startsWith('drawer:')) return null; // optional extension — no screen-level nav target

  return null;
}
