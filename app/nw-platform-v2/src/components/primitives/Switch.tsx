/**
 * Switch — Primitive P8 (design_system_spec.md §2.1)
 *
 * On/off toggle. `role="switch"`, labelled, state announced on change
 * (spec a11y baseline) via the native aria-checked change plus a visible
 * on/off text so state is never color-only.
 */
import type { CSSProperties } from 'react';

export interface SwitchProps {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const rowStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  font: 'inherit',
  fontSize: '0.9375rem',
  color: 'var(--ink)',
};

const trackBaseStyle: CSSProperties = {
  position: 'relative',
  display: 'inline-block',
  width: 40,
  height: 22,
  borderRadius: 999,
  border: '1px solid var(--border)',
  padding: 0,
  boxSizing: 'border-box',
  transition: 'background-color 120ms ease, border-color 120ms ease',
};

const knobStyle: CSSProperties = {
  position: 'absolute',
  top: 2,
  width: 16,
  height: 16,
  borderRadius: '50%',
  background: 'var(--ink)',
  transition: 'left 120ms ease',
};

export function Switch({ checked, label, onChange, disabled = false }: SwitchProps) {
  return (
    <label style={{ ...rowStyle, opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        data-lf-primitive="switch"
        onClick={() => {
          if (!disabled) onChange(!checked);
        }}
        onFocus={(event) => {
          event.currentTarget.style.boxShadow = 'var(--focus-ring)';
        }}
        onBlur={(event) => {
          event.currentTarget.style.boxShadow = 'none';
        }}
        style={{
          ...trackBaseStyle,
          background: checked ? 'var(--accent)' : 'var(--panel)',
          borderColor: checked ? 'var(--accent)' : 'var(--border)',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            ...knobStyle,
            left: checked ? 20 : 2,
            background: checked ? 'var(--bg)' : 'var(--ink)',
          }}
        />
      </button>
      <span>{label}</span>
      {/* FIX WAVE (Class C, C1): every real call site of this primitive
          (SettingsToggles.tsx CARD_STYLE, RegulatoryFeedSources.tsx
          CARD_STYLE — both spread PANEL_STYLE — and App.tsx's
          themeToggleSlot, which renders inside Topbar's permanently-dark
          chrome band) either sits on var(--panel) or on the dark-forced
          chrome; --ink2 fails AA on var(--panel) in light theme, so
          --chart-axis (which clears AA on both --panel and the dark
          chrome band, in both themes) is used unconditionally here —
          unlike Label.tsx/Input.tsx/StatValue.tsx (design_system_spec.md
          Ruling B, §2.1/§2.7/§2.2/§2.6/§2.4/§8 R-1/§8 R-4/§11), Switch
          has no currently-compliant page-background call site this swap
          would needlessly touch. */}
      <span aria-hidden="true" style={{ color: 'var(--chart-axis)', fontSize: '0.8125rem' }}>
        {checked ? 'On' : 'Off'}
      </span>
    </label>
  );
}
