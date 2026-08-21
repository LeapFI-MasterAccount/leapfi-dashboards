/**
 * "onside" batch regression suite — pins the fixes for this dispatch's
 * assigned hostile-review findings against the PORTED V1 BASE BEHAVIOR
 * (leapfi-platform.html @ 1c230fe). See slop_fix_handoff.json for each
 * finding's full claim/evidence.
 *
 * Findings covered:
 *  - B-dead-interactions-01  gap board + obligation-register rows open the
 *    obligation/doc detail drawer (base gap-board rows: onclick
 *    openObl/openDocView, 3226; obligation rows: onclick openObl, 3106)
 *  - B-dead-interactions-02  the obligation-detail drawer itself (base
 *    openObl, 2949-2997) — evidence-on-file + "Approve & adopt" — reachable
 *    from OnSideDocuments' own tables AND from the Domains accordion
 *    (OnSideOverview.tsx)
 *  - B-dead-interactions-09  OnSideOverview's "Open Connect →" targets
 *    'connect', not 'connect.allrailz' (base 3080 onclick go('connect'))
 *  - B-dead-interactions-14  OnSideOverview KPI tiles are clickable nav
 *    cards (base kpi() helper, 4194)
 *  - B-dead-interactions-16  RegulatoryFeedLifecycle's "Newly proposed"
 *    rows hop into Sources & connectors (base every NEW_RULES row: onclick
 *    onsideShow('feed-sources'), 3466). L3 UPDATE (PI-3, D6/call-07):
 *    Sources & connectors relocated to `SettingsToggles.tsx` — this row
 *    action now closes any open Drawer content, then fires a real
 *    cross-screen `onDeepLink` at Settings (OnSideFeed.tsx's own header),
 *    covered below against that new contract instead of the old
 *    same-screen scroll/focus.
 *  - A-overlap-06  OnSideFeed's signal DataTable gets the same
 *    overflow-x:auto wrapper every sibling table uses (base
 *    .raci-wrap{overflow-x:auto}, 146)
 */
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OnSideDocuments } from '../../screens/OnSideDocuments'
import { OnSideOverview } from '../../screens/OnSideOverview'
import { OnSideFeed } from '../../screens/OnSideFeed'
import { resetDemo } from '../../state/demoStore'
import { OBL } from '../../data/onside'

beforeAll(() => {
  // jsdom has no scrollIntoView; this suite's nav-card/accordion/section
  // scroll targets call it.
  Element.prototype.scrollIntoView = vi.fn()
})

afterEach(() => {
  cleanup()
  resetDemo()
})

function renderDocuments() {
  return render(<OnSideDocuments />)
}

function renderOverview(onNavigate: (id: string) => void = () => {}) {
  return render(<OnSideOverview onNavigate={onNavigate} />)
}

function renderFeed() {
  return render(<OnSideFeed />)
}

