/**
 * SliderControlRow — Composite C11 (design_system_spec.md §2.2, screen
 * anatomy §5.5 "Studio · Investment Design")
 *
 * "Slider ×N + StatCard grid (live) + PosturePillBar." Composite states
 * (§2.2 C11): idle, one-or-more-sliders-dragging, recompute-settled — see
 * §5.5's per-slider state machine: `Idle → Dragging (live visual update,
 * no live-region announcement per drag frame) → Committed (drag-end /
 * arrow-key press: value finalized, StatCard grid + PosturePillBar
 * recompute, one aria-live announcement summarizing the change)`.
 *
 * This composite renders the engine's output; it computes none of the
 * arithmetic itself. Every number/label on screen comes from
 * `deriveRecomputeView` (src/engine/plan.ts), which is the pure typed
 * port of leapfi-platform.html lines 1214-1303 (`readLevers`, `sortPool`,
 * `computePlan`, and the non-DOM half of `recompute()`). State ownership:
 * this component is fully controlled — `sliders` is owned by the caller
 * (a future screen-assembly dispatch), so the *same* lever state can also
 * drive PlanTable/other Studio · Investment Design surfaces without two
 * copies of the truth.
 *
 * AMBIGUITY RESOLVED (slider count — design_system_spec.md §5.5): the
 * region-map bullet names 5 sliders explicitly ("Ambition, Risk
 * tolerance, Speed, Budget, ROI-hurdle sliders — #amb #tol #speed
 * #budget #roi") and "Components used" says "Slider (P7) ×5" — but the
 * very same §5.5 section's own "#eff note" paragraph discusses the
 * Adoption/efficacy slider (`#eff`) as an existing, currently-shipped
 * screen control with its own known value/label defect the spec assumes
 * gets fixed, not as a control the twin removes. The source (lines
 * 921-996, the exact range §5.5 cites) has six `<input type="range">`
 * elements, and the ported engine's arithmetic is unusable without `eff`
 * as a caller-settable input (`computePlan`/`sortPool` scale every value
 * figure by it) — dropping it would make the Adoption lever's own
 * "#eff note" paragraph describe a control that isn't there. Read as an
 * internal count inconsistency in the spec text (5 named + a 6th
 * discussed in the same breath), not a deliberate cut, and resolved in
 * favor of all six sliders. Flagging for design-authority confirmation.
 *
 * AMBIGUITY RESOLVED ("live StatCard grid (20+ tiles, recompute())" —
 * §5.5 region map): the cited source range (921-996) contains exactly 6
 * stat tiles (the "What that gets you" `.eco` block: ROI, Payback, Plays
 * funded, Build cost, Annual value, Controls to close — source lines
 * 961-967), not 20+. No other element in that line range is tile-shaped.
 * Built with the 6 tiles the cited source actually contains and flagging
 * "20+" as unverified against its own citation — not silently inventing
 * ~14 additional tiles to hit the stated count.
 *
 * AMBIGUITY RESOLVED (StatCard row): same reasoning as ChatHero.tsx —
 * StatCard (C1) has no file in this worktree, so the 6 tiles are
 * composed from a local `StatTile` helper rather than an unbuilt
 * import. `StatTile` renders only StatValue (P11), not StatValue+Label
 * (C1's full stated composition): StatValue's own a11y contract already
 * bundles "value + its label" into one accessible unit (P11's own doc:
 * "not two separately-announced fragments"), so `StatValue`'s `label`
 * prop carries each tile's primary name ("Payback", "Plays funded", …)
 * directly — adding a second, separate Label (C1's heading half) above
 * it would either duplicate that name in the accessible tree or, if
 * marked `aria-hidden`, contribute nothing accessibility-wise while
 * still risking a Label-vs-StatValue naming mismatch. The small
 * qualifier text under each number ("blended", "of 14", "one-time" —
 * source's `.sub`, lines 962-967) is genuinely supplementary framing on
 * top of an already-complete accessible name, so it renders as a plain
 * `aria-hidden` caption instead of going through Label.
 *
 * NEW A11Y BEHAVIOR (not a source port — the source's `recompute()` has
 * no live-region announcement at all; this is design_system_spec.md's
 * own requirement layered on top, per D14's "componentizes existing
 * interaction surfaces" framing, and the spec's example text is
 * illustrative — "e.g. 'Ambition raised — 3 plays now funded'" — not a
 * literal required string): on each Slider's commit, this component
 * compares the committed value against the value at the *previous*
 * commit (not the live in-drag value) to report a direction, and appends
 * the freshly-recomputed funded-play count, announced once via a single
 * `aria-live="polite"` status region owned by this composite. A brief
 * (500ms) `updating` visual state accompanies it on the stat grid and
 * PosturePillBar, matching the "recompute-settled" composite state.
 * Known limitation: if the caller resets `sliders` from outside this
 * component's own commit handlers (e.g. a future "reset demo" control),
 * the next commit's direction is computed against the pre-reset
 * baseline — out of scope here since no reset affordance exists in this
 * dispatch's allowlist.
 */
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Slider } from './primitives/Slider';
import { StatValue } from './primitives/StatValue';
import { Label } from './primitives/Label';
import { PosturePillBar } from './PosturePillBar';
import { deriveRecomputeView } from '../engine/plan';
import type { PlanOpportunity, SliderState } from '../engine/plan';

