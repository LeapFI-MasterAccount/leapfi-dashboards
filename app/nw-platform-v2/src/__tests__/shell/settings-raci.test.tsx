/**
 * Settings · Toggles — relocated RACI matrix regression (PI-3, D6/call-08,
 * sprint-plan.md Sprint 2 L3: "Responsibility matrix moved to settings").
 * Ported verbatim from `onside/ownership-raci.test.tsx` (which pinned this
 * content against `OnSideOwnership.tsx` pre-L3) — same assertions, same
 * base anchors, now against `SettingsToggles.tsx`, the section's new host.
 *
 * Base anchors (leapfi-platform.html @ 1c230fe, via survey_map.md):
 *  - 3498–3573  osRaci — the RACI matrix view
 *  - 3499–3508  ROLES — the 8 named roles (columns)
 *  - 3510–3549  M — per-domain [docId, A, R, C[], I[]] rows (ported
 *               verbatim in data/onside.ts)
 *  - 3552       tr.dgroup — the domain-divider row, colspan across every
 *               column, deep-linking to that domain
 *  - 3558       raci-badge raci-R/A/C/I — the single-letter badges
 *  - 1930–2303  DOCLIB — document titles the doc column resolves ids
 *               through
 */
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SettingsToggles } from '../../screens/SettingsToggles'
import { M, ROLES } from '../../data/onside'
import { rowgroupHeaderTextsFor } from '../a11y/tableRowgroupAccessibleName'

function renderSettings() {
  return render(<SettingsToggles />)
}

const TOTAL_DOCS = M.reduce((sum, [, , docs]) => sum + docs.length, 0)
const TOTAL_COLUMNS = 1 + ROLES.length + 1 // doc + 8 roles + trailing row-affordance column

