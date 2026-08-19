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
  gap: '0.5rem',
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
  borderRadius: 'var(--radius-pill, 999px)',
  border: '1px solid var(--border)',
  whiteSpace: 'nowrap',
};

function segmentStyle(segment: PostureSegment): CSSProperties {
  if (segment.isTarget) {
    // Goal band: highest-emphasis fill — the "you want to be here" marker.
    return { ...baseSegmentStyle, background: 'var(--accent)', color: 'var(--bg)', borderColor: 'var(--accent)' };
  }
  if (segment.isCurrent) {
    // Current band: outlined in the accent, not filled — "you are here" without competing with the goal fill.
    return { ...baseSegmentStyle, background: 'var(--panel)', color: 'var(--ink)', borderColor: 'var(--accent)', borderWidth: 2 };
  }
  if (segment.isBetween) {
    // On the path from current to goal: a soft accent tint, still clearly secondary to both endpoints.
    return { ...baseSegmentStyle, background: 'var(--panel)', color: 'var(--ink2)', borderColor: 'var(--accent)' };
  }
  return { ...baseSegmentStyle, background: 'var(--panel)', color: 'var(--ink2)', borderColor: 'var(--border)' };
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
