/**
 * Divider — Primitive P10 (design_system_spec.md §2.1)
 *
 * Orientation: horizontal / vertical. Non-interactive, no states.
 *
 * a11y baseline (spec P10): "`role=\"separator\"` where it divides
 * distinct content regions (not pure visual rule)." This is a
 * per-usage judgment the spec explicitly leaves to the consumer (a
 * Divider used as a pure decorative rule inside one region is different
 * from one separating two distinct regions) — so it is exposed as an
 * opt-in `decorative` prop rather than hard-coded either way:
 * `decorative` defaults to `true` (aria-hidden, no role — the safer
 * default for a bare visual rule) and a composite sets
 * `decorative={false}` when the Divider genuinely separates distinct
 * content regions, which renders `role="separator"` with a matching
 * `aria-orientation`.
 */
import type { CSSProperties } from 'react';

export type DividerOrientation = 'horizontal' | 'vertical';

export interface DividerProps {
  orientation: DividerOrientation;
  /** See a11y baseline note above. Defaults to true (decorative rule). */
  decorative?: boolean;
}

export function Divider({ orientation, decorative = true }: DividerProps) {
  const style: CSSProperties =
    orientation === 'horizontal'
      ? { width: '100%', height: 1, background: 'var(--border)', border: 'none' }
      : { width: 1, height: '100%', background: 'var(--border)', border: 'none', alignSelf: 'stretch' };

  return (
    <div
      data-lf-primitive="divider"
      data-orientation={orientation}
      role={decorative ? undefined : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      aria-hidden={decorative ? true : undefined}
      style={style}
    />
  );
}
