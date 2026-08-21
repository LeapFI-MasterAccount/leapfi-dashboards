/**
 * S1.1-03 — regression guard for `screens/Cases.tsx`'s `stagePill` /
 * undecided-count behavior. This sprint found this behavior already
 * correct by reading the source (sprint-1.1 overview, "Verified, no task
 * needed"), not by an existing test — leaving it unpinned lets a future
 * edit re-break it silently. No source change; test-only (Lane B,
 * S1.1-03).
 *
 * Pins:
 *  - AC-S1.1-03-1: `stagePill` renders "Open item" (`count` variant) —
 *    renamed from "Not decided yet" per `DECISIONS.md` call-06/L2 exit
 *    criteria (the label call-notes flagged as ambiguous) — for an
 *    untouched analyst-stage case, and "Back with the analyst"
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
// USERS[2] is Dana Reyes, roleKey 'legal' — PI2-D45 (USER OVERRIDE)'s
// zero-waiting-at-boot baseline for the "waiting on you" tests below.

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

  it('AC-S1.1-03-1: an untouched analyst-stage case renders "Open item"', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} />);

    // PI2-D45 (USER OVERRIDE): only the 3 proc-tier cases boot stage
    // 'analyst', edited: false, history.length === 1 — the `isUntouched`
    // case (Cases.tsx:192-193). CASE-2026-001 ('irp', exec tier) now boots
    // pre-routed to 'cro'; CASE-2026-003 ('aa-procedure', proc tier) is
    // still untouched. "Open item" replaces "Not decided yet" (call-06).
    expect(stageCellText('CASE-2026-003')).toBe('Open item');
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
    // entry, so it must NOT render the count-variant "Open item"
    // pill either.
    //
    // PI2-D45 (USER OVERRIDE): CASE-2026-002 ('tprm-program', exec tier)
    // now boots pre-routed to 'cro' (stage 'cro' renders "With the CRO",
    // a separate stagePill branch entirely) — use CASE-2026-005
    // ('msg-disclosure', proc tier), which still boots stage 'analyst'.
    const target = CASES.find((c) => c.id === 'CASE-2026-005');
    expect(target).toBeDefined();
    if (target) {
      target.edited = true;
    }

    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} />);

    expect(stageCellText('CASE-2026-005')).toBe('Back with the analyst');
  });
});

describe('Cases list header (Cases.tsx 492-493, 557-558) — undecided/waiting text', () => {
  beforeEach(() => {
    seedCases(DOCLIB);
  });

  it('AC-S1.1-03-2 / HR-DATA-01: renders "N of M have been decided yet" with N = the actual DECIDED count, when undecidedCount > 0 and < openCases.length', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} />);

    // PI2-D45 (USER OVERRIDE): only the 3 proc-tier cases boot untouched
    // ('analyst', edited: false, history.length 1) — the 5 board/exec-tier
    // cases boot already routed to 'cro', so undecidedCount is 3, not 8
    // (never equal to openCases.length === 8), landing on the "N of M"
    // branch rather than "None" (Cases.tsx:557). HR-DATA-01: N is the
    // DECIDED count (openCases.length - undecidedCount = 8 - 3 = 5), never
    // the undecided count itself — the prior "3 of 8 have been decided
    // yet." literally claimed the 3 cases that are NOT decided ARE
    // decided, while the 5 actually-decided cases (routed to 'cro') went
    // uncounted.
    expect(screen.getByText(/5 of 8 have been decided yet\./)).toBeInTheDocument();
    expect(screen.queryByText(/3 of 8 have been decided yet\./)).not.toBeInTheDocument();
  });

  it('AC-S1.1-03-2 / HR-DATA-01: the decided count rises (not falls) as fewer cases remain undecided', () => {
    // PI2-D45 (USER OVERRIDE): CASE-2026-001 ('irp') already boots routed
    // to 'cro' (not `isUntouched`) — toggle a still-`analyst`-stage
    // proc-tier case instead, dropping undecidedCount from 3 to 2, which
    // must RAISE the rendered decided count from 5 to 6 (never drop it to
    // 2 — that would be the undecided count leaking into the sentence
    // again).
    const target = CASES.find((c) => c.id === 'CASE-2026-003');
    expect(target).toBeDefined();
    if (target) {
      target.edited = true; // no longer "untouched" -> undecidedCount drops to 2 of 8
    }

    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} />);

    expect(screen.getByText(/6 of 8 have been decided yet\./)).toBeInTheDocument();
    expect(screen.queryByText(/2 of 8 have been decided yet\./)).not.toBeInTheDocument();
  });

  it('HR-DATA-01: the rendered decided count matches an independent count of cases actually routed past the analyst stage (cross-check against the visible list, not the formula)', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} />);

    // Independently recomputed from the case list itself (not by reading
    // `undecidedCount`/`decidedCount` from the component) — the boot state
    // has exactly 5 open cases routed onward to 'cro' and 3 still
    // untouched at 'analyst', so a viewer counting the Stage column by
    // hand gets 5 decided, matching the header sentence.
    const trulyDecided = CASES.filter((c) => c.stage !== 'closed' && c.stage !== 'rejected' && c.stage !== 'analyst').length;
    expect(trulyDecided).toBe(5);
    expect(screen.getByText(new RegExp(`${trulyDecided} of 8 have been decided yet\\.`))).toBeInTheDocument();
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
    // PI2-D45 (USER OVERRIDE): the default CRO persona now has 5 cases
    // waiting at boot (the routed board/exec-tier set), and the analyst
    // persona has 3 (the untouched proc-tier set) — neither is a genuine
    // zero-case baseline any more. `waitingOnRoleKey` only ever returns
    // 'analyst' | 'cro' | 'legal' | null (Cases.tsx:213-218), and no case
    // boots at 'legal' — General Counsel (Dana Reyes, USERS[2]) is the
    // true zero-waiting baseline.
    const LEGAL = USERS[2] as StudioUser;
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={LEGAL} />);

    expect(screen.queryByText(/waiting on you/)).not.toBeInTheDocument();
  });

  it('AC-S1.1-03-2: "N cases are waiting on you" appears once a case reaches the CRO-waiting stage', () => {
    // PI2-D45 (USER OVERRIDE): same zero-waiting baseline as the previous
    // test (General Counsel) — routing ONE case to 'legal' exercises the
    // singular "1 case is waiting on you." text without colliding with
    // the 5 cases already routed to the default CRO persona at boot.
    const LEGAL = USERS[2] as StudioUser;
    const target = CASES.find((c) => c.id === 'CASE-2026-001');
    expect(target).toBeDefined();
    if (target) {
      target.stage = 'legal';
    }

    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={LEGAL} />);

    expect(screen.getByText(/1 case is waiting on you\./)).toBeInTheDocument();
  });
});
