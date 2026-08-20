/**
 * Sprint 1.1 (sprint-overview.md S1.1-01/S1.1-02) — closes the
 * under-rendering gap on OnSideDocuments' "Open governance gaps" table:
 *
 *  - S1.1-01: the `action` cell gains an inline "Open document" link
 *    (DocLink's shipped icon-less treatment, `views/ReportView.tsx:425-444`,
 *    reused verbatim) whenever `GapItem.doc` is set, independent of `obl`.
 *  - S1.1-02: the table gains a `review` column rendering the existing
 *    `Tag` P4 variants (`status-positive`/`hitl`) from the already-seeded
 *    `GapItem.rev` field.
 */
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OnSideDocuments } from '../../screens/OnSideDocuments'
import { resetDemo } from '../../state/demoStore'

beforeAll(() => {
  // jsdom has no scrollIntoView; OnSideDocuments' deep-link/section-scroll
  // effects call it on mount in some configurations.
  Element.prototype.scrollIntoView = vi.fn()
})

afterEach(() => {
  cleanup()
  resetDemo()
})

function renderDocuments() {
  return render(<OnSideDocuments />)
}

function gapRow(tableName: string, textFragment: string) {
  const table = screen.getByRole('table', { name: tableName })
  const row = within(table)
    .getAllByRole('row')
    .find((r) => r.textContent?.includes(textFragment))
  expect(row).toBeDefined()
  return row as HTMLElement
}

describe('S1.1-01 · gapColumns action cell gains the inline "Open document" link', () => {
  it('AC-S1.1-01-1: a gap with BOTH obl and doc set (TPRM-08) shows the existing action text AND the "Open document" link', () => {
    renderDocuments()
    const row = gapRow('Open governance gaps board', 'TPRM-08')
    expect(within(row).getByText('Draft exit-plan standard in review')).toBeInTheDocument()
    expect(within(row).getByRole('button', { name: 'Open document' })).toBeInTheDocument()
  })

  it('AC-S1.1-01-2: pressing "Open document" on TPRM-08 opens the doc drawer for its doc, not the obligation drawer', async () => {
    const user = userEvent.setup()
    renderDocuments()
    const row = gapRow('Open governance gaps board', 'TPRM-08')
    await user.click(within(row).getByRole('button', { name: 'Open document' }))
    expect(await screen.findByRole('dialog', { name: 'Exit Plan Standard' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: 'TPRM-08 · Obligation' })).not.toBeInTheDocument()
  })

  it('AC-S1.1-01-3: a gap with doc: null (MRM-08) renders no "Open document" link', () => {
    renderDocuments()
    const row = gapRow('Open governance gaps board', 'MRM-08')
    expect(within(row).queryByRole('button', { name: 'Open document' })).not.toBeInTheDocument()
  })

  it('AC-S1.1-01-4: the link renders with the DocLink treatment (no button chrome, underlined accent text) and no adjacent Icon', () => {
    renderDocuments()
    const row = gapRow('Open governance gaps board', 'TPRM-08')
    const link = within(row).getByRole('button', { name: 'Open document' })
    expect(link.getAttribute('style')).toContain('background: transparent')
    expect(link.style.textDecoration).toBe('underline')
    expect(link.style.color).toBe('var(--accent)')
    // No button-chrome class/data-primitive attribute this screen's other
    // rowAction buttons carry (`data-lf-primitive="button"`) — this is a
    // plain link, not a Button primitive instance.
    expect(link.hasAttribute('data-lf-primitive')).toBe(false)
    expect(within(row).queryByRole('img')).not.toBeInTheDocument()
  })
})

describe('S1.1-02 · gapColumns gains a Review column from GapItem.rev', () => {
  it('AC-S1.1-02-1: renders "Approved" for rev: ok and "HITL queue" for rev: q, per seeded GAPS row', () => {
    renderDocuments()
    // TPRM-08: rev: 'q' -> HITL queue
    const hitlRow = gapRow('Open governance gaps board', 'TPRM-08')
    expect(within(hitlRow).getByText('HITL queue')).toBeInTheDocument()
    // "Model-derived adverse-action reason codes": rev: 'ok' -> Approved
    const approvedRow = gapRow('Open governance gaps board', 'Model-derived adverse-action reason codes')
    expect(within(approvedRow).getByText('Approved')).toBeInTheDocument()
  })

  it('AC-S1.1-02-2: the Review Tag carries no press handler (non-interactive)', () => {
    renderDocuments()
    const row = gapRow('Open governance gaps board', 'TPRM-08')
    const tag = within(row).getByText('HITL queue')
    expect(tag.closest('button')).toBeNull()
    expect(tag.tagName.toLowerCase()).not.toBe('button')
  })

  it('AC-S1.1-02-3: the column header reads the data label "Review", not explanatory prose', () => {
    renderDocuments()
    const table = screen.getByRole('table', { name: 'Open governance gaps board' })
    expect(within(table).getByRole('columnheader', { name: 'Review' })).toBeInTheDocument()
  })
})
