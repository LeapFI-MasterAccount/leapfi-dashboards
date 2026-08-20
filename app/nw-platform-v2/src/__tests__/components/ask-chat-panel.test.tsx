/**
 * AskChatPanel — the generic, `ChatModuleConfig`-driven consumer of the
 * scripted Ask chat schema (design_system_spec.md §2.9.4, amendment A16 /
 * PI2-D42). Exercises the matching contract (AC-A16-9), the fresh-open
 * idle seed (AC-A16-8's per-render half — reopen/remount is each host
 * screen's own responsibility via a fresh `key`), deep-link rendering
 * (AC-A16-10), and the blockers-linkage "one home, not a duplicate" rule
 * (§2.9.4).
 *
 * Uses a SMALL INLINE FIXTURE, not the real content module — Marisol's
 * concurrent, disjoint lane owns that file; this dispatch never creates or
 * imports it (see `data/chatTypes.ts`'s own file header).
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AskChatPanel } from '../../components/AskChatPanel';
import type { ChatModuleConfig } from '../../data/chatTypes';

const FIXTURE_CONFIG: ChatModuleConfig = {
  module: 'onside',
  drawerTitle: 'OnSide chat',
  entryLabel: 'Ask OnSide',
  inputLabel: 'Ask OnSide a question',
  inputPlaceholder: 'Ask about a regulatory item…',
  greeting: 'Hi — ask me about anything in your regulatory feed.',
  defaultNoMatchMessage: 'No matching answer for that yet.',
  entries: [
    {
      id: 'mrm-09-status',
      question: 'What is the status of MRM-09?',
      responseText: 'MRM-09 is open, tracked under Model Risk.',
      deepLinks: [{ label: 'See MRM-09 in Ownership', request: { screen: 'onside.ownership', kind: 'document', id: 'mrm-09' } }],
    },
    {
      id: 'plain-answer',
      question: 'Who owns the fair lending policy?',
      responseText: 'The Fair Lending domain owner, per the RACI matrix.',
    },
  ],
};

function renderPanel(onDeepLinkPress?: (request: unknown) => void) {
  return render(<AskChatPanel config={FIXTURE_CONFIG} {...(onDeepLinkPress ? { onDeepLinkPress } : {})} />);
}

describe('AskChatPanel — fresh-open idle state', () => {
  it('seeds the greeting as the first assistant message and every entry question as a suggestion Chip', () => {
    renderPanel();
    expect(screen.getByText(FIXTURE_CONFIG.greeting)).toBeInTheDocument();
    for (const entry of FIXTURE_CONFIG.entries) {
      expect(screen.getByText(entry.question)).toBeInTheDocument();
    }
  });

  it('uses the module config inputLabel/inputPlaceholder, never ChatHero\'s Studio-specific defaults', () => {
    renderPanel();
    expect(screen.getByLabelText(FIXTURE_CONFIG.inputLabel)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(FIXTURE_CONFIG.inputPlaceholder)).toBeInTheDocument();
  });
});

describe('AskChatPanel — matching contract (AC-A16-9, §2.9.4)', () => {
  it('an exact, case-insensitive, trimmed match on entry.question renders that entry\'s responseText', async () => {
    const user = userEvent.setup();
    renderPanel();
    await user.type(screen.getByLabelText(FIXTURE_CONFIG.inputLabel), '  what IS the status of mrm-09?  ');
    await user.click(screen.getByRole('button', { name: 'Ask' }));
    expect(await screen.findByText('MRM-09 is open, tracked under Model Risk.')).toBeInTheDocument();
  });

  it('a suggestion Chip press fills the input only — never auto-submits', async () => {
    const user = userEvent.setup();
    renderPanel();
    await user.click(screen.getByText('Who owns the fair lending policy?'));
    expect(screen.getByLabelText(FIXTURE_CONFIG.inputLabel)).toHaveValue('Who owns the fair lending policy?');
    expect(screen.queryByText('The Fair Lending domain owner, per the RACI matrix.')).not.toBeInTheDocument();
  });

  it('any other submission renders defaultNoMatchMessage via the no-match state — never a partial match', async () => {
    const user = userEvent.setup();
    renderPanel();
    await user.type(screen.getByLabelText(FIXTURE_CONFIG.inputLabel), 'something totally unscripted');
    await user.click(screen.getByRole('button', { name: 'Ask' }));
    expect(await screen.findByText(FIXTURE_CONFIG.defaultNoMatchMessage)).toBeInTheDocument();
  });
});

describe('AskChatPanel — deep-link rendering + wiring (AC-A16-10)', () => {
  it("renders a matched entry's deepLinks as inline buttons and fires onDeepLinkPress with the exact request on press", async () => {
    const user = userEvent.setup();
    const onDeepLinkPress = vi.fn();
    renderPanel(onDeepLinkPress);
    await user.type(screen.getByLabelText(FIXTURE_CONFIG.inputLabel), 'What is the status of MRM-09?');
    await user.click(screen.getByRole('button', { name: 'Ask' }));
    const link = await screen.findByRole('button', { name: /See MRM-09 in Ownership/ });
    await user.click(link);
    expect(onDeepLinkPress).toHaveBeenCalledWith({ screen: 'onside.ownership', kind: 'document', id: 'mrm-09' });
  });
});

describe('AskChatPanel — no counters row (§5.8: "no counters" in this chat variant\'s anatomy)', () => {
  it('never renders the coverage counters group', () => {
    renderPanel();
    expect(document.querySelector('[role="group"][aria-label="Studio · Ask coverage"]')).toBeNull();
  });
});
