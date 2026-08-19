/**
 * Sidebar — Composite C3 (design_system_spec.md §2.2, §3.1)
 *
 * "SidebarItem list (§3.1)." Nav-model classification: flat top-level
 * list, at most one nesting level (Talon system item 1, cited by §3.1).
 * `nav` landmark; minimum a11y bar per spec C3 is standard tab order
 * through visible items (roving arrow-key focus is explicitly optional,
 * not implemented here).
 *
 * Static nav structure — copied verbatim from §3.1's restructure table,
 * not invented:
 *
 *   1. Home                          (no children)
 *   2. OnSide    -> Overview, Regulatory feed, Documents, Ownership
 *   3. Studio    -> Ask, Investment Design, Roadmap
 *   4. Connect   -> AllRailz, Vantage        (expanded by default)
 *   5. Reporting                     (no children)
 *   6. Settings  -> Toggles, About
 *
 * 6 top-level items, within the ≤7 budget §3.1 states with headroom.
 *
 * PARITY-ASSEMBLY ADDITION — OnSide · Overview 4th nested child
 * (parity_ia_addendum.md §0, resolved conservatively there and ratified
 * here by the wiring dispatch that also gives it a `ScreenId` in
 * `App.tsx`): `overview` is added first in OnSide's `children` array,
 * matching the base engine's own `os-sub` ordering (survey_map.md
 * 762-821, `overview` first). This is a pure data addition to the
 * existing `NavChild` literal shape already used by every other nested
 * item here — no new nesting level, no change to `Sidebar`'s click
 * contract or to any of the 3 already-shipped OnSide children.
 *
 * AMBIGUITY RESOLVED — default expand state (§3.1): the spec is explicit
 * that Connect ships expanded by default ("not collapsed-by-default like
 * OnSide/Studio... so the Step-1 gesture still communicates the platform
 * is bigger than what gets demoed") and explicit that OnSide/Studio are
 * collapsed by default. Settings is not mentioned by that clause at all
 * ("existing shallow nesting kept" is the only note). I defaulted
 * Settings to collapsed, matching the OnSide/Studio baseline rather than
 * Connect's stated exception, since the spec only carves the exception
 * out for Connect and gives no basis to extend it to Settings.
 *
 * DESIGN NOTE — group toggle while a child is active (base-faithful per
 * leapfi-platform.html @1c230fe): the base's group toggles collapse an
 * open group even while it owns the active screen — toggleOnsideNav
 * (source 3834) and toggleStudioNav (source 1778) both run
 * `g.classList.toggle('open')` with no active-row guard — and the base's
 * `go()` (source 3801, force-open at 3813–3816) re-opens the destination
 * module's group on every navigation into it. This file ports both
 * halves: (1) a manual override always wins over child-active
 * auto-expand, so the header click visibly collapses/expands and
 * `aria-expanded` always changes — never an inert-yet-enabled toggle;
 * (2) navigating into a group clears any stale collapse override, so
 * the `aria-current="page"` row is always revealed on arrival. An
 * earlier revision instead forced expansion while childActive, which
 * silently swallowed the click into a deferred override that collapsed
 * the group later, after navigating elsewhere (SH-11); this is the
 * base-faithful replacement. Absent any override or child activity, a
 * group falls back to `defaultExpanded`.
 *
 * DESIGN NOTE — footer version string (§3.1 "Footer: version string
 * only"): rendered as a plain token-styled span, not through the `Label`
 * primitive. `--ink3` is named in the token table (§1.1) specifically for
 * "Tertiary text (footer/copyright)," but the `Label` primitive only
 * exposes that color via its `disabled` flag (a semantically unrelated
 * state — this text is not a disabled control). Reusing `disabled` to
 * fish out a color would misrepresent the row's semantics for a cosmetic
 * shortcut, so this file references `var(--ink3)` directly instead —
 * still token-only, no raw hex, per the styling hard rule.
 */
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { SidebarItem, sidebarNestedListId } from './SidebarItem';
import type { IconName } from './primitives/Icon';

interface NavChild {
  id: string;
  label: string;
}

interface NavTopItem {
  id: string;
  label: string;
  icon?: IconName;
  children?: NavChild[];
  defaultExpanded?: boolean;
}

