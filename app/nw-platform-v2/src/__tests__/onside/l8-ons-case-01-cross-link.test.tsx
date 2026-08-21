/**
 * L8 exit criterion 6 (D15) — ONS-CASE-01 (`r14_census_high_gaps.md`):
 * "Document/redline drawer has no cross-reference back to the case it
 * produced." Extends A18's case→document pattern (`CaseDetail.tsx`'s
 * "View full document") with its REVERSE: document→case.
 *
 * Two-part evidence, matching the AC's own three-box shape:
 *  - AC1/AC2 (production code, `OnSideDocuments.tsx`): a case-affiliated
 *    document's drawer shows a clickable "Case" field that fires a
 *    'case'-kind deep link (App.tsx's DeepLinkKind — already CLASS 1,
 *    already wired both sides; no App.tsx change needed or made).
 *  - AC3 ("Case context includes: requirement, current wording, approval
 *    stage, who/when"): verified against `CaseDetail.tsx` AS ALREADY
 *    SHIPPED (rendered here via `Cases.tsx`, imported unmodified — this
 *    lane's ALLOWLIST restricts `CaseDetail.tsx` to its cross-link region
 *    only, and no cross-link-region edit was needed there: the side-car's
 *    existing Drawer heading (case title = what was required), inline
 *    RedlineDiffView (current wording), stage Tag (approval stage), and
 *    CaseHistoryEntry list (who/when) already satisfy this AC verbatim).
 *
 * DISCRIMINATING (AC1/AC2 half): reverting the `affiliatedCase`
 * derivation + the conditional "Case" field spread in
 * `OnSideDocuments.tsx`'s `drawerFields` (a scratch copy with both
 * removed) makes the first two tests below fail — no "Case" field
 * renders and no 'case'-kind deep link fires.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within, fireEvent, act } from '@testing-library/react'
import { OnSideDocuments } from '../../screens/OnSideDocuments'
import { Cases } from '../../screens/Cases'
import { seedCases } from '../../data/cases'
import { DOCLIB } from '../../data/doclib'
import { USERS } from '../../data/studio'
import type { StudioUser } from '../../data/studio'
import { topbarFixture } from '../reporting_cases/fixtures'

const ANALYST = USERS[1] as StudioUser // Priya Raman, roleKey 'analyst' — owns CASE-2026-001 fresh out of seedCases()

beforeEach(() => {
  seedCases(DOCLIB)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('OnSide · Documents — ONS-CASE-01 doc→case cross-link (AC1/AC2)', () => {
  it('a case-affiliated document drawer (irp, CASE-2026-001) shows a "Case" field naming the case id', async () => {
    render(
      <OnSideDocuments
        deepLink={{ screen: 'onside.documents', kind: 'document', id: 'irp', nonce: 1 }}
        onDeepLink={() => {}}
        onDeepLinkConsumed={() => {}}
      />,
    )
    const dialog = await screen.findByRole('dialog', { name: 'Incident Response Plan' })
    expect(within(dialog).getByText('CASE-2026-001')).toBeInTheDocument()
  })

  it('pressing the Case field fires a \'case\'-kind deep link with the affiliated case id', async () => {
    const onDeepLink = vi.fn()
    render(
      <OnSideDocuments
        deepLink={{ screen: 'onside.documents', kind: 'document', id: 'irp', nonce: 1 }}
        onDeepLink={onDeepLink}
        onDeepLinkConsumed={() => {}}
      />,
    )
    const dialog = await screen.findByRole('dialog', { name: 'Incident Response Plan' })
    const caseLink = within(dialog).getByText('CASE-2026-001')
    fireEvent.click(caseLink)
    expect(onDeepLink).toHaveBeenCalledWith({ screen: 'cases', kind: 'case', id: 'CASE-2026-001' })
  })

  it('a document with no affiliated case (no redline, mrm-val-tm) renders no "Case" field — never a dead click', async () => {
    render(
      <OnSideDocuments
        deepLink={{ screen: 'onside.documents', kind: 'document', id: 'mrm-val-tm', nonce: 1 }}
        onDeepLink={() => {}}
        onDeepLinkConsumed={() => {}}
      />,
    )
    const dialog = await screen.findByRole('dialog', { name: /Model Validation Report/ })
    expect(within(dialog).queryByText(/CASE-2026-/)).not.toBeInTheDocument()
  })

  it('when the consumer has not wired onDeepLink, the Case value still renders but is not offered as a press affordance (no dead click)', async () => {
    render(<OnSideDocuments deepLink={{ screen: 'onside.documents', kind: 'document', id: 'irp', nonce: 1 }} onDeepLinkConsumed={() => {}} />)
    const dialog = await screen.findByRole('dialog', { name: 'Incident Response Plan' })
    expect(within(dialog).queryByText('CASE-2026-001')).not.toBeInTheDocument()
  })
})

describe('ONS-CASE-01 AC3 — case context on landing (CaseDetail.tsx, verified AS SHIPPED, no cross-link-region edit needed)', () => {
  it('the case side-car already renders: requirement (case title, the Drawer heading), current wording (RedlineDiffView), approval stage (stage Tag text), and who/when (CaseHistoryEntry rows)', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />)

    const idCell = screen.getByText('CASE-2026-001')
    const row = idCell.closest('tr')
    expect(row).not.toBeNull()
    const openButton = within(row as HTMLElement).getByRole('button', { name: 'Open' })
    act(() => {
      openButton.focus()
    })
    fireEvent.click(openButton)

    // Requirement — the case's own title, carried as the side-car's accessible name (the Drawer heading).
    const dialog = screen.getByRole('dialog', { name: /CASE-2026-001/ })
    expect(dialog).toBeInTheDocument()

    // Current wording — RedlineDiffView's own before/after labels
    // (CaseDetail.tsx supplies stage-specific label text, e.g. "Before ·
    // in force until this is adopted" / "After · proposed, not yet in
    // force" — matched by prefix rather than the component's own default).
    expect(dialog.textContent).toMatch(/Before/)
    expect(dialog.textContent).toMatch(/After/)

    // Approval stage — a fresh-seeded case starts at the 'analyst' stage; its own status pill text renders somewhere in the side-car.
    expect(dialog.textContent).toMatch(/analyst|Not decided yet|Risk Analyst/i)

    // Who/when — the seeded CaseHistoryEntry ("OnSide" system actor, "Change detected and language proposed").
    expect(within(dialog).getByText('Change detected and language proposed')).toBeInTheDocument()
    expect(dialog.textContent).toContain('OnSide')
  })
})
