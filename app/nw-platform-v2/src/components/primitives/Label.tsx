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
 *
 * `surface` prop (amendment A14, design_system_spec.md §2.1 P3 / §2.7):
 * both variants' text color hardcoded `--ink2` unconditionally, which fails
 * the 4.5:1 AA floor in light theme wherever this Label's immediate
 * rendering context is a `--panel` surface (tokens.css's own comment names
 * `--chart-axis` as "the panel-seated variant" substitute). `surface="page"`
 * (default) is byte-identical to pre-A14 behavior; `surface="panel"`
 * resolves the text color to `--chart-axis` instead — REQUIRED wherever the
 * immediate rendering context is a `--panel` surface (§2.7's binding
 * population). This is a second, independent styling dimension, not a
 * second exception to §8 R-1 (R-1 governs WHO authors the eyebrow
 * treatment; `surface` governs WHICH color role it resolves to — §2.7's R-1
 * reconciliation note). `disabled`'s dimmed `--ink3` is unaffected (already
 * clears 4.5:1 on `--panel` in both themes independent of `surface`).
 */
import type { CSSProperties } from 'react';

export type LabelVariant = 'body-secondary' | 'eyebrow';
export type LabelSurface = 'page' | 'panel';

export interface LabelProps {
  text: string;
  variant: LabelVariant;
  disabled?: boolean;
  /** A14 — `'page'` (default, `--ink2`, byte-identical to pre-A14) or
   * `'panel'` (`--chart-axis`, REQUIRED when this Label's immediate
   * rendering context is a `--panel` surface — design_system_spec.md §2.7). */
  surface?: LabelSurface;
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

const SURFACE_COLOR: Record<LabelSurface, string> = {
  page: 'var(--ink2)',
  panel: 'var(--chart-axis)',
};

export function Label({ text, variant, disabled = false, surface = 'page' }: LabelProps) {
  return (
    <span
      data-lf-primitive="label"
      data-variant={variant}
      data-surface={surface}
      style={{
        ...VARIANT_STYLE[variant],
        color: disabled ? 'var(--ink3)' : SURFACE_COLOR[surface],
      }}
    >
      {text}
    </span>
  );
}
