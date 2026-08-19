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
 */
import { useState } from 'react';
import type { CSSProperties } from 'react';

export type ChipVariant = 'suggestion' | 'filter';

export interface ChipProps {
  text: string;
  variant: ChipVariant;
  selected?: boolean;
  onPress: () => void;
  disabled?: boolean;
}

const BASE_STYLE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  font: 'inherit',
  fontSize: '0.8125rem',
  fontWeight: 500,
  lineHeight: 1,
  padding: '0.5rem 0.85rem',
  borderRadius: 'var(--radius-pill, 999px)',
  border: '1px solid var(--border)',
  background: 'transparent',
  color: 'var(--ink)',
  minHeight: 44,
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'background-color 120ms ease, border-color 120ms ease, color 120ms ease, box-shadow 120ms ease',
};

export function Chip({ text, variant, selected = false, onPress, disabled = false }: ChipProps) {
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(false);

  const isPressedVisual = variant === 'filter' && selected;

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
        background: isPressedVisual || active ? 'var(--accent)' : hover ? 'var(--panel)' : 'transparent',
        color: isPressedVisual || active ? 'var(--bg)' : 'var(--ink)',
        borderColor: isPressedVisual || active ? 'var(--accent)' : 'var(--border)',
        boxShadow: focused ? 'var(--focus-ring)' : 'none',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {text}
    </button>
  );
}
