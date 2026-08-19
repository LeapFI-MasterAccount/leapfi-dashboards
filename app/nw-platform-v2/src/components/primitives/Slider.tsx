/**
 * Slider — Primitive P7 (design_system_spec.md §2.1)
 *
 * Single-handle numeric slider. Built on a native <input type="range">
 * so arrow-key stepping and Home/End-to-bounds keyboard operability (spec
 * a11y baseline) come from the platform for free, and aria-valuenow/min/
 * max are managed by the browser from the same value/min/max props.
 *
 * Spec a11y baseline: "value change is visually live but announced via
 * aria-live="polite" only on commit (drag-end / arrow-key press), never
 * per-pixel during drag." `onChange` fires continuously (live visual
 * update, the composite's responsibility to render); `onCommit` fires
 * only at drag-end (pointer up) or on each discrete arrow-key press —
 * never on intermediate drag frames — and this component owns the
 * aria-live announcement of the committed value so callers cannot
 * accidentally wire it to onChange and violate the per-pixel rule.
 */
import { useId, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react';

export interface SliderProps {
  min: number;
  max: number;
  value: number;
  label: string;
  /** Optional human-readable value text for aria-valuetext (e.g. "42%"). Defaults to the numeric value. */
  valueText?: string;
  step?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
  /** Fired once per commit: drag-end (pointer up) or a single arrow-key press. Never fired per drag frame. */
  onCommit?: (value: number) => void;
}

const wrapStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.375rem',
};

const labelRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.8125rem',
  color: 'var(--ink2)',
};

const srOnly: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

const COMMIT_KEYS = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
  'PageUp',
  'PageDown',
]);

export function Slider({
  min,
  max,
  value,
  label,
  valueText,
  step = 1,
  disabled = false,
  onChange,
  onCommit,
}: SliderProps) {
  const generatedId = useId();
  const [dragging, setDragging] = useState(false);
  const [announced, setAnnounced] = useState(value);
  const pendingCommitRef = useRef(value);

  const commit = (next: number) => {
    pendingCommitRef.current = next;
    setAnnounced(next);
    onCommit?.(next);
  };

  return (
    <div style={wrapStyle}>
      <div style={labelRowStyle}>
        <label htmlFor={generatedId}>{label}</label>
        <span aria-hidden="true">{valueText ?? value}</span>
      </div>
      <input
        id={generatedId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-valuetext={valueText}
        data-lf-primitive="slider"
        data-dragging={dragging || undefined}
        style={{
          width: '100%',
          accentColor: 'var(--accent)',
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        onChange={(event) => {
          const next = Number(event.target.value);
          onChange(next);
          // Direct track clicks (not a keyboard/drag interaction in
          // progress) are a single discrete commit, same as an arrow key.
          if (!dragging) {
            commit(next);
          }
        }}
        onPointerDown={() => setDragging(true)}
        onPointerUp={(event: PointerEvent<HTMLInputElement>) => {
          setDragging(false);
          commit(Number(event.currentTarget.value));
        }}
        onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
          if (COMMIT_KEYS.has(event.key)) {
            // Defer to the next tick so the input's value has updated
            // per the native range-input keyboard behavior before commit.
            requestAnimationFrame(() => {
              commit(Number((event.target as HTMLInputElement).value));
            });
          }
        }}
        onFocus={(event) => {
          event.currentTarget.style.boxShadow = 'var(--focus-ring)';
        }}
        onBlur={(event) => {
          event.currentTarget.style.boxShadow = 'none';
        }}
      />
      {/* Committed-value announcement only — never updated per drag frame. */}
      <span role="status" aria-live="polite" style={srOnly}>
        {label}: {valueText ?? announced}
      </span>
    </div>
  );
}