// See file header: icons intentionally omitted (STOP-item — closed
// IconName vocabulary has no matching nav glyphs for these six items).
const NAV: NavTopItem[] = [
  { id: 'home', label: 'Home' },
  {
    id: 'onside',
    label: 'OnSide',
    children: [
      { id: 'onside.overview', label: 'Overview' },
      { id: 'onside.feed', label: 'Regulatory feed' },
      { id: 'onside.documents', label: 'Documents' },
      { id: 'onside.ownership', label: 'Ownership' },
    ],
  },
  {
    id: 'studio',
    label: 'Studio',
    children: [
      { id: 'studio.ask', label: 'Ask' },
      { id: 'studio.investment-design', label: 'Investment Design' },
      { id: 'studio.roadmap', label: 'Roadmap' },
    ],
  },
  {
    id: 'connect',
    label: 'Connect',
    defaultExpanded: true,
    children: [
      { id: 'connect.allrailz', label: 'AllRailz' },
      { id: 'connect.vantage', label: 'Vantage' },
    ],
  },
  { id: 'reporting', label: 'Reporting' },
  {
    id: 'settings',
    label: 'Settings',
    children: [
      { id: 'settings.toggles', label: 'Toggles' },
      { id: 'settings.about', label: 'About' },
    ],
  },
];

export interface SidebarProps {
  /** Id of the current top-level item (leaf, e.g. 'home') or nested item (e.g. 'onside.feed'). */
  activeId: string;
  /** Fires with a leaf item's id — top-level items with children never call this directly (they toggle expand instead). */
  onNavigate: (id: string) => void;
  /** Footer version string (§3.1 "Footer: version string only"). Defaults to the existing engine's value (survey_map.md 762–821). */
  versionLabel?: string;
}

const NAV_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '100%',
  boxSizing: 'border-box',
  background: 'var(--bg2)',
  borderRight: '1px solid var(--border)',
};

const LIST_STYLE: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: '0.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.125rem',
};

const NESTED_LIST_STYLE: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.125rem',
};

const FOOTER_STYLE: CSSProperties = {
  padding: '0.75rem',
  borderTop: '1px solid var(--border)',
};

export function Sidebar({ activeId, onNavigate, versionLabel = 'v 1.071' }: SidebarProps) {
  // Manual collapse/expand overrides, keyed by top-level item id. Absent
  // entries fall back to child-active auto-expand, then `defaultExpanded`.
  // See file header DESIGN NOTE: an override always wins — the base's
  // toggles collapse a group even while it owns the active screen.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  // Base `go()` (source 3813–3816) force-opens the destination's group on
  // every navigation into it. Port: when `activeId` moves into a group
  // that carries a collapse override, clear it so the arrival is visible.
  // (Render-phase derived-state adjustment, not an effect, so the cleared
  // override is applied in the same commit as the navigation itself.)
  const [lastActiveId, setLastActiveId] = useState(activeId);
  if (lastActiveId !== activeId) {
    setLastActiveId(activeId);
    const owningGroup = NAV.find((item) => item.children?.some((child) => child.id === activeId));
    if (owningGroup && overrides[owningGroup.id] === false) {
      setOverrides((prev) => ({ ...prev, [owningGroup.id]: true }));
    }
  }

  const handleToggle = (itemId: string, currentlyExpanded: boolean) => {
    setOverrides((prev) => ({ ...prev, [itemId]: !currentlyExpanded }));
  };

  return (
    <nav aria-label="Primary" data-lf-composite="sidebar" style={NAV_STYLE}>
      <ul style={LIST_STYLE}>
        {NAV.map((item) => {
          const hasChildren = Boolean(item.children && item.children.length > 0);
          const childActive = hasChildren && item.children!.some((child) => child.id === activeId);
          const isCurrentTop = !hasChildren && item.id === activeId;
          const expanded = hasChildren
            ? (overrides[item.id] ?? (childActive || item.defaultExpanded || false))
            : false;

          return (
            <li key={item.id}>
              <SidebarItem
                id={item.id}
                label={item.label}
                icon={item.icon}
                level="top"
                current={isCurrentTop}
                expandable={hasChildren}
                expanded={expanded}
                onPress={() => {
                  if (hasChildren) {
                    handleToggle(item.id, expanded);
                  } else {
                    onNavigate(item.id);
                  }
                }}
              />
              {hasChildren && expanded ? (
                <ul id={sidebarNestedListId(item.id)} aria-label={`${item.label} sections`} style={NESTED_LIST_STYLE}>
                  {item.children!.map((child) => (
                    <li key={child.id}>
                      <SidebarItem
                        id={child.id}
                        label={child.label}
                        level="nested"
                        current={child.id === activeId}
                        onPress={() => onNavigate(child.id)}
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
      <div style={FOOTER_STYLE}>
        <span style={{ color: 'var(--ink3)', fontSize: '0.75rem', fontWeight: 500 }}>{versionLabel}</span>
      </div>
    </nav>
  );
}
