/**
 * PosturePillBar — Composite C12 (design_system_spec.md §2.2)
 *
 * "Tag-colored segments" showing where the institution is (current
 * maturity band) against where the Ambition lever wants it to be (target
 * band), across the five-point scale (`BANDS`, data/studio.ts). Source
 * lines 1278-1279, 1299: `pbar` innerHTML + `setTicks('amb-t', L.amb)`.
 * Segment data comes from `deriveRecomputeView().posture.segments`
 * (src/engine/plan.ts) — this component renders only, it computes
 * nothing.
 *
 * AMBIGUITY RESOLVED (§2.2 C12 row: "Built from: Tag-colored segments"):
 * the Tag primitive (P4)'s variant enum is closed to
 * `status-positive/status-caution/status-alert/hitl/count/locked` — none
 * of which carries a "current level / target level / on the path between
 * them / neither" semantic this composite's five segments need (source's
 * own `cur`/`tgt`/`between` CSS classes, lines 1278/1299). Modifying
 * Tag's variant union is outside this dispatch's allowlist (Tag.tsx
 * belongs to a sibling primitive dispatch) and would also misuse Tag's
 * documented status-pill semantics for a progress-marker meaning it was
 * never designed to carry. Read "Tag-colored segments" as describing the
 * *visual language* the segments borrow (pill shape, flat token-colored
 * fill, text-carrying, non-interactive) rather than a mandate to
 * literally instantiate the Tag component — this composite (C12) is its
 * own named vocabulary entry, distinct from Tag, and implements its own
 * segment markup below using the same token roles and pill shape.
 * Flagging per §8's justification bar in case Tag's vocabulary should
 * grow a dedicated "marker" variant instead.
 *
 * A11y baseline (spec C12): "Segment meaning is labelled in text, never
 * conveyed by segment color alone" — every segment's visible text already
 * carries "now"/"goal" (source's exact suffix text, ported verbatim in
 * `PostureSegment.label`); color is a reinforcement, never the only
 * carrier.
 *
 * L5 RE-SKIN (call-01-progress-gauges.md; DECISIONS.md D2/D2a/D2b) — Adam's
 * "gauges, bar charts, or power zones" critique of the box layout, and his
 * "clearly indicate on-target" ask (meeting_notes_2026-08-20.md:95). D2
 * rules this a re-skin IN PLACE, not a new composite, on the component's
 * ALREADY-consumed token roles only (`--accent`, `--chart-axis`, plus the
 * core `--panel`/`--bg`/`--ink`/`--border` roles this file used
 * pre-re-skin) — no new token value, zero new color pairing (every pairing
 * below is byte-identical to the pre-re-skin version; only geometry/weight
 * changed). D2 explicitly routes the DEEPER visual-weight design (final
 * fill shape, segment width) to Camille (brand-steward) as a follow-on
 * token pass "not asserted here" — this dispatch implements the concrete,
 * token-safe subset the L5 brief specifies:
 *   1. Track/gauge geometry: tighter inter-segment gap + the codebase's
 *      own `--radius-md` zone-block radius (already used elsewhere, e.g.
 *      `OnSideOverview.tsx`'s `KPI_BUTTON_STYLE`) instead of the isolated
 *      `--radius-pill` shape, so the five bands read as one segmented
 *      track/power-zone bar rather than a scattered chip row.
 *   2. Stronger target-band fill: the goal segment's existing solid
 *      `--accent` fill is unchanged in color, but heavier (bolder text,
 *      larger padding) than a plain segment.
 *   3. Clear now/goal markers + unmistakable on-target state: the "now"
 *      (current) ring is thickened for a clearer marker; when a segment
 *      is BOTH current and target (a domain already sitting at its own
 *      goal), it gets the goal's solid fill PLUS a thickened ring PLUS a
 *      `--bg`-colored boundary ring (`boxShadow`) — a combination neither
 *      "now, not yet at goal" (ring only) nor "goal, not yet reached"
 *      (fill only) carries alone, so the on-target case reads strictly
 *      stronger than either. This is IN ADDITION to, not instead of, the
 *      adjacent Status Tag every PosturePillBar consumer already renders
 *      next to it (D2: "already met by PosturePillBar's target-band fill
 *      + Status Tag").
 *
 * Contrast (independently recomputed from tokens.css hex, WCAG
 * relative-luminance, both themes — every pairing below is UNCHANGED from
 * the pre-re-skin component, since only geometry/weight moved):
 *   dark  target/on-target  bg(#000000) on accent(#00f2ff)   = 15.14:1
 *   dark  current           ink(#ffffff) on panel(#0d1525)   = 18.24:1
 *   dark  between/default   chart-axis(#7c8ca3) on panel     =  5.33:1 (D2b)
 *   light target/on-target  bg(#ffffff) on accent(#006d75)   =  6.10:1 (D2b)
 *   light current           ink(#0a2342) on panel(#f1f5f9)   = 14.39:1 (D2b)
 *   light between/default   chart-axis(#5a6b82) on panel     =  4.97:1 (D2b)
 * All six clear the 4.5:1 AA text floor in both themes.
 *
 * HOME-06 fold-in (00-scope.md r15c) — read against this lane's allowlist:
 * see this dispatch's own evidence return for the STOP-item on the literal
 * "All open items →" queue-panel link (out of this file's/lane's scope);
 * the click-through capability call-01's own open question asks about
 * ("should clicking a gauge drill down to underlying controls/findings")
 * is ALREADY shipped on both PosturePillBar consumers pre-dating this
 * dispatch — `OnSideOverview.tsx`'s `DomainPostureCard` (stretched-button
 * card, `openDomain`) and `HomePanels.tsx`'s `PostureBand` row action
 * (`fireOrDeepLink` to `{screen:'onside.overview', kind:'domain'}`) — left
 * untouched and verified still intact after this re-skin (both files are
 * NOT modified by this dispatch). A second, separate clickable affordance
 * directly on the pill bar inside `DomainPostureCard` was considered and
 * rejected: that card's hit area is already the full-card stretched-button
 * pattern (ONSIDE-14), and a nested interactive element over/under that
 * stretched span would create an overlapping hit-area conflict with an
 * already-shipped, already-tested click path — a real regression risk for
 * a capability that already exists.
 */
