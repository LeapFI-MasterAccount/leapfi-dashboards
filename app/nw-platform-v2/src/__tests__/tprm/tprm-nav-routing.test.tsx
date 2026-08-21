/**
 * TPRM — sidebar wiring + shared-Domains-grid coexistence (L9, PI-3 sprint
 * plan call-14; `implementation/DECISIONS.md` D3).
 *
 * D3 (verbatim, in part): "TPRM... gets a genuinely new top-level Sidebar
 * entry... TPRM also stays visible in the shared Domains grid (Home +
 * OnSideOverview), per A9's multi-entry-point precedent." This suite pins
 * both halves against App.tsx's real Shell/routing and the already-shipped
 * Home/OnSideOverview screens — neither of which this dispatch's ALLOWLIST
 * permits editing, so these are pure regression checks that nothing here
 * regressed their existing, live behavior.
 */
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { OnSideOverview } from '../../screens/OnSideOverview';
import { DOMAINS } from '../../data/onside';

describe('Sidebar — TPRM top-level entry (D3, L9)', () => {
  it('TPRM is a flat top-level row: no chevron, no nested list, data-level="top"', () => {
    render(<App />);
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    const tprm = within(nav).getByRole('button', { name: 'TPRM' });
    expect(tprm).toHaveAttribute('data-level', 'top');
    expect(tprm).not.toHaveAttribute('aria-expanded');
    expect(within(nav).queryByRole('list', { name: 'TPRM sections' })).not.toBeInTheDocument();
  });

  it('clicking TPRM navigates to the TprmDomain screen and updates the Topbar breadcrumb', async () => {
    const user = userEvent.setup();
    render(<App />);
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    await user.click(within(nav).getByRole('button', { name: 'TPRM' }));

    expect(screen.getByRole('heading', { level: 1, name: /Third-Party Risk Management/ })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: 'TPRM' })).toHaveAttribute('aria-current', 'page');
  });
});

describe('TPRM stays visible in the shared Domains grid (D3: "per A9\'s multi-entry-point precedent")', () => {
  it('data/onside.ts DOMAINS still carries the tprm entry (unmodified by this dispatch)', () => {
    expect(DOMAINS.some((d) => d.key === 'tprm')).toBe(true);
  });

  it('the OnSide · Overview posture grid still renders a Third-Party Risk Management domain card', () => {
    render(<OnSideOverview onNavigate={() => {}} />);
    expect(screen.getByRole('button', { name: 'Third-Party Risk Management' })).toBeInTheDocument();
  });

  it('Home\'s "Risk posture by domain" table still lists Third-Party Risk Management', async () => {
    render(<App />);
    // Home is the boot screen — no navigation needed.
    const table = screen.getByRole('table', { name: 'Risk posture by domain' });
    expect(within(table).getByText('Third-Party Risk Management')).toBeInTheDocument();
  });
});
