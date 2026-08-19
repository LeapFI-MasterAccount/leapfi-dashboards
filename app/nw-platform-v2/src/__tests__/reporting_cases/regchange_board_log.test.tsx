/**
 * D17 regression — regchange standing table + board-log save sub-flow.
 *
 * Base anchors (leapfi-platform.html @ 1c230fe):
 *  - `boardStandingHTML()` rows literal, source 3595-3603: the standing
 *    7-row table. The "Log an update →" affordance is hand-written into
 *    EXACTLY the two `open`-status rows' cite markup — 2026-13 and 2026-C1,
 *    source 3596-3597; the five tracking/closed rows have none.
 *  - `boardUpdate(id)`, source 3577-3587: drawer form ("Log an update ·
 *    {id}" title, date input, update textarea, Save update button).
 *  - `boardSave(id)`, source 3589-3593:
 *      3590  trim-guard — `var txt=$('bu-txt').value.trim();
 *            if(!txt){$('bu-txt').focus();return;}`
 *      3591  unshift `{txt, when:'Aug 15, 2026',
 *            who:CURRENT.first+' '+(CURRENT.role||''), date:trim}`
 *      3592  reveal "Saved to the standing view" pill (#bu-ok), then
 *            `setTimeout(function(){closeDrawer();openReport('regchange');},900)`
 *
 * The port swaps the SAME shared drawer's content back to the regchange
 * report after the base's 900ms delay (sequential content swap, never a
 * second drawer). The reopened report shows the appended entry under the
 * row's "What we are doing" cell (gate dispatch: "return to the regchange
 * report showing it").
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Reporting } from '../../screens/Reporting';
import { BOARD_LOG } from '../../data/boardLog';
import { topbarFixture } from './fixtures';

/** Pinned expectation data (hardcoded from the base rows literal, source
 * 3596-3602): title → whether the row carries the log-an-update affordance. */
const EXPECTED_STANDING_ROWS: Array<{ title: string; hasLogAffordance: boolean }> = [
  { title: 'Interagency Guidance 2026-13 · Model Risk Management', hasLogAffordance: true }, // 3596, open
  { title: 'Reg B Circular 2026-C1 · adverse-action specificity', hasLogAffordance: true }, // 3597, open
  { title: 'New Mexico Artificial Intelligence Act', hasLogAffordance: false }, // 3598, tracking
  { title: 'CFPB §1033 · Personal Financial Data Rights', hasLogAffordance: false }, // 3599, tracking
  { title: 'CTA / BOI reporting volatility', hasLogAffordance: false }, // 3600, tracking
  { title: 'OFAC · sanctions list update (Aug 8)', hasLogAffordance: false }, // 3601, closed
  { title: 'FFIEC CAT sunset transition', hasLogAffordance: false }, // 3602, tracking
];

/** BOARD_LOG is the ported `var BOARD_LOG={}` module singleton (source
 * 3576) — reset it between tests so appended entries never leak. */
function resetBoardLog(): void {
  for (const key of Object.keys(BOARD_LOG)) {
    delete BOARD_LOG[key];
  }
}

function openRegchangeDrawer(): HTMLElement {
  fireEvent.click(screen.getByRole('button', { name: /Regulatory Change Briefing/ }));
  return screen.getByRole('dialog');
}

describe('regchange standing table (base boardStandingHTML 3595-3603)', () => {
  beforeEach(resetBoardLog);
  afterEach(resetBoardLog);

  it("renders the 7 standing rows with 'Log an update' on exactly the two open rows (base 3596-3597)", () => {
    render(<Reporting topbar={topbarFixture()} onNavigate={() => {}} />);
    const dialog = openRegchangeDrawer();

    const table = within(dialog).getByRole('table', { name: 'Regulatory change standing view' });
    const rows = within(table).getAllByRole('row');
    // 1 header row + the base literal's 7 standing rows.
    expect(rows).toHaveLength(1 + EXPECTED_STANDING_ROWS.length);

    // Exactly 2 affordances in the whole table (base gating, 3596-3597).
    expect(within(table).getAllByRole('button', { name: 'Log an update →' })).toHaveLength(2);

    // And they sit on exactly the two open rows, none of the other five.
    for (const expected of EXPECTED_STANDING_ROWS) {
      const cell = within(table).getByText(expected.title);
      const row = cell.closest('tr');
      expect(row).not.toBeNull();
      const buttons = within(row as HTMLElement).queryAllByRole('button', { name: 'Log an update →' });
      expect(buttons).toHaveLength(expected.hasLogAffordance ? 1 : 0);
    }
  });
});

