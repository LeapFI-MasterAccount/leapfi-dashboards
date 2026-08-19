/**
 * Topbar — Composite C4 (design_system_spec.md §2.2, §3.2)
 *
 * "BackChip (Button/ghost), Breadcrumb (Label), LivePill (Tag),
 * NotificationBell (Icon+Tag), ProfileMenu (Avatar+dropdown of Buttons),
 * DateDisplay (Label), BoardDeckButton (Button/ghost)."
 *
 * Region map, left -> right (§3.2, followed literally over the
 * alphabetical "Built from" list order above, since §3.2 explicitly
 * labels itself the region map): BackChip -> Breadcrumb -> [flex space]
 * -> LivePill -> BoardDeckButton -> NotificationBell -> DateDisplay ->
 * ProfileMenu.
 *
 * `banner` landmark; ProfileMenu is a proper disclosure per the C4 a11y
 * baseline: the Avatar trigger carries `aria-haspopup="menu"` and live
 * `aria-expanded` (via Avatar's disclosure-passthrough props); opening
 * moves focus to the first `role="menuitem"`; ArrowDown/ArrowUp move
 * through the items with wrap (Home/End jump to first/last); Esc closes
 * and restores focus to the trigger; Tab closes the menu and returns
 * focus to the trigger so the browser's default Tab continues past it
 * (WAI-ARIA menu pattern — a menu is dismissed on Tab-out, never
 * focus-trapped like a dialog).
 *
 * AMBIGUITY RESOLVED — BackChip at-root rendering (§3.2 BackChip state
 * machine: "at-root (no back target, chip hidden/disabled)"): the spec
 * offers both "hidden" and "disabled" as satisfying that state without
 * picking one. I chose hidden (not rendered) rather than rendered-
 * disabled: a permanently-disabled control with no future path is exactly
 * the pattern Button's own a11y baseline warns against ("disabled buttons
 * are never the sole path to a required action") — there is no action
 * here at all when at-root, so parking an inert control in the layout
 * adds a confusing stop with nothing behind it. Hidden avoids that
 * without losing anything: `at-root` has no affordance to communicate.
 *
 * AMBIGUITY RESOLVED — Breadcrumb/DateDisplay Label variant: §2.1 P3
 * lists `body-secondary`/`eyebrow` but §3.2 does not say which variant
 * either region uses. Both are used here, matching their role as
 * secondary chrome text rather than the page's primary heading content.
 *
 * DISPATCH-LEVEL ADDITION — theme toggle slot: design_system_spec.md
 * §3.2's region map does not mention a theme toggle at all (Topbar's
 * spec surface is silent on it — no composite in §2.2 names one either).
 * The comp-shell dispatch brief explicitly requires a "theme toggle
 * slot," so `themeToggleSlot` is added as an optional `ReactNode` slot —
 * this component never owns theme state or renders a default toggle
 * itself (theme state lives in `App.tsx`, outside this dispatch's
 * allowlist); it only reserves a place to render whatever control the
 * integrating screen supplies. Placed last before ProfileMenu so it never
 * displaces any of the seven elements §3.2 does explicitly order.
 *
 * DISPATCH-LEVEL ADDITION — profile/user-switcher hooks: ProfileMenu's
 * "dropdown of Buttons" (§2.2 C4) is exposed as a plain `profileMenuItems`
 * array of {id, label, onPress} — this file does not hardcode persona
 * data or switching logic (that belongs to whichever data/App file owns
 * the persona list), it only provides the disclosure chrome and the hook
 * surface the brief asks for.
 *
 * PARITY-ASSEMBLY ADDITION — `notificationSlot` (parity_ia_addendum.md
 * §1.5 "Shell-level: Notification Bell" / §6 Batch 7): `NotificationBell`
 * (this file, internal/unexported) is a plain count-badge with a single
 * `onPress` — it has no popover of its own, and the addendum's real bell
 * surface is `views/NotificationBellPanel.tsx`, a self-contained composite
 * (its own file header explains why: it cannot be built by extending this
 * file's internal, unexported `NotificationBell`, since that function
 * cannot be imported from outside this file). Rather than duplicate that
 * panel's trigger chrome a second time inside this file, `notificationSlot`
 * follows the exact `themeToggleSlot` precedent immediately above: an
 * optional `ReactNode` extension point the integrating shell can fill with
 * a real composite. When supplied, it renders in the bell's own §3.2
 * region position, in place of (not alongside) the internal count-badge
 * button — a screen with a real notification feed should show one bell,
 * not two. `notificationCount`/`onOpenNotifications` are left fully
 * backward-compatible: omitting `notificationSlot` reproduces this file's
 * exact pre-existing behavior.
 */
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';
import { Avatar } from './primitives/Avatar';
import { Button } from './primitives/Button';
import { Icon } from './primitives/Icon';
import { Tag } from './primitives/Tag';

