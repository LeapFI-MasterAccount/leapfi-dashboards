/**
 * r13 A.1 — ChatHero's counter row swaps its bespoke `CounterTile` stand-in
 * for the real shared StatCard (C1, design_system_spec.md §2.2, §5.4:
 * "counters StatCard row"). `CounterTile` was a documented placeholder
 * (ChatHero.tsx file header "AMBIGUITY RESOLVED (StatCard row)") kept only
 * because `components/StatCard.tsx` did not exist yet in this worktree; it
 * now does (composites/StatCard.tsx), so the placeholder is retired and the
 * row is composed from real StatCard instances — matching every other C10
 * counter-row consumer's own StatCard usage (Home.tsx, HomePanels.tsx,
 * OnSideOverview.tsx, ReportView.tsx all already import the real component).
 *
 * StatCard's own markup (component header, `components/StatCard.tsx`) is
 * `role="group"` + `data-lf-composite="stat-card"` + a visible eyebrow
 * `Label` giving the group its accessible name via `aria-labelledby` — none
 * of which the old local `CounterTile` (bare `StatValue`) rendered. These
 * assertions therefore fail against the pre-fix `CounterTile` and pass only
 * once ChatHero's counter row is built from the real StatCard.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatHero } from '../../components/ChatHero';
import type { ChatCounter } from '../../components/ChatHero';

const COUNTERS: ChatCounter[] = [
  { value: 412, label: 'Monitored docs' },
  { value: '11 of 12', label: 'Interviews complete' },
];

function renderHero() {
  return render(
    <ChatHero
      counters={COUNTERS}
      messages={[]}
      suggestions={[]}
      inputValue=""
      onInputChange={() => {}}
      onAsk={() => {}}
      state="idle"
    />,
  );
}

describe('ChatHero counter row — StatCard (C1) swap-in (design_system_spec.md §5.4)', () => {
  it('renders one StatCard (data-lf-composite="stat-card") per counter, not the old bare-StatValue CounterTile', () => {
    renderHero();
    const cards = document.querySelectorAll('[data-lf-composite="stat-card"]');
    expect(cards).toHaveLength(COUNTERS.length);
  });

  it('each StatCard is an accessible role="group" whose name comes from a visible eyebrow Label (StatCard\'s own a11y baseline, §2.2 C1)', () => {
    renderHero();
    const group = screen.getByRole('group', { name: 'Monitored docs' });
    expect(group).toBeInTheDocument();
    expect(group.querySelector('[data-lf-primitive="label"][data-variant="eyebrow"]')).not.toBeNull();
  });

  it('the value + label remain one bundled accessible unit (StatValue P11 contract) inside the swapped-in StatCard', () => {
    renderHero();
    expect(screen.getByText('412')).toBeInTheDocument();
    // StatValue's own accessible name — unchanged contract, now nested one level deeper inside StatCard.
    expect(document.querySelector('[aria-label="412, Monitored docs"]')).not.toBeNull();
  });
});
