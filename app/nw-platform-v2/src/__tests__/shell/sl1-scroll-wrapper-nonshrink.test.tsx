/**
 * SL-1 — horizontal-scroll wrapper non-shrink invariant regression
 * (design_system_spec.md §3.3, amendment A3; delta index §8 R-4(d)).
 *
 * Binding rule: every horizontal-scroll wrapper in the twin declares
 * itself non-shrinking (`flexShrink: 0`), UNCONDITIONALLY — whether or
 * not shrink pressure reaches it today. Left conditional, every future
 * table forces a per-site structural re-analysis or ships an invisible
 * table (the SL-1 defect class this amendment closes).
 *
 * Real scan (grepped `overflowX` under `src`, excluding `__tests__`):
 * 13 `overflowX: 'auto'` wrapper style declarations exist. 2 were already
 * compliant before this dispatch (`OnSideDocuments.tsx:409`,
 * `OnSideFeed.tsx:487` — both already covered by their own dedicated
 * scroll-collapse regression suites) because a live-crush defect was
 * observed at those two sites specifically. This file sweeps the
 * remaining 11 — every wrapper reachable from a default render is
 * checked here directly; `DomainsAccordion` needs one domain pre-expanded
 * to reach its two (same-const) wrappers, and `ReportView`'s wrapper is
 * reached by opening one report card in `Reporting`'s shared Drawer.
 * `DeckView.tsx:160` is excluded on purpose — `overflowX: 'hidden'`, not a
 * scroll wrapper (nothing to make non-shrinking).
 *
 * L3 UPDATE (PI-3, D6/call-07/call-08, sprint-plan.md Sprint 2 L3) — the
 * RACI matrix wrapper and the three `RegulatoryFeedSources.tsx` source-layer
 * wrappers relocated from `OnSideOwnership.tsx`/`OnSideFeed.tsx` to
 * `SettingsToggles.tsx`; both sites' checks below moved with them (site
 * count/behavior unchanged, only which screen reaches them).
 *
 * Each `it` below renders the real screen/view (no test-only wrapper
 * markup) and asserts every DOM node the component itself gave
 * `overflowX: 'auto'` also carries `flexShrink: 0` — a computed-style
 * assertion, not a source-text grep, so it fails honestly if the fix is
 * reverted or scoped to the wrong element.
 */
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SettingsToggles } from '../../screens/SettingsToggles';
import { Cases } from '../../screens/Cases';
import { InvestmentDesign } from '../../screens/InvestmentDesign';
import { OnSideFeed } from '../../screens/OnSideFeed';
import { Reporting } from '../../screens/Reporting';
import { HomePanels } from '../../views/HomePanels';
import { DomainsAccordion } from '../../views/DomainsAccordion';
import { DOMAINS } from '../../data/onside';
import { makeTopbarProps } from '../onside/helpers';

/** Every DOM node the rendered tree itself styled `overflowX: 'auto'` —
 * the actual horizontal-scroll wrappers, found the same way a real
 * shrink-pressure bug would find them (by what the browser sees), not by
 * which named style constant produced it. */
function scrollWrappers(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('*')).filter((el) => el.style.overflowX === 'auto');
}

function expectAllNonShrinking(container: HTMLElement, minCount = 1) {
  const wrappers = scrollWrappers(container);
  expect(wrappers.length).toBeGreaterThanOrEqual(minCount);
  wrappers.forEach((el) => {
    expect(el.style.flexShrink).toBe('0');
  });
}

describe('SL-1 — horizontal-scroll wrappers declare flexShrink: 0 unconditionally', () => {
  it('SettingsToggles.tsx (relocated RACI matrix wrapper) + views/RegulatoryFeedSources.tsx:197 (relocated, 3 source-layer wrappers) — 4 wrappers', () => {
    const { container } = render(<SettingsToggles />);
    expectAllNonShrinking(container, 4);
  });

  it('Cases.tsx:250 — Open/Closed cases table wrapper(s)', () => {
    const { container } = render(<Cases topbar={makeTopbarProps()} onNavigate={() => {}} />);
    expectAllNonShrinking(container);
  });

  it('InvestmentDesign.tsx:244, components/PlanTable.tsx:66, and the relocated opportunity-register wrapper (amendment A20, design_system_spec.md Section 2.9.11 — moved off StudioAsk.tsx onto this screen) — mini-table, plan-table, and register wrappers', () => {
    const { container } = render(<InvestmentDesign />);
    // InvestmentDesign's own miniTableWrapStyle sites, PlanTable's own
    // tableWrapStyle, and the relocated opportunity-register's own scroll
    // wrapper all render in this one default view.
    expectAllNonShrinking(container, 3);
  });

  it("views/HomePanels.tsx:475 — 'Risk posture by domain' table wrapper", () => {
    const { container } = render(
      <HomePanels visibleKeys={['posture']} currentRoleKey="cro" onNavigate={() => {}} />,
    );
    expectAllNonShrinking(container);
  });

  it('views/RegulatoryFeedLifecycle.tsx:110, RegulatoryFeedInforce.tsx:50 — OnSide feed sub-sections (RegulatoryFeedSources relocated to Settings, L3 UPDATE)', () => {
    const { container } = render(<OnSideFeed />);
    // "Newly proposed" + "Pending & tracked" (Lifecycle, same const twice)
    // and In force (Inforce) render by default on this screen; Sources'
    // three source-layer wrappers moved to SettingsToggles.tsx (see the
    // SettingsToggles case above).
    expectAllNonShrinking(container, 3);
  });

  it('views/DomainsAccordion.tsx:264 — domain gaps/open-items table wrapper', () => {
    const domain = DOMAINS[0];
    if (!domain) throw new Error('fixture assumption broken: data/onside.ts DOMAINS is empty');
    const { container } = render(
      <DomainsAccordion
        domains={[domain]}
        expandedKeys={new Set([domain.key])}
        onToggle={() => {}}
        pendingScrollKey={null}
        onScrollHandled={() => {}}
      />,
    );
    expectAllNonShrinking(container);
  });

  it('views/ReportView.tsx:406 — report TableSection wrapper (reached via Reporting’s shared Drawer)', () => {
    render(<Reporting onNavigate={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Gap Closure Board Approval Report' }));
    const dialog = screen.getByRole('dialog');
    expectAllNonShrinking(dialog, 1);
  });
});