describe('Settings · Toggles — RACI matrix (base 3498–3573 osRaci)', () => {
  it('renders exactly ONE table for the whole matrix — not one table per domain', () => {
    renderSettings()
    const table = screen.getByRole('table', { name: 'RACI · policy ownership matrix' })
    expect(table).toBeInTheDocument()
  })

  it('carries one spanning group row per base M domain, in authored order, each spanning every column as a header cell scoped to its rows (base 3552 tr.dgroup; design_system_spec.md §2.4 G4)', () => {
    const { container } = renderSettings()
    expect(M).toHaveLength(8)
    const groupRows = container.querySelectorAll('tr[data-lf-group-row="true"]')
    expect(groupRows).toHaveLength(M.length)
    groupRows.forEach((groupRow, index) => {
      const [, domainLabel] = M[index] as (typeof M)[number]
      expect(groupRow.textContent).toContain(domainLabel)
      const cell = groupRow.querySelector('th')
      expect(cell).not.toBeNull()
      expect(cell?.getAttribute('scope')).toBe('rowgroup')
      expect(cell?.getAttribute('colspan')).toBe(String(TOTAL_COLUMNS))
      expect(groupRow.querySelector('td')).toBeNull()
    })
  })

  it('has one data row per governance document, plus the header and 8 group rows, and a uniform column count throughout', () => {
    renderSettings()
    const table = screen.getByRole('table', { name: 'RACI · policy ownership matrix' })
    expect(within(table).getAllByRole('row')).toHaveLength(1 + M.length + TOTAL_DOCS)

    const headerCells = within(table).getAllByRole('columnheader')
    expect(headerCells).toHaveLength(TOTAL_COLUMNS)

    // Scoped to the RACI table itself — SettingsToggles also renders the
    // relocated Sources & connectors section's own DataTables on the same
    // page (unlike pre-L3 OnSideOwnership, which had only this one table),
    // so a container-wide `tbody tr` query would over-count.
    const dataRows = table.querySelectorAll('tbody tr:not([data-lf-group-row="true"])')
    expect(dataRows).toHaveLength(TOTAL_DOCS)
    dataRows.forEach((row) => {
      expect(row.querySelectorAll('td')).toHaveLength(TOTAL_COLUMNS)
    })
  })

  it('column headers are the document column plus the 8 base ROLES codes in order (base 3499–3508)', () => {
    renderSettings()
    const table = screen.getByRole('table', { name: 'RACI · policy ownership matrix' })
    const headers = within(table).getAllByRole('columnheader').map((th) => th.textContent)
    expect(ROLES.map(([code]) => code)).toEqual(['CRO', 'CCO', 'BSA', 'MRM', 'ISD', 'BRO', 'GC', 'BOARD'])
    expect(headers.slice(0, 9)).toEqual(['Governance document', ...ROLES.map(([code]) => code)])
  })

  it('mrm-policy row states the base A/R/C/I assignment as R/A/C/I badges, each with an accessible full-word name (base 3520: [mrm-policy, CRO, MRM, [GC], [BOARD, CCO]])', () => {
    renderSettings()
    const table = screen.getByRole('table', { name: 'RACI · policy ownership matrix' })
    const row = within(table)
      .getAllByRole('row')
      .find((candidate) => within(candidate).queryByText('Model Risk Management Policy'))
    expect(row).toBeDefined()
    const scope = within(row as HTMLElement)
    const cells = scope.getAllByRole('cell')

    expect(cells[0]?.textContent).toBe('Model Risk Management Policy')

    const cro = within(cells[1] as HTMLElement).getByRole('img', { name: 'Accountable' })
    expect(cro.textContent).toBe('A')

    const cco = within(cells[2] as HTMLElement).getByRole('img', { name: 'Informed' })
    expect(cco.textContent).toBe('I')

    expect(within(cells[3] as HTMLElement).queryByRole('img')).toBeNull()
    expect(cells[3]?.textContent).toBe('·')
    expect(cells[3]?.textContent).not.toBe('—')

    const mrm = within(cells[4] as HTMLElement).getByRole('img', { name: 'Responsible' })
    expect(mrm.textContent).toBe('R')

    expect(cells[5]?.textContent).toBe('·')
    expect(cells[6]?.textContent).toBe('·')

    const gc = within(cells[7] as HTMLElement).getByRole('img', { name: 'Consulted' })
    expect(gc.textContent).toBe('C')

    const board = within(cells[8] as HTMLElement).getByRole('img', { name: 'Informed' })
    expect(board.textContent).toBe('I')
  })

  it('Sprint 1 hostile-review S1 / amendment A10 (§2.4 G8): each domain group renders in its OWN <tbody>, never one shared by the whole matrix', () => {
    renderSettings()
    const table = screen.getByRole('table', { name: 'RACI · policy ownership matrix' })
    const tbodies = table.querySelectorAll(':scope > tbody')
    expect(tbodies).toHaveLength(M.length)
    tbodies.forEach((tbody) => {
      expect(tbody.querySelectorAll('th[scope="rowgroup"]')).toHaveLength(1)
    })
  })

  it("Sprint 1 hostile-review S1 / amendment A10: a data row in the LAST (8th) domain's accessible name derives ONLY from that domain's own group header — not from all 7 prior domains stacking in", () => {
    const { container } = renderSettings()
    const [, lastDomainLabel] = M[M.length - 1] as (typeof M)[number]

    const groupRows = container.querySelectorAll('tr[data-lf-group-row="true"]')
    const lastGroupRow = groupRows[groupRows.length - 1]
    expect(lastGroupRow?.textContent).toContain(lastDomainLabel)

    const table = screen.getByRole('table', { name: 'RACI · policy ownership matrix' })
    const allDataCells = within(table).getAllByRole('cell')
    const lastCell = allDataCells[allDataCells.length - 1]
    expect(lastCell).toBeDefined()

    const headers = rowgroupHeaderTextsFor(lastCell as Element)
    expect(headers).toEqual([lastDomainLabel])
    const otherDomainLabels = M.slice(0, -1).map(([, label]) => label)
    otherDomainLabels.forEach((label) => {
      expect(headers).not.toContain(label)
    })
  })

  it('renders the R/A/C/I legend with each mark, its full-word name, and its meaning (base 3569 raci-legend)', () => {
    renderSettings()
    expect(screen.getByText('Responsible · does the work')).toBeInTheDocument()
    expect(screen.getByText('Accountable · owns the outcome')).toBeInTheDocument()
    expect(screen.getByText('Consulted · input before decisions')).toBeInTheDocument()
    expect(screen.getByText('Informed · kept current')).toBeInTheDocument()
  })

  it('renders the 8-role legend with code, title, and named owner (base 3499–3508 ROLES)', () => {
    renderSettings()
    expect(screen.getByText('CRO · Chief Risk Officer (R. Fischer)')).toBeInTheDocument()
    expect(screen.getByText('BOARD · Board Risk Committee (Board)')).toBeInTheDocument()
    for (const [code, title, name] of ROLES) {
      expect(screen.getByText(`${code} · ${title} (${name})`)).toBeInTheDocument()
    }
  })

  it('renders the Model Risk group in authored M order — policy first, not alphabetical (ONSIDE-10-equivalent, base osRaci 3552-3562)', () => {
    const { container } = renderSettings()
    const mrmGroupRow = Array.from(container.querySelectorAll('tr[data-lf-group-row="true"]')).find((row) =>
      row.textContent?.includes('Model Risk Management'),
    )
    expect(mrmGroupRow).toBeDefined()
    expect(mrmGroupRow?.nextElementSibling).toHaveTextContent('Model Risk Management Policy')
  })

  it('whole-row click opens the document detail in this screen\'s own local Drawer (never a second instance)', async () => {
    renderSettings()
    const table = screen.getByRole('table', { name: 'RACI · policy ownership matrix' })
    const row = within(table)
      .getAllByRole('row')
      .find((candidate) => within(candidate).queryByText('Model Risk Management Policy'))
    expect(row).toBeDefined()
    const user = userEvent.setup()
    await user.click(row as HTMLElement)
    const dialog = await screen.findByRole('dialog', { name: 'Model Risk Management Policy' })
    expect(screen.getAllByRole('dialog')).toHaveLength(1)
    expect(dialog).toBeInTheDocument()
  })
})
