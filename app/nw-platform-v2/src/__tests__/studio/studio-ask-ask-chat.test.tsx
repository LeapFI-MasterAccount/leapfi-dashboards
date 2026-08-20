/**
 * Studio · Ask — "Ask Studio" context-scoped chat entry point
 * (design_system_spec.md §2.9/§5.8, amendment A16 / PI2-D42).
 *
 * `StudioAsk.tsx` gains its FIRST local Drawer instance (§2.9.1 item 4,
 * AC-A16-4): its own existing register-row "Detail →" deep link to
 * Investment Design stays a cross-screen `onDeepLink` call, never a local
 * Drawer open on this screen itself.
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StudioAsk } from '../../screens/StudioAsk';

describe('Studio · Ask — "Ask Studio" entry affordance (AC-A16-4)', () => {
  it('renders a ghost "Ask Studio" Button, coexisting with the screen\'s own primary "Ask" Button', async () => {
    const user = userEvent.setup();
    render(<StudioAsk onNavigate={() => {}} />);
    const trigger = screen.getByRole('button', { name: 'Ask Studio' });
    expect(trigger).toHaveAttribute('data-variant', 'ghost');
    expect(screen.getByRole('button', { name: 'Ask' })).toHaveAttribute('data-variant', 'primary');

    await user.click(trigger);
    const heading = await screen.findByRole('heading', { name: 'Studio chat' });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(document.querySelectorAll('[data-lf-composite="drawer"]')).toHaveLength(1);
  });

  it("this screen's existing register-row deep link still fires the cross-screen onDeepLink contract, never opens a local Drawer here", async () => {
    const onDeepLink = vi.fn();
    render(<StudioAsk onNavigate={() => {}} onDeepLink={onDeepLink} />);
    const detailButtons = screen.getAllByRole('button', { name: 'Detail →' });
    await userEvent.setup().click(detailButtons[0]!);
    expect(onDeepLink).toHaveBeenCalledWith(expect.objectContaining({ screen: 'studio.investment-design', kind: 'play' }));
    // No local Drawer opened by this press.
    expect(document.querySelectorAll('[data-lf-composite="drawer"]')).toHaveLength(0);
  });
});