export interface TopbarBackTarget {
  label: string;
  onPress: () => void;
}

export interface TopbarProfile {
  name: string;
  initials?: string;
  image?: string;
}

export interface TopbarProfileMenuItem {
  id: string;
  label: string;
  onPress: () => void;
}

export interface TopbarProps {
  /** Breadcrumb text (Label, body-secondary). */
  breadcrumb: string;
  /** BackChip state machine (§3.2): omit/null = `at-root` (chip not rendered). Present = `one-level-back`. */
  backTarget?: TopbarBackTarget | null;
  /** LivePill (Tag, status-positive). Defaults to shown; pass `live={false}` to omit it entirely rather than rendering a contradictory "not live" pill. */
  live?: boolean;
  liveLabel?: string;
  /** BoardDeckButton (§3.2 G10) — ghost weight, deliberately not primary (see spec rationale). */
  onOpenBoardDeck: () => void;
  boardDeckLabel?: string;
  /** NotificationBell (Icon `bell` + count Tag). Omit `onOpenNotifications` if there is nowhere to route the click yet. Ignored when `notificationSlot` is supplied. */
  notificationCount?: number;
  onOpenNotifications?: () => void;
  /** See file header "PARITY-ASSEMBLY ADDITION — notificationSlot." Renders in place of the internal count-badge NotificationBell when supplied. */
  notificationSlot?: ReactNode;
  /** DateDisplay (Label, body-secondary) — pre-formatted text; this component does no date formatting. */
  date: string;
  profile: TopbarProfile;
  profileMenuItems: TopbarProfileMenuItem[];
  /** See file header "DISPATCH-LEVEL ADDITION — theme toggle slot." */
  themeToggleSlot?: ReactNode;
}

const BAR_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.625rem 1rem',
  background: 'var(--bg2)',
  borderBottom: '1px solid var(--border)',
  boxSizing: 'border-box',
  minHeight: 56,
};

const LABEL_STYLE: CSSProperties = {
  font: 'inherit',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: 'var(--ink2)',
  whiteSpace: 'nowrap',
};

