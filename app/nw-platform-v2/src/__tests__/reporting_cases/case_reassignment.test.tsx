/**
 * L2 (call-06, call-09, call-13) — `02-sprint-plan.md` L2 exit criteria /
 * `DECISIONS.md` D11, D12.
 *
 * Three independent regression areas, one file (same allowlist files —
 * `data/cases.ts`, `screens/Cases.tsx`, `views/CaseDetail.tsx`):
 *
 *  1. D12 — "Waiting on you" must not render on a genuinely unassigned/
 *     open-item row (contradicts the Stage column's own "Open item" pill
 *     on the same row); it becomes "Needs assignment" instead. Assigned
 *     rows (any other `waitingOnRoleKey` match) render "Waiting on you"
 *     unchanged.
 *  2. call-09 / PI2-D45-A reconciliation — the CRO/Priya routing rule
 *     ("executive and board-level policy cases → CRO; procedures and
 *     standard cases → Priya") is pinned directly against `CASE_TIER` +
 *     boot `stage`, proving the ALREADY-SHIPPED PI2-D45-A boot-seed state
 *     satisfies call-09's rule with no further seed change required.
 *  3. D11 — case reassignment / "Transfer ownership" (HR-DATA-03 relabel;
 *     was "Request transfer" — the control commits an immediate,
 *     unconditional owner mutation, never a pending request, so its label
 *     must say what it does): a `pickingCondition`-
 *     class inline owner-picker (A18 in-drawer content-swap, a third
 *     instance of the "View full document"/"Back to case" pattern), roster
 *     = `data/studio.ts` USERS, required reason Input, writes exactly one
 *     `CaseHistoryEntry` (no new field) and mutates the existing
 *     `owner: string` (no new field). Commit latency: `Cases.tsx`
 *     `ACTION_COMMIT_DELAY_MS` = 550ms (fake-timer pattern shared with
 *     this suite's sibling files, e.g. `deadline_case_list.test.tsx`).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Cases } from '../../screens/Cases';
import { CASES, CASE_TIER, seedCases } from '../../data/cases';
import type { Case } from '../../data/cases';
import { DOCLIB } from '../../data/doclib';
import { USERS } from '../../data/studio';
import type { StudioUser } from '../../data/studio';
import { topbarFixture } from './fixtures';

const CRO = USERS[0] as StudioUser; // Rachel Fischer, roleKey 'cro'
const ANALYST = USERS[1] as StudioUser; // Priya Raman, roleKey 'analyst'

/** `Cases.tsx` `ACTION_COMMIT_DELAY_MS` (550) plus margin. */
const COMMIT_MS = 600;

function commit(ms: number = COMMIT_MS): void {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

function openRow(caseId: string): void {
  const idCell = screen.getByText(caseId);
  const row = idCell.closest('tr');
  expect(row).not.toBeNull();
  fireEvent.click(within(row as HTMLElement).getByRole('button', { name: 'Open' }));
}

function caseById(id: string): Case {
  const c = CASES.find((x) => x.id === id);
  expect(c).toBeDefined();
  return c as Case;
}

describe('D12 — Waiting-on/Stage disambiguation (Cases.tsx list Tag)', () => {
  beforeEach(() => {
    seedCases(DOCLIB);
  });

  it('an untouched/open-item row (isUntouched) renders "Needs assignment", never "Waiting on you"', () => {
    // PI2-D45 (USER OVERRIDE): CASE-2026-003 ('aa-procedure', proc tier)
    // boots untouched ('analyst', edited: false, history.length 1) — the
    // exact isUntouched(row) === waitingOnRoleKey-match row this rule
    // targets.
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);

    const idCell = screen.getByText('CASE-2026-003');
    const row = idCell.closest('tr') as HTMLElement;
    expect(within(row).getByText('Needs assignment')).toBeInTheDocument();
    expect(within(row).queryByText('Waiting on you')).not.toBeInTheDocument();
    // Never contradicts the Stage column's own rename (call-06).
    expect(within(row).getByText('Open item')).toBeInTheDocument();
  });

  it('an assigned row (routed to the CRO, not isUntouched) still renders "Waiting on you" unchanged', () => {
    // PI2-D45 (USER OVERRIDE): CASE-2026-001 ('irp', exec tier) boots
    // already routed to stage 'cro' — genuinely assigned, not an open item.
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={CRO} />);

    const idCell = screen.getByText('CASE-2026-001');
    const row = idCell.closest('tr') as HTMLElement;
    expect(within(row).getByText('Waiting on you')).toBeInTheDocument();
    expect(within(row).queryByText('Needs assignment')).not.toBeInTheDocument();
  });

  it('a touched-but-still-analyst-stage row (not isUntouched) also renders "Waiting on you", not "Needs assignment"', () => {
    // Same discriminator case_stage_pill.test.tsx already pins for the
    // Stage column ("Back with the analyst"): edited flips isUntouched
    // false while stage stays 'analyst' — still genuinely assigned to the
    // analyst's queue, not the fresh open-item state.
    const target = caseById('CASE-2026-005'); // 'msg-disclosure', proc tier, boots untouched
    target.edited = true;

    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);

    const idCell = screen.getByText('CASE-2026-005');
    const row = idCell.closest('tr') as HTMLElement;
    expect(within(row).getByText('Waiting on you')).toBeInTheDocument();
    expect(within(row).queryByText('Needs assignment')).not.toBeInTheDocument();
  });
});

