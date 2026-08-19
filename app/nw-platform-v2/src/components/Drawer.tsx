/**
 * Drawer — Composite C7 (design_system_spec.md §2.2)
 *
 * "Single shared instance app-wide" (survey_map.md §d-5 — binding, never a
 * second instance): this component is the ONE `<Drawer>` a consumer mounts
 * once (e.g. in App.tsx, outside this dispatch's allowlist) and drives via
 * `open`/`onClose`/`children`/`footer` props — it is a controlled overlay,
 * not a self-managing singleton with its own imperative open() API, so a
 * screen can never accidentally instantiate a second one (survey_map.md
 * 2372–92 "never add a second drawer or bypass closeDrawer").
 *
 * Composite states (spec): closed, opening, open, closing. Implemented as
 * an internal phase machine driven by the `open` prop:
 *   closed --(open=true)--> opening --(next paint)--> open
 *   open/opening --(open=false)--> closing --(transition end)--> closed
 * The two-tick opening step (mount at the closed visual position, THEN flip
 * to the open position on the next animation frame) is required for the
 * CSS transform/opacity transition to actually animate — collapsing it to
 * one tick would mean the drawer's first paint is already at its final
 * position and nothing would visibly slide in.
 *
 * Focus management (spec C7 a11y baseline, porting survey_map.md's
 * captureRet/restoreRet, 2372–92 & 1433–71 — "this is a port requirement,
 * not a new behavior"):
 *   - Initial focus: the drawer's own heading, once fully open.
 *   - Trap boundary: the drawer's own DOM subtree while open (Tab/Shift+Tab
 *     cycle within it; Escape closes).
 *   - Close-restore: focus returns to the exact control that opened the
 *     drawer. The base engine captures `document.activeElement` into
 *     `window.__lastFocus` at open time and restores it at close time; this
 *     component ports that exact mechanism as an internal ref rather than a
 *     prop the consumer must supply, so callers don't have to thread a
 *     "trigger ref" through every row/button that can open the drawer —
 *     that fidelity to the ported behavior is what makes it a port, not a
 *     reinterpretation.
 *
 * AMBIGUITY RESOLVED — header composition (spec §2.2 C7 "Built from: header
 * (Label + close Button)"): primitive Label (P3, §2.1) only exposes
 * `body-secondary` and `eyebrow` variants, neither of which is a
 * heading-weight style, and Label renders a `<span>` with its own inline
 * styles that would win over an ancestor `<h2>`'s typography (inline style
 * always beats inherited). The a11y baseline also requires a real heading
 * element ("Initial focus: the drawer's heading"; DrawerContent's C8 baseline
 * says its region is "labelled by the Drawer's own heading"). I resolved
 * this by authoring the semantic `<h2>` directly in this file with its own
 * heading-weight inline typography (token-driven color only, per the
 * project's raw-hex ban) rather than nesting the Label primitive inside it —
 * the C7 row's mention of "Label" is read as describing the header's text
 * content, not a mandate to reuse Label's exact variant styling where doing
 * so would produce an inaccessible, illegible heading. Flagging for
 * design-authority confirmation since it is a real deviation from a literal
 * reading of the "built from" list.
 *
 * AMBIGUITY RESOLVED — no "wide" variant: the read-only base engine's
 * `#drawer` has a `.wide` CSS modifier (showDrawer(html, wide)), but
 * design_system_spec.md §2.2 C7 lists no size variant for this composite
 * ("Variants: —"). Per the persona directive to build exactly to the
 * spec's stated props/variants and not infer beyond it, no `wide` prop is
 * added here. STOP-item if a future screen composite needs the wider
 * layout — that is new spec surface, not a restyle.
 */
import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { Button } from './primitives/Button';

export type DrawerPhase = 'closed' | 'opening' | 'open' | 'closing';

