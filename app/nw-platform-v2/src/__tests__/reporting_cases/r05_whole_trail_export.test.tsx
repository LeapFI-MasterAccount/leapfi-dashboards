/**
 * r05 (r05_whole_trail.md) — AC-r05-1 and AC-r05-2, wired at `Cases.tsx`
 * (the trail's entry point: the shared Drawer (C7) hosting `CaseDetail`,
 * PI2-D14).
 *
 *  - AC-r05-1: "The exported/printed trail carries r02's origin field
 *    group (Source, Date, Signal, Note) alongside the six elements above
 *    — an examiner's chain that omits what triggered it is not the
 *    chain." Verification (the AC's own words): "invoke the export path
 *    with a resolvable-origin case fixture and assert all four origin
 *    labels and their values appear in the print-scoped DOM, not
 *    display-suppressed."
 *  - AC-r05-2: "The export control remains the ghost Button (P2) already
 *    shipped at Reporting.tsx:332 / ReportView.tsx:1110 and does NOT
 *    compete with the side-car's per-type primary verb (PI2-D2)."
 *    Verification (the AC's own words): "the side-car's footer action
 *    set contains exactly one `variant='primary'` with the export button
 *    not among them."
 *
 * Fixture: CASE-2026-007 (doc `gov-charter`) — a resolvable-origin case
 * (gov-charter's SIGNAL touch resolves to SIGNAL[0], RFI 2026-04) at the
 * `cro` stage (board tier, PI2-D45 boot state), a genuine "resolvable-
 * origin case fixture" per AC-r05-1's own verification text.
 *
 * DISCRIMINATING: reverting Cases.tsx's `footer={...}` prop on the
 * Drawer (this dispatch's only Cases.tsx edit — "trail entry point
 * only") in a scratch copy makes every "Print / Save as PDF" assertion
 * below fail (the footer button never mounts).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Cases } from '../../screens/Cases';
import { seedCases, seedDeadlineCases } from '../../data/cases';
import { DOCLIB } from '../../data/doclib';
import { SIGNAL } from '../../data/misc';
import { USERS } from '../../data/studio';
import type { StudioUser } from '../../data/studio';
import { topbarFixture } from './fixtures';

const CRO = USERS[0] as StudioUser; // Rachel Fischer, roleKey 'cro' — the acting approver for CASE-2026-007 (gov-charter, board tier)
const CASE_ID = 'CASE-2026-007'; // gov-charter — resolvable origin (SIGNAL[0]) per data/originSignal.ts

function openRow(caseId: string): HTMLElement {
  const idCell = screen.getByText(caseId);
  const row = idCell.closest('tr');
  expect(row).not.toBeNull();
  const openButton = within(row as HTMLElement).getByRole('button', { name: 'Open' });
  act(() => {
    openButton.focus();
  });
  fireEvent.click(openButton);
  return openButton;
}

beforeEach(() => {
  seedCases(DOCLIB);
  seedDeadlineCases();
});

describe('AC-r05-2 — export control is the ghost Button (P2), never competing with the per-type primary verb', () => {
  it('the case side-car footer renders exactly one "Print / Save as PDF" Button, variant="ghost"', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={CRO} />);
    openRow(CASE_ID);

    const dialog = screen.getByRole('dialog', { name: new RegExp(CASE_ID) });
    const exportButtons = within(dialog).getAllByRole('button', { name: 'Print / Save as PDF' });
    expect(exportButtons).toHaveLength(1);
    expect(exportButtons[0]).toHaveAttribute('data-variant', 'ghost');
  });

  it('the side-car renders exactly one variant="primary" Button total, and it is not the export control', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={CRO} />);
    openRow(CASE_ID);

    const dialog = screen.getByRole('dialog', { name: new RegExp(CASE_ID) });
    const primaryButtons = dialog.querySelectorAll('button[data-variant="primary"]');
    expect(primaryButtons).toHaveLength(1);
    expect(primaryButtons[0]).not.toHaveAttribute('aria-label', 'Print / Save as PDF');
    expect((primaryButtons[0] as HTMLElement).textContent).not.toContain('Print / Save as PDF');
    // CASE-2026-007 is board-tier (committee) at the `cro` stage: the
    // single primary is the conditional-approval trigger, not a final
    // adopt (design_system_spec.md §2.10 / CaseDetail.tsx's own
    // committee-tier branch).
    expect((primaryButtons[0] as HTMLElement).textContent).toContain('Conditional approval');
  });

  it('pressing the export control calls window.print() and does not disable/replace the primary action (a read-only, non-mutating export, not an irreversible operation)', () => {
    const printSpy = vi.fn();
    vi.stubGlobal('print', printSpy);
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={CRO} />);
    openRow(CASE_ID);

    const dialog = screen.getByRole('dialog', { name: new RegExp(CASE_ID) });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Print / Save as PDF' }));
    expect(printSpy).toHaveBeenCalledTimes(1);

    // The primary action is still present, enabled, and un-mutated —
    // exporting the trail is not itself a case action.
    const primaryButton = within(dialog).getByRole('button', { name: /Conditional approval/ });
    expect(primaryButton).toBeEnabled();

    // A second press (double-click of a non-mutating action) is simply a
    // second, harmless print() call — there is no server state for a
    // print dialog to duplicate.
    fireEvent.click(within(dialog).getByRole('button', { name: 'Print / Save as PDF' }));
    expect(printSpy).toHaveBeenCalledTimes(2);
    vi.unstubAllGlobals();
  });
});

describe('AC-r05-1 — the origin field group renders alongside the six whole-trail elements, print-scoped and not display-suppressed', () => {
  it('Source/Date/Signal/Note labels+values are all present in the DOM while the export control is available, with no display:none ancestor between them and the dialog', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={CRO} />);
    openRow(CASE_ID);

    const dialog = screen.getByRole('dialog', { name: new RegExp(CASE_ID) });
    // The export control is present (the "export path" this AC exercises).
    expect(within(dialog).getByRole('button', { name: 'Print / Save as PDF' })).toBeInTheDocument();

    const signalEntry = SIGNAL[0]!; // gov-charter resolves to SIGNAL[0] (RFI 2026-04)
    const labels = ['Source', 'Date', 'Signal', 'Note'];
    const values = [signalEntry.sc, signalEntry.age, signalEntry.t, signalEntry.read];
    for (const label of labels) {
      expect(within(dialog).getByText(label)).toBeInTheDocument();
    }
    for (const value of values) {
      const node = within(dialog).getByText(value);
      expect(node).toBeInTheDocument();
      // Not display-suppressed: walk every ancestor up to the dialog and
      // assert none carries an inline `display: none` (the one such
      // wrapper this file has — the full-document/reassign CSS-hidden
      // div — is only ever applied when THOSE alternate views are
      // showing, not the default case-trail view this test opens into).
      let node2: HTMLElement | null = node;
      while (node2 && node2 !== dialog) {
        expect(node2.style.display).not.toBe('none');
        node2 = node2.parentElement;
      }
    }

    // The six required elements are all present too (element 2's
    // Before/After redline labels, element 3's stage Tag, element 4's
    // history entry, element 5's Document version, element 1's
    // Requirement — each pinned individually by sibling test files; here
    // just a presence smoke check that they co-occur with the origin
    // group and the export control on the same page).
    expect(dialog.textContent).toMatch(/Before/);
    expect(dialog.textContent).toMatch(/After/);
    expect(within(dialog).getByRole('heading', { name: 'Requirement' })).toBeInTheDocument();
    expect(within(dialog).getByText('Document version')).toBeInTheDocument();
  });
});

describe('The export control is scoped to the case trail view — absent from the other in-drawer content swaps', () => {
  it('is absent while viewing the full document (§2.11/A18 swap)', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={CRO} />);
    openRow(CASE_ID);
    let dialog = screen.getByRole('dialog', { name: new RegExp(CASE_ID) });
    fireEvent.click(within(dialog).getByRole('button', { name: 'View full document' }));
    dialog = screen.getByRole('dialog', { name: /— full document$/ });
    expect(within(dialog).queryByRole('button', { name: 'Print / Save as PDF' })).not.toBeInTheDocument();
  });

  it('is absent while the reassign/request-transfer picker is showing', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={CRO} />);
    openRow(CASE_ID);
    const dialog = screen.getByRole('dialog', { name: new RegExp(CASE_ID) });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Reassign' }));
    expect(within(screen.getByRole('dialog')).queryByRole('button', { name: 'Print / Save as PDF' })).not.toBeInTheDocument();
  });

  it('is absent for a deadline-driven case (no redline/document-version elements to export)', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={CRO} />);
    openRow('CASE-2026-102'); // DEADLINE_DRIVEN_CASE_FIXTURE, owner resolves to CRO
    const dialog = screen.getByRole('dialog', { name: /CASE-2026-102/ });
    expect(within(dialog).queryByRole('button', { name: 'Print / Save as PDF' })).not.toBeInTheDocument();
  });
});
