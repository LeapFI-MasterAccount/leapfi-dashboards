/**
 * Settings · Toggles — relocated "Sources & connectors" section regression
 * (PI-3, D6/call-07, sprint-plan.md Sprint 2 L3: "Sources and connectors
 * moved to settings"). Ported from `onside/feed-sections.test.tsx` and
 * `onside/feed-source-drawer.test.tsx` (both pinned this content against
 * `OnSideFeed.tsx` pre-L3) — same assertions, same base anchors, now
 * against `SettingsToggles.tsx`, the section's new host.
 *
 * Base anchors (leapfi-platform.html @ 1c230fe, via survey_map.md):
 *  - 3345–3387  digestCard — DIGEST/FREQ cadence picker, "Next send" line,
 *               "in this digest" count
 *  - 3349       freqDays()'s `r[1]||1` quirk: Real-time (0) counts as a
 *               1-day window (ported verbatim, flagged in the view header)
 *  - 3389–3403  osSources — 15 SRC_ROWS split into per-layer tables per
 *               SRC_LAYERS (3332–3336): Financial / Systemic / Regional
 *  - 3404–3450  osSourcePage — source detail (name, layer, method, 30-day
 *               activity, connector phase, alert state)
 *  - 3365–3370  toggleSrcAlert — per-source immediate-alert toggle
 *  - §d-5       single shared Drawer — the SAME instance serves the source
 *               shape and (this screen's own, relocated) RACI-doc shape
 */
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SettingsToggles } from '../../screens/SettingsToggles'
import { SRC_ITEMS } from '../../data/onside'
import type { DeepLinkTarget } from '../../App'

beforeAll(() => {
  // jsdom has no scrollIntoView — the 'feed-source' deep-link consumption
  // effect (SettingsToggles.tsx) calls it.
  Element.prototype.scrollIntoView = vi.fn()
})

beforeEach(() => {
  // The stub above is installed ONCE (module-level jsdom prototype patch);
  // clear its call history between tests so one test's scroll never leaks
  // into the next test's "was scrollIntoView called" assertion (same
  // precedent as feed-section-deep-link.test.tsx).
  vi.mocked(Element.prototype.scrollIntoView).mockClear()
})

function renderSettings() {
  return render(<SettingsToggles />)
}

/** Counts base tuples within a day window — the digestCard count rule
 * (base 3345–3387; all 15 sources, bindingOnly off). */
function itemsWithinDays(days: number): number {
  return Object.values(SRC_ITEMS).reduce(
    (sum, entry) => sum + entry.items.filter((item) => item[0] <= days).length,
    0,
  )
}

function getDigestFrequencyGroup() {
  return screen.getByRole('group', { name: 'Digest frequency' })
}

