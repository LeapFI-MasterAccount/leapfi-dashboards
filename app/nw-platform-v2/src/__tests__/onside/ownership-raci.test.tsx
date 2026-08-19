/**
 * OnSide · Ownership — RACI matrix rows regression (D17: pins the PORTED
 * V1 BASE BEHAVIOR).
 *
 * Base anchors (leapfi-platform.html @ 1c230fe, via survey_map.md):
 *  - 3498–3573  osRaci — the RACI matrix view
 *  - 3499–3508  ROLES — the 8 named roles (columns)
 *  - 3510–3549  M — per-domain [docId, A, R, C[], I[]] rows (ported
 *               verbatim in data/onside.ts)
 *  - 1930–2303  DOCLIB — document titles the doc column resolves ids
 *               through
 *
 * The v2 port renders one table per M domain (grouped, per the screen
 * header's documented resolution of the base's single-table `dgroup`
 * divider rows — DataTable C6 has no spanning group row) and RACI cells
 * as the full words Responsible/Accountable/Consulted/Informed (dispatch
 * TASK line), with a muted "—" for empty cells.
 */
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { OnSideOwnership } from '../../screens/OnSideOwnership'
import { M, ROLES } from '../../data/onside'
import { makeTopbarProps } from './helpers'

function renderOwnership() {
  return render(<OnSideOwnership topbar={makeTopbarProps()} onNavigate={() => {}} />)
}

describe('OnSide ownership · RACI matrix (base 3498–3573 osRaci)', () => {
  it('renders one RACI table per base M domain, with one row per governance document (base 3510–3549)', () => {
    renderOwnership()
    expect(M).toHaveLength(8)
    for (const [, domainLabel, docs] of M) {
      const table = screen.getByRole('table', { name: `${domainLabel} RACI matrix` })
      expect(within(table).getAllByRole('row')).toHaveLength(docs.length + 1) // + header
    }
  })

  it('column headers are the document column plus the 8 base ROLES codes in order (base 3499–3508)', () => {
    renderOwnership()
    const table = screen.getByRole('table', { name: 'Model Risk Management RACI matrix' })
    const headers = within(table)
      .getAllByRole('columnheader')
      .map((th) => th.textContent)
    expect(ROLES.map(([code]) => code)).toEqual([
      'CRO',
      'CCO',
      'BSA',
      'MRM',
      'ISD',
      'BRO',
      'GC',
      'BOARD',
    ])
    expect(headers.slice(0, 9)).toEqual(['Governance document', ...ROLES.map(([code]) => code)])
  })

  it('mrm-policy row states the base A/R/C/I assignment as full words per role column (base 3520: [mrm-policy, CRO, MRM, [GC], [BOARD, CCO]])', () => {
    renderOwnership()
    const table = screen.getByRole('table', { name: 'Model Risk Management RACI matrix' })
    const row = within(table)
      .getAllByRole('row')
      .find((candidate) => within(candidate).queryByText('Model Risk Management Policy'))
    expect(row).toBeDefined()

    const cells = within(row as HTMLElement)
      .getAllByRole('cell')
      .map((cell) => cell.textContent)
    // Columns: doc, CRO, CCO, BSA, MRM, ISD, BRO, GC, BOARD, (row action)
    expect(cells[0]).toBe('Model Risk Management Policy')
    expect(cells[1]).toBe('Accountable') // CRO = A
    expect(cells[2]).toBe('Informed') // CCO ∈ I
    expect(cells[3]).toBe('—') // BSA — no assignment
    expect(cells[4]).toBe('Responsible') // MRM = R
    expect(cells[5]).toBe('—') // ISD — no assignment
    expect(cells[6]).toBe('—') // BRO — no assignment
    expect(cells[7]).toBe('Consulted') // GC ∈ C
    expect(cells[8]).toBe('Informed') // BOARD ∈ I
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
