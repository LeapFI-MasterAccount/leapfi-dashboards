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
 * AMBIGUITY RESOLVED (StatCard row): StatCard (C1) is a sibling composite
 * with no file in this worktree — same reasoning as `PlanTable.tsx`'s
 * DataTable note. The counters render via a local `CounterTile` helper
 * (StatValue only, P11) rather than importing an unbuilt component under
 * a guessed prop contract — see SliderControlRow.tsx's identical note
 * for why C1's Label half is intentionally not reproduced per-tile
 * (StatValue's own accessible-name contract already bundles "value +
 * its label" as one unit). Mechanical drop-in for the real StatCard.tsx
 * once that dispatch lands.
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
 */
import type { CSSProperties } from 'react';
import { Button } from './primitives/Button';
import { Chip } from './primitives/Chip';
import { Input } from './primitives/Input';
import { Spinner } from './primitives/Spinner';
import { StatValue } from './primitives/StatValue';

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

/**
 * Local stand-in for StatCard (C1 = StatValue + Label) — see the file
 * header's AMBIGUITY RESOLVED note. Duplicated (not shared) with
 * SliderControlRow.tsx's identical helper: the two composites are not
 * otherwise related, and both copies disappear once the real
 * StatCard.tsx lands.
 */
function CounterTile({ value, unit, label }: ChatCounter) {
  // exactOptionalPropertyTypes: forwarding a possibly-`undefined` optional
  // prop verbatim (`unit={unit}`) is rejected — StatValue's `unit?: string`
  // means "present and a string, or absent," not "present as undefined."
  return unit === undefined ? <StatValue value={value} label={label} /> : <StatValue value={value} unit={unit} label={label} />;
}

export function ChatHero({ counters, messages, suggestions, inputValue, onInputChange, onAsk, state, noMatchMessage }: ChatHeroProps) {
  const busy = state === 'submitting' || state === 'answer-rendering';
  const isFinal = state === 'answer-complete' || state === 'no-match';
  const lastMessage = messages[messages.length - 1];
  const showAnswerRegion = isFinal && lastMessage?.role === 'assistant';

  const handleAsk = () => {
    if (inputValue.trim().length === 0 || busy) return;
    onAsk(inputValue);
  };

  return (
    <div style={rootStyle} data-lf-composite="chat-hero" data-state={state}>
      <div role="group" aria-label="Studio · Ask coverage" style={counterRowStyle}>
        {counters.map((counter) => (
          <CounterTile key={counter.label} {...counter} />
        ))}
      </div>

      <ul aria-label="Conversation" style={messageListStyle}>
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
          <Input
            label="Ask a policy question"
            value={inputValue}
            placeholder="Ask about a policy, procedure, or obligation…"
            onChange={onInputChange}
            onSubmit={handleAsk}
            disabled={state === 'submitting'}
          />
        </div>
        <Button label="Ask" variant="primary" onPress={handleAsk} loading={state === 'submitting'} disabled={inputValue.trim().length === 0} />
      </div>
    </div>
  );
}
