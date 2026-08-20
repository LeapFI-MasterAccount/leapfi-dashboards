/**
 * OnSide · Ownership — RACI matrix regression (D17: pins the PORTED V1
 * BASE BEHAVIOR).
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
 *
 * FIX WAVE (RACI DENSITY REGRESSION) — this suite now pins v1's actual
 * shape (ONE table, in-table domain group rows, letter badges), not the
 * earlier per-domain-table/full-word port this file used to pin. See
 * OnSideOwnership.tsx's own header for the full defect writeup: the
 * per-domain-table shape broke the one property a RACI matrix exists
 * for — scanning a single role DOWN the page — because every table sized
 * its own columns independently.
 */
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { OnSideOwnership } from '../../screens/OnSideOwnership'
import { M, ROLES } from '../../data/onside'
import { rowgroupHeaderTextsFor } from '../a11y/tableRowgroupAccessibleName'

function renderOwnership() {
  return render(<OnSideOwnership />)
}

const TOTAL_DOCS = M.reduce((sum, [, , docs]) => sum + docs.length, 0)
const TOTAL_COLUMNS = 1 + ROLES.length + 1 // doc + 8 roles + trailing row-affordance column

describe('OnSide ownership · RACI matrix (base 3498–3573 osRaci)', () => {
  it('renders exactly ONE table for the whole matrix — not one table per domain', () => {
    renderOwnership()
    expect(screen.getAllByRole('table')).toHaveLength(1)
    const table = screen.getByRole('table', { name: 'RACI · policy ownership matrix' })
    expect(table).toBeInTheDocument()
  })

  it('carries one spanning group row per base M domain, in authored order, each spanning every column as a header cell scoped to its rows (base 3552 tr.dgroup; design_system_spec.md §2.4 G4)', () => {
    const { container } = renderOwnership()
    expect(M).toHaveLength(8)
    const groupRows = container.querySelectorAll('tr[data-lf-group-row="true"]')
    expect(groupRows).toHaveLength(M.length)
    groupRows.forEach((groupRow, index) => {
      const [, domainLabel] = M[index] as (typeof M)[number]
      expect(groupRow.textContent).toContain(domainLabel)
      // §2.4 G4 — the spanning cell is a header cell scoped to the rows
      // it introduces, never a data cell.
      const cell = groupRow.querySelector('th')
      expect(cell).not.toBeNull()
      expect(cell?.getAttribute('scope')).toBe('rowgroup')
      expect(cell?.getAttribute('colspan')).toBe(String(TOTAL_COLUMNS))
      expect(groupRow.querySelector('td')).toBeNull()
    })
  })

  it('has one data row per governance document, plus the header and 8 group rows, and a uniform column count throughout', () => {
    const { container } = renderOwnership()
    const table = screen.getByRole('table', { name: 'RACI · policy ownership matrix' })
    expect(within(table).getAllByRole('row')).toHaveLength(1 + M.length + TOTAL_DOCS)

    const headerCells = within(table).getAllByRole('columnheader')
    expect(headerCells).toHaveLength(TOTAL_COLUMNS)

    const dataRows = container.querySelectorAll('tbody tr:not([data-lf-group-row="true"])')
    expect(dataRows).toHaveLength(TOTAL_DOCS)
    dataRows.forEach((row) => {
      expect(row.querySelectorAll('td')).toHaveLength(TOTAL_COLUMNS)
    })
  })

  it('column headers are the document column plus the 8 base ROLES codes in order (base 3499–3508)', () => {
    renderOwnership()
    const table = screen.getByRole('table', { name: 'RACI · policy ownership matrix' })
    const headers = within(table)
      .getAllByRole('columnheader')
      .map((th) => th.textContent)
    expect(ROLES.map(([code]) => code)).toEqual(['CRO', 'CCO', 'BSA', 'MRM', 'ISD', 'BRO', 'GC', 'BOARD'])
    expect(headers.slice(0, 9)).toEqual(['Governance document', ...ROLES.map(([code]) => code)])
  })

  it('mrm-policy row states the base A/R/C/I assignment as R/A/C/I badges, each with an accessible full-word name (base 3520: [mrm-policy, CRO, MRM, [GC], [BOARD, CCO]])', () => {
    renderOwnership()
    const table = screen.getByRole('table', { name: 'RACI · policy ownership matrix' })
    const row = within(table)
      .getAllByRole('row')
      .find((candidate) => within(candidate).queryByText('Model Risk Management Policy'))
    expect(row).toBeDefined()
    const scope = within(row as HTMLElement)
    const cells = scope.getAllByRole('cell')

    // Columns: doc, CRO, CCO, BSA, MRM, ISD, BRO, GC, BOARD, (row-affordance)
    expect(cells[0]?.textContent).toBe('Model Risk Management Policy')

    // CRO = Accountable — visible letter "A", accessible name "Accountable"
    const cro = within(cells[1] as HTMLElement).getByRole('img', { name: 'Accountable' })
    expect(cro.textContent).toBe('A')

    // CCO ∈ Informed
    const cco = within(cells[2] as HTMLElement).getByRole('img', { name: 'Informed' })
    expect(cco.textContent).toBe('I')

    // BSA — no assignment: v1's quiet middot, not a heavy em-dash, and no badge role
    expect(within(cells[3] as HTMLElement).queryByRole('img')).toBeNull()
    expect(cells[3]?.textContent).toBe('·')
    expect(cells[3]?.textContent).not.toBe('—')

    // MRM = Responsible
    const mrm = within(cells[4] as HTMLElement).getByRole('img', { name: 'Responsible' })
    expect(mrm.textContent).toBe('R')

    // ISD, BRO — no assignment
    expect(cells[5]?.textContent).toBe('·')
    expect(cells[6]?.textContent).toBe('·')

    // GC ∈ Consulted
    const gc = within(cells[7] as HTMLElement).getByRole('img', { name: 'Consulted' })
    expect(gc.textContent).toBe('C')

    // BOARD ∈ Informed
    const board = within(cells[8] as HTMLElement).getByRole('img', { name: 'Informed' })
    expect(board.textContent).toBe('I')
  })

  it('Sprint 1 hostile-review S1 / amendment A10 (§2.4 G8): each domain group renders in its OWN <tbody>, never one shared by the whole matrix', () => {
    renderOwnership()
    const table = screen.getByRole('table', { name: 'RACI · policy ownership matrix' })
    const tbodies = table.querySelectorAll(':scope > tbody')
    // 8 domains -> 8 <tbody> elements (one per M domain), never 1 shared.
    expect(tbodies).toHaveLength(M.length)
    tbodies.forEach((tbody) => {
      expect(tbody.querySelectorAll('th[scope="rowgroup"]')).toHaveLength(1)
    })
  })

  it("Sprint 1 hostile-review S1 / amendment A10: a data row in the LAST (8th) domain's accessible name derives ONLY from that domain's own group header — not from all 7 prior domains stacking in", () => {
    const { container } = renderOwnership()
    const [, lastDomainLabel] = M[M.length - 1] as (typeof M)[number]

    const groupRows = container.querySelectorAll('tr[data-lf-group-row="true"]')
    const lastGroupRow = groupRows[groupRows.length - 1]
    expect(lastGroupRow?.textContent).toContain(lastDomainLabel)

    // G2/G3 (group order and membership invariant, authored order): the
    // table's LAST rendered data cell is guaranteed to belong to the last
    // (8th) domain's last document row.
    const table = screen.getByRole('table', { name: 'RACI · policy ownership matrix' })
    const allDataCells = within(table).getAllByRole('cell')
    const lastCell = allDataCells[allDataCells.length - 1]
    expect(lastCell).toBeDefined()

    const headers = rowgroupHeaderTextsFor(lastCell as Element)
    expect(headers).toEqual([lastDomainLabel])
    // The S1 bleed: every prior domain's header stacking into this cell's
    // accessible name. None of the other 7 domain labels may appear.
    const otherDomainLabels = M.slice(0, -1).map(([, label]) => label)
    otherDomainLabels.forEach((label) => {
      expect(headers).not.toContain(label)
    })
  })

  it('renders the R/A/C/I legend with each mark, its full-word name, and its meaning (base 3569 raci-legend)', () => {
    renderOwnership()
    expect(screen.getByText('Responsible · does the work')).toBeInTheDocument()
    expect(screen.getByText('Accountable · owns the outcome')).toBeInTheDocument()
    expect(screen.getByText('Consulted · input before decisions')).toBeInTheDocument()
    expect(screen.getByText('Informed · kept current')).toBeInTheDocument()
  })

  it('renders the 8-role legend with code, title, and named owner (base 3499–3508 ROLES)', () => {
    renderOwnership()
    expect(screen.getByText('CRO · Chief Risk Officer (R. Fischer)')).toBeInTheDocument()
    expect(screen.getByText('BOARD · Board Risk Committee (Board)')).toBeInTheDocument()
    for (const [code, title, name] of ROLES) {
      expect(screen.getByText(`${code} · ${title} (${name})`)).toBeInTheDocument()
    }
  })
})
