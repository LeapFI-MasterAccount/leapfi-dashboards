import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { PANEL_STYLE } from '../panelStyle';

// r13 A.2 — theme/panelStyle.ts consolidation.
//
// PANEL_STYLE carries only the properties that were byte-identical across
// every genuine card/panel-surface declaration found by the sweep:
// `background: var(--panel)`, `border: 1px solid var(--border)`, and the
// majority borderRadius (`var(--radius-md, 10px)`, 12 of 14 sites). Padding,
// gap, display/flexDirection, minWidth, boxSizing, and the two sites that use
// `var(--radius-sm, 6px)` instead of the default are real per-site
// differences and are NOT folded into this shared constant — each call site
// keeps them locally, spreading PANEL_STYLE first and overriding/adding
// afterward so the difference stays visible at the site, not hidden in the
// shared file.

describe('theme/panelStyle — PANEL_STYLE (shared card/panel surface base)', () => {
  it('carries exactly the surface properties shared by every consolidated site: panel background, border, and the majority radius', () => {
    expect(PANEL_STYLE).toEqual({
      background: 'var(--panel)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md, 10px)',
    });
  });

  it('is a plain object literal (no accidental function/class), so every call site can safely spread it', () => {
    expect(typeof PANEL_STYLE).toBe('object');
    expect(Array.isArray(PANEL_STYLE)).toBe(false);
  });
});

