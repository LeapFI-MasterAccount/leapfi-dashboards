/**
 * Studio · Roadmap regression tests (D17): every test pins PORTED V1
 * BEHAVIOR, citing its base-page line anchor (leapfi-platform.html @
 * 1c230fe) or survey_map.md section. Tests observe the app — they never
 * adapt it.
 *
 * Fix-wave STU-11 (TEST MAINTENANCE per the dispatch rule): the earlier
 * suite pinned the fabricated static 30-"Sprint N" Gantt; the screen now
 * derives the Gantt from the LIVE plan (demoStore.computeLivePlan) the way
 * base renderGantt does (leapfi-platform.html:1305-1355, called from
 * recompute() on every lever change), so these expectations are updated to
 * the base-correct live derivation at DEFAULT_SLIDERS (amb 3 / tol 52 /
 * speed 50 / $450k / roi 2.5 / eff 70 → threshold 65, eff 0.70). Values
 * below were produced by EXECUTING engine/plan.ts computePlan at those
 * levers against the 15-play OPPS catalog (D17 discipline).
 *
 * Base anchors pinned here:
 *  - three-year phase grouping + names, in order, VERBATIM group headers:
 *    "Year 1 · tactical" (1330), "Year 2 · expansion" (1348),
 *    "Year 3 · vision" (1351)
 *  - rm-kpis 4-tile row (1308-1312): Year 1 investment / Annual value at
 *    adoption / Expected 3-yr ROI vs hurdle / Blended payback
 *  - Year 1 = funded plays, foundational first then cost/value ratio,
 *    chipped into quarters (1314-1326); Year 2 = bench + the gated plays
 *    on the Unified-data-foundation spine (1341-1346); Year 3 = the
 *    remaining gated plays (1347-1351)
 *  - "sprint 1 in progress": renderPipe's hardcoded fact (4298-4314) /
 *    demo_script Step 6 say line — mapped to the FIRST Year-1 play
 *    segment, the only in-progress segment
 *  - "What's next" module ordering Connect → AllRailz → Vantage:
 *    demo_script Step 6 say-line ordering, module records SOON (base
 *    3735-3769, ported verbatim in data/misc.ts)
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Roadmap } from '../../screens/Roadmap';
import type { RoadmapProps } from '../../screens/Roadmap';
import type { TopbarProps } from '../../components/Topbar';
import { resetDemo } from '../../state/demoStore';

const topbar: TopbarProps = {
  breadcrumb: 'Studio · Roadmap',
  onOpenBoardDeck: () => {},
  date: 'Aug 19, 2026',
  profile: { name: 'Rachel Fischer', initials: 'RF' },
  profileMenuItems: [],
};

function renderScreen(overrides?: Partial<RoadmapProps>) {
  return render(<Roadmap topbar={topbar} onNavigate={() => {}} {...overrides} />);
}

beforeEach(() => {
  // The screen reads the shared live store (levers + opportunity pool) —
  // restore DEFAULT_SLIDERS / the seeded 15-play catalog between tests.
  resetDemo();
});

describe('Roadmap live gantt (base renderGantt 1305-1355 from the live plan; STU-11)', () => {
  it('renders the three year phases in base order with the VERBATIM base group headers (1330/1348/1351)', () => {
    const { container } = renderScreen();
    const phaseNames = Array.from(container.querySelectorAll('[data-lf-composite="roadmap-gantt-phase"]')).map(
      (phase) => phase.querySelector('span')?.textContent,
    );
    expect(phaseNames).toEqual(['Year 1 · tactical', 'Year 2 · expansion', 'Year 3 · vision']);
  });

  it('summarizes the LIVE funded plan with Sprint 1 in progress (renderPipe fact 4298-4314; plan at DEFAULT_SLIDERS: 7 funded, $400k)', () => {
    renderScreen();
    expect(
      screen.getByText('7 plays funded in Year 1 · $400k committed · sequenced by your horizon lever · Sprint 1 in progress.'),
    ).toBeInTheDocument();
  });

  it('marks the first Year-1 play segment as the only in-progress segment; Years 2/3 carry their live queue counts (base 1314-1351)', () => {
    const { container } = renderScreen();
    const phases = Array.from(container.querySelectorAll('[data-lf-composite="roadmap-gantt-phase"]'));
    expect(phases).toHaveLength(3);
    // Year 1 ordering (base 1314-1317): foundational first, then
    // cost/value ratio — at DEFAULT_SLIDERS the first funded play is
    // Loan-document summarization, the in-progress "sprint 1".
    expect(phases[0]?.textContent).toContain('Loan-document summarization · In progress');
    // Year 2 (base 1341-1346): bench (Deposit pricing optimization,
    // Unified data foundation) + the 3 UDF-spine gated plays = 5.
    expect(phases[1]?.textContent).toContain('5 sprints');
    expect(phases[1]?.textContent).not.toContain('In progress');
    // Year 3 (base 1347-1351): the remaining 3 gated plays.
    expect(phases[2]?.textContent).toContain('3 sprints');
    expect(phases[2]?.textContent).not.toContain('In progress');
  });

  it('renders the rm-kpis row live-derived from the plan (base 1308-1312): investment, value at adoption, ROI vs hurdle, payback', () => {
    renderScreen();
    const kpis = screen.getByRole('group', { name: 'Roadmap economics' });
    expect(kpis).toHaveTextContent('Year 1 investment');
    expect(kpis).toHaveTextContent('$400k');
    expect(kpis).toHaveTextContent('of $450k envelope · 7 plays funded');
    expect(kpis).toHaveTextContent('Annual value');
    expect(kpis).toHaveTextContent('$879k');
    expect(kpis).toHaveTextContent('at 70% adoption, full ramp');
    expect(kpis).toHaveTextContent('Expected 3-yr ROI');
    expect(kpis).toHaveTextContent('6.6×');
    expect(kpis).toHaveTextContent('clears your 2.5× hurdle');
    expect(kpis).toHaveTextContent('Blended payback');
    expect(kpis).toHaveTextContent('5 mo');
  });

  it('places the funded plays in the Year-1 quarters and the UDF spine in Year 2 (base chip layout 1321-1351)', () => {
    renderScreen();
    const main = screen.getByRole('main');
    const text = main.textContent ?? '';
    // Year-1 funded chips exist with play semantics, not generic sprints.
    expect(text).toContain('Loan-document summarization');
    expect(text).toContain('Call-center copilot');
    // Year 2 leads with the Unified data foundation (base 1341-1343).
    expect(text).toContain('Unified data foundation');
    expect(text).toContain('leads the year · first call on the envelope');
    // The UDF link line between the years (base glink, 1340).
    expect(text).toContain('The Unified data foundation leads Year 2 · the plays that depend on it sequence behind it');
    // No fabricated "Sprint N" chip rows anywhere (STU-11).
    expect(text).not.toMatch(/Sprint \d+ of 30/);
  });
});

describe("What's next module ordering (demo_script Step 6 say line; SOON base 3735-3769)", () => {
  it('renders Connect, AllRailz, Vantage cards in that order, Connect first (§5.6 primary-CTA reading-order primacy)', () => {
    renderScreen();
    const main = screen.getByRole('main');
    const text = main.textContent ?? '';
    const connectIndex = text.indexOf('LeapFI · Connect');
    const allrailzIndex = text.indexOf('LeapFI · AllRailz');
    const vantageIndex = text.indexOf('LeapFI · Vantage');

    expect(connectIndex).toBeGreaterThan(-1);
    expect(allrailzIndex).toBeGreaterThan(-1);
    expect(vantageIndex).toBeGreaterThan(-1);
    expect(connectIndex).toBeLessThan(allrailzIndex);
    expect(allrailzIndex).toBeLessThan(vantageIndex);
  });

  it('each module card carries its base tagline (SOON.tag, base 3735-3769 verbatim port)', () => {
    renderScreen();
    expect(screen.getByText('The MCP and API layer of LeapFI · OnSide')).toBeInTheDocument();
    expect(screen.getByText('The agentic runtime')).toBeInTheDocument();
    expect(screen.getByText('Agentic third-party oversight')).toBeInTheDocument();
  });
});

describe('play chips open full scope (fix B-dead-interactions-04 — the year note\'s own "Click one for full scope." copy, base gantt data-play chips 1324, delegated click 4493-4499)', () => {
  it('every chip is a real, keyboard-operable button — not the plain, inert div it was', () => {
    renderScreen();
    // Year 1 (quarters): the funded play used elsewhere in this suite as
    // the first Year-1 chip.
    expect(screen.getByRole('button', { name: /Loan-document summarization/ })).toBeInTheDocument();
    // Year 2: the Unified data foundation chip.
    expect(screen.getByRole('button', { name: /Unified data foundation/ })).toBeInTheDocument();
  });

  it('a Year-1 chip press deep-links to Investment Design\'s play drawer (nav-payload — App.tsx "NAVIGATION-WITH-PAYLOAD / DEEP LINKS")', () => {
    const onDeepLink = vi.fn();
    renderScreen({ onDeepLink });
    fireEvent.click(screen.getByRole('button', { name: /Loan-document summarization/ }));
    expect(onDeepLink).toHaveBeenCalledWith({
      screen: 'studio.investment-design',
      kind: 'play',
      id: 'Loan-document summarization',
    });
  });

  it('a Year-2/3 chip press deep-links with that play\'s own name (Year 2 leads with the Unified data foundation, base 1341-1343)', () => {
    const onDeepLink = vi.fn();
    renderScreen({ onDeepLink });
    fireEvent.click(screen.getByRole('button', { name: /Unified data foundation/ }));
    expect(onDeepLink).toHaveBeenCalledWith({
      screen: 'studio.investment-design',
      kind: 'play',
      id: 'Unified data foundation',
    });
  });

  it('without an onDeepLink prop, a chip press is a harmless no-op (optional prop — bare-mount screen tests keep passing)', () => {
    renderScreen();
    expect(() => fireEvent.click(screen.getByRole('button', { name: /Loan-document summarization/ }))).not.toThrow();
  });
});