import type { CSSProperties } from 'react';
import type { PostureSegment } from '../engine/plan';

export type PosturePillBarState = 'default' | 'updating';

export interface PosturePillBarProps {
  segments: PostureSegment[];
  /** C12 composite states: default | updating (brief transition when the Ambition lever commits a new target). */
  state?: PosturePillBarState;
}

const listStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  // Tightened from 0.5rem (isolated-pill spacing) — the L5 re-skin's
  // track/gauge geometry ask: segments read as one grouped bar, not a
  // scattered chip row.
  gap: '0.25rem',
  margin: 0,
  padding: 0,
  listStyle: 'none',
  transition: 'opacity 150ms ease',
};

const baseSegmentStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  font: 'inherit',
  fontSize: '0.75rem',
  fontWeight: 600,
  lineHeight: 1.2,
  padding: '0.4rem 0.65rem',
  // L5 re-skin: zone-block radius (already used elsewhere in this
  // codebase, e.g. OnSideOverview.tsx's KPI_BUTTON_STYLE — no new token)
  // instead of the isolated-pill radius, so adjoining segments read as a
  // single segmented track rather than discrete floating chips.
  borderRadius: 'var(--radius-md, 10px)',
  // Longhands only (never the `border` shorthand): the variant styles
  // below override `borderColor`/`borderWidth` individually, and mixing
  // the shorthand with longhand overrides triggers React's conflicting
  // style-property warning when a segment's variant changes between
  // renders (e.g. the current/target bands move on an Ambition commit).
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'var(--border)',
  whiteSpace: 'nowrap',
};

// L5 re-skin: the goal segment's padding is bumped up from the shared
// baseline — same solid --accent fill color, larger footprint, so the
// target band reads as visually heavier ("stronger target-band fill")
// than a plain segment. Reused for both the target-only and the
// current+target (on-target) cases below.
const TARGET_PADDING = '0.5rem 0.85rem';

function segmentStyle(segment: PostureSegment): CSSProperties {
  if (segment.isCurrent && segment.isTarget) {
    // On-target now: the domain's current band already IS its own goal.
    // Gets the goal's solid fill AND the current ring (thickened) AND a
    // --bg-colored boundary ring (boxShadow) — a combination neither
    // "now, not yet at goal" nor "goal, not yet reached" carries alone,
    // so this reads unmistakably stronger than either (D2: "unmistakable
    // on-target state"). No new color: --accent/--bg only, both already
    // used elsewhere in this component.
    return {
      ...baseSegmentStyle,
      background: 'var(--accent)',
      color: 'var(--bg)',
      borderColor: 'var(--accent)',
      borderWidth: 3,
      fontWeight: 800,
      padding: TARGET_PADDING,
      boxShadow: '0 0 0 2px var(--bg)',
    };
  }
  if (segment.isTarget) {
    // Goal band: highest-emphasis fill — the "you want to be here" marker.
    // Same --accent fill as before the re-skin; heavier weight + larger
    // padding is the "stronger target-band fill" this re-skin asks for.
    return { ...baseSegmentStyle, background: 'var(--accent)', color: 'var(--bg)', borderColor: 'var(--accent)', fontWeight: 800, padding: TARGET_PADDING };
  }
  if (segment.isCurrent) {
    // Current band: outlined in the accent, not filled — "you are here"
    // without competing with the goal fill. Ring thickened 2px -> 3px
    // for a clearer "now" marker (L5 re-skin), still never a color-only
    // signal — the label text already carries " • now".
    return { ...baseSegmentStyle, background: 'var(--panel)', color: 'var(--ink)', borderColor: 'var(--accent)', borderWidth: 3 };
  }
  if (segment.isBetween) {
    // On the path from current to goal: a soft accent tint, still clearly secondary to both endpoints.
    // FIX WAVE (Class C, C1): --ink2 on --panel fails AA in light theme
    // (tokens.css LM-PAL-4: "never on --panel"); --chart-axis is the
    // token file's own prescribed panel-seated substitute.
    return { ...baseSegmentStyle, background: 'var(--panel)', color: 'var(--chart-axis)', borderColor: 'var(--accent)' };
  }
  return { ...baseSegmentStyle, background: 'var(--panel)', color: 'var(--chart-axis)', borderColor: 'var(--border)' };
}

export function PosturePillBar({ segments, state = 'default' }: PosturePillBarProps) {
  return (
    <ul
      role="list"
      aria-label="Control-maturity posture: current band and target band across the five-point scale"
      data-lf-composite="posture-pill-bar"
      data-state={state}
      style={{ ...listStyle, opacity: state === 'updating' ? 0.6 : 1 }}
    >
      {segments.map((segment) => (
        <li key={segment.index} role="listitem" style={segmentStyle(segment)} aria-current={segment.isCurrent ? 'true' : undefined}>
          {segment.label}
        </li>
      ))}
    </ul>
  );
}
