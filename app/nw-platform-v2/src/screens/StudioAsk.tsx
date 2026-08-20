/**
 * StudioAsk — Screen anatomy §5.4 "Studio · Ask — Step 4 'One answer'"
 * (design_system_spec.md), fed by demo_script_draft.md Step 4 and its
 * G5/G6 gap-register entries. Reworked by the fix-wave "studio" batch
 * (findings STU-01/03/06/07/08/14 + the shared demoStore wiring).
 *
 * Region map (§5.4): Topbar → page title → ChatHero (C10): counters
 * StatCard row ("412 monitored docs", "interviews 11 of 12" —
 * survey_map.md 895–919) → message list → suggestion Chips (`#uc-list`) →
 * Input + "Ask" Button. Components used per spec: Topbar, Sidebar, ChatHero
 * (C10), StatCard (C1, via ChatHero's own counter row), Input (P6), Button
 * (`primary` — the screen's ONE primary CTA), Chip (`suggestion`).
 *
 * SUPERSEDED — Topbar/Sidebar data ownership (amendment A11,
 * design_system_spec.md §3.0): both composites now mount exactly once, in
 * App.tsx's persistent Shell — this screen no longer accepts a `topbar`
 * prop or builds a local `SidebarProps`; it keeps only `onNavigate` for its
 * own in-content links (source citation links → OnSide · Documents),
 * unrelated to rendering Sidebar itself.
 *
 * Matching engine (STU-03) — ported from the base, no longer authored:
 *   - `matchCopilotQA` keeps an exact-question / full-chip-phrase fast
 *     path (the suggestion Chips fill the Input with the short chip
 *     label, so the label itself must match — a port-side wiring
 *     necessity), then applies the base's own `cpMatch` word-overlap
 *     algorithm VERBATIM (leapfi-platform.html:1799-1808): ≥2 distinct
 *     overlapping words of length >4 from the seeded question. The old
 *     two-way `phrase.includes(q)` substring test — which matched "in"
 *     against 'data sharing' and returned a confidently wrong cited
 *     policy answer — is gone.
 *   - The auto-loan seed fires on the base route() probes ('auto loan' /
 *     'loan origination', 4448) plus the Step-4 seeded phrasing
 *     ('indirect' + 'lend' together) — never on 'indirect' alone.
 *   - route()'s greeting/short-query guard (4471-4476) is ported: a
 *     greeting or a <3-word fragment gets the base's help line, never a
 *     wrong answer and never a 'Scope "Thanks"…' chip.
 *
 * Shared demo state (state/demoStore.ts): the opportunity register renders
 * the LIVE `OPPS` pool (base renderRegister, 4315-4327) via
 * `useDemoStore()`, values adoption-scaled by the live levers
 * (`fmt(o.val*L.eff)+'/yr at adoption'`, base 4325; STU-07). Accepting a
 * play — the wizard's Add intent or the seeded auto-loan Add — calls
 * `demoStore.acceptOpportunity` (the base acceptProposed data mutation,
 * 4403-4407: OPPS push + DETAIL stub + SCOPE_EVENTS entry + re-render
 * fan-out), so the accept confirmation's "OnSide has re-evaluated those
 * domain targets. The library is at N." line is TRUE — OnSide's scope-
 * events panel and Investment Design's live plan both see the new play
 * (STU-01). The confirmation line also carries the base's tolerance
 * clause (ready vs sequence-gated, 4410), restored now that the live
 * levers are reachable.
 *
 * Seeded auto-loan flow (STU-06/STU-08): the answer is the base
 * autoLoanAnswer content (4417-4424) — the You-have / Missing / OnSide-
 * flags (with control scores) / Envelope grounding rows as plain text,
 * with the envelope value lever-scaled ('at your adoption setting',
 * 4423) — and the register write is gated behind an explicit "Add to the
 * opportunity register" press (base 4426 addAutoLoan button; `secondary`,
 * because "Ask" is this screen's one primary CTA per spec §5.4/§6),
 * never fired automatically by the answer timer. The register
 * announcement + highlight run ONLY when a row is actually added — a
 * repeat ask can no longer re-announce an unchanged table.
 *
 * Intake wizard wiring (STU-14): while the wizard is mounted, the main
 * Ask input is routed THROUGH the intake via
 * `ChatIntakeWizardHandle.handleExternalInput` — the port of the base's
 * intake mode consuming all input (route() 4434-4444: 'cancel' cancels,
 * anything else is captured as the current answer). Review-phase asks
 * route normally (base: mode is back to 'idle' there). A no-match can
 * therefore no longer park a stale scope chip mid-intake, and the
 * wizard's terminal handlers clear any pending scope offer (the base
 * resetChips equivalent).
 *
 * AMBIGUITY RESOLVED — citations rendering: `ChatHero.tsx`'s `ChatMessage`
 * shape is `{ id, role, text: string }` — plain text, no structured
 * citation slot. Demo script Step 4's "See" line explicitly calls out "the
 * auto-loan answer rendering... with citations back to approved policy
 * documents" as visible content, so this screen renders a companion
 * "Sources" panel beneath ChatHero, populated from the matched seed's
 * `citations` list and shown once the answer is final. Each source is a
 * real button (fix B-dead-interactions-10; base `<span class="doclink"
 * onclick="onsideShow('docs')">`, leapfi-platform.html:3636/1813) that
 * navigates to OnSide · Documents via the existing `onNavigate` prop —
 * clicking a cited policy is no longer a dead click.
 *
 * INTAKE TRANSCRIPT MERGES INTO CHATHERO'S ONE BOUNDED LOG (fix
 * C-unbounded-growth-01; base anchor leapfi-platform.html:435 `#st-ask
 * .chat-log{max-height:420px;overflow-y:auto}`, single log, scroll-to-
 * latest on every botSay 4343/4348): `ChatIntakeWizard` no longer renders
 * its own second, unbounded `<ul>` for the scoping conversation — it hands
 * its transcript up via `onTranscriptChange`, and this screen merges it
 * onto the SAME array passed to ChatHero's `messages` prop while the
 * wizard is mounted, so the whole conversation (pre-intake Q&A + the
 * intake's own Q&A) renders as one ordered, bounded, auto-scrolling log —
 * never two. When the wizard terminates (complete/discard/cancel), its
 * transcript is folded permanently into this screen's own `messages`
 * state before the terminal confirmation line is appended, so the history
 * a presenter scrolled through during intake is not lost, matching the
 * base's single continuous `chat-log`.
 *
 * PLAY DETAIL FROM THE REGISTER + POST-ACCEPT CROSS-NAV (fix
 * B-dead-interactions-03/10): every register row now carries a real
 * "Detail →" row action (base `<div class="uc" onclick="openPlay(n)">…
 * <span class="go">Detail →</span>`, leapfi-platform.html:4325) that fires
 * `onDeepLink({ screen: 'studio.investment-design', kind: 'play', id })` —
 * this screen owns no play-detail Drawer of its own (Drawer stays a
 * single, screen-local instance per `InvestmentDesign.tsx`'s own
 * "Drawer instance ownership" note; nav-payload is the shipped mechanism
 * for "navigate AND open a specific item elsewhere," App.tsx file header
 * "NAVIGATION-WITH-PAYLOAD / DEEP LINKS"), so the click lands on
 * Investment Design's real drawer already showing that exact play. The
 * seeded auto-loan answer also offers "See the governance work in OnSide"
 * (base 4424, `goOnside('dom-mrm')`) before it's added, and once ANY play
 * is added (seeded or wizard-scoped) the confirmation carries "See it in
 * the register" (scrolls + re-highlights the row already on this screen)
 * and "See the scope change in OnSide" (base 4411-ish region) — both dead
 * in the prior build.
 *
 * Inline-tag stripping: `COPILOT_QA[].a` (`data/misc.ts`) carries `<b>...
 * </b>` emphasis spans the original source rendered via `innerHTML`.
 * `ChatMessage.text` is plain text only, so `stripInlineTags` below
 * removes the tags rather than leaving literal "<b>" characters on
 * screen.
 *
 * Accessibility gate (persona directive 7): ChatHero (C10, unmodified
 * here) owns the Ask flow's own `aria-live="polite"` answer announcement;
 * this screen adds exactly one further screen-owned `aria-live="polite"`
 * region for the opportunity register's live addition — announced only
 * when the register actually changes (see STU-06 above).
 *
 * Tests: src/__tests__/studio/studio-ask.test.tsx executes this screen
 * against the base anchors above (vitest + @testing-library).
 */
import { useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { SidebarProps } from '../components/Sidebar';
import { ChatHero } from '../components/ChatHero';
import type { ChatCounter, ChatMessage, ChatHeroState } from '../components/ChatHero';
import { DataTable } from '../components/DataTable';
import type { DataTableColumn, DataTableRowAction } from '../components/DataTable';
import { Tag } from '../components/primitives/Tag';
import { Label } from '../components/primitives/Label';
import { Chip } from '../components/primitives/Chip';
import { Button } from '../components/primitives/Button';
import { ChatIntakeWizard } from '../views/ChatIntakeWizard';
import type { ChatIntakeWizardHandle } from '../views/ChatIntakeWizard';
import { COPILOT_QA, AUTO_LOAN_OPPORTUNITY, AUTO_LOAN_DETAIL } from '../data/misc';
import { OPPS, DETAIL, CTRL, CTRLDOM, domainsFor } from '../data/studio';
import type { OppHorizon, OppRisk } from '../data/studio';
import { DOCLIB } from '../data/doclib';
import { fmt } from '../engine/plan';
import type { PlanOpportunity } from '../engine/plan';
import { acceptOpportunity, adoptionScaledValue, getLiveLevers, useDemoStore } from '../state/demoStore';
import type { DeepLinkScreenProps } from '../App';
import { PANEL_STYLE } from '../theme/panelStyle';

interface SeedAnswer {
  text: string;
  citations: string[];
  opportunityMatch: boolean;
}

/** See file header "inline-tag stripping." */
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

/** Step 4's own seeded question (demo_script_draft.md §2 Step 4 `say` line:
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
 * (design_system_spec.md §1.4 carries no timing values) — long enough that
 * ChatHero's `submitting`/`answer-rendering` states are visibly real
 * waits, matching Core Principle 1's discipline against instant,
 * indistinguishable-from-fake state flips. */
const ASK_SUBMIT_DELAY_MS = 350;
const ASK_RENDER_DELAY_MS = 450;
const REGISTER_HIGHLIGHT_MS = 1800;

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
export const CHAT_PANEL_STYLE: CSSProperties = {
  ...PANEL_STYLE,
  padding: '1.5rem',
};
const SCOPE_CHIP_ROW_STYLE: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' };
const INTAKE_SLOT_STYLE: CSSProperties = { marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' };
const SOURCES_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
// Layout/reset only — the eyebrow treatment itself (uppercase/tracking/
// weight/color) lives in Label (P3) `eyebrow`, §8 R-1.
const SOURCES_HEADING_STYLE: CSSProperties = { margin: 0, font: 'inherit' };
const SOURCES_LIST_STYLE: CSSProperties = { margin: 0, padding: '0 0 0 1.1rem', fontSize: '0.875rem', color: 'var(--ink)', lineHeight: 1.6 };
/** Fix B-dead-interactions-10: base `.doclink` styling (underlined, accent-colored, inline) rendered as a real `<button>` so each source is keyboard-operable. */
const CITATION_LINK_STYLE: CSSProperties = {
  font: 'inherit',
  fontSize: 'inherit',
  color: 'var(--accent)',
  background: 'transparent',
  border: 'none',
  padding: 0,
  margin: 0,
  textDecoration: 'underline',
  cursor: 'pointer',
  textAlign: 'left',
};
const SECTION_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.875rem' };
const SUBHEADING_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.125rem', fontWeight: 700, color: 'var(--ink)' };
const SCROLL_WRAP_STYLE: CSSProperties = { overflowX: 'auto', flexShrink: 0 };
const SR_ONLY_STYLE: CSSProperties = {
  // Visually-hidden recipe — `top`/`left` pinned to 0 is load-bearing;
  // see the invariant note on `DataTable.tsx`'s `srOnlyStyle`. Without
  // it an unpositioned absolute box falls back to its in-flow static
  // position, which can extend `html.scrollHeight` past this screen's
  // scrolling `<main>` (now also `position: 'relative'`, same reason).
  position: 'absolute',
  top: 0,
  left: 0,
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
};

const COUNTERS: ChatCounter[] = [
  // survey_map.md 895–919 / demo_script_draft.md Step 4 say line — cited
  // literal figures, not invented.
  { value: 412, label: 'Monitored documents' },
  { value: '11 of 12', label: 'Discovery interviews complete' },
];

const SUGGESTIONS: string[] = [...COPILOT_QA.map((item) => item.chips), SEEDED_AUTO_LOAN_QUESTION];

export interface StudioAskProps extends DeepLinkScreenProps {
  /** Navigation hook for this screen's own in-content links (source citation links → OnSide · Documents) — unrelated to Sidebar, which App.tsx's Shell owns (see file header). */
  onNavigate: SidebarProps['onNavigate'];
}

export function StudioAsk({ onNavigate, onDeepLink }: StudioAskProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  /** The intake wizard's own transcript, mirrored up via
   * `onTranscriptChange` (fix C-unbounded-growth-01) — merged into
   * ChatHero's `messages` prop while the wizard is mounted so the whole
   * conversation renders inside ChatHero's one bounded log, never a
   * second unbounded list. Folded into `messages` permanently, then
   * cleared, on every wizard terminal (complete/discard/cancel). */
  const [intakeTranscript, setIntakeTranscript] = useState<ChatMessage[]>([]);
  /** The most recently registered play (seeded add or wizard complete) —
   * drives the post-accept "See it in the register" / "See the scope
   * change in OnSide" offer (fix B-dead-interactions-10). Cleared at the
   * start of the next Ask. */
  const [lastAccepted, setLastAccepted] = useState<PlanOpportunity | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [chatState, setChatState] = useState<ChatHeroState>('idle');
  const [citations, setCitations] = useState<string[]>([]);
  const [justRegisteredId, setJustRegisteredId] = useState<string | null>(null);
  const [registerAnnouncement, setRegisterAnnouncement] = useState('');
  /** True while the seeded auto-loan answer's explicit "Add to the
   * opportunity register" offer is on screen (base 4426; STU-06). */
  const [autoLoanOffer, setAutoLoanOffer] = useState(false);
  /** The last unmatched query, offered for scoping via the entry chip (base route() no-match chips, 4469-4470). Cleared when intake starts, when a later Ask matches, or on any intake terminal (base resetChips). */
  const [pendingScopeQuery, setPendingScopeQuery] = useState<string | null>(null);
  /** Non-null while the intake wizard is mounted — `startIntake(name)`'s own `name` (4363). */
  const [intakeUseCaseName, setIntakeUseCaseName] = useState<string | null>(null);

  // Register/pool subscription — the register table below renders the LIVE
  // OPPS pool (base renderRegister reads the shared OPPS, 4315-4327), and
  // acceptOpportunity writes land through the store's re-render fan-out.
  useDemoStore();

  const requestSeqRef = useRef(0);
  const msgSeqRef = useRef(0);
  const registerTimeoutRef = useRef<number | undefined>(undefined);
  const wizardRef = useRef<ChatIntakeWizardHandle | null>(null);
  /** Scroll target for the post-accept "See it in the register" offer (fix B-dead-interactions-10). */
  const registerSectionRef = useRef<HTMLElement>(null);

  /** Announcement + highlight for a register row that was ACTUALLY added
   * (STU-06: never re-announced for an unchanged table). Value figure is
   * adoption-scaled like the visible register cell (base 4325; STU-07). */
  const announceRegistered = (o: PlanOpportunity) => {
    setJustRegisteredId(o.n);
    setRegisterAnnouncement(
      `New opportunity registered: ${o.n} — ${fmt(adoptionScaledValue(o.val))}/yr at adoption, gated on ${o.g.join(', ')}.`,
    );
    if (registerTimeoutRef.current !== undefined) window.clearTimeout(registerTimeoutRef.current);
    registerTimeoutRef.current = window.setTimeout(() => setJustRegisteredId(null), REGISTER_HIGHLIGHT_MS);
  };

  /** Appends one assistant bubble to the main log — the port target for
   * botSay lines landing in the shared chat log (4408, 4413, 4437, 4473). */
  const appendAssistantMessage = (text: string) => {
    msgSeqRef.current += 1;
    const assistantMessage: ChatMessage = { id: `msg-${msgSeqRef.current}`, role: 'assistant', text };
    setMessages((prev) => [...prev, assistantMessage]);
  };

  /** Base acceptProposed's confirmation line (4408-4411), VERBATIM
   * semantics: tolerance clause (ready vs sequence-gated at the live
   * threshold), obligation arithmetic (3 + gates×2, 4405/4410),
   * display-name domains, and the live library count — all TRUE now that
   * `acceptOpportunity` really pushed the play (STU-01). */
  const sayAccepted = (o: PlanOpportunity) => {
    const L = getLiveLevers();
    const clause =
      o.minGate >= L.threshold
        ? ' and clears the gate at your current tolerance. Studio has picked it up for funding consideration.'
        : ', currently sequence-gated. Studio shows it with the control that unlocks it.';
    const obligations = 3 + o.g.length * 2;
    appendAssistantMessage(
      `Added. ${o.n} is in the register${clause} It pulls ${obligations} obligations into scope across ${domainsFor(o.g).join(
        ', ',
      )}; OnSide has re-evaluated those domain targets. The library is at ${OPPS.length}.`,
    );
    // fix B-dead-interactions-10: drives the "See it in the register" /
    // "See the scope change in OnSide" post-accept offer (base 4411
    // region's acceptProposed buttons).
    setLastAccepted(o);
  };

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

    msgSeqRef.current += 1;
    const userMessage: ChatMessage = { id: `msg-${msgSeqRef.current}`, role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setChatState('submitting');
    setLastAccepted(null); // a fresh Ask retires the prior post-accept offer (B-dead-interactions-10)

    window.setTimeout(() => {
      if (requestSeqRef.current !== requestKey) return; // superseded by a newer Ask press
      setChatState('answer-rendering');
      window.setTimeout(() => {
        if (requestSeqRef.current !== requestKey) return;
        const matched = matchSeed(trimmed);
        if (matched) {
          msgSeqRef.current += 1;
          const assistantMessage: ChatMessage = { id: `msg-${msgSeqRef.current}`, role: 'assistant', text: matched.text };
          setMessages((prev) => [...prev, assistantMessage]);
          setCitations(matched.citations);
          setChatState('answer-complete');
          setPendingScopeQuery(null); // a matched answer retires any stale scope offer
          // STU-06: the seeded answer OFFERS the register add (base 4426)
          // — it never writes the register itself.
          setAutoLoanOffer(matched.opportunityMatch && !OPPS.some((o) => o.n === AUTO_LOAN_OPPORTUNITY.n));
        } else if (isGreetingOrFragment(trimmed)) {
          // Base route() guard (4471-4476): help line, no scope chip.
          appendAssistantMessage(HELP_LINE);
          setCitations([]);
          setChatState('answer-complete');
          setPendingScopeQuery(null);
          setAutoLoanOffer(false);
        } else {
          setCitations([]);
          setChatState('no-match');
          setPendingScopeQuery(trimmed); // recorded for the "Scope … as a new use case" entry chip (4469-4470)
          setAutoLoanOffer(false);
        }
      }, ASK_RENDER_DELAY_MS);
    }, ASK_SUBMIT_DELAY_MS);
  };

  /** Base addAutoLoan → acceptProposed (4415-4429, 4401-4412): the
   * explicit register press for the seeded answer. Sets the rich
   * AUTO_LOAN_DETAIL first (base 4429), then the shared-store accept. */
  const handleAddAutoLoan = () => {
    if (!OPPS.some((o) => o.n === AUTO_LOAN_OPPORTUNITY.n)) {
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
      announceRegistered(opportunity);
      sayAccepted(opportunity);
    }
    setAutoLoanOffer(false);
  };

  /** Fix B-dead-interactions-10: base autoLoanAnswer's "See the governance
   * work in OnSide" offer (leapfi-platform.html:4424, `goOnside('dom-mrm')`)
   * — the seed's weakest gate is always Model Risk (`AUTO_LOAN_OPPORTUNITY.g`
   * includes it), so this mirrors the base's hardcoded target via the same
   * CTRLDOM routing-slug lookup the real weak-gate governance links use. */
  const handleSeeGovernanceWork = () => {
    const domainKey = CTRLDOM['Model Risk'];
    if (domainKey) onDeepLink?.({ screen: 'onside.overview', kind: 'domain', id: domainKey });
  };

  /** Entry-chip press — mirrors route()'s scope-chip → `startIntake(name)` hand-off (4467-4470, 4363); the wizard owns the opening line and question sequencing from here. */
  const handleStartIntake = () => {
    if (pendingScopeQuery === null || intakeUseCaseName !== null) return;
    setIntakeUseCaseName(capitalizeFirst(pendingScopeQuery));
    setPendingScopeQuery(null);
  };

  /** Fix C-unbounded-growth-01: folds the wizard's own transcript
   * (mirrored via `onTranscriptChange`) permanently into this screen's
   * `messages` history before a terminal confirmation line is appended —
   * so the intake Q&A a presenter scrolled through stays in the ONE
   * continuous chat-log (base's single `chat-log`, never a second list
   * that vanishes with the wizard). Both `setMessages`/`setIntakeTranscript`
   * calls use the functional form, so they compose correctly with the
   * `appendAssistantMessage` call each terminal handler makes right after. */
  const finalizeIntakeTranscript = () => {
    setMessages((prev) => [...prev, ...intakeTranscript]);
    setIntakeTranscript([]);
  };

  /** Port of `acceptProposed()`'s terminal behavior (4401-4412): the real
   * shared-register write via `demoStore.acceptOpportunity` (OPPS push +
   * DETAIL stub + SCOPE_EVENTS entry — STU-01), then the confirmation
   * line. Announcement/highlight only when a row was actually added. */
  const handleIntakeComplete = (opportunity: PlanOpportunity) => {
    finalizeIntakeTranscript();
    setIntakeUseCaseName(null);
    setPendingScopeQuery(null); // base resetChips() on accept
    if (!OPPS.some((o) => o.n === opportunity.n)) {
      acceptOpportunity(opportunity);
      announceRegistered(opportunity);
    }
    sayAccepted(opportunity);
  };

  /** Port of `discardProposed()` (4413). */
  const handleIntakeDiscard = () => {
    finalizeIntakeTranscript();
    setIntakeUseCaseName(null);
    setPendingScopeQuery(null); // base resetChips()
    appendAssistantMessage('Discarded. Nothing was added to the register. What else is on your mind?');
  };

  /** Port of route()'s intake-cancel branch (4435-4439). */
  const handleIntakeCancel = () => {
    finalizeIntakeTranscript();
    setIntakeUseCaseName(null);
    setPendingScopeQuery(null); // base resetChips()
    appendAssistantMessage('Scoping cancelled. Nothing was added. Ask me anything, or describe another idea when you’re ready.');
  };

  /** Fix B-dead-interactions-10: scrolls the already-visible register
   * section into view and re-triggers its highlight — the "See it in the
   * register" post-accept offer. The row is already on this screen (no
   * cross-screen nav needed, unlike "See the scope change in OnSide"
   * below). */
  const handleSeeInRegister = (o: PlanOpportunity) => {
    registerSectionRef.current?.scrollIntoView({ block: 'start' });
    announceRegistered(o);
  };

  /** Fix B-dead-interactions-10: base's post-accept "See the scope change
   * in OnSide" cross-nav — opens the play's weakest-gate domain via the
   * nav-payload mechanism (App.tsx "NAVIGATION-WITH-PAYLOAD / DEEP
   * LINKS"), same target kind the pre-accept "See the governance work in
   * OnSide" offer uses below. */
  const handleSeeScopeChangeInOnSide = (o: PlanOpportunity) => {
    const domainKey = CTRLDOM[o.weakGate] ?? CTRLDOM[o.g[0] ?? ''];
    if (domainKey) onDeepLink?.({ screen: 'onside.overview', kind: 'domain', id: domainKey });
  };

  const showSources = chatState === 'answer-complete' && citations.length > 0;
  const showScopeChip = pendingScopeQuery !== null && intakeUseCaseName === null;
  const showAutoLoanOffer = autoLoanOffer && chatState === 'answer-complete';
  /** Fix B-dead-interactions-10: post-accept cross-nav offer, shown once
   * any play is registered (seeded add or wizard complete) until the next
   * Ask. */
  const showPostAcceptOffer = lastAccepted !== null;

  // Fix C-unbounded-growth-01: while the wizard is mounted, ChatHero
  // renders the pre-intake conversation PLUS the wizard's own live
  // transcript as one array — the intake's Q&A appears inside ChatHero's
  // single bounded, auto-scrolling log instead of a second list beneath
  // it. Once the wizard terminates, `intakeTranscript` is folded into
  // `messages` and cleared (see `finalizeIntakeTranscript`), so this falls
  // back to plain `messages` with no duplication.
  const chatHeroMessages: ChatMessage[] = intakeUseCaseName !== null ? [...messages, ...intakeTranscript] : messages;

  // The register renders the LIVE pool, newest first (base renderRegister
  // reverses OPPS, 4322), values adoption-scaled (base 4325; STU-07).
  const registerRows: PlanOpportunity[] = [...OPPS].reverse();

  const opportunityColumns: DataTableColumn<PlanOpportunity>[] = [
    {
      id: 'name',
      header: 'Opportunity',
      sortable: true,
      sortValue: (row) => row.n,
      render: (row) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          {row.n}
          {row.disc ? <Tag text="From Ask" variant="hitl" /> : null}
        </span>
      ),
    },
    { id: 'category', header: 'Category', render: (row) => <span>{row.c}</span> },
    { id: 'cost', header: 'Build cost', align: 'end', sortable: true, sortValue: (row) => row.cost, render: (row) => <span>{fmt(row.cost)}</span> },
    {
      id: 'value',
      header: 'Annual value',
      align: 'end',
      sortable: true,
      sortValue: (row) => row.val,
      // Base register row (4325): fmt(o.val*L.eff)+'/yr at adoption' —
      // adoption-scaled at the LIVE levers, never the raw catalog val.
      render: (row) => <span>{fmt(adoptionScaledValue(row.val))}/yr at adoption</span>,
    },
    { id: 'horizon', header: 'Horizon', render: (row) => <span style={{ textTransform: 'capitalize' }}>{row.h}</span> },
    { id: 'gate', header: 'Weakest control gate', render: (row) => <span>{row.weakGate} · {row.minGate}</span> },
  ];

  const updatingRowIdsProp = justRegisteredId ? { updatingRowIds: new Set([justRegisteredId]) } : {};

  /** Fix B-dead-interactions-03: base's per-row "Detail →" affordance
   * (`<div class="uc" onclick="openPlay(n)">…<span class="go">Detail
   * →</span>`, leapfi-platform.html:4325) — every register row now opens
   * the real play drawer on Investment Design via the nav-payload
   * mechanism (this screen owns no Drawer of its own). */
  const registerRowAction: DataTableRowAction<PlanOpportunity> | undefined = onDeepLink
    ? {
        label: () => 'Detail →',
        onPress: (row) => onDeepLink({ screen: 'studio.investment-design', kind: 'play', id: row.n }),
      }
    : undefined;

  return (
    <main id="studio-ask-main" style={MAIN_STYLE} aria-labelledby="studio-ask-title">
          <h1 id="studio-ask-title" style={TITLE_STYLE}>
            Studio · Ask
          </h1>

          <div style={CHAT_PANEL_STYLE}>
            <ChatHero
              counters={COUNTERS}
              messages={chatHeroMessages}
              suggestions={SUGGESTIONS}
              inputValue={inputValue}
              onInputChange={handleInputChange}
              onAsk={handleAsk}
              state={chatState}
            />

            {showAutoLoanOffer ? (
              <div style={SCOPE_CHIP_ROW_STYLE} role="group" aria-label="Register the scoped opportunity">
                {/* Base autoLoanAnswer's explicit add action (4426); `secondary` — "Ask" is this screen's one primary (spec §5.4/§6). */}
                <Button label="Add to the opportunity register" variant="secondary" onPress={handleAddAutoLoan} />
                {/* Fix B-dead-interactions-10: base 4424 `goOnside('dom-mrm')`. */}
                <Button label="See the governance work in OnSide" variant="ghost" onPress={handleSeeGovernanceWork} />
              </div>
            ) : null}

            {showScopeChip && pendingScopeQuery !== null ? (
              <div style={SCOPE_CHIP_ROW_STYLE} role="group" aria-label="Scope a new use case">
                <Chip
                  text={`Scope "${capitalizeFirst(pendingScopeQuery)}" as a new use case`}
                  variant="suggestion"
                  onPress={handleStartIntake}
                />
              </div>
            ) : null}

            {showPostAcceptOffer && lastAccepted !== null ? (
              <div style={SCOPE_CHIP_ROW_STYLE} role="group" aria-label="After registering">
                {/* Fix B-dead-interactions-10: base's post-accept cross-nav buttons (4411 region). */}
                <Button label="See it in the register" variant="ghost" onPress={() => handleSeeInRegister(lastAccepted)} />
                <Button label="See the scope change in OnSide" variant="ghost" onPress={() => handleSeeScopeChangeInOnSide(lastAccepted)} />
              </div>
            ) : null}

            {intakeUseCaseName !== null ? (
              <div style={INTAKE_SLOT_STYLE}>
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
          </div>

          {showSources ? (
            <div style={SOURCES_STYLE} aria-label="Answer sources">
              <h2 style={SOURCES_HEADING_STYLE}>
                <Label text="Sources" variant="eyebrow" />
              </h2>
              <ul style={SOURCES_LIST_STYLE}>
                {citations.map((citation) => (
                  <li key={citation}>
                    {/* Fix B-dead-interactions-10: base `<span class="doclink" onclick="onsideShow('docs')">` (leapfi-platform.html:3636/1813). */}
                    <button type="button" onClick={() => onNavigate('onside.documents')} style={CITATION_LINK_STYLE}>
                      {citation}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <section ref={registerSectionRef} aria-labelledby="studio-ask-register-heading" style={SECTION_STYLE}>
            <h2 id="studio-ask-register-heading" style={SUBHEADING_STYLE}>
              Opportunity register
            </h2>
            <span role="status" aria-live="polite" style={SR_ONLY_STYLE}>
              {registerAnnouncement}
            </span>
            <div style={SCROLL_WRAP_STYLE}>
              <DataTable
                caption="Opportunity register"
                columns={opportunityColumns}
                rows={registerRows}
                getRowId={(row) => row.n}
                {...updatingRowIdsProp}
                {...(registerRowAction ? { rowAction: registerRowAction } : {})}
                defaultSortColumnId="value"
                defaultSortDirection="descending"
              />
            </div>
          </section>
    </main>
  );
}
