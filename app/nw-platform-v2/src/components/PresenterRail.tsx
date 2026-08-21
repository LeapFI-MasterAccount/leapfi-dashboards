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
 * STATE-MACHINE OWNERSHIP (AMBIGUITY RESOLVED; updated for D18 —
 * presenter_entry_redesign.md): this composite owns `visible` / `stepIndex`
 * internally (uncontrolled) and exposes exactly one imperative entry point
 * via `ref` — `start()` — for an external trigger that must reach into a
 * running state machine it does not itself own. Under D18, Home's "Start
 * the demo" CTA is STRUCK; the external trigger is now the `?present=1`
 * boot-time pre-stage (§2.3 — read in this file's own mount effect, see
 * "PRESENT QUERYSTRING PRE-STAGE" below), with the `ref` retained for any
 * shell caller. Every other trigger (`Ctrl+Alt+Shift+P`,
 * `Ctrl+Alt+Shift+←/→`, the Prev/Next/Restart buttons) is internal to this
 * file.
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
 * RESTART / resetDemo (AMBIGUITY RESOLVED; HR-ARC-02 fix wave correction
 * below): §4's `Restarting` row names an external `resetDemo()` event this
 * composite does not perform — `onRestart` is that external side effect (the
 * shell resets whatever demo data needs resetting), called synchronously
 * before this file advances its own `stepIndex` back to 0. This port's
 * resetDemo is a local React state reset, not a network call, so it
 * completes in the same tick — no separate loading/transient visual is added
 * for `Restarting` (contrast `OnSideDocuments.tsx`'s Adopt, which is
 * explicitly framed as "irreversible-feeling" and deliberately slowed so its
 * `loading` state reads as a real wait; Restart is presenter utility chrome,
 * not an irreversible operation, so an artificial delay here would just be
 * decorative latency with no truth behind it). HR-ARC-02: `handleRestart`
 * ALSO re-runs step 1's own `onNavigate(target)` after `onRestart()`, the
 * same call `start()` makes — an earlier revision relied solely on the
 * shell's `onRestart` side effect (which hardcodes `navigateToScreen('home')`)
 * to put the SCREEN at step 1 too, true only by coincidence for a script
 * whose step-1 target is `go:home`; false for SCRIPT_EXAMINER (step 1 is
 * `onside:overview`), which silently left the rail captioned "STEP 1" over
 * the bare Home screen. Restart now returns both the rail and the screen to
 * the step-1 state for any script.
 *
 * STANDING RULES BANNER content: from demo_script_draft.md's "Presenter
 * standing rules (bind every step)", amended by the T6.7 fix wave:
 *  - Pre-stage rule reworded (SH-2/RAIL-02 class): the twin wires no
 *    Alt+Shift+R chord anywhere, and the rail's Restart button now performs
 *    the full resetDemo (state/demoStore.ts, backbone fix), so the tag
 *    names the mechanism that actually exists instead of a dead chord the
 *    old tag advertised.
 *  - Fabricated-citations caution unchanged.
 *  - The `#eff`/G7 tag is REMOVED (RAIL-08): the doctrine rule was
 *    conditional — "Never touch the adoption slider #eff **until the twin
 *    fixes its value/label defect (G7)**" (demo_script_draft.md line 27) —
 *    and InvestmentDesign.tsx applied that fix (seeds `eff: 70` with the
 *    label derived from value, its header lines 26–39), so the prohibition
 *    no longer binds; keeping the tag had the rail asserting a defect this
 *    build fixed.
 *  - NEW third rule (presenter_entry_redesign.md §5.3, folded in here as
 *    that spec flags for T6.7): `?present=1` is address-bar-visible —
 *    present fullscreen/kiosk or trim the address bar before the room
 *    fills.
 * Tag (P4) has no multi-line prose slot, so each rule is condensed to
 * Tag-length text; the shared Label caption underneath carries the "bind
 * every step" framing the source itself states.
 *
 * NO Alt+Shift+R WIRING: `Alt+Shift+R` (pre-stage reset) is a presenter
 * standing-rule discipline note in demo_script_draft.md ("Pre-stage with
 * the demo reset... before the room fills"), not a trigger in
 * design_system_spec.md §4's PresenterRail state-machine table (only
 * `Alt+Shift+P` and `Alt+Shift+←/→` are named there). Out of this file's
 * cited scope; the Restart button (§4) is the in-rail equivalent once the
 * rail is visible.
 *
 * KEYBOARD CHORDS (D18 rebind, presenter_entry_redesign.md §2.2 — fixes
 * RAIL-03/SH-3): every rail chord is `Ctrl+Alt+Shift+…` (three modifiers —
 * outside Windows' documented two-modifier input-language-switch defaults,
 * the hazard family the old `Alt+Shift+…` binding sat inside) and is
 * matched on `event.code` (`KeyP` / `ArrowRight` / `ArrowLeft`), never
 * `event.key`: on macOS, Option participates in character composition
 * (Option+Shift+P yields `event.key === '∏'`), so a `key`-based match
 * silently never fires on a Mac — this file's earlier "no code fix
 * available" framing covered only the Windows OS-interception case and was
 * wrong for the macOS composition case, which `event.code` (layout- and
 * composition-independent) fixes outright. The `?present=1` pre-stage
 * (below) is now the load-bearing mechanism for the first, highest-stakes
 * reveal; the chord's remaining job is the ongoing hide/show toggle
 * mid-session (spec §3.4). Residual risk (unverified third-party global
 * hotkeys) disclosed, not eliminated — same category as
 * demo_script_draft.md's G2/G3.
 *
 * HR-ARC-03 (fix wave correction): a raw chord reveal that skipped the
 * `?present=1` pre-stage previously flipped `visible` with NO navigation —
 * coherent only when the screen already happened to match the current step
 * (true for the pre-staged/mid-script cases, false for a lost-querystring
 * reload or a second window). Every reveal (Hidden -> Visible, via this
 * chord) now re-runs the CURRENT step's own `onNavigate(target)`, the same
 * call `start()`/Restart make — the rail's caption and the screen it
 * describes can no longer disagree at the moment the rail becomes visible,
 * whether that is the very first reveal of the session or the Nth
 * hide/show toggle mid-demo.
 *
 * EDITABLE-ELEMENT GUARD (RAIL-05): every chord ignores keydowns whose
 * target is an input/textarea/select/contenteditable surface. Step 4's own
 * `do` line scripts typing into StudioAsk's chat input; without the guard,
 * a text-editing chord bubbling to this window listener would navigate
 * steps, unmount the active screen, and destroy the presenter's typed
 * state mid-demo.
 *
 * PRESENT QUERYSTRING PRE-STAGE (D18 §2.3): a mount-only check for
 * `?present=1` calls the same `start()` path Home's struck CTA used, so
 * the rail is staged before the room fills and the first reveal never
 * happens live. presenter_entry_redesign.md §4 places this check in
 * App.tsx; it lives here instead because App.tsx is outside this fix-wave
 * dispatch's ALLOWLIST — behavior is identical (one-time, boot-only, same
 * imperative entry point), flagged for the App-owning dispatch if it
 * prefers to host it. A mid-session reload keeping `?present=1` re-arms
 * the rail — the spec calls this intentional recovery behavior, not a bug.
 *
 * ICON CHOICES: Prev/Next reuse the existing closed `IconName` vocabulary
 * (`chevron-left` / `arrow-right` — the latter already used identically for
 * "forward" meaning elsewhere, e.g. `Toast`'s "View impact →", `BoardDeck`'s
 * CTA). Restart gets no icon — no restart/refresh glyph exists in the
 * closed vocabulary (`Icon.tsx`'s own documented STOP-item for exactly this
 * kind of gap); inventing one here would repeat the mistake that file's
 * author already flagged rather than committed.
 *
 * OCCLUSION COMPENSATION (RAIL-01/RAIL-09 — supersedes this header's
 * earlier "not a functional defect" claim, which was wrong: the opaque
 * fixed bar DID bury and click-block the Drawer's viewport-bottom footer —
 * step 3's Adopt/Reject buttons, the script's climax action — and the
 * final rail-height band of every scroll surface): while visible, the rail
 * publishes its measured height as `--lf-presenter-rail-h` on <html>
 * (ResizeObserver-tracked, so Collapse/Expand and viewport changes stay
 * correct) and renders a scoped stylesheet that (a) shortens every screen
 * root (`[data-lf-screen]`, inline `height: 100vh`) to
 * `calc(100vh - var(--lf-presenter-rail-h))` so fully-scrolled content
 * bottoms sit above the rail, and (b) raises the shared Drawer's bottom
 * edge (`[data-lf-composite="drawer"]`, inline `bottom: 0`) by the same
 * amount so its footer renders wholly above the rail. `!important` is
 * required to beat those inline declarations — Drawer.tsx/App.tsx are
 * outside this fix-wave dispatch's ALLOWLIST, so the compensation is
 * rail-side by construction, and it is self-cleaning: hiding the rail
 * unmounts the stylesheet and removes the variable. With the inset in
 * place the rail (z 70) and the Drawer (z 50) no longer overlap
 * geometrically, so the z-order keeps its original §4 job — Prev/Next/
 * Restart stay reachable above the Drawer's scrim (z 40) while a step's
 * drawer is open — without click-blocking anything.
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
 * TESTS (stale claim corrected by the T6.7 fix wave — an earlier header
 * revision said no test runner was installed): Vitest is installed; this
 * composite is covered by `src/__tests__/shell/presenter-rail.test.tsx`
 * and `presenter-entry-d18.test.tsx`, plus `npx tsc --noEmit` (strict,
 * `exactOptionalPropertyTypes`).
 */
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Button } from './primitives/Button';
import { Label } from './primitives/Label';
import { Tag } from './primitives/Tag';
import type { NonRaciTagVariant } from './primitives/Tag';
import type { ScriptDef } from '../data/script';

