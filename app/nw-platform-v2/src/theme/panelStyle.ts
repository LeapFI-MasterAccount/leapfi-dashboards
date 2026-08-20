import type { CSSProperties } from 'react';

/**
 * Shared card/panel surface base — r13 A.2 consolidation.
 *
 * A sweep of the codebase (grepping the panel/card style SHAPE — background
 * `var(--panel)` + `1px solid var(--border)` + a `borderRadius`, not just
 * literal `CARD_STYLE` spellings) found 14 genuine card/panel-container
 * declarations across screens/components/views (kpiCardStyle, quarterColStyle,
 * cardStyle, CARD_BASE_STYLE, TWO_ENGINES_CARD_STYLE, ROLE_LEGEND_STYLE,
 * RACI_MARK_LEGEND_STYLE, reviewPanelStyle, CHAT_PANEL_STYLE, and five
 * differently-named/spelled `CARD_STYLE` consts). Their `background` and
 * `border` values were byte-identical at every one of those 14 sites, and 12
 * of the 14 also shared this `borderRadius`. That identical subset is what
 * lives here.
 *
 * Padding, gap, display/flexDirection, minWidth, and boxSizing differ by
 * site and stay declared locally at each call site — folding them in here
 * would silently flatten real per-site differences. Two sites
 * (views/CaseDetail.tsx, views/RegulatoryFeedSources.tsx) use
 * `var(--radius-sm, 6px)` instead of this default; they spread PANEL_STYLE
 * and then explicitly override `borderRadius`, so that difference stays
 * visible at the site rather than hidden in this shared file.
 */
export const PANEL_STYLE: CSSProperties = {
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md, 10px)',
};
