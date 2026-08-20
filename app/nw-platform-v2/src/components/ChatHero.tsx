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
 */
import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { Button } from './primitives/Button';
import { Chip } from './primitives/Chip';
import { Input } from './primitives/Input';
import { Spinner } from './primitives/Spinner';
import { StatCard } from './StatCard';

export interface ChatCounter {
  value: string | number;
  unit?: string;
  label: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export type ChatHeroState = 'idle' | 'typing' | 'submitting' | 'answer-rendering' | 'answer-complete' | 'no-match';

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

export function ChatHero({ counters, messages, suggestions, inputValue, onInputChange, onAsk, state, noMatchMessage }: ChatHeroProps) {
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
      <div role="group" aria-label="Studio · Ask coverage" style={counterRowStyle}>
        {counters.map((counter) => (
          <StatCard key={counter.label} {...counter} />
        ))}
      </div>

      <ul ref={listRef} aria-label="Conversation" style={messageListStyle}>
        {messages.map((message, index) => {
          const isLastAssistantFinal = isFinal && index === messages.length - 1 && message.role === 'assistant';
          return (
            <li key={message.id} style={bubbleStyle(message.role)} role={isLastAssistantFinal ? 'status' : undefined} aria-live={isLastAssistantFinal ? 'polite' : undefined}>
              {message.text}
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
            label="Ask a policy question"
            value={inputValue}
            placeholder="Ask about a policy, procedure, or obligation…"
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