export interface SliderControlRowProps {
  sliders: SliderState;
  onSlidersChange: (next: SliderState) => void;
  /** Fired once per commit (drag-end / arrow-key press / direct track click), after the announcement text is computed. Optional — the composite already renders its own live region regardless of whether the caller wires this. */
  onCommit?: (next: SliderState, announcement: string) => void;
  /** Defaults to the full 15-play catalog (data/studio.ts `OPPS`) inside the engine. */
  opportunities?: PlanOpportunity[];
}

const rootStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1.5rem' };

const sectionHeadingStyle: CSSProperties = { font: 'inherit', fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', margin: 0 };

const stanceBoxStyle = (tension: boolean): CSSProperties => ({
  background: 'var(--panel)',
  border: `1px solid ${tension ? 'var(--sem-caution)' : 'var(--border)'}`,
  borderRadius: 'var(--radius-sm, 12px)',
  padding: '0.75rem 0.875rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3125rem',
});

// §8 R-1 — the ALL-CAPS tracked eyebrow treatment is authored only by
// Label (P3) `eyebrow`; see the `<Label variant="eyebrow">` call sites
// below (no local style constant needed — nothing here is layout).

const stanceTextStyle: CSSProperties = { fontSize: '0.8125rem', lineHeight: 1.45, color: 'var(--ink)' };

const leversListStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1.125rem' };

const tickRowStyle: CSSProperties = { display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--ink2)', marginTop: '0.25rem' };

const statGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(7.5rem, 1fr))', gap: '1rem', transition: 'opacity 150ms ease' };

const qualifierStyle: CSSProperties = { display: 'block', fontSize: '0.6875rem', color: 'var(--ink2)', marginTop: '0.125rem' };

const warnBannerStyle: CSSProperties = {
  marginTop: '0.6875rem',
  fontSize: '0.78125rem',
  color: 'var(--sem-caution)',
  background: 'color-mix(in srgb, var(--sem-caution) 10%, transparent)',
  border: '1px solid color-mix(in srgb, var(--sem-caution) 35%, transparent)',
  borderRadius: 'var(--radius-sm, 10px)',
  padding: '0.625rem 0.8125rem',
};

// Visually-hidden recipe — `top`/`left` pinned to 0 is load-bearing;
// see the invariant note on `DataTable.tsx`'s `srOnlyStyle`. Without it
// an unpositioned absolute box falls back to its in-flow static
// position, which can extend `html.scrollHeight` past whatever
// scroll container this composite is rendered inside.
const srOnly: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