describe('board-log save (base boardUpdate 3577-3587 / boardSave 3589-3593)', () => {
  beforeEach(() => {
    resetBoardLog();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    resetBoardLog();
  });

  it('trim-guard: whitespace-only text saves nothing, shows no pill, and focuses the textarea (base 3590)', () => {
    render(<Reporting topbar={topbarFixture()} onNavigate={() => {}} />);
    const dialog = openRegchangeDrawer();

    fireEvent.click(within(dialog).getAllByRole('button', { name: 'Log an update →' })[0] as HTMLElement);
    expect(within(dialog).getByRole('heading', { name: 'Log an update · 2026-13' })).toBeInTheDocument();

    const textarea = within(dialog).getByLabelText('Update');
    fireEvent.change(textarea, { target: { value: '   ' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save update' }));

    expect(BOARD_LOG['2026-13']).toBeUndefined();
    expect(within(dialog).queryByText('Saved to the standing view')).not.toBeInTheDocument();
    expect(textarea).toHaveFocus();
    // Still on the form — the 900ms swap never armed.
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(within(dialog).getByRole('heading', { name: 'Log an update · 2026-13' })).toBeInTheDocument();
  });

  it('save appends {txt, when, who, date}, reveals the pill, and swaps back to the regchange report after 900ms showing the entry (base 3591-3592)', () => {
    render(<Reporting topbar={topbarFixture()} onNavigate={() => {}} />);
    const dialog = openRegchangeDrawer();

    fireEvent.click(within(dialog).getAllByRole('button', { name: 'Log an update →' })[0] as HTMLElement);
    expect(within(dialog).getByRole('heading', { name: 'Log an update · 2026-13' })).toBeInTheDocument();

    fireEvent.change(within(dialog).getByLabelText('Expected compliance date'), { target: { value: '  Q1 2027 ' } });
    fireEvent.change(within(dialog).getByLabelText('Update'), {
      target: { value: 'Validation clauses signed for 6 of 9 legacy contracts.' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save update' }));

    // Entry appended with the who/when stamp (base 3591: when hardcoded
    // 'Aug 15, 2026'; who = CURRENT.first + ' ' + CURRENT.role — the boot
    // persona is Rachel Fischer, Chief Risk Officer; date is trimmed).
    expect(BOARD_LOG['2026-13']).toEqual([
      {
        txt: 'Validation clauses signed for 6 of 9 legacy contracts.',
        when: 'Aug 15, 2026',
        who: 'Rachel Chief Risk Officer',
        date: 'Q1 2027',
      },
    ]);

    // Saved pill revealed (#bu-ok, base 3585/3592), form still up pre-900ms.
    expect(within(dialog).getByText('Saved to the standing view')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(899);
    });
    expect(within(dialog).getByRole('heading', { name: 'Log an update · 2026-13' })).toBeInTheDocument();

    // At 900ms the same drawer swaps back to the regchange report
    // (base `closeDrawer();openReport('regchange')`, 3592) …
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(within(dialog).getByRole('heading', { name: 'Regulatory Change Briefing' })).toBeInTheDocument();

    // … showing the just-logged entry on the standing view.
    const table = within(dialog).getByRole('table', { name: 'Regulatory change standing view' });
    expect(
      within(table).getByText(
        'Validation clauses signed for 6 of 9 legacy contracts. — logged Aug 15, 2026 · Rachel Chief Risk Officer · target Q1 2027',
      ),
    ).toBeInTheDocument();
  });
});
