/**
 * PI2-D2 leg (b), r02_one_case_page.md "Acceptance criteria —
 * deadline-driven case leg," AC-r02-D1..D10 — `views/CaseDetail.tsx`'s
 * `DeadlineCaseDetail` component (docflow/deadline-leg dispatch).
 *
 * AC-r02-D-GATE (resolved by PI2-D46, user ruling): "Mark complete" gates
 * on `ownerRoleKey(caseItem.owner)` (data/cases.ts) — the case record's
 * OWN existing owner data, mapped to a real, registered
 * `StudioUser.roleKey`. Tested here via three fixtures: the shipped
 * `DEADLINE_DRIVEN_CASE_FIXTURE` (owner `'R. Fischer · CRO'`, resolves to
 * `'cro'`), the CRO's own currentUser (gating), and an UNMAPPED-owner
 * fixture (`'M. Okafor · CCO'` — no `USERS` entry) exercising the
 * "renders the honest absent-controls wait-note for everyone" clause.
 *
 * Grep verifications read `views/CaseDetail.tsx` from disk and extract
 * exactly the deadline-leg's own source (from `export type
 * DeadlineActionKind` to end-of-file — the leg's sole render path,
 * appended after `CaseDetail`/`renderActions()` above it) so a mention of
 * "RedlineDiffView" inside this same file's UNRELATED drafted-redline-leg
 * code, or inside this leg's own JSDoc header (which necessarily
 * discusses what it does NOT do), can never produce a false pass/fail.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { DeadlineCaseDetail } from '../../views/CaseDetail';
import type { DeadlineActionKind } from '../../views/CaseDetail';
import { DEADLINE_DRIVEN_CASE_FIXTURE } from '../../data/cases';
import type { DeadlineDrivenCase } from '../../data/cases';
import { SIGNAL } from '../../data/misc';
import { USERS } from '../../data/studio';
import type { StudioUser } from '../../data/studio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CASE_DETAIL_SOURCE = readFileSync(path.resolve(__dirname, '../../views/CaseDetail.tsx'), 'utf-8');
const LEG_MARKER = 'export type DeadlineActionKind';
const legMarkerIndex = CASE_DETAIL_SOURCE.indexOf(LEG_MARKER);
if (legMarkerIndex === -1) {
  throw new Error('deadline_case_detail.test.tsx: could not locate the deadline-leg source marker in CaseDetail.tsx — grep assertions below would silently pass against an empty string.');
}
/** The deadline-leg's own render path — see file header. */
const DEADLINE_LEG_SOURCE = CASE_DETAIL_SOURCE.slice(legMarkerIndex);

const CRO = USERS[0] as StudioUser; // Rachel Fischer, roleKey 'cro' — DEADLINE_DRIVEN_CASE_FIXTURE's owner resolves to this
const ANALYST = USERS[1] as StudioUser; // Priya Raman, roleKey 'analyst' — never the gating role for this fixture
const CEO = USERS[3] as StudioUser; // Adam Schlesinger, roleKey 'ceo' — waitingOnRoleKey/ownerRoleKey never resolve to 'ceo'

function trackingCase(overrides: Partial<DeadlineDrivenCase> = {}): DeadlineDrivenCase {
  return { ...DEADLINE_DRIVEN_CASE_FIXTURE, history: DEADLINE_DRIVEN_CASE_FIXTURE.history.map((h) => ({ ...h })), ...overrides };
}

function renderDeadline(caseItem: DeadlineDrivenCase, currentUser: StudioUser, pendingAction: DeadlineActionKind | null = null, onAction: (kind: DeadlineActionKind) => void = () => {}) {
  return render(<DeadlineCaseDetail caseItem={caseItem} currentUser={currentUser} onBack={() => {}} onAction={onAction} pendingAction={pendingAction} />);
}

describe('AC-r02-D1 — origin field group (PI2-D31) applies verbatim, populated', () => {
  it('renders four populated Source/Date/Signal/Note rows for the shipped fixture', () => {
    renderDeadline(trackingCase(), CRO);

    const signalEntry = SIGNAL[0]!; // gov-charter resolves to SIGNAL[0], RFI 2026-04
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText(signalEntry.sc)).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText(signalEntry.age)).toBeInTheDocument();
    expect(screen.getByText('Signal')).toBeInTheDocument();
    expect(screen.getByText(signalEntry.t)).toBeInTheDocument();
    expect(screen.getByText('Note')).toBeInTheDocument();
    expect(screen.getByText(signalEntry.read)).toBeInTheDocument();
  });
});

