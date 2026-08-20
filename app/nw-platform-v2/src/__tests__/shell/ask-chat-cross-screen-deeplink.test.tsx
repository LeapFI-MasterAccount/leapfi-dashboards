/**
 * Context-scoped Ask chat — cross-screen deep-link unmount (design_system_
 * spec.md §2.9.1 item 3 / §2.9.4, amendment A16 / PI2-D42, AC-A16-3).
 *
 * "Case side-car" — the dispatch's own named example: a chat message's
 * `deepLinks` entry whose `screen` targets a DIFFERENT screen from the one
 * the chat is currently open on fires the existing cross-screen `onDeepLink`
 * contract unchanged (App.tsx's `handleDeepLink`) — the current screen (chat
 * included) unmounts, and the target screen mounts, never simultaneously.
 *
 * Mounts the REAL `App` shell (not a probe) so this exercises the actual
 * production wiring end to end: `OnSideFeed`'s "Ask OnSide" trigger → the
 * real `AskChatPanel` → a scripted answer's deep link → the real `onDeepLink`
 * App.tsx already threads to every screen. The module-fixed chrome config
 * (`data/askChatModuleConfig.ts`) is mocked ONLY to inject one small,
 * disjoint fixture entry with a cross-screen deep link — this test does not
 * touch or duplicate Marisol's real content file.
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../data/askChatModuleConfig', async () => {
  const actual = await vi.importActual<typeof import('../../data/askChatModuleConfig')>('../../data/askChatModuleConfig');
  return {
    ...actual,
    ONSIDE_CHAT_MODULE_CONFIG: {
      ...actual.ONSIDE_CHAT_MODULE_CONFIG,
      entries: [
        {
          id: 'fixture-case-sidecar',
          question: 'Is there an open case for this?',
          responseText: 'Yes — see the open case.',
          deepLinks: [{ label: 'Open the case', request: { screen: 'cases', kind: 'case', id: 'CASE-DOES-NOT-EXIST' } }],
        },
      ],
    },
  };
});

// eslint-disable-next-line import/first -- mock must be hoisted before the App import per vitest's own documented pattern
import App from '../../App';

describe('Ask chat — case side-car cross-screen deep link (AC-A16-3)', () => {
  it('unmounts the current screen (chat included) and lands on the target screen — never simultaneously', async () => {
    const user = userEvent.setup();
    render(<App />);

    const nav = screen.getByRole('navigation', { name: 'Primary' });
    await user.click(within(nav).getByRole('button', { name: 'Regulatory feed' }));
    await screen.findByRole('heading', { name: 'Regulatory feed', level: 1 });

    await user.click(screen.getByRole('button', { name: 'Ask OnSide' }));
    await screen.findByRole('heading', { name: 'OnSide chat' });
    expect(document.querySelectorAll('[data-lf-composite="drawer"]')).toHaveLength(1);

    await user.type(screen.getByLabelText('Ask OnSide a question'), 'Is there an open case for this?');
    await user.click(screen.getByRole('button', { name: 'Ask' }));
    const link = await screen.findByRole('button', { name: /Open the case/ });
    await user.click(link);

    // Target screen mounted; the OnSide chat's Drawer is gone with it —
    // at no point were both simultaneously present.
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Cases', level: 1 })).toBeInTheDocument());
    expect(screen.queryByRole('heading', { name: 'OnSide chat' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ask OnSide' })).not.toBeInTheDocument();
  });
});
