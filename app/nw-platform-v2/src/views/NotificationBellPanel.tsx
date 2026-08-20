/**
 * NotificationBellPanel — view (parity_ia_addendum.md §1.5 "Shell-level:
 * Notification Bell", Batch 7).
 *
 * Wires `Topbar.tsx`'s already-built `NotificationBell` glyph/badge visual
 * language to real data (`data/cases.ts` NOTIFS) via a disclosure panel
 * anchored under a bell trigger, reusing the exact open/close/Esc-restore
 * pattern `Topbar.tsx`'s own `ProfileMenu` already implements internally
 * (outside-pointerdown close, Escape close + focus restored to the
 * trigger, first-item focus on open) — see "AMBIGUITY RESOLVED — list
 * semantics" below for the one deliberate divergence.
 *
 * WHY THIS FILE OWNS ITS OWN TRIGGER BUTTON, NOT JUST THE PANEL: `Topbar`'s
 * internal `NotificationBell` function is not exported — only `Topbar`
 * itself, `TopbarProps`, `TopbarProfile`, `TopbarProfileMenuItem`,
 * `TopbarBackTarget` are. `Topbar.tsx` is a sibling dispatch's
 * already-shipped file, outside this dispatch's ALLOWLIST (hard rule:
 * never touch sibling agents' files) — it cannot be edited here to export
 * that inner function, add a "notifications slot" (the same shape as its
 * own documented `themeToggleSlot` extension point), or accept a
 * render-prop for the bell's popover. This component is therefore built as
 * a fully self-contained composite — its own bell trigger (same glyph/
 * badge visual language: Icon `bell` + count Tag, matching `Topbar.tsx`'s
 * internal `NotificationBell` pixel-for-pixel) plus the disclosure panel —
 * ready to be swapped in for `Topbar`'s internal bell wholesale, or
 * composed alongside it, once a future dispatch adds a slot/export to
 * `Topbar.tsx`. STOP-item, flagged for whichever dispatch touches
 * `Topbar.tsx` next — parity_ia_addendum.md Batch 7's own "wiring note"
 * already anticipates exactly this ("Topbar.tsx's notificationCount/
 * onOpenNotifications get wired in App.tsx" is named as follow-up
 * integration work, outside every batch's file allowlist, not a gap in
 * this file).
 *
 * DATA REALITY (STOP-item, Core Principle 3 — render server truth,
 * including the unflattering parts): `data/cases.ts`'s `NOTIFS` is reset to
 * `[]` by `seedCases()` and otherwise only ever populated by the base
 * engine's `notify(roleKey,title,cid,kind)` — a controller function tied to
 * case-stage transitions (routing to the CRO, routing to counsel, etc.),
 * correctly excluded from `data/cases.ts`'s data-only port per that file's
 * own header (same category as its already-excluded
 * `toggleTierCommittee`/`setCommitteeName`). No call site anywhere in this
 * worktree calls a `notify()` equivalent, so `NOTIFS` is permanently empty
 * today — this panel's honest, correctly-designed empty state (below) is
 * therefore what it always renders until a future dispatch ports
 * `notify()` call sites onto `Cases.tsx`'s stage-transition pipeline
 * (`performAction`). Not a defect in this file; flagged so a verifier does
 * not mistake the empty panel for a broken filter.
 *
 * CONTRACT GAP (persona Core Principle 2 — "the contract is generated, not
 * remembered"): `data/cases.ts`'s exported `Notif` type is an unconstrained
 * index signature (`{[key: string]: unknown}`), not a real shape — the
 * concrete fields only exist by convention, in the base engine's own
 * `notify()` call sites (`{to, title, cid, kind, when, read}`,
 * leapfi-platform.html ~2610-2631). Rather than trust that shape blindly,
 * `parseNotif` below is a runtime boundary guard: malformed entries are
 * dropped, never rendered as a blank/garbled row. STOP-item for whoever
 * owns `data/cases.ts`: promote `Notif` to a real typed interface once a
 * second consumer needs the same guard duplicated.
 *
 * AMBIGUITY RESOLVED — list semantics, not `role="menu"`: `ProfileMenu`'s
 * items are homogeneous commands ("switch to this persona"), which is why
 * it correctly uses `role="menu"`/`role="menuitem"`. This panel's rows are
 * notification records — two-line content (title, timestamp/case/channel)
 * plus a single `Button` (`row` variant, per this dispatch's brief) that
 * opens the case — not literally a command each, and `Button` (P2) has no
 * `role` passthrough (same documented limitation `FilterBar.tsx` already
 * hit for its own trigger). This file instead renders `role="group"` around
 * a real `<ul role="list">` with one `Button` (`row`) per row — a labelled
 * group of real controls, the same resolution `FilterBar.tsx` already
 * establishes for the identical Button-limitation reason. The open/close/
 * focus/Esc-restore mechanics are still the literal `ProfileMenu` port;
 * only the items' internal ARIA role differs, and only because the content
 * shape differs.
 *
 * Accessibility gate (persona directive 7): trigger is a real `<button>`
 * with `aria-haspopup`/`aria-expanded`/an accessible name that includes the
 * live unread count (never badge-color-only — `ProfileMenu`'s own trigger,
 * built on `Avatar`, carries neither attribute; this file adds both since
 * it authors the trigger markup directly rather than reusing a primitive
 * with no ARIA passthrough, closing a real gap rather than reproducing it).
 * Every row's action is a real `Button` with a name unique per row. Escape
 * closes and restores focus to the trigger; outside-pointerdown closes
 * without moving focus (matches `ProfileMenu`'s own choice).
 *
 * Irreversibility gate (persona directive 6): N/A — this view performs no
 * mutation of its own; `onOpenCase` only navigates into `Cases.tsx`'s
 * existing detail view, whose own `performAction` pipeline is where every
 * irreversible commit (and its double-submit guard) actually lives.
 *
 * STOP-item — no executable test run: matches every sibling file already
 * landed in this worktree — no test runner is installed (`package.json`,
 * outside this dispatch's ALLOWLIST). Verified via `npx tsc --noEmit`
 * against the whole `src/` tree (strict, `exactOptionalPropertyTypes`,
 * `noUncheckedIndexedAccess`) instead.
 */
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Icon } from '../components/primitives/Icon';
import { Tag } from '../components/primitives/Tag';
import { Button } from '../components/primitives/Button';
import { Label } from '../components/primitives/Label';
import type { Notif } from '../data/cases';
import { PANEL_STYLE } from '../theme/panelStyle';