describe('AC-r02-D2 — a Deadline field row replaces "Proposed language"', () => {
  it('renders exactly one C8 field row: label "Deadline", value = caseItem.deadline verbatim', () => {
    const caseItem = trackingCase();
    renderDeadline(caseItem, CRO);

    // Scoped to the C8 DrawerContent field-row group (kind="doc") — the
    // section heading above it also reads "Deadline" (§ file header,
    // "Deadline" heading text), so the unscoped query would double-count.
    const fieldGroup = document.querySelector('[data-lf-composite="drawer-content"][data-kind="doc"]') as HTMLElement;
    expect(fieldGroup).not.toBeNull();
    expect(within(fieldGroup).getAllByText('Deadline')).toHaveLength(1);
    expect(within(fieldGroup).getByText(caseItem.deadline)).toBeInTheDocument();
    // Exactly one field row total in that group (one <dt>/<dd> pair).
    expect(fieldGroup.querySelectorAll('dt')).toHaveLength(1);
  });

  it('(grep) no RedlineDiffView reference exists anywhere on the deadline-leg render path', () => {
    expect(DEADLINE_LEG_SOURCE).not.toMatch(/RedlineDiffView/);
  });
});

describe('AC-r02-D3 — status Tag reuses the existing stage-pill Tag slot, no new variant', () => {
  it('tracking renders {text: "Tracking", variant: "status-caution"}', () => {
    renderDeadline(trackingCase({ status: 'tracking' }), CRO);
    const tag = screen.getByText('Tracking').closest('[data-lf-primitive="tag"]');
    expect(tag).not.toBeNull();
    expect(tag).toHaveAttribute('data-variant', 'status-caution');
  });

  it('completed renders {text: "Completed", variant: "status-positive"}', () => {
    renderDeadline(trackingCase({ status: 'completed' }), CRO);
    const tag = screen.getByText('Completed').closest('[data-lf-primitive="tag"]');
    expect(tag).not.toBeNull();
    expect(tag).toHaveAttribute('data-variant', 'status-positive');
  });

  it('(grep) Tag.tsx gains no new NonRaciTagVariant entry', () => {
    const tagSource = readFileSync(path.resolve(__dirname, '../../components/primitives/Tag.tsx'), 'utf-8');
    const match = tagSource.match(/export type TagVariant = ([^;]+);/);
    expect(match).not.toBeNull();
    expect((match as RegExpMatchArray)[1]).toBe(
      "'status-positive' | 'status-caution' | 'status-alert' | 'hitl' | 'count' | 'locked' | 'raci-mark'",
    );
  });
});

describe('AC-r02-D4 — exactly one primary "Mark complete" Button for a gating viewer at tracking', () => {
  it('CRO (the fixture\'s resolved owner role) sees exactly one primary Button, labeled "Mark complete"', () => {
    renderDeadline(trackingCase(), CRO);

    const button = screen.getByRole('button', { name: 'Mark complete' });
    expect(button).toHaveAttribute('data-variant', 'primary');
    // No second Button competes for primary weight anywhere on screen.
    const primaries = screen.getAllByRole('button').filter((el) => el.getAttribute('data-variant') === 'primary');
    expect(primaries).toHaveLength(1);
    expect(primaries[0]).toBe(button);
  });

  it('(grep) DrawerContent.tsx still carries the one-primary guard this leg is held to', () => {
    const drawerContentSource = readFileSync(path.resolve(__dirname, '../../components/DrawerContent.tsx'), 'utf-8');
    expect(drawerContentSource).toMatch(/function assertAtMostOnePrimaryAction/);
  });
});

describe('AC-r02-D5 — zero action Buttons at status "completed", for ANY viewer', () => {
  it.each([
    { label: 'the gating (CRO) viewer', user: CRO },
    { label: 'a non-gating (analyst) viewer', user: ANALYST },
    { label: 'the CEO', user: CEO },
  ])('$label sees zero action Buttons on a completed case', ({ user }) => {
    renderDeadline(trackingCase({ status: 'completed' }), user);
    expect(screen.queryByRole('button', { name: 'Mark complete' })).not.toBeInTheDocument();
    // Only the "← All cases" back Button remains — no other action control.
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: '← All cases' })).toBeInTheDocument();
  });
});

describe('AC-r02-D6 — non-gating viewer at "tracking": the wait-note shape, never a disabled control', () => {
  it('ANALYST (not the resolved owner role) sees the wait note, not "Mark complete"', () => {
    renderDeadline(trackingCase(), ANALYST);

    expect(screen.queryByRole('button', { name: 'Mark complete' })).not.toBeInTheDocument();
    expect(screen.getByText(/This case is with/)).toBeInTheDocument();
    expect(screen.getByText(/R\. Fischer · CRO/)).toBeInTheDocument();
  });

  it('no Button anywhere on the screen carries a disabled attribute for a non-gating viewer', () => {
    renderDeadline(trackingCase(), ANALYST);
    for (const button of screen.getAllByRole('button')) {
      expect(button).not.toHaveAttribute('disabled');
    }
  });
});

describe('AC-r02-D7 — CEO: "Mark complete" never renders, no CEO-specific branch', () => {
  it.each([{ status: 'tracking' as const }, { status: 'completed' as const }])('CEO sees no "Mark complete" at status "$status"', ({ status }) => {
    renderDeadline(trackingCase({ status }), CEO);
    expect(screen.queryByRole('button', { name: 'Mark complete' })).not.toBeInTheDocument();
  });

  it('(grep) no \'ceo\' literal exists anywhere on the deadline-leg render path', () => {
    expect(DEADLINE_LEG_SOURCE.toLowerCase()).not.toMatch(/ceo/);
  });
});

