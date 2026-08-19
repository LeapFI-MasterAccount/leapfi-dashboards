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
 * modal scrim that blocks interaction with the rest of the screen — see
 * the SELF-POSITIONING note below: the fixed anchor is
 * `pointer-events:none`, so only the pill's own box takes hits and
 * pointer events everywhere else pass through untouched.
 *
 * SELF-POSITIONING (fix A-overlap-04; base anchor
 * leapfi-platform.html:110 `#toast{position:fixed;left:50%;bottom:26px;
 * transform:translate(-50%,14px);...pointer-events:none;...z-index:120;
 * max-width:min(620px,88vw)}`): the base's toast was a singleton slot
 * fixed at BOTTOM-CENTER, deliberately clear of the topbar chrome. The
 * twin's screens instead mounted this composite inside their own fixed
 * top-right wrappers, where the pill occluded and click-blocked the
 * Topbar's bell/date/theme/profile cluster. This composite is now
 * SELF-POSITIONING: it renders its own fixed bottom-center anchor
 * (`left:50%; bottom:26px; translateX(-50%); z-index:120`, the base's
 * exact geometry) with `pointer-events:none` on the anchor and
 * `pointer-events:auto` re-enabled on the pill only — the base's toast
 * had no interactive children so it was pointer-inert wholesale; ours
 * keeps the C17-required close control (and optional link), so the
 * pointer-events split is the faithful equivalent. Existing screen-level
 * fixed top-right mount wrappers become inert (a fixed element positions
 * against the viewport, not a non-transformed fixed ancestor); their
 * removal belongs to the screen-owning fix batches, not this file.
 * Enter/exit transform is the base's `translate(-50%,14px)` rise-from-
 * below, Y-half on the pill (the X-half lives on the anchor).
 *
 * AUTO-DISMISS DEFAULT (same fix, A-overlap-04): `autoDismissMs` now
 * DEFAULTS to the base's own toast timer (4200ms, source 3966
 * `setTimeout(...,4200)`) instead of "no timer unless the caller
 * remembered one" — an omitted prop must never mean a toast that
 * occludes forever. An explicitly sticky toast is still expressible:
 * pass `autoDismissMs={null}`. Numeric callers behave exactly as before.
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
  /** Auto-dismiss delay in ms. DEFAULTS to the base toast timer (4200ms,
   * source 3966) so an omitted prop never means a toast that persists
   * forever (A-overlap-04). Pass `null` for an explicitly sticky toast
   * dismissed only via the close control. Always paired with the close
   * control (see doc comment). */
  autoDismissMs?: number | null;
}

const EXIT_TRANSITION_MS = 180;

/** Base toast auto-hide delay — source 3966 `setTimeout(...,4200)`. */
const DEFAULT_AUTO_DISMISS_MS = 4200;

const VARIANT_ICON = {
  success: 'check',
  info: 'bell',
} as const;

const VARIANT_COLOR: Record<ToastVariant, string> = {
  success: 'var(--sem-positive)',
  info: 'var(--accent)',
};

/** A-overlap-04: the base #toast slot geometry (source 110) — fixed
 * bottom-center, pointer-inert, above all chrome (base z-index 120). */
const ANCHOR_STYLE: CSSProperties = {
  position: 'fixed',
  left: '50%',
  bottom: 26,
  transform: 'translateX(-50%)',
  zIndex: 120,
  pointerEvents: 'none',
  maxWidth: 'min(620px, 88vw)',
  display: 'flex',
  justifyContent: 'center',
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
  // Only the pill takes hits — the anchor around it is pointer-events:none
  // (see file header SELF-POSITIONING).
  pointerEvents: 'auto',
  transition: `opacity ${EXIT_TRANSITION_MS}ms ease, transform ${EXIT_TRANSITION_MS}ms ease`,
};

function transitionStyle(state: ToastState): CSSProperties {
  if (state === 'visible') {
    return { opacity: 1, transform: 'translateY(0)' };
  }
  // entering (pre-mount-tick) and exiting share the same offscreen
  // visual so the enter animation and the exit animation are the same
  // transform reversed, not two bespoke effects. +14px = the base's
  // hidden-state `translate(-50%,14px)` rise-from-below (source 110).
  return { opacity: 0, transform: 'translateY(14px)' };
}

export function Toast({
  variant,
  message,
  linkLabel,
  onLinkPress,
  dismissOnLinkPress = false,
  onDismiss,
  autoDismissMs = DEFAULT_AUTO_DISMISS_MS,
}: ToastProps) {
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
    // `null` = explicitly sticky (A-overlap-04); an omitted prop defaulted
    // to the base's 4200ms timer above, so no toast persists by accident.
    if (autoDismissMs === null) return undefined;
    const timer = window.setTimeout(beginDismiss, autoDismissMs);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- beginDismiss is stable per mount via dismissedRef guard; re-arming on every render would restart the timer each render
  }, [autoDismissMs]);

  return (
    <div data-lf-toast-anchor style={ANCHOR_STYLE}>
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
    </div>
  );
}
