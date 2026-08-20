/**
 * Studio · Roadmap — "Ask Studio" context-scoped chat entry point
 * (design_system_spec.md §2.9/§5.8, amendment A16 / PI2-D42).
 *
 * `Roadmap.tsx` gains its FIRST local Drawer instance (§2.9.1 item 4,
 * AC-A16-4): play chips still fire the existing cross-screen `onDeepLink`
 * into Investment Design's own Drawer, unchanged.
 */
import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Roadmap } from '../../screens/Roadmap';

describe('Studio · Roadmap — "Ask Studio" entry affordance (AC-A16-4)', () => {
  it('renders a ghost "Ask Studio" Button and opens this screen\'s first local Drawer to "Studio chat"', async () => {
    const user = userEvent.setup();
    render(<Roadmap onNavigate={() => {}} />);
    const trigger = screen.getByRole('button', { name: 'Ask Studio' });
    expect(trigger).toHaveAttribute('data-variant', 'ghost');
    await user.click(trigger);
    const heading = await screen.findByRole('heading', { name: 'Studio chat' });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(document.querySelectorAll('[data-lf-composite="drawer"]')).toHaveLength(1);
  });
});
