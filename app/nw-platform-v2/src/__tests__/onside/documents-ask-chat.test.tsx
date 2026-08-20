/**
 * OnSide · Documents — "Ask OnSide" context-scoped chat entry point
 * (design_system_spec.md §2.9/§5.8, amendment A16 / PI2-D42).
 *
 * This is the ruling's own named "document view" example (§2.9.1 item 2):
 * "a user with the OnSide chat open on OnSideDocuments.tsx who then opens a
 * redline detail row triggers exactly this swap — chat content out, document
 * content in, same Drawer, same RPT-05 handoff."
 */
import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnSideDocuments } from '../../screens/OnSideDocuments';

function renderDocs() {
  return render(<OnSideDocuments />);
}

describe('OnSide · Documents — "Ask OnSide" entry affordance (AC-A16-11)', () => {
  it('renders a ghost "Ask OnSide" Button and opens the local Drawer to "OnSide chat" (AC-A16-5), one Drawer only (AC-A16-1)', async () => {
    const user = userEvent.setup();
    renderDocs();
    const trigger = screen.getByRole('button', { name: 'Ask OnSide' });
    expect(trigger).toHaveAttribute('data-variant', 'ghost');
    await user.click(trigger);
    const heading = await screen.findByRole('heading', { name: 'OnSide chat' });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(document.querySelectorAll('[data-lf-composite="drawer"]')).toHaveLength(1);
  });
});

describe('OnSide · Documents — "document view" same-screen swap (§2.9.1 item 2)', () => {
  it('opening a document row while the chat is open swaps title+children in the SAME Drawer', async () => {
    const user = userEvent.setup();
    renderDocs();
    await user.click(screen.getByRole('button', { name: 'Ask OnSide' }));
    await screen.findByRole('heading', { name: 'OnSide chat' });

    const table = screen.getByRole('table', { name: 'Document library' });
    const rows = within(table).getAllByRole('row');
    const firstDataRow = rows[1]!;
    const openButton = within(firstDataRow).getByRole('button', { name: /Review|View/ });
    await user.click(openButton);

    expect(document.querySelectorAll('[data-lf-composite="drawer"]')).toHaveLength(1);
    expect(screen.queryByRole('heading', { name: 'OnSide chat' })).not.toBeInTheDocument();
  });
});

describe('OnSide · Documents — fresh-open reseed (AC-A16-8)', () => {
  it('reopening after closing always shows the idle greeting, never a carried-forward transcript', async () => {
    const user = userEvent.setup();
    renderDocs();

    await user.click(screen.getByRole('button', { name: 'Ask OnSide' }));
    await screen.findByRole('heading', { name: 'OnSide chat' });
    await user.type(screen.getByLabelText('Ask OnSide a question'), 'an unscripted question');
    await user.click(screen.getByRole('button', { name: 'Ask' }));
    expect(await screen.findByText('No matching OnSide answer for that yet.')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Ask OnSide' }));
    await screen.findByRole('heading', { name: 'OnSide chat' });
    expect(screen.queryByText('an unscripted question')).not.toBeInTheDocument();
  });
});
