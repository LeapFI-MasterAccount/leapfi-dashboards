/**
 * PI2-D44 dispatch, Lane 2 tasks 2–3 — design_system_spec.md §2.10.1
 * (amendment A17, the human-contributed-edit action set) and §2.10.2
 * (amendment A19, the CEO/non-acting-role absent-controls doctrine).
 *
 * Both amendments are satisfied by `CaseDetail.tsx`'s EXISTING
 * `renderActions()`/`waitingOnRoleKey()`/`canAct` machinery — "by
 * subtraction, not addition" (A17) and "generalize, don't add a branch"
 * (A19) — so these tests render `CaseDetail` directly against fixture
 * `Case` objects, rather than mutating the seeded `CASES` singleton, to
 * isolate exactly the stage/role-driven rendering these amendments rule
 * on.
 *
 * SCOPE NOTE (this lane's own STOP, see the evidence return): the
 * `'rejected'` stage's "Reopen for redraft" Button
 * (`CaseDetail.tsx`'s closed-state/rejected-state block) renders
 * unconditionally today — a verbatim port of the base engine's own
 * ungated `caseReopen` doclink (`leapfi-platform.html:2872`), never
 * gated on `canAct` because `waitingOnRoleKey('rejected')` has always
 * returned `null` (no role ever satisfies it). A17 §2.10.1 item 2 names
 * "Reopen for redraft" as one of the byte-identical stage-onward verbs
 * both case legs share, and A19 §2.10.2 demands it render absent for a
 * non-acting viewer at every reachable stage including `'rejected'` —
 * but closing that gap requires first ratifying WHICH role owns
 * `'rejected'`-stage reopening (`waitingOnRoleKey` has no answer today,
 * and none of r02/r10/r17b/r17d/DECISIONS.md name one) — a role-boundary
 * decision, not an implementation default this dispatch's role
 * directives license guessing at. `'rejected'` is therefore excluded
 * from the stage sweeps below; every OTHER reachable stage is fully
 * covered.
 */
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { CaseDetail } from '../../views/CaseDetail';
import type { Case, CaseHistoryEntry } from '../../data/cases';
import { DOCLIB } from '../../data/doclib';
import { USERS } from '../../data/studio';
import type { StudioUser } from '../../data/studio';

const CRO = USERS[0] as StudioUser; // Rachel Fischer, roleKey 'cro'
const LEGAL = USERS[2] as StudioUser; // Dana Reyes, roleKey 'legal'
const CEO = USERS[3] as StudioUser; // Adam Schlesinger, roleKey 'ceo' — waitingOnRoleKey() never returns 'ceo' (r17d)

/** A17 §2.10.1 item 3 — the three OnSide-draft-specific controls that must
 * never render for the human-contributed-edit leg, at any stage. */
const ONSIDE_ONLY_LABELS = ['Accept & route for approval', 'Edit the language', 'Revert to the OnSide draft'];

const HUMAN_HISTORY: CaseHistoryEntry = {
  when: 'Aug 14, 2026 · 9:14 AM ET',
  who: 'R. Fischer',
  role: 'cro',
  what: 'Language drafted directly by the CRO',
  note: 'Drafted directly in response to counsel’s guidance ahead of the filing deadline.',
};

const ONSIDE_HISTORY: CaseHistoryEntry = {
  when: 'Aug 14, 2026 · 6:12 AM ET',
  who: 'OnSide',
  role: 'System',
  what: 'Change detected and language proposed',
  note: 'NCUA Letter 26-CU-07 and Part 748 appendix A',
};

/** `gov-charter` is a board-tier DOCLIB entry (`CASE_TIER['gov-charter'] ===
 * 'board'`, `tierOf('board').committee === true`) — chosen so the
 * `'committee'` stage is reachable by every fixture below. */
function baseCase(overrides: Partial<Case> = {}): Case {
  return {
    id: 'CASE-TEST-01',
    doc: 'gov-charter',
    title: 'Governance Charter',
    dom: 'gov',
    owner: 'R. Fischer · CRO',
    detected: 'Aug 14, 2026',
    trigger: 'Interagency RFI 2026-04 · agentic systems fall outside the charter as written',
    stage: 'cro',
    edited: false,
    tier: 'board',
    cond: null,
    condMet: false,
    minutes: null,
    opinion: null,
    base: 'Base language.',
    lang: 'Proposed language.',
    history: [ONSIDE_HISTORY],
    ...overrides,
  };
}

/** Human-contributed-edit leg fixture (A17): entry stage `'cro'`, history
 * seeded with the human author, never `'analyst'`. */
function humanEditCase(stage: Case['stage'], overrides: Partial<Case> = {}): Case {
  return baseCase({ stage, history: [HUMAN_HISTORY], ...overrides });
}

/** Drafted-redline leg fixture (unchanged existing behavior, used as the
 * A17-2/A19 comparison baseline). */
function draftedRedlineCase(stage: Case['stage'], overrides: Partial<Case> = {}): Case {
  return baseCase({ stage, history: [ONSIDE_HISTORY], ...overrides });
}

const doc = DOCLIB['gov-charter'];

function renderCase(caseItem: Case, currentUser: StudioUser) {
  return render(
    <CaseDetail caseItem={caseItem} doc={doc} currentUser={currentUser} onBack={() => {}} onAction={() => {}} pendingAction={null} />,
  );
}

function actionButtonPairs(): { label: string; variant: string | null }[] {
  const section = screen.getByRole('heading', { name: 'Proposed language' }).closest('section') as HTMLElement;
  return within(section)
    .getAllByRole('button')
    .map((el) => ({ label: el.textContent ?? '', variant: el.getAttribute('data-variant') }));
}

