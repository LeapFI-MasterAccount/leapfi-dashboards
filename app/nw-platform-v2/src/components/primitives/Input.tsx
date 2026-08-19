/**
 * Input — Primitive P6 (design_system_spec.md §2.1)
 *
 * Single-line text input. Variant: `text` (the only variant the spec
 * names — no variant prop is exposed since there is nothing to select
 * between).
 *
 * A11y baseline (spec P6): "Always paired with a visible label (may be
 * visually the placeholder-adjacent heading, never placeholder-only
 * labeling)." This component always renders a real <label>; `hideLabel`
 * visually hides it (sr-only) for composites that already render an
 * adjacent visible heading serving as the label — it never falls back to
 * placeholder-only labeling.
 *
 * Submitting state intentionally lives on the paired Button, not here
 * (spec P6 States column) — this component has no `loading`/`submitting`
 * state of its own.
 */
import { forwardRef, useId } from 'react';
import type { CSSProperties, InputHTMLAttributes, KeyboardEvent } from 'react';

export interface InputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange' | 'onSubmit' | 'size'
  > {
  /** Visible label text — required (spec P6 a11y baseline). */
  label: string;
  /** Visually hide the label (sr-only) when a composite supplies its own adjacent visible heading. */
  hideLabel?: boolean;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  /** Fired on Enter keypress. */
  onSubmit?: (value: string) => void;
  disabled?: boolean;
}

// Visually-hidden recipe — `top`/`left` pinned to 0 is load-bearing;
// see the invariant note on `DataTable.tsx`'s `srOnlyStyle`. Without it
// an unpositioned absolute box falls back to its in-flow static
// position, which can extend `html.scrollHeight` past whatever
// scroll container this primitive is rendered inside.
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

const labelStyle: CSSProperties = {
  display: 'block',
  marginBottom: 'var(--space-2, 0.375rem)',
  font: 'inherit',
  fontSize: '0.8125rem',
  color: 'var(--ink2)',
};

const baseInputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  font: 'inherit',
  fontSize: '0.9375rem',
  color: 'var(--ink)',
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm, 6px)',
  padding: '0.625rem 0.75rem',
  minHeight: 44,
  outline: 'none',
  transition: 'border-color 120ms ease, box-shadow 120ms ease',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hideLabel = false, value, placeholder, onChange, onSubmit, disabled, id, style, onKeyDown, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && onSubmit && !disabled) {
      onSubmit(value);
    }
    onKeyDown?.(event);
  };

  return (
    <div>
      <label htmlFor={inputId} style={hideLabel ? srOnly : labelStyle}>
        {label}
      </label>
      <input
        {...rest}
        ref={ref}
        id={inputId}
        type="text"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          ...baseInputStyle,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'text',
          ...style,
        }}
        className="lf-input"
        data-lf-primitive="input"
        onFocus={(event) => {
          event.currentTarget.style.boxShadow = 'var(--focus-ring)';
          event.currentTarget.style.borderColor = 'var(--accent)';
          rest.onFocus?.(event);
        }}
        onBlur={(event) => {
          event.currentTarget.style.boxShadow = 'none';
          event.currentTarget.style.borderColor = 'var(--border)';
          rest.onBlur?.(event);
        }}
      />
    </div>
  );
});
