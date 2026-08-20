/**
 * B-15 regression — Settings approval matrix regains v1's per-tier
 * "Committee vote" toggle and editable committee name.
 *
 * Base anchor (leapfi-platform.html @ 1c230fe, READ-ONLY):
 *  - `renderApprovalSettings()` (source 3968-3983): a per-tier `.toggle`
 *    (`toggleTierCommittee`) plus an editable committee-name `<input>`
 *    (`setCommitteeName`) — both a pure client-side visual flip with no
 *    server call, the same no-persistence contract the Identity/
 *    Notification `Switch` rows on this screen already carry.
 */
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SettingsToggles } from '../../screens/SettingsToggles';
import { APPROVAL } from '../../data/cases';

describe('Approval matrix per-tier committee-vote toggle (base toggleTierCommittee, 3975)', () => {
  it('renders one Switch per tier, seeded from APPROVAL.tiers[].committee', () => {
    render(<SettingsToggles />);

    const switches = screen.getAllByRole('switch', { name: 'Committee vote required before final approval' });
    expect(switches).toHaveLength(APPROVAL.tiers.length);
    APPROVAL.tiers.forEach((tier, index) => {
      expect(switches[index]).toHaveAttribute('aria-checked', String(tier.committee));
    });
  });

  it('flipping one tier\'s toggle changes only that tier\'s state', () => {
    render(<SettingsToggles />);

    const switches = screen.getAllByRole('switch', { name: 'Committee vote required before final approval' });
    const firstTier = APPROVAL.tiers[0];
    expect(firstTier).toBeDefined();
    const before = switches.map((el) => el.getAttribute('aria-checked'));

    fireEvent.click(switches[0] as HTMLElement);

    const after = screen
      .getAllByRole('switch', { name: 'Committee vote required before final approval' })
      .map((el) => el.getAttribute('aria-checked'));
    expect(after[0]).toBe(String(!firstTier!.committee));
    after.slice(1).forEach((value, index) => expect(value).toBe(before[index + 1]));
  });
});

describe('Approval matrix editable committee name (base setCommitteeName, 3968-3983)', () => {
  it('renders an editable text input seeded from APPROVAL.committee', () => {
    render(<SettingsToggles />);

    const input = screen.getByRole('textbox', { name: 'Approving committee name' }) as HTMLInputElement;
    expect(input.value).toBe(APPROVAL.committee);

    fireEvent.change(input, { target: { value: 'Executive Risk Committee' } });
    expect(input.value).toBe('Executive Risk Committee');
  });
});
