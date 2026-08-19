/**
 * OnSide · Regulatory feed — source-detail Drawer union regression (D17:
 * pins the PORTED V1 BASE BEHAVIOR).
 *
 * Base anchors (leapfi-platform.html @ 1c230fe, via survey_map.md and the
 * RegulatoryFeedSources/OnSideFeed W1 headers, which document this
 * contract against the base):
 *  - 3389–3403  osSources — per-layer source index tables, row opens the
 *               source detail
 *  - 3404–3450  osSourcePage — source detail (name, layer, method, 30-day
 *               activity, connector phase, alert state)
 *  - 3365–3370  toggleSrcAlert — per-source immediate-alert toggle
 *  - 3383       "N sources set to alert immediately" digest-card line
 *  - §d-5       single shared Drawer — the SAME instance serves both the
 *               signal shape and the source shape (kind switch), never a
 *               second drawer
 *
 * The six-field source contract pinned here is the one the OnSideFeed W1
 * header documents: Source, Regulatory layer, Method, 30-day activity,
 * Connector phase, Immediate alerts — plus the alert toggle action whose
 * label refreshes while the Drawer stays open.
 */
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OnSideFeed } from '../../screens/OnSideFeed'
import { makeTopbarProps } from './helpers'

function renderFeed() {
  return render(<OnSideFeed topbar={makeTopbarProps()} onNavigate={() => {}} />)
}

/** Opens the OCC row's source detail from the Financial layer table
 * (base 3315: first SRC_ROWS entry; base 3389–3403 layer split). */
async function openOccSourceDetail(user: ReturnType<typeof userEvent.setup>) {
  const financialTable = screen.getByRole('table', {
    name: 'Financial · banking regulators sources',
  })
  const rows = within(financialTable).getAllByRole('row')
  const occRow = rows.find((row) => row.textContent?.includes('OCC · 12 CFR Ch. I'))
  expect(occRow).toBeDefined()
  await user.click(within(occRow as HTMLElement).getByRole('button', { name: 'Open' }))
  return screen.findByRole('dialog', { name: 'Source — OCC · 12 CFR Ch. I' })
}

describe('OnSide feed · source-detail Drawer union (base 3389–3450, 3365–3370)', () => {
  it('source row "Open" fills the shared Drawer with the six source-detail fields (base 3404–3450)', async () => {
    const user = userEvent.setup()
    renderFeed()
    const dialog = await openOccSourceDetail(user)

    const fieldLabels = within(dialog)
      .getAllByRole('term')
      .map((dt) => dt.textContent)
    expect(fieldLabels).toEqual([
      'Source',
      'Regulatory layer',
      'Method',
      '30-day activity',
      'Connector phase',
      'Immediate alerts',
    ])

    const fieldValues = within(dialog)
      .getAllByRole('definition')
      .map((dd) => dd.textContent)
    expect(fieldValues).toEqual([
      'OCC · 12 CFR Ch. I',
      'Financial · banking regulators',
      'eCFR Versioner API', // base 3315 SRC_ROWS m field
      '2', // OCC tuples at 3 & 17 daysAgo fall inside 30 days (base 3417–3419)
      'Live', // base 3315 phl field
      'Off', // alerts start off (base SRC_ALERTS empty, 3365–3370)
    ])
  })

  it('alert toggle flips state and refreshes the open Drawer label — never a stale toggle (base 3365–3370 toggleSrcAlert + 3383 digest line)', async () => {
    const user = userEvent.setup()
    renderFeed()
    const dialog = await openOccSourceDetail(user)

    // Baseline: alerts off, digest line reports zero.
    expect(screen.getByText(/0 sources set to alert immediately/)).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Turn alerts on' }))

    // The open Drawer refreshes its own copy: action label, field value,
    // and the "Alerts on" tag all flip without closing/reopening.
    expect(within(dialog).getByRole('button', { name: 'Turn alerts off' })).toBeInTheDocument()
    const fieldValues = within(dialog)
      .getAllByRole('definition')
      .map((dd) => dd.textContent)
    expect(fieldValues[5]).toBe('On')
    expect(within(dialog).getByText('Alerts on')).toBeInTheDocument()

    // Alert-state truth lives in the sources section (base 3383): the
    // digest card line and the OCC table row both reflect the flip.
    expect(screen.getByText(/1 source set to alert immediately/)).toBeInTheDocument()
    const financialTable = screen.getByRole('table', {
      name: 'Financial · banking regulators sources',
    })
    const occRow = within(financialTable)
      .getAllByRole('row')
      .find((row) => row.textContent?.includes('OCC · 12 CFR Ch. I'))
    expect(occRow).toHaveTextContent('Alerts on')

    // And toggling back off restores the baseline label.
    await user.click(within(dialog).getByRole('button', { name: 'Turn alerts off' }))
    expect(within(dialog).getByRole('button', { name: 'Turn alerts on' })).toBeInTheDocument()
    expect(screen.getByText(/0 sources set to alert immediately/)).toBeInTheDocument()
  })

  it('the one shared Drawer switches kind between signal and source shapes (§d-5: same instance, discriminated content)', async () => {
    const user = userEvent.setup()
    renderFeed()

    // Open a signal detail first (pre-W1 shape) ...
    const signalsTable = screen.getByRole('table', { name: 'Regulatory signals feed' })
    const reviewButtons = within(signalsTable).getAllByRole('button', { name: 'Review' })
    await user.click(reviewButtons[0] as HTMLElement)
    await screen.findByRole('dialog', { name: /^Signal — / })

    // ... then open a source detail: the SAME single dialog re-titles and
    // re-shapes; no second drawer ever mounts.
    const dialog = await openOccSourceDetail(user)
    expect(screen.getAllByRole('dialog')).toHaveLength(1)
    expect(screen.queryByRole('dialog', { name: /^Signal — / })).not.toBeInTheDocument()
    expect(within(dialog).getAllByRole('term')).toHaveLength(6)
  })
})