describe('call-09 / PI2-D45-A reconciliation — CRO/Priya routing rule applied to seed data', () => {
  beforeEach(() => {
    seedCases(DOCLIB);
  });

  it('every board/exec-tier case boots routed to the CRO (stage "cro"); every proc-tier case stays with the analyst (stage "analyst")', () => {
    // call-09's rule, verbatim: "Executive and board-level policy cases →
    // Chief Risk Officer (CRO); Procedures and standard cases → Priya
    // (risk analyst)." PI2-D45-A already implements exactly this via
    // CASE_TIER + boot-time stage routing (data/cases.ts seedCases()) —
    // pinned here directly against CASE_TIER so a future edit that
    // desyncs the two can never pass silently.
    for (const c of CASES) {
      const tier = CASE_TIER[c.doc];
      expect(tier).toBeDefined();
      if (tier === 'board' || tier === 'exec') {
        expect(c.stage).toBe('cro');
      } else if (tier === 'proc') {
        expect(c.stage).toBe('analyst');
      }
    }
    // Concrete membership (not just the general rule) — CASE_TIER's own
    // 8-entry map (data/cases.ts).
    const boardExecDocs = ['gov-charter', 'mrm-change-draft', 'gen-ai-draft', 'irp', 'tprm-program'];
    const procDocs = ['aa-procedure', 'msg-disclosure', 'rege-proc'];
    for (const doc of boardExecDocs) {
      expect(CASES.find((c) => c.doc === doc)?.stage).toBe('cro');
    }
    for (const doc of procDocs) {
      expect(CASES.find((c) => c.doc === doc)?.stage).toBe('analyst');
    }
  });

  it('the routed (CRO-stage) rows render "With the CRO" and never a "Waiting on you"/"Needs assignment" Tag for the analyst viewer', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);
    const table = screen.getByRole('table', { name: 'Open cases' });
    for (const doc of ['gov-charter', 'mrm-change-draft', 'gen-ai-draft', 'irp', 'tprm-program']) {
      const id = (CASES.find((c) => c.doc === doc) as Case).id;
      const row = within(table).getByText(id).closest('tr') as HTMLElement;
      expect(within(row).getByText('With the CRO')).toBeInTheDocument();
      expect(within(row).queryByText('Waiting on you')).not.toBeInTheDocument();
      expect(within(row).queryByText('Needs assignment')).not.toBeInTheDocument();
    }
  });
});

