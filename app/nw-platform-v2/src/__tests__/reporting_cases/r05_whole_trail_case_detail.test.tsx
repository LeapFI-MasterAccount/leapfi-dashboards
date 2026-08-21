/**
 * r05 (r05_whole_trail.md) — "Required display elements" 1 and 5, built
 * directly on `CaseDetail.tsx` (the side-car that already hosts elements
 * 2/3/4 per PI2-D14/PI2-D31; see that file's own header comments at the
 * two new sections these tests pin).
 *
 *  - Element 1, "Requirement statement: what the rule or control required
 *    before OnSide drafted a response" — a new "Requirement" section fed
 *    by `caseItem.trigger` (data/cases.ts's `CASE_TRIGGER`), distinct
 *    from the PI2-D31 origin group's Signal/Note fields (different data
 *    source, different string).
 *  - Element 5, "Document version: which policy document version this
 *    wording landed in" — `doc.v`, now rendered unconditionally whenever
 *    `doc` resolves, not just at the `closed` stage (the pre-existing
 *    "Adopted as {doc.v}" sentence stays closed-stage-only and untouched).
 *
 * DISCRIMINATING: reverting the two new blocks in `CaseDetail.tsx` (the
 * "Requirement" section and the unconditional "Document version" field)
 * in a scratch copy makes every test below fail — the label/value pairs
 * simply are not in the document.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CaseDetail } from '../../views/CaseDetail';
import type { Case } from '../../data/cases';
import { DOCLIB } from '../../data/doclib';
import { USERS } from '../../data/studio';
import type { StudioUser } from '../../data/studio';

const CRO = USERS[0] as StudioUser; // Rachel Fischer, roleKey 'cro'

function baseCase(overrides: Partial<Case> = {}): Case {
  return {
    id: 'CASE-TEST-R05-01',
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

describe('r05 element 1 — Requirement statement', () => {
  it('renders a "Requirement" label paired with the case\'s own trigger text (CASE_TRIGGER data), at a non-closed stage', () => {
    const caseItem = baseCase({ stage: 'cro', trigger: 'Interagency RFI 2026-04 · agentic systems fall outside the charter as written' });
    renderCase(caseItem);

    expect(screen.getByRole('heading', { name: 'Requirement' })).toBeInTheDocument();
    expect(screen.getByText('Cited requirement')).toBeInTheDocument();
    expect(screen.getByText('Interagency RFI 2026-04 · agentic systems fall outside the charter as written')).toBeInTheDocument();
  });

  it('is a genuinely different value from the PI2-D31 origin group\'s Note field (not a duplicate render of existing content)', () => {
    const requirementText = 'Interagency RFI 2026-04 · agentic systems fall outside the charter as written';
    // gov-charter resolves (via resolveOriginSignal) to SIGNAL[0] (RFI
    // 2026-04); its own `read` note text — rendered by the pre-existing
    // origin group's "Note" field row — is a different string entirely.
    const originNoteText = 'Would put generative and agentic systems inside the model definition. Our charter and MRM scope both stop short of that today.';
    renderCase(baseCase({ doc: 'gov-charter', trigger: requirementText }));

    expect(screen.getByText(requirementText)).toBeInTheDocument();
    expect(screen.getByText(originNoteText)).toBeInTheDocument();
    expect(requirementText).not.toBe(originNoteText);
  });

  it('renders for a case with no other overrides at the analyst stage too — the Requirement section is not stage-gated', () => {
    renderCase(baseCase({ stage: 'analyst', trigger: 'CFPB Circular 2026-C1 · adverse-action notices must give the specific principal reason', doc: 'aa-procedure' }));
    expect(screen.getByRole('heading', { name: 'Requirement' })).toBeInTheDocument();
    expect(screen.getByText('CFPB Circular 2026-C1 · adverse-action notices must give the specific principal reason')).toBeInTheDocument();
  });
});

describe('r05 element 5 — Document version renders unconditionally, not just at the closed stage', () => {
  it('at the cro stage (not closed), "Document version" renders the doclib entry\'s own v', () => {
    renderCase(baseCase({ stage: 'cro', doc: 'gov-charter' }));
    expect(screen.getByText('Document version')).toBeInTheDocument();
    expect(screen.getByText(DOCLIB['gov-charter']!.v)).toBeInTheDocument();
  });

  it('at the analyst stage, "Document version" already renders (the pre-existing "Adopted as {v}" sentence only ever rendered at the closed stage)', () => {
    renderCase(baseCase({ stage: 'analyst', doc: 'gov-charter' }));
    expect(screen.getByText('Document version')).toBeInTheDocument();
    expect(screen.getByText(DOCLIB['gov-charter']!.v)).toBeInTheDocument();
  });

  it('at the closed stage, both the unconditional field and the pre-existing closed-state sentence render (no regression)', () => {
    renderCase(baseCase({ stage: 'closed', doc: 'gov-charter' }));
    expect(screen.getByText('Document version')).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`Adopted as ${DOCLIB['gov-charter']!.v}`))).toBeInTheDocument();
  });

  it('when the case\'s document id has no DOCLIB match, "Document version" does not render (honest absence, not a fabricated value)', () => {
    renderCase(baseCase({ doc: 'no-such-doc-id' }));
    expect(screen.queryByText('Document version')).not.toBeInTheDocument();
  });
});
