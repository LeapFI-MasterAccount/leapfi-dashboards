/**
 * SidebarItem — Composite C2 (design_system_spec.md §2.2, §3.1)
 *
 * "Icon + Label + optional nested chevron Icon + optional count Tag."
 * Variants: top-level, nested (one level only). States: default, hover,
 * focus (`--focus-ring`), active/current, expanded/collapsed (parent
 * items only).
 *
 * This component renders exactly one row — either a top-level item or a
 * one-level-nested child item. It does not recurse into a further nested
 * list itself: `Sidebar.tsx` (C3) owns composing the tree (§3.1's ≤7-item,
 * ≤1-nesting-level structure), so a third level is structurally
 * unreachable from this file rather than merely discouraged by comment —
 * matching the Talon-derived rule this spec cites ("No third-level nav
 * anywhere").
 *
 * a11y baseline (spec C2 row): current item marked `aria-current="page"`;
 * expand/collapse state exposed via `aria-expanded` on the parent item
 * (only rendered when the item is itself expandable — a leaf item has no
 * `aria-expanded` at all, per the WAI-ARIA disclosure pattern, rather than
 * a stray `false` on a control that never expands).
 *
 * SPLIT-CONTROL MODE (fix B-dead-interactions-11; base anchor
 * leapfi-platform.html:803 os-modlink `go('connect')`): when the owning
 * Sidebar passes `onChevronPress`, this row renders as TWO controls —
 * the main row button (label press: whatever `onPress` does, for a
 * navigable group header that is navigate-and-expand) and a separate
 * chevron button that ONLY toggles expansion. The disclosure semantics
 * (`aria-expanded`/`aria-controls`) move to the chevron button, which is
 * the actual disclosure control in this mode; the main button keeps
 * `aria-current`. Nested <button>s are invalid HTML, hence the sibling
 * split rather than a chevron-inside-the-row-button. Without
 * `onChevronPress` the row renders exactly as before (single button,
 * press = `onPress`, chevron decorative inside it) — every existing
 * call site is untouched. See Sidebar.tsx "C3 CONTRACT CHANGE" for the
 * design_system reconciliation flag.
 *
 * AMBIGUITY / STOP-ITEM (nav icon vocabulary gap): spec C2 requires an
 * Icon on every SidebarItem row, but `primitives/Icon.tsx`'s `IconName`
 * union (built by a concurrent, non-allowlisted dispatch) is a deliberately
 * closed set scoped to bell / chevrons / close / arrow-right / check /
 * lock / calendar — it contains no glyph for Home, OnSide, Studio,
 * Connect, Reporting, or Settings (the seven top-level nav destinations
 * §3.1 / PI2-D39 require). `icon` is left optional here (typed against the
 * existing closed `IconName` union) so this component is forward-
 * compatible the moment nav glyphs are added there, but
 * `Sidebar.tsx`'s static nav table in this dispatch does not pass an
 * `icon` for any top-level item, since inventing new IconName members
 * would mean writing into `primitives/Icon.tsx`, which is outside this
 * dispatch's allowlist. Flagging for the Icon-primitive owner or a spec
 * update, not silently inventing glyph shapes.
 *
 * DISABLED ROW + COMING SOON MARKER (PI2-D39, settled user decision —
 * Connect and Vantage promoted to disabled top-level nav items): new
 * `disabled?: boolean` prop, implemented with the SAME mechanism P2
 * Button already uses for its own `disabled` state (`Button.tsx` —
 * native `disabled` attribute + a `handleClick` early-return guard +
 * `cursor: not-allowed`), not an invented one:
 *   - Native `disabled` on the row's own `<button>`: the browser (1)
 *     never fires a click/activation for it — the only mechanism this
 *     file needs to guarantee "does not navigate when clicked" — (2)
 *     removes it from the sequential Tab order (`tabIndex` reads -1 on a
 *     disabled form control, no explicit `tabindex` needed), satisfying
 *     "not reachable by keyboard as an actionable control," and (3) is
 *     exposed to assistive tech as an unavailable control by the
 *     platform accessibility tree — the same guarantee `toBeDisabled()`
 *     (jest-dom) checks, and the same reason the spec's own P2 Button row
 *     lists `disabled` as a first-class state rather than a CSS-only one.
 *     `handleClick`'s own early-return is defense-in-depth (matches
 *     Button.tsx's `isDisabled` guard) — the persona's "a disabled
 *     button is UX courtesy, not the guarantee" principle is about
 *     irreversible-action idempotency (a request-key concern); a nav
 *     item that cannot navigate at all has no such request to
 *     deduplicate, so native `disabled` here fully carries the
 *     guarantee, not merely assists it.
 *   - Text/icon color dims to `--ink3` when disabled — reusing the exact
 *     token `Icon.tsx`'s own `disabled` tone already resolves to, and
 *     the same token P4 Tag's `locked` variant already uses for its own
 *     "Soon" styling (`Tag.tsx` `VARIANT_STYLE.locked`) — not a new
 *     dimming mechanism.
 *   - "Coming Soon" marker: rendered as a `Tag` (P4) `locked`-variant
 *     pill inside the row, alongside the existing optional `count` Tag
 *     slot — the same primitive/variant SetupCard (C15) and SoonSplash
 *     (C16) already use for "Soon splash entries" (design_system_spec.md
 *     §2.2 C15/C16), not an invented visual. Text is "Coming Soon" (no
 *     literal parens) — the pill's own visual separation from the label
 *     already carries the "this is a qualifier, not the item's name"
 *     meaning parens would otherwise supply, matching how the `count`
 *     Tag beside it never wraps its number in parens either. Because the
 *     Tag is un-suppressed content inside the row's own `<button>`, its
 *     text becomes part of that button's accessible NAME (e.g. "Connect
 *     Coming Soon"), which is a feature, not a leak: it hands an
 *     assistive-tech user the "why" in the same announcement as the
 *     disabled state — never a color-only cue. Rendering only when
 *     `disabled` is true (no separate `comingSoon` prop): every call
 *     site in this dispatch needs the two together, and no call site
 *     needs one without the other; decoupling them into two independent
 *     props would be an unused knob nobody asked for.
 */
import { useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { Icon } from './primitives/Icon';
import type { IconName } from './primitives/Icon';
import { Tag } from './primitives/Tag';

export type SidebarItemLevel = 'top' | 'nested';

export interface SidebarItemProps {
  /** Stable id, also used to derive `aria-controls` linkage for the nested list this row governs (when expandable). */
  id: string;
  label: string;
  /** See ambiguity note above — the closed IconName vocabulary currently has no matching nav glyphs. */
  icon?: IconName | undefined;
  /** Defaults to 'top'. Nested rows render indented, with no chevron and no further children. */
  level?: SidebarItemLevel;
  /** This exact row is the active screen (`aria-current="page"`). */
  current?: boolean;
  /** Optional count Tag (spec C2 "optional count Tag") — e.g. an unread/pending count for this section. */
  count?: number;
  /** True for a top-level parent row that owns a nested list (Home/Reporting have none; OnSide/Studio/Settings do). */
  expandable?: boolean;
  /** Required (and only meaningful) when `expandable` — current expand/collapse state. */
  expanded?: boolean;
  /** Leaf row: navigate. Parent row: toggle expand/collapse — or, for a
   * navigable group header (split-control mode), navigate-and-expand.
   * Sidebar.tsx decides which per §3.1's structure. */
  onPress: () => void;
  /** Split-control mode (B-11, see file header): when supplied, the chevron
   * becomes its own sibling button that fires this (toggle-only) instead of
   * `onPress`, and carries the `aria-expanded`/`aria-controls` disclosure
   * semantics. Only meaningful with `expandable`. */
  onChevronPress?: () => void;
  /** PI2-D39 (see file header "DISABLED ROW + COMING SOON MARKER"): renders
   * this row as unavailable — native `disabled` on the row's own button,
   * dimmed `--ink3` text/icon color, and an in-row "Coming Soon" Tag
   * (`locked` variant). Defaults to false; every existing call site is
   * unchanged. */
  disabled?: boolean;
}

/** Shared id-derivation so Sidebar.tsx's nested <ul id=...> and this row's aria-controls never drift apart. */
export function sidebarNestedListId(topItemId: string): string {
  return `sidebar-nested-${topItemId}`;
}

const ROW_BASE_STYLE: CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  boxSizing: 'border-box',
  gap: '0.6rem',
  minHeight: 44,
  border: '1px solid transparent',
  borderRadius: 'var(--radius-sm, 6px)',
  font: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
  outline: 'none',
  transition: 'background-color 120ms ease, color 120ms ease, border-color 120ms ease, box-shadow 120ms ease',
};

