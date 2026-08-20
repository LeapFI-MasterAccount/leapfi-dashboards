/**
 * FilterBar — Composite C5 (design_system_spec.md §2.2)
 *
 * Built from Button (`ghost`, P2) as each filter group's dropdown trigger,
 * and Chip (`filter` variant, P5, count-labeled) as the option toggles
 * inside the opened panel. Composite state: "dropdown open/closed per
 * filter" — tracked here (which group's panel is open), never inside
 * Button/Chip themselves, which stay stateless about disclosure. Selection
 * state (`selectedIds`) is fully controlled by the screen that owns the
 * filtered data — §5.2/§5.3 name FilterBar as feeding a DataTable the
 * screen itself filters, so FilterBar only reports which option id was
 * toggled via `onToggle`, never owns the selected set.
 *
 * AMBIGUITY RESOLVED — "listbox/button disclosure" vs. Chip's fixed
 * toggle-button semantics: the C5 a11y baseline reads "each dropdown is a
 * proper `listbox`/button disclosure." Chip (P5, `primitives/Chip.tsx`) is
 * already spec'd (§2.1 P5) as a toggle **button** with `aria-pressed` for
 * the `filter` variant, not an `option`-role element. Giving the panel
 * `role="listbox"` around `aria-pressed` button children would be an
 * invalid ARIA parent/child pairing (`listbox` requires `option` children
 * with `aria-selected` — a different, competing selection model from the
 * toggle-button model P5 already committed to). I built the "button
 * disclosure" half literally (a trigger Button that shows/hides a panel)
 * and rendered the panel as `role="group"` — a labelled group of toggle
 * buttons — the ARIA-valid pattern that matches Chip's already-fixed
 * semantics, rather than reading "listbox" literally.
 *
 * STOP-ITEM / cross-file gap — Button (P2, `primitives/Button.tsx`) exposes
 * a fixed prop set (`label`, `variant`, `icon`, `onPress`, `disabled`,
 * `loading`, `type`) with no ARIA passthrough and no forwarded `ref`, so
 * this file cannot attach `aria-expanded` / `aria-haspopup` / `aria-controls`
 * to the actual `<button>` DOM node Button renders, and cannot imperatively
 * focus that node on close. Both are standard requirements for a
 * disclosure trigger and are named directly either in this composite's own
 * a11y baseline ("listbox/button disclosure") or in the sibling C4 baseline
 * this pattern is modeled on ("ProfileMenu ... button `aria-expanded`").
 * Mitigations applied entirely within this file's own allowlist boundary,
 * without modifying Button.tsx:
 *   1. A visually-hidden `aria-live="polite"` status string per bar
 *      announces "<group> filters expanded/collapsed" on toggle, giving
 *      assistive-tech users the state-change information `aria-expanded`
 *      would normally carry.
 *   2. On open, focus moves into the panel (the first Chip), via a
 *      `useEffect` keyed on which group is open, so keyboard users land
 *      somewhere meaningful without relying on `aria-expanded`.
 *   3. On close via Escape, focus is restored to the trigger by querying
 *      the DOM `<button>` inside a wrapper `<span>` this file owns and refs
 *      directly — not by asking Button.tsx for a ref it does not expose.
 * Properly fixing this needs a prop-surface change to Button.tsx (e.g. an
 * ARIA-attribute passthrough or a forwarded ref), which is outside this
 * dispatch's allowlist — flagged for the Button.tsx-owning lane rather than
 * reached-around by editing a file outside this dispatch's scope.
 *
 * T5 FIX (live defect — "huge floating tower of stacked pill Chips
 * overlapping page content", reported against OnSideFeed's "Regulatory
 * feed" screen, Source group, 15 SRC_ROWS options) — this file's panel
 * previously had no `maxWidth`, no `maxHeight`/scroll, and laid its
 * (44px-tall, pill-shaped) option Chips out with `flexWrap: 'wrap'` and
 * no width tied to the trigger that opened it: with 12+ options that
 * produced exactly the reported "tower" — a wide-open, unbounded box that
 * could sprawl over or past unrelated page content. Two changes, both
 * scoped to this file (+ an additive, backward-compatible `density` prop
 * on Chip, primitives/Chip.tsx):
 *   1. Panel geometry — `panelStyle` now lays options out as a vertical,
 *      non-wrapping menu list (`flexDirection: 'column'`), width
 *      `minWidth: '100%'` (100% of `groupWrapStyle`'s content box, which
 *      resolves to the trigger's own rendered width — the trigger is the
 *      only in-flow child once the panel is excluded from flow by its own
 *      `position: absolute`, so this is a real per-group tie to the
 *      trigger that opened it, not a fixed magic number) capped at
 *      `maxWidth: 'min(22rem, 90vw)'`, and `maxHeight: '24rem'` with
 *      `overflowY: 'auto'` so a 12+-option list scrolls internally
 *      instead of growing the box without bound. `zIndex` raised 10→50 to
 *      match every other utility-disclosure panel already shipped in this
 *      codebase (`Topbar.tsx` ProfileMenu, `NotificationBellPanel.tsx`) —
 *      previously the odd one out at 10, which is also part of "correct
 *      ... z-order" for a panel meant to sit above ordinary page content.
 *      `maxHeight`/`overflowY`/width-cap are lifted directly from
 *      `NotificationBellPanel.tsx`'s already-shipped `panelStyle` (same
 *      C4-sibling utility-disclosure shape); `padding: '0.375rem'` and
 *      `borderRadius: 'var(--radius-sm, 6px)'` likewise match that panel
 *      and `Topbar.tsx`'s ProfileMenu list container exactly.
 *   2. Row density — panel options now render `<Chip density="compact">`
 *      (new, additive, default-`'default'` prop on Chip; every other Chip
 *      caller in this codebase is unmodified) instead of the 44px
 *      primary-weight pill: a 32px-tall, left-aligned, full-width menu row
 *      matching `Topbar.tsx`'s `MenuButtonItem` / `NotificationBellPanel`
 *      row precedent and the v1 reference's own compact filter-chip
 *      density (`leapfi-platform.html`, pin 1c230fe, `.dchip`). See
 *      Chip.tsx's own file header for the full sourcing and the contrast
 *      math on why `compact` hover uses `--bg2` (never `--panel`).
 * Both changes are made once, here and in Chip.tsx, so all 7 FilterBar
 * consumers get the fix uniformly — none of the 7 needed a source change
 * of their own (`groups` prop is unchanged; no consumer had to adapt).
 *
 * Click-outside-to-close — REVISED from "deliberately not implemented"
 * (this file's earlier state) to implemented, matching the dispatch's
 * explicit requirement and this codebase's own established disclosure
 * precedent: `Topbar.tsx`'s ProfileMenu and `NotificationBellPanel.tsx`
 * both already close on an outside `mousedown` in addition to Escape (the
 * latter's own header even calls it "Port of ProfileMenu's own open/close
 * effect"), so a C5 "proper ... disclosure" sitting beside two sibling
 * disclosures that both already behave this way was the actual gap, not
 * scope creep beyond it. Implemented identically below: a `mousedown`
 * listener, active only while a group is open, that closes on any target
 * outside both the open panel and its own trigger.
 */
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import { Button } from './primitives/Button';
import { Chip } from './primitives/Chip';
import { PANEL_STYLE } from '../theme/panelStyle';

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: readonly FilterOption[];
  selectedIds: readonly string[];
  onToggle: (optionId: string) => void;
}

