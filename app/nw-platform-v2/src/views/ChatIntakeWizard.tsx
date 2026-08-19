/**
 * ChatIntakeWizard — extends ChatHero (C10)'s already-spec'd `no-match`
 * fallback state (design_system_spec.md §2.2 C10 states list; §5.4) into a
 * guided, 4-question scoping sequence over `data/misc.ts`'s `INTAKE`
 * question set. parity_ia_addendum.md §1.6 / Batch 8 (dispatch
 * batch-8-chat-intake-and-board-log), reworked by the fix-wave "studio"
 * batch (findings STU-02/04/05/07/09/10/14/15 + the disc:true restore).
 *
 * Base engine anchors (leapfi-platform.html @ pin 1c230fe):
 *   - chatState / INTAKE literal: 4328, 4357-4362
 *   - startIntake (opening line + first question): 4363-4368 — the
 *     opening line INCLUDES the leading "Good one. " sentence (4365;
 *     STU-15) and the first question only renders after the opening
 *     delays complete (STU-04)
 *   - route()'s `mode==='intake'` branch (per-step answer handling +
 *     "Cancel scoping" handling; intake mode consumes ALL input):
 *     4434-4444 — exposed to the composing screen as
 *     `ChatIntakeWizardHandle.handleExternalInput` (STU-14)
 *   - finishIntake (envelope arithmetic ported verbatim into
 *     `computeScopedOpportunity` below, INCLUDING `disc:true`, 4385):
 *     4369-4400. The review panel renders the lever-scaled Value row
 *     (4390), the Regulations row's conditional SOX-404/ICFR and
 *     GLBA-safeguards clauses (4392; STU-09), the Placement row (4394;
 *     STU-07), and display-name domains via `domainsFor` (4299-4300;
 *     STU-02 — never the `CTRLDOM` routing slugs)
 *   - acceptProposed / discardProposed (the two terminal actions this
 *     component exposes as `onComplete` / `onDiscard` callbacks, never
 *     performed locally): 4401-4413
 *   - chip debounce / visible-Cancel-at-every-step: the v1.045 changelog
 *     entry (leapfi-platform.html:1085) names both fixes together. Both
 *     are ported: `__chipLock`'s own 700ms window (4332-4337) verbatim as
 *     `CHIP_LOCK_MS`, and the ghost Cancel Button rendered for the
 *     lifetime of every question step.
 *
 * Lever access (STU-07, supersedes the earlier "no lever access" ambiguity
 * note): the shared demo store (`state/demoStore.ts`) is now the canonical
 * owner of the live lever state (`getLiveLevers`, published by
 * InvestmentDesign via `setDemoSliders`). This component subscribes via
 * `useDemoStore()` and renders the base's lever-scaled Value row
 * (`fmt(val*L.eff)` at `Math.round(L.eff*100)%` adoption, 4390) and the
 * Placement row (`minGate >= L.threshold` ready/sequence-gated verdict,
 * 4394) — the rows the earlier dispatch omitted for lack of lever access.
 *
 * Message pacing + a11y (STU-04/STU-05): `buildMessages` reveals the next
 * unanswered question ONLY while `phase === 'asking'` — during the
 * 'opening'/'advancing' "Thinking…" transitions the pending question is
 * not yet in the DOM, matching the base botSay sequencing (typing dots
 * first, question text after the delay, 4331-4332/4365-4367/4442). Because
 * a bubble therefore only ever becomes the last message in the same render
 * that settles it, the latest assistant bubble is inserted WITH
 * `role="status"`/`aria-live="polite"` already present (the ChatHero
 * pattern: the live bubble enters the DOM live, it is never retrofitted
 * with live attributes after render — attribute addition to static text
 * announces nothing in JAWS/NVDA/VoiceOver).
 *
 * TRANSCRIPT LIVES IN CHATHERO'S BOUNDED LOG, NOT A SECOND LIST (fix
 * C-unbounded-growth-01; base anchor leapfi-platform.html:435 `#st-ask
 * .chat-log{max-height:420px;overflow-y:auto}` — ONE bounded log for the
 * whole conversation, intake questions included, with scroll-to-latest on
 * every botSay, 4343/4348; the chips row sits OUTSIDE the log, `chat-chips`
 * at 429/220): this component previously rendered its own `<ul
 * aria-label="Scoping conversation">`, styled from a locally-duplicated
 * copy of `ChatHero.tsx`'s `messageListStyle` that dropped the
 * `maxHeight`/`overflowY` lines the original carries — an unbounded second
 * list, mounted directly below ChatHero's own bounded one, so the
 * conversation read as two out-of-order logs and grew the page without
 * limit. This component no longer owns that list: `buildMessages`'s output
 * (memoized on `[useCaseName, answers, phase]` so the array reference is
 * stable across renders that don't actually change it) is handed to the
 * composing screen via the new `onTranscriptChange` prop, and the screen
 * merges it into the SAME array it passes to ChatHero's `messages` — so
 * the intake's questions/answers render as ordinary bubbles inside
 * ChatHero's one bounded, auto-scrolling `<ul>` (C-unbounded-growth-02),
 * exactly the base's single-log shape. This component still renders its
 * own transient "Thinking…" bubble (the phase 'opening'/'advancing'
 * indicator) locally, as a non-list styled element below the (now
 * screen-owned) transcript — it is never part of the growing history, so
 * it does not need to live inside the bounded log to avoid the defect this
 * fix addresses.
 *
 * External input (STU-14): the base's intake mode consumes every submit
 * (`route()` 4434-4444: a 'cancel'-containing input cancels, anything else
 * is captured as the current answer). `handleExternalInput` on the
 * forwarded ref ports that branch so the composing screen can route its
 * main Ask input through the open intake instead of running a second,
 * concurrent conversation. Returns false only while 'reviewing' — in the
 * base, `finishIntake` sets mode back to 'idle' before the proposal card,
 * so review-phase asks route normally. Input arriving during the brief
 * 'opening'/'advancing' transition windows is consumed and dropped
 * (implementer judgment call: the base's timing made that window
 * effectively unreachable, and silently answering an unseen question with
 * it would be worse).
 *
 * One-primary rule (STU-10): design_system_spec.md §5.4/§6 name "Ask" as
 * this screen's ONLY primary CTA, and parity_ia_addendum §1.6 authorizes
 * this wizard Chips + ghost Buttons only — so "Add to the opportunity
 * register" renders as `secondary`, never `primary`.
 *
 * REUSE, not a new pattern: message bubbles reuse `ChatMessage`'s exact
 * type from `ChatHero.tsx` (imported, not redeclared); the bubble visual
 * style itself is duplicated locally from ChatHero.tsx's own unexported
 * `bubbleStyle` helper, matching this codebase's established convention
 * for small per-file style duplication. Answer choices reuse Chip (P5,
 * `suggestion` variant); unlike ChatHero's own suggestion Chips (which
 * only fill the Input), this wizard's Chips submit their answer directly
 * and advance the step — a faithful port of the base engine's own
 * `chipPick()` behavior for intake mode (4333-4337 + 4434-4444).
 *
 * AMBIGUITY RESOLVED — free-text answers: chip-first UI is kept (INTAKE's
 * questions are closed-choice), but free-typed input DOES reach the flow
 * via `handleExternalInput` above, restoring the base's route()-accepts-
 * typed-answers behavior without adding a second Input of this
 * component's own.
 *
 * Irreversibility gate (persona directive 6): this component performs no
 * register mutation of its own — "Add to the opportunity register" only
 * emits `onComplete(opportunity)` as an intent; the composing screen owns
 * the real register write (now `state/demoStore.ts`'s
 * `acceptOpportunity`). Locally this component still guards against a
 * double-press firing the same intent twice (`reviewActionTaken`) and
 * against a double-click answering two questions at once (`chipsLocked`,
 * the ported `CHIP_LOCK_MS` debounce).
 *
 * Tests: src/__tests__/studio/chat-intake-wizard.test.tsx and
 * src/__tests__/engine_data/scoped-opportunity.test.ts execute this file's
 * behavior against the base anchors above (vitest + @testing-library).
 */
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Button } from '../components/primitives/Button';
import { Chip } from '../components/primitives/Chip';
import { Label } from '../components/primitives/Label';
import { Spinner } from '../components/primitives/Spinner';
import { Tag } from '../components/primitives/Tag';
import type { ChatMessage } from '../components/ChatHero';
import { INTAKE } from '../data/misc';
import { CTRL, GREEN, REGMAP, domainsFor } from '../data/studio';
import { fmt, riskLabel } from '../engine/plan';
import type { PlanOpportunity } from '../engine/plan';
import { getLiveLevers, useDemoStore } from '../state/demoStore';

