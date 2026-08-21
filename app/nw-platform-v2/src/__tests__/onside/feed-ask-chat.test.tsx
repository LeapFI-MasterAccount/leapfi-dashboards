/**
 * OnSide · Regulatory feed — "Ask OnSide" context-scoped chat entry point
 * (design_system_spec.md §2.9/§5.8, amendment A16 / PI2-D42).
 *
 * Exercises the falsifiable acceptance criteria this screen is responsible
 * for: AC-A16-1 (singleton Drawer, by construction), AC-A16-2 (same-screen
 * content swap reuses the existing RPT-05 mechanism, no second Drawer),
 * AC-A16-5 (scoping indicator + initial focus), AC-A16-8 (fresh-open
 * reseed), AC-A16-11 (uniform entry-affordance label).
 */
import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnSideFeed } from '../../screens/OnSideFeed';

function renderFeed() {
  return render(<OnSideFeed />);
}

describe('OnSide · Regulatory feed — "Ask OnSide" entry affordance (§2.9.5, AC-A16-11)', () => {
  it('renders a secondary-weight, icon-less "Ask OnSide" Button in the utility corner', () => {
    renderFeed();
    const trigger = screen.getByRole('button', { name: 'Ask OnSide' });
    // Amendment A20 (PI2-D47, design_system_spec.md §2.9.12): the entry-affordance trigger's weight flips ghost -> secondary on all six remaining onside.*/studio.* screens ("the CTA is crap" -> a real border/hover fill), never primary (Core Principle 2 -- never competes with a screen's own primary CTA).
    expect(trigger).toHaveAttribute('data-variant', 'secondary');
  });

  it('opens the screen\'s own local Drawer to "OnSide chat" with focus on the heading (AC-A16-5), never a second Drawer (AC-A16-1)', async () => {
    const user = userEvent.setup();
    renderFeed();
    await user.click(screen.getByRole('button', { name: 'Ask OnSide' }));
    const heading = await screen.findByRole('heading', { name: 'OnSide chat' });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(document.querySelectorAll('[data-lf-composite="drawer"]')).toHaveLength(1);
  });
});

describe('OnSide · Regulatory feed — same-screen content swap (§2.9.1 item 2, AC-A16-2)', () => {
  it('opening a signal row while the chat is open swaps title+children in the SAME Drawer — never a second one', async () => {
    const user = userEvent.setup();
    renderFeed();
    await user.click(screen.getByRole('button', { name: 'Ask OnSide' }));
    await screen.findByRole('heading', { name: 'OnSide chat' });

    const reviewButtons = screen.getAllByRole('button', { name: 'Review' });
    await user.click(reviewButtons[0]!);

    // Same Drawer element, swapped content — never two.
    expect(document.querySelectorAll('[data-lf-composite="drawer"]')).toHaveLength(1);
    expect(screen.queryByRole('heading', { name: 'OnSide chat' })).not.toBeInTheDocument();
    const signalHeading = document.querySelector('[data-lf-composite="drawer"] h2');
    expect(signalHeading?.textContent).toMatch(/^Signal —/);
  });
});

describe('OnSide · Regulatory feed — fresh-open reseed (§2.9.5, AC-A16-8)', () => {
  it('closing and reopening the chat always renders the idle greeting — never a carried-forward transcript', async () => {
    const user = userEvent.setup();
    renderFeed();

    await user.click(screen.getByRole('button', { name: 'Ask OnSide' }));
    await screen.findByRole('heading', { name: 'OnSide chat' });
    await user.type(screen.getByLabelText('Ask OnSide a question'), 'a totally unscripted question');
    await user.click(screen.getByRole('button', { name: 'Ask' }));
    expect(await screen.findByText('No matching OnSide answer for that yet.')).toBeInTheDocument();

    // Close (Escape) and reopen.
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Ask OnSide' }));
    await screen.findByRole('heading', { name: 'OnSide chat' });

    expect(screen.queryByText('a totally unscripted question')).not.toBeInTheDocument();
    expect(screen.queryByText('No matching OnSide answer for that yet.')).not.toBeInTheDocument();
    expect(screen.getByText('Ask me about anything in your regulatory feed, obligations, or documents.')).toBeInTheDocument();
  });
});
