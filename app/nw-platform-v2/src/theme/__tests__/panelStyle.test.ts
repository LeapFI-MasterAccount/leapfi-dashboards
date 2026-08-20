import { describe, expect, it } from 'vitest';
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