/** Implementer judgment call (design_system_spec.md §1.4 carries no timing
 * values) — long enough that the "Thinking…" transition between questions
 * reads as a real pause, matching StudioAsk.tsx's own documented timing
 * convention (`ASK_SUBMIT_DELAY_MS`/`ASK_RENDER_DELAY_MS`). Collapses the
 * base engine's own two nested `botSay` delays for the opening line
 * (600ms + 650ms, 4365-4367) into one transition, since both stages
 * produce the identical final visible state here (intro, then the first
 * question) and this component has no separate typing-dots-per-message
 * animation to stagger. */
const OPENING_DELAY_MS = 700;
/** Implementer judgment call, same basis as `OPENING_DELAY_MS` — mirrors
 * the base engine's own per-step `botSay(..., 550)` pace (4442). */
const ADVANCE_DELAY_MS = 550;
/** Verbatim port of `__chipLock`'s own 700ms debounce window
 * (leapfi-platform.html:4332-4337) — the v1.045 "chips debounce" fix. */
const CHIP_LOCK_MS = 700;

export interface ChatIntakeWizardProps {
  /** The unmatched query/idea name being scoped — mirrors `startIntake(name)`'s own `name` parameter (leapfi-platform.html:4363). */
  useCaseName: string;
  /** Fires once the operator presses "Add to the opportunity register" on the completed envelope — mirrors `acceptProposed()` (4401-4412). The composing screen owns actually pushing this onto the shared register (`demoStore.acceptOpportunity`), exactly as `acceptProposed()` pushes onto the screen-level `OPPS` array, not a wizard-owned one. */
  onComplete: (opportunity: PlanOpportunity) => void;
  /** Fires on "Discard" after scoping completes — mirrors `discardProposed()` (4413). */
  onDiscard: () => void;
  /** Fires on the ghost "Cancel" Button, visible at every question step — mirrors `route()`'s `mode==='intake'` cancel branch (4435-4439). */
  onCancel: () => void;
  /** Fires whenever this component's own transcript (`buildMessages`'s
   * output — intro + answered/pending Q&A) changes. See file header
   * "TRANSCRIPT LIVES IN CHATHERO'S BOUNDED LOG, NOT A SECOND LIST" (fix
   * C-unbounded-growth-01) — the composing screen merges this into the
   * SAME array it hands ChatHero, so the whole conversation renders as one
   * bounded, auto-scrolling log instead of two. Does not include the
   * transient "Thinking…" indicator (still rendered locally). */
  onTranscriptChange?: (messages: ChatMessage[]) => void;
}