interface LeverSpec {
  field: keyof SliderState;
  label: string;
  min: number;
  max: number;
  step: number;
  valueText: string;
  ticks?: { labels: string[]; activeIndex: number };
  endLabels?: [string, string, string];
}

/**
 * Local stand-in for StatCard (C1 = StatValue + Label) — see file header.
 * Duplicated intentionally with ChatHero.tsx's identical helper. No
 * `unit` prop: none of this screen's 6 tiles carry one (every value
 * string below already embeds its own suffix, e.g. "14 mo", "$430k").
 */
function StatTile({ value, label, qualifier }: { value: string | number; label: string; qualifier: string }) {
  return (
    <div>
      <StatValue value={value} label={label} />
      <span aria-hidden="true" style={qualifierStyle}>
        {qualifier}
      </span>
    </div>
  );
}

function TickRow({ labels, activeIndex }: { labels: string[]; activeIndex?: number }) {
  return (
    <div style={tickRowStyle} aria-hidden="true">
      {labels.map((text, index) => (
        // eslint-disable-next-line react/no-array-index-key -- static, order-fixed tick label list
        <span key={index} aria-current={index === activeIndex ? 'true' : undefined} style={{ fontWeight: index === activeIndex ? 700 : 400, color: index === activeIndex ? 'var(--ink)' : 'var(--ink2)' }}>
          {text}
        </span>
      ))}
    </div>
  );
}

