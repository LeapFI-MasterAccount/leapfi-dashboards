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
 *      goal), it gets the goal's solid fill PLUS a thickened ring PLUS an
 *      `--ink`-colored boundary ring (`boxShadow`) PLUS an explicit
 *      "target met" text marker (see HR-A11Y-01 fix note below) — a
 *      combination neither "now, not yet at goal" (ring only) nor "goal,
 *      not yet reached" (fill only) carries alone, so the on-target case
 *      reads strictly stronger than either, through both a visual and a
 *      text/assistive-tech channel. This is IN ADDITION to, not instead
 *      of, the adjacent Status Tag every PosturePillBar consumer already
 *      renders next to it (D2: "already met by PosturePillBar's
 *      target-band fill + Status Tag").
 *
 * HR-A11Y-01 FIX (S2, hostile review, CONFIRMED) — the re-skin's original
 * on-target treatment used a `--bg`-colored ring and relied entirely on
 * `PostureSegment.label`'s own suffix text (computed upstream in
 * `engine/plan.ts`, out of this file) for the "unmistakable" claim. Two
 * independently-reproduced defects: (1) `var(--bg)` is near-identical in
 * luminance to both real rendering contexts this ring ever sits against
 * (a panel-seated card via `--panel`, or the page background itself via
 * `--bg` directly on `TprmDomain.tsx`'s unwrapped mount) — 1.151:1 dark /
 * 1.096:1 light against `--panel`, and exactly 1:1 (self-colored, zero
 * signal) against `--bg`; (2) the on-target label text is byte-identical
 * to a plain current-only label (`' • now'`, never mentioning "goal"),
 * contradicting this file's own a11y baseline ("Segment meaning is
 * labelled in text, never conveyed by color alone"). Fixed entirely
 * within this file, no new token:
 *   - Ring recolored `--bg` -> `--ink` (already consumed by this file's
 *     plain-current branch) — `--ink` clears >4.5:1 against BOTH
 *     `--panel` and `--bg` in both themes (see contrast table below),
 *     so the ring is now genuinely visible in every real consumer
 *     context, not merely present in the DOM.
 *   - An explicit on-target text marker is now rendered alongside
 *     `segment.label` (this component's own markup, not a change to the
 *     upstream label computation in `engine/plan.ts`, which stays out of
 *     this dispatch's allowlist): a decorative `aria-hidden` checkmark
 *     for sighted users plus a visually-hidden ("sr-only", the same
 *     absolute-clip recipe already used elsewhere in this codebase, e.g.
 *     `DataTable.tsx`) " — target met" string, so a screen-reader user
 *     hears the on-target fact explicitly instead of the same "<band> •
 *     now" phrase a merely-current, not-yet-at-target segment produces.
 *
 * Contrast (independently recomputed from tokens.css hex, WCAG
 * relative-luminance, both themes):
 *   dark  target/on-target fill  bg(#000000) on accent(#00f2ff)  = 15.14:1
 *   dark  on-target ring         ink(#ffffff) on panel(#0d1525)  = 18.24:1
 *   dark  on-target ring (page)  ink(#ffffff) on bg(#000000)     = 21.00:1
 *   dark  current                ink(#ffffff) on panel(#0d1525)  = 18.24:1
 *   dark  between/default        chart-axis(#7c8ca3) on panel    =  5.33:1 (D2b)
 *   light target/on-target fill  bg(#ffffff) on accent(#006d75)  =  6.10:1 (D2b)
 *   light on-target ring         ink(#0a2342) on panel(#f1f5f9)  = 14.39:1 (D2b)
 *   light on-target ring (page)  ink(#0a2342) on bg(#ffffff)     = 14.39:1
 *   light current                ink(#0a2342) on panel(#f1f5f9)  = 14.39:1 (D2b)
 *   light between/default        chart-axis(#5a6b82) on panel    =  4.97:1 (D2b)
 * Every pairing clears the WCAG 1.4.11 non-text 3:1 floor (the on-target
 * ring rows) and the 4.5:1 AA text floor (the rest), in both themes and
 * both real consumer backgrounds (`--panel`-seated and page-level `--bg`).
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

// HR-A11Y-01 fix — visually-hidden (sr-only) recipe, the same
// absolute-clip pattern already used elsewhere in this codebase (e.g.
// `DataTable.tsx`'s `srOnlyStyle`): announces the on-target fact to
// assistive tech without duplicating this component's inline layout.
const srOnlyStyle: CSSProperties = {
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

function segmentStyle(segment: PostureSegment): CSSProperties {
  if (segment.isCurrent && segment.isTarget) {
    // On-target now: the domain's current band already IS its own goal.
    // Gets the goal's solid fill AND the current ring (thickened) AND an
    // --ink-colored boundary ring (boxShadow) — a combination neither
    // "now, not yet at goal" nor "goal, not yet reached" carries alone,
    // so this reads unmistakably stronger than either (D2: "unmistakable
    // on-target state"). HR-A11Y-01 fix: --bg -> --ink (--ink already
    // consumed by this file's plain-current branch below) — --bg was
    // near-invisible against both real consumer backgrounds (see file
    // header contrast table); --ink clears >4.5:1 against both.
    return {
      ...baseSegmentStyle,
      background: 'var(--accent)',
      color: 'var(--bg)',
      borderColor: 'var(--accent)',
      borderWidth: 3,
      fontWeight: 800,
      padding: TARGET_PADDING,
      boxShadow: '0 0 0 2px var(--ink)',
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
      {segments.map((segment) => {
        const onTarget = segment.isCurrent && segment.isTarget;
        return (
          <li key={segment.index} role="listitem" style={segmentStyle(segment)} aria-current={segment.isCurrent ? 'true' : undefined}>
            {segment.label}
            {onTarget ? (
              // HR-A11Y-01 fix: an explicit on-target marker independent of
              // `segment.label` (computed upstream in `engine/plan.ts`,
              // out of this file's allowlist, and byte-identical to a
              // plain current-only label — " • now", never "goal"). The
              // decorative checkmark gives sighted users a text-carried
              // (never color-only) signal; the sr-only span gives
              // screen-reader users the fact this segment's shared label
              // text never states.
              <>
                <span aria-hidden="true"> ✓</span>
                <span style={srOnlyStyle}> — target met</span>
              </>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