/** Imperative surface for the composing screen — the port of route()'s
 * intake-mode-consumes-all-input contract (base 4434-4444; STU-14). */
export interface ChatIntakeWizardHandle {
  /** Feed one submitted input from the composing screen's own Input into
   * the open intake. Returns true when the intake consumed it ('cancel'
   * cancels; during a question step the text is captured as the answer;
   * during a transition it is consumed and dropped — see file header).
   * Returns false while 'reviewing' (base: mode is back to 'idle' there),
   * meaning the caller should route the input normally. */
  handleExternalInput: (text: string) => boolean;
}

type WizardPhase = 'opening' | 'asking' | 'advancing' | 'reviewing';

const rootStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.875rem' };

/** Duplicated from ChatHero.tsx's own (unexported) `bubbleStyle` — see file header "REUSE, not a new pattern." Used here only for the local transient "Thinking…" indicator now (fix C-unbounded-growth-01 moved the persistent transcript bubbles up into ChatHero's own list, which owns this same style). */
function bubbleStyle(role: ChatMessage['role']): CSSProperties {
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

const suggestionRowStyle: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' };
const cancelRowStyle: CSSProperties = { display: 'flex' };
const reviewPanelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md, 10px)',
  background: 'var(--panel)',
  padding: '1rem 1.125rem',
};
const reviewRowStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.875rem', color: 'var(--ink)' };
const tagRowStyle: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.4rem' };
const reviewActionsStyle: CSSProperties = { display: 'flex', gap: '0.625rem', flexWrap: 'wrap' };

function dedupe(values: string[]): string[] {
  return values.filter((value, index) => values.indexOf(value) === index);
}

/**
 * Verbatim port of `finishIntake()`'s own envelope arithmetic
 * (leapfi-platform.html:4369-4396), INCLUDING the `disc:true` "from
 * Discovery" provenance flag (4385 — rendered by the plan engine as
 * `PlanTableRow.isFromDiscovery`, base 1287). `minGate`/`weakGate` are
 * computed exactly as `data/studio.ts`'s own (unexported) `gateCalc`,
 * duplicated locally per that file's own established convention.
 */
