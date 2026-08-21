/**
 * OnSide fix-wave regression suite — pins the confirmed-finding fixes of
 * the "onside" batch against the PORTED V1 BASE BEHAVIOR
 * (leapfi-platform.html @ 1c230fe).
 *
 * Findings covered (see each test's own anchor):
 *  - ONSIDE-01  signal drawer decodes the Regional layer label (base
 *               srcRow reconciliation / innerHTML decode, 3335-3340)
 *  - ONSIDE-02  Adopt cascade routed through state/demoStore.applyGapClosure
 *               (base 3204-3211 "every view moves together") — Documents,
 *               Overview, and the Domains accordion agree after an adopt
 *  - ONSIDE-05  lcBar "Area" scope filter scopes both lifecycle tables
 *               (base 3452-3477)
 *  - ONSIDE-06  deep-domain accordion body is gaps & partials + met pill
 *               (base domBody 3684-3687)
 *  - ONSIDE-07  Date column announces the direction actually on screen
 *  - ONSIDE-08  instrument deep-links open the INSTR detail (base
 *               instrLink/openInstr 2306, 2932-2949, 3391, 3477, 3494)
 *  - ONSIDE-11  adopting gen-ai-draft flips NOTHING (base applyGapClosure
 *               keys strictly on GAPS; the port's extra doc.obl branch is
 *               removed)
 *  - ONSIDE-12  status filter chip counts match the live filter yield
 *  - ONSIDE-13  focus falls back to the page heading when the Adopt
 *               removed the triggering row (Pending filter active)
 *
 * L3 UPDATE (PI-3, D6/call-07/call-08) — ONSIDE-04 (alert-toggle focus),
 * ONSIDE-09 (digest/alert toasts), and ONSIDE-10 (RACI authored order) all
 * pinned behavior on `RegulatoryFeedSources`/the RACI matrix, both
 * relocated to `SettingsToggles.tsx`; their coverage moved to
 * `src/__tests__/shell/settings-sources.test.tsx` and
 * `src/__tests__/shell/settings-raci.test.tsx` respectively.
 *
 * Module singletons (DOCLIB/OBL/DOMAINS/GAPS) are mutated by adopt tests;
 * afterEach runs the store's resetDemo() (DEMO_SEED snapshot is taken at
 * this file's import, before any test mutates).
 */
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OnSideFeed } from '../../screens/OnSideFeed'
import type { OnSideFeedProps } from '../../screens/OnSideFeed'
import { OnSideDocuments } from '../../screens/OnSideDocuments'
import { OnSideOverview } from '../../screens/OnSideOverview'
import { resetDemo } from '../../state/demoStore'
import { DOCLIB } from '../../data/doclib'
import type { DocStatus } from '../../data/doclib'
import { DOMAINS, OBL } from '../../data/onside'

beforeAll(() => {
  // jsdom has no scrollIntoView; the accordion/impact views call it.
  Element.prototype.scrollIntoView = vi.fn()
})

afterEach(() => {
  cleanup()
  resetDemo()
})

function renderFeed(extra: Partial<OnSideFeedProps> = {}) {
  return render(<OnSideFeed {...extra} />)
}

function renderDocuments() {
  return render(<OnSideDocuments />)
}

function renderOverview() {
  return render(<OnSideOverview onNavigate={() => {}} />)
}

function getSignalsTable() {
  return screen.getByRole('table', { name: 'Regulatory signals feed' })
}

/** Adopts a redlined doc through the real UI (row Review → Adopt → toast). */
async function adoptDoc(user: ReturnType<typeof userEvent.setup>, title: string) {
  const table = screen.getByRole('table', { name: 'Document library' })
  const row = within(table)
    .getAllByRole('row')
    .find((r) => r.textContent?.includes(title))
  expect(row).toBeDefined()
  await user.click(within(row as HTMLElement).getByRole('button', { name: 'Review' }))
  const dialog = await screen.findByRole('dialog', { name: title })
  await user.click(within(dialog).getByRole('button', { name: 'Adopt' }))
  await waitFor(() => expect(screen.getByText(`${title} adopted.`)).toBeInTheDocument(), {
    timeout: 3000,
  })
}

