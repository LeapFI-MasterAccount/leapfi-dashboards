/**
 * PI2-D44 dispatch, task 2a — design_system_spec.md §2.10 preamble /
 * §2.10.1 item 5 (amendment A17), PI2-D31's origin field group.
 *
 * `CaseDetail.tsx`'s standalone `caseItem.trigger` paragraph is replaced
 * by a DrawerContent (C8) field-row group of exactly four rows (Source,
 * Date, Signal, Note), fed by lane 1's `resolveOriginSignal` (data/
 * originSignal.ts) against `caseItem.doc`. AC-r02-2 (cited by A17 item 5,
 * reused verbatim): an unresolvable origin renders the group's empty-state
 * message and ZERO field rows, never a blank row set.
 *
 * STOP (this dispatch's task 4, evidence return): A17/PI2-D31 also specify
 * the Signal row as an inline 'signal'-kind deep link. That half is
 * deliberately NOT wired here — see the dispatch return for the full
 * trace of why the live 'signal'-kind deep-link consumer
 * (OnSideFeed.tsx's SIGNAL_ROW_BY_ID) reads a structurally different
 * dataset than the one this resolver correctly reads for doc-linkage
 * (data/misc.ts's SIGNAL[].touch) — wiring it today would ship a control
 * that resolves to nothing (PI2-D24 "no lying controls"). The last test
 * below pins that the Signal row renders as plain text, not a pressable
 * link, until that STOP is resolved by a design/data ruling.
 */
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { CaseDetail } from '../../views/CaseDetail';
import type { Case } from '../../data/cases';
import { HUMAN_CONTRIBUTED_EDIT_CASE_FIXTURE } from '../../data/cases';
import { DOCLIB } from '../../data/doclib';
import { SIGNAL } from '../../data/misc';
import { USERS } from '../../data/studio';
import type { StudioUser } from '../../data/studio';

const CRO = USERS[0] as StudioUser; // Rachel Fischer, roleKey 'cro'

function baseCase(overrides: Partial<Case> = {}): Case {
  return {
    id: 'CASE-TEST-ORIGIN-01',
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
    history: [{ when: 'Aug 14, 2026 · 6:12 AM ET', who: 'OnSide', role: 'System', what: 'Change detected and language proposed', note: '' }],
    ...overrides,
  };
}

function renderCase(caseItem: Case) {
  const doc = DOCLIB[caseItem.doc];
  return render(<CaseDetail caseItem={caseItem} doc={doc} currentUser={CRO} onBack={() => {}} onAction={() => {}} pendingAction={null} />);
}

describe('PI2-D31 origin field group (design_system_spec.md §2.10 preamble, AC-r02-1/AC-r02-2)', () => {
  it('resolved origin: renders Source/Date/Signal/Note rows fed by resolveOriginSignal, and drops the old trigger paragraph', () => {
    const caseItem = baseCase({ doc: 'gov-charter' });
    renderCase(caseItem);

    const signalEntry = SIGNAL[0]!; // gov-charter resolves to SIGNAL[0] (RFI 2026-04) — see origin-signal.test.ts
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText(signalEntry.sc)).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText(signalEntry.age)).toBeInTheDocument();
    expect(screen.getByText('Signal')).toBeInTheDocument();
    expect(screen.getByText(signalEntry.t)).toBeInTheDocument();
    expect(screen.getByText('Note')).toBeInTheDocument();
    expect(screen.getByText(signalEntry.read)).toBeInTheDocument();

    // The old standalone trigger paragraph (caseItem.trigger rendered as a
    // bare, unlabeled paragraph directly under the case header) is still
    // gone — but r05 (r05_whole_trail.md, "Requirement statement," AC-r05-1
    // implementation, `views/CaseDetail.tsx`'s "Requirement" section)
    // reintroduces the SAME string in a distinct, labeled field group. This
    // assertion pins the SHAPE of that reintroduction, not blanket absence:
    // the trigger value renders exactly once, inside a `kind="doc"`
    // DrawerContent field group carrying its own "Cited requirement" label
    // — never as a second, unlabeled copy sitting alongside the `kind=
    // "signal"` origin group asserted above.
    const triggerNodes = screen.getAllByText(caseItem.trigger);
    expect(triggerNodes).toHaveLength(1);
    const requirementFieldGroup = triggerNodes[0]!.closest('[data-lf-composite="drawer-content"]');
    expect(requirementFieldGroup).not.toBeNull();
    expect(requirementFieldGroup).toHaveAttribute('data-kind', 'doc');
    expect(within(requirementFieldGroup as HTMLElement).getByText('Cited requirement')).toBeInTheDocument();
  });

  it('AC-r02-2: unresolvable origin renders the empty-state message and ZERO field rows, never a blank row set', () => {
    // HUMAN_CONTRIBUTED_EDIT_CASE_FIXTURE.doc ('rege-proc') is deliberately
    // a doc id no SIGNAL entry's touch list carries (data/cases.ts's own
    // fixture header).
    renderCase(HUMAN_CONTRIBUTED_EDIT_CASE_FIXTURE);

    expect(screen.queryByText('Source')).not.toBeInTheDocument();
    expect(screen.queryByText('Signal')).not.toBeInTheDocument();
    // Zero field rows: no origin-group <dl> is mounted at all.
    expect(document.querySelector('[data-lf-composite="drawer-content"][data-kind="signal"]')).not.toBeInTheDocument();
    // An explicit empty-state message renders instead of a blank gap.
    expect(screen.getByText(/no regulatory signal/i)).toBeInTheDocument();
  });

  it('STOP (task 4): the Signal row renders as plain text, never a pressable deep link — see file header', () => {
    renderCase(baseCase({ doc: 'gov-charter' }));

    const signalEntry = SIGNAL[0]!;
    const signalValueNode = screen.getByText(signalEntry.t);
    // DrawerContentField.onPress renders the value inside a <button>
    // (affordance_standard.md §3.2); plain text renders with no enclosing
    // button at all — asserting the absence is the falsifiable form of
    // "not wired" this STOP requires.
    expect(signalValueNode.closest('button')).toBeNull();
  });
});
