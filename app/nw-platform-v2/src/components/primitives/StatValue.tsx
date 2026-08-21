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
 *
 * `surface` prop (amendment A14, design_system_spec.md §2.1 P11 / §2.7):
 * the `unit`/`label` caption styles hardcoded `--ink2` unconditionally,
 * which fails the 4.5:1 AA floor in light theme wherever this StatValue's
 * immediate rendering context is a `--panel` surface. `surface="page"`
 * (default) is byte-identical to pre-A14 behavior; `surface="panel"`
 * resolves the caption color to `--chart-axis` instead — REQUIRED at every
 * current call site (StatCard's own body; ShowTheWorkingPanel's Drawer
 * body), per §2.7's binding population.
 */
import type { CSSProperties } from 'react';

export type StatValueState = 'default' | 'loading' | 'updating';
export type StatValueSurface = 'page' | 'panel';

export interface StatValueProps {
  value: string | number;
  unit?: string;
  label: string;
  state?: StatValueState;
  /** A14 — `'page'` (default, `--ink2`, byte-identical to pre-A14) or
   * `'panel'` (`--chart-axis`, REQUIRED when this StatValue's immediate
   * rendering context is a `--panel` surface — design_system_spec.md §2.7). */
  surface?: StatValueSurface;
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
};

const labelStyle: CSSProperties = {
  fontSize: '0.75rem',
};

const SURFACE_COLOR: Record<StatValueSurface, string> = {
  page: 'var(--ink2)',
  panel: 'var(--chart-axis)',
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

export function StatValue({ value, unit, label, state = 'default', surface = 'page' }: StatValueProps) {
  const accessibleName = `${value}${unit ? ` ${unit}` : ''}, ${label}`;
  const captionColor = SURFACE_COLOR[surface];

  if (state === 'loading') {
    return (
      <div style={wrapStyle} role="text" aria-label={`${label}, loading`} data-lf-primitive="stat-value" data-state="loading" data-surface={surface}>
        <span aria-hidden="true" style={skeletonStyle} />
        <span aria-hidden="true" style={{ ...labelStyle, color: captionColor }}>
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
      data-surface={surface}
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
        {unit ? <span style={{ ...unitStyle, color: captionColor }}>{unit}</span> : null}
      </div>
      <span aria-hidden="true" style={{ ...labelStyle, color: captionColor }}>
        {label}
      </span>
    </div>
  );
}
