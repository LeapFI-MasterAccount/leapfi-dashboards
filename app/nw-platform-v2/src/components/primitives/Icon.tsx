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
 *
 * AMENDMENT A15 (design_system_spec.md §2.1 P1, §2.8 — PI2-D13): two new
 * closed-set members, `'expand'` / `'collapse'`, for the Drawer (C7)
 * header size-toggle (Drawer.tsx). Per §2.8: "a double-chevron pair
 * (outward-pointing for 'expand', inward-pointing, mirrored, for
 * 'collapse'), functionally distinct from the existing single-chevron
 * glyphs... reusing that exact shape for an unrelated resize action would
 * be a glyph-meaning collision." `'expand'` renders two chevrons pointing
 * away from the vertical center line (a left-pointing chevron on the left
 * half, a right-pointing chevron on the right half); `'collapse'` mirrors
 * that pair pointing inward toward the center. Exact path coordinates are
 * this primitive's own SVG-authoring judgment, the same latitude already
 * exercised for every other glyph in this file (bell/lock/calendar were
 * not spec-dictated path data either) — the spec binds the shape's
 * *meaning* (outward vs. inward, double vs. single chevron), not its
 * literal path string.
 *
 * DECISIONS.md D8 (call-05, theme-toggle sun/moon icons — ruled by Camille
 * Aubert, brand-steward): two new closed-set members, `'sun'` / `'moon'`,
 * for App.tsx's theme-toggle control (replacing its former text labels,
 * "Light theme"/dark). Per D8: "both glyphs are pure stroke-path data
 * through the existing `fill=\"none\"`/`TONE_COLOR` mechanism — sun as a
 * stroked circle + rays (never a filled warm disc), moon as a stroked
 * crescent — per ICON-1/FORB-4, zero exception." `'sun'` renders a small
 * stroked circle plus eight short stroked ray lines radiating outward
 * (never a filled disc — this file's `fill="none"` SVG root makes a
 * filled disc structurally impossible without a deliberate per-glyph
 * override, which this glyph does not take); `'moon'` renders a single
 * crescent path (an outer circle arc with an inner circle arc cut
 * in from one side — the same "two overlapping circle arcs forming a
 * crescent outline" construction every monoline icon set uses for this
 * glyph). Exact path coordinates are this primitive's own SVG-authoring
 * judgment, the same latitude the AMENDMENT A15 note above already
 * establishes for this file's other hand-authored glyphs.
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
  | 'calendar'
  | 'expand'
  | 'collapse'
  | 'sun'
  | 'moon';

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
  // A15 — outward-pointing double chevron (left half points left, right
  // half points right): "grow" / expand the Drawer's width.
  expand: [
    { d: 'M10 6L4 12l6 6' },
    { d: 'M14 6l6 6-6 6' },
  ],
  // A15 — inward-pointing double chevron, mirrored from `expand`: "shrink" /
  // collapse the Drawer back down.
  collapse: [
    { d: 'M4 6l6 6-6 6' },
    { d: 'M20 6l-6 6 6 6' },
  ],
  // D8 — stroked circle + 8 stroked rays, never a filled disc (ICON-1/FORB-4).
  sun: [
    { d: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z' },
    { d: 'M12 2v2.5' },
    { d: 'M12 19.5V22' },
    { d: 'M4.2 4.2l1.8 1.8' },
    { d: 'M18 18l1.8 1.8' },
    { d: 'M2 12h2.5' },
    { d: 'M19.5 12H22' },
    { d: 'M4.2 19.8l1.8-1.8' },
    { d: 'M18 6l1.8-1.8' },
  ],
  // D8 — single stroked crescent (outer arc + inner cut arc), never a
  // filled disc.
  moon: [{ d: 'M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z' }],
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
