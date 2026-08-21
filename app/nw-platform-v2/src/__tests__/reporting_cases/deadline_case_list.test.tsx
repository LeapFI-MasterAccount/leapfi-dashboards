/**
 * PI2-D2 leg (b), r02_one_case_page.md "Acceptance criteria —
 * deadline-driven case leg" — `screens/Cases.tsx`'s wiring of the
 * deadline-driven case leg into the reachable UI (docflow/deadline-leg
 * dispatch's own scope note: "extend the seed with at least one deadline
 * case reachable in the UI if none is, per the fixture's own intent").
 *
 * Commit latency: `Cases.tsx` `ACTION_COMMIT_DELAY_MS` = 550ms — every
 * mutation lands only after the simulated commit, hence the fake-timer
 * advances below (same pattern `cases_fix_wave.test.tsx` already uses).
 */
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Cases } from '../../screens/Cases';
import { DEADLINE_CASES, DEADLINE_DRIVEN_CASE_FIXTURE, seedDeadlineCases, seedCases } from '../../data/cases';
import type { DeadlineDrivenCase } from '../../data/cases';
import { DOCLIB } from '../../data/doclib';
import { USERS } from '../../data/studio';
import type { StudioUser } from '../../data/studio';
import { topbarFixture } from './fixtures';

const CRO = USERS[0] as StudioUser; // Rachel Fischer, roleKey 'cro' — resolves as the fixture's gating role (PI2-D46)
const ANALYST = USERS[1] as StudioUser; // Priya Raman, roleKey 'analyst' — never gates this leg's fixture
const CEO = USERS[3] as StudioUser;

/** `Cases.tsx` `ACTION_COMMIT_DELAY_MS` (550) plus margin. */
const COMMIT_MS = 600;

function commit(ms: number = COMMIT_MS): void {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

function deadlineCaseById(id: string): DeadlineDrivenCase {
  const c = DEADLINE_CASES.find((x) => x.id === id);
  expect(c).toBeDefined();
  return c as DeadlineDrivenCase;
}

function openDeadlineCaseDetail(caseId: string): HTMLElement {
  const idCell = screen.getByText(caseId);
  const row = idCell.closest('tr');
  expect(row).not.toBeNull();
  fireEvent.click(within(row as HTMLElement).getByRole('button', { name: 'Open' }));
  const detail = document.querySelector('[data-lf-view="deadline-case-detail"]');
  expect(detail).not.toBeNull();
  return detail as HTMLElement;
}

beforeEach(() => {
  vi.useFakeTimers();
  seedCases(DOCLIB); // base boot reseed (same beforeEach shape as the sibling regression files)
  seedDeadlineCases(); // fresh DEADLINE_CASES per test — never the shared fixture object (data/cases.ts header)
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Deadline cases reachable in the UI (data/cases.ts seedDeadlineCases)', () => {
  it('lists the seeded deadline case under its own "Deadline cases" section', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={CRO} />);

    expect(screen.getByRole('heading', { name: /Deadline cases/ })).toBeInTheDocument();
    const table = screen.getByRole('table', { name: 'Deadline cases' });
    expect(within(table).getByText('CASE-2026-102')).toBeInTheDocument();
    expect(within(table).getByText('RFI 2026-04 comment position')).toBeInTheDocument();
    expect(within(table).getByText('Tracking')).toBeInTheDocument();
  });

  it('opening the row mounts DeadlineCaseDetail (not CaseDetail) in the shared Drawer', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={CRO} />);
    const detail = openDeadlineCaseDetail('CASE-2026-102');
    expect(detail.textContent).toContain('CASE-2026-102');
    expect(document.querySelector('[data-lf-view="case-detail"]')).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: /CASE-2026-102/ })).toBeInTheDocument();
  });
});

