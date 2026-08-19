/**
 * Label — Primitive P3 (design_system_spec.md §2.1)
 *
 * Variants: `body-secondary`, `eyebrow` (ALL-CAPS, tracking per doctrine
 * TYP-4 — "value not restated here" per the spec's own text).
 *
 * AMBIGUITY RESOLVED: TYP-4's exact letter-spacing value lives in
 * brand_doctrine.md's Typography section, which is outside this
 * dispatch's cited sources (design_system_spec.md §1.4 explicitly
 * excludes typography values from this document, and tokens.css only
 * carries color roles, not type tracking). I used a conventional eyebrow
 * tracking value (`0.08em`) as a structural placeholder so the
 * ALL-CAPS + letterspacing *shape* required by the spec text is present;
 * the exact TYP-4 figure should be swapped in by whoever owns
 * brand_doctrine.md typography values. STOP-item, not silently invented
 * as final: flagging for verification against TYP-4 directly.
 *
 * a11y baseline (spec P3): "Eyebrow labels are supplementary, never the
 * only accessible name for the section they head — always paired with a
 * heading element." This is a consumer-composition rule (a Label cannot
 * enforce what heading sits next to it), so it is documented here rather
 * than encoded — composites using the `eyebrow` variant as a section
 * header must pair it with a real heading element.
 */
import type { CSSProperties } from 'react';

export type LabelVariant = 'body-secondary' | 'eyebrow';

export interface LabelProps {
  text: string;
  variant: LabelVariant;
  disabled?: boolean;
}

const VARIANT_STYLE: Record<LabelVariant, CSSProperties> = {
  'body-secondary': {
    font: 'inherit',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--ink2)',
  },
  eyebrow: {
    font: 'inherit',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--ink2)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
};

export function Label({ text, variant, disabled = false }: LabelProps) {
  return (
    <span
      data-lf-primitive="label"
      data-variant={variant}
      style={{
        ...VARIANT_STYLE[variant],
        color: disabled ? 'var(--ink3)' : VARIANT_STYLE[variant]?.color,
      }}
    >
      {text}
    </span>
  );
}
