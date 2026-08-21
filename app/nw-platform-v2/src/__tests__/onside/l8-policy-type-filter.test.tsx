/**
 * L8 exit criterion 1 (D15/D5, 02-sprint-plan.md): a fourth FilterGroup —
 * "Type: Policy/Standard/Procedure" — on `OnSideDocuments.tsx`'s existing
 * FilterBar. No new screen, no nav-budget cost. `doclib.ts`'s `DocType`
 * union already carries these three members as real seeded data.
 *
 * DISCRIMINATING: reverting the `typeFilterGroup`/`selectedTypes` addition
 * in `OnSideDocuments.tsx` (a scratch copy with the Type FilterGroup
 * removed from the `<FilterBar groups={[...]}>` array) makes every test
 * below fail — the "Type" filter-group button no longer exists and the
 * row-count-after-filtering assertion no longer reduces the table.
 */
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OnSideDocuments } from '../../screens/OnSideDocuments'
import { DOCLIB } from '../../data/doclib'
import type { DocType } from '../../data/doclib'
import { DOMAINS } from '../../data/onside'

const ALL_DOCS = Object.values(DOCLIB)

function getFilterBar(container: HTMLElement): HTMLElement {
  const bar = container.querySelector('[data-lf-composite="filter-bar"]')
  expect(bar).not.toBeNull()
  return bar as HTMLElement
}

describe('OnSide · Documents — Type FilterGroup (D5, L8 AC 1)', () => {
  it('renders a "Type" filter group with Policy/Standard/Procedure options carrying live counts from the document universe', async () => {
    const user = userEvent.setup()
    const { container } = render(<OnSideDocuments />)
    const filterBar = getFilterBar(container)

    await user.click(within(filterBar).getByRole('button', { name: 'Type' }))

    for (const type of ['Policy', 'Standard', 'Procedure'] as const) {
      const count = ALL_DOCS.filter((doc) => doc.type === type).length
      expect(within(filterBar).getByRole('button', { name: `${type} (${count})` })).toBeInTheDocument()
    }
  })

  it('selecting the "Policy" type option filters the document library table to Policy-type rows only', async () => {
    const user = userEvent.setup()
    render(<OnSideDocuments />)

    const policyCount = ALL_DOCS.filter((doc) => doc.type === 'Policy').length
    expect(policyCount).toBeGreaterThan(0)
    expect(policyCount).toBeLessThan(ALL_DOCS.length)

    await user.click(screen.getByRole('button', { name: 'Type' }))
    await user.click(screen.getByRole('button', { name: `Policy (${policyCount})` }))

    const table = screen.getByRole('table', { name: 'Document library' })
    // +1 header row.
    expect(within(table).getAllByRole('row')).toHaveLength(policyCount + 1)
    // Every remaining "Type" cell reads "Policy" — never a non-Policy row leaking through.
    const nonPolicyLeak: DocType[] = ['Standard', 'Procedure', 'Evidence', 'Committee record', 'Board record', 'Draft', 'Template', 'Training']
    for (const type of nonPolicyLeak) {
      expect(within(table).queryByText(type)).not.toBeInTheDocument()
    }
  })

  it('the Type filter composes with the existing Domain filter (AND semantics, matching the domain/status/redline group precedent)', async () => {
    const user = userEvent.setup()
    const { container } = render(<OnSideDocuments />)
    const filterBar = getFilterBar(container)

    const firstPolicyDoc = ALL_DOCS.find((doc) => doc.type === 'Policy')
    expect(firstPolicyDoc).toBeDefined()
    const domainKey = firstPolicyDoc!.dom
    const domainName = DOMAINS.find((d) => d.key === domainKey)!.name
    const domainDocCount = ALL_DOCS.filter((doc) => doc.dom === domainKey).length
    const composedCount = ALL_DOCS.filter((doc) => doc.type === 'Policy' && doc.dom === domainKey).length
    expect(composedCount).toBeGreaterThan(0)
    expect(composedCount).toBeLessThan(domainDocCount)

    const policyCount = ALL_DOCS.filter((doc) => doc.type === 'Policy').length
    await user.click(within(filterBar).getByRole('button', { name: 'Type' }))
    await user.click(within(filterBar).getByRole('button', { name: `Policy (${policyCount})` }))
    await user.click(within(filterBar).getByRole('button', { name: 'Domain' }))
    await user.click(within(filterBar).getByRole('button', { name: `${domainName} (${domainDocCount})` }))

    const table = screen.getByRole('table', { name: 'Document library' })
    expect(within(table).getAllByRole('row')).toHaveLength(composedCount + 1)
  })
})
