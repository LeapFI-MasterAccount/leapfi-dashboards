/**
 * L6 (call-02, D4) — Findings tab: 12th SetupCard (`locked`) in Reporting's
 * ReportIndex grid.
 *
 * D4 (`DECISIONS.md`): "Findings lands as a 12th SetupCard (locked
 * variant, C15) inside the ALREADY-SHIPPED Reporting screen's 11-card
 * ReportIndex grid (C22) — not a new Sidebar entry, top-level or nested."
 * The existing 11 interactive report cards (`reporting_cards.test.tsx`)
 * are unchanged; this is purely an additive 12th card, appended after
 * them, matching the existing locked-card pattern exactly (SetupCard
 * `locked` variant — a non-interactive description region, no press
 * handler, no button role — see `OnSideOwnership.tsx`'s onboarding-step
 * cards and `ConnectSoon.tsx`'s sibling-module cards for the pattern).
 */
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Reporting } from '../../screens/Reporting';

describe('Reporting index — Findings locked card (D4)', () => {
  it('renders a 12th, non-interactive locked SetupCard for Findings after the 11 interactive report cards', () => {
    render(<Reporting onNavigate={() => {}} />);

    const main = screen.getByRole('main');

    // Still exactly 11 pressable report cards — the locked card adds no
    // button (SetupCard's `locked` variant renders a plain description
    // region, not a button; see `SetupCard.tsx`'s a11y baseline).
    const cards = within(main).getAllByRole('button');
    expect(cards).toHaveLength(11);

    // The Findings card itself is present, titled "Findings", and is not
    // a button (locked variant — no action).
    const findingsHeading = within(main).getByText('Findings');
    expect(findingsHeading).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Findings/ })).not.toBeInTheDocument();

    // It carries the `locked` SetupCard variant marker, matching the
    // existing locked-card pattern exactly (data-variant="locked").
    const lockedCard = main.querySelector('[data-lf-composite="setup-card"][data-variant="locked"]');
    expect(lockedCard).not.toBeNull();
    expect(lockedCard?.textContent).toContain('Findings');
  });

  it('is the last card in the grid, appended after the 11 interactive report cards', () => {
    render(<Reporting onNavigate={() => {}} />);

    const main = screen.getByRole('main');
    const grid = main.querySelector('[data-lf-composite="setup-card"]')?.parentElement;
    expect(grid).not.toBeNull();

    const cardEls = grid ? Array.from(grid.querySelectorAll('[data-lf-composite="setup-card"]')) : [];
    expect(cardEls).toHaveLength(12);
    expect(cardEls[11]?.getAttribute('data-variant')).toBe('locked');
    expect(cardEls[11]?.textContent).toContain('Findings');
  });
});
