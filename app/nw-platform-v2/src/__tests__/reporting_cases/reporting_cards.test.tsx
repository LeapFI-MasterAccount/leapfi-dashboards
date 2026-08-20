/**
 * D17 regression — Reporting index: 11 report cards exactly.
 *
 * Base anchors (leapfi-platform.html @ 1c230fe):
 *  - `osReports()` card index, source 3710-3725: 9 cards, in `rc()` call
 *    order — board, regchange, posture, compliance, mrm, tprm, infosec,
 *    roi, gapboard.
 *  - `openReport()` kinds, source 1474-1686: 11 real report kinds — `plan`
 *    and `roadmap` exist as reports in the base engine but had no card
 *    (no `openReport('plan'|'roadmap')` call site anywhere in source).
 *    The port adds cards for the two unreached kinds per revision_plan.md
 *    §3.5 / parity_ia_addendum.md §1.3 ("cards ADDED for unreached kinds,
 *    nothing cut") — the dispatch pins ELEVEN cards exactly: the base nine
 *    in `osReports()`'s own sequence, then plan and roadmap appended.
 */
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { Reporting } from '../../screens/Reporting';

/** Pinned expectation data (hardcoded, not derived from app exports): the
 * base `osReports()` card titles in call order (source 3714-3722), then the
 * two added-for-unreached-kind cards (plan, roadmap). */
const EXPECTED_CARD_TITLES_IN_ORDER = [
  'Board Pack', // rc('board', ...) — source 3714
  'Regulatory Change Briefing', // rc('regchange', ...) — 3715
  'Risk Posture & Targets', // rc('posture', ...) — 3716
  'Compliance · Open Items', // rc('compliance', ...) — 3717
  'Model Risk Report', // rc('mrm', ...) — 3718
  'Third-Party & Vendor Risk', // rc('tprm', ...) — 3719
  'IT & Information Security', // rc('infosec', ...) — 3720
  'Investment & ROI', // rc('roi', ...) — 3721
  'Gap Closure Board Approval Report', // rc('gapboard', ...) — 3722
  'Investment Plan', // unreached kind `plan` (openReport 1544-1560) — added card
  'Sequencing Roadmap', // unreached kind `roadmap` (openReport 1561-1600) — added card
];

describe('Reporting index (base osReports 3710-3725 + openReport kinds 1474-1686)', () => {
  it('renders exactly 11 report cards, base 9 in osReports() order with plan/roadmap appended', () => {
    render(<Reporting onNavigate={() => {}} />);

    // The index main region contains the card grid and nothing else pressable.
    const main = screen.getByRole('main');
    const cards = within(main).getAllByRole('button');
    expect(cards).toHaveLength(11);

    EXPECTED_CARD_TITLES_IN_ORDER.forEach((title, index) => {
      expect(cards[index]?.textContent).toContain(title);
    });
  });

  it('pressing a card opens the shared drawer report with that report title (base openReport head(), 1474-1686)', () => {
    render(<Reporting onNavigate={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /Regulatory Change Briefing/ }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Regulatory Change Briefing' })).toBeInTheDocument();
  });
});