export interface DrawerProps {
  /** Controlled open state — this Drawer instance renders nothing (`null`) once its close transition finishes. */
  open: boolean;
  /** Drawer heading text (rendered as the dialog's accessible name and the initial-focus target). */
  title: string;
  /** Invoked on Escape, scrim click, or the header close Button. Does not itself flip `open` — the consumer owns that state. */
  onClose: () => void;
  /** Body slot (spec: "body (slot)"). */
  children: ReactNode;
  /** Footer action slot, 1–2 Buttons (spec: "footer action slot (Button ×1–2)"). Omit for drawers with no footer actions (e.g. read-only detail views). */
  footer?: ReactNode;
}

/** Enter/exit transition duration. Not a value tokens.css defines (it carries
 * color roles only, per design_system_spec.md §1.4); this is a structural
 * timing constant, chosen consistent with the existing 120ms transitions
 * already shipped on Button/primitives — same category of implementer
 * judgment call as Label's eyebrow letter-spacing placeholder. */
const TRANSITION_MS = 200;

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function isVisible(el: HTMLElement): boolean {
  return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
}

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isVisible);
}

export function Drawer({ open, title, onClose, children, footer }: DrawerProps) {
  const headingId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [phase, setPhase] = useState<DrawerPhase>('closed');

  // Drive the phase machine off the `open` prop only — intentionally not
  // reacting to `phase` itself here (see the two effects below for that),
  // so this effect fires exactly once per open/close request.
  useEffect(() => {
    if (open) {
      const activeElement = document.activeElement;
      returnFocusRef.current = activeElement instanceof HTMLElement ? activeElement : null;
      setPhase('opening');
    } else {
      setPhase((current) => (current === 'closed' ? 'closed' : 'closing'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- phase transitions are intentionally driven by `open` alone
  }, [open]);

  // opening -> open on the next paint (lets the enter transition animate),
  // then move initial focus to the heading (C7 a11y baseline).
  useEffect(() => {
    if (phase !== 'opening') return;
    const raf = window.requestAnimationFrame(() => {
      setPhase('open');
      headingRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [phase]);

  // closing -> closed once the exit transition finishes, then restore focus
  // to the exact control that opened the drawer (ports captureRet/restoreRet,
  // survey_map.md 2372–92 & 1433–71).
  useEffect(() => {
    if (phase !== 'closing') return;
    const timer = window.setTimeout(() => {
      setPhase('closed');
      const target = returnFocusRef.current;
      returnFocusRef.current = null;
      if (target && document.body.contains(target)) {
        target.focus();
      }
    }, TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const container = dialogRef.current;
    if (!container) return;
    const focusable = getFocusable(container);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) {
      // Nothing focusable inside (shouldn't happen — the close Button is
      // always present — but stay trapped on the heading rather than let
      // focus escape the drawer subtree).
      event.preventDefault();
      headingRef.current?.focus();
      return;
    }
    const isInsideContainer = container.contains(document.activeElement);
    if (event.shiftKey) {
      if (!isInsideContainer || document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else if (!isInsideContainer || document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (phase === 'closed') return null;

  const isOpenVisual = phase === 'open';

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        data-lf-composite="drawer-scrim"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--bg)',
          opacity: isOpenVisual ? 0.7 : 0,
          transition: `opacity ${TRANSITION_MS}ms ease`,
          zIndex: 40,
        }}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        onKeyDown={handleKeyDown}
        data-lf-composite="drawer"
        data-phase={phase}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(480px, 100vw)',
          background: 'var(--panel)',
          borderLeft: '1px solid var(--border)',
          boxShadow: '-8px 0 24px color-mix(in srgb, var(--bg) 55%, transparent)',
          transform: isOpenVisual ? 'translateX(0)' : 'translateX(100%)',
          transition: `transform ${TRANSITION_MS}ms ease`,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <h2
            ref={headingRef}
            id={headingId}
            tabIndex={-1}
            style={{
              margin: 0,
              font: 'inherit',
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--ink)',
              outline: 'none',
            }}
          >
            {title}
          </h2>
          <Button variant="ghost" icon="close" label="Close" onPress={onClose} />
        </div>
        <div style={{ flex: '1 1 auto', overflowY: 'auto', padding: '1.25rem' }}>{children}</div>
        {footer ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.5rem',
              padding: '1rem 1.25rem',
              borderTop: '1px solid var(--border)',
            }}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </>
  );
}
