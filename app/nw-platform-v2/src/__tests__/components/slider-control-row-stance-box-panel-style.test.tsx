/**
 * r13 A.2 hostile-review fix (finding D2) — SliderControlRow's
 * `stanceBoxStyle` matches the panel sweep's own stated shape criteria
 * (background `var(--panel)` + `1px solid` border + a `borderRadius`) but
 * was never converted to spread the shared `PANEL_STYLE` constant. This
 * composite renders on Studio · Investment Design, which the demo script
 * walks the presenter through live.
 *
 * `stanceBoxStyle` is module-private (not exported), so its shape is
 * asserted here at the rendered inline-style level rather than by importing
 * the constant directly (see theme/__tests__/panelStyle.test.ts for the
 * exported-constant-level assertions on every other consolidated site).
 * These assertions pin the *rendered output*, which is unchanged by the
 * D2 fix (spread-then-override): they fail equally against a stanceBoxStyle
 * that never adopted PANEL_STYLE and one that adopted it incorrectly and
 * changed the visible background/border/radius.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SliderControlRow } from '../../components/SliderControlRow';
import { DEFAULT_SLIDERS } from '../../state/demoStore';

function renderRow() {
  return render(<SliderControlRow sliders={DEFAULT_SLIDERS} onSlidersChange={() => {}} />);
}

function getStanceBox(): HTMLElement {
  // The stance box is the only element wrapping the "Your stance" eyebrow
  // Label + lead/body copy; found via its Label sibling text, matching how
  // sibling tests in this suite locate composite-internal regions.
  const eyebrow = screen.getByText('Your stance');
  const box = eyebrow.parentElement;
  if (!box) throw new Error('stance box wrapper not found');
  return box;
}

describe('SliderControlRow stance box — PANEL_STYLE consolidation (finding D2)', () => {
  it('renders with the shared panel surface (background var(--panel), border, borderRadius) at rest (tension=false, the default slider state)', () => {
    renderRow();
    const box = getStanceBox();
    expect(box.style.background).toBe('var(--panel)');
    expect(box.style.borderRadius).toBe('var(--radius-sm, 12px)');
    // At rest the border color is the plain panel border (`var(--border)`),
    // byte-identical to PANEL_STYLE's own border — the local override only
    // changes the color when `tension` is true.
    expect(box.style.border).toBe('1px solid var(--border)');
  });

  it('preserves its own borderRadius override (var(--radius-sm, 12px)) rather than inheriting PANEL_STYLE default md radius', () => {
    renderRow();
    const box = getStanceBox();
    expect(box.style.borderRadius).not.toBe('var(--radius-md, 10px)');
    expect(box.style.borderRadius).toBe('var(--radius-sm, 12px)');
  });

  it('preserves its own padding/gap/layout (not folded into the shared constant)', () => {
    renderRow();
    const box = getStanceBox();
    expect(box.style.padding).toBe('0.75rem 0.875rem');
    expect(box.style.display).toBe('flex');
    expect(box.style.flexDirection).toBe('column');
    expect(box.style.gap).toBe('0.3125rem');
  });
});