export interface PresenterRailHandle {
  /** Hidden -> Visible[step=1], always jumping to step 1 even mid-demo. D18: fired by the `?present=1` boot pre-stage (and any shell caller holding the ref) — Home's struck "Start the demo" CTA was the previous caller. */
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
  tagVariant: NonRaciTagVariant;
}

/** demo_script_draft.md "Presenter standing rules (bind every step)", T6.7-amended — see file header "STANDING RULES BANNER content." */
const STANDING_RULES: StandingRule[] = [
  { tagText: 'Pre-stage: Restart resets the demo', tagVariant: 'count' },
  { tagText: 'Citations are fabricated — characterize only', tagVariant: 'status-alert' },
  { tagText: 'Present fullscreen — ?present=1 shows in the address bar', tagVariant: 'status-caution' },
];

const RAIL_STYLE: CSSProperties = {
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 70, // see file header "OCCLUSION COMPENSATION"
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

// Layout/reset only — the eyebrow treatment itself (uppercase/tracking/
// weight/color) lives in Label (P3) `eyebrow`, §8 R-1.
const RULES_HEADING_STYLE: CSSProperties = {
  margin: 0,
  font: 'inherit',
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

/**
 * See file header "OCCLUSION COMPENSATION" (RAIL-01/RAIL-09). Rendered only
 * while the rail is visible; `!important` is needed to beat the inline
 * `height: 100vh` on every screen root and `bottom: 0` on the shared
 * Drawer — both files are outside this fix-wave dispatch's ALLOWLIST.
 */
const RAIL_INSET_CSS = `
[data-lf-screen] {
  height: calc(100vh - var(--lf-presenter-rail-h, 0px)) !important;
}
[data-lf-composite="drawer"] {
  bottom: var(--lf-presenter-rail-h, 0px) !important;
}
`;

/** RAIL-05: rail chords must never fire from inside a text-editing surface. */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target instanceof HTMLElement && target.isContentEditable) return true;
  return target.closest('[contenteditable="true"], [contenteditable=""]') !== null;
}

