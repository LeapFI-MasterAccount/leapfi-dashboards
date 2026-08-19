/**
 * PresenterRail — Composite C21 (design_system_spec.md §2.2, §4)
 *
 * "Label (step indicator 'n/7' + title) + collapsible say/do text (Label
 * blocks) + StandingRulesBanner (Tag ×N + Label) + Button ×3 (`ghost`:
 * Prev, Next, Restart)." Implements the §4 state machine exactly:
 * `Hidden` (default) / `Visible[step=n]` / `Restarting` (transient).
 *
 * "Not the shared Drawer (C7) — running the rail through the single shared
 * drawer would conflict with steps 2/3/5's own drawer usage... the rail is
 * its own overlay layer" (§4). This file mounts no `<Drawer>`.
 *
 * STATE-MACHINE OWNERSHIP (AMBIGUITY RESOLVED): `Home.tsx`'s own header
 * comment states plainly: "PresenterRail (C21) is outside this dispatch's
 * ALLOWLIST... this screen exposes a required `onStartDemo: () => void`
 * prop and fires it verbatim on press — it does not own or fake the rail's
 * state machine itself... The integrating dispatch wires this callback to
 * the real rail transition." This composite therefore owns `visible` /
 * `stepIndex` internally (uncontrolled), and exposes exactly one imperative
 * entry point via `ref` — `start()` — for the one external trigger
 * (`Home`'s "Start the demo" CTA, §5.1) that must reach into a running
 * state machine it does not itself own. Every other trigger (`Alt+Shift+P`,
 * `Alt+Shift+←/→`, the Prev/Next/Restart buttons) is internal to this file.
 *
 * NAVIGATION DISPATCH (AMBIGUITY RESOLVED): §4 states Next/Prev resolution
 * is "mapped onto the shell's existing nav functions only" — those nav
 * functions belong to the shell (`App.tsx`), not this composite. This file
 * therefore hands the shell the step's *raw target token* via
 * `onNavigate(target)`; `resolveTarget` (data/script.ts) and the actual
 * screen switch both live in the shell. This composite never resolves a
 * token itself, keeping the token grammar/mapping in exactly one place
 * (script.ts) — the same file the D4 "one array + one registry entry, no
 * new nav plumbing" swap guarantee already depends on.
 *
 * RESTART / resetDemo (AMBIGUITY RESOLVED): §4's `Restarting` row names an
 * external `resetDemo()` event this composite does not perform — `onRestart`
 * is that external side effect (the shell resets whatever demo data needs
 * resetting and navigates home), called synchronously before this file
 * advances its own `stepIndex` back to 0. This port's resetDemo is a local
 * React state reset, not a network call, so it completes in the same tick —
 * no separate loading/transient visual is added for `Restarting` (contrast
 * `OnSideDocuments.tsx`'s Adopt, which is explicitly framed as
 * "irreversible-feeling" and deliberately slowed so its `loading` state
 * reads as a real wait; Restart is presenter utility chrome, not an
 * irreversible operation, so an artificial delay here would just be
 * decorative latency with no truth behind it).
 *
 * STANDING RULES BANNER content: ported from demo_script_draft.md's
 * "Presenter standing rules (bind every step)" (3 rules — pre-stage reset,
 * fabricated-citations caution, the `#eff`/G7 defect hazard). Tag (P4) has
 * no multi-line prose slot, so each rule is condensed to Tag-length text;
 * the shared Label caption underneath carries the "bind every step" framing
 * the source itself states.
 *
 * NO Alt+Shift+R WIRING: `Alt+Shift+R` (pre-stage reset) is a presenter
 * standing-rule discipline note in demo_script_draft.md ("Pre-stage with
 * the demo reset... before the room fills"), not a trigger in
 * design_system_spec.md §4's PresenterRail state-machine table (only
 * `Alt+Shift+P` and `Alt+Shift+←/→` are named there). Out of this file's
 * cited scope; the Restart button (§4) is the in-rail equivalent once the
 * rail is visible.
 *
 * KEYBOARD-CHORD HAZARD (flagged, not silently assumed safe): `Alt+Shift`
 * is a default OS input-language-switch shortcut on Windows in many
 * locales. This file `preventDefault()`s the chord at the browser level,
 * but cannot correct for an OS intercepting it before the page ever sees
 * the keydown — same HAZARD category as demo_script_draft.md's own
 * G2/G3 entries (presenter discipline, no code fix available).
 *
 * ICON CHOICES: Prev/Next reuse the existing closed `IconName` vocabulary
 * (`chevron-left` / `arrow-right` — the latter already used identically for
 * "forward" meaning elsewhere, e.g. `Toast`'s "View impact →", `BoardDeck`'s
 * CTA). Restart gets no icon — no restart/refresh glyph exists in the
 * closed vocabulary (`Icon.tsx`'s own documented STOP-item for exactly this
 * kind of gap); inventing one here would repeat the mistake that file's
 * author already flagged rather than committed.
 *
 * Z-INDEX (implementer judgment call, same category as `Drawer.tsx`'s
 * documented 480px/200ms constants): set above `Drawer`'s dialog (z-index
 * 50) so Prev/Next/Restart stay reachable while a step's Drawer is open —
 * script steps 2, 3, and 5 each open a Drawer as part of their demoed
 * action, so the rail cannot afford to be buried under one. Consequence
 * flagged, not silently absorbed: because `Drawer.tsx` is outside this
 * dispatch's allowlist, this file cannot inset the Drawer's own bottom edge
 * to make room, so an open Drawer's lower portion can sit visually behind
 * the rail bar when both are on screen at once. Both stay independently
 * operable (the rail is not modal and only occupies its own bar's
 * footprint) — a known visual interaction to flag for design-authority
 * review, not a functional defect.
 *
 * A11y baseline (§2.2 C21): "Entire rail is `aria-hidden` and removed from
 * tab order while hidden — not merely visually hidden." Implemented by
 * returning `null` for the entire hidden-state render (same pattern
 * `Drawer.tsx` uses for its own `closed` phase) — nothing in the DOM means
 * no tab stops and no `aria-hidden` bookkeeping needed. The component
 * itself stays mounted at all times (App.tsx renders `<PresenterRail>`
 * unconditionally) so its `Alt+Shift+P` listener keeps working even while
 * its own render output is `null`.
 *
 * STOP-item — no executable test run: this worktree's `package.json` (out
 * of this dispatch's ALLOWLIST) has no test runner installed, matching
 * every sibling composite already landed here. Verified via
 * `npx tsc --noEmit` against the whole `src/` tree instead (strict mode,
 * `exactOptionalPropertyTypes`) to confirm this file type-checks against
 * the real `Button`/`Label`/`Tag` primitive prop shapes and `data/script.ts`'s
 * real `ScriptDef`/`ScriptStep` shapes.
 */
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import type { CSSProperties } from 'react';
import { Button } from './primitives/Button';
import { Label } from './primitives/Label';
import { Tag } from './primitives/Tag';
import type { TagVariant } from './primitives/Tag';
import type { ScriptDef } from '../data/script';

