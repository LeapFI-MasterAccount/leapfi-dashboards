import type { CSSProperties } from 'react';

/**
 * Shared card/panel surface base — r13 A.2 consolidation.
 *
 * A sweep of the codebase (grepping the panel/card style SHAPE — background
 * `var(--panel)` + `1px solid var(--border)` + a `borderRadius`, not just
 * literal `CARD_STYLE` spellings) found 20 genuine card/panel-container
 * declarations (spread sites) across 17 files in screens/components/views
 * (kpiCardStyle, quarterColStyle, cardStyle, CARD_BASE_STYLE,
 * TWO_ENGINES_CARD_STYLE, ROLE_LEGEND_STYLE, RACI_MARK_LEGEND_STYLE,
 * reviewPanelStyle, CHAT_PANEL_STYLE, stanceBoxStyle, profileMenuStyle,
 * panelStyle (×3, one per dropdown/menu surface), and five
 * differently-named/spelled `CARD_STYLE` consts). Their `background` and
 * `border` values are byte-identical at rest
 * across every one of those sites (SliderControlRow's `stanceBoxStyle`
 * overrides `border` when its `tension` prop is true, matching the same
 * override-after-spread pattern already used by DomainsAccordion's
 * `cardStyle`), and 14 of the 20 also share this `borderRadius`. That
 * identical subset is what lives here.
 *
 * Padding, gap, display/flexDirection, minWidth, and boxSizing differ by
 * site and stay declared locally at each call site — folding them in here
 * would silently flatten real per-site differences. Five sites
 * (views/CaseDetail.tsx, views/RegulatoryFeedSources.tsx,
 * components/FilterBar.tsx, components/Topbar.tsx,
 * views/NotificationBellPanel.tsx) override `borderRadius` to
 * `var(--radius-sm, ...)` instead of this default, and SliderControlRow.tsx
 * overrides both `border` (conditionally) and `borderRadius`; every override
 * spreads PANEL_STYLE first and overrides afterward, so the difference stays
 * visible at the site rather than hidden in this shared file.
 *
 * The exact current site set is not maintained here by hand — see
 * `theme/__tests__/panelStyle.test.ts`, which derives it by scanning `src/`
 * for `...PANEL_STYLE` spreads so this comment cannot drift out of sync with
 * the codebase the way the original count did (hostile-review finding D1).
 */
export const PANEL_STYLE: CSSProperties = {
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md, 10px)',
};
