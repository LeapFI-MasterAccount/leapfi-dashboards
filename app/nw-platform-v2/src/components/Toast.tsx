/**
 * Toast — Composite C17 (design_system_spec.md §2.2)
 *
 * Built from: Icon (P1) + Label (P3) + optional link (Button/ghost, e.g.
 * "View impact →"). Variants: success, info. Composite states: entering,
 * visible, exiting.
 *
 * a11y baseline (spec C17): "`role=\"status\"`, `aria-live=\"polite\"`;
 * auto-dismiss timing must not be the only way to dismiss (also
 * closable/click-through)."
 *
 * AMBIGUITY RESOLVED (icon per variant): the P1 glyph vocabulary
 * (Icon.tsx) is closed and has no dedicated "success"/"info" glyphs.
 * `check` (already used elsewhere "paired with a Tag per P4's 'never
 * color alone' rule", per Icon.tsx's own doc comment) is the closest
 * semantic fit for `success`; `bell` (the vocabulary's only
 * general-notification glyph) stands in for `info`. Both are decorative
 * here (`aria-hidden`) — the toast's meaning is carried by its text, per
 * the same "never color/icon alone" rule applied throughout §2.1/§2.2 —
 * so a mismatch between the glyph and the word "info" costs nothing
 * accessibility-wise, but flagging the substitution as a STOP-item in
 * case a future Icon vocabulary revision adds a dedicated info glyph.
 *
 * AMBIGUITY RESOLVED ("also closable/click-through"): read as two
 * requirements, not one hyphenated term — (1) closable: an explicit
 * close control independent of the auto-dismiss timer (implemented
 * below as a `close` icon-only ghost affordance, `aria-label="Dismiss
 * notification"`); (2) click-through: the toast must not behave like a
 * modal scrim that blocks interaction with the rest of the screen — this
 * component renders no backdrop and takes no more hit-area than its own
 * pill, so pointer events everywhere else on the page pass through
 * untouched by construction; there is nothing further for this
 * component to implement for requirement (2).
 *
 * Lifecycle: this composite owns its own `entering` -> `visible` ->
 * `exiting` state machine internally (mirrors this codebase's existing
 * pattern of composites owning their own transient visual state, e.g.
 * Button's hover/focus/active in Button.tsx) rather than requiring the
 * caller to drive three states by hand. The caller supplies only
 * `onDismiss`, invoked once after the exit transition completes (close
 * click, link click that also dismisses if `dismissOnLinkPress` is set,
 * or the optional auto-dismiss timer) — at which point the caller
 * unmounts this component. Irreversibility note: dismissing a Toast is
 * not an irreversible server operation (Core Principle 1/Directive 6
 * scope) — it only ever discards a client-side notification, so no
 * request-key/idempotency mechanism applies here.
 */
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Icon } from './primitives/Icon';
import { Button } from './primitives/Button';

export type ToastVariant = 'success' | 'info';
export type ToastState = 'entering' | 'visible' | 'exiting';

export interface ToastProps {
  variant: ToastVariant;
  message: string;
  linkLabel?: string;
  onLinkPress?: () => void;
  /** If true (default false), pressing the link also dismisses the toast. */
  dismissOnLinkPress?: boolean;
  /** Called once, after the exit transition completes. Caller unmounts on receipt. */
  onDismiss: () => void;
  /** If set, the toast auto-dismisses this many ms after becoming visible. Always paired with the close control (see doc comment). */
  autoDismissMs?: number;
}

const EXIT_TRANSITION_MS = 180;

const VARIANT_ICON = {
  success: 'check',
  info: 'bell',
} as const;

const VARIANT_COLOR: Record<ToastVariant, string> = {
  success: 'var(--sem-positive)',
  info: 'var(--accent)',
};

const WRAP_STYLE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.625rem',
  padding: '0.75rem 0.875rem',
  borderRadius: 'var(--radius-md, 10px)',
  border: '1px solid var(--border)',
  background: 'var(--panel)',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
  maxWidth: '28rem',
  transition: `opacity ${EXIT_TRANSITION_MS}ms ease, transform ${EXIT_TRANSITION_MS}ms ease`,
};

function transitionStyle(state: ToastState): CSSProperties {
  if (state === 'visible') {
    return { opacity: 1, transform: 'translateY(0)' };
  }
  // entering (pre-mount-tick) and exiting share the same offscreen
  // visual so the enter animation and the exit animation are the same
  // transform reversed, not two bespoke effects.
  return { opacity: 0, transform: 'translateY(-6px)' };
}

export function Toast({ variant, message, linkLabel, onLinkPress, dismissOnLinkPress = false, onDismiss, autoDismissMs }: ToastProps) {
  const [state, setState] = useState<ToastState>('entering');
  const dismissedRef = useRef(false);

  // entering -> visible on the next frame, so the mount transition
  // actually plays instead of starting already in its end state.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setState('visible'));
    return () => cancelAnimationFrame(raf);
  }, []);

  const beginDismiss = () => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setState('exiting');
    window.setTimeout(onDismiss, EXIT_TRANSITION_MS);
  };

  useEffect(() => {
    if (autoDismissMs === undefined) return undefined;
    const timer = window.setTimeout(beginDismiss, autoDismissMs);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- beginDismiss is stable per mount via dismissedRef guard; re-arming on every render would restart the timer each render
  }, [autoDismissMs]);

  return (
    <div
      role="status"
      aria-live="polite"
      data-lf-composite="toast"
      data-variant={variant}
      data-state={state}
      style={{ ...WRAP_STYLE, ...transitionStyle(state) }}
    >
      <span aria-hidden="true" style={{ display: 'inline-flex', color: VARIANT_COLOR[variant] }}>
        <Icon name={VARIANT_ICON[variant]} size={16} />
      </span>

      <span style={{ font: 'inherit', fontSize: '0.875rem', color: 'var(--ink)', flex: '1 1 auto' }}>{message}</span>

      {linkLabel && onLinkPress ? (
        <Button
          label={linkLabel}
          variant="ghost"
          icon="arrow-right"
          onPress={() => {
            onLinkPress();
            if (dismissOnLinkPress) beginDismiss();
          }}
        />
      ) : null}

      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={beginDismiss}
        data-lf-composite="toast-close"
        style={{
          flex: '0 0 auto',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 44,
          height: 44,
          margin: '-0.5rem',
          background: 'transparent',
          border: 'none',
          borderRadius: 'var(--radius-sm, 6px)',
          color: 'var(--ink2)',
          cursor: 'pointer',
          outline: 'none',
        }}
        onFocus={(event) => {
          event.currentTarget.style.boxShadow = 'var(--focus-ring)';
        }}
        onBlur={(event) => {
          event.currentTarget.style.boxShadow = 'none';
        }}
      >
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}
