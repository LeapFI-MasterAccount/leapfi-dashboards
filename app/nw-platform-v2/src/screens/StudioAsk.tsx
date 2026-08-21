/**
 * StudioAsk — the agent-chat screen (design_system_spec.md Section 2.9.8-2.9.13,
 * amendment A20, PI2-D47). REBUILT from the pre-A20 ChatHero-hosted screen
 * (git history carries that anatomy; this header describes the new one).
 *
 * PI2-D47 (user ruling, final): "the Ask screen becomes an AGENT CHAT —
 * chat bar at the TOP, the rest of the screen a DYNAMIC response canvas
 * rendering per question type." The KPI-tile + chips + form hybrid is
 * RETIRED. No ChatHero (C10) call site remains on this screen; this
 * screen's own local Drawer/AskChatPanel mount and its "Ask Studio"
 * utility-corner trigger are retired in the same edit (Section 2.9.12) — "the
 * screen IS the agent," a second, smaller instance of the same concept
 * layered on top of itself is redundant, not merely low-priority.
 *
 * Region map (Section 2.9.8, replaces Section 5.4's pre-A20 map in full): Topbar
 * (shell) → page title ("Studio · Ask") → top chat bar (suggestion Chips
 * row → Input + "Ask" Button row, screen-local composition of Chip P5/
 * Input P6/Button P2 — NOT a ChatHero mount, Section 2.9.8's own "why the chat
 * bar is not a ChatHero mount" rationale) → full-height response canvas
 * (below the chat bar) — one of four typed layouts, or NoMatch/Empty
 * (Section 2.9.9) — → the existing scope-chip / ChatIntakeWizard slot, now
 * beneath the canvas instead of beneath ChatHero (Section 2.9.8, "continues to
 * mount in its existing slot").
 *
 * State machine (Section 2.9.8): reuses ChatHero's own six-state vocabulary,
 * unmodified in name/meaning, now driving the canvas instead of a bubble
 * list — Idle → Typing → Submitting (Button `loading`) → AnswerRendering →
 * AnswerComplete; NoMatch unchanged in meaning. Typing leaves the canvas
 * untouched (the canvas keeps showing the PRIOR turn, or Empty); Submitting/
 * AnswerRendering show a loading placeholder, never stale prior content;
 * the canvas shows exactly the latest turn, never an accumulating list — a
 * new Ask replaces `currentTurn` wholesale (AC-A20-4).
 *
 * TWO DISTINCT ANSWER SOURCES feed the canvas, both cited in Section 2.9.8:
 *   1. The SCRIPTED content schema (Section 2.9.4/2.9.10) — `entries` (default
 *      `STUDIO_CHAT_MODULE_CONFIG.entries`, the exact-match contract Section
 *      2.9.4 states: case-insensitive/trimmed, no fuzzy matching). A match's
 *      `response` field (Section 2.9.10) selects one of the four typed canvas
 *      layouts (Section 2.9.9); absence renders 'instructional'.
 *   2. StudioAsk's OWN pre-existing engine-driven flows — `matchSeed`/
 *      `matchCopilotQA` (the seeded auto-loan matching + `COPILOT_QA`),
 *      the "Add to the opportunity register" offer, the post-accept
 *      cross-nav offers, and `ChatIntakeWizard` — "categorically
 *      different from the scripted content this amendment's response-type
 *      vocabulary governs" (Section 2.9.8, restating Section 2.9.6) — PORTED FORWARD
 *      UNCHANGED IN BEHAVIOR, relocated in RENDERING SURFACE ONLY. Tried
 *      only when the scripted entries do not match (the scripted content
 *      schema is this screen's newer, narrower, curated vocabulary; the
 *      engine is StudioAsk's own long-standing fallback, unchanged in
 *      matching order/precedence from before this amendment — neither the
 *      ruling nor Section 2.9.4 states an order when both could apply, and the
 *      scripted set is authored specifically for this screen's own
 *      question inventory, so it is checked first).
 *
 * IMPLEMENTER JUDGMENT (documented per this codebase's own established
 * "AMBIGUITY RESOLVED" convention — ChatHero.tsx/StatCard.tsx/
 * InvestmentDesign.tsx headers — not a silent resolution of a spec
 * conflict; each choice below is a mechanical rendering-surface adaptation
 * the ruling explicitly authorizes in principle without dictating the
 * exact literal wiring):
 *   - The legacy generic `COPILOT_QA` answer (citations, no register
 *     tie-in) renders via the `document` layout shape: prose + an
 *     Artifacts list built from its `citations` — EXACTLY what Section 2.9.9(a)
 *     itself says: "This is StudioAsk's own already-shipped 'Sources'
 *     panel..., generalized from 'the seeded policy answer's citations' to
 *     'any document-typed entry's deepLinks' — retained, not rebuilt."
 *     Each citation string still navigates to OnSide · Documents via
 *     `onNavigate` (unchanged target/behavior — the base data has no
 *     per-citation doc id to deep-link more specifically than that).
 *   - The seeded auto-loan answer renders via the `opportunity-status`
 *     layout shape — EXACTLY what Section 2.9.8 itself says: "Their new home is
 *     the response canvas's opportunity-status layout's own actions slot."
 *     Pre-Add, the DrawerContent fields/StatCard are built from the
 *     locally-computed `buildAutoLoanOpportunity()` record (the play is
 *     not yet a live OPPS/DETAIL row); its `actions` slot carries "Add to
 *     the opportunity register" / "See the governance work in OnSide"
 *     (the same two offers, base 4424/4426, now living in DrawerContent's
 *     actions row instead of ChatHero's retired chip/button-row chrome).
 *     Once added, the SAME turn re-resolves the play LIVE from `OPPS` (the
 *     `useDemoStore()` subscription re-renders this screen on the write)
 *     and its `actions` slot switches to "Detail →" (the same nav-payload
 *     contract Section 2.9.9(c) states for a scripted entry) plus "See the
 *     scope change in OnSide" — the base's own two post-accept offers
 *     (4411 region) minus "See it in the register": that offer's own
 *     target (a same-screen scroll into StudioAsk's local register
 *     section) no longer exists on this screen after Section 2.9.11 relocates
 *     the register to Investment Design (AC-A20-9) — "Detail →" already
 *     opens that exact play on that exact screen, so a second button
 *     pointed at the same destination would be a redundant control, not a
 *     ported one. The turn's prose switches from the grounding answer to
 *     the base's own `sayAccepted()` confirmation line once added (the
 *     content the user was always shown next; single-turn canvas
 *     discipline replaces the SAME turn's content instead of appending a
 *     new bubble, Section 2.9.8's own "no accumulating scroll" rule).
 *   - The base route() greeting/short-query guard (`HELP_LINE`) renders
 *     via the `instructional` layout shape (a how-to line, no citations —
 *     exactly what Section 2.9.9(b) describes; no deepLinks is fully valid for
 *     `instructional`, unlike the required-non-empty `document` case).
 *   - No-match (neither the scripted entries nor the engine match) renders
 *     the `NoMatch` layout (Section 2.9.9, unchanged meaning) using this module's
 *     own `defaultNoMatchMessage` — the SAME `defaultNoMatchMessage`-class
 *     content ChatHero's own no-match state rendered pre-A20.
 *
 * Register relocation (Section 2.9.11, AC-A20-9): the opportunity register
 * `DataTable` — and this screen's own live subscription driving it — is
 * REMOVED from this screen entirely; it now lives on
 * `InvestmentDesign.tsx` as a new, permanently-visible section. This
 * screen renders zero `<DataTable>` instances.
 *
 * Focus management (Section 2.9.9, Core Principle 6): the canvas is not an
 * overlay — no focus trap, no forced focus move when a turn completes;
 * its root region carries `aria-live="polite"` unconditionally (Section 2.9.9's
 * "canvas's own root region," the same "answer region is a live region"
 * baseline ChatHero already shipped) so a rendered answer is announced
 * without moving keyboard focus off the Input (AC-A20-8).
 *
 * Matching engine (STU-03, ported verbatim from the pre-A20 file — see
 * git history for the base-line citations this header previously carried
 * in full): `matchCopilotQA`/`matchSeed`/`isGreetingOrFragment` are
 * byte-identical to the pre-A20 implementation; only their call site (the
 * canvas, not ChatHero's `messages` prop) changed.
 *
 * Tests: src/__tests__/studio/studio-ask-a20-agent-canvas.test.tsx (new,
 * this amendment) executes the Section 2.9.13 falsifiable acceptance criteria
 * plus the ported engine-content assertions, adapted to the new anatomy.
 */
import { useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { SidebarProps } from '../components/Sidebar';
import { DrawerContent } from '../components/DrawerContent';
import type { DrawerContentAction, DrawerContentField, DrawerContentTag } from '../components/DrawerContent';
import { StatCard } from '../components/StatCard';
import { Label } from '../components/primitives/Label';
import { Chip } from '../components/primitives/Chip';
import { Button } from '../components/primitives/Button';
import { Input } from '../components/primitives/Input';
import { Icon } from '../components/primitives/Icon';
import { Spinner } from '../components/primitives/Spinner';
import { ChatIntakeWizard } from '../views/ChatIntakeWizard';
import type { ChatIntakeWizardHandle } from '../views/ChatIntakeWizard';
import { COPILOT_QA, AUTO_LOAN_OPPORTUNITY, AUTO_LOAN_DETAIL } from '../data/misc';
import { OPPS, DETAIL, CTRL, CTRLDOM, domainsFor } from '../data/studio';
import type { OppHorizon, OppRisk } from '../data/studio';
import { DOCLIB } from '../data/doclib';
import { fmt } from '../engine/plan';
import type { PlanOpportunity } from '../engine/plan';
import { acceptOpportunity, adoptionScaledValue, getLiveLevers, useDemoStore } from '../state/demoStore';
import { STUDIO_CHAT_MODULE_CONFIG } from '../data/askChatModuleConfig';
import type { ChatEntry, ChatEntryDeepLink } from '../data/chatTypes';
import { DOMAINS } from '../data/onside';
import type { OnsideDomain } from '../data/onside';
import { DOMAIN_STATUS_LABEL, DOMAIN_STATUS_VARIANT, statusOf } from '../views/DomainsAccordion';
import type { DeepLinkScreenProps } from '../App';
import { PANEL_STYLE } from '../theme/panelStyle';

interface SeedAnswer {
  text: string;
  citations: string[];
  opportunityMatch: boolean;
}

/** Structurally identical to the composite-C10 chat-bubble shape
 * (`{ id, role, text }`, plus an unused-here optional `deepLinks`) that
 * composite's own module exports — declared locally here rather than
 * imported so AC-A20-1's grep (this screen keeps zero references to that
 * composite's module, not even a type-only import) holds; `ChatIntakeWizard.
 * tsx`'s own `onTranscriptChange` prop is typed against that real type, and
 * TS accepts this local alias there by structural compatibility, no
 * adapter needed. */
interface IntakeTranscriptMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

/** See file header "inline-tag stripping" (ported verbatim). */
function stripInlineTags(input: string): string {
  return input.replace(/<\/?(b|strong|em|br)\s*\/?>/gi, '');
}

/** Real, already-in-corpus citations for the indirect-auto-lending seed —
 * not fabricated: `mrm-val-indirect`/`mrm-cs-indirect` are the existing
 * validation + conceptual-soundness documents for the indirect auto
 * pricing model already in `data/doclib.ts`; `aa-procedure`/`fl-review`
 * cover the adverse-action and fair-lending review gates
 * `AUTO_LOAN_OPPORTUNITY.g` names. */
const AUTO_LOAN_CITATION_DOC_IDS = ['mrm-val-indirect', 'mrm-cs-indirect', 'aa-procedure', 'fl-review'] as const;

/** Step 4's own seeded question (demo_script_draft.md Section 2 Step 4 `say` line:
 * "what are our rules on indirect auto lending?"). */
const SEEDED_AUTO_LOAN_QUESTION = 'What are our rules on indirect auto lending?';

/**
 * Base autoLoanAnswer content (leapfi-platform.html:4417-4424) as plain
 * text: the four grounding rows — You have / Missing / OnSide flags (with
 * the live control scores, verbatim from the base string) / Envelope —
 * behind the "Grounded in NorthWinds' own state, never a generic
 * checklist" lead (STU-08). The Envelope value is lever-scaled
 * (`fmt(520000*L.eff)` "at your adoption setting", base 4423; STU-07).
 */
function buildAutoLoanAnswer(): SeedAnswer {
  const citations = AUTO_LOAN_CITATION_DOC_IDS.map((id) => DOCLIB[id]?.t).filter((t): t is string => Boolean(t)).map(stripInlineTags);
  const text =
    'That’s exactly the kind of question the platform is built for. Grounded in NorthWinds’ own state, never a generic checklist: ' +
    'You have: Core + LOS integration patterns from the loan-document summarization play · the member data model in the unified data foundation (funded) · adverse-action templates already governed in OnSide. ' +
    'Missing: Real-time decisioning infrastructure · dealer/indirect data feeds · explainability evidence per decision · a model-validation slot with A. Kaur’s team. ' +
    'OnSide flags: Fair Lending 68% · open · Adverse Action 55% · open · Model Risk 70% · open. This build triggers disparate-impact testing, reason-code accuracy work, and MRM-08 vendor-validation evidence before production. ' +
    `Envelope: ≈ ${fmt(AUTO_LOAN_OPPORTUNITY.cost)} build · ≈ ${fmt(adoptionScaledValue(AUTO_LOAN_OPPORTUNITY.val))}/yr at your adoption setting · priced by the same model Studio uses for every play.`;
  return { text, citations, opportunityMatch: true };
}

/**
 * Seeded policy Q&A matcher (STU-03). Fast path: exact question text or
 * the full chip-label phrase appearing in the query (the suggestion Chips
 * fill the Input with that label). Then the base `cpMatch` word-overlap
 * algorithm VERBATIM (leapfi-platform.html:1799-1808): count distinct
 * words of length >4 from each seeded question appearing in the query;
 * best match wins only with ≥2 overlaps. Short fragments ("in", "an")
 * can never match.
 */
function matchCopilotQA(query: string): SeedAnswer | null {
  const q = query.trim().toLowerCase();
  for (const item of COPILOT_QA) {
    const phrase = item.chips.toLowerCase();
    if (q === item.q.toLowerCase() || q.includes(phrase)) {
      return { text: stripInlineTags(item.a), citations: item.src, opportunityMatch: false };
    }
  }
  let best: (typeof COPILOT_QA)[number] | null = null;
  let bestC = 0;
  for (const item of COPILOT_QA) {
    let c = 0;
    const seen = new Set<string>();
    for (const raw of item.q.toLowerCase().split(' ')) {
      const w = raw.replace(/[^a-z0-9-]/g, '');
      if (w.length > 4 && !seen.has(w) && q.includes(w)) {
        seen.add(w);
        c += 1;
      }
    }
    if (c > bestC) {
      bestC = c;
      best = item;
    }
  }
  if (best !== null && bestC >= 2) {
    return { text: stripInlineTags(best.a), citations: best.src, opportunityMatch: false };
  }
  return null;
}

/** Base route() seed probes: 'auto loan' / 'loan origination' (4448) plus
 * the Step-4 seeded phrasing ('indirect' + 'lend' together — "what are
 * our rules on indirect auto lending?"). Never 'indirect' alone (STU-03). */
function matchSeed(query: string): SeedAnswer | null {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return null;
  if (q.includes('auto loan') || q.includes('loan origination') || (q.includes('indirect') && q.includes('lend'))) {
    return buildAutoLoanAnswer();
  }
  return matchCopilotQA(query);
}

/** Base route() greeting/short-query guard (leapfi-platform.html:4471-4476,
 * regex verbatim): greetings and <3-word fragments get the help line, not
 * a wrong answer and not a scope offer (STU-03). */
function isGreetingOrFragment(query: string): boolean {
  const ql = query.trim().toLowerCase();
  const wc = ql.split(/\s+/).filter((w) => w.length > 0).length;
  const greeting = /^(hi|hello|hey|thanks|thank you|good (morning|afternoon|evening)|ok|okay|yo|sup|test)\b/.test(ql);
  return greeting || wc < 3;
}

/** Base help line for the guard branch (leapfi-platform.html:4473, verbatim). */
const HELP_LINE =
  'I can do three things from this box: answer from your approved policies with citations, price a known idea from the catalog, or scope something new into the register. What would you like?';

/** Exact-match content-schema matcher (design_system_spec.md Section 2.9.4):
 * case-insensitive, trimmed, exact match only — no partial/fuzzy/word-
 * overlap matching (a deliberately narrower contract than `matchSeed`
 * above; tried first — see file header). */
function matchScriptedEntry(entries: ChatEntry[], query: string): ChatEntry | null {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return null;
  return entries.find((entry) => entry.question.trim().toLowerCase() === q) ?? null;
}

/** Mirrors `data/studio.ts`'s own (unexported) `gateCalc` exactly —
 * duplicated locally since it is not exported. Returns the base
 * addAutoLoan record (4427) as a plan-ready opportunity (`disc: true`). */
function buildAutoLoanOpportunity(): PlanOpportunity {
  const gates = AUTO_LOAN_OPPORTUNITY.g;
  const minGate = Math.min(...gates.map((g) => CTRL[g] ?? 0));
  const weakGate = [...gates].sort((a, b) => (CTRL[a] ?? 0) - (CTRL[b] ?? 0))[0] ?? gates[0] ?? '';
  return {
    n: AUTO_LOAN_OPPORTUNITY.n,
    c: AUTO_LOAN_OPPORTUNITY.c,
    cost: AUTO_LOAN_OPPORTUNITY.cost,
    val: AUTO_LOAN_OPPORTUNITY.val,
    h: AUTO_LOAN_OPPORTUNITY.h as OppHorizon,
    r: AUTO_LOAN_OPPORTUNITY.r as OppRisk,
    g: [...AUTO_LOAN_OPPORTUNITY.g],
    minGate,
    weakGate,
    disc: true,
  };
}

/** Mirrors route()'s own scope-chip capitalization (`q.charAt(0).toUpperCase()+q.slice(1)`, leapfi-platform.html:4470 and 4467-4468). */
function capitalizeFirst(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** ASK_SUBMIT_DELAY_MS / ASK_RENDER_DELAY_MS: implementer judgment calls
 * (design_system_spec.md Section 1.4 carries no timing values) — long enough that
 * the chat bar's `Submitting`/`AnswerRendering` states are visibly real
 * waits, matching Core Principle 1's discipline against instant,
 * indistinguishable-from-fake state flips. */
const ASK_SUBMIT_DELAY_MS = 350;
const ASK_RENDER_DELAY_MS = 450;

// `position: 'relative'` makes this scrolling region the containing
// block for any absolutely-positioned descendant (sr-only spans today,
// third-party overlays tomorrow) so an unpinned absolute box resolves
// inside the scroll context instead of against the document root —
// see the invariant note on DataTable.tsx's `srOnlyStyle`.
const MAIN_STYLE: CSSProperties = {
  flex: '1 1 auto',
  minWidth: 0,
  overflowY: 'auto',
  position: 'relative',
  boxSizing: 'border-box',
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
};
const TITLE_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' };
const HEADER_ROW_STYLE: CSSProperties = { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' };
/** Section 2.9.8 — screen-local chat-bar composition (Chip P5/Input P6/Button P2),
 * NOT a ChatHero mount. Panel-seated, matching this screen's pre-A20 chat
 * region treatment. */
export const CHAT_PANEL_STYLE: CSSProperties = {
  ...PANEL_STYLE,
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};
const SUGGESTION_ROW_STYLE: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' };
const ASK_ROW_STYLE: CSSProperties = { display: 'flex', gap: '0.625rem', alignItems: 'flex-end' };
const SCOPE_CHIP_ROW_STYLE: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' };
const INTAKE_SLOT_STYLE: CSSProperties = { paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.875rem' };
/** ChatIntakeWizard.tsx's own file header: "the persistent transcript
 * (`messages`) no longer renders here — it's handed to the composing
 * screen via `onTranscriptChange`... rendered inside ChatHero's own
 * bounded, auto-scrolling `<ul>`." ChatHero no longer mounts on this
 * screen (Section 2.9.8), so this screen renders that same bounded list itself,
 * screen-local — reusing ChatHero's own bubble/list treatment verbatim
 * (duplicated locally, the same per-file convention `ChatIntakeWizard.tsx`
 * already uses for its own transient "Thinking…" bubble, cited in its file
 * header as "REUSE, not a new pattern"), not a new pattern. */
const INTAKE_TRANSCRIPT_LIST_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.625rem',
  margin: 0,
  padding: 0,
  listStyle: 'none',
  maxHeight: '20rem',
  overflowY: 'auto',
};
function intakeBubbleStyle(role: IntakeTranscriptMessage['role']): CSSProperties {
  return {
    alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
    maxWidth: '80%',
    background: role === 'user' ? 'var(--accent)' : 'var(--panel)',
    color: role === 'user' ? 'var(--bg)' : 'var(--ink)',
    border: role === 'user' ? 'none' : '1px solid var(--border)',
    borderRadius: 'var(--radius-sm, 10px)',
    padding: '0.625rem 0.875rem',
    fontSize: '0.875rem',
    lineHeight: 1.5,
  };
}
const CANVAS_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1rem', flex: '1 1 auto' };
const ARTIFACTS_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const ARTIFACTS_LIST_STYLE: CSSProperties = { margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.375rem' };
const SECTION_HEADING_STYLE: CSSProperties = { margin: 0, font: 'inherit' };
const PROSE_STYLE: CSSProperties = { margin: 0, fontSize: '0.9375rem', color: 'var(--ink)', lineHeight: 1.6 };
const LOADING_ROW_STYLE: CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ink2)' };
const DRAWER_SECTION_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.75rem' };
const TURN_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.875rem' };

const SUGGESTIONS_BASE: string[] = [...COPILOT_QA.map((item) => item.chips), SEEDED_AUTO_LOAN_QUESTION];

/** Section 2.9.9(a)/(b) — the SAME inline-navigating-link treatment
 * (`affordance_standard.md` Section 3.2) already shipped at
 * `DrawerContentFieldValue`/`ChatMessageDeepLinkButton`, reused here as a
 * THIRD call site (not a new pattern): accent text, no button chrome,
 * trailing `arrow-right` Icon, underline on hover, `<button type="button">`
 * so it stays keyboard-operable and `--focus-ring`-eligible. A local,
 * unexported subcomponent for the same reason the other two call sites
 * are local: hover/focus need a real per-link hook instance a `.map()`
 * callback cannot provide without violating the rules of hooks. */
function ArtifactLinkButton({ label, onPress }: { label: string; onPress: () => void }) {
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <button
      type="button"
      onClick={onPress}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        alignSelf: 'flex-start',
        background: 'transparent',
        border: 'none',
        padding: 0,
        margin: 0,
        font: 'inherit',
        fontSize: '0.8125rem',
        color: 'var(--accent)',
        cursor: 'pointer',
        textDecoration: hover ? 'underline' : 'none',
        borderRadius: 'var(--radius-xs, 4px)',
        boxShadow: focused ? 'var(--focus-ring)' : 'none',
      }}
    >
      {label}
      <Icon name="arrow-right" size={16} tone="interactive" />
    </button>
  );
}