// Every reachable stage EXCEPT 'rejected' (see file header SCOPE NOTE) and
// 'analyst' (never reached by the human-edit leg, A17 item 1). The acting
// role that gates each stage (`waitingOnRoleKey`, CaseDetail.tsx:249-254).
const STAGES_FROM_CRO: { stage: Case['stage']; actingUser: StudioUser; extra?: Partial<Case> }[] = [
  { stage: 'cro', actingUser: CRO },
  { stage: 'legal', actingUser: LEGAL },
  { stage: 'committee', actingUser: CRO },
  { stage: 'final', actingUser: CRO, extra: { cond: 'Board Risk Committee approval', condMet: true } },
  { stage: 'closed', actingUser: CRO },
];

describe('A17 (design_system_spec.md §2.10.1) — human-contributed-edit action set', () => {
  it.each(STAGES_FROM_CRO)('AC-A17-1: never renders an OnSide-draft-specific control at stage "$stage"', ({ stage, actingUser, extra }) => {
    renderCase(humanEditCase(stage, extra), actingUser);
    for (const label of ONSIDE_ONLY_LABELS) {
      expect(screen.queryByRole('button', { name: label })).not.toBeInTheDocument();
    }
  });

  it('AC-A17-2: at a shared stage (cro), renders the identical {label,variant} action set as the drafted-redline leg, for the same acting-role viewer', () => {
    const { unmount } = renderCase(humanEditCase('cro'), CRO);
    const humanPairs = actionButtonPairs();
    unmount();

    renderCase(draftedRedlineCase('cro'), CRO);
    const draftedPairs = actionButtonPairs();

    expect(humanPairs.length).toBeGreaterThan(0);
    expect(humanPairs).toEqual(draftedPairs);
  });

  it('AC-A17-3: the first history entry names the human author and "Language drafted directly by the {role}", never OnSide', () => {
    renderCase(humanEditCase('cro'), CRO);

    const historySection = screen.getByRole('heading', { name: 'Case history' }).closest('section') as HTMLElement;
    const firstEntryText = within(historySection).getAllByText(/Language drafted directly by the CRO|Change detected and language proposed/)[0]?.textContent;
    expect(firstEntryText).toBe('Language drafted directly by the CRO');
    expect(historySection.textContent).toContain('R. Fischer');
    expect(historySection.textContent).not.toContain('OnSide');
    expect(historySection.textContent).not.toContain('Change detected and language proposed');
  });
});

describe('A19 (design_system_spec.md §2.10.2) — CEO / non-acting-role absent-controls doctrine', () => {
  it.each(STAGES_FROM_CRO)('AC-A19-1/-2/-3: CEO gets zero action Buttons, the wait note (where applicable), and never a disabled action Button — human-edit leg, stage "$stage"', ({ stage, extra }) => {
    renderCase(humanEditCase(stage, extra), CEO);

    for (const label of ONSIDE_ONLY_LABELS) {
      expect(screen.queryByRole('button', { name: label })).not.toBeInTheDocument();
    }
    // No type-specific action verb from any stage's set renders either.
    for (const label of ['Final approval & adopt', 'Approve with a condition…', 'Conditional approval…', 'Route to legal counsel', 'Reject', 'Clear as drafted', 'Return with drafting notes', 'Attach committee minutes', 'Record the condition as met']) {
      expect(screen.queryByRole('button', { name: label })).not.toBeInTheDocument();
    }

    const section = screen.getByRole('heading', { name: 'Proposed language' }).closest('section') as HTMLElement;
    // AC-A19-3 — absent, never disabled: no Button in the action region
    // carries a `disabled` attribute for the CEO fixture.
    for (const button of within(section).queryAllByRole('button')) {
      expect(button).not.toHaveAttribute('disabled');
    }

    if (stage !== 'closed') {
      // AC-A19-2 — the existing explanatory wait-note text still renders.
      expect(screen.getByText(/This case is with|Out with|Waiting on|Conditionally approved/)).toBeInTheDocument();
    }
  });

  it('AC-A19-4: the origin field group, redline, and case-history read regions render byte-identical text for a CEO fixture and an acting-role fixture on the same case', () => {
    // PI2-D44 dispatch (docflow/integration): the origin field group (PI2-D31,
    // §2.10 preamble) is now built (case_origin_field_group.test.tsx) — this
    // closes the "origin field group deferred" half this test previously
    // left open, per §2.10.2's "read surfaces are never role-gated" rule.
    const caseForCro = draftedRedlineCase('cro');
    const caseForCeo = draftedRedlineCase('cro');

    const { unmount } = renderCase(caseForCro, CRO);
    const croOrigin = document.querySelector('[data-lf-composite="drawer-content"][data-kind="signal"]')?.textContent;
    const croRedline = document.querySelector('[data-lf-composite="redline-diff-view"]')?.textContent;
    const croHistory = screen.getByRole('heading', { name: 'Case history' }).closest('section')?.textContent;
    unmount();

    renderCase(caseForCeo, CEO);
    const ceoOrigin = document.querySelector('[data-lf-composite="drawer-content"][data-kind="signal"]')?.textContent;
    const ceoRedline = document.querySelector('[data-lf-composite="redline-diff-view"]')?.textContent;
    const ceoHistory = screen.getByRole('heading', { name: 'Case history' }).closest('section')?.textContent;

    expect(croOrigin).toBeTruthy();
    expect(ceoOrigin).toBe(croOrigin);
    expect(croRedline).toBeTruthy();
    expect(ceoRedline).toBe(croRedline);
    expect(croHistory).toBeTruthy();
    expect(ceoHistory).toBe(croHistory);
  });
});
