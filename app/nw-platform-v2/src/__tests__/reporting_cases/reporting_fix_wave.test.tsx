/**
 * Reporting fix-wave regressions (findings RPT-01, RPT-03, RPT-04 consumer
 * side, RPT-05, RPT-06, RPT-07, RPT-08, RPT-09, RPT-11).
 *
 * Every pinned expectation is anchored to leapfi-platform.html @ 1c230fe:
 *  - RPT-01: drawer-only @media print stylesheet, source 758; repprint 1481.
 *  - RPT-03: `dr.classList.add('wide')` on every openReport, source 1679;
 *    `.drawer.wide{width:min(920px,97vw)}`, source 326; boardUpdate's form
 *    drawer is NOT wide (`showDrawer(html,false)`, 3577-3587).
 *  - RPT-04: openReport recomputes from the live levers on every open
 *    (`var P=computePlan(), L=P.L`, source 1477).
 *  - RPT-05: C7 trap boundary — focus must stay inside the open dialog
 *    across the board-log sub-flow's in-drawer content swaps.
 *  - RPT-06: base line 3592's unconditional 900ms timer is NOT demo-safe;
 *    the twin cancels it on close/open/board-log user actions (deliberate
 *    divergence, Reporting.tsx file-header KNOWN DIVERGENCE).
 *  - RPT-07: gapboard per-case blocks — Before/After language, "Prepared
 *    by" attribution, minutes line, source 1493-1502.
 *  - RPT-08: regchange non-chart content — examiner pill + Export board
 *    pack (3608), Determination provenance (3609), "No deck assembled…"
 *    (3605), row-1 status literal '2 workstreams open' (3596), index-card
 *    "Updates logged in place." (3715).
 *  - RPT-09: board report = the real presentation deck (boardDeck,
 *    2393-2447; deck-nav line 1521) + a simultaneously visible appendix
 *    (1523-1531).
 *  - RPT-11: head() per-report subtitles (1479-1482, mrm 1591), tile()
 *    sub-captions (roi 1672), hand-written docLink text (mrm calendar
 *    1611-1613 — no DOCLIB-title 'pre-staged … pre-staged' glitch).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Reporting } from '../../screens/Reporting';
import { APPROVAL, CASES, seedCases } from '../../data/cases';
import { BOARD_LOG } from '../../data/boardLog';
import { DOCLIB } from '../../data/doclib';
import { DEFAULT_SLIDERS, setDemoSliders } from '../../state/demoStore';
import { topbarFixture } from './fixtures';

function resetSingletons(): void {
  for (const key of Object.keys(BOARD_LOG)) delete BOARD_LOG[key];
  CASES.length = 0;
  // setDemoSliders emits a store write; components may still be mounted when
  // the afterEach runs (RTL cleanup is a later hook), so wrap in act.
  act(() => {
    setDemoSliders({ ...DEFAULT_SLIDERS });
  });
}

function openReportDrawer(cardName: RegExp): HTMLElement {
  fireEvent.click(screen.getByRole('button', { name: cardName }));
  return screen.getByRole('dialog');
}

beforeEach(resetSingletons);
afterEach(resetSingletons);

describe('RPT-03 — wide drawer variant (base 1679 / 326 / 3577)', () => {
  it('reports render in the wide drawer; the board-log form drawer is default width (base showDrawer(html,false))', () => {
    render(<Reporting topbar={topbarFixture()} onNavigate={() => {}} />);
    const dialog = openReportDrawer(/Regulatory Change Briefing/);
    expect(dialog).toHaveAttribute('data-size', 'wide');
    expect(dialog.style.width).toBe('min(920px, 97vw)');

    fireEvent.click(within(dialog).getAllByRole('button', { name: 'Log an update →' })[0] as HTMLElement);
    expect(screen.getByRole('dialog')).toHaveAttribute('data-size', 'default');
  });
});

describe('RPT-01 — ported drawer print stylesheet (base 758)', () => {
  it('mounts the @media print block with the drawer/scrim/close/footer selectors while a report is open', () => {
    render(<Reporting topbar={topbarFixture()} onNavigate={() => {}} />);
    openReportDrawer(/Board Pack/);

    const styles = Array.from(document.querySelectorAll('style'))
      .map((s) => s.textContent ?? '')
      .join('\n');
    expect(styles).toContain('@media print');
    expect(styles).toContain("[data-lf-composite='drawer']");
    expect(styles).toContain("[data-lf-composite='drawer-scrim']");
    expect(styles).toContain('[data-lf-drawer-close]');
    expect(styles).toContain('[data-lf-drawer-footer]');
    expect(styles).toContain('visibility: hidden');
    // White-paper/black-ink override (base `background:#fff!important;color:#111!important`).
    expect(styles).toContain('--ink: #111111 !important');
  });
});

describe('RPT-05 / RPT-06 — board-log sub-flow focus + timer safety', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  function openFormAndSave(dialog: HTMLElement, buttonIndex = 0): void {
    fireEvent.click(within(dialog).getAllByRole('button', { name: 'Log an update →' })[buttonIndex] as HTMLElement);
    fireEvent.change(within(dialog).getByLabelText('Update'), { target: { value: 'Fix-wave regression entry.' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save update' }));
  }

  it('RPT-05: each in-drawer content swap re-places focus on the drawer heading (C7 trap boundary)', () => {
    render(<Reporting topbar={topbarFixture()} onNavigate={() => {}} />);
    const dialog = openReportDrawer(/Regulatory Change Briefing/);

    // Swap 1: report → form (the pressed button unmounts).
    fireEvent.click(within(dialog).getAllByRole('button', { name: 'Log an update →' })[0] as HTMLElement);
    const formHeading = within(dialog).getByRole('heading', { name: 'Log an update · 2026-13' });
    expect(formHeading).toHaveFocus();

    // Swap 2: form → report at the 900ms post-save timer (the focused Save
    // button unmounts).
    fireEvent.change(within(dialog).getByLabelText('Update'), { target: { value: 'Fix-wave regression entry.' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save update' }));
    act(() => {
      vi.advanceTimersByTime(900);
    });
    const reportHeading = within(dialog).getByRole('heading', { name: 'Regulatory Change Briefing' });
    expect(reportHeading).toHaveFocus();
  });

  it('RPT-06: closing the drawer inside the 900ms window cancels the pending swap — the drawer stays closed', () => {
    render(<Reporting topbar={topbarFixture()} onNavigate={() => {}} />);
    const dialog = openReportDrawer(/Regulatory Change Briefing/);
    openFormAndSave(dialog);

    fireEvent.keyDown(dialog, { key: 'Escape' });
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('RPT-06: opening a different report inside the window is not hijacked back to regchange', () => {
    render(<Reporting topbar={topbarFixture()} onNavigate={() => {}} />);
    const dialog = openReportDrawer(/Regulatory Change Briefing/);
    openFormAndSave(dialog);

    fireEvent.click(screen.getByRole('button', { name: /Board Pack/ }));
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    const openDialog = screen.getByRole('dialog');
    expect(within(openDialog).getByRole('heading', { name: 'Board Presentation' })).toBeInTheDocument();
    expect(within(openDialog).queryByRole('heading', { name: 'Regulatory Change Briefing' })).not.toBeInTheDocument();
  });

  it('RPT-06: a fresh form opened inside the window is not destroyed mid-typing', () => {
    render(<Reporting topbar={topbarFixture()} onNavigate={() => {}} />);
    const dialog = openReportDrawer(/Regulatory Change Briefing/);
    openFormAndSave(dialog);

    // Inside the 900ms window: re-open the regchange report (via its index
    // card) and go straight into the OTHER open row's fresh form.
    act(() => {
      vi.advanceTimersByTime(300);
    });
    fireEvent.click(screen.getByRole('button', { name: /Regulatory Change Briefing/ }));
    fireEvent.click(within(dialog).getAllByRole('button', { name: 'Log an update →' })[1] as HTMLElement);
    fireEvent.change(within(dialog).getByLabelText('Update'), { target: { value: 'typing…' } });
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(within(dialog).getByRole('heading', { name: 'Log an update · 2026-C1' })).toBeInTheDocument();
    expect((within(dialog).getByLabelText('Update') as HTMLTextAreaElement).value).toBe('typing…');
  });

  it('base-parity path unchanged: undisturbed save still swaps back to the regchange report at 900ms (base 3592)', () => {
    render(<Reporting topbar={topbarFixture()} onNavigate={() => {}} />);
    const dialog = openReportDrawer(/Regulatory Change Briefing/);
    openFormAndSave(dialog);
    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(within(dialog).getByRole('heading', { name: 'Regulatory Change Briefing' })).toBeInTheDocument();
  });
});

describe('RPT-04 — reports recompute from the LIVE levers (base 1477)', () => {
  it('a lever change re-renders the open Investment Plan from the new position', () => {
    render(<Reporting topbar={topbarFixture()} onNavigate={() => {}} />);
    const dialog = openReportDrawer(/Investment Plan/);

    // Boot position funds a non-empty portfolio…
    expect(within(dialog).queryByText('Funded now (0)')).not.toBeInTheDocument();

    // …and zeroing the budget live must show zero funded, like the base's
    // recompute-from-live-levers on open.
    act(() => {
      setDemoSliders({ ...DEFAULT_SLIDERS, budget: 0 });
    });
    expect(within(dialog).getByText('Funded now (0)')).toBeInTheDocument();
  });
});

describe('RPT-07 — gapboard per-case language blocks (base 1493-1502)', () => {
  it('renders Before/After language, the Prepared-by attribution, and the minutes line for a committee case', () => {
    seedCases(DOCLIB);
    const boardCase = CASES[0];
    expect(boardCase).toBeDefined();
    if (!boardCase) return;
    // Advance it to the committee queue exactly as the CRO's conditional
    // approval would (`boardCases()` filter, base 2797).
    boardCase.stage = 'committee';
    boardCase.cond = APPROVAL.conditions[0] ?? null;

    render(<Reporting topbar={topbarFixture()} onNavigate={() => {}} />);
    const dialog = openReportDrawer(/Gap Closure Board Approval Report/);

    expect(within(dialog).getByText('Before · in force until this is adopted')).toBeInTheDocument();
    expect(within(dialog).getByText('After · for the committee’s approval')).toBeInTheDocument();
    // The drafted language, exactly as the intro promises ('adopt the
    // language exactly as it reads here').
    expect(within(dialog).getByText(boardCase.lang)).toBeInTheDocument();
    const oldLang = DOCLIB[boardCase.doc]?.redline?.old ?? '';
    expect(oldLang).not.toBe('');
    expect(within(dialog).getByText(oldLang)).toBeInTheDocument();
    expect(within(dialog).getByText(/Prepared by:/)).toBeInTheDocument();
    expect(
      within(dialog).getByText(/Minutes to be attached to the case after the vote/),
    ).toBeInTheDocument();
  });
});

describe('RPT-08 — regchange dropped content restored (base 3596/3605/3608/3609/3715)', () => {
  it('renders the examiner pill, Export board pack, Determination provenance, the base intro close, and the row-1 status literal', () => {
    render(<Reporting topbar={topbarFixture()} onNavigate={() => {}} />);
    const dialog = openReportDrawer(/Regulatory Change Briefing/);

    expect(
      within(dialog).getByText('The same record answers the examiner asking how the board stayed informed'),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: '⎙ Export board pack' })).toBeInTheDocument();
    expect(within(dialog).getByText('Determination provenance')).toBeInTheDocument();
    expect(within(dialog).getByText(/Directors get the reasoning along with the conclusion/)).toBeInTheDocument();
    expect(within(dialog).getByText(/No deck assembled the week before the meeting\./)).toBeInTheDocument();
    // Row-1 status literal (base 3596), not the flattened generic 'Open'.
    const table = within(dialog).getByRole('table', { name: 'Regulatory change standing view' });
    expect(within(table).getByText('2 workstreams open')).toBeInTheDocument();
  });

  it("index card carries the base's full copy incl. 'Updates logged in place.' (base 3715)", () => {
    render(<Reporting topbar={topbarFixture()} onNavigate={() => {}} />);
    const card = screen.getByRole('button', { name: /Regulatory Change Briefing/ });
    expect(card.textContent).toContain('Updates logged in place.');
  });
});

describe('RPT-09 — board report: real presentation deck + simultaneously visible appendix (base 1507-1532, 2393-2447)', () => {
  it('renders the deck-nav line, the title slide, and the flat appendix at the same time', () => {
    render(<Reporting topbar={topbarFixture()} onNavigate={() => {}} />);
    const dialog = openReportDrawer(/Board Pack/);

    // Base 1521: 'The board presentation · N slides · risk then opportunity'
    // — boardDeck builds 12 slides.
    expect(within(dialog).getByText('The board presentation · 12 slides · risk then opportunity')).toBeInTheDocument();
    // Deck slide 1 (title slide, base 2400).
    expect(within(dialog).getByText('LEAPFI PLATFORM · BOARD REVIEW · AUG 2026')).toBeInTheDocument();
    // Appendix visible SIMULTANEOUSLY — separately headed (base 1522), with
    // the rrec paragraph and the five tiles, never behind slide navigation.
    expect(within(dialog).getByText('The appendix · the one-page read behind the deck')).toBeInTheDocument();
    expect(within(dialog).getByText(/risk tolerance and a .* annual budget, the plan funds/)).toBeInTheDocument();
    expect(within(dialog).getAllByText('Plays funded').length).toBeGreaterThan(0);
    expect(within(dialog).getByText('Recommended first moves')).toBeInTheDocument();
  });
});

describe('RPT-11 — report chrome fidelity (base 1479-1482 head(), tile subs, docLink text)', () => {
  it('renders the base category line and the per-report mrm subtitle with the owner attribution (base 1591)', () => {
    render(<Reporting topbar={topbarFixture()} onNavigate={() => {}} />);
    const dialog = openReportDrawer(/Model Risk Report/);

    expect(within(dialog).getByText('LEAPFI · Reporting · generated from the live record')).toBeInTheDocument();
    expect(
      within(dialog).getByText(
        'Register status · A. Kaur · Model Risk Manager · Interagency Guidance 2026-13 · NorthWinds Credit Union · illustrative model on sample data',
      ),
    ).toBeInTheDocument();
  });

  it("mrm validation calendar reads the base's hand-written text — no duplicated 'pre-staged' (base 1613)", () => {
    render(<Reporting topbar={topbarFixture()} onNavigate={() => {}} />);
    const dialog = openReportDrawer(/Model Risk Report/);

    expect(
      within(dialog).getByText(/interim governance language pre-staged pending RFI 2026-04 final scope/),
    ).toBeInTheDocument();
    expect(dialog.textContent).not.toContain('Pre-staged Language pre-staged');
  });

  it('roi tiles carry the base sub-captions that scope the numbers (base 1672)', () => {
    render(<Reporting topbar={topbarFixture()} onNavigate={() => {}} />);
    const dialog = openReportDrawer(/Investment & ROI/);

    expect(within(dialog).getByText('est. 10% of NIE')).toBeInTheDocument();
    expect(within(dialog).getByText('conservative 12%')).toBeInTheDocument();
    expect(within(dialog).getByText('year one run rate')).toBeInTheDocument();
  });
});