describe('ONSIDE-01 · signal drawer Regional layer label (base 3335-3340)', () => {
  it('renders the decoded layer label, never the raw &amp; entity', async () => {
    const user = userEvent.setup()
    renderFeed()
    const rows = within(getSignalsTable()).getAllByRole('row')
    const regionalRow = rows.find((row) => row.textContent?.includes('White House Executive Orders'))
    expect(regionalRow).toBeDefined()
    await user.click(within(regionalRow as HTMLElement).getByRole('button', { name: 'Review' }))
    const dialog = await screen.findByRole('dialog', { name: /^Signal — White House Executive Orders/ })
    expect(within(dialog).getByText('Regional · national, state & local')).toBeInTheDocument()
    expect(dialog.textContent).not.toContain('&amp;')
  })
})

describe('ONSIDE-07 · Date column sort announcement', () => {
  it('announces descending (the visible newest-first calendar order) by default', () => {
    renderFeed()
    const table = getSignalsTable()
    const dateHeader = within(table)
      .getAllByRole('columnheader')
      .find((th) => th.textContent?.includes('Date'))
    expect(dateHeader).toBeDefined()
    expect(dateHeader).toHaveAttribute('aria-sort', 'descending')
    // The visible order is unchanged: newest signal first (base 3433).
    const firstBodyRow = within(table).getAllByRole('row')[1]
    expect(firstBodyRow).toHaveTextContent('NCUA · 12 CFR Ch. VII')
    expect(firstBodyRow).toHaveTextContent('Aug 14, 2026')
  })
})

describe('ONSIDE-05 · lifecycle "Area" scope filter (base 3452-3477 lcBar/lcMatch)', () => {
  it('scopes both tables to one officer area and reaches the base empty-state copy', async () => {
    const user = userEvent.setup()
    renderFeed()
    const areaGroup = screen.getByRole('group', { name: 'Area' })
    expect(within(areaGroup).queryByText('Filtered to what each officer oversees')).not.toBeInTheDocument()

    // Fair Lending: exactly one NEW_RULES proposal touches it (§1071).
    await user.click(within(areaGroup).getByRole('button', { name: 'Fair Lending' }))
    const newTable = screen.getByRole('table', { name: 'Newly proposed rulemakings' })
    expect(within(newTable).getAllByRole('row')).toHaveLength(2) // header + 1
    expect(newTable).toHaveTextContent('§1071')

    // BSA / AML: no NEW_RULES proposal → the base 'in this area' empty
    // state renders (unreachable before this filter existed).
    await user.click(within(areaGroup).getByRole('button', { name: 'BSA / AML' }))
    expect(within(screen.getByRole('table', { name: 'Newly proposed rulemakings' })).getByText('No new proposals in this area.')).toBeInTheDocument()
    const trackedTable = screen.getByRole('table', { name: 'Pending and tracked rulemakings' })
    expect(trackedTable).toHaveTextContent('CTA / BOI reporting')

    // Back to all areas restores the full 3 + 8 base rows.
    await user.click(within(areaGroup).getByRole('button', { name: 'All areas' }))
    expect(within(screen.getByRole('table', { name: 'Newly proposed rulemakings' })).getAllByRole('row')).toHaveLength(4)
    expect(within(screen.getByRole('table', { name: 'Pending and tracked rulemakings' })).getAllByRole('row')).toHaveLength(9)
  })
})

