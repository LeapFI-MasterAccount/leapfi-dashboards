/**
 * Button — Primitive P2 (design_system_spec.md §2.1)
 *
 * Variants: primary / secondary / ghost / row (small, inline within a
 * table row). States: default, hover, focus (`--focus-ring`), active,
 * disabled, loading (spinner replaces label, button keeps its width to
 * avoid layout shift).
 *
 * Loading-state width stability: the label span stays mounted and laid
 * out (only `visibility: hidden`, never `display: none`) so the button's
 * intrinsic size never changes when a Spinner overlay appears on top of
 * it — the persona's Core Principle 1 applies structurally even to this
 * non-irreversible primitive: the control never silently resizes under
 * a user mid-interaction.
 *
 * Cross-primitive reference: renders `Spinner` (P12) for the loading
 * state. Spinner is a sibling primitive outside this dispatch's
 * allowlist; per dispatch instructions this import may reference a file
 * that does not exist yet in this worktree — integration is checked by a
 * later dispatch.
 *
 * Row-variant hit target (spec P2 a11y baseline: "Min 44x44 hit target
 * (`row` variant may visually shrink but keeps the hit-target padding)"):
 * implemented via an absolutely-positioned, aria-hidden 44x44 span
 * nested inside the button. It overflows the button's small visual box
 * but is still a DOM descendant of the <button>, so pointer events over
 * the overflow area still hit-test into the button and its onClick
 * still fires — the button chrome can look small while the click target
 * stays >=44px without any component-level theme/structure branching.
 *
 * AMENDMENT A15 (design_system_spec.md §2.1 P2, §2.8 — the Drawer C7
 * size-toggle): new optional `pressed?: boolean` prop. When supplied it
 * renders `aria-pressed`; when omitted, no `aria-pressed` attribute is
 * rendered at all — byte-identical markup for every pre-A15 call site.
 * Brings P2 into parity with P5 Chip's already-sanctioned `aria-pressed`
 * toggle-button idiom (reuse of an existing pattern, not a new one) —
 * needed because Button has no persistent visual pressed/toggled state
 * today, so a toggle consumer (like the Drawer's size control) needs a
 * state-carrying attribute independent of the (also dynamic) label text.
 */
import { useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'row';

export interface ButtonProps {
  label: string;
  variant: ButtonVariant;
  icon?: IconName;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit';
  /** A15 — renders `aria-pressed` when supplied; omitted = no attribute
   * (byte-identical to every pre-A15 call site). See file header. */
  pressed?: boolean;
}

const BASE_STYLE: CSSProperties = {
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.4rem',
  font: 'inherit',
  fontWeight: 600,
  fontSize: '0.9375rem',
  borderRadius: 'var(--radius-sm, 6px)',
  boxSizing: 'border-box',
  minWidth: 44,
  minHeight: 44,
  padding: '0.625rem 1rem',
  border: '1px solid transparent',
  transition: 'background-color 120ms ease, border-color 120ms ease, box-shadow 120ms ease, opacity 120ms ease',
  outline: 'none',
};

const ROW_STYLE: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  padding: '0.25rem 0.5rem',
  fontSize: '0.8125rem',
  borderRadius: 'var(--radius-xs, 4px)',
};

function variantStyle(variant: ButtonVariant, hover: boolean, active: boolean): CSSProperties {
  switch (variant) {
    case 'primary':
      return {
        background: active ? 'var(--accent2)' : 'var(--accent)',
        // T7 F6 fix: the pressed (active) fill is Cobalt (--accent2), and
        // --bg (Black in dark mode) on Cobalt measured 4.05:1 — under the
        // 4.5:1 AA text floor (A11Y-1). --accent2-ink (White, 5.18:1 on
        // Cobalt in both themes) is scoped to this pressed state only; the
        // default/hover pairing (--bg on --accent/Cyan, 15.14:1) is
        // untouched — see tokens.css's --accent2-ink comment for the full
        // computation.
        color: active ? 'var(--accent2-ink)' : 'var(--bg)',
        borderColor: 'transparent',
        opacity: hover && !active ? 0.9 : 1,
      };
    case 'secondary':
      return {
        background: hover ? 'var(--panel)' : 'transparent',
        color: 'var(--ink)',
        borderColor: 'var(--border)',
      };
    case 'ghost':
      return {
        background: hover ? 'var(--panel)' : 'transparent',
        color: 'var(--ink)',
        borderColor: 'transparent',
      };
    case 'row':
      return {
        background: hover ? 'var(--panel)' : 'transparent',
        color: 'var(--ink)',
        borderColor: hover ? 'var(--border)' : 'transparent',
        ...ROW_STYLE,
      };
  }
}

export function Button({ label, variant, icon, onPress, disabled = false, loading = false, type = 'button', pressed }: ButtonProps) {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const [focused, setFocused] = useState(false);
  const isDisabled = disabled || loading;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    onPress();
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-pressed={pressed}
      data-lf-primitive="button"
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
        ...variantStyle(variant, hover, active),
        boxShadow: focused ? 'var(--focus-ring)' : 'none',
        opacity: isDisabled ? 0.5 : (variantStyle(variant, hover, active).opacity ?? 1),
        cursor: isDisabled ? 'not-allowed' : 'pointer',
      }}
    >
      {variant === 'row' && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 44,
            height: 44,
          }}
        />
      )}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          visibility: loading ? 'hidden' : 'visible',
        }}
      >
        {icon ? <Icon name={icon} size={16} tone={isDisabled ? 'disabled' : 'default'} style={{ color: 'currentColor' }} /> : null}
        {label}
      </span>
      {loading ? (
        <span style={{ position: 'absolute', inset: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner variant="inline" size="small" />
        </span>
      ) : null}
    </button>
  );
}
