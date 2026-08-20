/**
 * ChatHero — Composite C10 (design_system_spec.md §2.2, screen anatomy §5.4)
 *
 * "StatCard row (counters) + message list (generic list) + Input +
 * Button (`primary`, "Ask") + Chip (`suggestion` ×N)." Composite states
 * (§2.2 C10): idle, typing, submitting (Button loading), answer-rendering,
 * answer-complete, no-match (§5.4 fallback state).
 *
 * SCOPE BOUNDARY (dispatch comp-studio-engines): this dispatch's engine
 * port is explicitly leapfi-platform.html lines 1214-1303 (the Studio ·
 * Investment Design planning engine — `computePlan`/`sortPool`/
 * `recompute`). Studio · Ask's own matching engine
 * (`COPILOT_QA`/`autoLoanAnswer`, survey_map.md 1785-1817, 3613-3647,
 * 4328-4491) is a different engine entirely, outside this dispatch's
 * cited line range and not ported here. ChatHero is therefore a fully
 * controlled/presentational composite: `state`, `messages`, and
 * `suggestions` all arrive as props from whatever screen/chat-controller
 * dispatch owns the matching engine — this component never fabricates
 * "submitting"/"answer-rendering"/"no-match" locally (Core Principle 3:
 * "no fabricated intermediate state").
 *
 * StatCard row (r13 A.1): the counters render via the real, shared
 * `StatCard` (C1, `components/StatCard.tsx`) — the mechanical drop-in the
 * component's own file header anticipated once that composite landed.
 * Each `ChatCounter` maps 1:1 onto `StatCardProps` (`label`/`value`/
 * `unit?`); no `onPress` is wired since neither the §5.4 region map nor
 * this screen's own props expose a navigation target for a counter tile.
 *
 * A11y (spec C10): "Answer region is a live region (`aria-live="polite"`)
 * so the rendered answer is announced as it completes." Matching the
 * Slider primitive's (P7) already-established restraint pattern in this
 * codebase ("committed-value announcement only… never per drag frame"),
 * the live region here is populated only once the answer is final
 * (`answer-complete` / `no-match`) — not during `answer-rendering` — so
 * assistive tech gets one coherent announcement instead of a stream of
 * partial-text interruptions; the spec's own wording ("announced as it
 * completes") is consistent with this reading. "Suggestion Chips fill
 * the Input only — they never auto-submit" (§5.4) is enforced directly:
 * a Chip's `onPress` only calls `onInputChange`, never `onAsk`.
 *
 * SCROLL-TO-LATEST (fix C-unbounded-growth-02; base anchors
 * leapfi-platform.html:4343 `$('chat-log').scrollTop=
 * $('chat-log').scrollHeight` inside addMsg — fired for EVERY appended
 * line — and 4348, botSay's re-scroll when the typing placeholder swaps
 * to the final answer; the bounded log is `#st-ask .chat-log
 * {max-height:420px;overflow-y:auto}`, source 435): the twin's bounded
 * message list (35rem max-height below) never moved its scroll position,
 * so once the conversation exceeded the bound every new message — the
 * answer included — rendered below the fold, invisible. Ported as an
 * effect that scrolls the newest list item into view whenever `messages`
 * or `state` changes (state covers the busy "Thinking…" bubble and the
 * no-match bubble, which append without a `messages` change), via
 * `scrollIntoView` — this codebase's established, jsdom-testable scroll
 * idiom (test-setup.ts stubs it; DomainsAccordion/OnSideDocuments use
 * the same call for the base's other scrollIntoView ports, source
 * 3021–3054).
 *
 * THREE BACKWARD-COMPATIBLE ADDITIONS (design_system_spec.md §2.9.3,
 * amendment A16 / PI2-D42 — the context-scoped Ask chat): each is optional,
 * defaulting to today's exact shipped behavior, so `StudioAsk.tsx`'s
 * existing call site needs no change and renders byte-identical (AC-A16-7).
 *   1. `inputLabel?`/`inputPlaceholder?` — consumed exactly where the
 *      Input's literals sat hardcoded before; omitted, both default to
 *      those exact literals. Required, not optional, at A16's two new
 *      call sites (Studio·Ask-specific copy is factually wrong for an
 *      OnSide-scoped chat).
 *   2. The counters row now renders CONDITIONALLY (AC-A16-6): when
 *      `counters` is empty, the `role="group"` wrapper does not render at
 *      all — previously an empty group still announced the hardcoded,
 *      Studio-specific "Studio · Ask coverage" label to assistive tech,
 *      a scoping misstatement on an OnSide-scoped chat. The chat variant
 *      always passes `counters={[]}` (no counters in its anatomy);
 *      `StudioAsk.tsx`'s own call site always supplies non-empty counters,
 *      so it is unaffected.
 *   3. `ChatMessage.deepLinks?` — zero or more inline cross-references,
 *      rendered as a small row of inline navigating-links immediately
 *      beneath that message's bubble: the SAME inline-link treatment
 *      `affordance_standard.md` §3.2 / `DrawerContent.tsx`'s
 *      `DrawerContentField.onPress` already ship (accent-colored text, no
 *      button chrome, trailing `arrow-right` Icon, `<button type="button">`
 *      — reused at a second, analogous call site, not a new pattern).
 *      Firing one calls the new `onDeepLinkPress` prop with the link's raw
 *      `DeepLinkRequest` — necessary wiring for item 3 (a message carrying
 *      *data* needs some way to hand a press back to whichever screen owns
 *      the actual `onDeepLink` contract; there is only one sane shape for
 *      that channel, so it carries no design/token surface of its own,
 *      same category of plumbing as `onAsk`/`onInputChange` already
 *      threading screen-owned handlers through this controlled composite).
 *      Omitted (undefined or empty), a message renders exactly as before
 *      this amendment.
 */
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Button } from './primitives/Button';
import { Chip } from './primitives/Chip';
import { Icon } from './primitives/Icon';
import { Input } from './primitives/Input';
import { Spinner } from './primitives/Spinner';
import { StatCard } from './StatCard';
import type { DeepLinkRequest } from '../App';