export interface PresenterRailHandle {
  /** Home's "Start the demo" CTA (§5.1): Hidden -> Visible[step=1], always jumping to step 1 even mid-demo. */
  start: () => void;
}

export interface PresenterRailProps {
  /** Active script the rail steps through. Swapping this prop to a different SCRIPTS entry is the entire "second script" story (D4) — no other prop or internal state shape changes. */
  script: ScriptDef;
  /** Called with a step's raw target token (e.g. "onside:feed") whenever Start/Next/Prev moves the rail. The shell resolves the token and performs the actual navigation — see file header "NAVIGATION DISPATCH." */
  onNavigate: (target: string) => void;
  /** Called when Restart is pressed, before this component's own step position resets to 1 — the shell performs the actual resetDemo side effect. See file header "RESTART / resetDemo." */
  onRestart: () => void;
}

interface StandingRule {
  tagText: string;
  tagVariant: TagVariant;
}

/** demo_script_draft.md "Presenter standing rules (bind every step)" — see file header "STANDING RULES BANNER content." */
const STANDING_RULES: StandingRule[] = [
  { tagText: 'Pre-staged (Alt+Shift+R)', tagVariant: 'count' },
  { tagText: 'Citations are fabricated — characterize only', tagVariant: 'status-alert' },
  { tagText: 'Never touch #eff (G7 defect)', tagVariant: 'status-caution' },
];

const RAIL_STYLE: CSSProperties = {
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 70, // see file header "Z-INDEX"
  background: 'var(--panel)',
  borderTop: '1px solid var(--border)',
  boxShadow: '0 -8px 24px color-mix(in srgb, var(--bg) 55%, transparent)',
  padding: '1rem 1.5rem',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.875rem',
  maxHeight: '60vh',
  overflowY: 'auto',
};

const HEADER_ROW_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '1rem',
};

const HEADER_TEXT_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
};

const TITLE_STYLE: CSSProperties = {
  margin: 0,
  font: 'inherit',
  fontSize: '1.0625rem',
  fontWeight: 700,
  color: 'var(--ink)',
};

const BODY_STYLE: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1.5rem',
};

const TEXT_BLOCK_STYLE: CSSProperties = {
  flex: '1 1 16rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
};

const TEXT_STYLE: CSSProperties = {
  margin: 0,
  fontSize: '0.875rem',
  color: 'var(--ink)',
  lineHeight: 1.45,
};

const RULES_SECTION_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  borderTop: '1px solid var(--border)',
  paddingTop: '0.75rem',
};

const RULES_HEADING_STYLE: CSSProperties = {
  margin: 0,
  font: 'inherit',
  fontSize: '0.75rem',
  fontWeight: 700,
  color: 'var(--ink2)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const RULES_TAG_ROW_STYLE: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
};

