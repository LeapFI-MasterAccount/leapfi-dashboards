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
 * Each `it` below renders the real screen/view (no test-only wrapper
 * markup) and asserts every DOM node the component itself gave
 * `overflowX: 'auto'` also carries `flexShrink: 0` — a computed-style
 * assertion, not a source-text grep, so it fails honestly if the fix is
 * reverted or scoped to the wrong element.
 */
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { OnSideOwnership } from '../../screens/OnSideOwnership';
import { StudioAsk } from '../../screens/StudioAsk';
import { Cases } from '../../screens/Cases';
import { InvestmentDesign } from '../../screens/InvestmentDesign';
import { OnSideFeed } from '../../screens/OnSideFeed';
import { Reporting } from '../../screens/Reporting';
import { HomePanels } from '../../views/HomePanels';
import { DomainsAccordion } from '../../views/DomainsAccordion';
import { DOMAINS } from '../../data/onside';
import type { TopbarProps } from '../../components/Topbar';
import { makeTopbarProps } from '../onside/helpers';

const topbar: TopbarProps = {
  breadcrumb: 'Studio',
  onOpenBoardDeck: () => {},
  date: 'Aug 19, 2026',
  profile: { name: 'Rachel Fischer', initials: 'RF' },
  profileMenuItems: [],
};

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
  it('OnSideOwnership.tsx:514 — RACI matrix wrapper', () => {
    const { container } = render(<OnSideOwnership topbar={makeTopbarProps()} onNavigate={() => {}} />);
    expectAllNonShrinking(container);
  });

  it('StudioAsk.tsx:346 — Opportunity register wrapper', () => {
    const { container } = render(<StudioAsk topbar={topbar} onNavigate={() => {}} />);
    expectAllNonShrinking(container);
  });

  it('Cases.tsx:250 — Open/Closed cases table wrapper(s)', () => {
    const { container } = render(<Cases topbar={topbar} onNavigate={() => {}} />);
    expectAllNonShrinking(container);
  });

  it('InvestmentDesign.tsx:244 and components/PlanTable.tsx:66 — mini-table and plan-table wrappers', () => {
    const { container } = render(<InvestmentDesign topbar={topbar} onNavigate={() => {}} />);
    // Both InvestmentDesign's own miniTableWrapStyle sites and PlanTable's
    // own tableWrapStyle render in this one default view.
    expectAllNonShrinking(container, 2);
  });

  it("views/HomePanels.tsx:475 — 'Risk posture by domain' table wrapper", () => {
    const { container } = render(
      <HomePanels visibleKeys={['posture']} currentRoleKey="cro" onNavigate={() => {}} />,
    );
    expectAllNonShrinking(container);
  });

  it('views/RegulatoryFeedLifecycle.tsx:110, RegulatoryFeedInforce.tsx:50, RegulatoryFeedSources.tsx:197 — OnSide feed sub-sections', () => {
    const { container } = render(<OnSideFeed topbar={makeTopbarProps()} onNavigate={() => {}} />);
    // "Newly proposed" + "Pending & tracked" (Lifecycle, same const twice),
    // In force (Inforce), and each source layer (Sources) all render by
    // default on this screen.
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
    render(<Reporting topbar={topbar} onNavigate={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Gap Closure Board Approval Report' }));
    const dialog = screen.getByRole('dialog');
    expectAllNonShrinking(dialog, 1);
  });
});