export interface ChatCounter {
  value: string | number;
  unit?: string;
  label: string;
}

/** One inline cross-reference a message can carry (§2.9.3 item 3). Same
 * shape as `data/chatTypes.ts`'s `ChatEntryDeepLink` — kept as its own,
 * independently-declared type here (not imported) since this is ChatHero's
 * OWN prop-level contract, a general-purpose composite addition that must
 * not depend on the Ask-chat content schema module; the two are structurally
 * identical by design, not by shared declaration. */
export interface ChatMessageDeepLink {
  label: string;
  request: DeepLinkRequest;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  /** §2.9.3 item 3 — rendered as inline navigating links beneath this
   * message's bubble. Omitted or empty: no change from pre-A16 rendering. */
  deepLinks?: ChatMessageDeepLink[];
}

export type ChatHeroState = 'idle' | 'typing' | 'submitting' | 'answer-rendering' | 'answer-complete' | 'no-match';

const DEFAULT_INPUT_LABEL = 'Ask a policy question';
const DEFAULT_INPUT_PLACEHOLDER = 'Ask about a policy, procedure, or obligation…';

export interface ChatHeroProps {
  /** "412 monitored docs", "interviews 11 of 12" — survey_map.md 895-919. Owned by whichever data/screen dispatch supplies live counts; not part of this dispatch's engine scope. */
  counters: ChatCounter[];
  messages: ChatMessage[];
  suggestions: string[];
  inputValue: string;
  onInputChange: (value: string) => void;
  /** Fires on "Ask" press or Enter in the Input. Never fired by a suggestion Chip. */
  onAsk: (value: string) => void;
  state: ChatHeroState;
  /** Copy for the `no-match` fallback. Defaults to the spec's own quoted fallback text (§5.4). */
  noMatchMessage?: string;
  /** §2.9.3 item 1. Defaults to this file's pre-A16 literals. */
  inputLabel?: string;
  inputPlaceholder?: string;
  /** §2.9.3 item 3 — fires with a message's `ChatMessageDeepLink.request`
   * when its inline link is pressed. Omit where no message ever carries
   * `deepLinks` (e.g. `StudioAsk.tsx`'s existing call site). */
  onDeepLinkPress?: (request: DeepLinkRequest) => void;
}

const DEFAULT_NO_MATCH = 'No matching policy answer for that question yet.';

const rootStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1rem' };

const counterRowStyle: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '1.25rem' };

const messageListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.625rem',
  margin: 0,
  padding: 0,
  listStyle: 'none',
  maxHeight: '35rem',
  overflowY: 'auto',
};

function bubbleStyle(role: ChatMessage['role']): CSSProperties {
  return {
    alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
    maxWidth: '80%',
    background: role === 'user' ? 'var(--accent)' : 'var(--panel)',
    color: role === 'user' ? 'var(--bg)' : 'var(--ink)',
    border: role === 'user' ? 'none' : '1px solid var(--border)',
    borderRadius: 'var(--radius-sm, 10px)',
    padding: '0.625rem 0.875rem',
    fontSize: '0.875rem',
    lineHeight: 1.5,
  };
}

const suggestionRowStyle: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' };

const askRowStyle: CSSProperties = { display: 'flex', gap: '0.625rem', alignItems: 'flex-end' };

const deepLinkRowStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' };

interface ChatMessageDeepLinkButtonProps {
  link: ChatMessageDeepLink;
  onPress: (request: DeepLinkRequest) => void;
}

/** §2.9.3 item 3 — the SAME inline-link affordance `DrawerContent.tsx`'s
 * `DrawerContentFieldValue` already ships (`affordance_standard.md` §3.2):
 * accent text, no button chrome, trailing `arrow-right` Icon, underline
 * added on hover, `<button type="button">` (not `<a>` — the destination is
 * in-app state) so it stays keyboard-operable and `--focus-ring`-eligible.
 * A local, unexported subcomponent for the same reason `DrawerContent.tsx`'s
 * own per-field subcomponent is local: hover/focus need a real per-link
 * hook instance a `.map()` callback cannot provide without violating the
 * rules of hooks. */
