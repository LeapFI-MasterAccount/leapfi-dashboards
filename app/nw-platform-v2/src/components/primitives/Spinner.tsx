/**
 * Spinner — Primitive P12 (design_system_spec.md §2.1)
 *
 * Inline/block loading indicator. Spec a11y baseline: "aria-hidden when
 * paired with aria-busy on its owning control (Button loading state);
 * standalone use requires role="status" + accessible label."
 *
 * This component defaults to the paired-with-owning-control case
 * (aria-hidden, silent) since that is how Button's loading state
 * consumes it. Passing `label` switches it to the standalone contract:
 * role="status" plus that accessible label.
 */
import type { CSSProperties } from 'react';

export type SpinnerVariant = 'inline' | 'block';
export type SpinnerSize = 'small' | 'medium' | 'large';

export interface SpinnerProps {
  variant?: SpinnerVariant;
  size?: SpinnerSize;
  /** Provide only for standalone use (not embedded in a Button/aria-busy control) — turns this into an accessible role="status" region. */
  label?: string;
}

const dimensions: Record<SpinnerSize, number> = {
  small: 14,
  medium: 20,
  large: 32,
};

export function Spinner({ variant = 'inline', size = 'medium', label }: SpinnerProps) {
  const d = dimensions[size];
  const svgStyle: CSSProperties = {
    width: d,
    height: d,
    display: variant === 'block' ? 'block' : 'inline-block',
    margin: variant === 'block' ? '0 auto' : undefined,
  };

  // Rotation is expressed as a native SVG <animateTransform> rather than a
  // CSS @keyframes animation: this component's allowlist is this file
  // only (no shared stylesheet to host a keyframes rule), and SVG SMIL
  // animation needs no external CSS at all.
  const svg = (
    <svg viewBox="0 0 24 24" style={svgStyle} data-lf-primitive="spinner" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="var(--border)"
        strokeWidth="3"
      />
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="14 42"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="0.8s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );

  if (label) {
    return (
      <span role="status" aria-label={label}>
        {svg}
      </span>
    );
  }

  return svg;
}
