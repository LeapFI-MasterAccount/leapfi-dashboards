/**
 * AskChatPanel — the generic, `ChatModuleConfig`-driven consumer of the
 * context-scoped Ask chat schema (design_system_spec.md §2.9, amendment A16
 * / PI2-D42). One component, mounted identically by every `onside.*`/
 * `studio.*` screen's local Drawer (§2.9.1) — never a new architecture,
 * one more content payload inside the same, already-ratified single-Drawer
 * mechanism.
 *
 * FRESH-OPEN RESEED (§2.9.5, AC-A16-8): this component seeds its own
 * `messages`/`inputValue`/`state` ONLY at mount — it has no "reopen"
 * lifecycle of its own (matches ChatHero's own "no memory of its own"
 * documentation). Reseeding on every open (including a same-screen re-open
 * with no navigation in between) is therefore the HOST SCREEN's
 * responsibility: mount this component with a `key` that changes every time
 * the utility-corner trigger is pressed (the same remount-for-a-fresh-
 * conversation technique this codebase already uses for
 * `ChatIntakeWizard`, keyed by `useCaseName`).
 *
 * MATCHING CONTRACT (§2.9.4) — deliberately narrower than `StudioAsk.tsx`'s
 * own `cpMatch` word-overlap engine (out of this amendment's scope, PI2-D12
 * "no generation machinery" precedent restated): exact, case-insensitive,
 * trimmed match on `ChatEntry.question` only. A match renders that entry's
 * `responseText` (+ `deepLinks`, if any) as the next assistant message; any
 * other submission renders `config.defaultNoMatchMessage` via ChatHero's
 * OWN existing `no-match` state (unmodified) — never a fabricated partial
 * match.
 *
 * NO COUNTERS (§5.8's own anatomy line — "message list, input, suggestion
 * chips, scoping indicator — no counters"): always passes `counters={[]}`,
 * which is what makes ChatHero's §2.9.3 item 2 conditional-render fix
 * actually matter here (an OnSide-scoped chat must never announce the
 * hardcoded "Studio · Ask coverage" label).
 *
 * DEEP-LINK WIRING (§2.9.4 "Deep-link consumption — the existing contract,
 * unchanged"): `onDeepLinkPress` is threaded straight from this component's
 * own prop through to `ChatHero`'s new `onDeepLinkPress` — the caller
 * (each host screen) is expected to pass its own `onDeepLink` handler
 * (`DeepLinkScreenProps`, `App.tsx`) verbatim. That single existing
 * App-level contract already resolves both cases the ruling names with no
 * new machinery: a request whose `screen` matches the currently-mounted
 * screen re-delivers through that screen's own existing `deepLink`-prop
 * nonce-keyed consumer effect (content-swapping the SAME Drawer, RPT-05);
 * a request whose `screen` differs unmounts the current screen (chat
 * included) and lands on the target screen's own existing consumer. This
 * component makes no same-screen-vs-cross-screen distinction itself — it
 * does not need to.
 */
import { useRef, useState } from 'react';
import { ChatHero } from './ChatHero';
import type { ChatHeroState, ChatMessage } from './ChatHero';
import type { ChatModuleConfig } from '../data/chatTypes';
import type { DeepLinkRequest } from '../App';

export interface AskChatPanelProps {
  config: ChatModuleConfig;
  /** Threaded straight to `ChatHero`'s `onDeepLinkPress` — see file header
   * "DEEP-LINK WIRING." Callers pass their own `onDeepLink` handler. */
  onDeepLinkPress?: (request: DeepLinkRequest) => void;
}

export function AskChatPanel({ config, onDeepLinkPress }: AskChatPanelProps) {
  // Fresh-open seed: greeting only, at mount (see file header "FRESH-OPEN
  // RESEED" — a later open reseeds via the host screen's own remount key,
  // not via anything in this component's own lifecycle).
  const [messages, setMessages] = useState<ChatMessage[]>(() => [{ id: 'greeting', role: 'assistant', text: config.greeting }]);
  const [inputValue, setInputValue] = useState('');
  const [chatState, setChatState] = useState<ChatHeroState>('idle');
  const msgSeqRef = useRef(0);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setChatState(value.trim().length > 0 ? 'typing' : 'idle');
  };

  const handleAsk = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length === 0) return;

    msgSeqRef.current += 1;
    const userMessage: ChatMessage = { id: `u-${msgSeqRef.current}`, role: 'user', text: trimmed };

    // §2.9.4 matching contract — exact, case-insensitive, trimmed; the ONE
    // field (`question`) doubles as both the Chip's fill text and this
    // match key, so a Chip can never fill text that fails to match its own
    // entry.
    const normalized = trimmed.toLowerCase();
    const match = config.entries.find((entry) => entry.question.trim().toLowerCase() === normalized);

    if (match) {
      msgSeqRef.current += 1;
      const assistantMessage: ChatMessage = {
        id: `a-${msgSeqRef.current}`,
        role: 'assistant',
        text: match.responseText,
        ...(match.deepLinks && match.deepLinks.length > 0 ? { deepLinks: match.deepLinks } : {}),
      };
      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setChatState('answer-complete');
    } else {
      // No assistant message appended — ChatHero's own existing `no-match`
      // state renders `config.defaultNoMatchMessage` (its `noMatchMessage`
      // prop) directly; nothing fabricated here.
      setMessages((prev) => [...prev, userMessage]);
      setChatState('no-match');
    }
    setInputValue('');
  };

  return (
    <ChatHero
      counters={[]}
      messages={messages}
      suggestions={config.entries.map((entry) => entry.question)}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onAsk={handleAsk}
      state={chatState}
      inputLabel={config.inputLabel}
      inputPlaceholder={config.inputPlaceholder}
      noMatchMessage={config.defaultNoMatchMessage}
      {...(onDeepLinkPress ? { onDeepLinkPress } : {})}
    />
  );
}
