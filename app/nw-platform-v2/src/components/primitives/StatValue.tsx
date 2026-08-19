/**
 * StatValue — Primitive P11 (design_system_spec.md §2.1)
 *
 * Big number + small unit label. Spec a11y baseline: "The number and its
 * label are one accessible unit (not two separately-announced
 * fragments)" — rendered as a single element whose accessible name is
 * the full "value unit, label" string, with the visual number/unit/label
 * as aria-hidden presentation children.
 *
 * Recompute-triggered live-region announcements are explicitly owned by
 * the composite (StatCard / SliderControlRow per spec), not this
 * primitive — this component only renders `loading` and `updating`
 * visual states.
 */
import type { CSSProperties } from 'react';

export type StatValueState = 'default' | 'loading' | 'updating';

export interface StatValueProps {
  value: string | number;
  unit?: string;
  label: string;
  state?: StatValueState;
}

const wrapStyle: CSSProperties = {
  display: 'inline-flex',
  flexDirection: 'column',
  gap: '0.125rem',
};

const numberRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '0.25rem',
};

const valueStyle: CSSProperties = {
  fontSize: '1.75rem',
  fontWeight: 700,
  color: 'var(--ink)',
  lineHeight: 1.1,
};

const unitStyle: CSSProperties = {
  fontSize: '0.8125rem',
  color: 'var(--ink2)',
};

const labelStyle: CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--ink2)',
};

// No CSS @keyframes pulse here: this component's allowlist is this file
// only (no shared stylesheet to host a keyframes rule). The skeleton is
// communicated by shape + the "loading" accessible name rather than a
// motion effect that would need an external animation rule.
const skeletonStyle: CSSProperties = {
  display: 'inline-block',
  width: '3.5em',
  height: '1.5em',
  borderRadius: 4,
  background: 'var(--panel)',
  border: '1px solid var(--border)',
};

export function StatValue({ value, unit, label, state = 'default' }: StatValueProps) {
  const accessibleName = `${value}${unit ? ` ${unit}` : ''}, ${label}`;

  if (state === 'loading') {
    return (
      <div style={wrapStyle} role="text" aria-label={`${label}, loading`} data-lf-primitive="stat-value" data-state="loading">
        <span aria-hidden="true" style={skeletonStyle} />
        <span aria-hidden="true" style={labelStyle}>
          {label}
        </span>
      </div>
    );
  }

  return (
    <div
      style={wrapStyle}
      role="text"
      aria-label={accessibleName}
      data-lf-primitive="stat-value"
      data-state={state}
    >
      <div aria-hidden="true" style={numberRowStyle}>
        <span
          style={{
            ...valueStyle,
            transition: 'opacity 150ms ease',
            opacity: state === 'updating' ? 0.6 : 1,
          }}
        >
          {value}
        </span>
        {unit ? <span style={unitStyle}>{unit}</span> : null}
      </div>
      <span aria-hidden="true" style={labelStyle}>
        {label}
      </span>
    </div>
  );
}
