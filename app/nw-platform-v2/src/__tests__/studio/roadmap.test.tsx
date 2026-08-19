/**
 * Studio · Roadmap regression tests (D17): every test pins PORTED V1
 * BEHAVIOR, citing its base-page line anchor (leapfi-platform.html @
 * 1c230fe) or survey_map.md section. Tests observe the app — they never
 * adapt it.
 *
 * Base anchors pinned here:
 *  - three-year phase grouping + names, in order: base renderGantt group
 *    headers — "Year 1 · tactical" (1330), "Year 2 · expansion" (1348),
 *    "Year 3 · vision" (1351)
 *  - "sprint 1 in progress": base renderPipe hardcoded "sprint 1 in
 *    progress" (4298-4314) and demo_script Step 6 say line ("Sprint 1 is
 *    in progress on that screen right now"); 30-sprint total per
 *    demo_script Step 6 "See" line
 *  - "What's next" module ordering Connect → AllRailz → Vantage:
 *    demo_script Step 6 say-line ordering, module records SOON (base
 *    3735-3769, ported verbatim in data/misc.ts)
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Roadmap } from '../../screens/Roadmap';
import type { TopbarProps } from '../../components/Topbar';

const topbar: TopbarProps = {
  breadcrumb: 'Studio · Roadmap',
  onOpenBoardDeck: () => {},
  date: 'Aug 19, 2026',
  profile: { name: 'Rachel Fischer', initials: 'RF' },
  profileMenuItems: [],
};

function renderScreen() {
  return render(<Roadmap topbar={topbar} onNavigate={() => {}} />);
}

describe('Roadmap gantt ordering (base renderGantt year headers 1330/1348/1351; renderPipe 4298-4314)', () => {
  it('renders the three year phases in base order: Tactical → Expansion → Vision', () => {
    const { container } = renderScreen();
    const phaseNames = Array.from(container.querySelectorAll('[data-lf-composite="roadmap-gantt-phase"]')).map(
      (phase) => phase.querySelector('span')?.textContent,
    );
    expect(phaseNames).toEqual(['Year 1 · Tactical', 'Year 2 · Expansion', 'Year 3 · Vision']);
  });

  it('summarizes "Sprint 1 of 30, in progress" (30-sprint roadmap, sprint 1 live — base 4298-4314 / Step 6 See line)', () => {
    renderScreen();
    expect(screen.getByText('Sprint 1 of 30, in progress (Sprint 1).')).toBeInTheDocument();
  });

  it('marks Sprint 1 (Year 1) as the only in-progress sprint; Years 2 and 3 show 10 upcoming sprints each', () => {
    const { container } = renderScreen();
    const phases = Array.from(container.querySelectorAll('[data-lf-composite="roadmap-gantt-phase"]'));
    expect(phases).toHaveLength(3);
    // Trailing status text per phase row: current-sprint callout on Year 1
    // only (base: sprint 1 hardcoded in progress, 4298-4314).
    expect(phases[0]?.textContent).toContain('Sprint 1 · In progress');
    expect(phases[1]?.textContent).toContain('10 sprints');
    expect(phases[1]?.textContent).not.toContain('In progress');
    expect(phases[2]?.textContent).toContain('10 sprints');
    expect(phases[2]?.textContent).not.toContain('In progress');
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