describe('theme/panelStyle — consolidated call sites (12 default-radius + 2 radius-sm override)', () => {
  it('OnSideOverview CARD_STYLE spreads PANEL_STYLE and keeps its own padding/gap/layout', async () => {
    const { CARD_STYLE } = await import('../../screens/OnSideOverview');
    expect(CARD_STYLE).toMatchObject(PANEL_STYLE);
    expect(CARD_STYLE).toEqual({
      ...PANEL_STYLE,
      padding: '1.25rem',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    });
  });

  it('Roadmap kpiCardStyle and quarterColStyle both spread PANEL_STYLE and keep distinct padding/gap', async () => {
    const { kpiCardStyle, quarterColStyle } = await import('../../screens/Roadmap');
    expect(kpiCardStyle).toEqual({
      ...PANEL_STYLE,
      padding: '0.875rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
    });
    expect(quarterColStyle).toEqual({
      ...PANEL_STYLE,
      padding: '0.625rem 0.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    });
  });

  it('SettingsToggles and SettingsAbout CARD_STYLE are the identical duplicate pair, both now spreading PANEL_STYLE', async () => {
    const toggles = await import('../../screens/SettingsToggles');
    const about = await import('../../screens/SettingsAbout');
    const expected = {
      ...PANEL_STYLE,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.875rem',
      padding: '1.1rem 1.25rem',
      boxSizing: 'border-box',
      minWidth: 0,
    };
    expect(toggles.CARD_STYLE).toEqual(expected);
    expect(about.CARD_STYLE).toEqual(expected);
  });

  it('StatCard cardStyle spreads PANEL_STYLE and keeps its own gap/minWidth', async () => {
    const { cardStyle } = await import('../../components/StatCard');
    expect(cardStyle).toEqual({
      ...PANEL_STYLE,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.6rem',
      padding: '1.1rem 1.25rem',
      minWidth: 0,
      boxSizing: 'border-box',
    });
  });

  it('SetupCard CARD_BASE_STYLE spreads PANEL_STYLE and keeps its clickable-region extras', async () => {
    const { CARD_BASE_STYLE } = await import('../../components/SetupCard');
    expect(CARD_BASE_STYLE).toEqual({
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      width: '100%',
      textAlign: 'left',
      font: 'inherit',
      boxSizing: 'border-box',
      padding: '1rem',
      ...PANEL_STYLE,
      outline: 'none',
      transition: 'background-color 120ms ease, border-color 120ms ease, box-shadow 120ms ease',
    });
  });

  it('OnSideOwnership TWO_ENGINES_CARD_STYLE, ROLE_LEGEND_STYLE, and RACI_MARK_LEGEND_STYLE all spread PANEL_STYLE and keep their own layout', async () => {
    const { TWO_ENGINES_CARD_STYLE, ROLE_LEGEND_STYLE, RACI_MARK_LEGEND_STYLE } = await import('../../screens/OnSideOwnership');
    expect(TWO_ENGINES_CARD_STYLE).toEqual({
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      padding: '1.1rem 1.25rem',
      ...PANEL_STYLE,
    });
    expect(ROLE_LEGEND_STYLE).toEqual({
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '0.5rem',
      padding: '0.875rem 1rem',
      ...PANEL_STYLE,
    });
    expect(RACI_MARK_LEGEND_STYLE).toEqual({
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      padding: '0.875rem 1rem',
      ...PANEL_STYLE,
    });
  });

  it('CaseDetail and RegulatoryFeedSources CARD_STYLE spread PANEL_STYLE but explicitly override borderRadius to radius-sm (the preserved difference)', async () => {
    const { CARD_STYLE: caseDetailCard } = await import('../../views/CaseDetail');
    const { CARD_STYLE: feedSourcesCard } = await import('../../views/RegulatoryFeedSources');
    expect(caseDetailCard).toEqual({
      ...PANEL_STYLE,
      borderRadius: 'var(--radius-sm, 6px)',
      padding: '1.25rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    });
    expect(feedSourcesCard).toEqual({
      ...PANEL_STYLE,
      borderRadius: 'var(--radius-sm, 6px)',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    });
    // The override is real: neither site silently inherited the md radius.
    expect(caseDetailCard.borderRadius).not.toBe(PANEL_STYLE.borderRadius);
    expect(feedSourcesCard.borderRadius).not.toBe(PANEL_STYLE.borderRadius);
  });

  it('ChatIntakeWizard reviewPanelStyle and StudioAsk CHAT_PANEL_STYLE spread PANEL_STYLE', async () => {
    const { reviewPanelStyle } = await import('../../views/ChatIntakeWizard');
    const { CHAT_PANEL_STYLE } = await import('../../screens/StudioAsk');
    expect(reviewPanelStyle).toEqual({
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      ...PANEL_STYLE,
      padding: '1rem 1.125rem',
    });
    expect(CHAT_PANEL_STYLE).toEqual({
      ...PANEL_STYLE,
      padding: '1.5rem',
    });
  });
});

// r13 A.2 hostile-review fix (finding D1) — the header comment above and the
// original version of this test hand-counted "14 consolidated sites". A
// re-sweep found 19 `...PANEL_STYLE` spread sites across 16 files (five real
// consumers — FilterBar, Topbar, DomainsAccordion, HomeCustomizeBar,
// NotificationBellPanel — were never added to the hand-maintained list
// above); a sixth site, SliderControlRow.tsx's `stanceBoxStyle`, was
// converted to spread PANEL_STYLE in this same fix pass (finding D2),
// bringing the current total to 20 sites across 17 files. A hand-maintained
// count/list is exactly the kind of thing that goes stale silently; instead
// of extending the manual list again, this block DERIVES the current site
// set by scanning the actual `src` tree for `...PANEL_STYLE` spreads, so any
// future site (added or removed) shows up in this test's own output rather
// than only in a comment nobody re-reads.
const SRC_DIR = path.resolve(__dirname, '..', '..');
const PANEL_STYLE_DEFINITION_FILE = path.resolve(__dirname, '..', 'panelStyle.ts');
const SPREAD_PATTERN = /\.\.\.\s*PANEL_STYLE\b/;

interface PanelStyleSite {
  file: string; // path relative to src/
  line: number;
}

function findPanelStyleSpreadSites(dir: string): PanelStyleSite[] {
  const sites: PanelStyleSite[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      sites.push(...findPanelStyleSpreadSites(fullPath));
      continue;
    }
    if (!/\.(ts|tsx)$/.test(entry.name)) continue;
    if (fullPath === PANEL_STYLE_DEFINITION_FILE) continue; // the shared constant's own declaration is not a "consumer"
    const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
    lines.forEach((line, index) => {
      if (SPREAD_PATTERN.test(line)) {
        sites.push({ file: path.relative(SRC_DIR, fullPath), line: index + 1 });
      }
    });
  }
  return sites;
}

describe('theme/panelStyle — real consumer set, derived from the codebase (not hand-counted)', () => {
  const sites = findPanelStyleSpreadSites(SRC_DIR).sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  const files = [...new Set(sites.map((s) => s.file))].sort();

  it('finds every `...PANEL_STYLE` spread site currently in src/ by scanning, not by a hardcoded list', () => {
    // Pinned to the actual re-swept count at this commit: 20 sites in 17
    // files (the 14 originally documented + FilterBar, Topbar,
    // DomainsAccordion, HomeCustomizeBar, NotificationBellPanel, and
    // SliderControlRow's `stanceBoxStyle` converted in this same pass).
    expect(files.length).toBe(17);
    expect(sites.length).toBe(20);
  });

  it('the derived file set matches the corrected consumer list (regression lock — a removed or newly-added file changes this)', () => {
    expect(files).toEqual([
      'components/FilterBar.tsx',
      'components/SetupCard.tsx',
      'components/SliderControlRow.tsx',
      'components/StatCard.tsx',
      'components/Topbar.tsx',
      'screens/OnSideOverview.tsx',
      'screens/OnSideOwnership.tsx',
      'screens/Roadmap.tsx',
      'screens/SettingsAbout.tsx',
      'screens/SettingsToggles.tsx',
      'screens/StudioAsk.tsx',
      'views/CaseDetail.tsx',
      'views/ChatIntakeWizard.tsx',
      'views/DomainsAccordion.tsx',
      'views/HomeCustomizeBar.tsx',
      'views/NotificationBellPanel.tsx',
      'views/RegulatoryFeedSources.tsx',
    ]);
  });

  it('the previously-uncovered six sites (FilterBar, Topbar, DomainsAccordion, HomeCustomizeBar, NotificationBellPanel, SliderControlRow) really do spread PANEL_STYLE, not just import it unused', () => {
    const uncovered = [
      'components/FilterBar.tsx',
      'components/Topbar.tsx',
      'views/DomainsAccordion.tsx',
      'views/HomeCustomizeBar.tsx',
      'views/NotificationBellPanel.tsx',
      'components/SliderControlRow.tsx',
    ];
    for (const file of uncovered) {
      const siteCount = sites.filter((s) => s.file === file).length;
      expect(siteCount).toBeGreaterThanOrEqual(1);
    }
  });

  // SliderControlRow's `stanceBoxStyle` is module-private (not exported), so
  // its converted shape is asserted at the rendered-DOM level — see
  // src/__tests__/components/slider-control-row-stance-box-panel-style.test.tsx
  // (finding D2).
});
