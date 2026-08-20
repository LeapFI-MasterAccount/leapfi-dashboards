/**
 * ShowTheWorkingPanel — r03 "Show the working" scoped-lever panel
 * (`planning/r03_show_the_working.md` AC-r03-1..8; `01-architecture.md`
 * §3, r03's third, panel-local lever mode).
 *
 * A reusable Drawer(C7, `'wide'`)+Slider(P7) composition, not a new
 * component in the design-vocabulary sense (AC-r03-3 — no file under
 * `components/`, no new prop/variant on `Slider.tsx`; this file lives
 * under `views/`, the screen-content-assembly layer, same distinction
 * `01-architecture.md` §7 draws between the 12+22 catalog and "new
 * business logic behind already-built UI"). Composes C7 + P7 +
 * `StatValue` (P11) only.
 *
 * STATE-ISOLATION CONTRACT (the whole point of this requirement, per the
 * dispatch brief and `01-architecture.md` §3's "third, narrower need"):
 * the assumption lever this panel drags is a plain `useState` local to
 * THIS component instance. It is seeded once per open from the caller's
 * `baseline` prop and never written back anywhere — not to
 * `state/demoStore.ts`'s global `sliders` singleton (no import of that
 * module below) and not to any funded `PlanOpportunity` record. Every
 * number rendered inside the panel comes from calling
 * `engine/plan.ts`'s pure `deriveRecomputeView` directly against this
 * local copy, so dragging the panel's own slider can never move a figure
 * anywhere outside this panel (AC-r03-4).
 *
 * SCOPE NOTE, not resolved here (STOP-item, flagged not decided): neither
 * `r03_show_the_working.md` nor `01-architecture.md` §3 names which
 * existing screen hosts the control that opens this panel — the file's
 * own narrative example (Story B: a panel floating over an
 * already-open "Board pack" report) is not directly wireable as written,
 * because `screens/Reporting.tsx` already renders the Board Pack report
 * INSIDE this app's one shared Drawer instance for that screen, and a
 * second concurrently-openable Drawer on the same screen is exactly what
 * AC-r03-1 and `design_system_spec.md` §7 forbid. This component is
 * therefore built and proven against its full testable contract
 * (AC-r03-1..8) via a self-contained host in its own test file, and is
 * NOT wired into any live screen's navigation by this dispatch — that
 * wiring is a screen-assembly decision for whichever future dispatch
 * picks the host surface, flagged in the implementer's evidence return
 * rather than guessed at here.
 */
import { useEffect, useState } from 'react';
import { Drawer } from '../components/Drawer';
import { Slider } from '../components/primitives/Slider';
import { StatValue } from '../components/primitives/StatValue';
import { deriveRecomputeView } from '../engine/plan';
import type { SliderState } from '../engine/plan';

export interface ShowTheWorkingPanelProps {
  /** Controlled open state — owned by the caller, same convention as every other `Drawer` consumer in this app. */
  open: boolean;
  onClose: () => void;
  /** Baseline lever state the panel's own local copy seeds from on each open. Never written back to by this component — the caller's own copy (global singleton, funded-record snapshot, or a plain constant) is untouched. */
  baseline: SliderState;
}

/** Adoption/efficacy slider bounds — identical to `SliderControlRow.tsx`'s own `eff` lever spec (same field, same range), reused rather than re-derived. */
const ADOPTION_MIN = 20;
const ADOPTION_MAX = 80;
const ADOPTION_STEP = 1;
const ADOPTION_LABEL = 'Adoption / efficacy';

export function ShowTheWorkingPanel({ open, onClose, baseline }: ShowTheWorkingPanelProps) {
  const [eff, setEff] = useState(baseline.eff);

  // Re-seed the local copy from the caller's baseline every time the panel
  // is (re)opened — each session starts from the current assumption, but
  // nothing dragged during a session outlives the panel (PI2-D36 is the
  // separate, unresolved question of whether it should; not this file's
  // call — see AC-r03-9).
  useEffect(() => {
    if (open) setEff(baseline.eff);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-seed on open transition only, not on every baseline identity change while open
  }, [open]);

  const localSliders: SliderState = { ...baseline, eff };
  const view = deriveRecomputeView(localSliders);

  return (
    <Drawer open={open} onClose={onClose} title={ADOPTION_LABEL} size="wide">
      <Slider
        min={ADOPTION_MIN}
        max={ADOPTION_MAX}
        step={ADOPTION_STEP}
        value={eff}
        label={ADOPTION_LABEL}
        valueText={`${eff}%`}
        onChange={setEff}
      />
      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem' }}>
        <StatValue value={view.economics.roiText} label="Expected 3-year ROI" />
        <StatValue value={view.economics.annualValueText} label="Annual value" />
      </div>
    </Drawer>
  );
}