/** Runtime-validated shape of one NOTIFS entry — see file header "CONTRACT GAP." */
export interface BellNotification {
  to: string;
  title: string;
  cid: string;
  kind: 'app' | 'email';
  when: string;
  read: boolean;
}

/** Boundary guard — see file header "CONTRACT GAP." Never throws; drops anything that doesn't match the expected shape rather than rendering it garbled. */
export function parseNotif(raw: Notif): BellNotification | null {
  const to = raw['to'];
  const title = raw['title'];
  const cid = raw['cid'];
  const when = raw['when'];
  const read = raw['read'];
  const kind = raw['kind'];
  if (typeof to !== 'string' || typeof title !== 'string' || typeof cid !== 'string' || typeof when !== 'string' || typeof read !== 'boolean') {
    return null;
  }
  return { to, title, cid, when, read, kind: kind === 'email' ? 'email' : 'app' };
}

/** Role-filtered, parsed view of NOTIFS — the same derivation `myNotifs()`
 * performs in the base engine (source ~2621). Exported so a future
 * `Topbar`/`App.tsx` integration can compute the same unread count this
 * panel's own trigger badge shows, from one source of truth. */
export function filterNotifsForRole(notifs: readonly Notif[], roleKey: string): BellNotification[] {
  const out: BellNotification[] = [];
  for (const raw of notifs) {
    const parsed = parseNotif(raw);
    if (parsed && parsed.to === roleKey) out.push(parsed);
  }
  return out;
}

export interface NotificationBellPanelProps {
  /** `data/cases.ts` NOTIFS, passed through unfiltered — this file does the role filtering (matches `myNotifs()`'s own scoping). */
  notifs: readonly Notif[];
  currentRoleKey: string;
  currentRoleLabel: string;
  /** Row action (Button `row`) — see file header ENTRY-POINT note. Required: whoever composes this view supplies the real handler once `Cases.tsx`'s `initialCaseId` is threaded through `App.tsx` routing (outside every batch's allowlist, per the addendum's own "wiring note" convention). */
  onOpenCase: (caseId: string) => void;
}

const wrapStyle: CSSProperties = { position: 'relative', display: 'inline-flex' };

function triggerStyle(hover: boolean, focused: boolean): CSSProperties {
  return {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
    border: 'none',
    borderRadius: 'var(--radius-sm, 6px)',
    background: hover ? 'var(--panel)' : 'transparent',
    boxShadow: focused ? 'var(--focus-ring)' : 'none',
    cursor: 'pointer',
    outline: 'none',
  };
}

