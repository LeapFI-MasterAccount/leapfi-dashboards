/**
 * ChatIntakeWizard — extends ChatHero (C10)'s already-spec'd `no-match`
 * fallback state (design_system_spec.md §2.2 C10 states list; §5.4) into a
 * guided, 4-question scoping sequence over `data/misc.ts`'s `INTAKE`
 * question set. parity_ia_addendum.md §1.6 / Batch 8 (dispatch
 * batch-8-chat-intake-and-board-log).
 *
 * Base engine anchors (leapfi-platform.html):
 *   - chatState / INTAKE literal: 4328, 4357-4362
 *   - startIntake (opening line + first question): 4363-4368
 *   - route()'s `mode==='intake'` branch (per-step answer handling +
 *     "Cancel scoping" handling): 4434-4444
 *   - finishIntake (envelope arithmetic ported verbatim into
 *     `computeScopedOpportunity` below): 4369-4400
 *   - acceptProposed / discardProposed (the two terminal actions this
 *     component exposes as `onComplete` / `onDiscard` callbacks, never
 *     performed locally — see WIRING NOTE): 4401-4413
 *   - chip debounce / visible-Cancel-at-every-step: the v1.045 changelog
 *     entry (leapfi-platform.html:1085) names both fixes together —
 *     "The wizard carries a visible Cancel at every step... Chips
 *     debounce, so a double-click cannot answer two questions." Both are
 *     ported: `__chipLock`'s own 700ms window (4332-4337) verbatim as
 *     `CHIP_LOCK_MS`, and the ghost Cancel Button rendered for the
 *     lifetime of every question step.
 *
 * WIRING NOTE (out of this dispatch's allowlist — StudioAsk.tsx is
 * off-limits, per dispatch HARD RULES and this file's own task line
 * "never touch StudioAsk.tsx's existing 'Ask' primary Button or its
 * wiring"): this component is a self-contained, controlled sub-flow
 * intended to render in StudioAsk.tsx's message-list slot once ChatHero
 * reaches its `no-match` state and the operator presses the "Scope
 * '<query>' as a new use case" chip StudioAsk.tsx's own `route()`-
 * equivalent already offers there (leapfi-platform.html:4469-4470 is the
 * base-engine precedent for that entry chip; StudioAsk.tsx's current
 * `no-match` rendering is plain-text only and does not yet offer it — a
 * follow-up wiring dispatch adds the chip and mounts this component).
 * `useCaseName` is that query's text, mirroring `startIntake(name)`'s own
 * `name` parameter. This component owns only the intake mechanics
 * (question sequencing, answer capture, envelope computation, the
 * debounce/cancel affordances); it never mutates any shared register
 * itself — `onComplete`/`onDiscard`/`onCancel` are intents the composing
 * screen (which owns the real opportunity register / chat message log,
 * exactly as `chatState`/`OPPS`/`botSay` are screen-level in the base
 * engine) is responsible for acting on. This mirrors ChatHero.tsx's own
 * "fully controlled/presentational... never fabricates state locally"
 * discipline (its file header, Core Principle 3).
 *
 * REUSE, not a new pattern: message bubbles reuse `ChatMessage`'s exact
 * type from `ChatHero.tsx` (imported, not redeclared — Core Principle 2:
 * "a hand-rolled interface shadowing... is a defect"); the bubble visual
 * style itself is duplicated locally from ChatHero.tsx's own unexported
 * `bubbleStyle` helper, matching this codebase's established convention
 * for small per-file style duplication (see ChatHero.tsx's own
 * `CounterTile`/StudioAsk.tsx's `stripInlineTags` file-header notes for
 * the identical precedent). Answer choices reuse Chip (P5, `suggestion`
 * variant) exactly as ChatHero's own suggestion row does; unlike
 * ChatHero's own suggestion Chips (which only fill the Input — a
 * StudioAsk-level wiring choice for the free-form Ask box), this
 * wizard's Chips submit their answer directly and advance the step, which
 * is a faithful port of the base engine's own `chipPick()` behavior for
 * intake mode specifically (`chipPick` -> `userSend()` -> `route()`,
 * 4333-4337 + 4434-4444) — a different screen wiring decision for the
 * same reusable Chip primitive, not a change to Chip itself.
 *
 * AMBIGUITY RESOLVED — envelope arithmetic vs. lever-scaled value/
 * placement: `finishIntake()`'s "Value" row scales by `readLevers().eff`
 * (the investment-lever adoption setting) and its "Placement" row compares
 * `o.minGate` against `readLevers().threshold` — both read slider state
 * owned by a different composite (`SliderControlRow`/Home's investment
 * levers) that this component has no prop access to and that is out of
 * this dispatch's scope to newly wire in. This component renders the
 * unscaled base `val` (labeled "Estimated annual value," not
 * lever-adjusted) and omits the "Placement" (ready-now vs.
 * sequence-gated) row entirely rather than fabricate a lever reading —
 * consistent with Core Principle 3 ("no fabricated intermediate state").
 * The "Controls" row's own green/open split needs no lever value (it
 * compares directly against the fixed `GREEN` constant, exactly as
 * `finishIntake()` itself does for that row), so it is rendered in full.
 * STOP-item for the composing/wiring dispatch: reintroduce the
 * lever-scaled Value and Placement rows once this component is handed
 * the owning screen's `Levers`/`readLevers` result as a prop.
 *
 * AMBIGUITY RESOLVED — free-text answers: the base engine's `route()`
 * accepts a free-typed answer during intake mode, not only a chip pick
 * (any `route(q)` call while `chatState.mode==='intake'` advances the
 * step, 4434-4444). This component renders chip-only answers: the task
 * line's own component list for this file names only "ChatHero's...
 * suggestion-Chip (P5) pattern," no Input, and INTAKE's own questions are
 * closed-choice (each question ships an exhaustive chip set in the
 * source data) — so a chip-only guided sequence is a faithful reduction,
 * not a missing capability, and keeps this file's allowlist-only
 * component free of a second, unrequested Input wiring path.
 *
 * Accessibility gate (persona directive 7): message bubbles reuse
 * ChatHero's own restrained live-region doctrine — only the latest
 * assistant bubble gets `role="status"`/`aria-live="polite"`, and only
 * once it is not itself mid-"Thinking…" transition, so assistive tech
 * gets one coherent announcement per question rather than a flood (same
 * "one summarized announcement" doctrine ChatHero.tsx's own header and
 * StudioAsk.tsx's register-announcement both already establish in this
 * codebase). Every control (Chip, ghost Cancel, primary Add, ghost
 * Discard) is a native `<button>` via the existing Chip/Button
 * primitives, so full keyboard operability and visible focus are
 * inherited, not re-implemented. Control status in the review panel
 * pairs color with text on every Tag (`"<gate> <score>% · green|open"`),
 * never color alone, per Tag's own a11y baseline.
 *
 * Irreversibility gate (persona directive 6): this component performs no
 * server mutation and holds no irreversible operation of its own — "Add
 * to the opportunity register" only emits `onComplete(opportunity)` as an
 * intent; the composing screen (out of this dispatch's allowlist) owns
 * whatever persistence/idempotency guarantee a real register write needs,
 * exactly as `StudioAsk.tsx`'s own header note reasons for its
 * (also non-irreversible, read-only) Ask flow. Locally, this component
 * still guards against a double-press firing the same intent twice
 * (`reviewActionTaken`) and against a double-click answering two
 * questions at once (`chipsLocked`, the ported `CHIP_LOCK_MS` debounce)
 * as UX-level courtesy, not a substitute for the composing screen's own
 * guarantee.
 *
 * STOP-item — no executable test run: matches every sibling
 * screen/composite already landed in this worktree (see StudioAsk.tsx's
 * identical note) — this worktree's `package.json` (out of allowlist) has
 * no test runner installed. Verified instead via `npx tsc --noEmit`
 * (strict mode, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`)
 * against the real `ChatHero`/`Chip`/`Button`/`Tag`/`Label` prop shapes
 * and the real `StudioOpportunity`/`IntakeQuestion` data types.
 */
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Button } from '../components/primitives/Button';
import { Chip } from '../components/primitives/Chip';
import { Label } from '../components/primitives/Label';
import { Spinner } from '../components/primitives/Spinner';
import { Tag } from '../components/primitives/Tag';
import type { ChatMessage } from '../components/ChatHero';
import { INTAKE } from '../data/misc';
import { CTRL, GREEN, REGMAP, CTRLDOM } from '../data/studio';
import type { StudioOpportunity } from '../data/studio';
import { fmt, riskLabel } from '../engine/plan';

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
  /** Fires once the operator presses "Add to the opportunity register" on the completed envelope — mirrors `acceptProposed()` (4401-4412). The composing screen owns actually pushing this onto its own register, exactly as `acceptProposed()` pushes onto the screen-level `OPPS` array, not a wizard-owned one. */
  onComplete: (opportunity: StudioOpportunity) => void;
  /** Fires on "Discard" after scoping completes — mirrors `discardProposed()` (4413). */
  onDiscard: () => void;
  /** Fires on the ghost "Cancel" Button, visible at every question step — mirrors `route()`'s `mode==='intake'` cancel branch (4435-4439). */
  onCancel: () => void;
}

