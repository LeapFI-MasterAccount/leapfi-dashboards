/**
 * Studio · Investment Design — "Ask Studio" context-scoped chat entry point
 * (design_system_spec.md §2.9/§5.8, amendment A16 / PI2-D42).
 */
import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InvestmentDesign } from '../../screens/InvestmentDesign';

describe('Studio · Investment Design — "Ask Studio" entry affordance', () => {
  it('renders a ghost "Ask Studio" Button and opens the local Drawer to "Studio chat", one Drawer only', async () => {
    const user = userEvent.setup();
    render(<InvestmentDesign />);
    const trigger = screen.getByRole('button', { name: 'Ask Studio' });
    expect(trigger).toHaveAttribute('data-variant', 'ghost');
    await user.click(trigger);
    const heading = await screen.findByRole('heading', { name: 'Studio chat' });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(document.querySelectorAll('[data-lf-composite="drawer"]')).toHaveLength(1);
  });

  it('opening a play row while the chat is open swaps the SAME Drawer to the play detail', async () => {
    const user = userEvent.setup();
    render(<InvestmentDesign />);
    await user.click(screen.getByRole('button', { name: 'Ask Studio' }));
    await screen.findByRole('heading', { name: 'Studio chat' });

    const openButtons = screen.getAllByRole('button', { name: 'Open' });
    await user.click(openButtons[0]!);

    expect(document.querySelectorAll('[data-lf-composite="drawer"]')).toHaveLength(1);
    expect(screen.queryByRole('heading', { name: 'Studio chat' })).not.toBeInTheDocument();
  });
});