const LEVEL_STYLE: Record<SidebarItemLevel, CSSProperties> = {
  top: {
    padding: '0.625rem 0.75rem',
    fontSize: '0.9375rem',
    fontWeight: 600,
  },
  nested: {
    padding: '0.5rem 0.75rem 0.5rem 2.25rem',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
};

export function SidebarItem({
  id,
  label,
  icon,
  level = 'top',
  current = false,
  count,
  expandable = false,
  expanded = false,
  onPress,
  onChevronPress,
  disabled = false,
}: SidebarItemProps) {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);
  // Split-control mode only (B-11): the chevron button's own transient state.
  const [chevronHover, setChevronHover] = useState(false);
  const [chevronFocused, setChevronFocused] = useState(false);

  const background = pressed ? 'var(--border)' : hover || current ? 'var(--panel)' : 'transparent';
  // PI2-D39: disabled dims to `--ink3` — same token Icon.tsx's own
  // `disabled` tone and Tag's `locked` variant already resolve to (file
  // header "DISABLED ROW + COMING SOON MARKER").
  const color = disabled ? 'var(--ink3)' : current ? 'var(--accent)' : 'var(--ink)';
  const iconTone = disabled ? 'disabled' : current ? 'interactive' : 'default';

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    // Defense-in-depth, matches Button.tsx's own `isDisabled` guard — the
    // native `disabled` attribute below is the actual guarantee (file
    // header "DISABLED ROW + COMING SOON MARKER").
    if (disabled) return;
    onPress();
  };

  const splitMode = expandable && onChevronPress !== undefined;

  const rowStyle: CSSProperties = {
    ...ROW_BASE_STYLE,
    ...LEVEL_STYLE[level],
    background,
    color,
    borderLeft: current && level === 'top' ? '3px solid var(--accent)' : '3px solid transparent',
    boxShadow: focused ? 'var(--focus-ring)' : 'none',
    // PI2-D39 — same `not-allowed`/`pointer` split Button.tsx already uses.
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  const mainButton = (
    <button
      type="button"
      id={`sidebar-item-${id}`}
      data-lf-composite="sidebar-item"
      data-level={level}
      data-current={current || undefined}
      aria-current={current ? 'page' : undefined}
      // In split mode the CHEVRON button is the disclosure control — the
      // main button is a plain navigation press (see file header).
      aria-expanded={expandable && !splitMode ? expanded : undefined}
      aria-controls={expandable && !splitMode ? sidebarNestedListId(id) : undefined}
      disabled={disabled}
      onClick={handleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={splitMode ? { ...rowStyle, flex: '1 1 auto', minWidth: 0 } : rowStyle}
    >
      {icon ? <Icon name={icon} size={16} tone={iconTone} /> : null}
      <span style={{ flex: '1 1 auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      {typeof count === 'number' ? <Tag text={String(count)} variant="count" /> : null}
      {disabled ? <Tag text="Coming Soon" variant="locked" /> : null}
      {expandable && !splitMode ? <Icon name={expanded ? 'chevron-down' : 'chevron-right'} size={16} tone={iconTone} /> : null}
    </button>
  );

  if (!splitMode) return mainButton;

  return (
    <div data-lf-composite="sidebar-item-split" style={{ display: 'flex', alignItems: 'stretch', gap: '0.125rem' }}>
      {mainButton}
      <button
        type="button"
        aria-label={`${label} sections`}
        aria-expanded={expanded}
        aria-controls={sidebarNestedListId(id)}
        data-lf-composite="sidebar-item-chevron"
        onClick={(event) => {
          event.preventDefault();
          onChevronPress();
        }}
        onMouseEnter={() => setChevronHover(true)}
        onMouseLeave={() => setChevronHover(false)}
        onFocus={() => setChevronFocused(true)}
        onBlur={() => setChevronFocused(false)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 36,
          padding: 0,
          border: '1px solid transparent',
          borderRadius: 'var(--radius-sm, 6px)',
          background: chevronHover ? 'var(--panel)' : 'transparent',
          color,
          cursor: 'pointer',
          outline: 'none',
          boxShadow: chevronFocused ? 'var(--focus-ring)' : 'none',
          transition: 'background-color 120ms ease, box-shadow 120ms ease',
        }}
      >
        <Icon name={expanded ? 'chevron-down' : 'chevron-right'} size={16} tone={iconTone} />
      </button>
    </div>
  );
}