const panelStyle: CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 0.375rem)',
  right: 0,
  width: 'min(22rem, 90vw)',
  maxHeight: '24rem',
  overflowY: 'auto',
  boxSizing: 'border-box',
  ...PANEL_STYLE,
  borderRadius: 'var(--radius-sm, 6px)',
  padding: '0.5rem',
  zIndex: 50,
};

// Layout only — the eyebrow treatment itself (uppercase/tracking/weight/
// color) lives in Label (P3) `eyebrow`, §8 R-1.
const headerStyle: CSSProperties = {
  padding: '0.5rem 0.625rem',
};
const listStyle: CSSProperties = { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.125rem' };
const rowStyle: CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.5rem 0.625rem', borderRadius: 'var(--radius-xs, 4px)' };
const rowTextWrapStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.15rem', minWidth: 0 };
const rowTitleStyle: CSSProperties = { fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)' };
// FIX WAVE (Class C, C1): rendered inside `panelStyle` (spreads
// PANEL_STYLE) — --ink2 fails AA on --panel in light theme; --chart-axis
// is the prescribed panel-seated substitute.
const emptyStyle: CSSProperties = { margin: 0, padding: '0.75rem 0.625rem', fontSize: '0.8125rem', color: 'var(--chart-axis)' };
// Visually-hidden recipe — `top`/`left` pinned to 0 is load-bearing;
// see the invariant note on `DataTable.tsx`'s `srOnlyStyle`. Without it
// an unpositioned absolute box falls back to its in-flow static
// position, which can extend `html.scrollHeight` past whatever
// scroll container this view is rendered inside.
const srOnlyStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export function NotificationBellPanel({ notifs, currentRoleKey, currentRoleLabel, onOpenCase }: NotificationBellPanelProps) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const myNotifs = filterNotifsForRole(notifs, currentRoleKey);
  const unreadCount = myNotifs.filter((n) => !n.read).length;

  // Port of `ProfileMenu`'s own open/close effect (Topbar.tsx): outside
  // pointerdown closes, Escape closes and restores focus to the trigger.
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  // Port of `ProfileMenu`'s own initial-focus effect: first interactive
  // element inside the panel takes focus once it mounts.
  useEffect(() => {
    if (open) {
      const first = panelRef.current?.querySelector<HTMLElement>('button');
      first?.focus();
    }
  }, [open]);

  const accessibleLabel = unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications';

  return (
    <div style={wrapStyle} data-lf-composite="notification-bell-panel">
      <button
        ref={triggerRef}
        type="button"
        aria-label={accessibleLabel}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        data-lf-composite="notification-bell-trigger"
        style={triggerStyle(hover, focused)}
      >
        <Icon name="bell" size={24} tone="default" />
        {unreadCount > 0 ? (
          <span style={{ position: 'absolute', top: 2, right: 2 }}>
            <Tag text={unreadCount > 99 ? '99+' : String(unreadCount)} variant="count" />
          </span>
        ) : null}
      </button>

      {open ? (
        <div ref={panelRef} role="group" aria-label={`Notifications · ${currentRoleLabel}`} data-lf-composite="notification-bell-panel-list" style={panelStyle}>
          {/* A14 (design_system_spec.md §2.7): rendered inside `panelStyle`
              (spreads PANEL_STYLE) — panel-seated. */}
          <div style={headerStyle}>
            <Label text={`Notifications · ${currentRoleLabel}`} variant="eyebrow" surface="panel" />
          </div>
          {myNotifs.length === 0 ? (
            <p style={emptyStyle}>Nothing waiting on you. Cases you are asked to action land here, and by email if the case says so.</p>
          ) : (
            <ul role="list" style={listStyle}>
              {myNotifs.map((notif, index) => (
                <li key={`${notif.cid}-${index}`} style={rowStyle}>
                  <span style={rowTextWrapStyle}>
                    <span style={rowTitleStyle}>{notif.title}</span>
                    <Label text={`${notif.when} · ${notif.cid} · ${notif.kind === 'email' ? 'email + in-app' : 'in-app'}`} variant="body-secondary" surface="panel" />
                  </span>
                  <Button
                    variant="row"
                    label="Open"
                    onPress={() => {
                      setOpen(false);
                      onOpenCase(notif.cid);
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
      <span aria-live="polite" style={srOnlyStyle}>
        {open ? `Notifications panel expanded, ${myNotifs.length} item${myNotifs.length === 1 ? '' : 's'}` : ''}
      </span>
    </div>
  );
}
