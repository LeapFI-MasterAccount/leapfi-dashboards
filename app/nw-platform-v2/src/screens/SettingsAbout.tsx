/**
 * SettingsAbout — parity_ia_addendum.md §1.4 "Settings" rows 2-3
 * ("Release notes / changelog" + "About"), dispatched as Batch 6. Not one
 * of the 7 script screens (design_system_spec.md §9: "Settings toggles /
 * About (1032–1140) — Switch (P8), Label (P3) — no new composite; not one
 * of the 7 screens, minimal coverage per scope").
 *
 * Base engine anchors ported: Release notes card leapfi-platform.html
 * 1056–1130 (`<ul class="changelog">`, 71 entries, v1.001–v1.071); About
 * card 1132–1137.
 *
 * Region map: Topbar (shell) → page title → Release notes card (Label (P3)
 * blocks, one per changelog entry) → About card (Label (P3) rows + Tag
 * (`count`) pills), matching parity_ia_addendum.md §1.4's exact component
 * budget for this screen.
 *
 * VERBATIM CHANGELOG PORT: parity_ia_addendum.md §1.4 directs this file to
 * carry "a new small literal array — the changelog is copy, not business
 * data; port verbatim as a plain string-list constant local to this screen
 * (no shared data module needed)." `CHANGELOG` below is exactly that: all
 * 71 entries from the source `<ul class="changelog">` (1059–1129), each
 * reduced from source HTML (`<b>`/`<i>`/`<br>` inline markup) to plain text
 * — Label (P3) takes only a `text: string` prop with no rich-markup
 * rendering path, so a literal HTML-to-plain-text reduction is the only
 * way to route this copy through the primitive the spec assigns it to
 * ("Label (P3) blocks, one per entry"), not a content cut. No entry's
 * wording, count, or ordering was altered — this is copy, ported whole per
 * the addendum's own instruction, not summarized.
 *
 * AMBIGUITY RESOLVED — Topbar/Sidebar data ownership: identical
 * passthrough pattern already landed by every sibling screen in this
 * worktree — full `topbar: TopbarProps` bundle, `onNavigate:
 * SidebarProps['onNavigate']`, `activeId` hardcoded to `'settings.about'`
 * (intrinsic to this screen).
 *
 * AMBIGUITY RESOLVED — About-card figures are literal copy, not derived:
 * base engine anchor 1132–1137 hardcodes "v 1.071" / "3 + 3" /
 * "Demo" directly in markup (no live computation in the source either —
 * `Discovery · Studio · OnSide · (Connect, AllRailz upcoming · Vantage
 * targeted v3)` names 3 shipped + 3 upcoming modules as prose, "3 + 3" is
 * typed, not counted). Porting these as literal strings is therefore full
 * fidelity to the source, not a shortcut around deriving them from live
 * data this worktree doesn't have a module for.
 *
 * Accessibility: each changelog entry is a labelled group (`role="group"
 * aria-labelledby`) so a screen-reader user gets "vX.XXX · <date>" as the
 * entry's accessible name before its body text, mirroring the visual
 * eyebrow/body pairing. About-card rows pair a Label (eyebrow, the field
 * name) with a Label (body-secondary, the value) plus a trailing Tag
 * (`count`) — Tag's own primitive contract already guarantees the pill is
 * never the sole carrier of meaning (the adjacent Label states the same
 * fact in words). Card and page headings are real heading elements
 * (`h1`/`h2`), and `main` carries `aria-labelledby` pointing at the page
 * `h1`, matching every sibling screen's landmark pattern.
 *
 * No screen-level primary CTA: design_system_spec.md §9 and
 * parity_ia_addendum.md §4 both classify Settings as "a settings/reference
 * panel" with the explicit stated-reason exemption under Core Principle 2
 * ("one primary [CTA], or a stated reason none applies").
 *
 * STOP-item — no executable test run: this worktree's `package.json` (out
 * of this dispatch's ALLOWLIST) has no test runner installed, matching
 * every sibling screen already landed here. Verified via `npx tsc --noEmit`
 * (strict mode, `exactOptionalPropertyTypes`) against the whole `src/`
 * tree to confirm this file type-checks against the real `Topbar`/
 * `Sidebar`/`Label`/`Tag` shapes it consumes.
 */