describe('D11 — case reassignment / "Transfer ownership" (A18-class in-drawer content swap)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    seedCases(DOCLIB);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('"Reassign" swaps the shared Drawer to the owner picker (one dialog throughout), lists every USERS candidate, and requires a reason before confirming', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={CRO} />);
    openRow('CASE-2026-003');
    expect(screen.getAllByRole('dialog')).toHaveLength(1);

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Reassign' }));
    expect(screen.getAllByRole('dialog')).toHaveLength(1); // still exactly one dialog — swap, not a second Drawer

    const dialog = screen.getByRole('dialog');
    for (const user of USERS) {
      expect(within(dialog).getByText(user.name)).toBeInTheDocument();
    }
    const confirmButton = within(dialog).getByRole('button', { name: 'Confirm reassignment' });
    expect(confirmButton).toBeDisabled(); // no owner picked, no reason yet

    fireEvent.click(within(dialog).getAllByRole('button', { name: 'Select' })[1] as HTMLElement); // Priya Raman
    expect(confirmButton).toBeDisabled(); // reason still required (call-13 item 6 / D11)

    fireEvent.change(within(dialog).getByLabelText('Reason'), { target: { value: 'Rebalancing analyst workload.' } });
    expect(confirmButton).not.toBeDisabled();
  });

  it('confirming writes exactly ONE CaseHistoryEntry, updates the existing owner field (no new field), and swaps back to the case view only once the commit lands', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={CRO} />);
    openRow('CASE-2026-003');
    const before = caseById('CASE-2026-003').history.length;
    const beforeOwner = caseById('CASE-2026-003').owner;

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Reassign' }));
    let dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getAllByRole('button', { name: 'Select' })[3] as HTMLElement); // Adam Schlesinger
    fireEvent.change(within(dialog).getByLabelText('Reason'), { target: { value: 'Escalating to the CEO for visibility.' } });
    const confirmButton = within(dialog).getByRole('button', { name: 'Confirm reassignment' });
    fireEvent.click(confirmButton);

    // Pessimistic render: nothing has committed yet, and the picker view
    // is still showing (never "done" before the server/simulated commit
    // resolves — Core Principle 1). The Button itself now shows `loading`
    // (label visually replaced by the spinner, same as every other
    // action's in-flight state in this screen) — asserted via the SAME
    // still-mounted control, matching this suite's own double-press
    // pattern (deadline_case_list.test.tsx), not a re-query by name.
    expect(caseById('CASE-2026-003').owner).toBe(beforeOwner);
    expect(caseById('CASE-2026-003').history).toHaveLength(before);
    expect(confirmButton).toBeInTheDocument();
    expect(confirmButton).toHaveAttribute('aria-busy', 'true');

    commit();

    const after = caseById('CASE-2026-003');
    expect(after.history).toHaveLength(before + 1); // exactly one write
    expect(after.history[0]).toMatchObject({
      what: 'Reassigned to Adam Schlesinger',
      note: 'Escalating to the CEO for visibility.',
      who: CRO.name,
      role: CRO.role,
    });
    expect(after.owner).toBe('A. Schlesinger · Chief Executive Officer');
    expect(after.owner).not.toBe(beforeOwner);
    expect(screen.getByRole('status')).toHaveTextContent('Reassigned to Adam Schlesinger.');

    // Swapped back — the normal case view (Policy owner field) is visible
    // again, not the picker.
    dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('A. Schlesinger · Chief Executive Officer')).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'Confirm reassignment' })).not.toBeInTheDocument();
  });

  it('HR-DATA-03: "Transfer ownership" reuses the IDENTICAL picker/confirm UI, only the history phrasing/initiator differ from "Reassign" — and its copy states an immediate mutation, never a pending request this build cannot leave pending', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);
    openRow('CASE-2026-003');
    const before = caseById('CASE-2026-003').history.length;

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Transfer ownership' }));
    const dialog = screen.getByRole('dialog');
    // Same owner list, same required-reason gate — one component, not a
    // second one (D11).
    for (const user of USERS) {
      expect(within(dialog).getByText(user.name)).toBeInTheDocument();
    }
    // HR-DATA-03 (no-lying-controls): nothing in the picker/confirm UI may
    // claim a pending/awaiting-approval state that does not exist — D11
    // rules approval workflow explicitly OUT, and `performReassign`
    // commits `c.owner` unconditionally on confirm for this mode too.
    expect(within(dialog).queryByText(/pending/i)).not.toBeInTheDocument();
    expect(within(dialog).queryByText(/awaiting approval/i)).not.toBeInTheDocument();
    fireEvent.click(within(dialog).getAllByRole('button', { name: 'Select' })[2] as HTMLElement); // Dana Reyes
    fireEvent.change(within(dialog).getByLabelText('Reason'), { target: { value: 'Needs counsel review before I can act on it.' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirm transfer' }));
    commit();

    const after = caseById('CASE-2026-003');
    expect(after.history).toHaveLength(before + 1);
    expect(after.history[0]).toMatchObject({
      what: 'Ownership transferred to Dana Reyes',
      note: 'Needs counsel review before I can act on it.',
      who: ANALYST.name,
    });
    expect(after.owner).toBe('D. Reyes · General Counsel');
    // The owner field updates immediately on commit — the copy now says
    // exactly that ("Ownership transferred"), not "Request"/"pending".
    expect(screen.getByRole('status')).toHaveTextContent('Ownership transferred to Dana Reyes.');
  });

  it('Irreversibility gate: a rapid double-press on the confirm Button commits exactly ONE reassignment, never two', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={CRO} />);
    openRow('CASE-2026-003');
    const before = caseById('CASE-2026-003').history.length;

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Reassign' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getAllByRole('button', { name: 'Select' })[4] as HTMLElement); // Jose Ribau
    fireEvent.change(within(dialog).getByLabelText('Reason'), { target: { value: 'AI-governance specialist should own this.' } });

    const confirmButton = within(dialog).getByRole('button', { name: 'Confirm reassignment' });
    fireEvent.click(confirmButton);
    // Second press lands on the same still-mounted control while the first
    // commit is in flight — the request-key dedup in `performAction` (the
    // SAME pipeline every other case action already uses) is the real
    // guarantee, not merely the disabled attribute.
    fireEvent.click(confirmButton);

    commit();

    const after = caseById('CASE-2026-003');
    expect(after.history).toHaveLength(before + 1); // never two
    const reassignEntries = after.history.filter((entry) => entry.what === 'Reassigned to Jose Ribau');
    expect(reassignEntries).toHaveLength(1);
  });

  it('"Cancel" discards the in-progress pick/reason and swaps back without mutating the case', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={CRO} />);
    openRow('CASE-2026-003');
    const beforeOwner = caseById('CASE-2026-003').owner;
    const beforeHistory = caseById('CASE-2026-003').history.length;

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Reassign' }));
    let dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getAllByRole('button', { name: 'Select' })[0] as HTMLElement);
    fireEvent.change(within(dialog).getByLabelText('Reason'), { target: { value: 'Testing cancel path.' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    commit();

    expect(caseById('CASE-2026-003').owner).toBe(beforeOwner);
    expect(caseById('CASE-2026-003').history).toHaveLength(beforeHistory);
    dialog = screen.getByRole('dialog');
    expect(within(dialog).queryByRole('button', { name: 'Confirm reassignment' })).not.toBeInTheDocument();
    expect(within(dialog).getByText(beforeOwner)).toBeInTheDocument();
  });
});