export interface FilterBarProps {
  groups: readonly FilterGroup[];
}

const barStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  gap: '0.75rem',
};

const groupWrapStyle: CSSProperties = {
  position: 'relative',
  display: 'inline-flex',
  flexDirection: 'column',
};

// Geometry contract — see file header "T5 FIX" note for full sourcing.
// `minWidth: 'max(100%, 14rem)'` ties the panel to the trigger that
// opened it (the `100%` term — 100% of `groupWrapStyle`'s content box,
// which, panel excluded from flow by its own `position: absolute`,
// resolves to the trigger's own rendered width) while guaranteeing a
// readable floor for short triggers with long option labels (the `14rem`
// term — this file's own pre-fix value, kept as the floor rather than
// invented fresh). AMBIGUITY CAUGHT LIVE, not just reasoned about: an
// earlier version of this fix used a bare `minWidth: '100%'` with no
// floor and, verified against the running app (OnSideFeed's real "Source"
// trigger — a short, unselected "Source" label), rendered a panel exactly
// as narrow as that trigger, wrapping every long source name onto 3-4
// lines each — a narrower but equally tall "tower," not the fix. `max()`
// closes that gap: whichever of the two is larger wins, so a wide trigger
// (e.g. "Source (5)") still genuinely constrains the panel, and a narrow
// one never crushes long option text. `maxWidth` then caps the other end
// so a long option label can never sprawl the panel past a sane menu
// width or off a narrow viewport; `maxHeight` + `overflowY` bound a
// 12+-option list to internal scroll instead of unbounded vertical growth
// (both values match `NotificationBellPanel.tsx` panelStyle exactly —
// same C4-sibling utility-disclosure shape).
const panelStyle: CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 0.4rem)',
  left: 0,
  zIndex: 50,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.125rem',
  minWidth: 'max(100%, 14rem)',
  maxWidth: 'min(22rem, 90vw)',
  maxHeight: '24rem',
  overflowY: 'auto',
  boxSizing: 'border-box',
  padding: '0.375rem',
  ...PANEL_STYLE,
  borderRadius: 'var(--radius-sm, 6px)',
};