describe('Settings · Toggles — digest & alerts card (base 3345–3387)', () => {
  it('renders the five FREQ cadence chips with Daily preselected and its "Next send" line (base 3346 DIGEST.freq, 3348 FREQ)', () => {
    renderSettings()
    const group = getDigestFrequencyGroup()
    const chips = within(group).getAllByRole('button')
    expect(chips.map((chip) => chip.textContent)).toEqual([
      'Real-time',
      'Daily',
      'Weekly',
      'Monthly',
      'Quarterly',
    ])
    expect(within(group).getByRole('button', { name: 'Daily' })).toHaveAttribute('aria-pressed', 'true')
    for (const label of ['Real-time', 'Weekly', 'Monthly', 'Quarterly']) {
      expect(within(group).getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'false')
    }
    expect(screen.getByText('Next send: every weekday, 7:00 AM ET')).toBeInTheDocument()
  })

  it('cadence chips are single-select and drive the digest window count (base 3345–3387)', async () => {
    const user = userEvent.setup()
    renderSettings()
    const group = getDigestFrequencyGroup()

    await user.click(within(group).getByRole('button', { name: 'Quarterly' }))
    expect(within(group).getByRole('button', { name: 'Quarterly' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(group).getByRole('button', { name: 'Daily' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText('Next send: first business day of the quarter')).toBeInTheDocument()

    const expected90 = itemsWithinDays(90)
    expect(screen.getByText(new RegExp(`items captured in the last 90 days`))).toBeInTheDocument()
    expect(screen.getByText(String(expected90))).toBeInTheDocument()
  })

  it('Real-time ports the base freqDays `||1` quirk verbatim: a 1-day window, not "everything since the sweep" (base 3349)', async () => {
    const user = userEvent.setup()
    renderSettings()
    const group = getDigestFrequencyGroup()

    await user.click(within(group).getByRole('button', { name: 'Real-time' }))
    const expected1Day = itemsWithinDays(1)
    expect(expected1Day).toBe(1)
    expect(screen.getByText(/item captured in the last sweep/)).toBeInTheDocument()
    expect(screen.getByText('Next send: the moment a sweep finds a change')).toBeInTheDocument()
  })
})

describe('Settings · Toggles — three source layers (base 3389–3403 osSources, 3332–3336 SRC_LAYERS)', () => {
  it('renders the three layer tables with the base 6/5/4 source split of the 15 SRC_ROWS (base 3315–3331)', () => {
    renderSettings()
    const layerExpectations: Array<[string, number]> = [
      ['Financial · banking regulators sources', 6],
      ['Systemic · governing agencies sources', 5],
      ['Regional · national, state & local sources', 4],
    ]
    let total = 0
    for (const [caption, rowCount] of layerExpectations) {
      const table = screen.getByRole('table', { name: caption })
      expect(within(table).getAllByRole('row')).toHaveLength(rowCount + 1) // + header
      total += rowCount
    }
    expect(total).toBe(15)
  })

  it('decodes ported HTML entities in layer headings and source names (base srcRow reconciliation, 3243–3348 notes)', () => {
    renderSettings()
    expect(screen.getByText('Regional · national, state & local')).toBeInTheDocument()
    const systemicTable = screen.getByRole('table', { name: 'Systemic · governing agencies sources' })
    expect(within(systemicTable).getByText('SEC & FINRA')).toBeInTheDocument()
    expect(systemicTable.textContent).not.toContain('&amp;')
  })
})

/** Opens the OCC row's source detail from the Financial layer table
 * (base 3315: first SRC_ROWS entry; base 3389–3403 layer split). */
async function openOccSourceDetail(user: ReturnType<typeof userEvent.setup>) {
  const financialTable = screen.getByRole('table', { name: 'Financial · banking regulators sources' })
  const rows = within(financialTable).getAllByRole('row')
  const occRow = rows.find((row) => row.textContent?.includes('OCC · 12 CFR Ch. I'))
  expect(occRow).toBeDefined()
  await user.click(within(occRow as HTMLElement).getByRole('button', { name: 'Open' }))
  return screen.findByRole('dialog', { name: 'Source — OCC · 12 CFR Ch. I' })
}

describe('Settings · Toggles — source-detail Drawer union (base 3389–3450, 3365–3370)', () => {
  it('source row "Open" fills the shared Drawer with the six source-detail fields (base 3404–3450)', async () => {
    const user = userEvent.setup()
    renderSettings()
    const dialog = await openOccSourceDetail(user)

    const fieldLabels = within(dialog).getAllByRole('term').map((dt) => dt.textContent)
    expect(fieldLabels).toEqual(['Source', 'Regulatory layer', 'Method', '30-day activity', 'Connector phase', 'Immediate alerts'])

    const fieldValues = within(dialog).getAllByRole('definition').map((dd) => dd.textContent)
    expect(fieldValues).toEqual([
      'OCC · 12 CFR Ch. I',
      'Financial · banking regulators',
      'eCFR Versioner API',
      '2',
      'Live',
      'Off',
    ])
  })

  it('alert toggle flips state and refreshes the open Drawer label — never a stale toggle (base 3365–3370 toggleSrcAlert + 3383 digest line)', async () => {
    const user = userEvent.setup()
    renderSettings()
    const dialog = await openOccSourceDetail(user)

    expect(screen.getByText(/0 sources set to alert immediately/)).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Turn alerts on' }))

    expect(within(dialog).getByRole('button', { name: 'Turn alerts off' })).toBeInTheDocument()
    const fieldValues = within(dialog).getAllByRole('definition').map((dd) => dd.textContent)
    expect(fieldValues[5]).toBe('On')
    expect(within(dialog).getByText('Alerts on')).toBeInTheDocument()

    expect(screen.getByText(/1 source set to alert immediately/)).toBeInTheDocument()
    const financialTable = screen.getByRole('table', { name: 'Financial · banking regulators sources' })
    const occRow = within(financialTable).getAllByRole('row').find((row) => row.textContent?.includes('OCC · 12 CFR Ch. I'))
    expect(occRow).toHaveTextContent('Alerts on')

    await user.click(within(dialog).getByRole('button', { name: 'Turn alerts off' }))
    expect(within(dialog).getByRole('button', { name: 'Turn alerts on' })).toBeInTheDocument()
    expect(screen.getByText(/0 sources set to alert immediately/)).toBeInTheDocument()
  })

  it('keeps focus on the toggle across its label flip, so the Drawer trap stays live (ONSIDE-04-equivalent)', async () => {
    const user = userEvent.setup()
    renderSettings()
    const dialog = await openOccSourceDetail(user)

    await user.click(within(dialog).getByRole('button', { name: 'Turn alerts on' }))

    const active = document.activeElement as HTMLElement | null
    expect(active).not.toBeNull()
    expect(active).not.toBe(document.body)
    expect(active?.textContent).toContain('Turn alerts off')
    expect(dialog.contains(active)).toBe(true)
  })

  it('toggling a source alert fires the base toggleSrcAlert toast copy (ONSIDE-09-equivalent, base 3365–3371)', async () => {
    const user = userEvent.setup()
    renderSettings()
    const dialog = await openOccSourceDetail(user)

    await user.click(within(dialog).getByRole('button', { name: 'Turn alerts on' }))
    expect(
      screen.getByText('Alerts on for OCC · 12 CFR Ch. I. You will be notified the moment a sweep finds a change.'),
    ).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Turn alerts off' }))
    expect(screen.getByText('Alerts off for OCC · 12 CFR Ch. I. It still appears in your digest.')).toBeInTheDocument()
  })

  it('changing the digest frequency fires the base setDigest toast copy (ONSIDE-09-equivalent, base 3360-3363)', async () => {
    const user = userEvent.setup()
    renderSettings()
    await user.click(screen.getByRole('button', { name: 'Weekly' }))
    expect(screen.getByText('Digest set to Weekly · Monday, 7:00 AM ET')).toBeInTheDocument()
  })

  it('the one shared Drawer switches kind between RACI-doc and source shapes (§d-5: same instance, discriminated content)', async () => {
    const user = userEvent.setup()
    renderSettings()

    // Open a RACI document detail first (this screen's other relocated
    // section) ...
    const raciTable = screen.getByRole('table', { name: 'RACI · policy ownership matrix' })
    const raciRow = within(raciTable).getAllByRole('row').find((row) => row.textContent?.includes('Model Risk Management Policy'))
    expect(raciRow).toBeDefined()
    await user.click(raciRow as HTMLElement)
    await screen.findByRole('dialog', { name: 'Model Risk Management Policy' })

    // ... then open a source detail: the SAME single dialog re-titles and
    // re-shapes; no second drawer ever mounts.
    const dialog = await openOccSourceDetail(user)
    expect(screen.getAllByRole('dialog')).toHaveLength(1)
    expect(screen.queryByRole('dialog', { name: 'Model Risk Management Policy' })).not.toBeInTheDocument()
    expect(within(dialog).getAllByRole('term')).toHaveLength(6)
  })
})

describe("Settings · Toggles — 'feed-source' deep-link consumption (App.tsx KIND VOCABULARY, id 'sources' — see SettingsToggles.tsx header for the App.tsx-wiring STOP-item)", () => {
  function makeDeepLink(nonce: number): DeepLinkTarget {
    return { screen: 'settings.toggles', kind: 'feed-source', id: 'sources', nonce }
  }

  it('scrolls to and focuses the Sources & connectors section, and consumes the nonce', async () => {
    const onDeepLinkConsumed = vi.fn()
    render(<SettingsToggles deepLink={makeDeepLink(1)} onDeepLinkConsumed={onDeepLinkConsumed} />)

    await waitFor(() => expect(Element.prototype.scrollIntoView).toHaveBeenCalled())
    expect(onDeepLinkConsumed).toHaveBeenCalledWith(1)
  })

  it('a deepLink of a different kind is ignored — never mistaken for a sources-section open', () => {
    const onDeepLinkConsumed = vi.fn()
    render(
      <SettingsToggles
        deepLink={{ screen: 'settings.toggles', kind: 'domain', id: 'sources', nonce: 2 }}
        onDeepLinkConsumed={onDeepLinkConsumed}
      />,
    )
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled()
  })
})
