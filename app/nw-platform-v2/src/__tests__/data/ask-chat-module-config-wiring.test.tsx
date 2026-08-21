/**
 * Ask chat — module config wiring to Marisol's scripted content
 * (design_system_spec.md §2.9.4, amendment A16 / PI2-D42; hostile-review
 * finding, PI2-D42 verifier: `data/askChatModuleConfig.ts` shipped with
 * `entries: []` in both records and Marisol's `data/askChat.ts` imported
 * nowhere — the chat rendered a generic greeting, zero suggestion chips,
 * and no scripted answers at runtime; a dead-click class defect).
 *
 * These tests prove the wiring end to end, at the real production call
 * sites (screen components, the real `AskChatPanel`, the real `ChatHero`),
 * never a hand-rolled fixture standing in for Marisol's content — that
 * fixture already exists and stays in `ask-chat-panel.test.tsx`, which
 * tests `AskChatPanel`'s own generic behavior against a small inline
 * config, not this integration seam.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ONSIDE_CHAT_MODULE_CONFIG, STUDIO_CHAT_MODULE_CONFIG } from '../../data/askChatModuleConfig';
import { ONSIDE_CHAT, STUDIO_CHAT } from '../../data/askChat';
import { OnSideFeed } from '../../screens/OnSideFeed';
import { OnSideOverview } from '../../screens/OnSideOverview';
import { StudioAsk } from '../../screens/StudioAsk';
import { resetDemo } from '../../state/demoStore';

/**
 * Open the given module's chat trigger and wait for the Drawer's own
 * focus-shift effect to settle (mirrors `overview-ask-chat.test.tsx`'s
 * established pattern) before returning the dialog element — the Drawer
 * moves focus to its heading asynchronously, and interacting with the
 * input before that settles is a race that intermittently steals focus
 * mid-`user.type`.
 */
async function openChat(user: ReturnType<typeof userEvent.setup>, triggerName: string, dialogName: string) {
  await user.click(screen.getByRole('button', { name: triggerName }));
  const heading = await screen.findByRole('heading', { name: dialogName });
  await waitFor(() => expect(heading).toHaveFocus());
  return screen.getByRole('dialog', { name: dialogName });
}

/**
 * Amendment A20 (PI2-D47, design_system_spec.md Section 2.9.8): `StudioAsk.tsx`
 * no longer opens a Drawer for its scripted content — the screen ITSELF is
 * the agent chat (chat bar at the top, driving the response canvas). This
 * drives the SAME `handleAsk`/ASK_SUBMIT_DELAY_MS(350)/
 * ASK_RENDER_DELAY_MS(450) real-timer flow `studio-ask-a20-agent-canvas.
 * test.tsx` exercises, so this helper uses fake timers like that suite.
 */
function askOnStudioAsk(question: string) {
  const main = within(screen.getByRole('main'));
  const input = main.getByRole('textbox', { name: STUDIO_CHAT_MODULE_CONFIG.inputLabel });
  fireEvent.change(input, { target: { value: question } });
  fireEvent.click(main.getByRole('button', { name: 'Ask' }));
  act(() => {
    vi.advanceTimersByTime(350);
  });
  act(() => {
    vi.advanceTimersByTime(450);
  });
}

describe('askChatModuleConfig — entries sourced from data/askChat.ts by import, not copied', () => {
  it('ONSIDE_CHAT_MODULE_CONFIG.entries is the SAME array reference as ONSIDE_CHAT.entries', () => {
    expect(ONSIDE_CHAT_MODULE_CONFIG.entries).toBe(ONSIDE_CHAT.entries);
    expect(ONSIDE_CHAT_MODULE_CONFIG.entries.length).toBeGreaterThan(0);
  });

  it('STUDIO_CHAT_MODULE_CONFIG.entries is the SAME array reference as STUDIO_CHAT.entries', () => {
    expect(STUDIO_CHAT_MODULE_CONFIG.entries).toBe(STUDIO_CHAT.entries);
    expect(STUDIO_CHAT_MODULE_CONFIG.entries.length).toBeGreaterThan(0);
  });
});

describe('Ask OnSide — real suggestion chips render (regression: was zero chips, entries: [])', () => {
  it('opening "Ask OnSide" from Regulatory feed shows every ONSIDE_CHAT.entries question as a suggestion Chip', async () => {
    const user = userEvent.setup();
    render(<OnSideFeed />);
    const dialog = await openChat(user, 'Ask OnSide', 'OnSide chat');
    for (const entry of ONSIDE_CHAT.entries) {
      expect(within(dialog).getByText(entry.question)).toBeInTheDocument();
    }
  });
});

describe('Ask Studio (amendment A20) — real suggestion chips render on StudioAsk\'s own chat bar (regression: was zero chips, entries: [])', () => {
  it('StudioAsk\'s top chat bar shows every STUDIO_CHAT.entries question as a suggestion Chip, with no Drawer/trigger needed — the screen itself is the chat (Section 2.9.8)', () => {
    render(<StudioAsk onNavigate={() => {}} />);
    const main = within(screen.getByRole('main'));
    for (const entry of STUDIO_CHAT.entries) {
      expect(main.getByText(entry.question)).toBeInTheDocument();
    }
  });
});

