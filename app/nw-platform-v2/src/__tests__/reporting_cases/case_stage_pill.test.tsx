/**
 * S1.1-03 — regression guard for `screens/Cases.tsx`'s `stagePill` /
 * undecided-count behavior. This sprint found this behavior already
 * correct by reading the source (sprint-1.1 overview, "Verified, no task
 * needed"), not by an existing test — leaving it unpinned lets a future
 * edit re-break it silently. No source change; test-only (Lane B,
 * S1.1-03).
 *
 * Pins:
 *  - AC-S1.1-03-1: `stagePill` renders "Not decided yet" (`count` variant)
 *    for an untouched analyst-stage case, and "Back with the analyst"
 *    (`status-caution`) for a touched one returned to analyst stage.
 *  - AC-S1.1-03-2: the `Cases` list header renders the "N of M have been
 *    decided yet" / "N cases are waiting on you" text exactly when
 *    `undecidedCount`/`waitingOnMeCount` are non-zero.
 *
 * `stagePill` and `isUntouched` are private to `Cases.tsx` (not exported)
 * — this test observes them only through the rendered screen (`Cases.tsx`
 * lines ~192-205, 492-493, 557-558), per this SOP's rule against
 * hand-rolled shadow assertions of unexported internals.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Cases } from '../../screens/Cases';
import { CASES, seedCases } from '../../data/cases';
import { DOCLIB } from '../../data/doclib';
import { USERS } from '../../data/studio';
import type { StudioUser } from '../../data/studio';
import { topbarFixture } from './fixtures';

// USERS[1] is Priya Raman, roleKey 'analyst' — see cases_list_role_gating
// header note; not used for role-gating here, only to keep currentUser
// stable across tests (default CRO already used elsewhere in this suite).
const CRO = USERS[0] as StudioUser;
void CRO;

function stageCellText(caseId: string): string {
  const idCell = screen.getByText(caseId);
  const row = idCell.closest('tr');
  expect(row).not.toBeNull();
  // Stage is the 3rd data column (Case, Title, Stage, Owner, Approval
  // tier) — `Cases.tsx` `columns`, `stagePill`'s only render site.
  const cells = within(row as HTMLElement).getAllByRole('cell');
  return (cells[2] as HTMLElement).textContent ?? '';
}

describe('Cases stagePill (Cases.tsx ~196-205) — regression guard', () => {
  beforeEach(() => {
    seedCases(DOCLIB);
  });

  it('AC-S1.1-03-1: an untouched analyst-stage case renders "Not decided yet"', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} />);

    // Freshly seeded cases are all stage 'analyst', edited: false,
    // history.length === 1 — the `isUntouched` case (Cases.tsx:192-193).
    expect(stageCellText('CASE-2026-001')).toBe('Not decided yet');
  });

  it('AC-S1.1-03-1: a touched case returned to analyst stage renders "Back with the analyst"', () => {
    // Simulate a case that was routed onward and sent back to the
    // analyst with drafting notes (the `opine-return` path, Cases.tsx
    // 386-387: `c.stage = 'analyst'; logEntry(...)`), which pushes a
    // second history entry — `isUntouched` requires
    // `history.length <= 1`, so this case fails that predicate and falls
    // through `stagePill`'s final branch (line 205).
    const target = CASES.find((c) => c.id === 'CASE-2026-001');
    expect(target).toBeDefined();
    if (target) {
      target.stage = 'analyst';
      target.history.unshift({
        when: 'Aug 15, 2026 · 9:41 AM ET',
        who: 'D. Reyes',
        role: 'General Counsel',
        what: 'Counsel opinion recorded · Returned with drafting notes',
        note: 'Counsel asked for narrower wording. Back to the analyst to redraft.',
      });
    }

    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} />);

    expect(stageCellText('CASE-2026-001')).toBe('Back with the analyst');
  });

  it('AC-S1.1-03-1: an edited analyst-stage case (history.length <= 1) also renders "Back with the analyst"', () => {
    // Second discriminator inside `isUntouched`: `!c.edited`. A case with
    // `edited: true` fails `isUntouched` even with a single history
    // entry, so it must NOT render the count-variant "Not decided yet"
    // pill either.
    const target = CASES.find((c) => c.id === 'CASE-2026-002');
    expect(target).toBeDefined();
    if (target) {
      target.edited = true;
    }

    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} />);

    expect(stageCellText('CASE-2026-002')).toBe('Back with the analyst');
  });
});

describe('Cases list header (Cases.tsx 492-493, 557-558) — undecided/waiting text', () => {
  beforeEach(() => {
    seedCases(DOCLIB);
  });

  it('AC-S1.1-03-2: renders "N of M have been decided yet" when undecidedCount > 0 and < openCases.length', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} />);

    // All 8 seeded cases are untouched at boot: undecidedCount === 8 ===
    // openCases.length -> the "None ... have been decided yet." branch
    // (Cases.tsx:557, `undecidedCount === openCases.length ? 'None' : ...`).
    expect(screen.getByText(/None have been decided yet\./)).toBeInTheDocument();
  });

  it('AC-S1.1-03-2: switches to "N of M have been decided yet" once fewer than all cases are undecided', () => {
    const target = CASES.find((c) => c.id === 'CASE-2026-001');
    expect(target).toBeDefined();
    if (target) {
      target.edited = true; // no longer "untouched" -> undecidedCount drops to 7 of 8
    }

    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} />);

    expect(screen.getByText(/7 of 8 have been decided yet\./)).toBeInTheDocument();
  });

  it('AC-S1.1-03-2: omits the "have been decided yet" text entirely when undecidedCount is 0', () => {
    for (const c of CASES) {
      c.edited = true;
    }

    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} />);

    expect(screen.queryByText(/have been decided yet/)).not.toBeInTheDocument();
    expect(screen.queryByText(/has been decided yet/)).not.toBeInTheDocument();
  });

  it('AC-S1.1-03-2: renders "N cases are waiting on you" exactly when waitingOnMeCount > 0 for the current user', () => {
    // Default `currentUser` is `CURRENT` (Rachel Fischer, CRO — Cases.tsx
    // file header). `waitingOnRoleKey('analyst')` returns 'analyst', not
    // 'cro' (Cases.tsx:215-219), so a fresh analyst-stage seed produces
    // ZERO cases waiting on the CRO.
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} />);

    expect(screen.queryByText(/waiting on you/)).not.toBeInTheDocument();
  });

  it('AC-S1.1-03-2: "N cases are waiting on you" appears once a case reaches the CRO-waiting stage', () => {
    const target = CASES.find((c) => c.id === 'CASE-2026-001');
    expect(target).toBeDefined();
    if (target) {
      // waitingOnRoleKey('cro'|'final'|'committee') -> 'cro' (Cases.tsx
      // 215-219); the default currentUser's roleKey is 'cro'.
      target.stage = 'cro';
    }

    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} />);

    expect(screen.getByText(/1 case is waiting on you\./)).toBeInTheDocument();
  });
});