type WizardPhase = 'opening' | 'asking' | 'advancing' | 'reviewing';

const rootStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.875rem' };

const messageListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.625rem',
  margin: 0,
  padding: 0,
  listStyle: 'none',
};

/** Duplicated from ChatHero.tsx's own (unexported) `bubbleStyle` — see file header "REUSE, not a new pattern." */
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
 * (leapfi-platform.html:4369-4396), minus the lever-scaled Value/
 * Placement rows — see file header "AMBIGUITY RESOLVED — envelope
 * arithmetic vs. lever-scaled value/placement." `minGate`/`weakGate` are
 * computed exactly as `data/studio.ts`'s own (unexported) `gateCalc`,
 * duplicated locally per that file's own established convention (see
 * `StudioAsk.tsx`'s identical `buildAutoLoanOpportunityRow` note).
 */
export function computeScopedOpportunity(name: string, answers: string[]): StudioOpportunity {
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
  let r: StudioOpportunity['r'];
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
  const h: StudioOpportunity['h'] = volT > 1 ? 'strategic' : 'quick';

  const minGate = Math.min(...g.map((k) => CTRL[k] ?? 0));
  const weakGate = [...g].sort((x, y) => (CTRL[x] ?? 0) - (CTRL[y] ?? 0))[0] ?? g[0] ?? '';

  return { n: name, c, cost, val, h, r, g, minGate, weakGate };
}

