/**
 * Chip — Primitive P5, interactive pill (design_system_spec.md §2.1)
 *
 * Variants: `suggestion` (Ask prompt fill), `filter` (FilterBar
 * selection). States: default, hover, focus (`--focus-ring`), active,
 * disabled.
 *
 * a11y baseline (spec P5): "Operates as a toggle-button semantically
 * (`aria-pressed` for `filter`; plain button for `suggestion`, since
 * selecting a suggestion fills the input, it does not toggle)." Encoded
 * directly below: `aria-pressed` is only ever set for the `filter`
 * variant.
 *
 * AMBIGUITY RESOLVED: the spec's Key props column for P5 lists only
 * `text`, `selected`, `onPress` — no `disabled` — but the States column
 * explicitly includes `disabled`. I added an optional `disabled` prop
 * (default `false`) so the documented state is reachable; this mirrors
 * how sibling primitive Switch (P8, same States-vs-Key-props shape)
 * already exposes `disabled` in this codebase.
 *
 * `density` prop (T5 fix, added by the FilterBar-tower dispatch) —
 * BACKWARD COMPATIBLE, every existing call site is untouched and keeps
 * rendering `density="default"` (the original 44px pill, byte-for-byte
 * the same style object as before this change):
 *   - `default` — unchanged 44px-hit-target pill.
 *   - `compact` — menu-density row for `FilterBar.tsx`'s option panel.
 *     Chip's own a11y baseline above carries no "min 44×44" line (that
 *     line is Button/P2's, not P5's) — the floor that actually applies
 *     is WCAG 2.2 SC 2.5.8 (Target Size Minimum, AA): 24×24 CSS px.
 *     `compact` renders 32px tall (2rem), comfortably above that floor
 *     and meaningfully denser than the 44px pill, matching this
 *     codebase's own established menu-row precedent — `Topbar.tsx`'s
 *     `MenuButtonItem` (borderless, background-only state, `--bg2`
 *     hover) and `NotificationBellPanel.tsx`'s row style (`padding:
 *     '0.5rem 0.625rem'`, `borderRadius: 'var(--radius-xs, 4px)'`) — and
 *     the v1 reference's own compact filter-chip density
 *     (`leapfi-platform.html`, pin 1c230fe, `.dchip{padding:6px
 *     10px;border-radius:8px;font-size:11.5px}`, the exact class v1's
 *     own `srcFilter()` toggles for its regulatory-feed source rows).
 *     Hover surface is `--bg2`, never `--panel` — `affordance_standard.md`
 *     §4.2 documents `--panel` hover as a contrast hazard for `--ink2`
 *     text sharing a row in light mode (4.34:1, below the 4.5:1 floor),
 *     which is exactly why every other row-shaped hover surface in this
 *     codebase (`MenuButtonItem`, DataTable rows per that standard)
 *     already standardizes on `--bg2` instead; `default` density is
 *     unaffected (still `--panel` hover, unchanged, out of this
 *     dispatch's scope). Selected-state fill (`--accent` background /
 *     `--bg` text) is identical to `default` and unmodified — already
 *     computed elsewhere at 6.10:1 light / 15.14:1 dark, both clear the
 *     4.5:1 AA text floor with wide margin (contrast ratio is symmetric,
 *     so the existing `--accent` on `--bg`/`--panel` computations in
 *     `affordance_standard.md` §4.1 apply unchanged to this reversed
 *     text-on-accent-fill pairing).
 */
import { useState } from 'react';
import type { CSSProperties } from 'react';

export type ChipVariant = 'suggestion' | 'filter';
export type ChipDensity = 'default' | 'compact';

export interface ChipProps {
  text: string;
  variant: ChipVariant;
  selected?: boolean;
  onPress: () => void;
  disabled?: boolean;
  /** See the file-header `density` note above. Defaults to `default` — the original, unchanged pill. */
  density?: ChipDensity;
}

const BASE_STYLE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  font: 'inherit',
  fontWeight: 500,
  lineHeight: 1,
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'background-color 120ms ease, border-color 120ms ease, color 120ms ease, box-shadow 120ms ease',
};

// Original, unmodified geometry — every pre-existing caller (density
// omitted or explicitly "default") renders byte-for-byte what this file
// shipped before the T5 fix.
const DEFAULT_DENSITY_STYLE: CSSProperties = {
  fontSize: '0.8125rem',
  padding: '0.5rem 0.85rem',
  borderRadius: 'var(--radius-pill, 999px)',
  border: '1px solid var(--border)',
  minHeight: 44,
};

// Menu-density row — see the `density` doc in the file header for the
// 24px-floor / v1-`.dchip` / `MenuButtonItem` sourcing. Borderless by
// design (matches `MenuButtonItem`'s background-only state signaling —
// no per-row border to avoid a double-bordered look stacked inside the
// panel's own bordered container).
const COMPACT_DENSITY_STYLE: CSSProperties = {
  display: 'flex',
  width: '100%',
  justifyContent: 'flex-start',
  textAlign: 'left',
  fontSize: '0.8125rem',
  padding: '0.5rem 0.625rem',
  borderRadius: 'var(--radius-xs, 4px)',
  border: 'none',
  minHeight: 32,
};

export function Chip({ text, variant, selected = false, onPress, disabled = false, density = 'default' }: ChipProps) {
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(false);

  const isPressedVisual = variant === 'filter' && selected;
  const isCompact = density === 'compact';
  const hoverSurface = isCompact ? 'var(--bg2)' : 'var(--panel)';

  return (
    <button
      type="button"
      onClick={() => {
        if (!disabled) onPress();
      }}
      disabled={disabled}
      aria-pressed={variant === 'filter' ? selected : undefined}
      data-lf-primitive="chip"
      data-variant={variant}
      data-density={density}
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
        ...BASE_STYLE,
        ...(isCompact ? COMPACT_DENSITY_STYLE : DEFAULT_DENSITY_STYLE),
        background: isPressedVisual || active ? 'var(--accent)' : hover ? hoverSurface : 'transparent',
        color: isPressedVisual || active ? 'var(--bg)' : 'var(--ink)',
        ...(isCompact ? {} : { borderColor: isPressedVisual || active ? 'var(--accent)' : 'var(--border)' }),
        boxShadow: focused ? 'var(--focus-ring)' : 'none',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {text}
    </button>
  );
}