describe('AC-r02-D8 — "Mark complete" writes exactly ONE CaseHistoryEntry, via the same commit pipeline', () => {
  it('the gating (CRO) viewer marks it complete: status flips, exactly one new history entry, one success toast', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={CRO} />);
    const detail = openDeadlineCaseDetail('CASE-2026-102');
    const before = deadlineCaseById('CASE-2026-102').history.length;

    fireEvent.click(within(detail).getByRole('button', { name: 'Mark complete' }));
    // Pessimistic render: nothing has committed yet.
    expect(deadlineCaseById('CASE-2026-102').status).toBe('tracking');
    expect(deadlineCaseById('CASE-2026-102').history).toHaveLength(before);

    commit();

    const after = deadlineCaseById('CASE-2026-102');
    expect(after.status).toBe('completed');
    expect(after.history).toHaveLength(before + 1);
    expect(after.history[0]).toMatchObject({ what: 'Marked complete', who: CRO.name, role: CRO.role });
    expect(screen.getByRole('status')).toHaveTextContent('Marked complete.');
  });

  it('after completion, the detail view shows zero action Buttons for the same viewer', () => {
    deadlineCaseById('CASE-2026-102').status = 'completed';
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={CRO} />);
    const detail = openDeadlineCaseDetail('CASE-2026-102');
    expect(within(detail).queryByRole('button', { name: 'Mark complete' })).not.toBeInTheDocument();
  });
});

describe('Irreversibility gate (persona directive 6) — double-press on "Mark complete"', () => {
  it('a rapid double-press commits exactly ONE completion and appends exactly ONE history entry, never two', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={CRO} />);
    const detail = openDeadlineCaseDetail('CASE-2026-102');
    const before = deadlineCaseById('CASE-2026-102').history.length;

    const button = within(detail).getByRole('button', { name: 'Mark complete' });
    fireEvent.click(button);
    // Second press lands on the SAME still-mounted control while the
    // first commit is in flight (Button.tsx disables it — `isBusy`/
    // `disabled` — but the request-key dedup in `performDeadlineAction`
    // is the actual guarantee, not merely the disabled attribute, per
    // this persona's Core Principle 1).
    fireEvent.click(button);

    commit();

    const after = deadlineCaseById('CASE-2026-102');
    expect(after.status).toBe('completed');
    expect(after.history).toHaveLength(before + 1); // never two
    const markCompleteEntries = after.history.filter((entry) => entry.what === 'Marked complete');
    expect(markCompleteEntries).toHaveLength(1);
  });
});

describe('AC-r02-D-GATE (PI2-D46) — non-gating and CEO viewers via the full screen', () => {
  it('ANALYST (not the resolved owner role) sees the wait note, never "Mark complete", through Cases.tsx', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);
    const detail = openDeadlineCaseDetail('CASE-2026-102');
    expect(within(detail).queryByRole('button', { name: 'Mark complete' })).not.toBeInTheDocument();
    expect(detail.textContent).toContain('This case is with');
  });

  it('CEO sees no "Mark complete" through Cases.tsx either', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={CEO} />);
    const detail = openDeadlineCaseDetail('CASE-2026-102');
    expect(within(detail).queryByRole('button', { name: 'Mark complete' })).not.toBeInTheDocument();
  });
});

describe('Test isolation — seedDeadlineCases never leaks a mutation into the shared fixture', () => {
  it('completing the seeded case through the UI does not mutate DEADLINE_DRIVEN_CASE_FIXTURE itself', () => {
    expect(DEADLINE_DRIVEN_CASE_FIXTURE.status).toBe('tracking');
    const fixtureHistoryLengthBefore = DEADLINE_DRIVEN_CASE_FIXTURE.history.length;

    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={CRO} />);
    const detail = openDeadlineCaseDetail('CASE-2026-102');
    fireEvent.click(within(detail).getByRole('button', { name: 'Mark complete' }));
    commit();
    expect(deadlineCaseById('CASE-2026-102').status).toBe('completed');

    // The shared, read-only fixture other tests import directly is
    // untouched — `seedDeadlineCases()` built DEADLINE_CASES[0] as a deep
    // copy, never the fixture object reference (data/cases.ts header).
    expect(DEADLINE_DRIVEN_CASE_FIXTURE.status).toBe('tracking');
    expect(DEADLINE_DRIVEN_CASE_FIXTURE.history).toHaveLength(fixtureHistoryLengthBefore);

    seedDeadlineCases();
    expect(deadlineCaseById('CASE-2026-102').status).toBe('tracking');
  });
});
