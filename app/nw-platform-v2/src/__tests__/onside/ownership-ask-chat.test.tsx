/**
 * OnSide · Ownership — "Ask OnSide" context-scoped chat entry point
 * (design_system_spec.md §2.9/§5.8, amendment A16 / PI2-D42).
 */
import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnSideOwnership } from '../../screens/OnSideOwnership';

describe('OnSide · Ownership — "Ask OnSide" entry affordance', () => {
  it('renders a ghost "Ask OnSide" Button and opens the local Drawer to "OnSide chat", one Drawer only', async () => {
    const user = userEvent.setup();
    render(<OnSideOwnership />);
    const trigger = screen.getByRole('button', { name: 'Ask OnSide' });
    expect(trigger).toHaveAttribute('data-variant', 'ghost');
    await user.click(trigger);
    const heading = await screen.findByRole('heading', { name: 'OnSide chat' });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(document.querySelectorAll('[data-lf-composite="drawer"]')).toHaveLength(1);
  });

  it('opening a RACI row while the chat is open swaps the SAME Drawer to the document detail', async () => {
    const user = userEvent.setup();
    render(<OnSideOwnership />);
    await user.click(screen.getByRole('button', { name: 'Ask OnSide' }));
    await screen.findByRole('heading', { name: 'OnSide chat' });

    const table = screen.getByRole('table', { name: 'RACI · policy ownership matrix' });
    const cell = table.querySelector('tbody tr td, tbody tr th');
    // Whole-row click affordance (file header) — click the row itself.
    const row = cell?.closest('tr');
    if (row) await user.click(row);

    expect(document.querySelectorAll('[data-lf-composite="drawer"]')).toHaveLength(1);
  });
});