export function SliderControlRow({ sliders, onSlidersChange, onCommit, opportunities }: SliderControlRowProps) {
  const view = deriveRecomputeView(sliders, opportunities);
  const { levers, economics, posture, stance } = view;

  const [announcement, setAnnouncement] = useState('');
  const [updating, setUpdating] = useState(false);
  const prevSlidersRef = useRef<SliderState>(sliders);
  const updateTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      if (updateTimeoutRef.current !== undefined) window.clearTimeout(updateTimeoutRef.current);
    },
    [],
  );

  const handleCommit = (field: keyof SliderState, label: string, value: number) => {
    const prevValue = prevSlidersRef.current[field];
    const direction = value > prevValue ? 'raised' : value < prevValue ? 'lowered' : 'set';
    const nextSliders: SliderState = { ...sliders, [field]: value };
    const nextView = deriveRecomputeView(nextSliders, opportunities);
    const text = `${label} ${direction} — ${nextView.economics.fundedCount} of ${nextView.economics.totalOpportunities} plays now funded`;
    setAnnouncement(text);
    prevSlidersRef.current = nextSliders;
    setUpdating(true);
    if (updateTimeoutRef.current !== undefined) window.clearTimeout(updateTimeoutRef.current);
    updateTimeoutRef.current = window.setTimeout(() => setUpdating(false), 500);
    onCommit?.(nextSliders, text);
  };

  const leverSpecs: LeverSpec[] = [
    {
      field: 'amb',
      label: 'Ambition',
      min: 0,
      max: 4,
      step: 1,
      valueText: levers.ambitionLabel,
      ticks: { labels: ['Aware', 'Developing', 'Established', 'Managed', 'Embedded'], activeIndex: levers.ambitionTickIndex },
    },
    {
      field: 'tol',
      label: 'Risk appetite',
      min: 0,
      max: 100,
      step: 1,
      valueText: levers.toleranceLabel,
      ticks: { labels: ['Conservative', 'Balanced', 'Aggressive'], activeIndex: levers.toleranceTickIndex },
    },
    {
      field: 'speed',
      label: 'Investment horizon',
      min: 0,
      max: 100,
      step: 1,
      valueText: levers.speedLabel,
      ticks: { labels: ['Quick wins', 'Balanced', 'Strategic'], activeIndex: levers.speedTickIndex },
    },
    { field: 'budget', label: 'Annual budget', min: 100000, max: 1500000, step: 5000, valueText: levers.budgetLabel, endLabels: ['$100k', '$800k', '$1.5M'] },
    { field: 'roi', label: 'Target ROI · 3-year', min: 0.8, max: 5, step: 0.1, valueText: levers.roiTargetLabel, endLabels: ['0.8×', '3×', '5×'] },
    { field: 'eff', label: 'Adoption / efficacy', min: 20, max: 80, step: 1, valueText: levers.adoptionLabel, endLabels: ['20%', '50%', '80%'] },
  ];

  return (
    <div style={rootStyle} data-lf-composite="slider-control-row">
      <div>
        <h3 style={sectionHeadingStyle}>Your levers</h3>
        <div style={stanceBoxStyle(stance.tension)}>
          <Label text="Your stance" variant="eyebrow" />
          <p style={{ ...stanceTextStyle, margin: 0 }}>
            <strong style={{ color: 'var(--accent)' }}>{stance.lead}</strong> {stance.body}
          </p>
        </div>

        <div style={{ ...leversListStyle, marginTop: '1.125rem' }}>
          {leverSpecs.map((spec) => (
            <div key={spec.field}>
              <Slider
                min={spec.min}
                max={spec.max}
                step={spec.step}
                value={sliders[spec.field]}
                label={spec.label}
                valueText={spec.valueText}
                onChange={(value) => onSlidersChange({ ...sliders, [spec.field]: value })}
                onCommit={(value) => handleCommit(spec.field, spec.label, value)}
              />
              {spec.ticks ? <TickRow labels={spec.ticks.labels} activeIndex={spec.ticks.activeIndex} /> : null}
              {spec.endLabels ? <TickRow labels={spec.endLabels} /> : null}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 style={sectionHeadingStyle}>What that gets you</h3>
        <p style={{ ...stanceTextStyle, margin: '0.25rem 0 0.875rem', color: 'var(--ink2)' }}>A funded portfolio, weighed against your posture.</p>
        <div style={{ ...statGridStyle, opacity: updating ? 0.75 : 1 }} data-state={updating ? 'updating' : 'default'}>
          <StatTile value={economics.roiText} label="Expected 3-year ROI" qualifier={economics.roiNote} />
          <StatTile value={economics.paybackText} label="Payback" qualifier="blended" />
          <StatTile value={economics.fundedCount} label="Plays funded" qualifier={`of ${economics.totalOpportunities}`} />
          <StatTile value={economics.buildCostText} label="Build cost" qualifier="one-time" />
          <StatTile value={economics.annualValueText} label="Annual value" qualifier="at adoption" />
          <StatTile value={economics.controlsToCloseCount} label="Controls to close" qualifier={economics.controlsToCloseGoalLabel} />
        </div>

        <div style={{ marginTop: '1.125rem' }}>
          <Label text="Where you are vs where you want to be" variant="eyebrow" />
          <div style={{ marginTop: '0.5rem' }}>
            <PosturePillBar segments={posture.segments} state={updating ? 'updating' : 'default'} />
          </div>
          <p style={{ ...stanceTextStyle, margin: '0.625rem 0 0' }}>
            {posture.note.kind === 'at-target' ? (
              <>
                You&rsquo;re targeting your current level. {posture.note.fundedCount} plays fit today with {posture.note.gatedCount} still gated.
              </>
            ) : (
              <>
                Moving from <strong>{posture.note.fromBand}</strong> to <strong>{posture.note.toBand}</strong> means closing{' '}
                <strong>{posture.note.controlsToCloseCount} control families</strong>: {posture.note.controlsToClose.join(', ')}. Until then, {posture.note.gatedCount} higher-value
                plays stay sequence-gated. Domain targets in OnSide move with this ambition.
              </>
            )}
          </p>
          {posture.warnOn ? (
            <div style={warnBannerStyle} role="status">
              You&rsquo;re reaching past your controls. At this tolerance, several high-value plays stay gated until you close the controls below. The sequence puts those first.
            </div>
          ) : null}
        </div>
      </div>

      {/* Single commit announcement — never per drag frame. See file header NEW A11Y BEHAVIOR note. */}
      <span role="status" aria-live="polite" style={srOnly}>
        {announcement}
      </span>
    </div>
  );
}