describe('AC-r02-D-GATE (PI2-D46) — an owner abbreviation with no registered roleKey gates NOBODY', () => {
  it('an unmapped owner ("M. Okafor · CCO") renders the wait note for the CRO fixture too — never a lying or disabled control', () => {
    const caseItem = trackingCase({ owner: 'M. Okafor · CCO' });
    renderDeadline(caseItem, CRO);

    expect(screen.queryByRole('button', { name: 'Mark complete' })).not.toBeInTheDocument();
    expect(screen.getByText(/This case is with/)).toBeInTheDocument();
    expect(screen.getByText(/M\. Okafor · CCO/)).toBeInTheDocument();
    for (const button of screen.getAllByRole('button')) {
      expect(button).not.toHaveAttribute('disabled');
    }
  });

  it('the same unmapped owner also renders the wait note for the CEO and for the analyst — nobody gates', () => {
    const caseItem = trackingCase({ owner: 'M. Okafor · CCO' });

    const { unmount } = renderDeadline(caseItem, CEO);
    expect(screen.queryByRole('button', { name: 'Mark complete' })).not.toBeInTheDocument();
    unmount();

    renderDeadline(caseItem, ANALYST);
    expect(screen.queryByRole('button', { name: 'Mark complete' })).not.toBeInTheDocument();
  });
});

describe('AC-r02-D9 — no "View full document" Button on the deadline-leg path', () => {
  it('renders no "View full document" Button at any status', () => {
    const { unmount } = renderDeadline(trackingCase({ status: 'tracking' }), CRO);
    expect(screen.queryByRole('button', { name: 'View full document' })).not.toBeInTheDocument();
    unmount();

    renderDeadline(trackingCase({ status: 'completed' }), CRO);
    expect(screen.queryByRole('button', { name: 'View full document' })).not.toBeInTheDocument();
  });

  it('(grep) the string "View full document" does not appear anywhere on the deadline-leg render path', () => {
    expect(DEADLINE_LEG_SOURCE).not.toMatch(/View full document/);
  });
});

describe('AC-r02-D10 (D26) — the Deadline field row and status Tag are DATA only, no narration', () => {
  it('(grep) no sentence narrating what a "deadline-driven case" is or how tracking works appears on this leg\'s render path', () => {
    expect(DEADLINE_LEG_SOURCE.toLowerCase()).not.toMatch(/deadline-driven case/);
    expect(DEADLINE_LEG_SOURCE.toLowerCase()).not.toMatch(/how tracking works/);
  });
});

describe('Irreversibility gate (persona directive 6) — pessimistic render, no optimistic "done"', () => {
  it('"Mark complete" shows loading + disabled while pendingAction is mid-commit, and never fires onAction twice from one press', () => {
    let calls = 0;
    const { rerender } = render(
      <DeadlineCaseDetail caseItem={trackingCase()} currentUser={CRO} onBack={() => {}} onAction={() => { calls++; }} pendingAction={null} />,
    );

    const button = screen.getByRole('button', { name: 'Mark complete' });
    expect(button).not.toHaveAttribute('disabled');

    fireEvent.click(button);
    expect(calls).toBe(1);

    // The commit pipeline (Cases.tsx) sets pendingAction — simulate that
    // prop flip here, at the component boundary this test owns. A loading
    // Button visually hides its label (Button.tsx), so its accessible
    // name is no longer "Mark complete" — query by `aria-busy` instead,
    // same pattern `cases_fix_wave.test.tsx`'s CS-13 test already uses.
    rerender(<DeadlineCaseDetail caseItem={trackingCase()} currentUser={CRO} onBack={() => {}} onAction={() => { calls++; }} pendingAction="mark-complete" />);
    const busyButtons = screen.getAllByRole('button').filter((el) => el.getAttribute('aria-busy') === 'true');
    expect(busyButtons).toHaveLength(1);
    const busyButton = busyButtons[0] as HTMLElement;
    expect(busyButton).toHaveAttribute('disabled');
    // A second press while mid-commit cannot fire onAction again — the
    // control is a real disabled <button>, not merely styled to look busy.
    fireEvent.click(busyButton);
    expect(calls).toBe(1);
  });
});

describe('Accessibility gate (persona directive 7)', () => {
  it('back Button and "Mark complete" are real <button> elements; status is paired with text via Tag (never color-only)', () => {
    renderDeadline(trackingCase(), CRO);
    expect(within(document.body).getByRole('button', { name: '← All cases' }).tagName).toBe('BUTTON');
    expect(within(document.body).getByRole('button', { name: 'Mark complete' }).tagName).toBe('BUTTON');
    const tag = screen.getByText('Tracking');
    expect(tag.textContent).toBe('Tracking'); // text always renders — never an icon/color-only carrier
  });
});