describe('ONSIDE-08 · instrument deep-links (base instrLink/openInstr)', () => {
  it('an in-force row opens the INSTR detail in the shared Drawer', async () => {
    const user = userEvent.setup()
    renderFeed()
    const inforceTable = screen.getByRole('table', { name: 'Enacted and in-force instruments' })
    await user.click(
      within(inforceTable).getByRole('button', { name: 'Interagency Guidance 2026-13 · Model Risk Management' }),
    )
    const dialog = await screen.findByRole('dialog', {
      name: 'Interagency Guidance 2026-13 · Model Risk Management',
    })
    expect(within(dialog).getByText('OCC · Federal Reserve · FDIC')).toBeInTheDocument()
    expect(within(dialog).getByText('Effective Apr 17, 2026')).toBeInTheDocument()
    expect(
      within(dialog).getByText('Nothing read from this instrument becomes authoritative before a qualified human approves it'),
    ).toBeInTheDocument()
    // B-dead-interactions-07 — "Domains this instrument drives" is no
    // longer a flattened joined-string field (moved to a real deep-link
    // action Button, see the dedicated test below); with no `onDeepLink`
    // wired, no action buttons render at all rather than a dead click.
    expect(within(dialog).queryByText('Domains this instrument drives')).not.toBeInTheDocument()
  })

  it('B-dead-interactions-07 — a domain the instrument drives is a real deep-link action, not flattened text', async () => {
    const user = userEvent.setup()
    const onDeepLink = vi.fn()
    renderFeed({ onDeepLink })
    const inforceTable = screen.getByRole('table', { name: 'Enacted and in-force instruments' })
    await user.click(
      within(inforceTable).getByRole('button', { name: 'Interagency Guidance 2026-13 · Model Risk Management' }),
    )
    const dialog = await screen.findByRole('dialog', {
      name: 'Interagency Guidance 2026-13 · Model Risk Management',
    })
    // INSTR['2026-13'].doms === ['mrm'] — exactly one domain action Button.
    await user.click(within(dialog).getByRole('button', { name: 'Model Risk Management →' }))
    expect(onDeepLink).toHaveBeenCalledWith({ screen: 'onside.overview', kind: 'domain', id: 'mrm' })
  })

  it('a tracked lifecycle row with an instrument key opens its INSTR detail', async () => {
    const user = userEvent.setup()
    renderFeed()
    const trackedTable = screen.getByRole('table', { name: 'Pending and tracked rulemakings' })
    await user.click(
      within(trackedTable).getByRole('button', { name: 'Reg B Guidance 2026-C1 · adverse-action specificity' }),
    )
    expect(await screen.findByRole('dialog')).toHaveTextContent('2026-C1')
  })
})

describe('ONSIDE-06 · deep-domain accordion body (base domBody 3684-3687)', () => {
  it('shows gaps & partials only, with the met summary pill', async () => {
    const user = userEvent.setup()
    const { container } = renderOverview()
    const mrmCard = container.querySelector('#dom-acc-mrm') as HTMLElement
    expect(mrmCard).not.toBeNull()
    await user.click(within(mrmCard).getAllByRole('button')[0] as HTMLElement)

    const mrmRows = OBL['mrm'] ?? []
    const openCount = mrmRows.filter((o) => o.st !== 'met').length
    const metCount = mrmRows.filter((o) => o.st === 'met').length
    const mrmDomain = DOMAINS.find((d) => d.key === 'mrm')

    expect(
      within(mrmCard).getByText(`Gaps & partials · ${openCount} of ${mrmRows.length} shown obligations`),
    ).toBeInTheDocument()
    const gapsTable = within(mrmCard).getByRole('table', { name: 'Model Risk Management gaps and partials' })
    expect(within(gapsTable).getAllByRole('row')).toHaveLength(openCount + 1) // + header
    expect(gapsTable).not.toHaveTextContent('Met')
    expect(
      within(mrmCard).getByText(
        `${metCount} met obligations and the full register with provenance: all ${mrmDomain?.appl} enumerated`,
      ),
    ).toBeInTheDocument()
  })
})

