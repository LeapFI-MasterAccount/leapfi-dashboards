/**
 * StatCard — Composite C1 (design_system_spec.md §2.2)
 *
 * Built from StatValue (P11) + Label (P3). Spec composite states: loading,
 * loaded, updating (P11's own states, surfaced one level up — see the
 * STATE_TO_STATVALUE map below). A11y baseline (§2.2 C1): "Card region
 * has an accessible name from its Label."
 *
 * Layout note: the spec's "1–3 per row" (§2.2 C1 Variants column) is a
 * *composition* fact about how many StatCards a screen places in a row
 * (Home §5.1, ChatHero counters §5.4, SliderControlRow's live grid §5.5)
 * — not a prop this single-card component takes. Screens compose N of
 * these in their own flex/grid row; StatCard itself renders exactly one
 * card and has no opinion on its neighbors.
 *
 * AMBIGUITY RESOLVED — "accessible name from its Label" wiring: the spec
 * names the *source* of the card's accessible name (the Label) but not
 * the ARIA mechanism to use. I used `aria-labelledby` pointing at a
 * wrapper `<span>` around the rendered Label (Label, `primitives/Label.tsx`,
 * takes no `id` prop, so the id has to live on a wrapper) rather than
 * duplicating the label text into a separate literal `aria-label` string
 * on the card — this keeps the visible Label and the card's accessible
 * name as one source of truth instead of two copies of the same string
 * that can drift apart.
 *
 * AMBIGUITY RESOLVED — "updating" live-region ownership: StatValue's own
 * header comment (P11, `primitives/StatValue.tsx`) states recompute-update
 * announcements are "owned by the composite (StatCard / SliderControlRow),
 * not this primitive," and StatValue itself renders no `aria-live`. This
 * composite wraps StatValue in an `aria-live="polite" aria-atomic="true"`
 * region so that when a parent screen changes `value`/`unit` between
 * renders (e.g. a slider recompute, §5.5), the new "value unit, label"
 * accessible name StatValue computes is re-announced as one atomic unit.
 * `aria-atomic="true"` is load-bearing here: the underlying change is to
 * StatValue's `aria-label` attribute, not to added visible text nodes, and
 * AT support for announcing attribute-only changes inside a live region
 * without `aria-atomic` is inconsistent across screen readers.
 *
 * CLICK-AFFORDANCE STANDARD (D19b, `affordance_standard.md` §2.2, §5 item
 * 4): optional `onPress` adds a clickable variant, mirroring
 * `SetupCard.tsx`'s already-shipped `interactive` variant state-for-state
 * (real `<button type="button">`, `--bg2`/`--accent` border on hover+active,
 * `--focus-ring` on focus, accent `chevron-right` at rest — never
 * hover-gated, per §0) so the two tile types read as one visual language.
 * Omitting `onPress` renders exactly as before this change: `role="group"`
 * div, no cursor/hover/chevron (§2.2's "honest" non-clickable contrast,
 * the tile-level twin of DataTable's §1.3 rule) — backward compatible.
 *
 * QUALIFIER CAPTION (amendment A8, §2.6, binding detail): optional
 * `qualifier` prop renders a supplementary caption immediately after
 * StatValue, inside the card body — the same position SliderControlRow's
 * retired bespoke `StatTile` helper used. It is `aria-hidden="true"` and
 * carries no accessible name of its own: StatValue's own baseline (P11)
 * already makes "value + label" one complete accessible unit, and the
 * card's accessible name comes from Label (unchanged) — the qualifier is
 * supplementary visual framing, not a second piece of content requiring
 * its own announcement. It sits outside the `aria-live="polite"` wrapper,
 * which stays scoped to StatValue only. Sized/weighted like Label's
 * `body-secondary` variant (§2.1 P3) and colored via the closed-list
 * `--ink2` role — not authored through Label itself, since R-1's
 * exception-free rule binds only the `eyebrow` treatment, which this
 * caption is not. Omitting `qualifier` renders exactly as C1 did before
 * this prop existed (backward compatible).
 */
import { useId, useState } from 'react';
import type { CSSProperties } from 'react';
import { StatValue } from './primitives/StatValue';
import type { StatValueProps, StatValueState } from './primitives/StatValue';
import { Label } from './primitives/Label';
import { Icon } from './primitives/Icon';
import { PANEL_STYLE } from '../theme/panelStyle';

