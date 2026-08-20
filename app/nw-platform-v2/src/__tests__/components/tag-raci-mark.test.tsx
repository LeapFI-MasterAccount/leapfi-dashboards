/**
 * Tag (P4) `raci-mark` variant — regression (design_system_spec.md §2.1
 * P4, §2.5; amendment A2; A6 accessibleText contract; delta index
 * §8 R-4(a)/(c)).
 *
 * Runtime contract (§2.5): the mark is `role="img"` with `accessibleText`
 * as its ONLY accessible name — the visible letter is replaced content
 * for assistive tech, not additionally announced (same name-replaces-
 * content technique Icon.tsx's labelled/`role="img"` mode already uses).
 *
 * Compile-time contract (A6): `accessibleText` is optional for every
 * other variant and REQUIRED when `variant="raci-mark"`, enforced by the
 * prop type — a `raci-mark` Tag with no `accessibleText` must fail to
 * compile, never fall back to the visible letter as its accessible name.
 * Pinned below via `@ts-expect-error`-guarded fixtures in exported
 * (never-invoked) functions, picked up by `npx tsc --noEmit` the same
 * way as the runtime-executed tests in this file (`tsconfig.json`
 * `include: ["src"]`).
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tag } from '../../components/primitives/Tag';
import type { TagProps } from '../../components/primitives/Tag';

describe('Tag — raci-mark variant (§2.5)', () => {
  it('renders the visible letter with role="img" and the full word as its only accessible name', () => {
    render(<Tag variant="raci-mark" text="R" accessibleText="Responsible" />);
    const badge = screen.getByRole('img', { name: 'Responsible' });
    expect(badge.textContent).toBe('R');
  });

  it('never falls back to the visible letter as the accessible name — the word replaces it, not augments it', () => {
    render(<Tag variant="raci-mark" text="A" accessibleText="Accountable" />);
    expect(screen.queryByRole('img', { name: 'A' })).toBeNull();
    expect(screen.getByRole('img', { name: 'Accountable' })).toBeInTheDocument();
  });

  it('is non-interactive — carries no press handler or button role', () => {
    render(<Tag variant="raci-mark" text="C" accessibleText="Consulted" />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('other Tag variants are unaffected — accessibleText stays optional and the visible text remains the accessible name when absent', () => {
    render(<Tag variant="status-positive" text="Current" />);
    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
  });
});

/**
 * Compile-time-only fixtures — never rendered, never invoked at runtime.
 * Exported so `noUnusedLocals` does not flag them.
 */
export function __typeContract_raciMarkRequiresAccessibleText(): TagProps {
  // @ts-expect-error — `accessibleText` is required when `variant="raci-mark"` (§2.5 / A6): omitting it must not type-check.
  return { variant: 'raci-mark', text: 'R' };
}