function ChatMessageDeepLinkButton({ link, onPress }: ChatMessageDeepLinkButtonProps) {
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onPress(link.request)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        alignSelf: 'flex-start',
        background: 'transparent',
        border: 'none',
        padding: 0,
        margin: 0,
        font: 'inherit',
        fontSize: '0.8125rem',
        color: 'var(--accent)',
        cursor: 'pointer',
        textDecoration: hover ? 'underline' : 'none',
        borderRadius: 'var(--radius-xs, 4px)',
        boxShadow: focused ? 'var(--focus-ring)' : 'none',
      }}
    >
      {link.label}
      <Icon name="arrow-right" size={16} tone="interactive" />
    </button>
  );
}

export function ChatHero({
  counters,
  messages,
  suggestions,
  inputValue,
  onInputChange,
  onAsk,
  state,
  noMatchMessage,
  inputLabel,
  inputPlaceholder,
  onDeepLinkPress,
}: ChatHeroProps) {
  const busy = state === 'submitting' || state === 'answer-rendering';
  const isFinal = state === 'answer-complete' || state === 'no-match';
  const lastMessage = messages[messages.length - 1];
  const showAnswerRegion = isFinal && lastMessage?.role === 'assistant';
  const listRef = useRef<HTMLUListElement>(null);

  // C-unbounded-growth-02: base scroll-to-latest on every appended line
  // (addMsg 4343 / botSay 4348). `block:'nearest'` scrolls the bounded
  // list just enough to reveal the newest bubble without yanking outer
  // scroll containers past it.
  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ block: 'nearest' });
  }, [messages, state]);

  const handleAsk = () => {
    if (inputValue.trim().length === 0 || busy) return;
    onAsk(inputValue);
  };

  return (
    <div style={rootStyle} data-lf-composite="chat-hero" data-state={state}>
      {/* AC-A16-6 / §2.9.3 item 2 — omitted entirely (not merely empty)
          when there are no counters, so an OnSide-scoped chat (which never
          passes any) never announces the hardcoded Studio-specific
          "Studio · Ask coverage" label to assistive tech. */}
      {counters.length > 0 ? (
        <div role="group" aria-label="Studio · Ask coverage" style={counterRowStyle}>
          {counters.map((counter) => (
            <StatCard key={counter.label} {...counter} />
          ))}
        </div>
      ) : null}

      <ul ref={listRef} aria-label="Conversation" style={messageListStyle}>
        {messages.map((message, index) => {
          const isLastAssistantFinal = isFinal && index === messages.length - 1 && message.role === 'assistant';
          return (
            <li key={message.id} style={bubbleStyle(message.role)} role={isLastAssistantFinal ? 'status' : undefined} aria-live={isLastAssistantFinal ? 'polite' : undefined}>
              {message.text}
              {message.deepLinks && message.deepLinks.length > 0 ? (
                <div style={deepLinkRowStyle}>
                  {message.deepLinks.map((link) => (
                    <ChatMessageDeepLinkButton
                      key={link.label}
                      link={link}
                      onPress={(request) => onDeepLinkPress?.(request)}
                    />
                  ))}
                </div>
              ) : null}
            </li>
          );
        })}
        {busy ? (
          <li style={{ ...bubbleStyle('assistant'), display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }} aria-hidden="true">
            <Spinner variant="inline" size="small" /> Thinking…
          </li>
        ) : null}
        {state === 'no-match' && !showAnswerRegion ? (
          <li style={bubbleStyle('assistant')} role="status" aria-live="polite">
            {noMatchMessage ?? DEFAULT_NO_MATCH}
          </li>
        ) : null}
      </ul>

      <div style={suggestionRowStyle} role="group" aria-label="Suggested questions">
        {suggestions.map((suggestion) => (
          <Chip key={suggestion} text={suggestion} variant="suggestion" onPress={() => onInputChange(suggestion)} />
        ))}
      </div>

      <div style={askRowStyle}>
        <div style={{ flex: 1 }}>
          {/* A14-residual wave: Input (P6) now carries the same `surface`
              prop A14 established for Label/StatValue. ChatHero has
              exactly one real call site (StudioAsk.tsx), whose
              CHAT_PANEL_STYLE spreads PANEL_STYLE — always panel-seated,
              so this is hardcoded here (same precedent as
              SliderControlRow.tsx's `stanceBoxStyle` Label / StatCard's
              own unconditional wiring), not threaded as a prop this
              composite doesn't otherwise need. */}
          <Input
            label={inputLabel ?? DEFAULT_INPUT_LABEL}
            value={inputValue}
            placeholder={inputPlaceholder ?? DEFAULT_INPUT_PLACEHOLDER}
            onChange={onInputChange}
            onSubmit={handleAsk}
            disabled={state === 'submitting'}
            surface="panel"
          />
        </div>
        <Button label="Ask" variant="primary" onPress={handleAsk} loading={state === 'submitting'} disabled={inputValue.trim().length === 0} />
      </div>
    </div>
  );
}