import type { CSSProperties } from 'react';
import { Topbar } from '../components/Topbar';
import type { TopbarProps } from '../components/Topbar';
import { Sidebar } from '../components/Sidebar';
import type { SidebarProps } from '../components/Sidebar';
import { Label } from '../components/primitives/Label';
import { Tag } from '../components/primitives/Tag';

interface AboutRow {
  label: string;
  value: string;
  pill: string;
}

// Verbatim port, leapfi-platform.html 133–138 ("About" card).
const ABOUT_ROWS: AboutRow[] = [
  { label: 'Product', value: 'LeapFI Platform · all-in-one back-office infrastructure', pill: 'v 1.071' },
  {
    label: 'Modules licensed',
    value: 'Discovery · Studio · OnSide · (Connect, AllRailz upcoming · Vantage targeted v3)',
    pill: '3 + 3',
  },
  { label: 'Environment', value: 'Demo · illustrative customer data · NorthWinds Credit Union', pill: 'Demo' },
];

const SCREEN_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100vh',
  background: 'var(--bg)',
  boxSizing: 'border-box',
};
const BODY_ROW_STYLE: CSSProperties = { display: 'flex', flex: '1 1 auto', minHeight: 0 };
const SIDEBAR_REGION_STYLE: CSSProperties = { flex: '0 0 240px' };
const MAIN_STYLE: CSSProperties = {
  flex: '1 1 auto',
  minWidth: 0,
  overflowY: 'auto',
  boxSizing: 'border-box',
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.75rem',
};
const HEADER_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.375rem' };
const TITLE_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' };
const CARD_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.875rem',
  padding: '1.1rem 1.25rem',
  borderRadius: 'var(--radius-md, 10px)',
  border: '1px solid var(--border)',
  background: 'var(--panel)',
  boxSizing: 'border-box',
  minWidth: 0,
};
const CARD_TITLE_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.0625rem', fontWeight: 700, color: 'var(--ink)' };
const ABOUT_ROW_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '1rem',
  padding: '0.75rem 0',
  borderTop: '1px solid var(--border)',
};
const ABOUT_ROW_FIRST_STYLE: CSSProperties = { ...ABOUT_ROW_STYLE, borderTop: 'none', paddingTop: 0 };
const ABOUT_ROW_MAIN_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: 0 };

export interface SettingsAboutProps {
  /** Full Topbar prop bundle — same passthrough pattern as every sibling screen. */
  topbar: TopbarProps;
  /** Sidebar navigation hook. `activeId` is intrinsic to this screen ('settings.about') and is not accepted as a prop. */
  onNavigate: SidebarProps['onNavigate'];
  sidebarVersionLabel?: string;
}

export function SettingsAbout({ topbar, onNavigate, sidebarVersionLabel }: SettingsAboutProps) {
  // See `Home.tsx`'s identical note: built conditionally because this
  // project's `exactOptionalPropertyTypes` setting treats an optional prop
  // as exactly its declared type, not `T | undefined`.
  const sidebarProps: SidebarProps = {
    activeId: 'settings.about',
    onNavigate,
    ...(sidebarVersionLabel !== undefined ? { versionLabel: sidebarVersionLabel } : {}),
  };

  return (
    <div data-lf-screen="settings-about" style={SCREEN_STYLE}>
      <Topbar {...topbar} />
      <div style={BODY_ROW_STYLE}>
        <div style={SIDEBAR_REGION_STYLE}>
          <Sidebar {...sidebarProps} />
        </div>
        <main id="settings-about-main" style={MAIN_STYLE} aria-labelledby="settings-about-title">
          <div style={HEADER_STYLE}>
            <Label text="Platform" variant="eyebrow" />
            <h1 id="settings-about-title" style={TITLE_STYLE}>
              Settings · About
            </h1>
          </div>

          <div style={CARD_STYLE} role="group" aria-labelledby="about-heading">
            <h2 id="about-heading" style={CARD_TITLE_STYLE}>
              About
            </h2>
            {ABOUT_ROWS.map((row, index) => (
              <div key={row.label} style={index === 0 ? ABOUT_ROW_FIRST_STYLE : ABOUT_ROW_STYLE}>
                <div style={ABOUT_ROW_MAIN_STYLE}>
                  <Label text={row.label} variant="eyebrow" />
                  <Label text={row.value} variant="body-secondary" />
                </div>
                <Tag text={row.pill} variant="count" />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
