/**
 * D17 regression — Cases list seeding + case-detail role gating.
 *
 * Base anchors (leapfi-platform.html @ 1c230fe):
 *  - `seedCases()`, source 2587-2603: seeds one case per redlined document
 *    in the fixed 8-id order (irp, tprm-program, aa-procedure,
 *    mrm-change-draft, msg-disclosure, rege-proc, gov-charter,
 *    gen-ai-draft) → ids CASE-2026-001 … CASE-2026-008, all at stage
 *    'analyst'.
 *  - `osCases()`, source 2798-2815: the open-cases table lists every
 *    non-closed/non-rejected case — 8 rows at boot, "Cases · 8 open".
 *  - `caseWaitingOn(c)` / `canAct(c)`, source 2617-2624: a case at stage
 *    'analyst' waits on roleKey 'analyst'; `canAct` compares against
 *    `CURRENT.roleKey`.
 *  - `osCasePage()` analyst-stage branch, source 2829-2835: when
 *    `canAct(c)` the viewer gets the action pair — the affirm/decline
 *    ("Confirm/Disregard") pair is rendered as
 *    "Accept & route for approval" (primary) + "Reject", with the
 *    "Edit the language" ghost beside them (2830-2834); when NOT
 *    `canAct(c)` the ONLY rendering is the waiting note
 *    `This case is with <b>P. Raman, Risk Analyst</b>…` (2835) — zero
 *    action buttons.
 *
 * NOTE on the dispatch's "Confirm/Disregard pair" wording: no control in
 * the base engine at pin 1c230fe is labeled "Confirm" or "Disregard" —
 * the owning-role pair's actual base labels are "Accept & route for
 * approval" / "Reject" (source 2830-2834). These tests pin the base labels.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { Cases } from '../../screens/Cases';
import { seedCases } from '../../data/cases';
import { DOCLIB } from '../../data/doclib';
import { USERS } from '../../data/studio';
import type { StudioUser } from '../../data/studio';
import { topbarFixture } from './fixtures';

/** Pinned expectation data — the 8 seeded case ids (base 2587-2603). */
const EXPECTED_CASE_IDS = [
  'CASE-2026-001',
  'CASE-2026-002',
  'CASE-2026-003',
  'CASE-2026-004',
  'CASE-2026-005',
  'CASE-2026-006',
  'CASE-2026-007',
  'CASE-2026-008',
];

// USERS is the base Active Directory mock (source 1160-1167): [0] Rachel
// Fischer (roleKey 'cro', the boot persona) and [1] Priya Raman (roleKey
// 'analyst', the owner of every freshly seeded case).
const CRO = USERS[0] as StudioUser;
const ANALYST = USERS[1] as StudioUser;

function openCaseDetail(caseId: string): HTMLElement {
  const idCell = screen.getByText(caseId);
  const row = idCell.closest('tr');
  expect(row).not.toBeNull();
  fireEvent.click(within(row as HTMLElement).getByRole('button', { name: 'Open' }));
  const detail = document.querySelector('[data-lf-view="case-detail"]');
  expect(detail).not.toBeNull();
  return detail as HTMLElement;
}

describe('Cases list (base seedCases 2587-2603 / osCases 2798-2815)', () => {
  // CASES is the ported mutable module singleton (`export let CASES`);
  // reseed before each test exactly as the base boot does (source 3924),
  // so stage mutations can never leak between tests.
  beforeEach(() => {
    seedCases(DOCLIB);
  });

  it('lists the 8 seeded cases as open rows with the "8 open" heading', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} />);

    expect(screen.getByRole('heading', { name: '8 open' })).toBeInTheDocument();

    const table = screen.getByRole('table', { name: 'Open cases' });
    // 1 header row + the 8 seeded case rows; no closed-cases section at boot.
    expect(within(table).getAllByRole('row')).toHaveLength(1 + EXPECTED_CASE_IDS.length);
    for (const id of EXPECTED_CASE_IDS) {
      expect(within(table).getByText(id)).toBeInTheDocument();
    }
    expect(screen.queryByText(/Closed cases/)).not.toBeInTheDocument();
  });
});

describe('case-detail role gating (base caseWaitingOn/canAct 2617-2624, osCasePage 2829-2835)', () => {
  beforeEach(() => {
    seedCases(DOCLIB);
  });

  it("CRO viewing an analyst-owned case sees 'This case is with' and ZERO case-action buttons (base 2835)", () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={CRO} />);

    // PI2-D45 (USER OVERRIDE): CASE-2026-001 ('irp', exec tier) now boots
    // pre-routed to 'cro' — CASE-2026-003 ('aa-procedure', proc tier)
    // still boots at 'analyst', genuinely owned by the analyst here.
    const detail = openCaseDetail('CASE-2026-003');

    // Waiting note names the stage owner with the base's exact copy (base
    // cwait, 2835: "This case is with <b>P. Raman, Risk Analyst</b>." —
    // comma, and no notification claim at the analyst stage; CS-05).
    expect(detail.textContent).toContain('This case is with P. Raman, Risk Analyst');
    expect(detail.textContent).not.toContain('notified in the app and by email');

    // ZERO case-ACTION buttons (base 2835 renders no action row for a
    // non-actor). The base page does render doclinks in this state —
    // the Document meta link and "matrix →" (base 2891-2892, restored per
    // CS-08) — so the assertion pins the absence of the action set, not a
    // total button count. No switch-user link renders here because the
    // fixture supplies no persona rows (`profileMenuItems: []`).
    expect(within(detail).getByRole('button', { name: '← All cases' })).toBeInTheDocument();
    expect(within(detail).queryByRole('button', { name: 'Accept & route for approval' })).not.toBeInTheDocument();
    expect(within(detail).queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument();
    expect(within(detail).queryByRole('button', { name: 'Edit the language' })).not.toBeInTheDocument();
    expect(within(detail).queryByRole('button', { name: /Sign in as/ })).not.toBeInTheDocument();
  });

  it('the owning role (analyst) sees the accept/reject action pair (base 2830-2834)', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);

    // PI2-D45 (USER OVERRIDE): same substitution as the previous test.
    const detail = openCaseDetail('CASE-2026-003');

    // The affirm/decline pair the dispatch calls "Confirm/Disregard" —
    // base labels pinned verbatim (see file header note).
    expect(within(detail).getByRole('button', { name: 'Accept & route for approval' })).toBeInTheDocument();
    expect(within(detail).getByRole('button', { name: 'Reject' })).toBeInTheDocument();
    // Beside them, the edit ghost (base 2831); no waiting note renders.
    expect(within(detail).getByRole('button', { name: 'Edit the language' })).toBeInTheDocument();
    expect(detail.textContent).not.toContain('This case is with');

    // The list row also flags the analyst's ownership before opening
    // (base osCases row "Waiting on you", 2801-2803) — verified via the
    // detail's gating already; the pair above is the pinned behavior.
  });
});
