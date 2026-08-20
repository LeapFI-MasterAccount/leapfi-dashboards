/**
 * r13-A.1 (design_system_spec.md amendment A8, §2.6, §8 R-4(f)) —
 * SliderControlRow's economics grid swaps its bespoke local `StatTile`
 * helper for the real, shared StatCard (C1), now that StatCard carries an
 * optional `qualifier` caption slot. Before this fix, `StatCardProps` had
 * no slot for the six economics stats' qualifying caption ("blended",
 * "of N", "one-time", "at adoption", a controls-to-close goal phrase, and
 * `economics.roiNote`) — the bespoke `StatTile` was the only place that
 * text rendered. These assertions fail against the pre-fix bespoke
 * `StatTile` (no `data-lf-composite="stat-card"` markup, no eyebrow
 * Label-driven accessible name) and pass only once the six economics
 * tiles are composed from real StatCard instances with `qualifier` set.
 */
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { SliderControlRow } from '../../components/SliderControlRow';
import { deriveRecomputeView } from '../../engine/plan';
import { DEFAULT_SLIDERS } from '../../state/demoStore';

function renderRow() {
  return render(<SliderControlRow sliders={DEFAULT_SLIDERS} onSlidersChange={() => {}} />);
}

const view = deriveRecomputeView(DEFAULT_SLIDERS);
const { economics } = view;

const EXPECTED_TILES: Array<{ label: string; qualifier: string }> = [
  { label: 'Expected 3-year ROI', qualifier: economics.roiNote },
  { label: 'Payback', qualifier: 'blended' },
  { label: 'Plays funded', qualifier: `of ${economics.totalOpportunities}` },
  { label: 'Build cost', qualifier: 'one-time' },
  { label: 'Annual value', qualifier: 'at adoption' },
  { label: 'Controls to close', qualifier: economics.controlsToCloseGoalLabel },
];

describe('SliderControlRow economics grid — StatCard (C1) swap-in with qualifier (design_system_spec.md §2.6, §5.5, amendment A8)', () => {
  it('renders exactly 6 real StatCard composites (data-lf-composite="stat-card") for the economics grid, not the bespoke StatTile', () => {
    renderRow();
    const cards = document.querySelectorAll('[data-lf-composite="stat-card"]');
    expect(cards).toHaveLength(6);
  });

  it('each economics StatCard is an accessible role="group" named from a visible eyebrow Label (StatCard\'s own a11y baseline, §2.2 C1)', () => {
    renderRow();
    for (const { label } of EXPECTED_TILES) {
      const group = screen.getByRole('group', { name: label });
      expect(group.querySelector('[data-lf-primitive="label"][data-variant="eyebrow"]')).not.toBeNull();
    }
  });

  it('every one of the six economics stats still carries its qualifying caption after the swap (no text lost)', () => {
    renderRow();
    for (const { label, qualifier } of EXPECTED_TILES) {
      const group = screen.getByRole('group', { name: label });
      expect(within(group).getByText(qualifier)).toBeInTheDocument();
    }
  });

  it('the qualifier caption is aria-hidden and outside the StatValue accessible name (supplementary framing, not a second announced fragment)', () => {
    renderRow();
    const group = screen.getByRole('group', { name: 'Payback' });
    const qualifierNode = within(group).getByText('blended');
    expect(qualifierNode).toHaveAttribute('aria-hidden', 'true');
    // StatValue's own accessible name is unaffected by the qualifier.
    expect(group.querySelector(`[aria-label="${economics.paybackText}, Payback"]`)).not.toBeNull();
  });

  it('no bespoke StatTile markup remains — the local helper and its style constant are retired', () => {
    renderRow();
    // The pre-fix bespoke tile rendered a bare `<div>` wrapper with no
    // `role="group"`/`data-lf-composite` markup around each StatValue;
    // asserting all 6 tiles are real StatCard groups (above) already
    // proves this, but this test pins the negative directly: there is no
    // StatValue rendered outside of a `data-lf-composite="stat-card"` group
    // in the economics section.
    const grid = document.querySelector('[data-lf-composite="slider-control-row"]');
    expect(grid).not.toBeNull();
    const statValues = grid!.querySelectorAll('[data-lf-primitive="stat-value"]');
    for (const statValueEl of Array.from(statValues)) {
      expect(statValueEl.closest('[data-lf-composite="stat-card"]')).not.toBeNull();
    }
  });
});