interface ArtifactsListProps {
  links: { label: string; onPress: () => void }[];
}

function ArtifactsList({ links }: ArtifactsListProps) {
  if (links.length === 0) return null;
  return (
    <div style={ARTIFACTS_STYLE}>
      <h3 style={SECTION_HEADING_STYLE}>
        <Label text="Artifacts" variant="eyebrow" />
      </h3>
      <ul style={ARTIFACTS_LIST_STYLE}>
        {links.map((link) => (
          <li key={link.label}>
            <ArtifactLinkButton label={link.label} onPress={link.onPress} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Section 2.9.9 common canvas header — "You asked: '<question>'", a
 * `body-secondary` Label immediately above every layout's own content
 * (plus NoMatch). Absent for the `Empty` first-load state (no question
 * asked yet). */
function CanvasHeader({ question }: { question: string }) {
  return <Label text={`You asked: '${question}'`} variant="body-secondary" />;
}

/** One `PlanOpportunity`'s field rows for the `opportunity-status` layout
 * (Section 2.9.9(c)) — identical labels/values to StudioAsk's own pre-A20
 * register `DataTable` columns (Section 2.9.11 relocates that exact table). */
function opportunityFields(opportunity: PlanOpportunity): DrawerContentField[] {
  return [
    { label: 'Category', value: opportunity.c },
    { label: 'Build cost', value: fmt(opportunity.cost) },
    { label: 'Horizon', value: opportunity.h },
    { label: 'Weakest control gate', value: `${opportunity.weakGate} · ${opportunity.minGate}` },
  ];
}

function opportunityTags(opportunity: PlanOpportunity, threshold: number): DrawerContentTag[] {
  const tags: DrawerContentTag[] = [
    opportunity.minGate >= threshold ? { text: 'Ready', variant: 'status-positive' } : { text: 'Sequence-gated', variant: 'status-caution' },
  ];
  if (opportunity.disc) tags.push({ text: 'From Ask', variant: 'hitl' });
  return tags;
}

/** One `OnsideDomain`'s field rows for the `compliance-attainment` layout
 * (Section 2.9.9(d)). */
function domainFields(domain: OnsideDomain): DrawerContentField[] {
  return [
    { label: 'Regulatory bodies', value: domain.bodies },
    { label: 'Owner', value: domain.owner },
  ];
}

function domainTags(domain: OnsideDomain): DrawerContentTag[] {
  const status = statusOf(domain);
  return [{ text: DOMAIN_STATUS_LABEL[status], variant: DOMAIN_STATUS_VARIANT[status] }];
}

/** A canvas turn's identifying data — content is resolved LIVE at render
 * time from `OPPS`/`DETAIL`/`DOMAINS` (never retyped, PI2-D28) for every
 * variant that carries an id/key. Exactly one turn is ever current
 * (AC-A20-4). */
type CanvasTurn =
  | { source: 'entry'; question: string; entry: ChatEntry }
  | { source: 'legacy-document'; question: string; text: string; citations: string[] }
  | { source: 'legacy-opportunity'; question: string; text: string; addedText: string }
  | { source: 'legacy-instructional'; question: string; text: string }
  | { source: 'no-match'; question: string };

export interface StudioAskProps extends DeepLinkScreenProps {
  /** Navigation hook for this screen's own in-content links (source citation links → OnSide · Documents) — unrelated to Sidebar, which App.tsx's Shell owns. */
  onNavigate: SidebarProps['onNavigate'];
  /** Testing/override hook, mirrors `InvestmentDesign.tsx`'s own optional
   * `opportunities` prop. Defaults to the live scripted set
   * (`STUDIO_CHAT_MODULE_CONFIG.entries`) — lets a test exercise the
   * response canvas's four typed layouts against a minimal fixture
   * without depending on Marisol's concurrently-authored content (AC-A20-5). */
  entries?: ChatEntry[];
}

export function StudioAsk({ onNavigate, onDeepLink, entries = STUDIO_CHAT_MODULE_CONFIG.entries }: StudioAskProps) {
  const [inputValue, setInputValue] = useState('');
  const [chatState, setChatState] = useState<'idle' | 'typing' | 'submitting' | 'answer-rendering' | 'answer-complete' | 'no-match'>('idle');
  const [currentTurn, setCurrentTurn] = useState<CanvasTurn | null>(null);
  /** The last unmatched query, offered for scoping via the entry chip (base route() no-match chips, 4469-4470). Cleared when intake starts, when a later Ask matches, or on any intake terminal (base resetChips). */
  const [pendingScopeQuery, setPendingScopeQuery] = useState<string | null>(null);
  /** Non-null while the intake wizard is mounted — `startIntake(name)`'s own `name` (4363). */
  const [intakeUseCaseName, setIntakeUseCaseName] = useState<string | null>(null);
  /** The wizard's own transcript, mirrored up via `onTranscriptChange`
   * (`ChatIntakeWizard.tsx`'s file header, fix C-unbounded-growth-01) —
   * rendered by THIS screen (see `INTAKE_TRANSCRIPT_LIST_STYLE` above)
   * since ChatHero no longer mounts here. Cleared on every wizard terminal
   * (complete/discard/cancel): the response canvas's single-turn
   * discipline (Section 2.9.8 — "no accumulating scroll") extends sensibly to
   * the wizard's own sub-conversation too, once it terminates and the
   * canvas's next turn (the terminal confirmation line) supersedes it. */
  const [intakeTranscript, setIntakeTranscript] = useState<IntakeTranscriptMessage[]>([]);

  // Register/pool subscription — re-renders this screen on every demoStore
  // write, so a live-opportunity canvas turn (the auto-loan seed, or a
  // scripted `opportunity-status` entry) always resolves the CURRENT OPPS/
  // DETAIL record on its next render (PI2-D28 "live, never retyped" —
  // AC-A20-7), including the moment the auto-loan play is actually added.
  useDemoStore();

  const requestSeqRef = useRef(0);
  const wizardRef = useRef<ChatIntakeWizardHandle | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setChatState((current) => {
      if (current === 'submitting' || current === 'answer-rendering') return current;
      return value.trim().length > 0 ? 'typing' : 'idle';
    });
  };

  const handleAsk = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length === 0) return;

    // Intake mode consumes all input (base route() 4434-4444; STU-14):
    // while the wizard is mid-question, the main box feeds the intake —
    // 'cancel' cancels, anything else is the current answer. Only the
    // review phase (base: mode back to 'idle') falls through to a normal
    // Ask.
    if (intakeUseCaseName !== null) {
      const consumed = wizardRef.current?.handleExternalInput(trimmed) ?? false;
      if (consumed) {
        setInputValue('');
        return;
      }
    }

    const requestKey = ++requestSeqRef.current;
    setInputValue('');
    setChatState('submitting');

    window.setTimeout(() => {
      if (requestSeqRef.current !== requestKey) return; // superseded by a newer Ask press
      setChatState('answer-rendering');
      window.setTimeout(() => {
        if (requestSeqRef.current !== requestKey) return;

        const scriptedMatch = matchScriptedEntry(entries, trimmed);
        if (scriptedMatch) {
          setCurrentTurn({ source: 'entry', question: trimmed, entry: scriptedMatch });
          setChatState('answer-complete');
          setPendingScopeQuery(null);
          return;
        }

        const seeded = matchSeed(trimmed);
        if (seeded) {
          if (seeded.opportunityMatch) {
            setCurrentTurn({ source: 'legacy-opportunity', question: trimmed, text: seeded.text, addedText: '' });
          } else {
            setCurrentTurn({ source: 'legacy-document', question: trimmed, text: seeded.text, citations: seeded.citations });
          }
          setChatState('answer-complete');
          setPendingScopeQuery(null);
          return;
        }

        if (isGreetingOrFragment(trimmed)) {
          setCurrentTurn({ source: 'legacy-instructional', question: trimmed, text: HELP_LINE });
          setChatState('answer-complete');
          setPendingScopeQuery(null);
          return;
        }

        setCurrentTurn({ source: 'no-match', question: trimmed });
        setChatState('no-match');
        setPendingScopeQuery(trimmed); // recorded for the "Scope … as a new use case" entry chip (4469-4470)
      }, ASK_RENDER_DELAY_MS);
    }, ASK_SUBMIT_DELAY_MS);
  };

  /** Base addAutoLoan → acceptProposed (4415-4429, 4401-4412): the
   * explicit register press for the seeded answer. Sets the rich
   * AUTO_LOAN_DETAIL first (base 4429), then the shared-store accept. The
   * current turn's `addedText` switches to the confirmation line — the
   * SAME turn re-renders with the play now live in OPPS/DETAIL (see file
   * header "IMPLEMENTER JUDGMENT"). */
  const handleAddAutoLoan = () => {
    if (OPPS.some((o) => o.n === AUTO_LOAN_OPPORTUNITY.n)) return;
    if (!DETAIL[AUTO_LOAN_OPPORTUNITY.n]) {
      DETAIL[AUTO_LOAN_OPPORTUNITY.n] = {
        sum: AUTO_LOAN_DETAIL.sum,
        work: [...AUTO_LOAN_DETAIL.work],
        tech: [...AUTO_LOAN_DETAIL.tech],
        deps: [...AUTO_LOAN_DETAIL.deps],
        unlocks: [...AUTO_LOAN_DETAIL.unlocks],
      };
    }
    const opportunity = buildAutoLoanOpportunity();
    acceptOpportunity(opportunity);
    setCurrentTurn((prev) => (prev && prev.source === 'legacy-opportunity' ? { ...prev, addedText: sayAcceptedText(opportunity) } : prev));
  };

  /** Base acceptProposed's confirmation line (4408-4411), VERBATIM
   * semantics: tolerance clause (ready vs sequence-gated at the live
   * threshold), obligation arithmetic (3 + gates×2, 4405/4410),
   * display-name domains, and the live library count. */
  function sayAcceptedText(o: PlanOpportunity): string {
    const L = getLiveLevers();
    const clause =
      o.minGate >= L.threshold
        ? ' and clears the gate at your current tolerance. Studio has picked it up for funding consideration.'
        : ', currently sequence-gated. Studio shows it with the control that unlocks it.';
    const obligations = 3 + o.g.length * 2;
    return `Added. ${o.n} is in the register${clause} It pulls ${obligations} obligations into scope across ${domainsFor(o.g).join(
      ', ',
    )}; OnSide has re-evaluated those domain targets. The library is at ${OPPS.length}.`;
  }

  /** Fix B-dead-interactions-10: base autoLoanAnswer's "See the governance
   * work in OnSide" offer (leapfi-platform.html:4424, `goOnside('dom-mrm')`). */
  const handleSeeGovernanceWork = () => {
    const domainKey = CTRLDOM['Model Risk'];
    if (domainKey) onDeepLink?.({ screen: 'onside.overview', kind: 'domain', id: domainKey });
  };

  /** Fix B-dead-interactions-10: base's post-accept "See the scope change
   * in OnSide" cross-nav — opens the play's weakest-gate domain via the
   * nav-payload mechanism. */
  const handleSeeScopeChangeInOnSide = (o: PlanOpportunity) => {
    const domainKey = CTRLDOM[o.weakGate] ?? CTRLDOM[o.g[0] ?? ''];
    if (domainKey) onDeepLink?.({ screen: 'onside.overview', kind: 'domain', id: domainKey });
  };

  /** Entry-chip press — mirrors route()'s scope-chip → `startIntake(name)` hand-off. */
  const handleStartIntake = () => {
    if (pendingScopeQuery === null || intakeUseCaseName !== null) return;
    setIntakeUseCaseName(capitalizeFirst(pendingScopeQuery));
    setPendingScopeQuery(null);
  };

  const handleIntakeComplete = (opportunity: PlanOpportunity) => {
    setIntakeUseCaseName(null);
    setIntakeTranscript([]);
    setPendingScopeQuery(null);
    if (!OPPS.some((o) => o.n === opportunity.n)) {
      acceptOpportunity(opportunity);
    }
    setCurrentTurn({ source: 'legacy-opportunity', question: opportunity.n, text: sayAcceptedText(opportunity), addedText: sayAcceptedText(opportunity) });
    setChatState('answer-complete');
  };

  const handleIntakeDiscard = () => {
    setIntakeUseCaseName(null);
    setIntakeTranscript([]);
    setPendingScopeQuery(null);
    setCurrentTurn({ source: 'legacy-instructional', question: '', text: 'Discarded. Nothing was added to the register. What else is on your mind?' });
    setChatState('answer-complete');
  };

  const handleIntakeCancel = () => {
    setIntakeUseCaseName(null);
    setIntakeTranscript([]);
    setPendingScopeQuery(null);
    setCurrentTurn({ source: 'legacy-instructional', question: '', text: 'Scoping cancelled. Nothing was added. Ask me anything, or describe another idea when you’re ready.' });
    setChatState('answer-complete');
  };

  const busy = chatState === 'submitting' || chatState === 'answer-rendering';
  const showScopeChip = pendingScopeQuery !== null && intakeUseCaseName === null;

  const handleAskPress = () => {
    if (inputValue.trim().length === 0 || busy) return;
    handleAsk(inputValue);
  };

  /** Section 2.9.9(a)/(b) — `document`/`instructional` layout body for a
   * scripted `ChatEntry`. `document` requires non-empty `deepLinks`;
   * `instructional` renders the Artifacts list only when present. */
  function renderEntryDocumentOrInstructional(entry: ChatEntry) {
    const responseType = entry.response?.responseType ?? 'instructional';
    const heading = responseType === 'document' ? 'Answer' : 'How to';
    const links: { label: string; onPress: () => void }[] = (entry.deepLinks ?? []).map((link: ChatEntryDeepLink) => ({
      label: link.label,
      onPress: () => onDeepLink?.(link.request),
    }));
    return (
      <>
        <h2 style={SECTION_HEADING_STYLE}>
          <Label text={heading} variant="eyebrow" />
        </h2>
        <p style={PROSE_STYLE}>{entry.responseText}</p>
        <ArtifactsList links={links} />
      </>
    );
  }

  function renderEntryOpportunityStatus(opportunityId: string) {
    const opportunity = OPPS.find((o) => o.n === opportunityId);
    const L = getLiveLevers();
    return (
      <>
        <h2 style={SECTION_HEADING_STYLE}>
          <Label text="Opportunity status" variant="eyebrow" />
        </h2>
        {opportunity ? (
          <>
            <StatCard label="Annual value" value={fmt(adoptionScaledValue(opportunity.val))} unit="/yr at adoption" />
            <section aria-labelledby="studio-ask-opportunity-heading" style={DRAWER_SECTION_STYLE}>
              <h3 id="studio-ask-opportunity-heading" style={SECTION_HEADING_STYLE}>
                {opportunity.n}
              </h3>
              <DrawerContent
                kind="play"
                fields={opportunityFields(opportunity)}
                tags={opportunityTags(opportunity, L.threshold)}
                actions={[
                  {
                    label: 'Detail →',
                    variant: 'secondary',
                    onPress: () => onDeepLink?.({ screen: 'studio.investment-design', kind: 'play', id: opportunity.n }),
                  },
                ]}
              />
            </section>
          </>
        ) : null}
      </>
    );
  }

  function renderEntryComplianceAttainment(domainKey: string) {
    const domain = DOMAINS.find((d) => d.key === domainKey);
    return (
      <>
        <h2 style={SECTION_HEADING_STYLE}>
          <Label text="Compliance standing" variant="eyebrow" />
        </h2>
        {domain ? (
          <>
            <StatCard label={domain.name} value={domain.met} unit={`of ${domain.target}`} />
            <section aria-labelledby="studio-ask-domain-heading" style={DRAWER_SECTION_STYLE}>
              <h3 id="studio-ask-domain-heading" style={SECTION_HEADING_STYLE}>
                {domain.name}
              </h3>
              <DrawerContent
                kind="domain"
                fields={domainFields(domain)}
                tags={domainTags(domain)}
                actions={[
                  {
                    label: 'See in OnSide',
                    variant: 'secondary',
                    onPress: () => onDeepLink?.({ screen: 'onside.overview', kind: 'domain', id: domain.key }),
                  },
                ]}
              />
            </section>
          </>
        ) : null}
      </>
    );
  }

  function renderEntryProse(entry: ChatEntry) {
    return (
      <>
        <p style={PROSE_STYLE}>{entry.responseText}</p>
      </>
    );
  }

  function renderTurnBody(turn: CanvasTurn) {
    switch (turn.source) {
      case 'entry': {
        const response = turn.entry.response;
        if (response?.responseType === 'opportunity-status') {
          return (
            <>
              {renderEntryProse(turn.entry)}
              {renderEntryOpportunityStatus(response.opportunityId)}
            </>
          );
        }
        if (response?.responseType === 'compliance-attainment') {
          return (
            <>
              {renderEntryProse(turn.entry)}
              {renderEntryComplianceAttainment(response.domainKey)}
            </>
          );
        }
        // 'document' / 'instructional' / absent (backward-compatible default).
        return renderEntryDocumentOrInstructional(turn.entry);
      }
      case 'legacy-document': {
        const links = turn.citations.map((citation) => ({ label: citation, onPress: () => onNavigate('onside.documents') }));
        return (
          <>
            <h2 style={SECTION_HEADING_STYLE}>
              <Label text="Answer" variant="eyebrow" />
            </h2>
            <p style={PROSE_STYLE}>{turn.text}</p>
            <ArtifactsList links={links} />
          </>
        );
      }
      case 'legacy-instructional':
        return (
          <>
            <h2 style={SECTION_HEADING_STYLE}>
              <Label text="How to" variant="eyebrow" />
            </h2>
            <p style={PROSE_STYLE}>{turn.text}</p>
          </>
        );
      case 'legacy-opportunity': {
        const opportunity = OPPS.find((o) => o.n === AUTO_LOAN_OPPORTUNITY.n) ?? buildAutoLoanOpportunity();
        const isLive = OPPS.some((o) => o.n === AUTO_LOAN_OPPORTUNITY.n);
        const L = getLiveLevers();
        const actions: DrawerContentAction[] = isLive
          ? [
              { label: 'Detail →', variant: 'secondary', onPress: () => onDeepLink?.({ screen: 'studio.investment-design', kind: 'play', id: opportunity.n }) },
              { label: 'See the scope change in OnSide', variant: 'ghost', onPress: () => handleSeeScopeChangeInOnSide(opportunity) },
            ]
          : [
              { label: 'Add to the opportunity register', variant: 'secondary', onPress: handleAddAutoLoan },
              { label: 'See the governance work in OnSide', variant: 'ghost', onPress: handleSeeGovernanceWork },
            ];
        return (
          <>
            <h2 style={SECTION_HEADING_STYLE}>
              <Label text="Opportunity status" variant="eyebrow" />
            </h2>
            <p style={PROSE_STYLE}>{turn.addedText || turn.text}</p>
            <StatCard label="Annual value" value={fmt(adoptionScaledValue(opportunity.val))} unit="/yr at adoption" />
            <section aria-labelledby="studio-ask-auto-loan-heading" style={DRAWER_SECTION_STYLE}>
              <h3 id="studio-ask-auto-loan-heading" style={SECTION_HEADING_STYLE}>
                {opportunity.n}
              </h3>
              <DrawerContent kind="play" fields={opportunityFields(opportunity)} tags={opportunityTags(opportunity, L.threshold)} actions={actions} />
            </section>
          </>
        );
      }
      case 'no-match':
        return (
          <p style={PROSE_STYLE} role="status">
            {STUDIO_CHAT_MODULE_CONFIG.defaultNoMatchMessage}
          </p>
        );
    }
  }

  function renderCanvasContent() {
    if (busy) {
      return (
        <div style={LOADING_ROW_STYLE} aria-hidden="true">
          <Spinner variant="inline" size="small" /> Thinking…
        </div>
      );
    }
    if (currentTurn === null) {
      // Empty layout (Section 2.9.9) — no question asked yet; canvas header absent.
      return <p style={PROSE_STYLE}>Ask a question above to get started.</p>;
    }
    return (
      <div style={TURN_STYLE}>
        <CanvasHeader question={currentTurn.question} />
        {renderTurnBody(currentTurn)}
      </div>
    );
  }

  return (
    <main id="studio-ask-main" style={MAIN_STYLE} aria-labelledby="studio-ask-title">
      <div style={HEADER_ROW_STYLE}>
        <h1 id="studio-ask-title" style={TITLE_STYLE}>
          Studio · Ask
        </h1>
      </div>

      <div style={CHAT_PANEL_STYLE} data-lf-region="chat-bar">
        <div style={SUGGESTION_ROW_STYLE} role="group" aria-label="Suggested questions">
          {[...entries.map((entry) => entry.question), ...SUGGESTIONS_BASE].map((suggestion) => (
            <Chip key={suggestion} text={suggestion} variant="suggestion" onPress={() => handleInputChange(suggestion)} />
          ))}
        </div>
        <div style={ASK_ROW_STYLE}>
          <div style={{ flex: 1 }}>
            <Input
              ref={inputRef}
              label={STUDIO_CHAT_MODULE_CONFIG.inputLabel}
              value={inputValue}
              placeholder={STUDIO_CHAT_MODULE_CONFIG.inputPlaceholder}
              onChange={handleInputChange}
              onSubmit={handleAskPress}
              disabled={chatState === 'submitting'}
              surface="panel"
            />
          </div>
          <Button label="Ask" variant="primary" onPress={handleAskPress} loading={chatState === 'submitting'} disabled={inputValue.trim().length === 0} />
        </div>
      </div>

      <div style={CANVAS_STYLE} data-lf-region="response-canvas" aria-live="polite">
        {renderCanvasContent()}
      </div>

      {showScopeChip && pendingScopeQuery !== null ? (
        <div style={SCOPE_CHIP_ROW_STYLE} role="group" aria-label="Scope a new use case">
          <Chip
            text={`Scope "${capitalizeFirst(pendingScopeQuery)}" as a new use case`}
            variant="suggestion"
            onPress={handleStartIntake}
          />
        </div>
      ) : null}

      {intakeUseCaseName !== null ? (
        <div style={INTAKE_SLOT_STYLE}>
          {/* "Conversation" — mirrors ChatHero's own retired `messageListStyle`
              list label, NOT "Scoping conversation" (the base's pre-fix
              SEPARATE unbounded list fix C-unbounded-growth-01 already
              retired — see `ChatIntakeWizard.tsx`'s own file header; this
              is that same one-list discipline's screen-local continuation,
              not a resurrection of the retired pattern). */}
          {intakeTranscript.length > 0 ? (
            <ul aria-label="Conversation" style={INTAKE_TRANSCRIPT_LIST_STYLE}>
              {intakeTranscript.map((message) => (
                <li key={message.id} style={intakeBubbleStyle(message.role)}>
                  {message.text}
                </li>
              ))}
            </ul>
          ) : null}
          <ChatIntakeWizard
            key={intakeUseCaseName}
            ref={wizardRef}
            useCaseName={intakeUseCaseName}
            onComplete={handleIntakeComplete}
            onDiscard={handleIntakeDiscard}
            onCancel={handleIntakeCancel}
            onTranscriptChange={setIntakeTranscript}
          />
        </div>
      ) : null}
    </main>
  );
}