export function computeScopedOpportunity(name: string, answers: string[]): PlanOpportunity {
  const a0 = (answers[0] ?? '').toLowerCase();
  const a1 = (answers[1] ?? '').toLowerCase();
  const a2 = (answers[2] ?? '').toLowerCase();
  const a3 = (answers[3] ?? '').toLowerCase();

  const effT = a0.includes('depart') ? 2 : a0.includes('30+') ? 1 : 0;
  const volT = a1.includes('5,000+') ? 2 : a1.includes('500–') ? 1 : 0;
  const lending = a2.includes('lending');
  const memberFacing = a2.includes('member');
  const finrep = a2.includes('financial reporting') || a2.includes('gl') || a2.includes('sox');
  const pii = a3.includes('pii') && !a3.includes('no pii');
  const sensfin = a3.includes('sensitive financial');

  let g: string[];
  let r: PlanOpportunity['r'];
  let c: string;
  if (lending) {
    g = ['Fair Lending', 'Adverse Action', 'Model Risk'];
    r = 'high';
    c = 'Lending';
  } else if (memberFacing) {
    g = ['UDAAP', 'Model Risk'];
    r = 'med';
    c = 'Member service';
  } else if (finrep) {
    g = ['Model Risk', 'Privacy'];
    r = 'med';
    c = 'Operations';
  } else {
    g = ['Privacy'];
    r = 'low';
    c = 'Operations';
  }
  if (pii && !g.includes('Privacy')) g.push('Privacy');

  const cost = 40000 + volT * 20000 + (lending ? 60000 : 0) + (finrep ? 15000 : 0) + (pii ? 15000 : 0) + (sensfin ? 10000 : 0);
  const val = 80000 + effT * 60000 + volT * 40000;
  const h: PlanOpportunity['h'] = volT > 1 ? 'strategic' : 'quick';

  const minGate = Math.min(...g.map((k) => CTRL[k] ?? 0));
  const weakGate = [...g].sort((x, y) => (CTRL[x] ?? 0) - (CTRL[y] ?? 0))[0] ?? g[0] ?? '';

  // Base 4385: `var o={n:name,...,disc:true}` — the "from Discovery"
  // provenance flag travels with the scoped play.
  return { n: name, c, cost, val, h, r, g, minGate, weakGate, disc: true };
}

/**
 * Mirrors `startIntake`'s own opening line VERBATIM including the leading
 * "Good one. " sentence (leapfi-platform.html:4365; STU-15), plus the
 * answered-so-far question/answer pairs. The next unanswered question is
 * included ONLY when `revealNextQuestion` is true (`phase === 'asking'`)
 * — during the 'opening'/'advancing' "Thinking…" transitions the pending
 * question stays out of the DOM, matching the base botSay sequencing
 * (typing dots first, question text after the delay — 4365-4367, 4442;
 * STU-04).
 */
function buildMessages(useCaseName: string, answers: string[], revealNextQuestion: boolean): ChatMessage[] {
  const out: ChatMessage[] = [
    {
      id: 'intake-open',
      role: 'assistant',
      text: `Good one. I don't have a comparable for "${useCaseName}" in the library yet, so let me scope it properly. Four quick questions and I'll come back with a build estimate, the controls and regulations it touches, and where it slots on the roadmap.`,
    },
  ];
  INTAKE.forEach((question, index) => {
    if (index > answers.length) return;
    if (index === answers.length && !revealNextQuestion) return;
    out.push({ id: `intake-q-${index}`, role: 'assistant', text: question.q });
    const answer = answers[index];
    if (answer !== undefined) {
      out.push({ id: `intake-a-${index}`, role: 'user', text: answer });
    }
  });
  return out;
}

