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
 * Not implemented, deliberately: click-outside-to-close. Nothing in the C5
 * row or its a11y baseline names it, and the two disclosure interactions
 * the baseline does name (the trigger button toggle, and — per the
 * STOP-item above — Escape-to-close) are both implemented; adding
 * additional interaction surface beyond what the spec asks for is exactly
 * the kind of unrequested-deliverable scope creep the dispatch rules warn
 * against.
 */
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import { Button } from './primitives/Button';
import { Chip } from './primitives/Chip';

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

const panelStyle: CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 0.4rem)',
  left: 0,
  zIndex: 10,
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
  minWidth: '14rem',
  boxSizing: 'border-box',
  padding: '0.75rem',
  borderRadius: 'var(--radius-md, 10px)',
  border: '1px solid var(--border)',
  background: 'var(--panel)',
};

const srOnlyStyle: CSSProperties = {
  position: 'absolute',
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