function ProfileMenu({ profile, items }: { profile: TopbarProfile; items: TopbarProfileMenuItem[] }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // The trigger ref points at the wrapping span; the focusable element is
  // Avatar's internal <button>. Focusing the span itself is a no-op (it
  // has no tabindex), so every focus-restore path resolves the button.
  const focusTrigger = () => {
    triggerRef.current?.querySelector<HTMLElement>('button')?.focus();
  };

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.querySelector<HTMLElement>('button')?.focus();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      const first = menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
      first?.focus();
    }
  }, [open]);

  // WAI-ARIA menu keyboard model (see file header): arrows move focus
  // with wrap, Home/End jump, Tab dismisses. Esc is handled by the
  // document-level listener above (it must also fire when focus has
  // strayed outside the menu, e.g. right after opening via pointer).
  const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Tab') {
      // Close and hand focus back to the trigger WITHOUT preventDefault:
      // the browser's default Tab then advances from the trigger, so
      // Tab lands after it and Shift+Tab lands before it.
      setOpen(false);
      focusTrigger();
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Home' && event.key !== 'End') {
      return;
    }
    event.preventDefault();
    const menuItems = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    if (menuItems.length === 0) return;
    const currentIndex = menuItems.indexOf(document.activeElement as HTMLElement);
    let nextIndex: number;
    if (event.key === 'ArrowDown') {
      nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % menuItems.length;
    } else if (event.key === 'ArrowUp') {
      nextIndex = currentIndex < 0 ? menuItems.length - 1 : (currentIndex - 1 + menuItems.length) % menuItems.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else {
      nextIndex = menuItems.length - 1;
    }
    menuItems[nextIndex]?.focus();
  };

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }} data-lf-composite="profile-menu">
      <span ref={triggerRef} style={{ display: 'inline-flex' }}>
        <Avatar
          interactive
          size="small"
          initials={profile.initials}
          image={profile.image}
          name={profile.name}
          ariaHaspopup="menu"
          ariaExpanded={open}
          onPress={() => setOpen((current) => !current)}
        />
      </span>
      {open ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label={`${profile.name} account menu`}
          data-lf-composite="profile-menu-list"
          onKeyDown={handleMenuKeyDown}
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.375rem)',
            right: 0,
            minWidth: 200,
            background: 'var(--panel)',
            // Elevation is carried by the border + panel/bg contrast only —
            // tokens.css defines no elevation/shadow role (§1.1's named-role
            // table has no shadow entry), and no sibling primitive in this
            // codebase uses a raw-color drop shadow (Button/Chip/Input/
            // Switch/Avatar/Slider all reserve box-shadow exclusively for
            // `--focus-ring`). Inventing an un-tokenized rgba shadow here
            // would repeat the raw-color mistake the styling hard rule
            // forbids, just spelled as rgba() instead of hex.
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm, 6px)',
            padding: '0.375rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.125rem',
            zIndex: 50,
          }}
        >
          {items.length === 0 ? (
            <span style={{ ...LABEL_STYLE, padding: '0.5rem' }}>No account actions available</span>
          ) : (
            items.map((item) => (
              <div key={item.id} role="none">
                <MenuButtonItem
                  label={item.label}
                  onSelect={() => {
                    setOpen(false);
                    item.onPress();
                  }}
                />
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

function MenuButtonItem({ label, onSelect }: { label: string; onSelect: () => void }) {
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        display: 'flex',
        width: '100%',
        boxSizing: 'border-box',
        minHeight: 44,
        alignItems: 'center',
        padding: '0.5rem 0.625rem',
        border: 'none',
        borderRadius: 'var(--radius-xs, 4px)',
        background: hover ? 'var(--bg2)' : 'transparent',
        color: 'var(--ink)',
        font: 'inherit',
        fontSize: '0.875rem',
        textAlign: 'left',
        cursor: 'pointer',
        boxShadow: focused ? 'var(--focus-ring)' : 'none',
        outline: 'none',
      }}
    >
      {label}
    </button>
  );
}

function NotificationBell({
  count,
  onPress,
}: {
  count?: number | undefined;
  onPress?: (() => void) | undefined;
}) {
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);
  const accessibleLabel =
    typeof count === 'number' && count > 0 ? `Notifications, ${count} unread` : 'Notifications';

  return (
    <button
      type="button"
      aria-label={accessibleLabel}
      disabled={!onPress}
      onClick={onPress}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      data-lf-composite="notification-bell"
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 44,
        minHeight: 44,
        border: 'none',
        borderRadius: 'var(--radius-sm, 6px)',
        background: hover && onPress ? 'var(--panel)' : 'transparent',
        boxShadow: focused ? 'var(--focus-ring)' : 'none',
        cursor: onPress ? 'pointer' : 'default',
        outline: 'none',
      }}
    >
      <Icon name="bell" size={24} tone={onPress ? 'default' : 'disabled'} />
      {typeof count === 'number' && count > 0 ? (
        <span style={{ position: 'absolute', top: 2, right: 2 }}>
          <Tag text={count > 99 ? '99+' : String(count)} variant="count" />
        </span>
      ) : null}
    </button>
  );
}

export function Topbar({
  breadcrumb,
  backTarget,
  live = true,
  liveLabel = 'Live',
  onOpenBoardDeck,
  boardDeckLabel = 'Open board deck',
  notificationCount,
  onOpenNotifications,
  notificationSlot,
  date,
  profile,
  profileMenuItems,
  themeToggleSlot,
}: TopbarProps) {
  return (
    <header role="banner" data-lf-composite="topbar" style={BAR_STYLE}>
      {backTarget ? (
        <Button label={backTarget.label} variant="ghost" icon="chevron-left" onPress={backTarget.onPress} />
      ) : null}

      <span style={{ ...LABEL_STYLE, fontWeight: 600, color: 'var(--ink)' }}>{breadcrumb}</span>

      <span style={{ flex: '1 1 auto' }} aria-hidden="true" />

      {live ? <Tag text={liveLabel} variant="status-positive" /> : null}

      <Button label={boardDeckLabel} variant="ghost" onPress={onOpenBoardDeck} />

      {notificationSlot ?? <NotificationBell count={notificationCount} onPress={onOpenNotifications} />}

      <span style={LABEL_STYLE}>{date}</span>

      {themeToggleSlot ? <span data-lf-slot="theme-toggle">{themeToggleSlot}</span> : null}

      <ProfileMenu profile={profile} items={profileMenuItems} />
    </header>
  );
}
