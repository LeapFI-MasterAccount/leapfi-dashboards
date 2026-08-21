/**
 * OnSide · Overview — "Ask OnSide" context-scoped chat entry point
 * (design_system_spec.md §2.9/§5.8, amendment A16 / PI2-D42).
 */
import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnSideOverview } from '../../screens/OnSideOverview';

describe('OnSide · Overview — "Ask OnSide" entry affordance', () => {
  it('renders a secondary-weight "Ask OnSide" Button and opens the local Drawer to "OnSide chat", one Drawer only', async () => {
    const user = userEvent.setup();
    render(<OnSideOverview onNavigate={() => {}} />);
    const trigger = screen.getByRole('button', { name: 'Ask OnSide' });
    // Amendment A20 (PI2-D47, design_system_spec.md §2.9.12): the entry-affordance trigger's weight flips ghost -> secondary on all six remaining onside.*/studio.* screens ("the CTA is crap" -> a real border/hover fill), never primary (Core Principle 2 -- never competes with a screen's own primary CTA).
    expect(trigger).toHaveAttribute('data-variant', 'secondary');
    await user.click(trigger);
    const heading = await screen.findByRole('heading', { name: 'OnSide chat' });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(document.querySelectorAll('[data-lf-composite="drawer"]')).toHaveLength(1);
  });
});
