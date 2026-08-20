/**
 * Panel-seated contrast regression (hostile-review fix wave, Class C
 * findings C1/C2).
 *
 * Sprint 1's hostile review confirmed 18 findings; C1 ("`--ink2` on
 * `--panel` = 4.344:1 in light theme, under the 4.5:1 AA floor") and C2
 * (`Tag`'s status variants deriving text color from `var(--bg)`, the
 * page-background role, rather than a color chosen for legibility against
 * the fill) are two of them. The brand authority's ruling for C1 is an
 * exact substitution — `color: var(--ink2)` -> `color: var(--chart-axis)`
 * at every site where the element's background resolves to `--panel` —
 * and for C2, a new theme-invariant token (`--sem-ink`, fixed #000000 in
 * both theme blocks, tokens.css) replacing `var(--bg)`.
 *
 * This file pins that substitution at rendered-DOM level for three
 * representative, brand-authority-confirmed panel-seated sites so a
 * regression (someone reverting one of these call sites back to
 * `var(--ink2)` / `var(--bg)`) is caught by an executed test, not just a
 * static grep. jsdom does not resolve CSS custom properties (see
 * components/Topbar.tsx's own "TESTED VIA CSSOM, NOT COMPUTED STYLE" note)
 * so these assertions read the literal `var(--x)` string React puts on the
 * inline `style` attribute, not a resolved color.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PosturePillBar } from '../../components/PosturePillBar';
import { StatCard } from '../../components/StatCard';
import { Tag } from '../../components/primitives/Tag';
import type { PostureSegment } from '../../engine/plan';

describe('PosturePillBar (C12) — segment text color on its own var(--panel) fill (C1)', () => {
  const segments: PostureSegment[] = [
    { index: 0, band: 'Ad hoc', isCurrent: false, isTarget: false, isBetween: false, label: '1 · Ad hoc' },
    { index: 1, band: 'Developing', isCurrent: true, isTarget: false, isBetween: false, label: '2 · Developing · now' },
    { index: 2, band: 'Defined', isCurrent: false, isTarget: false, isBetween: true, label: '3 · Defined' },
    { index: 3, band: 'Managed', isCurrent: false, isTarget: true, isBetween: false, label: '4 · Managed · goal' },
  ];

  it('the "between" segment (background: var(--panel)) never carries color: var(--ink2)', () => {
    render(<PosturePillBar segments={segments} />);
    const betweenSegment = screen.getByText('3 · Defined');
    expect(betweenSegment.style.background).toBe('var(--panel)');
    expect(betweenSegment.style.color).not.toBe('var(--ink2)');
    expect(betweenSegment.style.color).toBe('var(--chart-axis)');
  });

  it('the "neither" (default) segment (background: var(--panel)) never carries color: var(--ink2)', () => {
    render(<PosturePillBar segments={segments} />);
    const neitherSegment = screen.getByText('1 · Ad hoc');
    expect(neitherSegment.style.background).toBe('var(--panel)');
    expect(neitherSegment.style.color).not.toBe('var(--ink2)');
    expect(neitherSegment.style.color).toBe('var(--chart-axis)');
  });
});

describe('StatCard (C1) qualifier — rendered inside cardStyle (spreads PANEL_STYLE, C1)', () => {
  it('the qualifier caption never carries color: var(--ink2)', () => {
    render(<StatCard label="Expected 3-year ROI" value="4.2x" qualifier="blended" />);
    const qualifier = screen.getByText('blended');
    expect(qualifier.style.color).not.toBe('var(--ink2)');
    expect(qualifier.style.color).toBe('var(--chart-axis)');
  });
});

describe('Tag (P4) status variants — text color derived from a fill-legible token, not var(--bg) (C2)', () => {
  it.each(['status-positive', 'status-caution', 'status-alert'] as const)(
    '%s never carries color: var(--bg) (theme-swapping, accidentally-legible-only-in-dark-mode)',
    (variant) => {
      render(<Tag variant={variant} text="Status" />);
      const tag = screen.getByText('Status');
      expect(tag.style.color).not.toBe('var(--bg)');
      expect(tag.style.color).toBe('var(--sem-ink)');
    },
  );
});
