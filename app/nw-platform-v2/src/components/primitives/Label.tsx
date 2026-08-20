/**
 * Label — Primitive P3 (design_system_spec.md §2.1)
 *
 * Variants: `body-secondary`, `eyebrow` (ALL-CAPS, tracking per doctrine
 * TYP-4 — "value not restated here" per the spec's own text).
 *
 * STOP-item CLOSED (T7 F11): TYP-4's exact letter-spacing value lives in
 * brand_doctrine.md's Typography section ("Letter-spacing +0.05em for
 * ALL-CAPS labels only") — this primitive originally shipped a conventional
 * eyebrow tracking value (`0.08em`) as a structural placeholder pending
 * that lookup; it is now the pinned `0.05em`, matching the 7 other ad hoc
 * ALL-CAPS sites the same audit finding named (Roadmap.tsx x2, StudioAsk.tsx,
 * SliderControlRow.tsx, InvestmentDesign.tsx, PresenterRail.tsx,
 * PlanTable.tsx, NotificationBellPanel.tsx — all corrected in the same pass).
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
    letterSpacing: '0.05em', /* T7 F11: doctrine TYP-4 value; was 0.08em placeholder per this file's own header STOP-item */
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
