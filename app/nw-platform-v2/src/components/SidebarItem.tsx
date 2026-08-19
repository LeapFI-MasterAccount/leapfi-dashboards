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
 * AMBIGUITY / STOP-ITEM (nav icon vocabulary gap): spec C2 requires an
 * Icon on every SidebarItem row, but `primitives/Icon.tsx`'s `IconName`
 * union (built by a concurrent, non-allowlisted dispatch) is a deliberately
 * closed set scoped to bell / chevrons / close / arrow-right / check /
 * lock / calendar — it contains no glyph for Home, OnSide, Studio,
 * Connect, Reporting, or Settings (the six top-level nav destinations
 * §3.1 requires). `icon` is left optional here (typed against the
 * existing closed `IconName` union) so this component is forward-
 * compatible the moment nav glyphs are added there, but
 * `Sidebar.tsx`'s static nav table in this dispatch does not pass an
 * `icon` for any top-level item, since inventing new IconName members
 * would mean writing into `primitives/Icon.tsx`, which is outside this
 * dispatch's allowlist. Flagging for the Icon-primitive owner or a spec
 * update, not silently inventing glyph shapes.
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
  /** True for a top-level parent row that owns a nested list (Home/Reporting have none; OnSide/Studio/Connect/Settings do). */
  expandable?: boolean;
  /** Required (and only meaningful) when `expandable` — current expand/collapse state. */
  expanded?: boolean;
  /** Leaf row: navigate. Parent row: toggle expand/collapse. Sidebar.tsx decides which per §3.1's structure. */
  onPress: () => void;
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
}: SidebarItemProps) {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);

  const background = pressed ? 'var(--border)' : hover || current ? 'var(--panel)' : 'transparent';
  const color = current ? 'var(--accent)' : 'var(--ink)';
  const iconTone = current ? 'interactive' : 'default';

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onPress();
  };

  return (
    <button
      type="button"
      id={`sidebar-item-${id}`}
      data-lf-composite="sidebar-item"
      data-level={level}
      data-current={current || undefined}
      aria-current={current ? 'page' : undefined}
      aria-expanded={expandable ? expanded : undefined}
      aria-controls={expandable ? sidebarNestedListId(id) : undefined}
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
      style={{
        ...ROW_BASE_STYLE,
        ...LEVEL_STYLE[level],
        background,
        color,
        borderLeft: current && level === 'top' ? '3px solid var(--accent)' : '3px solid transparent',
        boxShadow: focused ? 'var(--focus-ring)' : 'none',
      }}
    >
      {icon ? <Icon name={icon} size={16} tone={iconTone} /> : null}
      <span style={{ flex: '1 1 auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      {typeof count === 'number' ? <Tag text={String(count)} variant="count" /> : null}
      {expandable ? <Icon name={expanded ? 'chevron-down' : 'chevron-right'} size={16} tone={iconTone} /> : null}
    </button>
  );
}