describe('Ask OnSide — selecting a real scripted question renders its real responseText', () => {
  it('typing the exact question and pressing Ask renders the scripted answer (regression: was always defaultNoMatchMessage, entries: [])', async () => {
    const user = userEvent.setup();
    const entry = ONSIDE_CHAT.entries.find((e) => e.id === 'onside-mrm-09-close')!;
    render(<OnSideFeed />);
    const dialog = await openChat(user, 'Ask OnSide', 'OnSide chat');
    await user.type(within(dialog).getByLabelText(ONSIDE_CHAT_MODULE_CONFIG.inputLabel), entry.question);
    await user.click(within(dialog).getByRole('button', { name: 'Ask' }));
    expect(await within(dialog).findByText(entry.responseText)).toBeInTheDocument();
    expect(within(dialog).queryByText(ONSIDE_CHAT_MODULE_CONFIG.defaultNoMatchMessage)).not.toBeInTheDocument();
  });
});

describe('Ask Studio (amendment A20) — selecting a real scripted question renders its real responseText on the response canvas', () => {
  beforeEach(() => {
    resetDemo();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('typing the exact question and pressing Ask renders the scripted answer (regression: was always defaultNoMatchMessage, entries: [])', () => {
    const entry = STUDIO_CHAT.entries.find((e) => e.id === 'studio-blocker-underwriting-assist')!;
    render(<StudioAsk onNavigate={() => {}} />);
    askOnStudioAsk(entry.question);
    expect(screen.getByText(entry.responseText)).toBeInTheDocument();
    expect(screen.queryByText(STUDIO_CHAT_MODULE_CONFIG.defaultNoMatchMessage)).not.toBeInTheDocument();
  });
});

describe('Ask OnSide — a scripted deep link fires the existing DeepLinkRequest path end to end', () => {
  it('selecting the cross-screen deep link on a real OnSide answer calls onDeepLink with the exact request payload authored in data/askChat.ts', async () => {
    const user = userEvent.setup();
    const onDeepLink = vi.fn();
    const entry = ONSIDE_CHAT.entries.find((e) => e.id === 'onside-mrm-09-close')!;
    const caseLink = entry.deepLinks!.find((l) => l.request.kind === 'case')!;
    render(<OnSideOverview onNavigate={() => {}} onDeepLink={onDeepLink} />);
    const dialog = await openChat(user, 'Ask OnSide', 'OnSide chat');
    await user.type(within(dialog).getByLabelText(ONSIDE_CHAT_MODULE_CONFIG.inputLabel), entry.question);
    await user.click(within(dialog).getByRole('button', { name: 'Ask' }));
    const link = await within(dialog).findByRole('button', { name: new RegExp(caseLink.label) });
    await user.click(link);
    expect(onDeepLink).toHaveBeenCalledTimes(1);
    expect(onDeepLink).toHaveBeenCalledWith(caseLink.request);
  });
});

describe('Ask Studio (amendment A20) — a scripted deep link fires the existing DeepLinkRequest path end to end, from the response canvas\'s own Artifacts list', () => {
  beforeEach(() => {
    resetDemo();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('selecting the Artifacts link on a real Studio answer calls onDeepLink with the exact request payload authored in data/askChat.ts', () => {
    const onDeepLink = vi.fn();
    const entry = STUDIO_CHAT.entries.find((e) => e.id === 'studio-blocker-underwriting-assist')!;
    const playLink = entry.deepLinks![0]!;
    render(<StudioAsk onNavigate={() => {}} onDeepLink={onDeepLink} />);
    askOnStudioAsk(entry.question);
    const link = screen.getByRole('button', { name: new RegExp(playLink.label) });
    fireEvent.click(link);
    expect(onDeepLink).toHaveBeenCalledTimes(1);
    expect(onDeepLink).toHaveBeenCalledWith(playLink.request);
  });

  it('selecting the "See in OnSide" action on a real compliance-attainment answer calls onDeepLink with the exact request payload authored in data/askChat.ts, labeled with the entry\'s own authored deepLink label (Section 2.9.9(d))', () => {
    const onDeepLink = vi.fn();
    const entry = STUDIO_CHAT.entries.find((e) => e.id === 'studio-fairlend-attainment')!;
    const domainLink = entry.deepLinks![0]!;
    render(<StudioAsk onNavigate={() => {}} onDeepLink={onDeepLink} />);
    askOnStudioAsk(entry.question);
    const link = screen.getByRole('button', { name: new RegExp(domainLink.label) });
    fireEvent.click(link);
    expect(onDeepLink).toHaveBeenCalledTimes(1);
    expect(onDeepLink).toHaveBeenCalledWith(domainLink.request);
  });
});

describe('Context scoping — OnSide content and Studio content never cross into the other module\'s chat', () => {
  it('the two entry sets share no id and no question text (data-level scoping)', () => {
    const onsideIds = new Set(ONSIDE_CHAT_MODULE_CONFIG.entries.map((e) => e.id));
    const onsideQuestions = new Set(ONSIDE_CHAT_MODULE_CONFIG.entries.map((e) => e.question));
    for (const entry of STUDIO_CHAT_MODULE_CONFIG.entries) {
      expect(onsideIds.has(entry.id)).toBe(false);
      expect(onsideQuestions.has(entry.question)).toBe(false);
    }
  });

  it('no Studio question is reachable from the rendered "Ask OnSide" chat', async () => {
    const user = userEvent.setup();
    render(<OnSideFeed />);
    const dialog = await openChat(user, 'Ask OnSide', 'OnSide chat');
    for (const entry of STUDIO_CHAT.entries) {
      expect(within(dialog).queryByText(entry.question)).not.toBeInTheDocument();
    }
  });

  it('no OnSide question is reachable from StudioAsk\'s own chat bar (amendment A20 — the screen itself is the chat, no Drawer)', () => {
    render(<StudioAsk onNavigate={() => {}} />);
    const main = within(screen.getByRole('main'));
    for (const entry of ONSIDE_CHAT.entries) {
      expect(main.queryByText(entry.question)).not.toBeInTheDocument();
    }
  });
});
