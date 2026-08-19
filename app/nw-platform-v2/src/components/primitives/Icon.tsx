/**
 * Icon — Primitive P1 (design_system_spec.md §2.1)
 *
 * Monoline icon set, 16px / 24px. Renders inline SVG using
 * `stroke="currentColor"` (matches the monoline stroke language already
 * used in the read-only reference demo, leapfi-platform.html:834 — a
 * `stroke-width="1.9"` bell glyph — so this primitive's rendering
 * technique is consistent with the shipped visual language, not invented
 * from nothing).
 *
 * AMBIGUITY RESOLVED (spec §2.1 P1 row + §1.4): the spec names the Icon
 * primitive and its `name` prop but does not enumerate the glyph
 * vocabulary anywhere in design_system_spec.md — no icon inventory table
 * exists in this document. Building an unbounded, invented glyph set
 * would itself be a spec defect (inventing visuals not cited from a
 * source). I resolved this by building a closed, minimal glyph set
 * covering only the icon *usages the spec's own composite table (§2.2)
 * names by function*: bell (C4 NotificationBell), chevron-right /
 * chevron-down / chevron-left (C2 SidebarItem nested chevron, C15
 * SetupCard chevron), close (C7 Drawer close, C17 Toast dismiss),
 * arrow-right (C17 Toast "View impact ->" link), check (status
 * confirmation, paired with Tag per P4's "never color alone" rule),
 * lock (P4 `locked` Tag variant / C15 `locked` SetupCard), calendar
 * (C4 DateDisplay). The `IconName` union is intentionally closed (not
 * `string`) so an unrecognized name fails at compile time rather than
 * rendering a silent blank icon. STOP-item: if a screen composite needs
 * a glyph outside this set, that is new spec surface a design_system_spec
 * update should name explicitly, not a per-consumer freeform string.
 */
import type { CSSProperties, SVGProps } from 'react';

export type IconName =
  | 'bell'
  | 'chevron-right'
  | 'chevron-down'
  | 'chevron-left'
  | 'close'
  | 'arrow-right'
  | 'check'
  | 'lock'
  | 'calendar';

export type IconTone = 'default' | 'interactive' | 'disabled';

export interface IconProps {
  name: IconName;
  /** Spec P1 variants: monoline at 16px or 24px. Defaults to 16. */
  size?: 16 | 24;
  /**
   * default -> `--ink`, interactive -> `--accent`, disabled -> dimmed
   * `--ink3` (spec P1 Key props / States columns). Defaults to
   * 'default'. `disabled` always wins regardless of the requested tone.
   */
  tone?: IconTone;
  disabled?: boolean;
  /**
   * Only set this when the icon is used with no other accessible name
   * anywhere nearby (rare — spec P1 a11y baseline: "functional icons ...
   * carry an accessible name via the parent control, never rely on icon
   * shape alone"). Supplying `title` switches the icon from decorative
   * (`aria-hidden`) to a labelled `role="img"` graphic. Leave unset for
   * every icon composed inside a Button/Chip/Tag that already carries
   * its own accessible name.
   */
  title?: string;
  style?: CSSProperties;
}

const TONE_COLOR: Record<IconTone, string> = {
  default: 'var(--ink)',
  interactive: 'var(--accent)',
  disabled: 'var(--ink3)',
};

type GlyphProps = SVGProps<SVGPathElement>;

const GLYPHS: Record<IconName, GlyphProps[]> = {
  bell: [
    { d: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9' },
    { d: 'M13.7 21a2 2 0 0 1-3.4 0' },
  ],
  'chevron-right': [{ d: 'M9 6l6 6-6 6' }],
  'chevron-down': [{ d: 'M6 9l6 6 6-6' }],
  'chevron-left': [{ d: 'M15 6l-6 6 6 6' }],
  close: [
    { d: 'M6 6l12 12' },
    { d: 'M18 6L6 18' },
  ],
  'arrow-right': [
    { d: 'M5 12h14' },
    { d: 'M13 6l6 6-6 6' },
  ],
  check: [{ d: 'M5 13l4 4L19 7' }],
  lock: [
    { d: 'M6 11h12v9H6z' },
    { d: 'M8.5 11V7.5a3.5 3.5 0 0 1 7 0V11' },
  ],
  calendar: [
    { d: 'M4 5h16v15H4z' },
    { d: 'M4 9h16' },
    { d: 'M8 3v4' },
    { d: 'M16 3v4' },
  ],
};

export function Icon({ name, size = 16, tone = 'default', disabled = false, title, style }: IconProps) {
  const resolvedTone: IconTone = disabled ? 'disabled' : tone;
  const color = TONE_COLOR[resolvedTone];
  const labelled = Boolean(title);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      data-lf-primitive="icon"
      data-name={name}
      aria-hidden={labelled ? undefined : true}
      role={labelled ? 'img' : undefined}
      style={{ color, flex: '0 0 auto', display: 'block', ...style }}
    >
      {title ? <title>{title}</title> : null}
      {GLYPHS[name].map((glyphProps, index) => (
        // eslint-disable-next-line react/no-array-index-key -- static glyph path list, order never changes
        <path key={index} {...glyphProps} />
      ))}
    </svg>
  );
}