const CONTROLS_ROW_STYLE: CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  justifyContent: 'flex-end',
  borderTop: '1px solid var(--border)',
  paddingTop: '0.75rem',
};

const SR_ONLY_STYLE: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export const PresenterRail = forwardRef<PresenterRailHandle, PresenterRailProps>(function PresenterRail(
  { script, onNavigate, onRestart },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [expanded, setExpanded] = useState(true);
  const [announcement, setAnnouncement] = useState('');

  const stepCount = script.steps.length;
  const currentStep = script.steps[stepIndex];

  const goToStep = useCallback(
    (nextIndex: number) => {
      const nextStep = script.steps[nextIndex];
      if (!nextStep) return;
      setStepIndex(nextIndex);
      onNavigate(nextStep.target);
      setAnnouncement(`Step ${nextIndex + 1} of ${script.steps.length}: ${nextStep.title}`);
    },
    [script, onNavigate],
  );

  const handleNext = useCallback(() => {
    if (stepIndex >= script.steps.length - 1) return; // terminal step — Next disabled/absent (§4)
    goToStep(stepIndex + 1);
  }, [stepIndex, script, goToStep]);

  const handlePrev = useCallback(() => {
    if (stepIndex <= 0) return; // re-resolves the previous step's target directly, never BackChip (§3.2/§4)
    goToStep(stepIndex - 1);
  }, [stepIndex, goToStep]);

  const handleRestart = useCallback(() => {
    onRestart(); // external resetDemo side effect — see file header "RESTART / resetDemo"
    setStepIndex(0);
    const first = script.steps[0];
    setAnnouncement(`Restarted — step 1 of ${script.steps.length}${first ? `: ${first.title}` : ''}`);
    // `visible` is left untouched: Restarting transitions to Visible[step=1], never Hidden (§4).
  }, [onRestart, script]);

  useImperativeHandle(
    ref,
    () => ({
      start: () => {
        setStepIndex(0);
        setVisible(true);
        const first = script.steps[0];
        if (first) {
          onNavigate(first.target);
          setAnnouncement(`Step 1 of ${script.steps.length}: ${first.title}`);
        }
      },
    }),
    [script, onNavigate],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey || !event.shiftKey) return;
      const key = event.key.toLowerCase();
      if (key === 'p') {
        event.preventDefault();
        setVisible((current) => !current); // toggle retains step position (§4 Hidden exit note)
        return;
      }
      if (!visible) return; // Next/Prev shortcuts only act from an adjacent Visible[step] state (§4)
      if (key === 'arrowright') {
        event.preventDefault();
        handleNext();
      } else if (key === 'arrowleft') {
        event.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, handleNext, handlePrev]);

  if (!visible) return null; // see file header a11y baseline note

  const isFirstStep = stepIndex <= 0;
  const isLastStep = stepIndex >= script.steps.length - 1;

  return (
    <div role="region" aria-label="Presenter rail" data-lf-composite="presenter-rail" style={RAIL_STYLE}>
      <span role="status" aria-live="polite" style={SR_ONLY_STYLE}>
        {announcement}
      </span>

      <div style={HEADER_ROW_STYLE}>
        <div style={HEADER_TEXT_STYLE}>
          <Label text={`STEP ${stepIndex + 1} OF ${stepCount}`} variant="eyebrow" />
          <h2 style={TITLE_STYLE}>{currentStep?.title ?? script.label}</h2>
        </div>
        <Button
          variant="ghost"
          label={expanded ? 'Collapse' : 'Expand'}
          icon={expanded ? 'chevron-down' : 'chevron-right'}
          onPress={() => setExpanded((current) => !current)}
        />
      </div>

      {expanded ? (
        <div style={BODY_STYLE}>
          <div style={TEXT_BLOCK_STYLE}>
            <Label text="Say" variant="body-secondary" />
            <p style={TEXT_STYLE}>{currentStep?.say}</p>
          </div>
          <div style={TEXT_BLOCK_STYLE}>
            <Label text="Do" variant="body-secondary" />
            <p style={TEXT_STYLE}>{currentStep?.do}</p>
          </div>
        </div>
      ) : null}

      <div style={RULES_SECTION_STYLE}>
        <h3 style={RULES_HEADING_STYLE}>Standing rules</h3>
        <div style={RULES_TAG_ROW_STYLE}>
          {STANDING_RULES.map((rule) => (
            <Tag key={rule.tagText} text={rule.tagText} variant={rule.tagVariant} />
          ))}
        </div>
        <Label text="Bind every step of this script." variant="body-secondary" />
      </div>

      <div style={CONTROLS_ROW_STYLE}>
        <Button variant="ghost" icon="chevron-left" label="Prev" onPress={handlePrev} disabled={isFirstStep} />
        <Button variant="ghost" icon="arrow-right" label="Next" onPress={handleNext} disabled={isLastStep} />
        <Button variant="ghost" label="Restart" onPress={handleRestart} />
      </div>
    </div>
  );
});