describe('B-dead-interactions-01/-02 · OnSideDocuments gap board + obligation registers open the obligation drawer', () => {
  it('a gap row naming an obligation (MRM-09) opens the obligation drawer, not the doc drawer', async () => {
    const user = userEvent.setup()
    renderDocuments()
    const gapsTable = screen.getByRole('table', { name: 'Open governance gaps board' })
    const row = within(gapsTable)
      .getAllByRole('row')
      .find((r) => r.textContent?.includes('MRM-09'))
    expect(row).toBeDefined()
    await user.click(within(row as HTMLElement).getByRole('button', { name: 'Open' }))
    expect(await screen.findByRole('dialog', { name: 'MRM-09 · Obligation' })).toBeInTheDocument()
  })

  it('a gap row naming only a document (Incident Response Plan, no obl) opens the doc drawer', async () => {
    const user = userEvent.setup()
    renderDocuments()
    const gapsTable = screen.getByRole('table', { name: 'Open governance gaps board' })
    const row = within(gapsTable)
      .getAllByRole('row')
      .find((r) => r.textContent?.includes('Incident Response Plan'))
    expect(row).toBeDefined()
    await user.click(within(row as HTMLElement).getByRole('button', { name: 'Open' }))
    expect(await screen.findByRole('dialog', { name: 'Incident Response Plan' })).toBeInTheDocument()
  })

  it('a domain-impact obligation register row opens the obligation drawer with its requirement/citation/status', async () => {
    const user = userEvent.setup()
    renderDocuments()
    const register = screen.getByRole('table', { name: 'Model Risk Management obligation register' })
    const row = within(register)
      .getAllByRole('row')
      .find((r) => r.textContent?.includes('MRM-08'))
    expect(row).toBeDefined()
    await user.click(within(row as HTMLElement).getByRole('button', { name: 'Open' }))
    const dialog = await screen.findByRole('dialog', { name: 'MRM-08 · Obligation' })
    const mrm08 = OBL.mrm?.find((o) => o.id === 'MRM-08')
    expect(mrm08).toBeDefined()
    expect(within(dialog).getByText(mrm08!.s)).toBeInTheDocument()
    expect(within(dialog).getByText(mrm08!.cite)).toBeInTheDocument()
    expect(within(dialog).getByText(mrm08!.gp as string)).toBeInTheDocument()
    // MRM-08 has no redline draft behind it (gap.rl/.doc are both unset) —
    // "Approve & adopt" must not render as a live-looking control with
    // nothing behind it (Core Principle 1).
    expect(within(dialog).queryByRole('button', { name: 'Approve & adopt' })).not.toBeInTheDocument()
  })

  it('MRM-09 offers a real "Approve & adopt" action (redline draft exists) that closes the obligation on press', async () => {
    const user = userEvent.setup()
    renderDocuments()
    const register = screen.getByRole('table', { name: 'Model Risk Management obligation register' })
    const row = within(register)
      .getAllByRole('row')
      .find((r) => r.textContent?.includes('MRM-09'))
    await user.click(within(row as HTMLElement).getByRole('button', { name: 'Open' }))
    const dialog = await screen.findByRole('dialog', { name: 'MRM-09 · Obligation' })
    const approveButton = within(dialog).getByRole('button', { name: 'Approve & adopt' })
    await user.click(approveButton)
    await waitFor(() => {
      expect(OBL.mrm?.find((o) => o.id === 'MRM-09')?.st).toBe('met')
    })
    // Server-confirmed, not optimistic (Core Principle 1): the button only
    // disappears once the live obligation is actually met.
    await waitFor(() => expect(within(dialog).queryByRole('button', { name: 'Approve & adopt' })).not.toBeInTheDocument())
  })

  it('evidence chips on a doc drawer open the evidencing document (B-dead-interactions-01 doc-table row action)', async () => {
    const user = userEvent.setup()
    renderDocuments()
    const register = screen.getByRole('table', { name: 'Model Risk Management obligation register' })
    const row = within(register)
      .getAllByRole('row')
      .find((r) => r.textContent?.includes('MRM-08'))
    await user.click(within(row as HTMLElement).getByRole('button', { name: 'Open' }))
    const dialog = await screen.findByRole('dialog', { name: 'MRM-08 · Obligation' })
    const evidenceButton = within(dialog).getByRole('button', { name: /^Evidence: MRM Committee Minutes/ })
    await user.click(evidenceButton)
    expect(await screen.findByRole('dialog', { name: 'MRM Committee Minutes' })).toBeInTheDocument()
  })
})

describe('B-dead-interactions-07 · OnSideDocuments doc drawer "Obligations evidenced" is un-flattened', () => {
  it('a document evidencing an obligation offers a real action Button to that obligation\'s drawer', async () => {
    const user = userEvent.setup()
    renderDocuments()
    const library = screen.getByRole('table', { name: 'Document library' })
    const row = within(library)
      .getAllByRole('row')
      .find((r) => r.textContent?.includes('Model Change Approval Workflow'))
    expect(row).toBeDefined()
    await user.click(within(row as HTMLElement).getByRole('button', { name: 'Review' }))
    const docDialog = await screen.findByRole('dialog', { name: 'Model Change Approval Workflow' })
    // No flattened joined-string field left behind.
    expect(within(docDialog).queryByText('Obligations evidenced')).not.toBeInTheDocument()
    await user.click(within(docDialog).getByRole('button', { name: 'Obligation MRM-09 →' }))
    expect(await screen.findByRole('dialog', { name: 'MRM-09 · Obligation' })).toBeInTheDocument()
  })
})