// Visually-hidden recipe — `top`/`left` pinned to 0 is load-bearing;
// see the invariant note on `DataTable.tsx`'s `srOnlyStyle`. Without it
// an unpositioned absolute box falls back to its in-flow static
// position, which can extend `html.scrollHeight` past whatever
// scroll container this composite is rendered inside.
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

export function FilterBar({ groups }: FilterBarProps) {
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const triggerWrapRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const panelRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Mitigation (2): move focus into the just-opened panel once it has
  // actually mounted (after the commit this effect runs in).
  useEffect(() => {
    if (!openGroupId) return;
    const panel = panelRefs.current[openGroupId];
    const firstChip = panel?.querySelector('button');
    firstChip?.focus();
  }, [openGroupId]);

  const closeGroup = (groupId: string, restoreFocus: boolean) => {
    setOpenGroupId((current) => (current === groupId ? null : current));
    const group = groups.find((candidate) => candidate.id === groupId);
    if (group) setAnnouncement(`${group.label} filters collapsed`);
    // Mitigation (3): restore focus to the trigger's real DOM button via
    // our own wrapper ref, since Button.tsx forwards none.
    if (restoreFocus) {
      const wrap = triggerWrapRefs.current[groupId];
      wrap?.querySelector('button')?.focus();
    }
  };

  const openGroup = (groupId: string) => {
    setOpenGroupId(groupId);
    const group = groups.find((candidate) => candidate.id === groupId);
    if (group) setAnnouncement(`${group.label} filters expanded`);
  };

  // Outside-click-to-close (T5 fix; see file header "Click-outside-to-
  // close" note) — mirrors Topbar.tsx's ProfileMenu / NotificationBellPanel
  // .tsx's own identical effect: active only while a group is open, closes
  // on any pointerdown whose target lands outside both the open panel and
  // its own trigger. No focus restore here, matching both precedents —
  // Escape (the panel's own onKeyDown, below) is the dismiss path that
  // restores focus; an outside click has already moved the user's
  // attention elsewhere.
  useEffect(() => {
    if (!openGroupId) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const panel = panelRefs.current[openGroupId];
      const trigger = triggerWrapRefs.current[openGroupId];
      if (panel?.contains(target) || trigger?.contains(target)) return;
      closeGroup(openGroupId, false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [openGroupId]);

  const handleTriggerPress = (groupId: string) => {
    if (openGroupId === groupId) {
      closeGroup(groupId, false);
    } else {
      openGroup(groupId);
    }
  };

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>, groupId: string) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      closeGroup(groupId, true);
    }
  };

  return (
    <div role="group" aria-label="Filters" data-lf-composite="filter-bar" style={barStyle}>
      {/* Mitigation (1): stands in for the aria-expanded announcement the
          trigger Button can't carry (see STOP-item above). */}
      <span aria-live="polite" style={srOnlyStyle}>
        {announcement}
      </span>
      {groups.map((group) => {
        const isOpen = openGroupId === group.id;
        const selectedCount = group.selectedIds.length;
        const triggerLabel = selectedCount > 0 ? `${group.label} (${selectedCount})` : group.label;

        return (
          <div key={group.id} style={groupWrapStyle} data-lf-filter-group={group.id} data-open={isOpen}>
            <span
              ref={(el) => {
                triggerWrapRefs.current[group.id] = el;
              }}
            >
              <Button
                variant="ghost"
                label={triggerLabel}
                icon="chevron-down"
                onPress={() => handleTriggerPress(group.id)}
              />
            </span>
            {isOpen ? (
              <div
                ref={(el) => {
                  panelRefs.current[group.id] = el;
                }}
                role="group"
                aria-label={`${group.label} filter options`}
                style={panelStyle}
                onKeyDown={(event) => handlePanelKeyDown(event, group.id)}
              >
                {group.options.map((option) => (
                  <Chip
                    key={option.id}
                    text={option.count !== undefined ? `${option.label} (${option.count})` : option.label}
                    variant="filter"
                    density="compact"
                    selected={group.selectedIds.includes(option.id)}
                    onPress={() => group.onToggle(option.id)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