export const ChatIntakeWizard = forwardRef<ChatIntakeWizardHandle, ChatIntakeWizardProps>(function ChatIntakeWizard(
  { useCaseName, onComplete, onDiscard, onCancel, onTranscriptChange },
  ref,
) {
  const [phase, setPhase] = useState<WizardPhase>('opening');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [opportunity, setOpportunity] = useState<PlanOpportunity | null>(null);
  const [chipsLocked, setChipsLocked] = useState(false);
  const [reviewActionTaken, setReviewActionTaken] = useState(false);

  // Subscribes this component to lever changes so the review panel's
  // Value/Placement rows track the live adoption/tolerance state
  // (demoStore; STU-07).
  useDemoStore();

  const phaseTimeoutRef = useRef<number | undefined>(undefined);
  const lockTimeoutRef = useRef<number | undefined>(undefined);
  const sequenceRef = useRef(0);

  // Opening transition: only the intro message is visible (phase starts
  // 'opening'); after OPENING_DELAY_MS the first question appears — the
  // base startIntake sequencing (4365-4367).
  useEffect(() => {
    const mySeq = ++sequenceRef.current;
    phaseTimeoutRef.current = window.setTimeout(() => {
      if (sequenceRef.current !== mySeq) return;
      setPhase('asking');
    }, OPENING_DELAY_MS);
    return () => {
      if (phaseTimeoutRef.current !== undefined) window.clearTimeout(phaseTimeoutRef.current);
      if (lockTimeoutRef.current !== undefined) window.clearTimeout(lockTimeoutRef.current);
    };
  }, []);

  const handleChipPick = (answerText: string) => {
    if (phase !== 'asking' || chipsLocked) return; // v1.045 chip-debounce fix
    setChipsLocked(true);
    lockTimeoutRef.current = window.setTimeout(() => setChipsLocked(false), CHIP_LOCK_MS);

    const nextAnswers = [...answers, answerText];
    setAnswers(nextAnswers);
    setPhase('advancing');

    const mySeq = ++sequenceRef.current;
    phaseTimeoutRef.current = window.setTimeout(() => {
      if (sequenceRef.current !== mySeq) return; // superseded by Cancel or unmount
      const nextStep = step + 1;
      if (nextStep < INTAKE.length) {
        setStep(nextStep);
        setPhase('asking');
      } else {
        setOpportunity(computeScopedOpportunity(useCaseName, nextAnswers));
        setPhase('reviewing');
      }
    }, ADVANCE_DELAY_MS);
  };

  const handleCancel = () => {
    sequenceRef.current += 1; // invalidate any in-flight advance
    if (phaseTimeoutRef.current !== undefined) window.clearTimeout(phaseTimeoutRef.current);
    if (lockTimeoutRef.current !== undefined) window.clearTimeout(lockTimeoutRef.current);
    onCancel();
  };

  // Port of route()'s `mode==='intake'` consumes-all-input branch
  // (4434-4444; STU-14) — see `ChatIntakeWizardHandle`.
  useImperativeHandle(ref, () => ({
    handleExternalInput: (text: string): boolean => {
      if (phase === 'reviewing') return false; // base: mode back to 'idle' at review — route normally
      if (text.toLowerCase().includes('cancel')) {
        handleCancel(); // base 4435-4439
        return true;
      }
      if (phase === 'asking' && !chipsLocked) {
        handleChipPick(text); // base 4440-4443: the typed text IS the answer
        return true;
      }
      return true; // 'opening'/'advancing' transition: consumed, dropped (see file header)
    },
  }));

  const handleAdd = () => {
    if (reviewActionTaken || !opportunity) return; // guard: a double-press must not fire onComplete twice
    setReviewActionTaken(true);
    onComplete(opportunity);
  };

  const handleDiscard = () => {
    if (reviewActionTaken) return;
    setReviewActionTaken(true);
    onDiscard();
  };

  // Memoized so the array reference is stable across renders that don't
  // actually change useCaseName/answers/phase — `onTranscriptChange` below
  // fires an effect keyed on this reference, and an unmemoized fresh array
  // every render would re-fire (and re-render the composing screen) every
  // single render, not just on real transcript changes.
  const messages = useMemo(() => buildMessages(useCaseName, answers, phase === 'asking'), [useCaseName, answers, phase]);

  // Fix C-unbounded-growth-01 — see file header "TRANSCRIPT LIVES IN
  // CHATHERO'S BOUNDED LOG, NOT A SECOND LIST": hand the transcript up to
  // the composing screen instead of rendering a second, unbounded `<ul>`
  // here.
  useEffect(() => {
    onTranscriptChange?.(messages);
  }, [messages, onTranscriptChange]);

  const currentQuestion = phase === 'asking' ? INTAKE[step] : undefined;
  const busy = phase === 'opening' || phase === 'advancing';
  const showCancel = phase === 'asking' || phase === 'advancing';

  // Live levers for the review panel's Value/Placement rows (base
  // finishIntake reads readLevers() at render time, 4388-4394; STU-07).
  const L = getLiveLevers();

  // The Regulations row's conditional clauses derive purely from the
  // intake answers (base 4392; STU-09) — no lever reads involved.
  const a2 = (answers[2] ?? '').toLowerCase();
  const a3 = (answers[3] ?? '').toLowerCase();
  const finrep = a2.includes('financial reporting') || a2.includes('gl') || a2.includes('sox');
  const pii = a3.includes('pii') && !a3.includes('no pii');
  const sensfin = a3.includes('sensitive financial');

  return (
    <div style={rootStyle} data-lf-composite="chat-intake-wizard" data-phase={phase}>
      {/* Fix C-unbounded-growth-01: the persistent transcript (`messages`)
          no longer renders here — it's handed to the composing screen via
          `onTranscriptChange` above and rendered inside ChatHero's own
          bounded, auto-scrolling `<ul>`. Only the transient "Thinking…"
          indicator (never part of the growing history) stays local. */}
      {busy ? (
        <div style={{ ...bubbleStyle('assistant'), display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }} aria-hidden="true">
          <Spinner variant="inline" size="small" /> Thinking…
        </div>
      ) : null}

      {currentQuestion ? (
        <div style={suggestionRowStyle} role="group" aria-label="Answer choices">
          {currentQuestion.chips.map((choice) => (
            <Chip key={choice} text={choice} variant="suggestion" onPress={() => handleChipPick(choice)} disabled={chipsLocked} />
          ))}
        </div>
      ) : null}

      {showCancel ? (
        <div style={cancelRowStyle}>
          <Button label="✕ Cancel scoping" variant="ghost" onPress={handleCancel} />
        </div>
      ) : null}

      {phase === 'reviewing' && opportunity ? (
        <div style={reviewPanelStyle} aria-label="Scoping result">
          <div style={reviewRowStyle}>
            <Label text="Build" variant="eyebrow" />
            <span>
              ≈ {fmt(opportunity.cost)} one-time · {riskLabel(opportunity.r)} risk profile ({opportunity.c})
            </span>
          </div>
          <div style={reviewRowStyle}>
            {/* Base finishIntake Value row (4390): lever-scaled, at the live adoption setting (STU-07). */}
            <Label text="Value" variant="eyebrow" />
            <span>
              ≈ {fmt(opportunity.val * L.eff)}/yr at your {Math.round(L.eff * 100)}% adoption setting
            </span>
          </div>
          <div style={reviewRowStyle}>
            <Label text="Controls" variant="eyebrow" />
            <div style={tagRowStyle}>
              {opportunity.g.map((gate) => {
                const score = CTRL[gate] ?? 0;
                const ok = score >= GREEN;
                return <Tag key={gate} text={`${gate} ${score}%${ok ? ' · green' : ' · open'}`} variant={ok ? 'status-positive' : 'status-caution'} />;
              })}
            </div>
          </div>
          <div style={reviewRowStyle}>
            {/* Base Regulations row (4392) incl. its conditional SOX-404/ICFR and GLBA-safeguards clauses (STU-09). */}
            <Label text="Regulations impacted" variant="eyebrow" />
            <span>
              {dedupe(opportunity.g.map((gate) => REGMAP[gate]).filter((value): value is string => Boolean(value))).join(' · ')}
              {finrep ? ' · SOX 404 / ICFR: controls over financial reporting must be evidenced through the tool' : ''}
              {sensfin && !pii ? ' · sensitive financial, no PII: GLBA safeguards without privacy-notice triggers' : ''}
            </span>
          </div>
          <div style={reviewRowStyle}>
            {/* Display-name domains via domainsFor/DOMMAP (base 4299-4300, 4392) — never CTRLDOM routing slugs (STU-02). */}
            <Label text="Domains touched" variant="eyebrow" />
            <span>{domainsFor(opportunity.g).join(' · ')}</span>
          </div>
          <div style={reviewRowStyle}>
            {/* Base Placement row (4394): ready vs sequence-gated at the live tolerance (STU-07). */}
            <Label text="Placement" variant="eyebrow" />
            <span>
              {opportunity.minGate >= L.threshold
                ? 'Would be ready now at your current tolerance.'
                : `Would start sequence-gated. Unlocks after ${opportunity.weakGate} closes (${CTRL[opportunity.weakGate] ?? 0}% → ${GREEN}%).`}
            </span>
          </div>
          <div style={reviewActionsStyle}>
            {/* `secondary`, never `primary` — "Ask" is this screen's one primary CTA (spec §5.4/§6; STU-10). */}
            <Button label="Add to the opportunity register" variant="secondary" onPress={handleAdd} disabled={reviewActionTaken} />
            <Button label="Discard" variant="ghost" onPress={handleDiscard} disabled={reviewActionTaken} />
          </div>
        </div>
      ) : null}
    </div>
  );
});