describe('B-dead-interactions-02 · Domains accordion (OnSideOverview) also reaches the obligation drawer', () => {
  it('a "Gaps & partials" row in an expanded domain opens the obligation drawer', async () => {
    const user = userEvent.setup()
    renderOverview()
    await user.click(screen.getByRole('button', { name: 'Model Risk Management' }))
    const gapsTable = await screen.findByRole('table', { name: 'Model Risk Management gaps and partials' })
    const row = within(gapsTable)
      .getAllByRole('row')
      .find((r) => r.textContent?.includes('MRM-09'))
    expect(row).toBeDefined()
    await user.click(within(row as HTMLElement).getByRole('button', { name: 'Open' }))
    const dialog = await screen.findByRole('dialog', { name: 'MRM-09 · Obligation' })
    await user.click(within(dialog).getByRole('button', { name: 'Approve & adopt' }))
    await waitFor(() => expect(OBL.mrm?.find((o) => o.id === 'MRM-09')?.st).toBe('met'))
  })
})

describe('B-dead-interactions-09 · "Open Connect →" targets the Connect module splash', () => {
  it('navigates to \'connect\', not \'connect.allrailz\'', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    renderOverview(onNavigate)
    await user.click(screen.getByRole('button', { name: 'Open Connect →' }))
    expect(onNavigate).toHaveBeenCalledWith('connect')
    expect(onNavigate).not.toHaveBeenCalledWith('connect.allrailz')
  })
})

describe('B-dead-interactions-14 · OnSideOverview KPI tiles are clickable nav cards', () => {
  it('"Documents monitored" navigates to OnSide · Documents', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    renderOverview(onNavigate)
    await user.click(screen.getByRole('button', { name: /^Documents monitored/ }))
    expect(onNavigate).toHaveBeenCalledWith('onside.documents')
  })

  it('"Gaps to your targets" navigates to OnSide · Documents (its gap board)', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    renderOverview(onNavigate)
    await user.click(screen.getByRole('button', { name: /^Gaps to your targets/ }))
    expect(onNavigate).toHaveBeenCalledWith('onside.documents')
  })

  it('"Change events · 14 days" navigates to the Regulatory feed', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    renderOverview(onNavigate)
    await user.click(screen.getByRole('button', { name: /^Change events/ }))
    expect(onNavigate).toHaveBeenCalledWith('onside.feed')
  })

  it('"Domains at / above target" scrolls the in-page Domains accordion into view (no separate screen exists)', async () => {
    const user = userEvent.setup()
    const scrollSpy = vi.spyOn(Element.prototype, 'scrollIntoView')
    renderOverview()
    await user.click(screen.getByRole('button', { name: /^Domains at \/ above target/ }))
    expect(scrollSpy).toHaveBeenCalled()
  })
})

describe('B-dead-interactions-16 · RegulatoryFeedLifecycle "Newly proposed" rows hop into Sources & connectors (L3: now in Settings)', () => {
  it('pressing a newly-proposed row fires a real cross-screen deep link at Settings (Sources & connectors\' new home)', async () => {
    const user = userEvent.setup()
    const onDeepLink = vi.fn()
    render(<OnSideFeed onDeepLink={onDeepLink} />)
    const newRulesTable = screen.getByRole('table', { name: 'Newly proposed rulemakings' })
    const row = within(newRulesTable).getAllByRole('row')[1] as HTMLElement
    await user.click(within(row).getByRole('button', { name: 'View source' }))
    expect(onDeepLink).toHaveBeenCalledWith({ screen: 'settings.toggles', kind: 'feed-source', id: 'sources' })
  })

  it('with no onDeepLink wired, pressing a newly-proposed row is a harmless no-op — never a crash', async () => {
    const user = userEvent.setup()
    renderFeed()
    const newRulesTable = screen.getByRole('table', { name: 'Newly proposed rulemakings' })
    const row = within(newRulesTable).getAllByRole('row')[1] as HTMLElement
    await user.click(within(row).getByRole('button', { name: 'View source' }))
    // No assertion beyond "did not throw" — this is the file-header-flagged
    // STOP-item (App.tsx doesn't yet spread deepLinkProps onto Settings).
  })
})

describe('A-overlap-06 · OnSideFeed signal table gets the standard overflow-x wrapper', () => {
  it('wraps the signal DataTable in an overflow-x:auto container, matching every sibling table', () => {
    renderFeed()
    const table = screen.getByRole('table', { name: 'Regulatory signals feed' })
    const wrapper = table.closest('div')
    expect(wrapper).not.toBeNull()
    expect((wrapper as HTMLElement).style.overflowX).toBe('auto')
  })
})