/** Mirrors `startIntake`'s own opening line (leapfi-platform.html:4365), plus the answered-so-far question/answer pairs. */
function buildMessages(useCaseName: string, answers: string[]): ChatMessage[] {
  const out: ChatMessage[] = [
    {
      id: 'intake-open',
      role: 'assistant',
      text: `I don't have a comparable for "${useCaseName}" in the library yet, so let me scope it properly. Four quick questions and I'll come back with a build estimate, the controls and regulations it touches, and where it slots on the roadmap.`,
    },
  ];
  INTAKE.forEach((question, index) => {
    if (index > answers.length) return;
    out.push({ id: `intake-q-${index}`, role: 'assistant', text: question.q });
    const answer = answers[index];
    if (answer !== undefined) {
      out.push({ id: `intake-a-${index}`, role: 'user', text: answer });
    }
  });
  return out;
}

export function ChatIntakeWizard({ useCaseName, onComplete, onDiscard, onCancel }: ChatIntakeWizardProps) {
  const [phase, setPhase] = useState<WizardPhase>('opening');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [opportunity, setOpportunity] = useState<StudioOpportunity | null>(null);
  const [chipsLocked, setChipsLocked] = useState(false);
  const [reviewActionTaken, setReviewActionTaken] = useState(false);

  const phaseTimeoutRef = useRef<number | undefined>(undefined);
  const lockTimeoutRef = useRef<number | undefined>(undefined);
  const sequenceRef = useRef(0);

  // Opening transition: intro message is already visible (phase starts
  // 'opening'); after OPENING_DELAY_MS the first question appears. See
  // file header note on collapsing the base engine's two nested delays.
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

  const messages = buildMessages(useCaseName, answers);
  const currentQuestion = phase === 'asking' ? INTAKE[step] : undefined;
  const busy = phase === 'opening' || phase === 'advancing';
  const showCancel = phase === 'asking' || phase === 'advancing';

  return (
    <div style={rootStyle} data-lf-composite="chat-intake-wizard" data-phase={phase}>
      <ul aria-label="Scoping conversation" style={messageListStyle}>
        {messages.map((message, index) => {
          const isLastAssistantSettled = !busy && index === messages.length - 1 && message.role === 'assistant';
          return (
            <li
              key={message.id}
              style={bubbleStyle(message.role)}
              role={isLastAssistantSettled ? 'status' : undefined}
              aria-live={isLastAssistantSettled ? 'polite' : undefined}
            >
              {message.text}
            </li>
          );
        })}
        {busy ? (
          <li style={{ ...bubbleStyle('assistant'), display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }} aria-hidden="true">
            <Spinner variant="inline" size="small" /> Thinking…
          </li>
        ) : null}
      </ul>

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
            <Label text="Estimated annual value" variant="eyebrow" />
            <span>≈ {fmt(opportunity.val)}/yr</span>
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
            <Label text="Regulations impacted" variant="eyebrow" />
            <span>{dedupe(opportunity.g.map((gate) => REGMAP[gate]).filter((value): value is string => Boolean(value))).join(' · ')}</span>
          </div>
          <div style={reviewRowStyle}>
            <Label text="Domains touched" variant="eyebrow" />
            <span>{dedupe(opportunity.g.map((gate) => CTRLDOM[gate]).filter((value): value is string => Boolean(value))).join(' · ')}</span>
          </div>
          <div style={reviewActionsStyle}>
            <Button label="Add to the opportunity register" variant="primary" onPress={handleAdd} disabled={reviewActionTaken} />
            <Button label="Discard" variant="ghost" onPress={handleDiscard} disabled={reviewActionTaken} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