describe('ONSIDE-02 · Adopt cascade through the shared store (base 3204-3211)', () => {
  it('adopting the MRM change draft flips MRM-09 everywhere — Documents, data, Overview', async () => {
    const user = userEvent.setup()
    const mrmDomain = DOMAINS.find((d) => d.key === 'mrm')
    const metBefore = mrmDomain?.met ?? 0

    const documents = renderDocuments()
    await adoptDoc(user, 'Model Change Approval Workflow')

    // Data layer (the store's applyGapClosure): obligation + domain moved.
    const mrm09 = (OBL['mrm'] ?? []).find((o) => o.id === 'MRM-09')
    expect(mrm09?.st).toBe('met')
    expect(mrm09?.rev).toBe('ok')
    expect(mrmDomain?.met).toBe(metBefore + 1)
    // Base rlAction cosmetics on the live DOCLIB entry.
    expect(DOCLIB['mrm-change-draft']?.status).toBe('good')
    expect(DOCLIB['mrm-change-draft']?.v).toBe('Draft 0.8') // no vN.N pattern → version untouched

    // This screen's own register shows the flip (no overrides layer).
    const mrmRegister = screen.getByRole('table', { name: 'Model Risk Management obligation register' })
    const mrm09Row = within(mrmRegister)
      .getAllByRole('row')
      .find((r) => r.textContent?.includes('MRM-09'))
    expect(mrm09Row).toHaveTextContent('Met')

    // Cross-screen: Overview's accordion no longer lists MRM-09 as open.
    documents.unmount()
    const { container } = renderOverview()
    const mrmCard = container.querySelector('#dom-acc-mrm') as HTMLElement
    await user.click(within(mrmCard).getAllByRole('button')[0] as HTMLElement)
    const gapsTable = within(mrmCard).getByRole('table', { name: 'Model Risk Management gaps and partials' })
    expect(gapsTable).not.toHaveTextContent('MRM-09')
  })

  it('ONSIDE-12: status filter chip counts match the live yield after an adopt', async () => {
    const user = userEvent.setup()
    const { container } = renderDocuments()
    await adoptDoc(user, 'Model Change Approval Workflow')

    const liveDocs = Object.values(DOCLIB)
    const warnCount = liveDocs.filter((d) => d.status === ('warn' as DocStatus)).length
    const filterBar = container.querySelector('[data-lf-composite="filter-bar"]') as HTMLElement
    await user.click(within(filterBar).getByRole('button', { name: 'Status' }))
    const warnChip = within(filterBar).getByRole('button', { name: `Needs attention (${warnCount})` })
    await user.click(warnChip)

    const table = screen.getByRole('table', { name: 'Document library' })
    expect(within(table).getAllByRole('row')).toHaveLength(warnCount + 1) // + header — count and yield agree
  })

  it('ONSIDE-11: adopting gen-ai-draft flips nothing (no doc.obl cascade branch)', async () => {
    const user = userEvent.setup()
    renderDocuments()
    const mrm11Before = (OBL['mrm'] ?? []).find((o) => o.id === 'MRM-11')?.st
    expect(mrm11Before).not.toBe('met')

    const table = screen.getByRole('table', { name: 'Document library' })
    const row = within(table)
      .getAllByRole('row')
      // The doc's real title — base DOCLIB 'gen-ai-draft' (leapfi-platform.html
      // 2229, ported verbatim at data/doclib.ts:391); the finding's prose
      // paraphrased it as 'Generative & Agentic AI · Draft Scope Language'.
      .find((r) => r.textContent?.includes('Generative Model Governance · Pre-staged Language'))
    expect(row).toBeDefined()
    await user.click(within(row as HTMLElement).getByRole('button', { name: 'Review' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Adopt' }))
    await waitFor(() => expect(screen.getByText(/adopted\./)).toBeInTheDocument(), { timeout: 3000 })

    // Base behavior: no GAPS entry references gen-ai-draft, so MRM-11 stays.
    expect((OBL['mrm'] ?? []).find((o) => o.id === 'MRM-11')?.st).toBe(mrm11Before)
    // No cascade → the toast carries no "View impact →" link.
    expect(screen.queryByRole('button', { name: 'View impact →' })).not.toBeInTheDocument()
  })

  it('ONSIDE-13: focus falls back to the page heading when the Pending filter removed the trigger row', async () => {
    const user = userEvent.setup()
    const { container } = renderDocuments()
    const filterBar = container.querySelector('[data-lf-composite="filter-bar"]') as HTMLElement
    await user.click(within(filterBar).getByRole('button', { name: 'Redlines' }))
    await user.click(within(filterBar).getByRole('button', { name: /^Pending \(/ }))

    await adoptDoc(user, 'Model Change Approval Workflow')

    const heading = screen.getByRole('heading', { name: 'OnSide · Documents' })
    await waitFor(() => expect(document.activeElement).toBe(heading), { timeout: 2000 })
  })
})
