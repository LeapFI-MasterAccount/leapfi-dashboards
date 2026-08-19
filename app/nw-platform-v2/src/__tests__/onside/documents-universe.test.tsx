/**
 * OnSide · Documents — document-universe counts regression (D17: pins the
 * PORTED V1 BASE BEHAVIOR).
 *
 * Base anchors (leapfi-platform.html @ 1c230fe, via survey_map.md):
 *  - 1930–2303  DOCLIB — the full document universe (ported verbatim in
 *               data/doclib.ts; §5.3 "~130 entries")
 *  - §d-8       the 8 load-bearing redline entries (pending-redline count)
 *  - §5.3       Documents region map: FilterBar (domain / status /
 *               redline filters, count-labeled options) over the library
 *               DataTable
 *
 * Every expected count below is derived from the verbatim-ported DOCLIB
 * data itself, so these tests pin "the rendered universe counts match the
 * base document universe" — not any in-component tally.
 */
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OnSideDocuments } from '../../screens/OnSideDocuments'
import { DOCLIB } from '../../data/doclib'
import type { DocStatus } from '../../data/doclib'
import { DOMAINS } from '../../data/onside'
import { makeTopbarProps } from './helpers'

const ALL_DOCS = Object.values(DOCLIB)
const STATUS_LABEL: Record<DocStatus, string> = {
  good: 'Current',
  warn: 'Needs attention',
  crit: 'Critical',
}
const REDLINE_COUNT = ALL_DOCS.filter((doc) => doc.redline).length

function renderDocuments() {
  return render(<OnSideDocuments topbar={makeTopbarProps()} onNavigate={() => {}} />)
}

function getFilterBar(container: HTMLElement): HTMLElement {
  const bar = container.querySelector('[data-lf-composite="filter-bar"]')
  expect(bar).not.toBeNull()
  return bar as HTMLElement
}

describe('OnSide documents · universe counts (base 1930–2303 DOCLIB, §5.3, §d-8)', () => {
  it('renders the full base document universe as library rows (base 1930–2303)', () => {
    renderDocuments()
    const table = screen.getByRole('table', { name: 'Document library' })
    expect(within(table).getAllByRole('row')).toHaveLength(ALL_DOCS.length + 1) // + header
  })

  it('domain filter options carry the per-domain universe counts and sum to the whole library (base 1930–2303 dom fields)', async () => {
    const user = userEvent.setup()
    const { container } = renderDocuments()
    const filterBar = getFilterBar(container)

    // Scoped to the FilterBar — the library table's own sortable "Domain"
    // column header is also a button named "Domain".
    await user.click(within(filterBar).getByRole('button', { name: 'Domain' }))

    let sum = 0
    for (const domain of DOMAINS) {
      const count = ALL_DOCS.filter((doc) => doc.dom === domain.key).length
      sum += count
      expect(
        within(filterBar).getByRole('button', { name: `${domain.name} (${count})` }),
      ).toBeInTheDocument()
    }
    expect(sum).toBe(ALL_DOCS.length)
  })

  it('status filter options carry the base status split of the universe (base 1930–2303 status fields)', async () => {
    const user = userEvent.setup()
    const { container } = renderDocuments()
    const filterBar = getFilterBar(container)

    await user.click(within(filterBar).getByRole('button', { name: 'Status' }))

    for (const status of ['good', 'warn', 'crit'] as DocStatus[]) {
      const count = ALL_DOCS.filter((doc) => doc.status === status).length
      expect(
        within(filterBar).getByRole('button', {
          name: `${STATUS_LABEL[status]} (${count})`,
        }),
      ).toBeInTheDocument()
    }
  })

  it('redline filter reports the 8 load-bearing pending redlines and zero adopted on a fresh load (§d-8; base 1930–2303 redline entries)', async () => {
    const user = userEvent.setup()
    const { container } = renderDocuments()
    const filterBar = getFilterBar(container)

    // survey_map.md §d-8: exactly 8 load-bearing redline entries.
    expect(REDLINE_COUNT).toBe(8)

    await user.click(within(filterBar).getByRole('button', { name: 'Redlines' }))
    expect(
      within(filterBar).getByRole('button', { name: `Pending (${REDLINE_COUNT})` }),
    ).toBeInTheDocument()
    expect(within(filterBar).getByRole('button', { name: 'Adopted (0)' })).toBeInTheDocument()
  })
})
