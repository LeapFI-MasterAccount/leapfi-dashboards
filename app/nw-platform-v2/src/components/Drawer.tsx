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
 * SIZE VARIANT (RPT-03 fix wave — supersedes this file's original
 * "AMBIGUITY RESOLVED — no 'wide' variant" note): the base engine's
 * `#drawer` carries a `.wide` CSS modifier (`showDrawer(html, wide)`;
 * `dr.classList.add('wide')` on every `openReport`, source line 1679;
 * `.drawer.wide{width:min(920px,97vw)}`, source line 326), and
 * parity_ia_addendum.md §1.3/§6 binds Reporting content to "the existing
 * shared Drawer, wide variant — matches the base engine's own". The
 * original resolution read design_system_spec.md §2.2 C7's "Variants: —"
 * as banning the variant; the addendum's twice-stated requirement governs
 * (D16 full parity). Implemented as an optional, backward-compatible
 * `size` prop — omitted everywhere today except Reporting's report mode,
 * so every other screen's default usage renders byte-identically.
 *
 * PRINT STYLESHEET (RPT-01 fix wave): the base backs its "opens formatted,
 * ready to print or save as PDF" claim with a drawer-only `@media print`
 * block (source line 758: hide body, promote `.drawer` to absolute
 * full-width, white background/black ink, hide scrim/close/repbar). That
 * block was never ported, so `window.print()` produced a clipped dark
 * viewport page. Ported below as a `<style>` rendered with the drawer
 * (this component owns every selector the block targets; `main.tsx`/the
 * css entry files are outside the fix dispatch's allowlist — same inline
 * `<style>` precedent as DrawerContent's skeleton keyframes). The token
 * override re-points --bg/--panel/--ink/etc. so the tree's inline
 * `var(...)` styles print white-paper/black-ink, the equivalent of the
 * base block's hardcoded `#fff`/`#111` overrides.
 *
 * FOCUS HANDOFF ON CONTENT SWAP (RPT-05 fix wave): a consumer may swap the
 * OPEN drawer's `title`+`children` wholesale (Reporting's board-log
 * sub-flow — base `boardUpdate`/`boardSave` rebuild the same drawer's DOM,
 * source 3577-3593). When the focused element unmounts in such a swap,
 * focus fell to `document.body` — outside the dialog subtree — so Tab
 * walked the inert page behind an open aria-modal dialog, violating this
 * file's own documented trap boundary. Fixed: whenever `title` changes
 * while the drawer is open, initial focus is re-placed on the (new)
 * heading — which also makes screen readers announce the swapped content,
 * the same announcement the open-time heading focus already provides.
 *
 * SCROLL RESET ON CONTENT SWAP (fix C-unbounded-growth-05; base anchors
 * leapfi-platform.html:1431/1680/2376 — every `showDrawer` path ran
 * `dr.scrollTop=0`, including boardUpdate/boardSave's swaps through
 * closeDrawer();openReport(), source 3577/3592): the drawer's one scroll
 * body ([data-lf-drawer-body]) persists across an in-place content swap,
 * so swapped-in content inherited the previous content's scroll offset
 * and could open mid-document with its fields above the fold. Fixed
 * alongside the RPT-05 focus handoff (same title-change trigger, same
 * base rebuild-the-drawer behavior): the body's scrollTop resets to 0 on
 * every content swap — and on every (re)open, covering the reopen-while-
 * closing path where the body DOM node never unmounted.
 *
 * GEOMETRY & SIZE-TOGGLE (amendment A15, design_system_spec.md §2.8,
 * PI2-D41/PI2-D14/PI2-D13): `DrawerSize` stays the same two-value union.
 * `'wide'` is byte-identical (`min(920px, 97vw)`). `'default'` is amended
 * from the fixed `min(480px, 100vw)` to `min(clamp(480px, 40vw, 720px),
 * 100vw)` — one continuous formula whose floor (`480px`) reproduces the
 * legacy value verbatim on every viewport ≤1200px and grows fluidly with
 * viewport width above that, capped at `720px`. The Drawer now owns a
 * `sizeState` runtime state (PI2-D14) driving the actually-rendered
 * geometry; the `size` PROP names only the size a session OPENS at. A
 * header size-toggle Button (between the heading and the close Button)
 * lets the user flip `sizeState` between `'default'`/`'wide'` at runtime.
 *
 * `sizeState` reseed rule, exactly as spec'd: a transition from `open`
 * false→true reseeds `sizeState` from the current `size` prop (a fresh
 * open never inherits a prior session's user-toggled size — AC-A15-6).
 * `sizeState` is explicitly NOT reset by an in-drawer content swap
 * (RPT-05's `title`-only change, still handled by the effect above,
 * unmodified) — a user's manual toggle is a reading-comfort preference
 * that survives a swapped-in document, not a per-content setting.
 *
 * RECONCILIATION WITH RPT-03 (load-bearing, flagged in the evidence
 * return for review): Reporting.tsx's board-log sub-flow swaps its `size`
 * PROP itself (not just `title`) between `'wide'` (report) and
 * `'default'` (the board-log form) on the SAME open Drawer instance,
 * never toggling `open` to false — a case the §2.8 state-machine table
 * (which only names 4 transitions: two toggle presses, close, and the
 * closed→open reseed) does not literally enumerate. To keep that
 * pre-existing, dispatch-preserved behavior (reporting_fix_wave.test.tsx
 * "RPT-03") passing without contradicting "sizeState is NOT reset by a
 * content swap," `sizeState` also re-syncs whenever the `size` PROP's
 * VALUE itself changes (a second, independent effect, decoupled from the
 * title-keyed RPT-05 effect above) — i.e. an explicit new size REQUEST
 * from the consumer always wins, the same way a fresh open does; only a
 * same-size re-render (or a title-only swap) leaves a user's manual
 * toggle alone. This is a mechanism choice to satisfy two independently-
 * binding requirements (the §2.8 ACs and the preserved RPT-03 suite)
 * that are otherwise both fully specified already — not a new externally
 * visible interaction the spec left open — but is called out explicitly
 * here and in the evidence return since the state-machine table itself
 * is silent on this exact transition.
 */
import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { Button } from './primitives/Button';

export type DrawerPhase = 'closed' | 'opening' | 'open' | 'closing';

/** Base `.drawer` / `.drawer.wide` widths (source lines 324/326; the default
 * width predates this fix wave and is kept as shipped). */
export type DrawerSize = 'default' | 'wide';

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
  /** Width variant — `'wide'` is the base engine's `.wide` modifier
   * (`min(920px, 97vw)`, source line 326), required by
   * parity_ia_addendum.md §1.3/§6 for Reporting's report drawer. Omit for
   * the default width every existing call site already renders (RPT-03:
   * backward-compatible; other screens' usage is untouched). */
  size?: DrawerSize;
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

/** Port of the base drawer-only print stylesheet (source line 758):
 * `@media print{body *{visibility:hidden}.drawer,.drawer *{visibility:visible}
 * .drawer{position:absolute;top:0;left:0;width:100%!important;height:auto;...}
 * .scrim{display:none!important}.dclose,.repbar{display:none!important}}`.
 * Selector mapping: `.drawer` → [data-lf-composite='drawer'], `.scrim` →
 * [data-lf-composite='drawer-scrim'], `.dclose` → [data-lf-drawer-close],
 * `.repbar` (the print-button bar; here the footer slot that hosts
 * "Print / Save as PDF") → [data-lf-drawer-footer]. The base's hardcoded
 * white-paper/black-ink overrides (`background:#fff!important;
 * color:#111!important`) are expressed as a print-scoped token override so
 * every descendant's inline `var(--ink)`/`var(--panel)` style resolves to
 * print colors. Overflow is forced visible on the drawer's scroll body and
 * the report tables' own `overflow-x:auto` wrappers so content paginates
 * instead of clipping at the viewport fold (base `.drawer{overflow:visible}`).
 *
 * ACCENT OVERRIDE (T7 brand-audit fix, brief-cited F2/FORB-1 — see the
 * implementer's evidence return for a citation-mismatch note against the
 * repo's actual brand_audit.md, whose own F2/F8/F14 are unrelated findings
 * about a different document; the underlying defect below was independently
 * verified against this file): the port above never repointed `--accent`.
 * Dark mode (this app's shipped default, index.html) sets `--accent:
 * #00f2ff` (Brand Cyan) — doctrine's Accessibility section forbids exactly
 * this pair ("Forbidden: Cyan on white"; ~1.3:1 contrast). Content rendered
 * inside the drawer at print time (e.g. views/ReportView.tsx's `docLinkStyle`,
 * `color: 'var(--accent)'`) inherited that unreconciled token straight onto
 * the forced-white print panel — cyan text on white paper. Doctrine's own
 * light-mode token set already resolves this exact tension (LM-PAL-6: Deep
 * Teal `#006D75` is "THE ONLY primary accent in light mode (Cyan excluded)"
 * — printed paper is a light surface); print reuses that same resolution
 * rather than inventing a new one. `--accent2` (Cobalt `#2D5BFF`) is left
 * untouched: doctrine's forbidden-pairs list names Cyan-on-white only, and
 * light mode itself carries Cobalt through unchanged. */
const PRINT_STYLE = `
@media print {
  :root {
    --bg: #ffffff !important;
    --bg2: #ffffff !important;
    --panel: #ffffff !important;
    --border: #cccccc !important;
    --ink: #111111 !important;
    --ink2: #333333 !important;
    --ink3: #555555 !important;
    /* FORB-1 fix — see the ACCENT OVERRIDE note above this constant. */
    --accent: #006d75 !important;
  }
  body * { visibility: hidden; }
  [data-lf-composite='drawer'], [data-lf-composite='drawer'] * { visibility: visible; }
  [data-lf-composite='drawer'] {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: auto !important;
    bottom: auto !important;
    width: 100% !important;
    height: auto !important;
    box-shadow: none !important;
    border: 0 !important;
    overflow: visible !important;
    transform: none !important;
    background: #ffffff !important;
    color: #111111 !important;
  }
  [data-lf-drawer-body] { overflow: visible !important; height: auto !important; }
  [data-lf-drawer-body] div { overflow: visible !important; }
  [data-lf-composite='drawer-scrim'] { display: none !important; }
  [data-lf-drawer-close], [data-lf-drawer-size-toggle], [data-lf-drawer-footer] { display: none !important; }
}
`;

export function Drawer({ open, title, onClose, children, footer, size = 'default' }: DrawerProps) {
  const headingId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [phase, setPhase] = useState<DrawerPhase>('closed');
  // A15 — the runtime size the drawer actually renders at (PI2-D14: Drawer
  // owns this state machine). Seeded from `size` at mount; reseeded below
  // whenever `open` transitions false->true, or the `size` prop's value
  // itself changes (see the "RECONCILIATION WITH RPT-03" file-header note).
  const [sizeState, setSizeState] = useState<DrawerSize>(size);

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

  // A15 — `sizeState` reseed. Fires on a fresh open (`open` false->true,
  // per the §2.8 state machine's own closed->open row) AND whenever the
  // consumer's `size` prop value itself changes while already open (the
  // RPT-03 reconciliation, file header above) — deliberately NOT keyed on
  // `title`, so the separate RPT-05 content-swap effect below never
  // touches `sizeState`.
  useEffect(() => {
    if (open) setSizeState(size);
  }, [open, size]);

  const handleToggleSize = () => {
    setSizeState((current) => (current === 'wide' ? 'default' : 'wide'));
  };

  // opening -> open on the next paint (lets the enter transition animate),
  // then move initial focus to the heading (C7 a11y baseline).
  useEffect(() => {
    if (phase !== 'opening') return;
    // C-unbounded-growth-05: base showDrawer `dr.scrollTop=0` (1431/1680/
    // 2376) — a reopen while the exit transition is still running reuses
    // the same body DOM node, so the offset must be reset explicitly.
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
    const raf = window.requestAnimationFrame(() => {
      setPhase('open');
      headingRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [phase]);

  // RPT-05 (fix wave): in-drawer content swap — the consumer replaced
  // `title`+`children` while the drawer stayed open (Reporting's board-log
  // sub-flow, base boardUpdate/boardSave 3577-3593). The previously focused
  // element unmounts in that swap, dropping focus to document.body and out
  // of the trap; re-place initial focus on the new heading, which also makes
  // AT announce the swapped content by its new accessible name.
  const prevTitleRef = useRef(title);
  useEffect(() => {
    if (prevTitleRef.current === title) return;
    prevTitleRef.current = title;
    if (phase === 'open' || phase === 'opening') {
      // C-unbounded-growth-05: swapped-in content must open at the top —
      // the persistent body node otherwise inherits the previous content's
      // scroll offset (base showDrawer reset, 1431/1680/2376).
      if (bodyRef.current) bodyRef.current.scrollTop = 0;
      headingRef.current?.focus();
    }
  }, [title, phase]);

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
      <style>{PRINT_STYLE}</style>
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
        data-size={sizeState}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          // Base `.drawer.wide{width:min(920px,97vw)}` (source 326) — RPT-03.
          // 'default' amended by A15 (§2.8): min(clamp(480px, 40vw, 720px),
          // 100vw) — floor reproduces the legacy 480px value verbatim on
          // every viewport ≤1200px; grows fluidly above that, capped 720px.
          width: sizeState === 'wide' ? 'min(920px, 97vw)' : 'min(clamp(480px, 40vw, 720px), 100vw)',
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
          {/* A15 (§2.8) — size-toggle: DOM order heading -> toggle -> close.
              print-hidden like the close Button (data-lf-drawer-size-toggle). */}
          <span data-lf-drawer-size-toggle>
            <Button
              variant="ghost"
              icon={sizeState === 'wide' ? 'collapse' : 'expand'}
              label={sizeState === 'wide' ? 'Collapse' : 'Expand'}
              pressed={sizeState === 'wide'}
              onPress={handleToggleSize}
            />
          </span>
          {/* data-lf-drawer-close: print-hidden, the base `.dclose` (RPT-01). */}
          <span data-lf-drawer-close>
            <Button variant="ghost" icon="close" label="Close" onPress={onClose} />
          </span>
        </div>
        <div ref={bodyRef} data-lf-drawer-body style={{ flex: '1 1 auto', overflowY: 'auto', padding: '1.25rem' }}>{children}</div>
        {footer ? (
          <div
            data-lf-drawer-footer
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