export type StatCardState = 'loading' | 'loaded' | 'updating';

export interface StatCardProps {
  /** Rendered as the card's visible Label and doubles as StatValue's own
   * `label` — one string, one source of truth for the card's accessible
   * name and the stat's own announced label. */
  label: string;
  value: string | number;
  unit?: string;
  state?: StatCardState;
  /** Clickable variant (§2.2, §5 item 4). Omit for the non-clickable
   * `role="group"` tile (today's only shape). */
  onPress?: () => void;
  /** Supplementary qualifying caption (amendment A8, §2.6) — e.g.
   * "blended", "of 14", "one-time". Renders immediately after StatValue,
   * `aria-hidden`, outside the aria-live wrapper. Independent of `onPress`
   * and `state`; omitting it renders exactly as C1 does today. */
  qualifier?: string;
}

const STATE_TO_STATVALUE: Record<StatCardState, StatValueState> = {
  loading: 'loading',
  loaded: 'default',
  updating: 'updating',
};

export const cardStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.6rem',
  padding: '1.1rem 1.25rem',
  ...PANEL_STYLE,
  minWidth: 0,
  boxSizing: 'border-box',
};

const interactiveCardBaseStyle: CSSProperties = {
  ...cardStyle,
  textAlign: 'left',
  font: 'inherit',
  cursor: 'pointer',
  outline: 'none',
  transition: 'background-color 120ms ease, border-color 120ms ease, box-shadow 120ms ease',
};

const labelRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.5rem',
  width: '100%',
};

// Sized/weighted like Label's `body-secondary` variant (§2.1 P3) per §2.6 —
// not authored through Label itself (R-1 binds only the `eyebrow`
// treatment). See LabelVariant's VARIANT_STYLE['body-secondary'] in
// primitives/Label.tsx for the source values this mirrors.
const qualifierStyle: CSSProperties = {
  display: 'block',
  font: 'inherit',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: 'var(--ink2)',
};

export function StatCard({ label, value, unit, state = 'loaded', onPress, qualifier }: StatCardProps) {
  const labelId = useId();
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(false);
  const interactive = Boolean(onPress);

  // Built conditionally (rather than `unit={unit}` directly) because the
  // project's `exactOptionalPropertyTypes` tsconfig setting treats an
  // optional prop's type as exactly its declared type, not
  // `T | undefined` — forwarding a possibly-`undefined` local straight
  // into another component's optional prop of the same shape is a type
  // error under that setting, so the key is only present when defined.
  const statValueProps: StatValueProps = {
    value,
    label,
    state: STATE_TO_STATVALUE[state],
    ...(unit !== undefined ? { unit } : {}),
  };

  // Non-interactive shape is untouched (same DOM as before this standard)
  // — the label is not wrapped in the flex row used to lay out the
  // trailing chevron, so a screen not passing `onPress` renders identically.
  const labelBlock = interactive ? (
    <span style={labelRowStyle}>
      <span id={labelId}>
        <Label text={label} variant="eyebrow" />
      </span>
      <Icon name="chevron-right" size={16} tone="interactive" />
    </span>
  ) : (
    <span id={labelId}>
      <Label text={label} variant="eyebrow" />
    </span>
  );

  const body = (
    <>
      {labelBlock}
      <div aria-live="polite" aria-atomic="true">
        <StatValue {...statValueProps} />
      </div>
      {qualifier !== undefined ? (
        <span aria-hidden="true" style={qualifierStyle}>
          {qualifier}
        </span>
      ) : null}
    </>
  );

  if (interactive) {
    // Mirrors SetupCard.tsx's `interactive` variant state-for-state (§2.2).
    return (
      <button
        type="button"
        data-lf-composite="stat-card"
        data-state={state}
        aria-labelledby={labelId}
        onClick={onPress}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => {
          setHover(false);
          setActive(false);
        }}
        onMouseDown={() => setActive(true)}
        onMouseUp={() => setActive(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...interactiveCardBaseStyle,
          background: hover || active ? 'var(--bg2)' : 'var(--panel)',
          borderColor: focused ? 'transparent' : hover || active ? 'var(--accent)' : 'var(--border)',
          boxShadow: focused ? 'var(--focus-ring)' : 'none',
        }}
      >
        {body}
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      data-lf-composite="stat-card"
      data-state={state}
      style={cardStyle}
    >
      {body}
    </div>
  );
}
