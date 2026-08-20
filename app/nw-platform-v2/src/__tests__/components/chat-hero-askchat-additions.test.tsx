/**
 * ChatHero (C10) — three backward-compatible additions for the context-scoped
 * Ask chat (design_system_spec.md §2.9.3, amendment A16 / PI2-D42):
 *   1. `inputLabel?`/`inputPlaceholder?`, defaulting to today's literals.
 *   2. The counters row renders CONDITIONALLY — omitted entirely (not just
 *      empty) when `counters` is `[]` (AC-A16-6).
 *   3. `ChatMessage.deepLinks?` — rendered as keyboard-operable inline
 *      navigating links beneath the message bubble (AC-A16-10), firing a new
 *      `onDeepLinkPress` prop with the raw `DeepLinkRequest`.
 *
 * Also proves AC-A16-7 (backward compatibility): `StudioAsk.tsx`'s own call
 * shape (non-empty counters, no `inputLabel`/`inputPlaceholder`/`deepLinks`)
 * renders the exact pre-A16 literals.
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatHero } from '../../components/ChatHero';
import type { ChatCounter, ChatMessage } from '../../components/ChatHero';

const COUNTERS: ChatCounter[] = [{ value: 412, label: 'Monitored docs' }];

function renderHero(overrides: Partial<React.ComponentProps<typeof ChatHero>> = {}) {
  return render(
    <ChatHero
      counters={[]}
      messages={[]}
      suggestions={[]}
      inputValue=""
      onInputChange={() => {}}
      onAsk={() => {}}
      state="idle"
      {...overrides}
    />,
  );
}

describe('ChatHero — counters row conditional render (AC-A16-6)', () => {
  it('renders no [role="group"] counters wrapper at all when counters is empty', () => {
    renderHero({ counters: [] });
    expect(document.querySelector('[aria-label="Studio · Ask coverage"]')).toBeNull();
  });

  it('still renders the counters group, unchanged, when counters is non-empty (AC-A16-7 backward compat)', () => {
    renderHero({ counters: COUNTERS });
    expect(document.querySelector('[aria-label="Studio · Ask coverage"]')).not.toBeNull();
  });
});

describe('ChatHero — inputLabel/inputPlaceholder additions (§2.9.3 item 1)', () => {
  it('defaults to the pre-A16 literals when omitted (AC-A16-7 backward compat)', () => {
    renderHero();
    expect(screen.getByLabelText('Ask a policy question')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask about a policy, procedure, or obligation…')).toBeInTheDocument();
  });

  it('uses the supplied inputLabel/inputPlaceholder when provided', () => {
    renderHero({ inputLabel: 'Ask OnSide a question', inputPlaceholder: 'Ask about a regulatory item…' });
    expect(screen.getByLabelText('Ask OnSide a question')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask about a regulatory item…')).toBeInTheDocument();
  });
});

describe('ChatHero — ChatMessage.deepLinks rendering (§2.9.3 item 3, AC-A16-10)', () => {
  it('renders each deep link as a keyboard-operable <button type="button">, never an <a>', () => {
    const messages: ChatMessage[] = [
      {
        id: 'a1',
        role: 'assistant',
        text: 'Here is the answer.',
        deepLinks: [{ label: 'See MRM-09 in Ownership', request: { screen: 'onside.ownership', kind: 'document', id: 'mrm-09' } }],
      },
    ];
    renderHero({ messages, state: 'answer-complete' });
    const link = screen.getByRole('button', { name: /See MRM-09 in Ownership/ });
    expect(link.tagName).toBe('BUTTON');
    expect(link).toHaveAttribute('type', 'button');
    expect(document.querySelector('a')).toBeNull();
  });

  it('fires onDeepLinkPress with the exact request when pressed', async () => {
    const user = userEvent.setup();
    const onDeepLinkPress = vi.fn();
    const request = { screen: 'onside.ownership' as const, kind: 'document' as const, id: 'mrm-09' };
    const messages: ChatMessage[] = [
      { id: 'a1', role: 'assistant', text: 'Here is the answer.', deepLinks: [{ label: 'See MRM-09 in Ownership', request }] },
    ];
    renderHero({ messages, state: 'answer-complete', onDeepLinkPress });
    await user.click(screen.getByRole('button', { name: /See MRM-09 in Ownership/ }));
    expect(onDeepLinkPress).toHaveBeenCalledWith(request);
  });

  it('renders no deep-link row when a message omits deepLinks (backward compatible)', () => {
    const messages: ChatMessage[] = [{ id: 'a1', role: 'assistant', text: 'Plain answer, no links.' }];
    renderHero({ messages, state: 'answer-complete' });
    expect(screen.queryByRole('button', { name: /See/ })).toBeNull();
  });
});