const SR_ONLY_STYLE: CSSProperties = {
  // Visually-hidden recipe — `top`/`left` pinned to 0 is load-bearing;
  // see the invariant note on `DataTable.tsx`'s `srOnlyStyle`. Without
  // it an unpositioned absolute box falls back to its in-flow static
  // position, which can extend `html.scrollHeight` past whatever
  // scroll container this rail is rendered inside.
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
    // HR-ARC-02 fix: re-run step 1's own navigation, exactly like `start()`
    // does below — Restart must return BOTH the rail's caption AND the
    // screen behind it to the step-1 state, never caption-only. Previously
    // this handler reset only local rail state and relied entirely on the
    // shell's `onRestart` side effect (App.tsx's `handleRestart`, which
    // hardcodes `navigateToScreen('home')`) to also land on the right
    // screen — true only by coincidence for a script whose own step-1
    // target happens to be `go:home`, false for any script (e.g.
    // SCRIPT_EXAMINER, whose step 1 target is `onside:overview`) where it
    // is not.
    if (first) onNavigate(first.target);
    setAnnouncement(`Restarted — step 1 of ${script.steps.length}${first ? `: ${first.title}` : ''}`);
    // `visible` is left untouched: Restarting transitions to Visible[step=1], never Hidden (§4).
  }, [onRestart, onNavigate, script]);

  const start = useCallback(() => {
    setStepIndex(0);
    setVisible(true);
    const first = script.steps[0];
    if (first) {
      onNavigate(first.target);
      setAnnouncement(`Step 1 of ${script.steps.length}: ${first.title}`);
    }
  }, [script, onNavigate]);

  useImperativeHandle(ref, () => ({ start }), [start]);

  // See file header "PRESENT QUERYSTRING PRE-STAGE" (D18 §2.3). The ref
  // guard keeps this boot-only across effect re-runs (e.g. StrictMode).
  const preStagedRef = useRef(false);
  useEffect(() => {
    if (preStagedRef.current) return;
    if (typeof window === 'undefined') return;
    if (new URLSearchParams(window.location.search).get('present') !== '1') return;
    preStagedRef.current = true;
    start();
  }, [start]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // D18 rebind (RAIL-03/SH-3): three-modifier chords matched on
      // `event.code` — see file header "KEYBOARD CHORDS."
      if (!event.ctrlKey || !event.altKey || !event.shiftKey) return;
      if (isEditableTarget(event.target)) return; // RAIL-05 — see file header "EDITABLE-ELEMENT GUARD"
      if (event.code === 'KeyP') {
        event.preventDefault();
        setVisible((current) => {
          const next = !current;
          // HR-ARC-03 fix: a reveal (Hidden -> Visible) must never show a
          // step caption the screen behind it disagrees with. Previously
          // this branch only flipped `visible` — coherent by construction
          // ONLY when the rail was pre-staged via `?present=1` (which calls
          // `start()`, itself an `onNavigate` call) or was already mid-script
          // on the right screen. A raw chord reveal with no pre-stage (lost
          // querystring on reload, second window, etc.) skipped navigation
          // entirely and showed "STEP 1 OF n" over whatever screen happened
          // to be mounted. Re-running the CURRENT step's own navigation on
          // every reveal keeps the caption and the screen in agreement
          // unconditionally — including the ordinary mid-session hide/show
          // toggle this chord is otherwise documented to do (file header
          // "KEYBOARD CHORDS"), where it is a harmless re-affirmation of the
          // screen the presenter is already claimed to be on.
          if (next && currentStep) onNavigate(currentStep.target);
          return next;
        });
        return;
      }
      if (!visible) return; // Next/Prev shortcuts only act from an adjacent Visible[step] state (§4)
      if (event.code === 'ArrowRight') {
        event.preventDefault();
        handleNext();
      } else if (event.code === 'ArrowLeft') {
        event.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, handleNext, handlePrev, currentStep, onNavigate]);

  // See file header "OCCLUSION COMPENSATION" (RAIL-01/RAIL-09): publish the
  // rail's live height so the injected stylesheet can inset screens and the
  // shared Drawer. `expanded` is a dep for the no-ResizeObserver fallback
  // (e.g. jsdom) so Collapse/Expand still re-measures.
  const railElRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!visible) return undefined;
    const el = railElRef.current;
    const root = document.documentElement;
    const measure = () => {
      root.style.setProperty('--lf-presenter-rail-h', `${el?.offsetHeight ?? 0}px`);
    };
    measure();
    let observer: ResizeObserver | undefined;
    if (el && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(measure);
      observer.observe(el);
    }
    return () => {
      observer?.disconnect();
      root.style.removeProperty('--lf-presenter-rail-h');
    };
  }, [visible, expanded]);

  if (!visible) return null; // see file header a11y baseline note

  const isFirstStep = stepIndex <= 0;
  const isLastStep = stepIndex >= script.steps.length - 1;

  return (
    <div ref={railElRef} role="region" aria-label="Presenter rail" data-lf-composite="presenter-rail" style={RAIL_STYLE}>
      {/* RAIL-01/RAIL-09 occlusion compensation — see file header. Unmounts with the rail. */}
      <style>{RAIL_INSET_CSS}</style>
      <span role="status" aria-live="polite" style={SR_ONLY_STYLE}>
        {announcement}
      </span>

      {/* A14 (design_system_spec.md §2.7): RAIL_STYLE (this component's own
          root) sets background: var(--panel) unconditionally — every Label
          in this component is panel-seated. */}
      <div style={HEADER_ROW_STYLE}>
        <div style={HEADER_TEXT_STYLE}>
          <Label text={`STEP ${stepIndex + 1} OF ${stepCount}`} variant="eyebrow" surface="panel" />
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
            <Label text="Say" variant="body-secondary" surface="panel" />
            <p style={TEXT_STYLE}>{currentStep?.say}</p>
          </div>
          <div style={TEXT_BLOCK_STYLE}>
            <Label text="Do" variant="body-secondary" surface="panel" />
            <p style={TEXT_STYLE}>{currentStep?.do}</p>
          </div>
        </div>
      ) : null}

      <div style={RULES_SECTION_STYLE}>
        <h3 style={RULES_HEADING_STYLE}>
          <Label text="Standing rules" variant="eyebrow" surface="panel" />
        </h3>
        <div style={RULES_TAG_ROW_STYLE}>
          {STANDING_RULES.map((rule) => (
            <Tag key={rule.tagText} text={rule.tagText} variant={rule.tagVariant} />
          ))}
        </div>
        <Label text="Bind every step of this script." variant="body-secondary" surface="panel" />
      </div>

      <div style={CONTROLS_ROW_STYLE}>
        <Button variant="ghost" icon="chevron-left" label="Prev" onPress={handlePrev} disabled={isFirstStep} />
        <Button variant="ghost" icon="arrow-right" label="Next" onPress={handleNext} disabled={isLastStep} />
        <Button variant="ghost" label="Restart" onPress={handleRestart} />
      </div>
    </div>
  );
});
